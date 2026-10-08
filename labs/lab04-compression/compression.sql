-- Cambiar el contexto de la sesión actual usando la db training recien creada, para no ensuciar 'master' por accidente
USE training;
GO

-- 1. Creamos una tabla de prueba llamada PruebaCompresion si no existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.PruebaCompresion') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.PruebaCompresion (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        TextoRepetitivo CHAR(200), -- CHAR ocupa siempre 200 bytes, aunque esté vacío
        Estado VARCHAR(20)
    );
END
GO

-- 2. Insertamos miles de filas simuladas (esto tomará 1 o 2 segundos)
SET NOCOUNT ON;
INSERT INTO dbo.PruebaCompresion (TextoRepetitivo, Estado)
SELECT TOP 50000 
    'Texto constante que ocupa mucho espacio en disco innecesariamente', 
    'ACTIVO'
FROM sys.all_columns a CROSS JOIN sys.all_columns b;
GO

-- 3. Ejecutamos el simulador para ver el antes y el después
EXEC sp_estimate_data_compression_savings 
    @schema_name = 'dbo', 
    @object_name = 'PruebaCompresion', 
    @index_id = NULL, 
    @partition_number = NULL, 
    @data_compression = 'PAGE';
GO

-- 4. Borramos la tabla de prueba
DROP TABLE dbo.PruebaCompresion;
GO