-- 3. Convertir el índice a Covering Index (Añadiendo el INCLUDE)
CREATE NONCLUSTERED INDEX IX_Pedido_Total_Basico 
ON dbo.Pedido (Total)
INCLUDE (ClienteID, FechaPedido, Estado)
WITH (DROP_EXISTING = ON);
GO

SELECT TOP (1000) [PedidoID]
      ,[ClienteID]
      ,[FechaPedido]
      ,[Total]
      ,[Estado]
  FROM [training].[dbo].[Pedido]
  WHERE Total > 100