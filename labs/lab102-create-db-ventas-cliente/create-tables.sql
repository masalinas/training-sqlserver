IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cliente]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.Cliente (
        ClienteID INT IDENTITY(1,1) NOT NULL,
        Nombre NVARCHAR(50) NOT NULL,
        Apellido NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NULL,
        FechaRegistro DATETIME2 NOT NULL CONSTRAINT DF_Cliente_FechaRegistro DEFAULT (SYSDATETIME()),
        
        -- El índice agrupado (Clustered Index) se crea por defecto con la PK
        CONSTRAINT PK_Cliente PRIMARY KEY CLUSTERED (ClienteID)
    );
END
GO

-- 3. Crear tabla dbo.Pedido
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pedido]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.Pedido (
        PedidoID INT IDENTITY(1,1) NOT NULL,
        ClienteID INT NOT NULL,
        FechaPedido DATETIME2 NOT NULL CONSTRAINT DF_Pedido_FechaPedido DEFAULT (SYSDATETIME()),
        Total DECIMAL(18,2) NOT NULL,
        Estado NVARCHAR(20) NOT NULL CONSTRAINT DF_Pedido_Estado DEFAULT ('Pendiente'),
        
        CONSTRAINT PK_Pedido PRIMARY KEY CLUSTERED (PedidoID),
        
        -- Relación de integridad referencial (Foreign Key)
        CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (ClienteID) 
        REFERENCES dbo.Cliente(ClienteID)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
    );
END
GO

-- 4. Insertar datos de prueba para los laboratorios
-- Desactivar el conteo de filas para no ensuciar la salida de consola (buena práctica en scripts)
SET NOCOUNT ON;

-- Solo insertamos si la tabla de clientes está vacía
IF NOT EXISTS (SELECT 1 FROM dbo.Cliente)
BEGIN
    PRINT 'Insertando datos iniciales en dbo.Cliente y dbo.Pedido...';

    INSERT INTO dbo.Cliente (Nombre, Apellido, Email)
    VALUES 
        ('Ana', 'García', 'ana.garcia@email.com'),
        ('Luis', 'Pérez', 'luis.perez@email.com'),
        ('María', 'López', 'maria.lopez@email.com'),
        ('Carlos', 'Martínez', NULL);

    -- Insertar 100,000 filas de prueba (Tardará unos segundos)
    SET NOCOUNT ON;
    PRINT 'Insertando 100,000 registros con estados aleatorios...';
    BEGIN TRAN;
    DECLARE @i INT = 1;

    WHILE @i <= 100000
    BEGIN
        INSERT INTO dbo.Pedido (ClienteID, Total, Estado)
        VALUES (
            (@i % 4) + 1, 
            ROUND(RAND(CHECKSUM(NEWID())) * 1000, 2), -- Totales aleatorios entre 0 y 1000
            
            -- Magia aleatoria para elegir el Estado
            CHOOSE(ABS(CHECKSUM(NEWID())) % 3 + 1, 'Completado', 'Enviado', 'Pendiente')
        );
        SET @i = @i + 1;
    END;
    COMMIT TRAN;
    PRINT 'Datos insertados correctamente.';
END
ELSE
BEGIN
    PRINT 'Las tablas ya contienen datos. Se omite la inserción inicial.';
END
GO