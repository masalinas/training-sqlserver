-- Cada vez que reiniciamos la instancia, las estadisitcas que muestra esta sql se inicializan a cero por lo que estos 
-- resultados son utiles si la instancia lleva tiempo encendida

SELECT 
    OBJECT_NAME(i.object_id) AS [Nombre Tabla],
    i.name AS [Nombre Índice],
    -- Sumamos todos los tipos de lectura (Seek, Scan, Lookup)
    COALESCE(s.user_seeks + s.user_scans + s.user_lookups, 0) AS [Total Lecturas (Beneficio)],
    -- Actualizaciones que el motor tuvo que hacer en el índice por culpa de INSERT/UPDATE/DELETE
    COALESCE(s.user_updates, 0) AS [Total Escrituras (Penalización)],
    -- Calculamos el tamaño físico convirtiendo las páginas de 8KB a Megabytes
    CAST((p.used_page_count * 8.0) / 1024 AS DECIMAL(10,2)) AS [Espacio Ocupado (MB)],
    -- Generamos automáticamente el comando para borrarlo si decides hacerlo
    'DROP INDEX [' + i.name + '] ON [' + SCHEMA_NAME(t.schema_id) + '].[' + t.name + '];' AS [Script Borrado Recomendado]
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
INNER JOIN sys.dm_db_partition_stats p ON i.object_id = p.object_id AND i.index_id = p.index_id
LEFT JOIN sys.dm_db_index_usage_stats s ON i.object_id = s.object_id AND i.index_id = s.index_id AND s.database_id = DB_ID()
WHERE t.is_ms_shipped = 0 -- Ignorar tablas internas del sistema
  AND i.type > 1 -- Solo evaluar índices No Agrupados (ignoramos Heaps y Clustered)
  AND i.is_primary_key = 0 -- Jamás sugerir borrar una Clave Primaria
  AND i.is_unique = 0 -- Jamás sugerir borrar una restricción de unicidad
  -- LA CONDICIÓN MAGICA: Índices con cero lecturas
  AND (COALESCE(s.user_seeks + s.user_scans + s.user_lookups, 0) = 0)
ORDER BY 
    [Total Escrituras (Penalización)] DESC, 
    [Espacio Ocupado (MB)] DESC;
GO

-- Antes de borrar un indice si tenemos dudas podemos deshabilitarlo, lo que hace es liberar disco y elimina penalizaciones de INSER/UPDATE/DELETE.
ALTER INDEX [NombreDelIndice] ON [dbo].[Tabla] DISABLE;

-- Si tubieramos que reactivarlo
ALTER INDEX [NombreDelIndice] ON [dbo].[Tabla] REBUILD;
