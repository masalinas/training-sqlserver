## Introducción

Tres herramientas avanzadas que todo administrador necesita para garantizar que su estrategia de copias de seguridad realmente funcione ante un desastre y para auditar qué copias se han realizado.   

1. El rescate de emergencia (Tail-Log Backup)

    En el primer bloque de código, vemos el script exacto para ejecutar un Tail-log, que es justo lo que comentábamos antes para salvar las últimas transacciones antes de iniciar una restauración:

    - WITH NO_TRUNCATE: Es un parámetro de emergencia. Le dice a SQL Server que extraiga los datos del archivo .ldf incluso si la base de datos principal está dañada o inaccesible.
    - NORECOVERY: Extrae la "cola" del registro y pone inmediatamente la base de datos en estado de restauración, cerrando la puerta a nuevas transacciones para que puedas empezar a volcar los backups antiguos.   

2. La verificación rápida (RESTORE VERIFYONLY)

    El segundo script muestra cómo comprobar si un archivo de backup está sano sin tener que restaurar todos los datos:

    - Al ejecutar RESTORE VERIFYONLY, SQL Server lee todo el archivo .bak (en este caso el Full) y comprueba las sumas de comprobación (CHECKSUM) para asegurar que el archivo físico no se ha corrompido en el disco duro. Es una operación rápida que confirma que el fichero es legible.

3. La advertencia del DBA (Caja roja)

    Este es el consejo más valioso de la transparencia: "VERIFYONLY no basta".

    - Que un archivo sea legible no significa que los datos que contiene sean correctos. La advertencia indica que la única prueba real y definitiva es restaurar esa copia en un servidor secundario distinto y ejecutar el comando DBCC CHECKDB para validar la integridad lógica de las tablas. Recomienda planificar este simulacro de forma mensual. 


4. Auditoría con el historial de msdbEl cuadro de la derecha muestra cómo interrogar a la base de datos del sistema llamada msdb, que es donde SQL Server anota en secreto un registro histórico de cada backup que se ejecuta en el servidor.   

    - El script cruza dos tablas clave: backupset (que guarda los metadatos lógicos) y backupmediafamily (que guarda la ruta física del archivo).
    - Te permite auditar qué tipo de copias se han hecho (D para Full, I para Diferencial, L para Log), cuándo terminaron exactamente (backup_finish_date) y en qué carpeta o dispositivo físico (physical_device_name) se guardaron.