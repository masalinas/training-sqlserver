USE training;
GO

CREATE TABLE dbo.Tarifas (
    TarifaID INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    Servicio NVARCHAR(100) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    
    -- Columnas obligatorias para el control de tiempo (gestionadas por el motor)
    SysStartTime DATETIME2 GENERATED ALWAYS AS ROW START HIDDEN NOT NULL,
    SysEndTime DATETIME2 GENERATED ALWAYS AS ROW END HIDDEN NOT NULL,
    PERIOD FOR SYSTEM_TIME (SysStartTime, SysEndTime)
)
WITH (
    -- Activar el versionamiento y nombrar explícitamente la tabla histórica
    SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.Tarifas_Historico)
);
GO

-- 1. Inserción inicial (Los datos van a la tabla principal)
INSERT INTO dbo.Tarifas (Servicio, Precio) 
VALUES ('Consultoría Arquitectura', 100.00), ('Soporte Técnico', 50.00);
GO

-- Esperamos un par de segundos para que se note la diferencia de tiempo en el historial
WAITFOR DELAY '00:00:02';

-- 2. Modificación de precios (El registro original de 100.00 viaja automáticamente al histórico)
UPDATE dbo.Tarifas 
SET Precio = 120.00 
WHERE Servicio = 'Consultoría Arquitectura';
GO

WAITFOR DELAY '00:00:02';

-- 3. Borrado (El registro de Soporte Técnico desaparece de la principal, pero se guarda en el histórico)
DELETE FROM dbo.Tarifas 
WHERE Servicio = 'Soporte Técnico';
GO

-- A. Ver los datos ACTUALES (solo mostrará Consultoría a 120.00)
SELECT * FROM dbo.Tarifas;

-- B. Ver TODO el historial de cambios (incluye los datos actuales y los pasados)
SELECT 
    TarifaID, 
    Servicio, 
    Precio, 
    SysStartTime, 
    SysEndTime 
FROM dbo.Tarifas
FOR SYSTEM_TIME ALL
ORDER BY TarifaID, SysStartTime;

-- C. Ver cómo estaba la tabla en una fecha y hora EXACTA del pasado
-- (Reemplaza la fecha por una válida dentro de tu prueba)
/*
SELECT * FROM dbo.Tarifas
FOR SYSTEM_TIME AS OF '2026-10-06 15:00:00.0000000';
*/

-- 1. Desvincular la tabla principal de la histórica
ALTER TABLE dbo.Tarifas SET (SYSTEM_VERSIONING = OFF);
GO

-- 2. Ahora ya puedes borrar ambas tablas físicamente
DROP TABLE dbo.Tarifas;
DROP TABLE dbo.Tarifas_Historico;
GO