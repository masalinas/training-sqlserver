## Introducción

Se puede ver un resumen de los principales parametros del comando BACKUP tanto a nivel de datos: `FULL`, `DIFERENCIAL` como a nivel de logs `LOG`

Backups a nivel de datos
```sql
BACKUP DATABASE { nombre_de_la_base_de_datos }
TO <dispositivo_de_almacenamiento>
[ WITH { [ ,...n ] } ]
```

Backups a nivel de logs
```sql
BACKUP LOG { nombre_de_la_base_de_datos }
TO <dispositivo_de_almacenamiento>
[ WITH { [ ,...n ] } ]
```

0. Parámetros Principales de Ubicación y Tipo

| Parámetro | ¿Qué comando lo usa? | ¿Para qué sirve? / Explicación simple |
| :--- | :--- | :--- |
| **`TO DISK = 'ruta'`** | Ambos | Define la **ruta física del disco** y el nombre del archivo donde se guardará la copia (ej. `.bak` o `.trn`). |
| **`WITH DIFFERENTIAL`** | `DATABASE` | Indica a SQL Server que **solo guarde los cambios** realizados desde el último backup Completo. Si no se pone, el backup por defecto es Completo. |

1. Parámetros de Gestión del Archivo (Sobrescritura vs Acumulación)

| Combinación de parámetros | ¿Qué le pasa al archivo `.bak`? | ¿Cuándo se usa en clase? |
| :--- | :--- | :--- |
| **`WITH FORMAT`** o **`WITH FORMAT, INIT`** | **Sobrescritura total.** Borra el encabezado y todo el contenido anterior. El archivo empieza de cero. | Para laboratorios donde quieres un archivo limpio sin importar lo que hubiera antes. |
| **`WITH INIT`** | **Sobrescritura de datos.** Borra los backups de adentro, pero valida que el encabezado (`MEDIANAME`) del medio sea el mismo para proteger contra errores de nombre. | Para flujos de trabajo diarios donde reutilizas el mismo archivo pero quieres mantener la estructura del medio. |
| **`WITH NOINIT`** *(Por defecto)* | **Acumulación.** No borra nada; agrega el nuevo backup al final del mismo archivo `.bak` (creando la posición 2, 3, etc.). | Para guardar el backup Completo, el Diferencial y los de Log dentro del mismo y único archivo. |

2. Comparativa de seguridad: INIT frente a FORMAT

| Acción | Con `WITH INIT` 🛡️ | Con `WITH FORMAT` 🧨 |
| :--- | :--- | :--- |
| **¿Qué hace con los backups de adentro?** | Los borra todos. | Los borra todos. |
| **¿Qué hace con la etiqueta exterior `MEDIANAME`(encabezado)?** | **La respeta.** La lee y la mantiene si coincide. | **La destruye.** No le importa qué decía; la quema y crea una nueva. |
| **¿Qué pasa si te equivocas de archivo?** | **Te protege.** Si el archivo era de otra base de datos o medio, cancela la operación. | **No te protege.** Sobrescribe lo que sea que haya ahí, sin hacer preguntas. |

3. Jerarquía de nombres en un archivo de respaldo

| Nombre | ¿Qué identifica? | ¿Es restrictivo? | Ejemplo útil |
| :--- | :--- | :--- | :--- |
| **`MEDIANAME`** | Al **archivo completo** por fuera (el contenedor). | **Sí**, si usas `INIT`, actúa como llave de seguridad. | `'Medio_Backups_Produccion'` |
| **`NAME`** | A la **copia de datos** por dentro (el contenido). | **No**, es texto 100% libre e informativo. | `'Backup Completo antes de aplicar Parche 2.1'` |

4. ¿Cómo reacciona SQL Server al usar MEDIANAME?

| Si usas `MEDIANAME` junto con... | ¿SQL Server valida el nombre anterior? | ¿Qué hace realmente? |
| :--- | :--- | :--- |
| 🛡️ **`WITH INIT`** | **SÍ (Validación Estricta)** | **Compara** el `MEDIANAME` que escribiste con el que ya tiene el archivo. Si no son idénticos, cancela el backup con un error para proteger tus datos. |
| 🧨 **`WITH FORMAT`** | **NO (Ignora lo anterior)** | No le importa qué nombre tenía el archivo antes. Borra todo por completo y le estampa el **nuevo** `MEDIANAME` que hayas decidido ponerle. |
| 📚 **`WITH NOINIT`** *(o no pones nada)* | **SÍ (Validación Estricta)** | Como va a añadir el backup al final de un archivo existente, SQL Server te obliga a que el `MEDIANAME` coincida con el del archivo original. Si pones uno diferente, **dará error** porque no puedes mezclar medios distintos en un mismo archivo físico. |

