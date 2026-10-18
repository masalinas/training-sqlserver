## Solución Técnica

### 1. Las violaciones del Mínimo Privilegio

El entorno actual incumple las reglas básicas de seguridad detalladas en la diapositiva:

*   **Error 1: Cuenta de aplicación = administración.** La aplicación web NUNCA debe usar la cuenta `sa`. El usuario `sa` tiene permisos absolutos (sysadmin) para borrar bases de datos o apagar el servidor. Se debe crear un usuario específico con permisos mínimos solo para las tablas que la app necesita tocar. Además, la cuenta `sa` original debería ser renombrada o deshabilitada.
*   **Error 2: Permisos a usuarios sueltos.** Dar permisos individualmente a "Pedro" y "María" es insostenible y propenso a errores cuando la empresa crece o la gente se va. La buena práctica dicta que los permisos se otorgan a **Roles** (ej. crear un `db_datareader`), y luego los usuarios se meten dentro de ese rol. Además, en lugar de dar permisos tabla a tabla, es mejor hacer un `GRANT` a nivel de esquema (`GRANT SELECT ON SCHEMA::dbo TO rol_desarrollo`).

### 2. Análisis del script de Auditoría (SQL Server Audit)

El script T-SQL implementa un sistema de vigilancia nativo, asíncrono y de muy bajo impacto:

1.  `CREATE SERVER AUDIT`: Crea el contenedor físico de la auditoría y le dice dónde guardar los datos. El formato de ruta de Linux (`/var/opt/mssql/...`) delata que este SQL Server se está ejecutando sobre Linux/Docker, no sobre Windows (donde sería `C:\Auditorias\`, por ejemplo).
2.  `CREATE SERVER AUDIT SPECIFICATION`: Le dice al motor **qué** queremos vigilar exactamente. Al añadir el grupo `FAILED_LOGIN_GROUP`, SQL Server registrará automáticamente cualquier intento fallido de conexión por contraseña incorrecta.
3.  `ALTER SERVER AUDIT... WITH (STATE = ON)`: Enciende la grabadora. Sin esto, la auditoría existe pero está pausada.

### 3. Lectura forense del rastro digital

Los archivos de SQL Server Audit están en formato binario (`.sqlaudit`) para evitar que un atacante los modifique con un bloc de notas. Para poder leerlos y analizarlos a la mañana siguiente, no podemos abrir el archivo físico directamente.

Como indica el tip inferior de la diapositiva, debemos ejecutar una consulta T-SQL utilizando la función de sistema especializada:

```sql
SELECT * 
FROM sys.fn_get_audit_file('/var/opt/mssql/audit/*.sqlaudit', default, default);
```

Esta función desencriptará y leerá el archivo binario, devolviéndonos una tabla perfectamente formateada donde podremos ver la IP del atacante, la hora exacta y el usuario que intentó adivinar.