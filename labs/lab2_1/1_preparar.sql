-- 1. Aseguramos tener un par de clientes base para la prueba
SET NOCOUNT ON;

-- DDL para la base datos y tablas
CREATE DATABASE Ventas;
GO

USE Ventas;
GO

-- 2. Creación de la tabla Cliente
CREATE TABLE dbo.Cliente (
    ClienteId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(150) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Alta DATETIME2(0) NOT NULL, -- Uso de DATETIME2(0) para precisión de segundos sin milisegundos

    -- Validación para asegurar formato básico de correo electrónico y evitar nulos/vacíos
    CONSTRAINT CK_Cliente_EmailFormat CHECK (Email LIKE '%_@_%._%' AND LEN(Email) <= 150),
    CONSTRAINT CK_Cliente_NombreNoVacio CHECK (LEN(TRIM(Nombre)) > 0)
);
GO

-- Índice único en Email para garantizar que no existan clientes duplicados con la misma dirección de correo
CREATE UNIQUE INDEX IX_Cliente_Email ON dbo.Cliente(Email);
GO

-- 3. Creación de la tabla Pedido
CREATE TABLE dbo.Pedido (
    PedidoId INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId INT NOT NULL,
    Fecha DATETIME2(0) NOT NULL,
    Total DECIMAL(18,4) NOT NULL,

    -- Relación de integridad referencial con Cliente
    CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (ClienteId)
        REFERENCES dbo.Cliente(ClienteId),

    -- Validación: El total del pedido debe ser mayor o igual a cero
    CONSTRAINT CK_Pedido_TotalPositivo CHECK (Total >= 0)
);
GO

-- Índice en ClienteId para optimizar las consultas y joins de pedidos por cliente
CREATE INDEX IX_Pedido_ClienteId ON dbo.Pedido(ClienteId);
GO

-- Limpiamos datos previos de prueba si existen
DELETE FROM dbo.Pedido;
DELETE FROM dbo.Cliente;

-- Insertamos 10 clientes de prueba
INSERT INTO dbo.Cliente (Email, Nombre, Alta) VALUES
('mayorista1@test.com', 'Distribuidora Mayorista A', SYSDATETIME()), -- ClienteId 1
('mayorista2@test.com', 'Comercializadora B', SYSDATETIME()),      -- ClienteId 2
('tienda3@test.com', 'Tienda Local C', SYSDATETIME()),             -- ClienteId 3
('cliente4@test.com', 'Carlos Pérez', SYSDATETIME()),
('cliente5@test.com', 'Ana Gómez', SYSDATETIME()),
('cliente6@test.com', 'Luis Martínez', SYSDATETIME()),
('cliente7@test.com', 'Marta Rodríguez', SYSDATETIME()),
('cliente8@test.com', 'Juan López', SYSDATETIME()),
('cliente9@test.com', 'Sofía Sánchez', SYSDATETIME()),
('cliente10@test.com', 'Pedro Ramírez', SYSDATETIME());
GO

-- 2. Carga masiva de 50,000 pedidos SESGADOS
DECLARE @Contador INT = 1;
DECLARE @ClienteAsignado INT;
DECLARE @FechaAsignada DATE;

BEGIN TRANSACTION;

WHILE @Contador <= 50000
BEGIN
    -- LÓGICA DE SESGO (SKEW):
    -- Usamos números aleatorios, pero forzamos a que el 80% de las filas vayan a los Clientes 1 o 2.
    -- El 20% restante se reparte entre los demás clientes (IDs del 3 al 10).
    IF RAND() < 0.80
        SET @ClienteAsignado = ABS(CHECKSUM(NEWID())) % 2 + 1; -- Da como resultado 1 o 2
    ELSE
        SET @ClienteAsignado = ABS(CHECKSUM(NEWID())) % 8 + 3; -- Da como resultado del 3 al 10

    -- SESGO TEMPORAL: El 90% de los pedidos se concentrarán en el año 2026
    IF RAND() < 0.90
        SET @FechaAsignada = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 365, '2026-01-01');
    ELSE
        SET @FechaAsignada = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 365, '2024-01-01');

    -- Insertar el pedido simulado
    INSERT INTO dbo.Pedido (ClienteId, Fecha, Total)
    VALUES (
        @ClienteAsignado,
        @FechaAsignada,
        ROUND((RAND() * 500) + 10, 2) -- Totales aleatorios entre 10 y 510
    );

    SET @Contador = @Contador + 1;
END;

COMMIT TRANSACTION;
PRINT '¡Carga de 50,000 pedidos sesgados completada con éxito!';
GO

-- Comprobar el sesgo por Cliente
SELECT
    p.ClienteId,
    c.Nombre,
    COUNT(*) AS CantidadPedidos,
    CAST(COUNT(*) * 100.0 / 50000 AS DECIMAL(5,2)) AS PorcentajeDelTotal
FROM dbo.Pedido p
JOIN dbo.Cliente c ON p.ClienteId = c.ClienteId
GROUP BY p.ClienteId, c.Nombre
ORDER BY CantidadPedidos DESC;
