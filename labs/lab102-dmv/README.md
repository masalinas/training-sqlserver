## ## Intriducción
DMVs (Dynamic Management Views): Vistas y funciones integradas que exponen el estado interno del servidor. Son la herramienta principal de un DBA para monitorizar el rendimiento, diagnosticar cuellos de botella (bloqueos, uso de CPU/memoria) y revisar el estado general de la instancia en tiempo real.

## Algunos ejemplos
Ejecución y Conexiones (Monitorización en tiempo real):

- sys.dm_exec_requests: Muestra qué comandos se están ejecutando en el servidor en este instante exacto. Es vital para identificar consultas colgadas, ver qué sesión está bloqueando a otras (blocking_session_id) o comprobar el progreso porcentual (percent_complete) de operaciones largas como copias de seguridad o reconstrucción de índices.
- sys.dm_exec_sessions: Lista todas las conexiones autenticadas en el motor, revelando quién está conectado, el nombre de la máquina origen y desde qué programa o aplicación se conectan (program_name).
- sys.dm_exec_sql_text: Es una función (DMF) que se cruza con las anteriores pasando el sql_handle. Se encarga de traducir el identificador binario de la consulta a la sentencia T-SQL en texto plano que el usuario lanzó realmente.

Rendimiento e Índices (Optimización):

 - sys.dm_db_index_usage_stats: Revela cuántas veces se ha usado un índice para leer datos (seeks/scans) frente a cuántas veces el motor ha tenido que gastar recursos en actualizarlo (updates). Es la herramienta principal para detectar y eliminar índices inútiles que ralentizan las escrituras sin aportar beneficio a las lecturas.
 - sys.dm_db_missing_index_details: Contiene las recomendaciones del propio optimizador de SQL Server. Registra las columnas sobre las que el motor cree que faltan índices basándose en las consultas recientes, mostrando incluso la mejora de rendimiento porcentual estimada si se crearan.
 - sys.dm_exec_query_stats: Almacena las estadísticas acumuladas de todas las consultas que están en la memoria caché. Permite a los DBAs extraer fácilmente el "Top 10" de las consultas que más CPU o memoria han consumido históricamente en el servidor.
Salud del Sistema (Detección de cuellos de botella)
- sys.dm_os_wait_stats: Es el punto de partida de cualquier diagnóstico de rendimiento avanzado. Registra los tiempos de espera del motor agrupados por categoría. Si SQL Server va lento, esta DMV te dice exactamente el motivo físico: si espera por lectura de discos (PAGEIOLATCH_SH), por bloqueos entre usuarios (LCK_M_...) o por red (ASYNC_NETWORK_IO).
- sys.dm_os_performance_counters: Expone los mismos contadores de rendimiento de Windows (Performance Monitor) pero directamente consultables mediante T-SQL, permitiendo ver el uso de RAM, páginas por segundo o transacciones por segundo sin salir del entorno de base de datos.

Se utiliza CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t porque la tabla dm_exec_requests no contiene la sql lanzada en texto sino un hexadecimal que es un handler a una funcion con la SQL. Debemos de traducir cada uno de estos handler si existen a su SQL textual y CROSS APPLY es un bucle que va linea a linea traduciendo esos handler en SQL textuales (amigables)

## Ejemplos

Ver la sql:  `dmv.sql` desde SQL Server Management Studio.