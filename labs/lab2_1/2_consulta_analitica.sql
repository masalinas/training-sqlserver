USE MiBaseDeDatos;
GO

-- CONSULTA ANALÍTICA: Top 3 pedidos por cliente con ROW_NUMBER y SUM OVER
WITH PedidosNumeradosCTE AS (
    SELECT 
        c.ClienteId,
        c.Nombre AS ClienteNombre,
        p.PedidoId,
        p.Fecha AS PedidoFecha,
        p.Total AS PedidoTotal,
        
        -- 1. Numerar los pedidos de cada cliente del más caro al más barato
        ROW_NUMBER() OVER (
            PARTITION BY p.ClienteId 
            ORDER BY p.Total DESC, p.Fecha DESC
        ) AS FilaNumero,
        
        -- 2. Suma total acumulada de todos los pedidos históricos del cliente
        SUM(p.Total) OVER (
            PARTITION BY p.ClienteId
        ) AS TotalHistoricoCliente
    FROM   
        dbo.Cliente AS c 
    INNER JOIN 
        dbo.Pedido AS p ON p.ClienteId = c.ClienteId
)
-- Filtrar únicamente el Top 3 de cada cliente usando el resultado de la CTE
SELECT 
    ClienteId,
    ClienteNombre,
    PedidoId,
    PedidoFecha,
    PedidoTotal,
    FilaNumero, -- Indicará 1, 2 o 3
    TotalHistoricoCliente
FROM 
    PedidosNumeradosCTE
WHERE 
    FilaNumero <= 3
ORDER BY 
    ClienteId ASC, 
    PedidoTotal DESC;
GO