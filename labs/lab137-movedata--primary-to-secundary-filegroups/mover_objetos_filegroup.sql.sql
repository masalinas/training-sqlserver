/*==============================================================================
  Mover objetos de usuario de un filegroup (por defecto PRIMARY) a otro
  Requisitos: SQL Server 2016+ . Ejecutar con la base de datos objetivo activa.

  Qué hace:
    1. Genera las sentencias para reubicar tablas e índices en @FilegroupDestino:
         fase 1: heaps (índice clustered temporal + DROP)
         fase 2: índices clustered / clustered columnstore (incluye PK y UNIQUE)
         fase 3: índices nonclustered / nonclustered columnstore
    2. Con @Ejecutar = 0 (por defecto) solo las muestra para revisarlas.
       Con @Ejecutar = 1 las ejecuta una a una, mostrando progreso y errores.
    3. Informa de lo que NO mueve (XML, espaciales, deshabilitados) y de los
       datos LOB / row-overflow que se quedan en el filegroup origen.

  Antes de ejecutar:
    - Backup completo y prueba previa en una copia.
    - El filegroup destino debe existir y tener espacio (~ tamaño de los datos
      a mover + margen). Se generará mucho log.
    - ONLINE = ON solo en Enterprise / Azure SQL.
==============================================================================*/
SET NOCOUNT ON;

DECLARE @FilegroupOrigen  sysname = N'PRIMARY';
DECLARE @FilegroupDestino sysname = N'FG_DATA';
DECLARE @Ejecutar         bit     = 0;     -- 0 = solo generar, 1 = ejecutar
DECLARE @Online           bit     = 0;     -- 1 = ONLINE = ON (Enterprise)
DECLARE @SortInTempdb     bit     = 0;
DECLARE @MaxDop           int     = NULL;  -- NULL = valor del servidor

IF NOT EXISTS (SELECT 1 FROM sys.filegroups WHERE name = @FilegroupDestino AND type = 'FG')
    THROW 50000, N'El filegroup destino no existe en esta base de datos.', 1;

DECLARE @Opc nvarchar(200) =
      CASE WHEN @Online = 1 THEN N', ONLINE = ON' ELSE N'' END
    + CASE WHEN @SortInTempdb = 1 THEN N', SORT_IN_TEMPDB = ON' ELSE N'' END
    + CASE WHEN @MaxDop IS NOT NULL THEN N', MAXDOP = ' + CAST(@MaxDop AS nvarchar(10)) ELSE N'' END;

IF OBJECT_ID('tempdb..#Sentencias') IS NOT NULL DROP TABLE #Sentencias;
CREATE TABLE #Sentencias (
    orden     int IDENTITY(1,1) PRIMARY KEY,
    fase      tinyint        NOT NULL,
    objeto    nvarchar(400)  NOT NULL,
    sentencia nvarchar(max)  NOT NULL
);

/*---------------------------- Fase 1: heaps ---------------------------------*/
INSERT #Sentencias (fase, objeto, sentencia)
SELECT 1,
       QUOTENAME(s.name) + N'.' + QUOTENAME(o.name),
       CONCAT(N'CREATE CLUSTERED INDEX [tmp_move_heap] ON ',
              QUOTENAME(s.name), N'.', QUOTENAME(o.name),
              N' (', QUOTENAME(col.name), N') WITH (DATA_COMPRESSION = ', comp.d, @Opc,
              N') ON ', QUOTENAME(@FilegroupDestino),
              N'; DROP INDEX [tmp_move_heap] ON ',
              QUOTENAME(s.name), N'.', QUOTENAME(o.name), N';')
FROM sys.indexes i
JOIN sys.objects o      ON o.object_id = i.object_id
JOIN sys.schemas s      ON s.schema_id = o.schema_id
JOIN sys.data_spaces ds ON ds.data_space_id = i.data_space_id
CROSS APPLY (SELECT TOP (1) c.name
             FROM sys.columns c
             JOIN sys.types t ON t.user_type_id = c.user_type_id
             WHERE c.object_id = o.object_id
               AND c.max_length <> -1 AND c.is_computed = 0
               AND c.is_sparse = 0 AND c.is_column_set = 0
               AND t.name NOT IN (N'text', N'ntext', N'image', N'xml',
                                  N'geography', N'geometry', N'sql_variant')
             ORDER BY c.column_id) col
