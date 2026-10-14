BACKUP DATABASE [training]
TO DISK = N'C:\Backups\training_FULL.bak'
WITH FORMAT, INIT, COMPRESSION, STATS = 10;
```
2. Job de Backup Diferencial (Ejecución diaria: Lunes a Sábado a las 02:00 AM)
Captura exclusivamente los bloques de datos modificados desde el Full Backup del domingo. Utiliza el mismo parámetro para sobrescribir su propio archivo diario.

```sql
BACKUP DATABASE [training]
TO DISK = N'C:\Backups\training_DIFF.bak'
WITH DIFFERENTIAL, INIT, COMPRESSION;
```

3. Job de Transaction Log Backup (Ejecución continua: Cada 15 minutos)
Dado que este proceso se ejecuta decenas de veces al día y no debe sobrescribir ejecuciones previas (para no romper la cadena de logs), se utiliza una variable que genera un nombre de archivo dinámico basado en la fecha y hora exacta del sistema.

```sql
DECLARE @FileName NVARCHAR(255);
SET @FileName = N'C:\Backups\training_LOG_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmm') + '.trn';

BACKUP LOG [training]
TO DISK = @FileName
WITH COMPRESSION;
```

Alternativamente a la escritura manual de estos scripts, SQL Server Management Studio ofrece los Planes de Mantenimiento (Maintenance Plans). Esta herramienta gráfica permite arrastrar módulos visuales para crear las tareas de Full, Differential y Log Backups, configurar políticas de limpieza automática de archivos antiguos y crear de forma transparente los Jobs correspondientes en SQL Server Agent.

Ahora que ya tenemos los script T-SQL para cada etapa del proceso BACKUP

```sql
-- 1. Crear el Trabajo (Job)
USE msdb;
GO

-- ============================================================================
-- 1. JOB DE FULL BACKUP (Domingos a las 02:00 AM)
-- ============================================================================
EXEC sp_add_job
    @job_name = N'Backup FULL - Training',
    @enabled = 1,
    @description = N'Copia de seguridad Completa (Domingos) para la BD training.';

EXEC sp_add_jobstep
    @job_name = N'Backup FULL - Training',
    @step_name = N'Ejecutar T-SQL Full Backup',
    @subsystem = N'TSQL',
    @command = N'BACKUP DATABASE [training] TO DISK = N''C:\Backups\training_FULL.bak'' WITH FORMAT, INIT, COMPRESSION, STATS = 10;',
    @database_name = N'master';

-- Frecuencia: 8 (Semanal), Intervalo: 1 (Domingo), Hora: 02:00:00
EXEC sp_add_schedule
    @schedule_name = N'Programacion Semanal - Domingo',
    @freq_type = 8,     -- 8 = Frecuencia Semanal, 4 = frecuencia diaria
    @freq_interval = 1, -- Dentro de la frecuencia semanal el primer dia: docmingo. 1: domingo, 2: Lunes, 4: martes, ... 64: Sabado
    @active_start_time = 020000; -- Indica la hora exacta en formato militar de 24 horas (HHMMSS)


EXEC sp_attach_schedule
    @job_name = N'Backup FULL - Training',
    @schedule_name = N'Programacion Semanal - Domingo';

EXEC sp_add_jobserver @job_name = N'Backup FULL - Training', @server_name = N'(LOCAL)';


-- ============================================================================
-- 2. JOB DE BACKUP DIFERENCIAL (Lunes a Sábado a las 02:00 AM)
-- ============================================================================
EXEC sp_add_job
    @job_name = N'Backup DIFF - Training',
    @enabled = 1,
    @description = N'Copia de seguridad Diferencial (Lunes a Sabado) para la BD training.';

EXEC sp_add_jobstep
    @job_name = N'Backup DIFF - Training',
    @step_name = N'Ejecutar T-SQL Diff Backup',
    @subsystem = N'TSQL',
    @command = N'BACKUP DATABASE [training] TO DISK = N''C:\Backups\training_DIFF.bak'' WITH DIFFERENTIAL, INIT, COMPRESSION;',
    @database_name = N'master';

-- Frecuencia: 8 (Semanal)
-- Intervalo: 126 (Suma de los días: Lunes=2 + Martes=4 + Miércoles=8 + Jueves=16 + Viernes=32 + Sábado=64)
EXEC sp_add_schedule
    @schedule_name = N'Programacion Semanal - Lunes a Sabado',
    @freq_type = 8,
    @freq_interval = 126,
    @active_start_time = 020000;

EXEC sp_attach_schedule
    @job_name = N'Backup DIFF - Training',
    @schedule_name = N'Programacion Semanal - Lunes a Sabado';

EXEC sp_add_jobserver @job_name = N'Backup DIFF - Training', @server_name = N'(LOCAL)';


-- ============================================================================
-- 3. JOB DE TRANSACTION LOG (Cada 15 minutos, todos los días)
-- ============================================================================
EXEC sp_add_job
    @job_name = N'Backup LOG - Training',
    @enabled = 1
