-- Cambiar el contexto de la sesión actual usando la db training recien creada, para no ensuciar 'master' por accidente
USE training;
GO

SELECT 
    r.session_id,
    s.login_name,
    s.host_name,
    r.status,
    r.command,
    r.sql_handle,
    t.text AS consulta_sql,
    r.blocking_session_id AS bloqueada_por,
    r.wait_type AS tipo_espera,
    r.wait_time / 1000.0 AS segundos_esperando,
    r.cpu_time AS cpu_ms,
    r.logical_reads AS lecturas_logicas,
    r.percent_complete AS porcentaje_completado
FROM 
    sys.dm_exec_requests r
INNER JOIN 
    sys.dm_exec_sessions s ON r.session_id = s.session_id
CROSS APPLY 
    sys.dm_exec_sql_text(r.sql_handle) t
WHERE 
    r.session_id <> @@SPID -- Excluye la sesión desde la que lanzas este script
    AND s.is_user_process = 1; -- Filtra los procesos internos del sistema (solo muestra conexiones reales)
GO