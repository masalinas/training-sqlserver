## Introducción

Para cumplir con la premisa de la imagen de que "el operador recibe el correo cuando un job falla", el proceso en T-SQL se divide en dos partes: primero se crea el Operador (la persona o grupo que recibirá el correo) y luego se actualiza un Job existente para que le envíe una notificación en caso de error.

## Ejemplo

A continuación tienes el script T-SQL que automatiza esta configuración. Se utiliza el job creado anteriormente para el caso de FULL Backup, para que avise al operador configurado en caso de error.

```sql
USE msdb;
GO

-- ============================================================================
-- 1. CREACIÓN DEL OPERADOR
-- ============================================================================
-- Se crea un operador en el Agente SQL Server con su dirección de correo
EXEC sp_add_operator
    @name = N'Administrador_DBA',
    @enabled = 1,
    @email_address = N'dba@tuempresa.com',
    @description = N'Equipo de administradores de bases de datos.';
GO

-- ============================================================================
-- 2. VINCULAR EL OPERADOR A UN JOB PARA ALERTAS DE FALLO
-- ============================================================================
-- Actualizamos el Job de Backup que creamos anteriormente para que notifique al operador
EXEC sp_update_job
    @job_name = N'Backup FULL - Training',
    @notify_level_email = 2, -- 1 = Al tener éxito, 2 = Al fallar, 3 = Siempre
    @notify_email_operator_name = N'Administrador_DBA';
GO
```

**Puntos clave del script:**

- `sp_add_operator`: Este procedimiento registra el perfil de la persona o equipo de soporte en msdb. Puedes definir múltiples operadores para diferentes responsabilidades.
- `@notify_level_email = 2`: Este es el parámetro fundamental. Al establecerlo en 2, le indicas a SQL Server Agent que solo envíe el correo electrónico de alerta cuando el job falla. Si lo configuraras en 1, enviaría un correo cada vez que el backup termine correctamente (lo cual suele saturar la bandeja de entrada), y el 3 lo enviaría siempre.   - -
- `@notify_email_operator_name`: Asocia directamente el nombre del operador que acabamos de crear con el trabajo específico.