5. Comparativa de restauración: RECOVERY vs NORECOVERY

| Parámetro | Estado de la Base de Datos | ¿Permite más backups? | ¿Cuándo se utiliza en el curso? |
| :--- | :--- | :--- | :--- |
| **`WITH RECOVERY`** *(Por defecto)* | **`ONLINE` (En línea)**. Lista para usar, leer y escribir datos. | **NO**. Ya no puedes aplicarle ningún backup adicional. | Cuando estás restaurando **el último (o único)** archivo de tu estrategia de copias de seguridad. |
| **`WITH NORECOVERY`** | **`RESTORING` (Restaurando)**. Queda inaccesible para los usuarios. | **SÍ**. Está esperando a que le restaures el siguiente archivo de la secuencia. | Cuando tienes **varios archivos que aplicar en orden** (por ejemplo: el Completo y luego el Diferencial). |

6. Diccionario Completo de Parámetros (BACKUP DATABASE y LOG)

| Parámetro | Tipo | ¿Para qué sirve? / Explicación simple |
| :--- | :--- | :--- |
| **`TO DISK = 'ruta'`** | Ubicación | Define la **ruta física del disco** y el nombre del archivo final (ej. `.bak` o `.trn`). |
| **`WITH DIFFERENTIAL`** | Tipo | Indica a SQL Server que **solo guarde los cambios** realizados desde el último backup Completo. |
| **`WITH FORMAT`** | Gestión | **Borrado absoluto.** Destruye todo lo que haya en la ruta y crea un archivo totalmente limpio (Posición 1). |
| **`WITH INIT`** | Gestión | **Vacía el contenido.** Borra los backups de adentro, pero primero valida que la etiqueta exterior (`MEDIANAME`) coincida. |
| **`WITH NOINIT`** | Gestión | **Acumula datos.** Añade el nuevo backup al final del documento sin borrar nada, creando una nueva posición (`FILE=2`, etc.). |
| **`WITH MEDIANAME = '...'`** | Identificación | Define la **etiqueta exterior de seguridad** de todo el archivo físico. |
| **`WITH NAME = '...'`** | Identificación | Es una **descripción interna y libre** de la copia de seguridad (máximo 128 caracteres). |
| **`WITH COMPRESSION`** | Rendimiento | **Comprime el archivo final** usando procesador. Ahorra espacio en disco y acelera la escritura. |
| **`WITH STATS = X`** | Monitoreo | Muestra un **contador de progreso** en los mensajes de SSMS cada vez que avanza un `X` por ciento. |
| **`WITH CHECKSUM`** 🛡️ | Avanzado | **Verificación de integridad.** Detiene el backup si detecta páginas dañadas en la base de datos para evitar respaldar datos corruptos. |
| **`WITH COPY_ONLY`** 👥 | Avanzado | **Copia independiente.** Hace un backup que **no altera la secuencia lógica** ni rompe las cadenas de backups de la empresa. |


## Restaurar backups de tipo NOINIT
Al hacer backups con el parametro `NOINIT` el fichero es un acumulado de varios backups con posiciones 1,2, ... En este caso debemos de elegir el numero de backup

Podemos listar los backups en el interior del fichero y escoger la posición del mismo
```sql
RESTORE HEADERONLY
FROM DISK = 'C:\Ruta\TuBackup.bak';
```
Restaurar la db exacta añadiendo `FILE` y la posición del backup elegida
```sql
-- Restaurar el backup del miércoles (Posición 3)
RESTORE DATABASE { nombre_de_la_base_de_datos }
FROM DISK = 'C:\Ruta\TuBackup.bak'
WITH FILE = 3, RECOVERY;
```

## Ejemplos

A continuación, se detalla un ejemplo estructurado de los comandos T-SQL que se incluirían en cada tarea programada, utilizando la base de datos `training`:

1. Full Backup Este script realiza la copia completa de la base de datos, inicializando el archivo (WITH INIT) para sobrescribir el backup y aplicando compresión para ahorrar espacio en disco.

```sql
BACKUP DATABASE { nombre_de_la_base_de_datos }
TO DISK = N'C:\Backups\training_FULL.bak'
WITH FORMAT, COMPRESSION, STATS = 10;
```

