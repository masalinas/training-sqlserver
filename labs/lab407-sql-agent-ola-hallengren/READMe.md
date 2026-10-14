## Introducción

Los scripts de Ola Hallengren son el estándar de facto en la comunidad de SQL Server para el mantenimiento de bases de datos. Son un conjunto de procedimientos almacenados (DatabaseBackup, DatabaseIntegrityCheck, IndexOptimize) que se instalan en la base de datos master (o una base de datos de administración dedicada) y se ejecutan mediante Jobs del Agente de SQL Server.

A diferencia de los planes de mantenimiento nativos, estos scripts son extremadamente flexibles y, como indica la imagen, permiten realizar optimizaciones de índices "por umbrales". Esto significa que el script analiza la fragmentación de cada índice en tiempo real y decide dinámicamente si debe ignorarlo, reorganizarlo o reconstruirlo

## Ejemplo

Aquí tienes un ejemplo en T-SQL que crea un Job para ejecutar el mantenimiento de índices y estadísticas utilizando el procedimiento IndexOptimize de Ola Hallengren:

```sql
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
```

Explicación de los parámetros clave en el comando:

- `IndexOptimize:@Databases = 'USER_DATABASES'`: Indica que el proceso iterará automáticamente por todas las bases de datos de usuario existentes, evitando tener que crear un Job por cada base de datos.
- Umbrales de fragmentación (`@FragmentationLevel1 = 5`, `@FragmentationLevel2 = 30`): Define los límites. Una fragmentación baja es menor al 5%, media entre el 5% y el 30%, y alta superior al 30%.
- Acciones por umbral (`@FragmentationLow`, `@Medium`, `@High`):
  - Si es baja (`NULL`), no hace nada.
  - Si es media, intenta hacer un `REORGANIZE` (que es más ligero). Si no puede, intenta un `REBUILD` online, y si la edición de SQL no lo permite, hace un `REBUILD` offline.
  - Si es alta, salta directamente a intentar el `REBUILD` para reconstruir el índice por completo.
  - `@UpdateStatistics` y `@OnlyModifiedStatistics`: Actualiza las estadísticas de distribución de datos para mejorar el rendimiento de las consultas, pero inteligentemente solo lo hace en las tablas que han sufrido modificaciones reales.
  - `@LogToTable = 'Y'`: Guarda un registro detallado de todo lo que ha hecho (qué índices tocó, tiempos de ejecución, comandos exactos) en una tabla llamada CommandLog para futuras auditorías.
