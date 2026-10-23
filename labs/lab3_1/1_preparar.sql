USE Ventas;
GO

-- Asegurarnos de que existen clientes para asociar los pedidos (si está vacía, insertamos un cliente base de prueba)
IF NOT EXISTS (SELECT 1 FROM dbo.Cliente)
BEGIN
    INSERT INTO dbo.Cliente (Email, Nombre, Alta)
    VALUES ('cliente.inicial@test.com', 'Cliente Base', SYSDATETIME());
END
GO

-- Configuración del proceso por lotes (Batches) para alto rendimiento
SET NOCOUNT ON;

DECLARE @TotalRegistros INT = 500000;
DECLARE @TamanoLote INT = 10000;    -- Insertar en bloques de 10.000 filas
DECLARE @Insertados INT = 0;

PRINT 'Iniciando la generación masiva de 500.000 pedidos...';

WHILE @Insertados < @TotalRegistros
BEGIN
    INSERT INTO dbo.Pedido (ClienteId, Fecha, Total)
    SELECT TOP (@TamanoLote)
        -- Asigna aleatoriamente un ClienteId existente en la tabla Cliente
        (ABS(CHECKSUM(NEWID())) % (SELECT COUNT(*) FROM dbo.Cliente)) + 1,

        -- Fecha aleatoria dentro de los últimos 2 años hasta hoy
        DATEADD(SECOND, -ABS(CHECKSUM(NEWID())) % (2 * 365 * 24 * 60 * 60), SYSDATETIME()),

        -- Total aleatorio entre 10.00 y 510.00 usando la fórmula
        ROUND((RAND(CHECKSUM(NEWID())) * 500) + 10, 2)
    FROM sys.all_objects a
    CROSS JOIN sys.all_objects b; -- Genera suficientes filas base para el lote

    SET @Insertados = @Insertados + @TamanoLote;

    -- Mensaje de progreso cada 50.000 filas
    IF @Insertados % 50000 = 0
    BEGIN
        PRINT CONCAT('Progreso: ', @Insertados, ' / ', @TotalRegistros, ' pedidos insertados...');
    END
END

PRINT '¡Generación de 500.000 pedidos completada con éxito!';
GO
