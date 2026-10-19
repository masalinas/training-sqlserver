USE Ventas;

SET STATISTICS IO ON;

CREATE NONCLUSTERED INDEX IX_Pedido_Fecha
ON dbo.Pedido (FechaPedido);

-- A) No SARGable: función sobre la columna
SELECT PedidoId FROM dbo.Pedido
WHERE YEAR(FechaPedido) = 2024;

-- B) SARGable: rango
SELECT PedidoId FROM dbo.Pedido
WHERE FechaPedido >= '20240101'
AND FechaPedido < '20250101';

-- C) Seek + Key Lookup (pide Total)
SELECT PedidoId, Total FROM dbo.Pedido
WHERE FechaPedido = '20240315';