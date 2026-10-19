## Solución

1.  Preparar datos
    Para cumplir con lo que solicita la captura ("Genera 500 000 pedidos en la base de datos Ventas"), se necesita un script de Transact-SQL eficiente. Insertar medio millón de filas una por una con un bucle tradicional (WHILE) sería muy lento.
    La mejor práctica en SQL Server para generar volumen de datos rápidamente es utilizar una Common Table Expression (CTE) recursiva o una combinación cruzada (CROSS JOIN).\
    El siguiente script de T-SQL asume que tu tabla dbo.Pedido tiene una columna de identidad (Id autoincremental) y columnas básicas como fecha y total. Crea la base de datos (si no existe), la tabla y genera las 500,000 filas en pocos segundos:

    Ejecutar `1_preparacion.sql`

    ### ¿Por qué este método?

    - Rendimiento: Evita el uso de cursores o bucles WHILE que escriben fila por fila en el log de transacciones bloqueando recursos.
    - Aleatoriedad: Las funciones ABS(CHECKSUM(NEWID())) simulan datos reales variando los precios de los pedidos para que el laboratorio tenga un comportamiento más natural cuando hagas los backups.