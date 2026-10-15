## Introducción

Los VLF (Virtual Log Files) son los segmentos virtuales y más pequeños en los que SQL Server divide internamente el archivo físico del registro de transacciones (.ldf). El motor de la base de datos no gestiona el archivo de registro como un bloque único y masivo, sino que escribe y reutiliza el espacio de forma secuencial y circular a través de estas pequeñas particiones lógicas.

## Estados de un VLF

En cualquier momento, un VLF puede encontrarse en alguno de los siguientes estados:

| Estado      | Descripción   |
|-------------|---------------|
| Activo      | Contiene registros de transacciones que aún se necesitan para una recuperación, replicación o copia de seguridad en curso. |
| Inactivo    | Contiene transacciones ya confirmadas (committed) que ya se han guardado en el disco de datos o respaldado. Este espacio se puede truncar y reutilizar. |
| Recuperable / Truncado | Ha sido liberado mediante el proceso de truncamiento del log y está listo para ser sobrescrito con nuevas transacciones. |
	   

## ¿Cómo y cuántos VLFs se crean?

El número y tamaño de los VLF no se pueden configurar manualmente. SQL Server los calcula de forma automática cada vez que el log de transacciones se crea o crece (ya sea por crecimiento inicial o por un evento de Autogrowth).
Tener una mala configuración (por ejemplo, permitir que el log crezca en incrementos muy pequeños de 1 MB o 10%) provoca la creación de miles de VLFs microscópicos, un fenómeno conocido como fragmentación del registro de transacciones.

## Cómo diagnosticar y corregir problemas de VLF

Para identificar cuántos segmentos tiene una base de datos, puedes utilizar la siguiente consulta en SQL Server (versión 2017 en adelante)

Para ver el total de vlf para la db por defecto es decir, master
```sql 	
SELECT database_id, DB_NAME() AS [Base de Datos], COUNT(vlf_sequence_number) AS total_vlfs
FROM sys.dm_db_log_info(DEFAULT)
GROUP BY database_id;
```

En caso de poder ver todas las db existentes
```sql 	
SELECT 
    d.name AS [Base de Datos],
    s.total_vlf_count AS [Total VLFs],
    s.active_vlf_count AS [VLFs Activos],
    s.total_log_size_mb AS [Tamaño Log (MB)]
FROM sys.databases d
CROSS APPLY sys.dm_db_log_stats(d.database_id) s
```

Si el número es demasiado elevado, el procedimiento estándar para solucionarlo consiste en realizar un paso a paso secuencial:

1. Respaldar el registro de transacciones para liberar los VLF activos.
2. Reducir el archivo físico de log al tamaño mínimo posible utilizando la instrucción DBCC SHRINKFILE.
3. Redimensionar el log con ALTER DATABASE asignándole un tamaño inicial saludable y definiendo un crecimiento automático estático adecuado (por ejemplo, incrementos de 512 MB o 1024 MB en lugar de porcentajes).

## columna active_vlf_count
La columna active_vlf_count indica la cantidad de Archivos de Registro Virtuales (VLFs) que contienen transacciones activas en este momento dentro del registro de transacciones (.ldf).

Un VLF se considera activo si la información que tiene almacenada cumple con al menos una de estas condiciones:
- Transacciones abiertas: Contiene cambios realizados por un usuario o proceso que aún no han terminado (falta ejecutar un COMMIT o un ROLLBACK).
- Pendiente de Checkpoint: Los datos modificados en memoria (dirty pages) aún no se han escrito físicamente en el archivo de datos (.mdf).
- Pendiente de Backup: La base de datos está en modelo de recuperación Full (Completo) y esas transacciones confirmadas todavía no se han respaldado en un backup de log (BACKUP LOG).
- Pendiente de Replicación/CDC: Las herramientas de replicación o captura de datos modificados aún no han leído esos registros para enviarlos a otra base de datos.


## ¿Por qué es importante monitorear este valor?

