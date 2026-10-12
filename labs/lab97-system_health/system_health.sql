USE master;
GO

SELECT 
    CAST(xet.target_data AS XML) AS [Datos_System_Health]
FROM sys.dm_xe_session_targets xet
JOIN sys.dm_xe_sessions xe ON xe.address = xet.event_session_address
WHERE xe.name = 'system_health' 
  AND xet.target_name = 'ring_buffer';