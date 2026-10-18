## Solución Técnica

### 1. El mito de la vista estándar (Expansión de consulta)

El principal error del desarrollador es pensar que una vista estándar guarda información. Como indica la diapositiva, una vista estándar **no tiene datos propios**; es simplemente una consulta guardada (una macro de código). 

Cada vez que el panel de BI consulta la vista cada 5 minutos, SQL Server **expande la vista** y ejecuta el `JOIN` y la agregación (`SUM`) contra los 50 millones de registros reales una y otra vez. El coste de leer la vista es exactamente el mismo que el de ejecutar la consulta subyacente desde cero, disparando el consumo de CPU.

### 2. La solución: Vistas Indexadas y SCHEMABINDING

Para solucionar la lectura repetitiva, se puede crear un Índice Agrupado (Clustered Index) sobre la vista. Esto la convierte en una **Vista Indexada**, lo que significa que el resultado de la suma ya no es virtual, sino que se calcula una vez y se **materializa** (se guarda físicamente en el disco). 

Para poder indexar una vista, SQL Server exige añadir la cláusula `WITH SCHEMABINDING` al crearla. Esto "ata" la vista a las tablas base, impidiendo que alguien pueda borrar o alterar columnas de la tabla `Cliente` o `Pedido` que rompan el índice de la vista. Sin esto, el motor no puede garantizar la consistencia física de los datos materializados.

### 3. El peligro oculto: La penalización de escrituras

Como DBA, debes advertir del tremendo impacto (trade-off) de esta acción. La diapositiva es clara: una vista indexada **penaliza las escrituras**.

Al materializar los datos, el motor de SQL Server asume el trabajo de mantener ese índice sincronizado. A partir de ese momento, cada vez que entre una nueva venta (un `INSERT` en la tabla `Pedido`), SQL Server no solo tiene que escribir en la tabla base, sino que también tiene que actualizar en tiempo real el valor materializado en la vista indexada. 

En un sistema transaccional (OLTP) de supermercados con miles de ventas por minuto, esta sobrecarga continua de mantenimiento (escribir en múltiples sitios a la vez) podría ralentizar los terminales de punto de venta (cajas registradoras) hasta bloquearlos. La vista indexada acelera enormemente las lecturas repetitivas (BI), pero a costa de castigar las inserciones, actualizaciones y borrados diarios.