2. Backup Diferencial. Captura exclusivamente los bloques de datos modificados desde el el ultimo Full Backup. Utiliza el mismo parámetro para sobrescribir su propio archivo diario.

```sql
BACKUP DATABASE { nombre_de_la_base_de_datos }
TO DISK = N'C:\Backups\training_DIFF.bak'
WITH DIFFERENTIAL, FORMAT, COMPRESSION;
```

3. Job de Transaction Log Backup
Dado que este proceso se ejecuta decenas de veces al día y no debe sobrescribir ejecuciones previas (para no romper la cadena de logs), se utiliza una variable que genera un nombre de archivo dinámico basado en la fecha y hora exacta del sistema.

```sql
DECLARE @FileName NVARCHAR(255);
SET @FileName = N'C:\Backups\training_LOG_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmm') + '.trn';

BACKUP LOG { nombre_de_la_base_de_datos }
TO DISK = @FileName
WITH COMPRESSION;
```

Alternativamente a la escritura manual de estos scripts, SQL Server Management Studio ofrece los Planes de Mantenimiento (Maintenance Plans). Esta herramienta gráfica permite arrastrar módulos visuales para crear las tareas de Full, Differential y Log Backups, configurar políticas de limpieza automática de archivos antiguos y crear de forma transparente los Jobs correspondientes en SQL Server Agent.

Ahora que ya tenemos los script T-SQL para cada etapa del proceso BACKUP, podemos definir los jobs con sus comandos de backups e intervalos:

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
    @command = N'BACKUP DATABASE [training] TO DISK = N''C:\Backups\training_FULL.bak'' WITH INIT, COMPRESSION, STATS = 10;',
    @database_name = N'master';

-- Frecuencia: 8 (Semanal), Intervalo: 1 (Domingo), Hora: 02:00:00
EXEC sp_add_schedule
    @schedule_name = N'Programacion Semanal - Domingo',
    @freq_type = 8,     -- 8 = Frecuencia Semanal, 4 = frecuencia diaria
    @freq_interval = 1, -- Dentro de la frecuencia semanal el primer dia: docmingo. 1: domingo, 2: Lunes, 4: martes, ... 64: Sabado
    @active_start_time = 020000; -- Indica la hora exacta en formato militar de 24 horas (HHMMSS)


EXEC sp_attach_schedule
    @job_name = N'Backup FULL - Training',
    @schedule_name = N'Programacion Semanal - Domingo a las 2:00';

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
    @enabled = 1,
    @description = N'Copia de seguridad del registro de transacciones cada 15 minutos para la BD training.';

EXEC sp_add_jobstep
    @job_name = N'Backup LOG - Training',
    @step_name = N'Ejecutar T-SQL Log Backup',
    @subsystem = N'TSQL',
    @command = N'DECLARE @FileName NVARCHAR(255);
                 SET @FileName = N''C:\Backups\training_LOG_'' + FORMAT(GETDATE(), ''yyyyMMdd_HHmm'') + ''.trn'';
                 BACKUP LOG [training] TO DISK = @FileName WITH COMPRESSION;',
    @database_name = N'master';

-- Frecuencia: 4 (Diaria), Subfrecuencia: 4 (Minutos), Intervalo: 15
EXEC sp_add_schedule
    @schedule_name = N'Programacion 15 Minutos',
    @freq_type = 4,
    @freq_interval = 1,
    @freq_subday_type = 4,
    @freq_subday_interval = 15;

EXEC sp_attach_schedule
    @job_name = N'Backup LOG - Training',
    @schedule_name = N'Programacion 15 Minutos';

EXEC sp_add_jobserver @job_name = N'Backup LOG - Training', @server_name = N'(LOCAL)';
GO
```

Un detalle importante sobre cómo SQL Server Agent maneja los días de la semana (`@freq_interval = 126`):
Para el Job del diferencial, SQL Server Agent no usa una lista de días, sino que utiliza una máscara de bits (bitmask). A cada día se le asigna un valor (Domingo=1, Lunes=2, Martes=4, Miércoles=8, Jueves=16, Viernes=32, Sábado=64). Para indicarle que ejecute de lunes a sábado, sumas los valores (2+4+8+16+32+64 = 126).

Para comprobar que los Jobs se han creado correctamente, puedes ir al Explorador de Objetos en SQL Server Management Studio, refrescar la carpeta Trabajos dentro del Agente SQL Server, y verás los tres listos para ejecutarse.
