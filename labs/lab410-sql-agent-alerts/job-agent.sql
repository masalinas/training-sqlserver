USE msdb;
GO

-- ============================================================================
-- 1. ALERTAS POR NIVEL DE GRAVEDAD (Ejemplo para Gravedad 19)
-- Se debe repetir este bloque cambiando el @severity de 19 a 25.
-- ============================================================================
EXEC sp_add_alert
    @name = N'Alerta Severidad 19 - Error fatal en recurso',
    @message_id = 0,            -- 0 indica que la alerta reacciona a la gravedad, no a un error concreto
    @severity = 19,             -- Nivel de gravedad (19 a 25 son errores de hardware/sistema)
    @enabled = 1,
    @delay_between_responses = 60; -- Evita la saturación de correos limitando el envío a 1 por minuto

EXEC sp_add_notification
    @alert_name = N'Alerta Severidad 19 - Error fatal en recurso',
    @operator_name = N'Administrador_DBA',
    @notification_method = 1;   -- 1 = Notificación por Correo Electrónico
GO

-- ============================================================================
-- 2. ALERTAS POR NÚMERO DE ERROR ESPECÍFICO (Ejemplo para Error 824)
-- Se debe repetir este bloque para los errores 823, 825 y 9002.
-- ============================================================================
-- El error 824 indica una corrupción lógica en la lectura/escritura de disco (I/O)
EXEC sp_add_alert
    @name = N'Alerta Error 824 - Corrupcion logica de I/O',
    @message_id = 824,          -- ID exacto del error que disparará la alerta
    @severity = 0,              -- 0 porque estamos filtrando por message_id
    @enabled = 1,
    @delay_between_responses = 60;

EXEC sp_add_notification
    @alert_name = N'Alerta Error 824 - Corrupcion logica de I/O',
    @operator_name = N'Administrador_DBA',
    @notification_method = 1;
GO