| Escenario      | Significado Técnico   |
|-------------|---------------|
| active_vlf_count cercano a cero | El registro de transacciones está sano. El espacio se está liberando y reutilizando correctamente de forma circular. |
| active_vlf_count igual o muy cercano a total_vlf_count | El archivo de log se está quedando sin espacio reutilizable. Si llega al 100%, el log tendrá que crecer físicamente (Autogrowth) o bloqueará la base de datos con un error de "Log Full" (Error 9002).


## ¿Cómo liberar VLFs activos?

Si notas que este número no disminuye, por lo general se debe a que te falta ejecutar un Backup del Log de Transacciones (si estás en modo Full) o a que hay una transacción vieja que se quedó abierta por error y está impidiendo que el motor limpie el archivo.

Si ejecutas la consulta en tu entorno, ¿qué valor tiene active_vlf_count en comparación con total_vlf_count para la base de datos training? Si notas que están muy parejos, te puedo ayudar a identificar qué proceso o transacción está impidiendo que se liberen.

**Paso 1: Averiguar la causa general (El "Por qué")**

Antes de buscar al culpable, pregúntale a la base de datos qué tipo de proceso está esperando.

```sql 
SELECT name AS [Base de Datos], log_reuse_wait_desc AS [Razón de Espera del Log]
FROM sys.databases
WHERE name = 'training';
```

El resultado en log_reuse_wait_desc te dirá el motivo. Los más comunes son:

- ACTIVE_TRANSACTION: Hay una consulta abierta que no ha terminado (un BEGIN TRAN sin su correspondiente COMMIT).
- LOG_BACKUP: La base de datos está en modo Full y necesita urgentemente un respaldo de log (BACKUP LOG).
- CHECKPOINT: El motor está pendiente de pasar los datos de la memoria al disco.
- REPLICATION / CDC_CAPTURE: Hay herramientas de replicación que no han terminado de leer los datos.


**Paso 2: Encontrar la consulta y el usuario exacto (El "Quién")**

Si el paso anterior te dio ACTIVE_TRANSACTION, ejecuta la siguiente consulta. Te mostrará con precisión quirúrgica quién es el usuario, desde qué programa está conectado, qué consulta exacta está ejecutando y cuánto tiempo lleva abierta:

```sql
SELECT 
    st.session_id AS [SPID / Sesión],
    s.login_name AS [Usuario],
    s.host_name AS [Equipo Cliente],
    s.program_name AS [Programa / Software],
    st.database_transaction_begin_time AS [Hora de Inicio],
    DATEDIFF(minute, st.database_transaction_begin_time, GETDATE()) AS [Minutos Activa],
    t.text AS [Código SQL ejecutándose]
FROM sys.dm_tran_database_transactions st
JOIN sys.dm_exec_sessions s ON st.transaction_id = s.session_id -- En algunos escenarios requiere mapear por transacciones activas de sesión
-- Corrección de relación para mayor precisión:
CROSS APPLY sys.dm_exec_sql_text((
    SELECT top 1 sql_handle FROM sys.dm_exec_requests r WHERE r.session_id = s.session_id
    UNION ALL
    SELECT top 1 most_recent_sql_handle FROM sys.dm_exec_connections c WHERE c.session_id = s.session_id
)) t
WHERE st.database_id = DB_ID('training')
ORDER BY [Minutos Activa] DESC;
```

**¿Cómo solucionarlo una vez identificado?**

1. Si es LOG_BACKUP: Ejecuta un respaldo del registro de transacciones inmediatamente:

    ```sql
    BACKUP LOG training TO DISK = 'NUL'; -- Usa una ruta real si quieres conservar el historial
    ```

2. Si es ACTIVE_TRANSACTION: Habla con el desarrollador o usuario dueño de esa sesión (SPID). Si se trata de un proceso colgado o un error humano que se puede interrumpir de forma segura, puedes cerrarlo a la fuerza usando su número de sesión (ejemplo para el SPID 54):

    ```shell
    KILL 54;
    ```