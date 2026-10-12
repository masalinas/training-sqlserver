USE training;
GO

-- 1. Capturamos el resumen criptográfico actual en la memoria
DECLARE @DigestTable TABLE (json_digest NVARCHAR(MAX));
INSERT INTO @DigestTable
EXEC sys.sp_generate_database_ledger_digest;

-- 2. Extraemos el JSON a nuestra variable
DECLARE @FirmaCriptografica NVARCHAR(MAX);
SET @FirmaCriptografica = (SELECT TOP 1 json_digest FROM @DigestTable);

-- 3. (Opcional) Mostramos la firma en pantalla para que veas qué aspecto tiene la cadena de bloques
SELECT @FirmaCriptografica AS [Firma_Blockchain_Generada];

-- 4. Ejecutamos la verificación inyectando el parámetro de forma estricta
EXEC sys.sp_verify_database_ledger @digests = @FirmaCriptografica;
GO