ALTER DATABASE Ventas MODIFY FILEGROUP FG_DATOS DEFAULT;
GO

SELECT name, physical_name, 
    size*8/1024 AS size_mb,
    growth*8/1024 AS growth_mb,
    is_percent_growth 
FROM Ventas.sys.database_files;

SELECT name, is_default FROM Ventas.sys.filegroups;