CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha
ON dbo.Pedido (ClienteId, FechaPedido);

-- Lookup: añade INCLUDE y recrea
CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha
ON dbo.Pedido (ClienteId, FechaPedido)
INCLUDE (Total)
WITH (DROP_EXISTING = ON);