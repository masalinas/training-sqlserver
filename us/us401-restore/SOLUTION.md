## Solución Técnica

### 1. El rescate de rutas con la cláusula MOVE

Cuando se realiza una copia de seguridad (`BACKUP`), esta guarda dentro de su estructura interna los nombres lógicos de los ficheros (`Ventas` y `Ventas_log`) y las rutas físicas absolutas donde residían en el servidor de origen (`/var/opt/mssql/data/Ventas.mdf`).

Si ejecutas un `RESTORE DATABASE` en un nuevo servidor sin la cláusula `MOVE`, SQL Server intentará recrear los archivos exactamente en las mismas carpetas de origen. Si esas carpetas no existen o están ocupadas, la restauración fallará por completo. 
La cláusula `MOVE` es obligatoria en migraciones o recuperaciones en entornos limpios: le indica al motor que redirija el flujo físico de los datos lógicos hacia las nuevas rutas locales del servidor actual (ej. `TO N'/var/opt/mssql/data/Ventas.mdf'`).

### 2. La combinación final de STOPAT y RECOVERY

La ejecución del último paso (`RESTORE LOG`) combina dos acciones críticas:

* **`STOPAT = '2025-03-12T10:36:00'`**: Le ordena a SQL Server que reproduzca las transacciones del archivo de log de forma cronológica, pero que detenga el proceso de manera milimétrica exactamente un segundo antes de las 10:36:00 AM, evitando incorporar el error humano.

* **`RECOVERY`**: Es el paso final obligatorio. Al contrario que `NORECOVERY` (que deja la base de datos colgada y en modo `RESTORING`), la instrucción `RECOVERY` hace dos cosas: deshace las transacciones que se quedaron incompletas (rollback) y **sella la base de datos poniéndola Online** para que las aplicaciones y usuarios puedan volver a conectarse. Una vez aplicado `RECOVERY`, la cadena de restauración se cierra y ya no se pueden aplicar más logs encima.

### 3. El propósito de la opción STANDBY

El modo **`STANDBY`** es una alternativa intermedia muy potente al clásico `NORECOVERY`. 
Se utiliza principalmente cuando estás aplicando una cadena larga de logs (por ejemplo, en migraciones grandes o entornos de auditoría/reporting) y necesitas **consultar (hacer SELECT)** la base de datos entre restauración y restauración para verificar que los datos son correctos. 
Funciona dejando la base de datos en un estado de solo lectura interactiva, apoyándose en un fichero auxiliar de deshacer (*undo file*) que permite seguir aplicando el siguiente backup de log cuando sea necesario.