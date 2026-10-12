USE training
GO

-- Encender métricas de I/O (Lecturas de disco/RAM) y de CPU (Tiempos)
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
GO

SELECT TOP (1000) [PedidoID]
      ,[ClienteID]
      ,[FechaPedido]
      ,[Total]
      ,[Estado]
  FROM [training].[dbo].[Pedido]
  WHERE Total > 100