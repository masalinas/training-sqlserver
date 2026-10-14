## Introducción

Este script T-SQL automatiza la limpieza de la base de datos msdb creando un Job que ejecuta los procedimientos `sp_delete_backuphistory` y `sp_purge_jobhistory` de forma semanal. En este ejemplo, se configura una política de retención que elimina los registros anteriores a 30 días para mantener el rendimiento del catálogo del sistema

## Ejemplo

```sql
USE msdb;
GO

-- 1. Crear el Trabajo (Job)
EXEC sp_add_job
    @job_name = N'Mantenimiento - Limpieza de MSDB',
    @enabled = 1,
    @description = N'Limpieza semanal del historial de backups y jobs en msdb reteniendo 30 días.';

-- 2. Añadir el paso con el script T-SQL para purgar el historial
EXEC sp_add_jobstep
    @job_name = N'Mantenimiento - Limpieza de MSDB',
    @step_name = N'Ejecutar sp_delete_backuphistory y sp_purge_jobhistory',
    @subsystem = N'TSQL',
    @command = N'
        DECLARE @FechaLimite DATETIME;
        SET @FechaLimite = DATEADD(DAY, -30, GETDATE());

        -- Purgar historial de copias de seguridad
        EXEC msdb.dbo.sp_delete_backuphistory @oldest_date = @FechaLimite;

        -- Purgar historial de ejecución de jobs del Agent
        EXEC msdb.dbo.sp_purge_jobhistory @oldest_date = @FechaLimite;
    ',
    @database_name = N'msdb';

-- 3. Crear la programación (Schedule: Semanal, Domingos a las 04:00 AM)
-- freq_type = 8 (Semanal), freq_interval = 1 (Domingo)
EXEC sp_add_schedule
    @schedule_name = N'Programacion Semanal - Limpieza MSDB',
    @freq_type = 8,
    @freq_interval = 1,
    @active_start_time = 040000;

-- 4. Vincular la programación al Trabajo
EXEC sp_attach_schedule
    @job_name = N'Mantenimiento - Limpieza de MSDB',
    @schedule_name = N'Programacion Semanal - Limpieza MSDB';

-- 5. Asignar el Trabajo al servidor local
EXEC sp_add_jobserver
    @job_name = N'Mantenimiento - Limpieza de MSDB',
    @server_name = N'(LOCAL)';
GO
```

El bloque principal del código define una variable `@FechaLimite` que retrocede 30 días desde el momento de la ejecución. Esta fecha se inyecta en `sp_delete_backuphistory` para limpiar el historial de medios y copias, y en `sp_purge_jobhistory` para borrar los logs de éxito o error de los trabajos antiguos. La programación semanal garantiza que la base de datos msdb no acumule datos innecesarios de forma indefinida.
