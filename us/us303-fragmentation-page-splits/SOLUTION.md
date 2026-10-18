## Solución Técnica

### 1. El problema de los GUID y los Page Splits

Como indica la diapositiva, un **Page Split** ocurre cuando SQL Server necesita insertar un dato nuevo en una página de memoria (de 8 KB) que ya está completamente llena. 
Al usar claves aleatorias como los GUID, los nuevos clientes no se insertan ordenadamente al final de la tabla, sino que el motor tiene que meterlos "a la fuerza" en medio de las páginas existentes. Al no haber hueco, SQL Server se ve obligado a partir la página llena en dos, moviendo la mitad de los datos a una nueva página física. 

Esto tiene un doble impacto catastrófico:
*   Deja las páginas a medias (desperdiciando RAM y disco).
*   Genera un **log extra** masivo, porque el motor tiene que registrar cada movimiento físico de datos para mantener el protocolo ACID, saturando el archivo `.ldf`.

### 2. El plan de acción (REBUILD vs REORGANIZE)

Aplicando las reglas de la tabla de la diapositiva:
*   Para el `PK_Cliente_GUID` (45% de fragmentación), al ser mayor del 30%, la acción obligatoria es un **REBUILD** (Reconstrucción). Este proceso crea el índice desde cero de forma contigua.
*   Para el `IX_Pedido_Fecha` (18% de fragmentación), al estar en el rango de 5-30%, la acción adecuada es un **REORGANIZE** (Reorganización). Es un proceso mucho más ligero que simplemente reordena las páginas existentes sin bloquear la tabla a nivel extremo.

### 3. La solución preventiva: FILLFACTOR (Factor de relleno)

Para evitar que el índice de clientes vuelva a fragmentarse mañana mismo, aplicamos el `FILLFACTOR = 90` durante el REBUILD. 
Esto le indica a SQL Server que, al reconstruir el índice, **deje un 10% de espacio vacío (un colchón)** en cada página de datos intencionadamente. De esta forma, cuando lleguen nuevos GUIDs aleatorios mañana, tendrán hueco libre para insertarse sin provocar un Page Split inmediato.

### 4. Ignorar las tablas diminutas (page_count > 1000)

El filtro `page_count > 1000` es una buena práctica crítica. Las tablas muy pequeñas (de unos pocos megabytes) siempre van a reportar niveles altos de fragmentación simplemente por cómo SQL Server reserva los bloques (extents) iniciales en el disco mixto. 
Desfragmentar tablas de menos de 1000 páginas es una pérdida de tiempo y recursos de CPU, ya que el motor las lee enteras en memoria instantáneamente de todos modos. Por eso las excluimos del análisis.