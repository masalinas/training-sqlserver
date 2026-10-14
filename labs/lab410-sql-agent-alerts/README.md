## Introducción

Este script T-SQL automatiza la creación de alertas en el Agente de SQL Server basándose en las recomendaciones de la imagen anterior (Gravedades 19-25 y errores 823, 824, 825 y 9002), y las vincula al operador Administrador_DBA antes creado, para que reciba la notificación por correo electrónico.

## Ejemplo

```sql
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
```

Parámetros clave del script:

- `@severity vs @message_id`: SQL Server permite disparar alertas de dos formas. Si usas @severity, la alerta saltará con cualquier error del sistema que alcance ese nivel crítico (por ejemplo, del 19 al 25 indican problemas severos del motor, memoria o hardware). Si usas @message_id, la alerta vigila un código de error exacto (como el 9002, que indica que el log de transacciones está lleno).
- `@delay_between_responses`: Es un mecanismo de seguridad fundamental. Si un disco falla y genera cientos de errores 824 por segundo, este parámetro garantiza que el operador reciba un solo correo cada 60 segundos, evitando el colapso del servidor de correo corporativo.
- `sp_add_notification`: Es el procedimiento puente que conecta la alerta recién creada con el operador, indicando mediante @notification_method = 1 que la vía de comunicación será Database Mail.
