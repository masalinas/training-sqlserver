## Solución Técnica

### 1. El origen del Key Lookup

El índice que creó el junior (`IX_Pedido_Cliente`) solo contiene la columna `ClienteId` y un puntero oculto hacia la fila real. 
Cuando la consulta pide mostrar también `FechaPedido` y `Total` (en el `SELECT`), el motor busca en el índice y encuentra rápidamente los IDs de los pedidos. Sin embargo, como no tiene las fechas ni los totales allí, se ve obligado a usar el puntero para ir a buscar esos datos faltantes a la tabla real (al Índice Clustered). Ese viaje extra desde el índice a la tabla principal es el **Key Lookup**.

### 2. El coste de las lecturas aleatorias

Como indica la diapositiva, un Key Lookup equivale a **1 lectura aleatoria por fila**. 
Si el cliente tiene 1.000 pedidos, SQL Server hará la búsqueda inicial rapidísima, pero luego tendrá que dar 1.000 "saltos" aleatorios por el disco duro para recuperar la fecha y el total de cada fila individual. Las lecturas aleatorias son el proceso más lento que puede hacer un disco.

### 3. La magia del Covering Index (INCLUDE)

El segundo script añade `INCLUDE (FechaPedido, Total)`. Esto le dice a SQL Server: *"Crea el índice ordenado por ClienteId, pero en el nivel hoja (al final del árbol), guárdame también una copia de la Fecha y el Total"*.
Al hacer esto, el índice **"cubre" (Covering)** toda la consulta. Cuando SQL Server llega al índice buscando al cliente 4217, encuentra allí mismo la fecha y el total. Ya no necesita ir a la tabla principal, eliminando el 100% de los Key Lookups y transformando miles de lecturas aleatorias lentas en una sola lectura lógica rapidísima.

### 4. INCLUDE vs Columnas Clave

La sugerencia del desarrollador junior de meter todo en el `ON (...)` es ineficiente. 
Como indica la regla de la diapositiva: en la clave principal (`ON`) solo deben ir las columnas por las que **filtramos u ordenamos** (igualdad primero, rango después). 
Si metemos `FechaPedido` y `Total` en la clave, SQL Server gastará muchísima memoria y CPU intentando mantener el árbol B-Tree perfectamente ordenado alfabéticamente por esas columnas. Al ponerlas en el `INCLUDE`, simplemente las "adjunta" al final sin molestarse en ordenarlas, ahorrando recursos de mantenimiento cada vez que entra un nuevo pedido.