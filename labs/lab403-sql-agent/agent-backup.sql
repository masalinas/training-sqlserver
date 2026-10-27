/*
Paso 1: Crear el Job para el Backup FULL (Semanal)

Este Job se programa habitualmente los Domingos a las 00:00 AM. Utiliza INIT para limpiar el archivo de la semana anterior
*/

USE [msdb];
GO

-- 1. Crear el Contenedor del Job Full
EXEC dbo.sp_add_job @job_name = N'Mantenimiento_Backup_FULL',
    @enabled = 1,
    @description = N'Ejecuta el backup completo semanal sobreescribiendo el archivo previo.';

-- 2. Añadir el paso con el Script T-SQL
EXEC dbo.sp_add_jobstep @job_name = N'Mantenimiento_Backup_FULL', @step_name = N'Ejecutar T-SQL Full',
    @subsystem = N'TSQL',
    @command = N'
    DECLARE @FileName VARCHAR(255);
    -- Nombre dinámico con la fecha actual para no perder el histórico semanal
    SET @FileName = ''C:\Backups\MiBaseDatos_FULL_'' + CONVERT(VARCHAR(8), GETDATE(), 112) + ''.bak'';

    BACKUP DATABASE [MiBaseDatos]
    TO DISK = @FileName
    WITH INIT, COMPRESSION, STATS = 10;
    ',
    @retry_attempts = 2, @retry_interval = 5;

-- 3. Asociar el Job al Servidor Local
EXEC dbo.sp_add_jobserver @job_name = N'Mantenimiento_Backup_FULL', @server_name = N'(local)';

-- 4. Programación (Schedules): Ejecutar cada Domingo a medianoche
EXEC dbo.sp_add_jobschedule @job_name = N'Mantenimiento_Backup_FULL', @name = N'Programacion_Semanal_Full',
    @enabled = 1, @freq_type = 8, @freq_interval = 1, -- 1 = Domingo
    @freq_subday_type = 1, @active_start_time = 000000; -- 00:00:00 AM
GO

/*
Paso 2: Crear el Job para el Backup DIFERENCIAL (Diario)

Este Job respalda los cambios ocurridos desde el último FULL. Se programa de Lunes a Sábado a las 22:00 PM.
*/
USE [msdb];
GO

EXEC dbo.sp_add_job @job_name = N'Mantenimiento_Backup_DIFF', @enabled = 1;

EXEC dbo.sp_add_jobstep @job_name = N'Mantenimiento_Backup_DIFF', @step_name = N'Ejecutar T-SQL Diff',
    @subsystem = N'TSQL',
    @command = N'
    DECLARE @FileName VARCHAR(255);STATISTICS
    SET @FileName = ''C:\Backups\MiBaseDatos_DIFF_'' + CONVERT(VARCHAR(8), GETDATE(), 112) + ''.bak'';

    BACKUP DATABASE [MiBaseDatos]
    TO DISK = @FileName
    WITH DIFFERENTIAL, INIT, COMPRESSION, STATS = 10;
    ';

EXEC dbo.sp_add_jobserver @job_name = N'Mantenimiento_Backup_DIFF', @server_name = N'(local)';

-- Programación: Diario (De Lunes a Sábado) a las 22:00 PM
EXEC dbo.sp_add_jobschedule @job_name = N'Mantenimiento_Backup_DIFF', @name = N'Programacion_Diaria_Diff',
    @enabled = 1, @freq_type = 8,
    @freq_interval = 126, -- Suma binaria de Lunes(2)+Martes(4)+Miércoles(8)+Jueves(16)+Viernes(32)+Sábado(64)
    @freq_subday_type = 1, @active_start_time = 220000; -- 22:00:00 PM
GO
STATISTICS
/*
Paso 3: Crear el Job para el Backup de LOG (Frecuente)

Crucial para entornos OLTP. Respalda las transacciones activas y limpia el espacio del log. Se programa cada 15 minutos de forma perpetua.
*/
USE [msdb];
GO

EXEC dbo.sp_add_job @job_name = N'Mantenimiento_Backup_LOG', @enabled = 1;

EXEC dbo.sp_add_jobstep @job_name = N'Mantenimiento_Backup_LOG', @step_name = N'Ejecutar T-SQL Log',
    @subsystem = N'TSQL',
    @command = N'
    DECLARE @FileName VARCHAR(255);
    -- Incluye fecha y hora exacta (AñoMesDia_HoraMinuto) para que cada archivo de log sea único
    SET @FileName = ''C:\Backups\MiBaseDatos_LOG_'' + REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(16), GETDATE(), 120),''-'',''''),'' '',''_''),'':'','''') + ''.trn'';

    BACKUP LOG [MiBaseDatos]
    TO DISK = @FileName
    WITH COMPRESSION, STATS = 10; -- NOTA: Los logs nunca llevan INIT, se acumulan cronológicamente de forma externa
    ';

EXEC dbo.sp_add_jobserver @job_name = N'Mantenimiento_Backup_LOG', @server_name = N'(local)';

-- Programación: Cada 15 minutos, todos los días
EXEC dbo.sp_add_jobschedule @job_name = N'Mantenimiento_Backup_LOG', @name = N'Programacion_Frecuente_Log',
    @enabled = 1, @freq_type = 4, @freq_interval = 1, -- Cada 1 día
    @freq_subday_type = 4, @freq_subday_interval = 15, -- Cada 15 minutos
    @active_start_time = 000000, @active_end_time = 235959;
GO

/*
Paso 4: El caso de Emergencia manual: TAIL-LOG (Cola del Log)

El Tail-Log nunca se introduce en una tarea automática del SQL Agent. Se ejecuta manualmente únicamente cuando vas a iniciar una restauración por desastre o migración. Sirve para capturar las últimas transacciones antes de que el servidor principal sea apagado o cuando los archivos de datos se dañaron.
Para ejecutarlo, debes poner la base de datos en estado restringido y capturar el residuo con la cláusula NO_TRUNCATE:
*/
-- SCRIPT DE EMERGENCIA (MANUAL - Ejecutar solo despues desastre o failover)
USE [master];
GO

-- Coloca la base de datos en modo de usuario único expulsando conexiones activas
ALTER DATABASE [MiBaseDatos] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- Captura el Tail-Log aislando la base de datos (Queda en estado NORECOVERY)
BACKUP LOG [MiBaseDatos]
TO DISK = N'C:\Backups\MiBaseDatos_TAIL_LOG.trn'
WITH NO_TRUNCATE, -- Captura el log incluso si el archivo de datos (.mdf) está corrupto
     NORECOVERY,  -- Deja la BD cerrada para evitar cambios antes de la restauración definitiva
     STATS = 10;
GO
