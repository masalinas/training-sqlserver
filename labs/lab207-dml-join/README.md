## Introducción

## Ejemplos:

| Tipo de JOIN | Descripción | Código T-SQL | Resultado de Ejemplo |
| :--- | :--- | :--- | :--- |
| **INNER JOIN** | Devuelve solo las filas que tienen **coincidencia en ambas tablas** mediante el `ClientID`. | `SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total FROM dbo.Cliente C INNER JOIN dbo.Pedido P ON C.ClienteID = P.ClienteID;` | **Carlos** - Gómez - 101 - 50.00<br>**Carlos** - Gómez - 102 - 30.00<br>*(Clientes sin pedidos se excluyen)* |
| **LEFT JOIN** | Devuelve **todos los clientes**, tengan o no registros en la tabla Pedido. Si no tienen, muestra `NULL`. | `SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total FROM dbo.Cliente C LEFT JOIN dbo.Pedido P ON C.ClienteID = P.ClienteID;` | **Carlos** - Gómez - 101 - 50.00<br>**Ana** - López - NULL - NULL |
| **RIGHT JOIN** | Devuelve **todos los pedidos**, tengan o no un cliente válido asociado. Si no tienen, muestra `NULL`. | `SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total FROM dbo.Cliente C RIGHT JOIN dbo.Pedido P ON C.ClienteID = P.ClienteID;` | **Carlos** - Gómez - 101 - 50.00<br>**NULL** - NULL - 103 - 20.00 |
| **FULL JOIN** | Devuelve **todas las filas de ambas tablas**, rellenando con `NULL` donde no exista coincidencia. | `SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total FROM dbo.Cliente C FULL OUTER JOIN dbo.Pedido P ON C.ClienteID = P.ClienteID;` | **Carlos** - Gómez - 101 - 50.00<br>**Ana** - López - NULL - NULL<br>**NULL** - NULL - 103 - 20.00 |
| **CROSS JOIN** | Produce un **producto cartesiano**. Cruza cada fila de cliente con cada fila de pedido sin evaluar condiciones. | `SELECT C.Nombre, P.PedidoID FROM dbo.Cliente C CROSS JOIN dbo.Pedido P;` | Carlos - 101<br>Carlos - 102<br>Carlos - 103<br>Ana - 101<br>Ana - 102<br>Ana - 103 |

Puedes ejecutar el fichero `join.sql`

```sql
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
GO

-- Devuelve todas las filas de ambas tablas, rellenando con `NULL` donde no exista coincidencia
SELECT C.Nombre, C.Apellido, P.PedidoID, P.Total
FROM dbo.Cliente C FULL OUTER JOIN dbo.Pedido P
  ON C.ClienteID = P.ClienteID
GO

-- Produce un producto cartesiano. Cruza cada fila de cliente con cada fila de pedido sin evaluar condiciones
SELECT C.Nombre, P.PedidoID
FROM dbo.Cliente C CROSS JOIN dbo.Pedido P
GO
```
