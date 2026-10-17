ALTER DATABASE training MODIFY FILEGROUP FG_DATOS DEFAULT;
GO

SELECT name, physical_name, 
    size*8/1024 AS size_mb,
    growth*8/1024 AS growth_mb,
    is_percent_growth 
FROM training.sys.database_files;

SELECT name, is_default FROM training.sys.filegroups;