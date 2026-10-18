## Introducción

Solo deberemos de hacer backup de las siguientes bases de datos del sistema: master. model y msdb.
Si estas bases de datos se corrompen o el disco falla y no tienes un backup, tu instancia de SQL Server no arrancará o perderás toda tu configuración:
- master: Almacena toda la información a nivel de configuración del servidor, los inicios de sesión (logins), la existencia y ubicación de todas las bases de datos de usuario y las configuraciones del sistema.
- msdb: Almacena toda la configuración del SQL Server Agent (los trabajos/jobs, alertas, planes de mantenimiento y el historial completo de los backups anteriores).
- model: Es la plantilla que utiliza SQL Server cada vez que creas una base de datos nueva. Si la modificas para incluir configuraciones corporativas personalizadas, necesitas respaldarla.


## Ejemplo

Antes de ejecutarlo en tu servidor, modifica la variable @RutaBase con la ruta de tu disco donde quieras almacenar los archivos .bak.


```sql
USE master;
GO

DECLARE @RutaBase NVARCHAR(255) = 'C:\Backups\SystemDBs\'; -- <-- MODIFICA ESTA RUTA
DECLARE @Fecha NVARCHAR(20) = FORMAT(GETDATE(), 'yyyyMMdd_HHmmss');
DECLARE @SQL NVARCHAR(MAX);

-- 1. BACKUP DE MASTER
SET @SQL = 'BACKUP DATABASE [master] 
            TO DISK = ''' + @RutaBase + 'master_Full_' + @Fecha + '.bak'' 
            WITH FORMAT, INIT, COMPRESSION, CHECKSUM, 
            NAME = ''Full Backup de Master - ' + @Fecha + ''';';
EXEC sp_executesql @SQL;

-- 2. BACKUP DE MODEL
SET @SQL = 'BACKUP DATABASE [model] 
            TO DISK = ''' + @RutaBase + 'model_Full_' + @Fecha + '.bak'' 
            WITH FORMAT, INIT, COMPRESSION, CHECKSUM, 
            NAME = ''Full Backup de Model - ' + @Fecha + ''';';
EXEC sp_executesql @SQL;

-- 3. BACKUP DE MSDB
SET @SQL = 'BACKUP DATABASE [msdb] 
            TO DISK = ''' + @RutaBase + 'msdb_Full_' + @Fecha + '.bak'' 
            WITH FORMAT, INIT, COMPRESSION, CHECKSUM, 
            NAME = ''Full Backup de MSDB - ' + @Fecha + ''';';
EXEC sp_executesql @SQL;
```