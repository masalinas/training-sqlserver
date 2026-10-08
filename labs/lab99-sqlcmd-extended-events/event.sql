-- 1. Crear la Sesión de Eventos Extendidos a nivel de Servidor
CREATE EVENT SESSION [Radar_Consultas_Lentas] ON SERVER 
ADD EVENT sqlserver.sql_statement_completed
(
    -- ACCIÓN: Qué datos extra queremos capturar
    ACTION 
    (
        sqlserver.database_name, 
        sqlserver.client_app_name, 
        sqlserver.sql_text
    )
    -- PREDICADO: Cuál es el filtro (Duración en microsegundos > 1 segundo)
    WHERE (duration > 1000000)
)
-- DESTINO: Dónde lo guardamos (en la memoria RAM para no ensuciar el disco)
ADD TARGET package0.ring_buffer(SET max_memory=(2048));
GO

-- 2. Iniciar la sesión (La sesión se crea apagada por defecto)
ALTER EVENT SESSION [Radar_Consultas_Lentas] ON SERVER STATE = START;
GO