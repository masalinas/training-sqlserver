-- Cambiar el contexto de la sesión actual usando la db training recien creada, para no ensuciar 'master' por accidente
USE training;
GO

-- Habilitar CLR
EXEC sp_configure 'clr enabled', 1; RECONFIGURE;

-- Con "clr strict security" (activo por defecto) el ensamblado debe estar firmado
-- y confiado. Calcula el hash del .dll y regístralo:
DECLARE @hash VARBINARY(64) =
  (SELECT HASHBYTES('SHA2_512', BulkColumn)
   FROM OPENROWSET(BULK 'C:\git\MisFuncionesSQL\bin\Release\net48\FuncionesRegex.dll', SINGLE_BLOB) AS x);
EXEC sys.sp_add_trusted_assembly @hash, N'FuncionesRegex';

CREATE ASSEMBLY FuncionesRegex
FROM 'C:\git\MisFuncionesSQL\bin\Release\net48\FuncionesRegex.dll'
WITH PERMISSION_SET = SAFE;
GO

CREATE FUNCTION dbo.RegexEsValido(@texto NVARCHAR(MAX), @patron NVARCHAR(4000))
RETURNS BIT
AS EXTERNAL NAME FuncionesRegex.[FuncionesRegex.FuncionesRegex].RegexEsValido;
GO

-- Ejemplo con patrón regex correcto
SELECT dbo.RegexEsValido(N'abc123', N'^[a-z]+\d+$');

-- Empieza por un número, pero el patrón exige letras primero
SELECT dbo.RegexEsValido(N'123abc', N'^[a-z]+\d+$');   -- 0

-- Solo letras, falta la parte numérica
SELECT dbo.RegexEsValido(N'abc', N'^[a-z]+\d+$');      -- 0

-- Mayúsculas: [a-z] no las admite sin la opción ignorar-mayúsculas
SELECT dbo.RegexEsValido(N'ABC123', N'^[a-z]+\d+$');   -- 0

-- Carácter extra al final
SELECT dbo.RegexEsValido(N'abc123!', N'^[a-z]+\d+$');  -- 0