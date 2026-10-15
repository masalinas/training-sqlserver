-- 1. Crear el índice BÁSICO (Solo sabe el Total y el PedidoID)
CREATE NONCLUSTERED INDEX IX_Pedido_Total_Basico 
ON dbo.Pedido (Total);
GO

SELECT TOP (1000) [PedidoID]
      ,[ClienteID]
      ,[FechaPedido]
      ,[Total]
      ,[Estado]
  FROM [training].[dbo].[Pedido]
  WHERE Total > 100