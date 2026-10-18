## Solución Técnica

### 1. La volatilidad de las DMVs

El administrador junior cometió el error de creer que `sys.dm_exec_query_stats` guarda un historial permanente. Como advierte la diapositiva en rojo, **los datos de las DMVs son volátiles**. 
Acumulan estadísticas únicamente desde el último reinicio del servicio de SQL Server. Como el servidor se reinició a las 3:00 AM, todo el historial de consultas costosas de los meses anteriores se borró de la memoria RAM. Además, si un plan de ejecución es expulsado de la caché, sus estadísticas también desaparecen.

### 2. Cazar al líder del bloqueo (Head Blocker)

El script de `sys.dm_exec_requests` muestra lo que se está ejecutando en ese preciso milisegundo. Si 50 sesiones apuntan a que su bloqueador es el ID 75, la sesión 75 es la raíz del problema (el "Head Blocker").
Para ver qué está haciendo, basta con mirar la fila resultante donde `r.session_id = 75` en ese mismo script. La columna `sql_text` (obtenida mediante el `CROSS APPLY`) nos revelará el código exacto que está ejecutando esa conexión conflictiva.

### 3. El tiempo promedio por ejecución

La métrica `qs.total_worker_time` nos dice la CPU total gastada. Pero dividirla entre `qs.execution_count` nos da el **coste de CPU promedio por cada ejecución**. 
Esto es vital para priorizar: una consulta puede ser la número 1 en consumo de CPU total simplemente porque se ejecuta un millón de veces al día de forma muy rápida (normal y esperable). Sin embargo, una consulta que consuma mucha CPU promedio por ejecución indica un problema grave de código o falta de índices, y es ahí donde el DBA debe centrar sus esfuerzos de optimización.

### 4. Permisos de seguridad para Monitorización

Por motivos de seguridad, un usuario normal no puede ver el código SQL que están ejecutando otros usuarios ni las estadísticas del servidor. Para poder leer estas Vistas de Administración Dinámica (DMVs), el desarrollador necesita que se le conceda el permiso **`VIEW SERVER STATE`** a nivel de servidor (o `VIEW SERVER PERFORMANCE STATE` si utilizan SQL Server 2022).