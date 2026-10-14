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
