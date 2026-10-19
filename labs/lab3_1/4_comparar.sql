USE Ventas;

SELECT PedidoId, FechaPedido, Total
FROM dbo.Pedido
WHERE ClienteId = 4217
AND FechaPedido >= '20240101';

SET STATISTICS IO, TIME OFF;