## Solución Técnica

### 1. El paradigma de OVER vs GROUP BY

El desarrollador ha chocado con la limitación clásica de las agrupaciones.
* **`GROUP BY` colapsa filas:** Toma múltiples registros de un cliente y los comprime en una única fila de resumen. Por eso pierde el detalle de las fechas individuales.
* **`OVER` mantiene el detalle:** Las *Window Functions* permiten calcular agregados (como sumas o promedios) para un conjunto de filas (una "ventana"), pero devolviendo el resultado anexo a **cada una de las filas originales**. El detalle nunca se pierde.

### 2. El Total Acumulado y el peligro de RANGE

Para sacar el acumulado, la sintaxis correcta es:
`SUM(Total) OVER (PARTITION BY ClienteId ORDER BY Fecha ROWS UNBOUNDED PRECEDING)`

* **`PARTITION BY ClienteId`**: Reinicia el contador/suma a cero cada vez que cambiamos de cliente.
* **`ORDER BY Fecha`**: Le da un orden lógico para ir sumando fila a fila.
* **El tip de rendimiento:** Como advierte la diapositiva, si omites la parte de `ROWS...`, SQL Server utiliza por defecto un comportamiento llamado `RANGE`. `RANGE` es terriblemente ineficiente porque crea una tabla de trabajo oculta (*worktable*) en la base de datos `tempdb` para procesar empates lógicos, hundiendo el rendimiento de disco. Usar explícitamente `ROWS` fuerza un cálculo físico en memoria muchísimo más rápido.

### 3. Evitar los Self-JOINs con LAG

Para acceder a datos de filas anteriores sin hacer cruces de la tabla consigo misma, la herramienta perfecta es **`LAG()`**.
La sintaxis `LAG(Total) OVER (PARTITION BY ClienteId ORDER BY Fecha)` mira dentro de la partición del cliente actual, retrocede una fila según el orden de la fecha, y devuelve ese valor. Es instantáneo y muy eficiente. (Su opuesto, para mirar a la fila siguiente, sería `LEAD()`).

### 4. ROW_NUMBER vs RANK ante un empate

Si Ana y Luis empatan en el primer puesto con $500:
* **`ROW_NUMBER()`:** Genera un contador secuencial estricto. Lanzará una moneda al aire (al no tener más criterios de desempate) y le dará el `1` a Ana y el `2` a Luis. No admite empates.
* **`RANK()`:** Respeta el empate y les dará un `1` a ambos. Sin embargo, como advierte la diapositiva ("hay huecos"), el siguiente pedido en la lista ya no será el número 2, sino que saltará directamente al `3`.