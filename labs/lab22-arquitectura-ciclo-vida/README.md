## Introducción

Sí, es absolutamente correcto y, de hecho, es el término técnicamente más preciso
T-SQL significa Transact-SQL y es la extensión propietaria de Microsoft del estándar universal ANSI SQL.
Mientras que el "SQL estándar" es un lenguaje puramente declarativo diseñado para interactuar con los datos (hacer SELECT, INSERT, UPDATE, DELETE), T-SQL le añade todas las características de un lenguaje de programación procedural y funcional.

Cuando escribes en SQL Server, casi siempre estás usando T-SQL. Estas son las capacidades clave que T-SQL añade al estándar:
- Control de flujo: Permite usar bloques lógicos como `IF... ELSE`, bucles `WHILE, BREAK y CONTINUE`.
- Variables locales: Te permite declarar y usar variables en la memoria temporal durante la ejecución, como los parámetros que empiezan por arroba (DECLARE `@FirmaCriptografica`).
- Manejo de excepciones: Introduce la captura estructurada de errores mediante bloques BEGIN TRY ... END TRY y BEGIN CATCH ... END CATCH.
- Procesamiento por lotes y transacciones avanzadas: Comandos como GO (que separa los lotes de ejecución en herramientas de Microsoft) y la gestión profunda de `BEGIN TRAN, COMMIT y ROLLBACK`.
- Funciones propietarias: Cosas específicas del ecosistema de Microsoft, como las funciones de sistema que acabas de usar (`sys.sp_generate_database_ledger_digest`) o los tipos de datos nativos exclusivos del motor.

De hecho, en los laboratorios que acabas de realizar, cuando escribiste `IF OBJECT_ID('dbo.BaseConocimiento', 'U') IS NOT NULL BEGIN... END` para limpiar las tablas de forma segura de forma condicional, estabas programando estrictamente en T-SQL, ya que el SQL puro no soporta esa lógica condicional de esa manera.

¿En qué capa se decide si una consulta usa un Index Seek o un Index Scan? ¿Y quién lo ejecuta?

La decisión la toma el Optimizador de Consultas (Query Optimizer) en la capa lógica del Motor Relacional, y la ejecución física la lleva a cabo el Motor de Almacenamiento (Storage Engine).
Esta separación de responsabilidades es la base de la arquitectura cliente-servidor interna de SQL Server:

1. La Decisión: El Optimizador de Consultas (Motor Relacional)
    Cuando envías una consulta T-SQL, el motor no la ejecuta inmediatamente. Primero pasa por un analizador sintáctico y luego llega al Optimizador de Consultas. Este componente es el "cerebro" matemático del motor y funciona basándose en costes (Cost-Based Optimizer).
    Su trabajo no es encontrar el plan absolutamente perfecto, sino encontrar el plan "suficientemente bueno" en el menor tiempo posible. Para decidir entre un Seek o un Scan, analiza las Estadísticas de la base de datos (histogramas que le dicen cómo están distribuidos los datos en la tabla) y evalúa el "Punto de Inflexión" (Tipping Point):
    - Index Seek: Si las estadísticas le indican que tu cláusula WHERE es muy selectiva (por ejemplo, vas a recuperar solo el 1% o menos de las filas), el optimizador decidirá navegar por la estructura de árbol B (B-Tree) del índice saltando directamente a la página de datos que contiene tu registro.
    - Index Scan: Si le pides demasiados datos (ej. el 30% de la tabla), el optimizador sabe que hacer miles de búsquedas puntuales (Seeks) a través de la estructura del árbol será más lento que simplemente leer todas las páginas de disco secuencialmente desde el principio hasta el final. En ese caso, decide hacer un Scan, incluso si existe un índice.

    Una vez tomada la decisión, el Optimizador compila un Plan de Ejecución (Execution Plan) y lo guarda en la memoria caché para reutilizarlo en el futuro.

