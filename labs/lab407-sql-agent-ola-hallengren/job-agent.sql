USE msdb;
GO

-- ============================================================================
-- CREACIÓN DEL JOB DE MANTENIMIENTO: IndexOptimize (Ola Hallengren)
-- ============================================================================
EXEC sp_add_job
    @job_name = N'Mantenimiento - IndexOptimize y Estadisticas',
    @enabled = 1,
    @description = N'Optimiza índices por umbrales de fragmentación y actualiza estadísticas en todas las bases de datos de usuario.';

-- Añadir el paso que ejecuta el procedimiento almacenado de Ola Hallengren
EXEC sp_add_jobstep
    @job_name = N'Mantenimiento - IndexOptimize y Estadisticas',
    @step_name = N'Ejecutar dbo.IndexOptimize',
    @subsystem = N'TSQL',
    -- Se asume que los scripts de Ola Hallengren se instalaron en la BD master
    @command = N'EXECUTE master.dbo.IndexOptimize
        @Databases = ''USER_DATABASES'',
        @FragmentationLow = NULL,
        @FragmentationMedium = ''INDEX_REORGANIZE,INDEX_REBUILD_ONLINE,INDEX_REBUILD_OFFLINE'',
        @FragmentationHigh = ''INDEX_REBUILD_ONLINE,INDEX_REBUILD_OFFLINE'',
        @FragmentationLevel1 = 5,
        @FragmentationLevel2 = 30,
        @UpdateStatistics = ''ALL'',
        @OnlyModifiedStatistics = ''Y'',
        @LogToTable = ''Y'';',
    @database_name = N'master';

-- Programación: Semanal (Sábados a las 01:00 AM)
EXEC sp_add_schedule
    @schedule_name = N'Programacion Semanal - Sabados Madrugada',
    @freq_type = 8,
    @freq_interval = 64, -- 64 = Sábado
    @active_start_time = 010000;

-- Vincular programación
EXEC sp_attach_schedule
    @job_name = N'Mantenimiento - IndexOptimize y Estadisticas',
    @schedule_name = N'Programacion Semanal - Sabados Madrugada';

-- Asignar el Trabajo al servidor local
EXEC sp_add_jobserver
    @job_name = N'Mantenimiento - IndexOptimize y Estadisticas',
    @server_name = N'(LOCAL)';
GO
