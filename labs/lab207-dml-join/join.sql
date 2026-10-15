USE training;
GO

-- Devuelve los clientes sin pedidos se excluyen
SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total
FROM dbo.Cliente C INNER JOIN dbo.Pedido P
  ON C.ClienteID = P.ClienteID
GO

-- Devuelve todos los clientes, tengan o no registros en la tabla Pedido. Si no tienen, muestra `NULL`
SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total
FROM dbo.Cliente C LEFT JOIN dbo.Pedido P
  ON C.ClienteID = P.ClienteID
GO

-- Devuelve todos los pedidos, tengan o no un cliente válido asociado. Si no tienen, muestra `NULL`
SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total
FROM dbo.Cliente C RIGHT JOIN dbo.Pedido P
  ON C.ClienteID = P.ClienteID

-- Devuelve todas las filas de ambas tablas, rellenando con `NULL` donde no exista coincidencia
SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total
FROM dbo.Cliente C FULL OUTER JOIN dbo.Pedido P
  ON C.ClienteID = P.ClienteID

-- Produce un producto cartesiano. Cruza cada fila de cliente con cada fila de pedido sin evaluar condiciones
SELECT C.Nombre, P.PedidoID
FROM dbo.Cliente C CROSS JOIN dbo.Pedido P