CROSS APPLY (SELECT TOP (1) data_compression_desc AS d
             FROM sys.partitions p
             WHERE p.object_id = i.object_id AND p.index_id = 0) comp
WHERE i.index_id = 0 AND o.type = 'U' AND o.is_ms_shipped = 0
  AND ds.name = @FilegroupOrigen AND ds.type = 'FG';

/*------------------- Fases 2 y 3: índices (rowstore y columnstore) ----------*/
INSERT #Sentencias (fase, objeto, sentencia)
SELECT CASE WHEN i.type IN (1, 5) THEN 2 ELSE 3 END,
       CONCAT(QUOTENAME(s.name), N'.', QUOTENAME(o.name), N' / ', QUOTENAME(i.name)),
       CONCAT(
         N'CREATE ',
         CASE WHEN i.is_unique = 1 AND i.type IN (1, 2) THEN N'UNIQUE ' ELSE N'' END,
         CASE i.type WHEN 1 THEN N'CLUSTERED' WHEN 2 THEN N'NONCLUSTERED'
                     WHEN 5 THEN N'CLUSTERED COLUMNSTORE' WHEN 6 THEN N'NONCLUSTERED COLUMNSTORE' END,
         N' INDEX ', QUOTENAME(i.name), N' ON ', QUOTENAME(s.name), N'.', QUOTENAME(o.name),
         CASE WHEN i.type = 5 THEN N''
              WHEN i.type = 6 THEN N' (' + inc.cols + N')'
              ELSE N' (' + k.cols + N')' END,
         CASE WHEN i.type = 2 AND inc.cols IS NOT NULL THEN N' INCLUDE (' + inc.cols + N')' ELSE N'' END,
         CASE WHEN i.has_filter = 1 THEN N' WHERE ' + i.filter_definition ELSE N'' END,
         N' WITH (DROP_EXISTING = ON',
         CASE WHEN i.type IN (1, 2) THEN CONCAT(
              N', PAD_INDEX = ',          CASE i.is_padded WHEN 1 THEN N'ON' ELSE N'OFF' END,
              CASE WHEN i.fill_factor > 0 THEN N', FILLFACTOR = ' + CAST(i.fill_factor AS nvarchar(3)) ELSE N'' END,
              N', IGNORE_DUP_KEY = ',     CASE i.ignore_dup_key WHEN 1 THEN N'ON' ELSE N'OFF' END,
              N', STATISTICS_NORECOMPUTE = ', CASE st.no_recompute WHEN 1 THEN N'ON' ELSE N'OFF' END,
              N', ALLOW_ROW_LOCKS = ',    CASE i.allow_row_locks  WHEN 1 THEN N'ON' ELSE N'OFF' END,
              N', ALLOW_PAGE_LOCKS = ',   CASE i.allow_page_locks WHEN 1 THEN N'ON' ELSE N'OFF' END)
              ELSE N'' END,
         N', DATA_COMPRESSION = ', comp.d, @Opc,
         N') ON ', QUOTENAME(@FilegroupDestino), N';')
FROM sys.indexes i
JOIN sys.objects o      ON o.object_id = i.object_id
JOIN sys.schemas s      ON s.schema_id = o.schema_id
JOIN sys.data_spaces ds ON ds.data_space_id = i.data_space_id
LEFT JOIN sys.stats st  ON st.object_id = i.object_id AND st.stats_id = i.index_id
CROSS APPLY (SELECT TOP (1) data_compression_desc AS d
             FROM sys.partitions p
             WHERE p.object_id = i.object_id AND p.index_id = i.index_id) comp
