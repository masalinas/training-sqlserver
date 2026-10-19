USE Ventas; -- <--- Asegúrate de usar el nombre correcto de tu Base de Datos
GO

/* =========================================================================
   PASO 1: Cambiar el contexto de seguridad al usuario operador (UserApp)
   ========================================================================= */
PRINT '--- CAMBIANDO CONTEXTO A: UserApp ---';
EXECUTE AS USER = 'UserApp';
GO

-- Comprobamos quién somos actualmente en la sesión
SELECT USER_NAME() AS UsuarioActual;
GO


/* =========================================================================
   PASO 2: Auditar permisos efectivos con sys.fn_my_permissions
   ========================================================================= */
PRINT '--- Verificando permisos en la tabla dbo.Pedido ---';
SELECT * FROM sys.fn_my_permissions('dbo.Pedido', 'OBJECT');
GO

PRINT '--- Verificando permisos en el esquema app ---';
SELECT * FROM sys.fn_my_permissions('app', 'SCHEMA');
GO


/* =========================================================================
   PASO 3: Probar el comportamiento del DENY y la Cadena de Propiedad
   ========================================================================= */

-- Intento A: Hacer una consulta directa a la tabla (Debe fallar por el DENY)
PRINT '--- Intento A: SELECT directo a dbo.Pedido (Debería fallar) ---';
BEGIN TRY
    SELECT TOP 5 * FROM dbo.Pedido;
END TRY
BEGIN CATCH
    PRINT 'ERROR ESPERADO: ' + ERROR_MESSAGE();
END CATCH;
GO

-- Intento B: Ejecutar el procedimiento (Debe funcionar por el GRANT EXECUTE y Ownership Chaining)
PRINT '--- Intento B: Ejecutar procedimiento app.usp_TopPedidosCliente (Debería funcionar) ---';
BEGIN TRY
    EXEC app.usp_TopPedidosCliente @ClienteId = 1, @TopN = 3;
END TRY
BEGIN CATCH
    PRINT 'ERROR NO ESPERADO: ' + ERROR_MESSAGE();
END CATCH;
GO


/* =========================================================================
   PASO 4: Volver al contexto original (Administrador / Cuenta principal)
   ========================================================================= */
PRINT '--- REVERTIENDO CONTEXTO AL ADMINISTRADOR ---';
REVERT;
GO

-- Confirmar que volvimos al usuario original
SELECT USER_NAME() AS UsuarioRestaurado;
GO
