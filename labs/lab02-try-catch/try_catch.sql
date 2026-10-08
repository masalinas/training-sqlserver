-- Crear training db si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'training')
BEGIN
    CREATE DATABASE training;
END
GO

-- Cambiar el contexto de la sesión actual usando la db training recien creada, para no ensuciar 'master' por accidente
USE training;
GO

BEGIN TRY 
   	-- Intentamos una operación ilegal
	DECLARE @Resultado INT;
	SET @Resultado = 100 / 0; 

	-- Si la línea anterior falla, el código salta, por lo que esto nunca se ejecuta 
	PRINT 'El cálculo fue un éxito.';
END TRY 
BEGIN CATCH
	-- El control salta directamente aquí al producirse el error
	SELECT
		-- Código interno del error (ej. 8134)
		ERROR_NUMBER() AS NumeroError,
		-- Línea exacta donde ocurrió
		ERROR_LINE() AS LineaError,
		-- Texto descriptivo ('Divide by zero error encountered.')
		ERROR_MESSAGE() AS MensajeError;
END CATCH;