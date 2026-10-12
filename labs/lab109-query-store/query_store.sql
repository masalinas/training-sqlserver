-- Cambiar el contexto de la sesión actual usando la db training, para no ensuciar 'master' por accidente
USE training;
GO

-- Activar Query Store
-- A diferencia de las DMVs que se borran al reiniciar, Query Store persiste su historial en el disco, 
-- por lo que debe habilitarse explícitamente en la base de datos que deseas monitorizar:
ALTER DATABASE training 
SET QUERY_STORE = ON (OPERATION_MODE = READ_WRITE, MAX_STORAGE_SIZE_MB = 100);

-- Detectar la regresión de rendimiento
-- Imagina que el resultado muestra que la consulta 
-- query_id = 49 tiene dos planes: el plan_id = 21 tarda 5000 ms y hace 80,000 lecturas, mientras que el plan_id = 22 tarda 10 ms y hace 50 lecturas.
SELECT 
    q.query_id,
    p.plan_id,
    rs.count_executions,
    rs.avg_duration / 1000.0 AS avg_duration_ms,
    rs.avg_logical_io_reads,
    qt.query_sql_text
FROM sys.query_store_query q
INNER JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
INNER JOIN sys.query_store_plan p ON q.query_id = p.query_id
INNER JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
WHERE qt.query_sql_text LIKE '%SELECT * FROM PruebaCompresion%'
ORDER BY q.query_id, rs.avg_duration DESC;

-- Forzar el plan de ejecución óptimo para un @query_id concreto
-- Conociendo los identificadores, ejecutas este comando para decirle al optimizador de SQL Server que, cada vez que vea la consulta 49, 
-- aplique por obligación el plan 21, ignorando sus propios cálculos futuros:
EXEC sp_query_store_force_plan 
    @query_id = 49, 
    @plan_id = 21;

-- Revertir la regla en el futuro
-- Si más adelante creas índices nuevos en la tabla PruebaCompresion, querrás que el optimizador vuelva a tener libertad para crear un plan aún mejor. 
-- Para ello, eliminas la restricción de Query Store:
EXEC sp_query_store_unforce_plan 
    @query_id = 42, 
    @plan_id = 15;