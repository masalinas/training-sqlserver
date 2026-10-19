USE MiBaseDeDatos;
GO

-- Eliminar el procedimiento si ya existe para evitar errores de duplicado
CREATE OR ALTER PROCEDURE dbo.usp_TopPedidosCliente
    @ClienteId INT,
    @TopN      INT = 3 -- Por defecto mostrará el Top 3 si no se especifica
AS
BEGIN
    -- Habilitar SET NOCOUNT ON para mejorar rendimiento y evitar mensajes de filas afectadas
    SET NOCOUNT ON;

    -- Lógica analítica del script anterior encapsulada con los parámetros
    WITH PedidosNumeradosCTE AS (
        SELECT 
            c.ClienteId,
            c.Nombre AS ClienteNombre,
            p.PedidoId,
            p.Fecha AS PedidoFecha,
            p.Total AS PedidoTotal,
            
            -- Numeración analítica fila por fila del cliente
            ROW_NUMBER() OVER (
                PARTITION BY p.ClienteId 
                ORDER BY p.Total DESC, p.Fecha DESC
            ) AS FilaNumero,
            
            -- Suma analítica total del histórico
            SUM(p.Total) OVER (
                PARTITION BY p.ClienteId
            ) AS TotalHistoricoCliente
        FROM   
            dbo.Cliente AS c 
        INNER JOIN 
            dbo.Pedido AS p ON p.ClienteId = c.ClienteId
        WHERE
            c.ClienteId = @ClienteId -- Aplicación del parámetro de filtrado
    )
    SELECT 
        ClienteId,
        ClienteNombre,
        PedidoId,
        PedidoFecha,
        PedidoTotal,
        FilaNumero,
        TotalHistoricoCliente
    FROM 
        PedidosNumeradosCTE
    WHERE 
        FilaNumero <= @TopN -- Aplicación del parámetro dinámico del TOP
    ORDER BY 
        PedidoTotal DESC;
END;
GO