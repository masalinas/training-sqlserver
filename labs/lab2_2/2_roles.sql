USE Ventas; -- <--- Cambia esto por el nombre exacto de tu Base de Datos
GO

/* =========================================================================
   PASO 1: Crear y configurar el 'rol_lectura_rpt'
   Propósito: Permitir únicamente la lectura (SELECT) en el esquema 'rpt'.
   ========================================================================= */

-- 1. Crear el rol de base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'rol_lectura_rpt' AND type = 'R')
BEGIN
    CREATE ROLE rol_lectura_rpt;
END;
GO

-- 2. Conceder permiso de lectura exclusivo sobre todo el esquema 'rpt'
GRANT SELECT ON SCHEMA::rpt TO rol_lectura_rpt;
GO


/* =========================================================================
   PASO 2: Crear y configurar el 'rol_operador'
   Propósito: Permitir la ejecución (EXECUTE) de procedimientos/funciones en 'app'.
   ========================================================================= */

-- 1. Crear el rol de base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'rol_operador' AND type = 'R')
BEGIN
    CREATE ROLE rol_operador;
END;
GO

-- 2. Conceder permiso de ejecución exclusivo sobre todo el esquema 'app'
GRANT EXECUTE ON SCHEMA::app TO rol_operador;
GO


/* =========================================================================
   PASO 3: Asignar los usuarios previamente creados a sus respectivos roles
   ========================================================================= */

-- Añadir el usuario de reportes al rol de lectura
ALTER ROLE rol_lectura_rpt ADD MEMBER UserRpt;

-- Añadir el usuario de la aplicación al rol de operador
ALTER ROLE rol_operador ADD MEMBER UserApp;
GO

PRINT '¡Roles creados, permisos asignados a los esquemas y usuarios vinculados con éxito!';
GO
