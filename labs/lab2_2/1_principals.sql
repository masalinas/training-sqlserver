/* =========================================================================
   PASO 1: Crear los dos Logins a nivel de Servidor (Master)
   Nota: Usaremos Autenticación de SQL Server con contraseñas seguras.
   ========================================================================= */
USE master;
GO

-- Crear el primer Login (destinado a la aplicación)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'LoginAppUser')
BEGIN
    CREATE LOGIN LoginAppUser WITH PASSWORD = 'ClaveSeguraApp2026!', CHECK_POLICY = OFF;
END;
GO

-- Crear el segundo Login (destinado a reportes)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'LoginRptUser')
BEGIN
    CREATE LOGIN LoginRptUser WITH PASSWORD = 'ClaveSeguraRpt2026!', CHECK_POLICY = OFF;
END;
GO


/* =========================================================================
   PASO 2: Crear sus correspondientes Usuarios dentro de la base de datos
   ========================================================================= */
USE Ventas; -- <--- Cambia esto por el nombre exacto de tu Base de Datos
GO

-- Crear el Usuario para la Aplicación enlazado a su Login
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'UserApp')
BEGIN
    CREATE USER UserApp FOR LOGIN LoginAppUser;
END;
GO

-- Crear el Usuario para Reportes enlazado a su Login
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'UserRpt')
BEGIN
    CREATE USER UserRpt FOR LOGIN LoginRptUser;
END;
GO


/* =========================================================================
   PASO 3: Crear los esquemas (Schemas) rpt y app
   Nota: Asignamos inmediatamente la propiedad de cada esquema a su 
         respectivo usuario para mantener el principio de mínimo privilegio.
   ========================================================================= */

-- Crear el esquema 'app' propiedad del usuario 'UserApp'
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'app')
BEGIN
    EXEC('CREATE SCHEMA app AUTHORIZATION UserApp;');
END;
GO

-- Crear el esquema 'rpt' propiedad del usuario 'UserRpt'
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'rpt')
BEGIN
    EXEC('CREATE SCHEMA rpt AUTHORIZATION UserRpt;');
END;
GO

PRINT '¡Logins, Usuarios y Esquemas (app y rpt) creados correctamente!';
GO