2. La Ejecución: Métodos de Acceso (Motor de Almacenamiento)
    Una vez que el plan de ejecución está listo, el Motor Relacional le pasa las instrucciones al Ejecutor de Consultas, que a su vez se comunica con la capa inferior: el Motor de Almacenamiento (Storage Engine).
    Dentro del Motor de Almacenamiento, existe un componente específico llamado Métodos de Acceso (Access Methods). Este componente no sabe nada de T-SQL, ni de lógica condicional; solo sabe cómo abrir archivos, recorrer estructuras B-Tree y pedirle páginas de datos de 8 KB al gestor de memoria (Buffer Pool).
    - Si el plan dicta un Index Seek, los Métodos de Acceso piden la página raíz del índice, leen los punteros, piden las páginas intermedias correspondientes y caen directamente en la página hoja exacta donde residen tus datos.
    - Si el plan dicta un Index Scan, los Métodos de Acceso piden la primera página de la estructura y utilizan unos punteros llamados "forward pointers" para leer secuencialmente página tras página hasta terminar.
    Impacto en el código: Cuando hay discrepancias de tipos de datos en la aplicación (como el ejemplo de pasar un parámetro Unicode NVARCHAR a una columna VARCHAR que vimos antes), el Optimizador de Consultas se confunde, no puede usar las estadísticas correctamente y, por seguridad, le ordenará al Motor de Almacenamiento que haga un Index Scan completo, matando el rendimiento de la consulta.

¿Quieres ver cómo comprobar las estadísticas?

Las estadísticas son objetos internos que contienen mapas matemáticos (histogramas y vectores de densidad) sobre la distribución de los datos en una columna o índice. Son la principal fuente de información del Optimizador de Consultas para calcular cuántas filas (cardinalidad) va a devolver tu instrucción.
Si las estadísticas están desactualizadas, el motor "piensa" que una tabla tiene 100 filas cuando en realidad tiene 10 millones, eligiendo un plan de ejecución desastroso.

Aquí tienes cómo auditar y actualizar estos mapas en tu entorno de desarrollo:

1. Inspeccionar el "Cerebro" del Optimizador (DBCC SHOW_STATISTICS)
    Para ver exactamente qué sabe SQL Server sobre los datos de una tabla, puedes usar el comando DBCC SHOW_STATISTICS.
    Supongamos que le has creado un índice a la columna Titular de tu tabla SaldosBancarios:

    ```sql
    USE training;
    GO
    -- Sintaxis: DBCC SHOW_STATISTICS ('NombreTabla', 'NombreIndice_o_Columna');
    DBCC SHOW_STATISTICS ('dbo.SaldosBancarios', 'Titular');
    GO
    ```

    Al ejecutarlo, SQL Server te devolverá tres tablas de resultados que muestran sus cálculos internos:
    1. Encabezado (Header): Cuándo se actualizaron por última vez y cuántas filas se usaron para calcular el muestreo.
    2. Vector de Densidad (Density Vector): Una fórmula matemática que mide qué tan únicos son los valores (para saber si vale la pena usar el índice).
    3. Histograma (Histogram): El desglose físico de los datos.

    El límite de los 200 pasos: Sin importar si tu tabla tiene mil filas o mil millones, SQL Server comprimirá la distribución de los datos en un máximo de 200 pasos (steps) en el histograma. Cada paso indica cuántos registros exactos coinciden con un valor límite (EQ_ROWS) y cuántos hay entre un paso y el siguiente (RANGE_ROWS).

