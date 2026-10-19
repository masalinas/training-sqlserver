USE MiBaseDeDatos;
GO

-- REQUISITO PREVIO: Asegúrate de presionar Ctrl + M en SSMS 
-- para activar la pestaña del "Plan de ejecución real".

/* =========================================================================
   PASO 1: Generar el Plan optimizado para el Cliente Mayorista (Cliente 1)
   ========================================================================= */
-- Limpiamos la caché de planes para esta prueba para simular una primera ejecución limpia
ALTER DATABASE SCOPED CONFIGURATION CLEAR PROCEDURE_CACHE;
GO

PRINT '--- Ejecución 1: Optimizada para Cliente 1 (Sesgado - Muchos datos) ---';
EXEC dbo.usp_TopPedidosCliente @ClienteId = 1, @TopN = 3;
GO


/* =========================================================================
   PASO 2: Generar el Plan optimizado para un Cliente Común (Cliente 5)
   ========================================================================= */
-- Volvemos a limpiar la caché para obligar a SQL Server a compilar desde cero otra vez
ALTER DATABASE SCOPED CONFIGURATION CLEAR PROCEDURE_CACHE;
GO

PRINT '--- Ejecución 2: Optimizada para Cliente 5 (Pocos datos) ---';
EXEC dbo.usp_TopPedidosCliente @ClienteId = 5, @TopN = 3;
GO
