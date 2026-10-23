/*
Paso 1: Ejecutar en el Servidor Principal (Producción)

Primero, generamos los archivos de respaldo limpios que enviaremos al servidor secundario.
*/

USE [MiBaseDatos];
GO

-- 1. Generar Backup Completo (Full Backup)
BACKUP DATABASE [MiBaseDatos]
TO DISK = N'C:\CompartidoLogShipping\MiBaseDatos_Master.bak'
WITH FORMAT, COMPRESSION, STATS = 10;
GO

-- 2. Generar primer Backup del Log de Transacciones
BACKUP LOG [MiBaseDatos]
TO DISK = N'C:\CompartidoLogShipping\MiBaseDatos_Log01.trn'
WITH FORMAT, COMPRESSION, STATS = 10;
GO

/*
Paso 2: Ejecutar en el Servidor Secundario (Contingencia)

Nota importante antes de ejecutar: Asegúrate de haber copiado los archivos anteriores a este servidor o que las rutas de red sean accesibles.
Este comando creará físicamente el archivo .tuf en la ruta que indiques a continuación
*/
USE [master];
GO

-- 1. Restaurar la Base de Datos Inicial en modo STANDBY
RESTORE DATABASE [MiBaseDatos_Secundaria]
FROM DISK = N'C:\BackupsRecibidos\MiBaseDatos_Master.bak'
WITH STANDBY = N'C:\SQL_Data\MiBaseDatos_Undo.tuf', -- Aquí el motor CREA el archivo automáticamente
     MOVE N'MiBaseDatos' TO N'C:\SQL_Data\MiBaseDatos_Secundaria.mdf', -- Cambiar por tus nombres lógicos de archivos
     MOVE N'MiBaseDatos_log' TO N'C:\SQL_Data\MiBaseDatos_Secundaria.ldf',
     REPLACE, STATS = 10;
GO

-- 2. Aplicar el primer Log correlativo manteniendo el modo STANDBY
RESTORE LOG [MiBaseDatos_Secundaria]
FROM DISK = N'C:\BackupsRecibidos\MiBaseDatos_Log01.trn'
WITH STANDBY = N'C:\SQL_Data\MiBaseDatos_Undo.tuf', -- Se vuelve a invocar el mismo archivo .tuf
     STATS = 10;
GO

/*
Paso 3: Script de Mantenimiento Continuo (Para tus Jobs automáticos)

Una vez que el entorno está inicializado, el comando que deberá ejecutar tu tarea programada (cada 15 minutos, por ejemplo) para aplicar los nuevos logs que vayan llegando sin romper el acceso de lectura es el siguiente:
*/
-- Modificar este bloque en tu tarea automática agregando la opción de desconexión si es necesario
RESTORE LOG [MiBaseDatos_Secundaria]
FROM DISK = N'\\ServidorPrincipal\CompartidoLogShipping\ProximoLog.trn'
WITH STANDBY = N'C:\SQL_Data\MiBaseDatos_Undo.tuf'
-- , DISCONNECT_ERRORS = ON -- Descomenta esta línea si quieres expulsar a los lectores para evitar bloqueos
GO

/*

Verificación del Estado Local
Para comprobar si tu base de datos se configuró correctamente, ejecuta esta consulta en el servidor secundario. Deberías ver el estado exacto en la columna
*/
SELECT name, user_access_desc, state_desc, is_read_only
FROM sys.databases
WHERE name = 'MiBaseDatos_Secundaria';
