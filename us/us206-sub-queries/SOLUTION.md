## Solución Técnica

### 1. La trampa mortal de NOT IN con NULLs

El analista ha chocado contra la lógica de tres estados de las bases de datos relacionales (Verdadero, Falso, Desconocido). 
Cuando SQL Server evalúa un `NOT IN`, lo traduce internamente como una cadena de comparaciones con `AND`. 

Si la subconsulta devuelve los IDs `[1, 2, NULL]`, el motor evalúa:
`ClienteId != 1 AND ClienteId != 2 AND ClienteId != NULL`

El problema es que en SQL, comparar cualquier cosa contra `NULL` (incluso `!= NULL`) no devuelve "Verdadero", sino **"Desconocido" (UNKNOWN)**. Por las reglas de la lógica booleana, un solo "Desconocido" en una cadena de `ANDs` invalida toda la cadena. Al no evaluar a "Verdadero", el filtro descarta absolutamente todas las filas de la tabla de clientes.

### 2. La alternativa segura: NOT EXISTS

Como indica la diapositiva, la regla de oro en T-SQL es evitar `NOT IN` si existe el mínimo riesgo de que haya nulos, y utilizar siempre **`NOT EXISTS`**. Esta cláusula no compara valores directamente, sino que simplemente verifica si la subconsulta correlacionada devuelve alguna fila, ignorando el problema lógico de los nulos.

La consulta correcta sería:

```sql
SELECT c.ClienteId, c.Nombre
FROM dbo.Cliente AS c
WHERE NOT EXISTS (
    SELECT 1 
    FROM dbo.Pedido AS p 
    WHERE p.ClienteId = c.ClienteId
);
```

### 3. El espejismo de la CTE (Common Table Expression)

El analista está completamente equivocado respecto al rendimiento. Como se advierte claramente en la diapositiva: **"Una CTE no materializa datos: se expande como una vista en línea"**.

Una CTE (cláusula `WITH`) es puro "azúcar sintáctico" (syntactic sugar). Sirve para que el código humano sea mucho más limpio, legible y modular, pero **no crea ninguna tabla temporal ni guarda nada en la memoria RAM**. 

Cuando el optimizador de SQL Server lee el código, internamente coge el texto de la CTE, lo pega dentro de la consulta principal (lo expande) y ejecuta todo el bloque de golpe como si fuera una única consulta gigante o una vista estándar. El coste de CPU y memoria será exactamente el mismo que si el analista hubiera escrito una subconsulta derivada tradicional en el `FROM`.