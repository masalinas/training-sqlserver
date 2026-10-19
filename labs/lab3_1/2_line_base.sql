USE Ventas;

SET STATISTICS IO, TIME ON;

SELECT PedidoId, FechaPedido, Total
FROM dbo.Pedido
WHERE ClienteId = 4217
AND FechaPedido >= '20240101';