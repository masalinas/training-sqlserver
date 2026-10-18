# Caso Práctico: El misterio de la lista vacía y el espejismo de la CTE

## El Contexto

El equipo de fidelización quiere lanzar una campaña para captar la atención de los usuarios inactivos. Te piden un listado de todos los clientes que **no** han realizado ningún pedido.

Un analista de datos junior escribe la siguiente consulta utilizando la cláusula `NOT IN`:

```sql
SELECT ClienteId, Nombre
FROM dbo.Cliente
WHERE ClienteId NOT IN (SELECT ClienteId FROM dbo.Pedido);
```

El analista está desesperado. Sabe que hay cientos de clientes sin pedidos, pero **la consulta devuelve cero filas**. Al revisar la tabla `dbo.Pedido`, te das cuenta de que hay algunos registros "huérfanos" por un error antiguo del sistema donde la columna `ClienteId` contiene valores `NULL`.

Por otro lado, el mismo analista intentó optimizar un reporte de ventas usando la **CTE (Common Table Expression)** que aparece en la diapositiva, argumentando lo siguiente: *"Como agrupar las ventas es muy lento, he metido el GROUP BY dentro de una CTE. Así SQL Server guarda temporalmente los totales en memoria y luego el SELECT de abajo va mucho más rápido porque lee de esa tabla temporal".*

## Misión del Alumno

Apoyándote en la diapositiva "Subconsultas, EXISTS y CTE", audita estas dos situaciones y responde:

1. Basándote en el recuadro de advertencia inferior, ¿por qué la consulta con `NOT IN` devuelve un resultado en blanco si hay un simple `NULL` en la tabla de pedidos? Explica la lógica matemática que aplica SQL Server.
2. ¿Cómo reescribirías esa consulta utilizando la alternativa segura y recomendada por la diapositiva?
3. ¿Tiene razón el analista sobre la optimización de rendimiento de la CTE? ¿Realmente SQL Server "guarda" o "materializa" los datos de la CTE en la memoria?