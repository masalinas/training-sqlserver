## Solución

1.  Preparar datos

    Lo que necesitas es una Consulta analítica avanzada que resuelva un problema clásico de ordenamiento: obtener los Top 3 pedidos con mayor importe por cada cliente, incluyendo además la función ROW_NUMBER() para numerarlos y una ventana acumulativa/totalizadora con SUM(...) OVER(). \
    Dado que las funciones de ventana (Window Functions) como ROW_NUMBER() no se pueden filtrar directamente en la cláusula WHERE en una misma consulta, la mejor práctica en T-SQL es envolver la lógica en una CTE (Common Table Expression).

    Ejecutar `1_preparacion.sql`

    Notarás que los dos primeros clientes se llevan aproximadamente el 80% de todo el volumen de la tabla, recreando un escenario de datos sesgados perfecto para analizar cómo reacciona el optimizador de consultas de SQL Server.

2.  Consulta analitica

    Dado que las funciones de ventana (Window Functions) como ROW_NUMBER() no se pueden filtrar directamente en la cláusula WHERE en una misma consulta, la mejor práctica en T-SQL es envolver la lógica en una CTE (Common Table Expression).

    Ejecutar `2_consulta_analitica.sql`

    ### Explicación técnica de la magia del script:
    
    - PARTITION BY p.ClienteId: Divide el cálculo para que el motor reinicie el contador y la suma cada vez que cambia de cliente.
    - ROW_NUMBER() ... ORDER BY p.Total DESC: Le asigna el número 1 al pedido de mayor importe de cada cliente, el 2 al segundo más caro, y así sucesivamente.
    - SUM(p.Total) OVER(...): Calcula de forma analítica cuánto ha gastado ese cliente en total en toda la base de datos (los 50,000 registros). Al no añadirle un orden interno a esta ventana, saca la suma global fija por cliente, permitiéndote comparar el valor de los mejores pedidos individuales contra su volumen histórico de compras sin necesidad de duplicar subconsultas lentas o pesados GROUP BY.

3. Procedimiento

    Para hacerlo dinámico y profesional, añadiremos dos parámetros de entrada: uno para filtrar por un ClienteId específico (aprovechando nuestro histórico sesgado) y otro parametrizado para elegir el TopN de registros a devolver de forma dinámica.

    Ejecutar `3_procedimiento.sql`

    ### ¿Cómo se ejecuta y prueba este procedimiento?

    Una vez creado, puedes llamarlo usando el comando EXEC pasando los parámetros requeridos:

    - Prueba 1: Obtener el Top 3 por defecto del Cliente Mayorista (Id = 1)**

        ```sql
        sql
        EXEC dbo.usp_TopPedidosCliente @ClienteId = 1;
        ```

    - Prueba 2: Cambiar dinámicamente al Top 5 para un Cliente específico (Id = 2)**

        ```sql
        sql
        EXEC dbo.usp_TopPedidosCliente @ClienteId = 2, @TopN = 5;
        ```

4. Plan y Sniffing

    Cuando ejecutas un procedimiento almacenado por primera vez, SQL Server "olfatea" el parámetro que le pasas (en este caso, el ClienteId), revisa las estadísticas de la tabla y genera un Plan de Ejecución optimizado para ese volumen de datos. El problema surge con nuestros datos sesgados: el plan ideal para el Cliente 1 (que tiene el 40% de los datos) es pésimo para el Cliente 5 (que solo tiene unas pocas filas), y viceversa.\
    Para reproducir y comparar lo que pide la captura usando Ctrl+M (Incluir plan de ejecución real en SSMS), debemos forzar a SQL Server a limpiar su memoria caché entre ejecuciones para ver cómo cambian los planes.

    Ejecutar `4_plan_sniffing.sql`


    ### ¿Qué debes comparar en la pestaña del Plan de Ejecución (Ctrl+M)?

    Al ejecutar los dos bloques de código simultáneamente, verás dos gráficos de planes en la parte inferior de SQL Server Management Studio. Compara lo siguiente debido al efecto del sniffing:

    ***¿Qué debes comparar en la pestaña del Plan de Ejecución (Ctrl+M)?**

    Al ejecutar el procedimiento almacenado con ambos clientes, SQL Server generará estrategias distintas en la pestaña del plan real de ejecución debido al comportamiento de los datos sesgados:

    | Elemento en el Plan | Ejecución con `@ClienteId = 1` (Mayorista) | Ejecución con `@ClienteId = 5` (Común) |
    | :--- | :--- | :--- |
    | **Operador en la tabla `Pedido`** | Mostrará un **Clustered Index Scan** o un **Index Scan** completo (lee toda la tabla porque sabe que el Cliente 1 acumula demasiadas filas). | Mostrará un **Index Seek** eficiente (va directo al índice específico `IX_Pedido_ClienteId` porque sabe que son pocas filas). |
    | **Operador de combinación (*Join*)** | Suele optar por un **Hash Match** o **Merge Join** (óptimo para procesar grandes volúmenes de datos). | Optará por un **Nested Loops** (bucles anidados, perfecto para combinar un volumen bajo de registros). |
    | **Grosor de las flechas** | Las líneas de flujo de datos serán **muy gruesas**, indicando gráficamente el paso de miles de registros. | Las líneas serán **delgadas e hilos finos**, indicando que fluyen muy pocos registros por los operadores. |

    Si ejecutas el procedimiento para el Cliente 5 sin limpiar la caché justo después de haber ejecutado el Cliente 1, verás el verdadero problema del Parameter Sniffing: el Cliente 5 heredará el plan lento de Scan del Cliente 1, tardando más de lo debido.
