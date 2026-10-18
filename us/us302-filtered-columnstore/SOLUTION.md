## Solución Técnica

### 1. Logística: El poder del Índice Filtrado (Filtered Index)

Para subconjuntos de datos muy pequeños con un predicado fijo (como buscar 500 pedidos entre 50 millones), la solución ideal es un **Índice Filtrado**. 
Como muestra el primer script de la diapositiva, basta con añadir una cláusula `WHERE Estado = 1` al final de la creación del índice. 
* **Ventaja:** SQL Server creará un mini-índice que solo ocupa el espacio de esas 500 filas, siendo ultra-rápido de leer y casi gratuito de mantener.
* **Precaución:** Como advierte la diapositiva, si la consulta de la aplicación utiliza parámetros (ej. `WHERE Estado = @estado`), el optimizador podría ignorar este índice filtrado por miedo a que el parámetro cambie. A veces requiere forzar un `OPTION (RECOMPILE)` en la consulta.

### 2. Business Intelligence: El Índice Columnstore

Para las consultas analíticas pesadas, el salvavidas es el **Índice Columnstore** (almacenamiento en columnas en lugar de filas).
Como indica la diapositiva, está diseñado específicamente para "agregaciones sobre millones de filas". Comprime los datos masivamente y permite procesar bloques enteros de miles de filas en milisegundos, ideal para los `SUM(Total)` del equipo de BI.

### 3. Missing Indexes: Sugerencias, no órdenes

Debes detener al desarrollador junior inmediatamente explicándole las advertencias de la diapositiva:

* **Son sugerencias, no órdenes:** El motor ve una consulta lenta y sugiere un índice para ella de forma aislada, sin tener en cuenta el impacto global en el sistema.
* **Pueden duplicar índices:** Si tienes un índice por `(ClienteId)` y la DMV sugiere uno por `(ClienteId, Fecha)`, crear ambos es redundante y penalizará las escrituras (INSERT/UPDATE/DELETE). Un DBA senior fusionaría ambos.
* **Se reinician:** La memoria de estas DMVs se borra cada vez que se reinicia el servicio de SQL Server. Si el servidor se reinició hace 2 horas, las sugerencias no son representativas del volumen real de trabajo.
* **Solución:** Las DMVs son una excelente guía (usando la fórmula `user_seeks * avg_user_impact` para priorizar), pero cada índice debe validarse analizando el plan de ejecución real.