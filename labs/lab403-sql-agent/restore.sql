/*
Script de Restauración Secuencial de Emergencia

Ejecuta estos comandos en la ventana de consultas del servidor de contingencia (asegúrate de estar posicionado en la base de datos master):
*/

USE [master];
GO

-- ============================================================================
-- PASO 1: Restaurar el último Backup COMPLETO (FULL)
-- Dejamos la base de datos en modo NORECOVERY para poder meterle los cambios siguientes.
-- ============================================================================
RESTORE DATABASE [MiBaseDatos]
FROM DISK = N'C:\Backups\MiBaseDatos_FULL_20261018.bak' -- Reemplazar con la fecha de tu último domingo
WITH NORECOVERY, REPLACE, STATS = 10;
GO

-- ============================================================================
-- PASO 2: Restaurar el último Backup DIFERENCIAL (DIFF)
-- Esto recuperará de golpe todos los cambios ocurridos entre el domingo y la noche de ayer.
-- Seguimos manteniendo el estado NORECOVERY.
-- ============================================================================
RESTORE DATABASE [MiBaseDatos]
FROM DISK = N'C:\Backups\MiBaseDatos_DIFF_20261022.bak' -- Reemplazar con la fecha de la última noche
WITH NORECOVERY, STATS = 10;
GO

-- ============================================================================
-- PASO 3: Restaurar los Backups de LOG intermedios (.trn)
-- Debes aplicar, uno por uno y en estricto orden cronológico, todos los archivos de log
-- generados DESPUÉS del diferencial hasta el momento del accidente.
-- ============================================================================
RESTORE LOG [MiBaseDatos]
FROM DISK = N'C:\Backups\MiBaseDatos_LOG_20261023_0800.trn' WITH NORECOVERY;
GO

RESTORE LOG [MiPaso 5: El caso de Emergencia manual: TAIL-LOG (Cola del Log)
El Tail-Log nunca se introduce en una tarea automática del SQL Agent. Se ejecuta manualmente únicamente cuando vas a iniciar una restauración por desastre o migración. Sirve para capturar las últimas transacciones antes de que el servidor principal sea apagado o cuando los archivos de datos se dañaron.
Para ejecutarlo, debes poner la base de datos en estado restringido y capturar el residuo con la cláusula NO_TRUNCATE:BaseDatos]
FROM DISK = N'C:\Backups\MiBaseDatos_LOG_20261023_0815.trn' WITH NORECOVERY;
GO

RESTORE LOG [MiBaseDatos]
FROM DISK = N'C:\Backups\MiBaseDatos_LOG_20261023_0830.trn' WITH NORECOVERY;
GO

-- ============================================================================
-- PASO 4: Restaurar el TAIL-LOG (La Cola del Log de Emergencia)
-- Aplicamos el último fragmento de log que salvamos manualmente justo antes de que
-- el servidor de producción colapsara por completo.
-- ============================================================================
RESTORE LOG [MiBaseDatos]
FROM DISK = N'C:\Backups\MiBaseDatos_TAIL_LOG.trn'
WITH NORECOVERY, STATS = 10;
GO

-- ============================================================================
-- PASO 5: El Candado Final - Poner la Base de Datos en línea
-- Ahora que ya aplicamos toda la línea de tiempo sin perder transacciones,
-- ejecutamos el comando definitivo que procesa los Rollbacks/Rollforwards y abre la BD.
-- ============================================================================
RESTORE DATABASE [MiBaseDatos]
WITH RECOVERY;
GO
