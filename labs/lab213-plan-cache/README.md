## Introducción

## Ejemplos
- Ver los planes existen para una consulta

  ```sql
  SELECT
    cp.usecounts AS VecesUtilizado,
    cp.size_in_bytes / 1024 AS TamanoKB,
    cp.objtype AS TipoObjeto, -- 'Proc', 'Prepared', 'Adhoc', etc.
    st.text AS TextoConsulta,
    qp.query_plan AS PlanXML
  FROM sys.dm_exec_cached_plans AS cp
  CROSS APPLY sys.dm_exec_sql_text(cp.plan_handle) AS st
  CROSS APPLY sys.dm_exec_query_plan(cp.plan_handle) AS qp
  WHERE st.text LIKE '%SELECT * FROM ventas.Pedido%';
  ```

- Ver las consultas que mas consultas que mas consumen (CPU y Lecturas)

  ```sql
  SELECT TOP 20
      qs.execution_count AS VecesEjecutada,
      qs.total_worker_time / 1000 AS TotalCPUTiempoMs,
      (qs.total_worker_time / 1000) / qs.execution_count AS PromedioCPUMs,
      qs.total_logical_reads AS TotalLecturasLogicas,
      st.text AS Consulta,
      qp.query_plan AS PlanEjecucion
  FROM sys.dm_exec_query_stats AS qs
  CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
  CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) AS qp
  ORDER BY qs.total_worker_time DESC; -- Ordenado por mayor consumo de CPU
  ```

## ¿Cómo interpretar el campo PlanXML?

En los resultados de las consultas anteriores, la columna query_plan aparecerá como un hipervínculo en herramientas como SSMS (SQL Server Management Studio) o Azure Data Studio. \

Si haces clic sobre él, se abrirá visualmente el Plan de Ejecución Gráfico, permitiéndote ver los operadores (index scans, nested loops, joins), los costes estimados y las advertencias en rojo (como faltas de índices o conversiones implícitas).

## ¿Se pueden limpiar o borrar los planes compilados?

Sí, si estás realizando pruebas de rendimiento y necesitas vaciar la caché de planes para forzar una recompilación desde cero, puedes ejecutar comandos de limpieza manual:

Limpiar todos los planes de todas las bases de datos del servidor:

```sql
DBCC FREEPROCCACHE;
```
Limpiar únicamente los planes asociados a una base de datos específica:

```sql
-- Primero obtienes el Database_ID
USE MiBaseDatos;
GO
DECLARE @dbid INT = DB_ID();

-- Lias la caché exclusiva de esa base de datos
DBCC FLUSHPROCINDB(@dbid);
```