2. Actualizar las Estadísticas (UPDATE STATISTICS)
    Por defecto, SQL Server actualiza las estadísticas automáticamente cuando modificas aproximadamente el 20% de los datos de una tabla. Sin embargo, en tablas enormes (o después de una carga masiva de datos como un BULK INSERT), es vital forzar la actualización para limpiar el caché del optimizador.
    Actualización estándar (Muestreo rápido): Lee solo una fracción aleatoria de las páginas de datos para recalcular el mapa matemátio rápidamente sin bloquear el servidor.

    ```sql
    UPDATE STATISTICS dbo.SaldosBancarios;
    GO
    ```

    Actualización exhaustiva (Full Scan): Obliga al motor a leer literalmente todas las filas para generar un mapa matemático perfecto. Es costoso en tiempo de CPU e I/O de disco, pero vital para consultas críticas que están rindiendo mal.

    ```sql
    UPDATE STATISTICS dbo.SaldosBancarios WITH FULLSCAN;
    GO
    ```

    Si el servidor sufre esperas PAGEIOLATCH_SH, ¿qué capas están implicadas? 

    El evento de espera PAGEIOLATCH_SH es uno de los diagnósticos de rendimiento más importantes en SQL Server. Implica un cuello de botella en la comunicación entre el Motor de Almacenamiento (Storage Engine), el Sistema Operativo y el Hardware de Discos.
    Para entender las capas implicadas, primero hay que diseccionar el nombre del evento. Un Latch (pestillo) es diferente a un Lock (bloqueo transaccional). Los bloqueos protegen la lógica de negocio; los latches protegen las estructuras físicas de la memoria RAM para que dos hilos no sobrescriban el mismo byte al mismo tiempo:

    - PAGE: Se refiere a una página de datos de 8 KB.
    - IO: Input/Output físico. La página no está en la memoria RAM y hay que ir a buscarla al disco duro.
    - LATCH: El mecanismo de sincronización interno.
    - SH (Shared): Compartido. El hilo solo quiere leer los datos, no modificarlos (si fuera a modificarlos, sería EX - Exclusive).

    El viaje de la consulta a través de las capas
    Cuando ves que tu servidor acumula altos tiempos de espera en PAGEIOLATCH_SH, este es el flujo exacto que está ocurriendo entre las capas de la arquitectura:
    1. Métodos de Acceso (Access Methods - Motor de Almacenamiento): El ejecutor de consultas le pide al motor que lea una fila específica mediante un Index Seek o un Index Scan.
    2. Gestor de Memoria (Buffer Pool - RAM): Los Métodos de Acceso no pueden leer del disco directamente; solo pueden leer de la RAM. Así que le piden la página de 8 KB al Buffer Manager. El Buffer Manager busca en la RAM caché y se da cuenta de que la página no está allí (lo que se conoce como un Page Fault o Fallo de caché).
    3. Petición de Entrada/Salida (I/O Manager y Sistema Operativo): El Buffer Manager emite una petición de lectura asíncrona al Kernel de Windows/Ubuntu. En este milisegundo exacto, SQL Server suspende el hilo de tu consulta, le asigna el estado PAGEIOLATCH_SH y lo manda a dormir.
    4. Hardware Físico (Subsistema de Discos): La petición viaja por la controladora hasta el SSD, SAN o disco virtual. El disco localiza los 8 KB físicos y los devuelve por el bus de datos.
    5. Resolución (Vuelta al Buffer Pool): El sistema operativo avisa a SQL Server de que los datos ya están copiados en la RAM. El Buffer Manager retira el Latch, despierta al hilo de tu consulta, y esta por fin puede leer su dato.
    El diagnóstico real (El mito del disco lento)
    Cuando un administrador junior ve PAGEIOLATCH_SH, suele culpar inmediatamente a la infraestructura, afirmando que "los discos son lentos" (Hardware).
    
    Sin embargo, el 90% de las veces es un problema de la capa lógica (Motor Relacional), conectado directamente con lo que vimos de las estadísticas:
    - Si las estadísticas están desactualizadas, el Optimizador se confunde.
    - En lugar de hacer un Index Seek (que pediría solo 3 páginas de datos al disco), decide hacer un Index Scan sobre una tabla de 50 GB.
    - El Motor de Almacenamiento inunda el Buffer Pool pidiendo millones de páginas simultáneamente.
    - El disco físico se satura ante el aluvión de peticiones y los tiempos de respuesta se disparan, generando esperas PAGEIOLATCH_SH masivas.