CROSS APPLY (SELECT STUFF((
                SELECT N', ' + QUOTENAME(c.name) + CASE ic.is_descending_key WHEN 1 THEN N' DESC' ELSE N' ASC' END
                FROM sys.index_columns ic
                JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                  AND ic.is_included_column = 0 AND ic.key_ordinal > 0
                ORDER BY ic.key_ordinal
                FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'')) k(cols)
CROSS APPLY (SELECT STUFF((
                SELECT N', ' + QUOTENAME(c.name)
                FROM sys.index_columns ic
                JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                  AND ic.is_included_column = 1
                ORDER BY ic.index_column_id
                FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 2, N'')) inc(cols)
WHERE o.type IN ('U', 'V') AND o.is_ms_shipped = 0
  AND i.type IN (1, 2, 5, 6)
  AND i.is_disabled = 0 AND i.is_hypothetical = 0
  AND ds.name = @FilegroupOrigen AND ds.type = 'FG';

/*------------------------------ Resultado -----------------------------------*/
IF @Ejecutar = 0
BEGIN
    SELECT orden, fase, objeto, sentencia FROM #Sentencias ORDER BY fase, orden;
END
ELSE
BEGIN
    DECLARE @orden int, @objeto nvarchar(400), @sql nvarchar(max), @msg nvarchar(2000), @errores int = 0;
    DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
        SELECT orden, objeto, sentencia FROM #Sentencias ORDER BY fase, orden;
    OPEN cur;
    FETCH NEXT FROM cur INTO @orden, @objeto, @sql;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @msg = CONCAT(CONVERT(nvarchar(19), GETDATE(), 120), N'  Moviendo ', @objeto);
        RAISERROR(@msg, 0, 1) WITH NOWAIT;
        BEGIN TRY
            EXEC sys.sp_executesql @sql;
        END TRY
        BEGIN CATCH
            SET @errores += 1;
            SET @msg = CONCAT(N'  ERROR en ', @objeto, N': ', ERROR_MESSAGE());
            RAISERROR(@msg, 0, 1) WITH NOWAIT;
        END CATCH;
        FETCH NEXT FROM cur INTO @orden, @objeto, @sql;
    END
    CLOSE cur; DEALLOCATE cur;
    SET @msg = CONCAT(N'Terminado. Errores: ', @errores);
    RAISERROR(@msg, 0, 1) WITH NOWAIT;
END

/*------------------- Informe: lo que este script NO mueve -------------------*/
-- 1) Índices XML / espaciales o deshabilitados en el filegroup origen (mover a mano)
SELECT N'No movido: revisar manualmente' AS motivo,
       QUOTENAME(s.name) + N'.' + QUOTENAME(o.name) AS objeto,
       i.name AS indice, i.type_desc,
       CASE WHEN i.is_disabled = 1 THEN N'deshabilitado' ELSE N'tipo no soportado' END AS detalle
FROM sys.indexes i
JOIN sys.objects o      ON o.object_id = i.object_id
JOIN sys.schemas s      ON s.schema_id = o.schema_id
JOIN sys.data_spaces ds ON ds.data_space_id = i.data_space_id
WHERE o.type IN ('U', 'V') AND o.is_ms_shipped = 0
  AND ds.name = @FilegroupOrigen AND ds.type = 'FG'
  AND (i.type IN (3, 4) OR i.is_disabled = 1);

-- 2) Datos LOB / row-overflow que se quedan en el filegroup origen:
--    reconstruir el índice NO los mueve; hay que recrear la tabla con TEXTIMAGE_ON.
SELECT N'LOB/overflow en filegroup origen' AS motivo,
       QUOTENAME(s.name) + N'.' + QUOTENAME(o.name) AS tabla,
       au.type_desc,
       CAST(SUM(au.used_pages) * 8 / 1024.0 AS decimal(18,2)) AS usado_mb
FROM sys.allocation_units au
JOIN sys.partitions p ON (au.type IN (1, 3) AND p.hobt_id = au.container_id)
                      OR (au.type = 2 AND p.partition_id = au.container_id)
JOIN sys.objects o      ON o.object_id = p.object_id
JOIN sys.schemas s      ON s.schema_id = o.schema_id
JOIN sys.data_spaces ds ON ds.data_space_id = au.data_space_id
WHERE au.type IN (2, 3) AND o.type = 'U' AND o.is_ms_shipped = 0
  AND ds.name = @FilegroupOrigen AND ds.type = 'FG'
GROUP BY s.name, o.name, au.type_desc
HAVING SUM(au.used_pages) > 0;
