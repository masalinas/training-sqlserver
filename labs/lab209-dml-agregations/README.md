## CTE

El acrónimo CTE significa Common Table Expression (Expresión de Tabla Común).

En T-SQL, una CTE es esencialmente una "vista temporal desechable". Es un conjunto de resultados al que le pones un nombre al principio de tu script y que solo existe en la memoria durante el milisegundo que tarda en ejecutarse la consulta. En cuanto el `SELECT`, `UPDATE` o `DELETE` final termina, la CTE desaparece sin dejar rastro en el servidor.

Se definen siempre utilizando la cláusula `WITH`.

## El problema del null

Cuando escribes una subconsulta con `NOT IN`, el motor de base de datos la traduce internamente a una serie de comparaciones unidas por el operador `AND`

Si la subconsulta devuelve los valores (1, 2, `NULL`), la evaluación matemática que hace SQL Server para saber si debe mostrar al cliente número 3 es esta:
¿3 es distinto de 1? (`TRUE`) `AND` ¿3 es distinto de 2? (`TRUE`) `AND` ¿3 es distinto de `NULL`? (`UNKNOWN`)\

En la lógica de SQL, comparar cualquier cosa contra `NULL` (ya sea igual, distinto, mayor o menor) nunca da TRUE ni FALSE; siempre da `UNKNOWN` (Desconocido).
Como la cláusula `WHERE` requiere que el resultado final sea estrictamente TRUE para mostrar una fila, y `TRUE AND TRUE AND UNKNOWN` da como resultado `UNKNOWN`, la consulta entera se invalida y devuelve cero filas, ocultándote datos reales.\

**Ejemplo del error**:

Queremos saber qué clientes no han hecho ningún pedido. Imagina que en la tabla Pedido hay un registro huérfano con ClienteID = NULL.

```sql
-- ESTA CONSULTA DEVOLVERÁ 0 FILAS (Falso positivo)
SELECT Id, Nombre
FROM dbo.Cliente
WHERE Id NOT IN (SELECT ClienteID FROM dbo.Pedido);
```

**La solución: NOT EXISTS**

`NOT EXISTS` no compara valores directamente contra una lista. Su único trabajo es comprobar si una subconsulta devuelve alguna fila o no (evalúa TRUE o FALSE).

Al usar `NOT EXISTS`, vinculamos las tablas (consulta correlacionada). Si el motor evalúa un `NULL` en la tabla de pedidos, simplemente descarta esa fila en concreto (porque 3 = `NULL` es `UNKNOWN`), pero sigue buscando. Al no encontrar coincidencias reales para el cliente 3, el `NOT EXISTS` devuelve `TRUE` y muestra al cliente

```sql
-- ESTA CONSULTA SÍ FUNCIONA Y DEVUELVE LOS CLIENTES SIN PEDIDOS
SELECT c.Id, c.Nombre
FROM dbo.Cliente c
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Pedido p
    WHERE p.ClienteID = c.Id
);
```

**NOTA**
Jamás utilicen `NOT IN` en consultas de producción. Además de ser vulnerable al fallo del `NULL`, `NOT IN` suele forzar al motor a hacer escaneos completos (Table Scans), mientras que `NOT EXISTS` está optimizado para usar los índices de las tablas.
