## Solución Técnica

### 1. La trampa del Nested Loops con volúmenes grandes

El algoritmo **Nested Loops** funciona con un bucle: por cada fila de la tabla externa (en este caso, las facturas del día), hace una búsqueda (Index Seek) en la tabla interna (los clientes). 

Es el algoritmo ideal para consultas OLTP muy rápidas, **siempre y cuando la tabla externa sea pequeña**. El motor lo eligió porque creía que solo iba a procesar 5 facturas (haciendo solo 5 búsquedas de clientes). 
El problema es que, en realidad, entraron 850.000 facturas. El servidor está paralizado porque el Nested Loops lo está obligando a ejecutar 850.000 búsquedas individuales (Index Seeks) contra la tabla de clientes, estrangulando la CPU.

### 2. La causa raíz: Estadísticas obsoletas

Como indica el tip de la diapositiva, la discrepancia masiva entre *Estimated* y *Actual Rows* delata que las **estadísticas están obsoletas**. 
Al hacerse una importación masiva anoche, las estadísticas de distribución de datos de SQL Server no se actualizaron. El optimizador tomó su decisión a ciegas basándose en datos viejos.
**Solución:** Ejecutar una actualización de estadísticas (`UPDATE STATISTICS dbo.Factura;`) para que el optimizador "vea" el volumen real de datos y cambie de plan.

### 3. El escenario ideal para Merge Join

Si el optimizador supiera que va a leer millones de filas de ambas tablas, y ambas tienen un índice en `ClienteId` (lo que garantiza que los datos ya están ordenados), el algoritmo ideal sería el **Merge Join**.
Este algoritmo es extremadamente eficiente con grandes volúmenes porque actúa como una cremallera: lee ambas entradas ordenadas simultáneamente y las va uniendo de una sola pasada, sin necesidad de hacer bucles repetitivos.

### 4. Hash Match y el riesgo de "Spill to TempDB"

Cuando no hay índices (no hay orden) y el volumen es grande, el optimizador recurre al **Hash Match**. 
Construye una tabla *hash* en memoria con la tabla más pequeña y luego escanea la grande buscando coincidencias. 
El gran riesgo, destacado en la diapositiva, es que este algoritmo requiere pedir memoria RAM prestada (*Memory Grant*). Si las estimaciones son malas o no hay RAM suficiente, la tabla hash **derramará a disco (Spill to tempdb)**. Al tener que usar el disco duro en lugar de la memoria RAM, el rendimiento de la consulta de Data Science caerá en picado.