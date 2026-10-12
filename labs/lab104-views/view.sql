USE training;
GO

-- =====================================================================
-- PASO 1: Crear la vista lógica con los requisitos estrictos
-- =====================================================================
CREATE VIEW dbo.vw_ResumenVentasCliente
WITH SCHEMABINDING -- ¡Obligatorio! Evita que alguien borre o altere las tablas base
AS
SELECT 
    c.ClienteID,
    c.Nombre,
    c.Apellido,
    -- Si agrupas datos en una vista indexada, SQL Server exige usar COUNT_BIG(*)
    COUNT_BIG(*) AS CantidadPedidos, 
    SUM(p.Total) AS TotalGastado
FROM dbo.Cliente c
INNER JOIN dbo.Pedido p 
    ON c.ClienteID = p.ClienteID
GROUP BY 
    c.ClienteID, 
    c.Nombre, 
    c.Apellido;
GO

-- =====================================================================
-- PASO 2: La Magia (Materializar la vista creando el Índice)
-- =====================================================================
-- Al crear este índice, SQL Server ejecuta la consulta y guarda el 
-- resultado final físicamente en páginas de 8 KB en el disco duro.
CREATE UNIQUE CLUSTERED INDEX CIX_vw_ResumenVentasCliente
ON dbo.vw_ResumenVentasCliente (ClienteID);
GO

SELECT * 
FROM dbo.vw_ResumenVentasCliente WITH (NOEXPAND)
WHERE TotalGastado > 500;