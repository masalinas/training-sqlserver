## Introducción

Una de las reglas de oro más importantes en la arquitectura y buenas prácticas de SQL Server: aislar los datos de los usuarios de los objetos del núcleo del sistema.

```sql
ALTER DATABASE Ventas MODIFY FILEGROUP FG_DATOS DEFAULT;
GO
```

Al ejecutarlo, le estás diciendo al motor que, a partir de ese momento, cualquier tabla o índice nuevo que se cree sin especificar explícitamente su ubicación física se guardará automáticamente en el grupo de archivos FG_DATOS.

**El comportamiento bajo el capó**

- Antes de ejecutar el comando: Cuando creas la base de datos Ventas, el Filegroup predeterminado de fábrica es siempre el PRIMARY. Este grupo contiene el archivo físico principal (.mdf) y, lo que es más crítico, todas las tablas internas de catálogo que el motor necesita para que la base de datos funcione y arranque. Si un desarrollador lanza un simple CREATE TABLE Pedido (Id INT);, el motor lo inyecta directamente en el PRIMARY.
- Después de ejecutar el comando: El Filegroup PRIMARY queda relegado exclusivamente para las funciones del sistema. Cuando el desarrollador lance ese mismo CREATE TABLE, SQL Server dirigirá físicamente esos datos a los archivos secundarios (.ndf) que hayas asignado a FG_DATOS.

**¿Por qué es un concepto clave para enseñar a tus alumnos?**

Cambiar el Filegroup por defecto a uno de usuario (como FG_DATOS) no es un capricho, es una estrategia de supervivencia que aporta tres beneficios críticos a un DBA:

- Prevención de caídas totales (El síndrome del disco lleno): Si un proceso nocturno se descontrola o un usuario inserta millones de registros hasta llenar por completo el volumen de almacenamiento de FG_DATOS, las tablas de los usuarios dejarán de admitir inserciones, pero el Filegroup PRIMARY seguirá intacto y con espacio libre. Esto garantiza que la base de datos en sí no se corrompa y permite al administrador entrar al sistema para purgar datos o ampliar el disco. Si el PRIMARY se llena por culpa de una tabla de usuario, la base de datos entera colapsa y se pone en modo sospechoso.
- Optimización de hardware (I/O): Permite distribuir la carga de trabajo. Puedes dejar el `PRIMARY` en un disco de estado sólido del sistema operativo y colocar los archivos de `FG_DATOS` en volúmenes Docker conectados a cabinas de almacenamiento separadas, evitando cuellos de botella mecánicos.
- Recuperación quirúrgica (Piecemeal Restore): Si administras una base de datos de varios Terabytes, separar los datos en Filegroups te permite hacer copias de seguridad de archivos específicos. En caso de desastre, puedes restaurar primero el `PRIMARY` para que la base de datos se encienda casi de inmediato, y dejar que FG_DATOS se vaya restaurando en segundo plano (las partes restauradas se pueden usar mientras el resto sigue cargando).

Para que los desarrolladores puedan eludir esta nueva regla y mandar una tabla a otro sitio, tendrán que obligar al motor usando la cláusula ON al final de sus scripts:

```sql
-- Va automáticamente a FG_DATOS
CREATE TABLE dbo.Cliente (Id INT);

-- Va al disco de histórico porque se obliga explícitamente
CREATE TABLE dbo.Auditoria (Id INT) ON FG_HISTORICO;
```

Si un desarrollador "rebelde" decide forzar la máquina y escribe explícitamente CREATE TABLE ... ON [PRIMARY], la única forma que tiene el DBA de bloquear esa acción es creando un Trigger DDL (Data Definition Language).

Un Trigger DDL es un vigilante que intercepta comandos estructurales antes de que se consoliden en el disco. Puedes mostrarle este script a tus alumnos como una técnica avanzada de DBA para blindar el servidor

```sql
USE Ventas;
GO

-- Crear un vigilante a nivel de base de datos
CREATE TRIGGER trg_ProtegerPrimary
ON DATABASE
FOR CREATE_TABLE, CREATE_INDEX
AS
BEGIN
    -- Capturar el comando que el usuario intentó ejecutar
    DECLARE @Comando NVARCHAR(MAX);
    SET @Comando = EVENTDATA().value('(/EVENT_INSTANCE/TSQLCommand/CommandText)[1]','NVARCHAR(MAX)');

    -- Si el comando incluye explícitamente el envío al PRIMARY
    IF UPPER(@Comando) LIKE '%ON [[]PRIMARY]%' OR UPPER(@Comando) LIKE '%ON PRIMARY%'
    BEGIN
        -- Abortar la operación y mostrar un mensaje de error
        PRINT 'ALERTA DE ARQUITECTURA: Por políticas del DBA, está estrictamente prohibido crear objetos de usuario en el Filegroup PRIMARY.';
        ROLLBACK TRANSACTION;
    END
END;
GO
```
