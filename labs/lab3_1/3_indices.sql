-- 1. Crear el índice no agrupado inicial
CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha
ON dbo.Pedido (ClienteId, FechaPedido);

-- 2. Modificarlo para convertirlo en un Índice Covering (Añadiendo INCLUDE)
-- reutilizando el mismo nombre gracias a WITH (DROP_EXISTING = ON)
CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha
ON dbo.Pedido (ClienteId, FechaPedido)
INCLUDE (Total)
WITH (DROP_EXISTING = ON);
