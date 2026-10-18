# Caso Práctico: El reporte masivo y las falsas promesas del optimizador

## El Contexto

Acabas de heredar la base de datos del sistema de ventas. La tabla `dbo.Pedido` ha crecido hasta los 50 millones de registros históricos. Tienes tres frentes abiertos con distintos equipos:

1. **Equipo de Logística:** Tienen una pantalla que muestra únicamente los "Pedidos Pendientes de Envío" (aquellos donde `Estado = 1`). De los 50 millones de pedidos, normalmente solo hay unos 500 en este estado al mismo tiempo. Se quejan de que la pantalla tarda mucho en cargar.
2. **Equipo de Business Intelligence (BI):** Lanzan consultas analíticas masivas a final de mes sumando el `Total` agrupado por `ClienteId` sobre los 50 millones de filas. Estas consultas ahogan el servidor.
3. **El Desarrollador Junior:** Ha descubierto las vistas dinámicas (DMVs) de "Missing Indexes" (Índices faltantes). Ha ejecutado el script de la diapositiva, le han salido 40 sugerencias de índices nuevos y está a punto de lanzar un script para crearlos todos de golpe en producción porque *"SQL Server lo ha pedido"*.

## Misión del Alumno

Apoyándote en la diapositiva "Filtered, columnstore y missing indexes", resuelve estos tres problemas:

1. Para el equipo de Logística: Si creas un índice normal sobre la columna `Estado`, indexarás 50 millones de filas para buscar solo 500, ocupando mucho espacio. ¿Qué tipo de índice crearías según el código T-SQL de la diapositiva y por qué es la solución perfecta? Menciona el cuidado que debes tener si se usan parámetros.
2. Para el equipo de BI: ¿Qué tipo de índice especial está diseñado exactamente para resolver agregaciones sobre millones de filas en entornos analíticos (DW)?
3. Para el Desarrollador Junior: Frena su despliegue y explícale los tres motivos que da la "alerta roja" de la diapositiva sobre por qué no debe crear ciegamente todo lo que sugieren las DMVs de *Missing Indexes*.