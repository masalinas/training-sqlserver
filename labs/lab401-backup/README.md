## Introducción

Estos cuatro scripts componen la estrategia de protección de datos estándar que todo administrador implementa en un entorno de producción. El directorio de destino (/var/opt/mssql/...) revela además que este servidor en particular se está ejecutando sobre un sistema operativo Linux o un contenedor Docker, en lugar de la clásica estructura de Windows:

1. Copia de Seguridad Completa (Full)

    Es la copia maestra. Realiza una instantánea completa de todas las páginas de datos de la base de datos y de la porción del registro de transacciones necesaria para que la copia sea consistente al restaurarla.

    - `COMPRESSION`: Comprime el archivo de salida al vuelo. Ahorra muchísimo espacio en disco y acelera la escritura, a cambio de un pico de consumo de CPU durante la ejecución.

    - `CHECKSUM`: Obliga a SQL Server a validar matemáticamente cada página de datos mientras la copia. Si el motor detecta una página corrupta en el disco duro, aborta el proceso y lanza un error. Garantiza que no guardes respaldos de datos dañados.

    - `INIT`: Si ya existe un archivo llamado Ventas_FULL.bak en esa ruta, lo sobrescribe por completo. Sin este parámetro, SQL Server concatenaría la nueva copia dentro del mismo archivo físico, inflando su tamaño infinitamente.

    - `STATS = 10:` Imprime un mensaje en la consola de SSMS cada vez que el progreso de la copia avanza un 10%.

2. Copia de Seguridad Diferencial

    Depende absolutamente del último backup Full.

    - `WITH DIFFERENTIAL`: En lugar de copiar toda la base de datos, SQL Server consulta un mapa interno (DCM - Differential Changed Map) y extrae únicamente las extensiones de datos que han sido modificadas desde la ejecución del último backup Full. Es muy rápido y ligero. A la hora de restaurar tras un desastre, aplicarás el Full del domingo y solo el último Diferencial disponible, saltándote los días intermedios.

3. Copia del Registro de Transacciones (Log)

    Es la pieza que permite viajar en el tiempo a un segundo exacto (Point-in-Time Recovery).

    - `BACKUP LOG`: Solo funciona si la base de datos está en el modelo de recuperación Full o Bulk-Logged. Captura todo el historial de operaciones desde el último backup de log. Lo más crítico de este comando es que es el único responsable de desencadenar el truncado del log, marcando el espacio inactivo dentro del archivo .ldf para que pueda ser reutilizado.

4. Copia de Solo Copia (Copy-Only)

    Es el "backup de cortesía" y una herramienta de supervivencia para el administrador.

    - `WITH COPY_ONLY`: Si un desarrollador te pide una copia urgente de la base de datos de producción para investigar un error, jamás debes ejecutar un BACKUP DATABASE normal a mitad del día. Si lo haces, el motor reiniciará el mapa de cambios (DCM) y los backups diferenciales de esa noche quedarán vinculados a esta copia que le has dado al desarrollador, rompiendo tu cadena oficial de restauración. El parámetro COPY_ONLY extrae una copia Full idéntica, pero de forma "invisible": no altera el DCM, no afecta a la cadena de logs y mantiene tu política de recuperación corporativa intacta.