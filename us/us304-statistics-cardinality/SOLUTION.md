## Solución Técnica

### 1. El Histograma y los valores "fuera de rango"

El motor no lee toda la tabla para hacer estimaciones; se basa en un resumen estadístico llamado **Histograma**. Como indica la diapositiva, este histograma guarda un máximo de **200 pasos** (muestras de distribución de datos) sobre la primera columna de la clave.
El problema es que la carga de datos masiva ocurrió ayer por la noche. Los pedidos de "hoy" (valores nuevos) caen fuera de los límites del histograma actual. Cuando el optimizador busca una fecha que no existe en su estadística, usa un cálculo residual (a menudo estimando 1 sola fila), volviéndose completamente "ciego" ante el volumen real de datos.

### 2. Inspección forense con DBCC SHOW_STATISTICS

Para demostrar que la estadística está obsoleta, debes usar el siguiente comando incluido en la diapositiva:

```sql
DBCC SHOW_STATISTICS ('dbo.Pedido', 'IX_Pedido_Cliente');
```

Este comando devolverá tres conjuntos de resultados:
* **El encabezado:** Mostrará la fecha y hora exacta de la última actualización (que seguramente será anterior a la carga masiva).
* **La densidad:** La cardinalidad general.
* **El histograma:** Mostrará los 200 pasos. Podrás comprobar visualmente que la fecha de "hoy" no aparece en el límite superior (RANGE_HI_KEY).

### 3. El umbral automático dinámico

El desarrollador tiene razón a medias. SQL Server tiene la opción `Auto-update` activada por defecto. Sin embargo, no se actualiza con *cada* inserción (sería insostenible).
En versiones antiguas, requería que cambiara el 20% de la tabla. En bases de datos modernas (compatibilidad 130+), usa un **umbral dinámico** basado en la fórmula matemática $\sqrt{1000 \cdot \text{filas}}$. 
Aunque el umbral es más agresivo ahora, si la tabla `dbo.Pedido` ya tenía 500 millones de filas, la inserción de 2 millones de anoche quizá no fue suficiente para disparar el recálculo automático, dejando el histograma desfasado.

### 4. La solución: Actualización manual al 100%

En escenarios de cargas masivas puntuales (ETL), la mejor práctica no es esperar al umbral automático, sino forzar la actualización como paso final del propio proceso de carga.

El comando exacto para reconstruir la estadística con la máxima precisión posible (leyendo todas las filas y no solo una muestra aleatoria) es:

```sql
UPDATE STATISTICS dbo.Pedido IX_Pedido_Cliente WITH FULLSCAN;
```
Tras ejecutar esto, el Optimizador "verá" los 2 millones de registros nuevos y generará un plan de ejecución correcto e instantáneo.