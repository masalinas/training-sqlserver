## Solución Técnica

### 1. La Trampa: Convertir un LEFT JOIN en un INNER JOIN accidentalmente

El desarrollador ha caído en la trampa más clásica de T-SQL. El error ocurre por el orden lógico en el que el motor evalúa la consulta (que vimos en el caso anterior):

1. Primero, el `LEFT JOIN` hace su trabajo perfectamente: coge a todos los clientes y, si no tienen pedidos, rellena las columnas de la tabla derecha (`p.PedidoId`, `p.Fecha`) con `NULL`.
2. A continuación, el motor aplica el filtro del `WHERE p.Fecha >= '20240101'`. 
3. Cuando el motor intenta evaluar a un cliente sin pedidos (cuyo valor es `NULL`), la operación lógica se convierte en: `NULL >= '20240101'`. En SQL, cualquier comparación con `NULL` devuelve "Desconocido" (Falso), por lo que la fila del cliente se descarta inmediatamente.

**Conclusión:** Al filtrar una columna de la tabla derecha en el `WHERE`, el desarrollador ha anulado el efecto del `LEFT JOIN`, convirtiéndolo funcionalmente en un `INNER JOIN` (solo trae coincidencias reales).

### 2. La consulta corregida (Filtro en el ON)

Para solucionar esto, el filtro de fecha de la tabla derecha debe moverse a la cláusula `ON` del `JOIN`. De esta forma, el motor primero restringe qué pedidos son válidos (los de 2024) y, **después**, aplica la magia del `LEFT JOIN` garantizando que el cliente de la izquierda se mantenga aunque no cumpla esa condición.

```sql
SELECT c.Nombre, p.PedidoId
FROM dbo.Cliente AS c
LEFT JOIN dbo.Pedido AS p 
       ON p.ClienteId = c.ClienteId 
      AND p.Fecha >= '20240101';
```

### 3. El patrón Anti-join (Clientes sin pedidos históricos)

Para buscar registros "huérfanos" o exclusiones puras (clientes sin pedidos), usamos un `LEFT JOIN` normal, pero esta vez sí utilizamos el `WHERE` intencionadamente para quedarnos **solo** con aquellas filas donde la tabla derecha no pudo encontrar correspondencia (es decir, donde el valor es nulo).

```sql
SELECT c.ClienteId, c.Nombre
FROM dbo.Cliente AS c
LEFT JOIN dbo.Pedido AS p ON p.ClienteId = c.ClienteId
WHERE p.PedidoId IS NULL;
```