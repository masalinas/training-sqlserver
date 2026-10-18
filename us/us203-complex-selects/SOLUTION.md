## Solución Técnica

### 1. El orden real de ejecución (El motor lee al revés)

El error mental más común al aprender SQL es pensar que el motor lee el código de arriba a abajo. En realidad, el orden lógico interno es el siguiente:

1. **FROM (y JOINs):** ¿De qué tablas saco los datos y cómo se relacionan?
2. **WHERE:** Filtro fila por fila.
3. **GROUP BY:** Agrupo los datos resultantes.
4. **HAVING:** Filtro los bloques agrupados.
5. **SELECT:** Proyecto las columnas, calculo fórmulas y **asigno los Alias**.
6. **ORDER BY:** Ordeno el resultado final.

### 2. Por qué fallan el WHERE, GROUP BY y HAVING

El problema radica en cuándo "nacen" los alias. 
Los alias `Anio` y `VentasTotales` se crean en el paso 5 (`SELECT`). Sin embargo, el desarrollador está intentando utilizarlos en los pasos 2 (`WHERE`), 3 (`GROUP BY`) y 4 (`HAVING`). 
Como en ese momento del procesamiento SQL Server aún no ha llegado al paso 5, los alias literalmente no existen en la memoria del motor, provocando el error de "columna inválida".

### 3. Por qué el ORDER BY sí funciona

El `ORDER BY` es el paso 6. Es la última fase lógica de la consulta, ejecutándose *después* del `SELECT` (paso 5). Por tanto, cuando el motor llega al `ORDER BY`, los alias ya han sido declarados, evaluados y están disponibles para ser utilizados. (Como indica el *tip* de la diapositiva).

### 4. La consulta corregida

Para que el script funcione, debemos usar las fórmulas originales o los nombres reales de las columnas en todas las fases previas al `SELECT`. 

*(Nota: En T-SQL, en vez de usar la función YEAR en el WHERE, es una buena práctica usar un rango de fechas para no invalidar el uso de índices sobre la columna Fecha, como se muestra en la diapositiva)*.

```sql
SELECT c.Nombre, YEAR(p.Fecha) AS Anio, SUM(p.Total) AS Ventas
FROM dbo.Cliente AS c
JOIN dbo.Pedido AS p ON p.ClienteId = c.ClienteId
WHERE p.Fecha >= '20240101'
GROUP BY c.Nombre, YEAR(p.Fecha)
HAVING SUM(p.Total) > 1000
ORDER BY Ventas DESC;
```