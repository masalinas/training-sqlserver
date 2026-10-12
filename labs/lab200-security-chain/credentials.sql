-- =========================================================================
-- 1. NIVEL INSTANCIA: Crear las credenciales de acceso al servidor (LOGIN)
-- =========================================================================
USE master;
GO
CREATE LOGIN JuanAnalista WITH PASSWORD = 'PasswordSeguro123!';
GO

-- =========================================================================
-- 2. NIVEL BASE DE DATOS: Entrar a la BD y crear el USUARIO asociado al Login
-- =========================================================================
CREATE DATABASE TiendaDemo;
GO
USE TiendaDemo;
GO
-- Mapeamos el Login global a un Usuario local dentro de esta base de datos
CREATE USER AnalistaVentas FOR LOGIN JuanAnalista;
GO

-- =========================================================================
-- 3. NIVEL ESQUEMA: Crear el contenedor lógico
-- =========================================================================
CREATE SCHEMA Comercial;
GO

-- =========================================================================
-- 4. NIVEL OBJETO: Crear las tablas físicas dentro del esquema Comercial
-- =========================================================================
CREATE TABLE Comercial.Facturas (
    FacturaID INT PRIMARY KEY IDENTITY(1,1),
    Fecha DATE,
    Monto DECIMAL(10,2)
);

CREATE TABLE Comercial.Clientes (
    ClienteID INT PRIMARY KEY IDENTITY(1,1),
    Nombre VARCHAR(100)
);
GO

-- =========================================================================
-- APLICAR SEGURIDAD A TRAVÉS DE LA RELACIÓN EN CADENA
-- =========================================================================
-- En lugar de darle permisos tabla por tabla, le damos control sobre todo el ESQUEMA.
-- El usuario 'AnalistaVentas' heredará automáticamente este permiso en todos los objetos de 'Comercial'
GRANT SELECT, INSERT ON SCHEMA::Comercial TO AnalistaVentas;
GO
