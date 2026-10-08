-- A. Simulamos una consulta lenta en nuestra base de datos
USE training;
GO
WAITFOR DELAY '00:00:02'; 
SELECT 'Esta consulta tardó mucho y fue capturada';
GO

-- B. Leemos la telemetría capturada directamente desde la memoria
-- (SQL Server guarda estos datos en formato XML)
SELECT 
    CAST(target_data AS XML) AS Datos_Capturados_XML
FROM sys.dm_xe_session_targets AS t
INNER JOIN sys.dm_xe_sessions AS s ON t.event_session_address = s.address
WHERE s.name = 'Radar_Consultas_Lentas';
GO