-- 1. Asegurar que estamos en la base de datos Ventas
USE Ventas;
GO

-- 2. Crear la tabla de ejemplo si no existe
IF OBJECT_ID('dbo.Pedido', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pedido (
        IdPedido INT IDENTITY(1,1) PRIMARY KEY,
        FechaPedido DATETIME DEFAULT GETDATE(),
        TotalPedido DECIMAL(10,2) DEFAULT 100.00
    );
END;
GO

-- 3. Limpiar datos previos si es necesario (Opcional, según tu laboratorio)
-- TRUNCATE TABLE dbo.Pedido; 
-- GO

-- 4. Generación masiva y eficiente de 500,000 registros
-- Usamos tablas del sistema cruzadas para generar combinaciones rápidas en memoria
WITH E1(N) AS (SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL 
               SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL 
               SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1 UNION ALL SELECT 1), -- 10 filas
     E2(N) AS (SELECT 1 FROM E1 a CROSS JOIN E1 b), -- 100 filas
     E4(N) AS (SELECT 1 FROM E2 a CROSS JOIN E2 b), -- 10,000 filas
     E6(N) AS (SELECT 1 FROM E4 a CROSS JOIN E2 b), -- 1,000,000 filas
     Numeros AS (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS Secuencia FROM E6)
INSERT INTO dbo.Pedido (FechaPedido, TotalPedido)
SELECT 
    DATEADD(MINUTE, -Secuencia, GETDATE()), -- Genera fechas escalonadas hacia atrás
    ABS(CHECKSUM(NEWID())) % 1000 + 10.50   -- Genera montos aleatorios entre 10.50 y 1010.50
FROM Numeros
WHERE Secuencia <= 500000; -- Límite estricto de la captura
GO

-- 5. Verificar que se hayan insertado correctamente
SELECT COUNT(*) AS TotalPedidosGenerados FROM dbo.Pedido;
GO