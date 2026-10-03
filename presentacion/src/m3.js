'use strict';
/**
 * m3.js — MÓDULO 3 «Optimización y Alta Disponibilidad» (~6 h) · 18 diapositivas (nº 43–60).
 *  1 divider · 13 teoría · 3 laboratorio · 1 resumen.
 */
const C = (...lines) => lines.join('\n');

module.exports = async (pres, H, D) => {
  const { COL } = H;

  // ───────────────────────── 43 · Separador de módulo ─────────────────────────
  H.divider(pres, {
    mod: 3,
    title: 'Optimización y Alta Disponibilidad',
    subtitle: 'Índices, planes de ejecución, DMVs y fundamentos de HA/DR',
    hours: '6 h',
    topics: [
      { icon: 'FaProjectDiagram', text: 'Arquitectura de índices y B-Tree' },
      { icon: 'FaTools', text: 'Fragmentación y estadísticas' },
      { icon: 'FaSearch', text: 'Lectura de planes de ejecución' },
      { icon: 'FaTachometerAlt', text: 'Monitorización con DMVs' },
      { icon: 'FaShieldAlt', text: 'RTO, RPO y comparativa HA/DR' },
      { icon: 'FaFlask', text: 'Laboratorio 3' },
    ],
    notes: {
      obj: 'Situar al alumnado en el siguiente bloque del curso: pasar de "la base de datos funciona" a "la base de datos funciona rápido y no se cae". Se presenta el mapa del módulo y los resultados esperados.',
      guion: [
        'Este módulo dura unas 6 horas y se divide en tres bloques: (1) optimización a nivel de datos (índices, fragmentación y estadísticas), (2) diagnóstico (planes de ejecución y DMVs) y (3) continuidad de negocio (HA/DR).',
        'Mensaje clave: en rendimiento NO se adivina, se mide. Todo el módulo sigue el ciclo medir → hipótesis → cambio → volver a medir, usando STATISTICS IO/TIME, el plan real y las Dynamic Management Views (DMVs).',
        'Conectar con el Módulo 1: lo visto sobre páginas de 8 KB, extensiones y el Buffer Pool explica por qué un índice reduce lecturas lógicas; lo visto sobre el Transaction Log será la base de Log Shipping y Always On.',
        'Advertir de que la mayoría de problemas de rendimiento en producción se resuelven con un buen diseño de índices y estadísticas actualizadas, antes de tocar hardware o parámetros del servidor.',
        'En HA/DR veremos conceptos y comparativa; la configuración paso a paso de un Availability Group queda fuera del alcance del laboratorio, pero se deja claro qué pregunta de negocio responde cada tecnología.',
        'Entorno del laboratorio: SQL Server 2019/2022 en Docker o instancia local, base de datos Ventas (dbo.Cliente, dbo.Pedido, dbo.Producto) y SSMS. Verificar que todos pueden conectarse antes de empezar.',
      ],
      preguntas: [
        '¿Cuál ha sido la consulta más lenta que habéis sufrido en producción y cómo se averiguó la causa?',
        '¿Qué diferencia hay entre "alta disponibilidad" y "copia de seguridad"? Recogemos ideas y las contrastamos al final del módulo.',
      ],
    },
  });

  // ───────────────────────── 44 · Heap vs Clustered ─────────────────────────
  let s = H.slide(pres, {
    mod: 3,
    badge: 'Índices',
    title: 'Heap vs Clustered Index',
    notes: {
      obj: 'Comprender cómo SQL Server organiza físicamente una tabla (Heap o Clustered Index) y por qué esa decisión condiciona todos los demás índices y el coste de cada consulta.',
      guion: [
        'Una tabla sin Clustered Index es un Heap: las filas se guardan en páginas de 8 KB sin ningún orden lógico; el motor las localiza mediante las páginas IAM (Index Allocation Map). La única forma de leerlo entero es un Table Scan.',
        'Un Clustered Index ordena físicamente la tabla por la clave: el nivel hoja del B-Tree ES la tabla (data pages). Sólo puede haber uno por tabla. Al crear una PRIMARY KEY sin indicar otra cosa, SQL Server crea por defecto un Clustered Index único.',
        'Problema típico del Heap: los Forwarded Records. Si un UPDATE hace crecer una fila y no cabe en su página, la fila se mueve y deja un puntero de reenvío; cada lectura posterior cuesta una E/S adicional. Se detecta en sys.dm_db_index_physical_stats con forwarded_record_count (modo DETAILED).',
        'Un buen candidato a clave clustered es estrecho (menos bytes en todos los NCI, porque la clave clustered se copia en cada fila de cada índice no clustered), único (si no, SQL Server añade un uniquifier de 4 bytes), estático (cambiarla mueve la fila) y creciente (INT/BIGINT IDENTITY evita Page Splits en mitad del índice).',
        'Un GUID aleatorio (NEWID()) como clave clustered provoca Page Splits constantes y fragmentación; si hace falta un GUID, usar NEWSEQUENTIALID() o separar el GUID de la clave clustered.',
        'Cuándo un Heap sí tiene sentido: tablas de staging para cargas masivas (BULK INSERT, bcp) donde se escribe mucho y se lee una sola vez; incluso ahí conviene medir.',
        'Consulta útil para ver qué tiene cada tabla: SELECT OBJECT_NAME(object_id), type_desc FROM sys.indexes WHERE index_id IN (0,1); index_id 0 = Heap, 1 = Clustered.',
      ],
      preguntas: [
        '¿Qué le ocurre a una tabla con 20 índices no clustered si elegimos como clave clustered una columna NVARCHAR(200)?',
        'Si una tabla de auditoría sólo recibe INSERT y nunca se consulta por clave, ¿Heap o Clustered? Argumentad el coste de cada opción.',
      ],
    },
  });
  H.cardsRow(s, [
    {
      title: 'Heap (sin índice clustered)', icon: 'FaTable', tone: 'light', size: 14,
      bullets: [
        'Filas en páginas sin orden lógico (se localizan por IAM)',
        'Lectura completa = Table Scan; búsqueda por RID',
        'Forwarded Records tras UPDATE que hace crecer la fila',
        'Útil en staging y cargas masivas puntuales',
      ],
    },
    {
      title: 'Clustered Index', icon: 'FaSortAmountDown', tone: 'dark', size: 14,
      bullets: [
        'La hoja del B-Tree contiene las filas, ordenadas por la clave',
        'Sólo uno por tabla (la PRIMARY KEY lo crea por defecto)',
        'Clave ideal: estrecha, única, estática y creciente',
        'Sin Forwarded Records, pero con posibles Page Splits',
      ],
    },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 3.45, gap: 0.3 });
  H.callout(s, { x: 0.6, y: 5.5, w: 12.13, h: 1.25, kind: 'tip', size: 15, lead: 'Regla práctica:', text: 'en OLTP casi toda tabla debe tener un Clustered Index estrecho y creciente (por ejemplo INT IDENTITY). Cada columna de esa clave se copia en todos los índices no clustered.' });

  // ───────────────────────── 45 · B-Tree ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Índices',
    title: 'Estructura B-Tree de un índice',
    notes: {
      obj: 'Visualizar el B-Tree como estructura común de Clustered y Non-Clustered Index para entender por qué un Index Seek necesita pocas lecturas y qué contiene realmente el nivel hoja.',
      guion: [
        'Todos los índices rowstore se almacenan como B-Tree balanceado: una página raíz (Root), cero o más niveles intermedios y el nivel hoja (Leaf). Un Seek recorre raíz → intermedio → hoja: típicamente 3–4 lecturas lógicas incluso en tablas de millones de filas.',
        'Clustered Index (izquierda): las hojas SON las páginas de datos, con todas las columnas de la fila. Las páginas de una misma hoja se enlazan en una lista doblemente enlazada, lo que permite recorrer rangos en orden (ORDER BY, BETWEEN) sin volver a la raíz.',
        'Non-Clustered Index (derecha): la hoja guarda las columnas de la clave del índice (más las INCLUDE) y un localizador de fila: la clave del Clustered Index o, en un Heap, el RID (File:Page:Slot). Por eso hace falta un Key Lookup/RID Lookup para recuperar el resto de columnas.',
        'La profundidad del árbol crece logarítmicamente: con claves de 8 bytes caben unos 600 punteros por página intermedia; con 3 niveles se direccionan cientos de millones de filas. Claves anchas reducen el fan-out y aumentan la profundidad.',
        'Se puede inspeccionar con sys.dm_db_index_physical_stats (columna index_depth) y con DBCC IND/DBCC PAGE (no documentados oficialmente) para mostrar páginas reales en clase.',
        'Impacto de escritura: cada INSERT/UPDATE/DELETE debe mantener el Clustered Index y todos los NCI afectados; de ahí que "más índices" no sea gratis.',
      ],
      preguntas: [
        '¿Cuántas lecturas lógicas esperáis para un Seek por clave en una tabla de 100 millones de filas con clave INT? ¿Y para un Scan completo?',
        'Si el NCI guarda la clave clustered como puntero, ¿qué pasa con todos los NCI cuando cambiamos el valor de la clave clustered de una fila?',
      ],
    },
  });
  D.btreeDiagram(s, { x: 0.6, y: 1.75, w: 12.13, h: 5.0 });

  // ───────────────────────── 46 · NCI, Key Lookup, covering ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Índices',
    title: 'Non-Clustered, Key Lookup y covering',
    notes: {
      obj: 'Explicar el Key Lookup como el coste oculto de los Non-Clustered Index y enseñar cómo un índice covering con INCLUDE lo elimina.',
      guion: [
        'Un Non-Clustered Index (NCI) es una estructura adicional que apunta a las filas. Si la consulta pide columnas que no están en el índice, el motor hace un Key Lookup (en Heap, RID Lookup): por cada fila encontrada en el NCI hace una lectura aleatoria al Clustered Index.',
        'El plan típico es Index Seek (NCI) + Nested Loops + Key Lookup (Clustered). Con pocas filas es barato; con miles de filas el coste se multiplica y el optimizador puede preferir un Clustered Index Scan directamente (tipping point, normalmente cuando el Lookup afectaría a ~25–33 % de las páginas de la tabla).',
        'Un índice covering contiene todas las columnas que necesita la consulta, de modo que se resuelve sólo con el NCI. Con INCLUDE las columnas extra se guardan únicamente en el nivel hoja: no forman parte de la clave, no ordenan y no cuentan para el límite de clave (1700 bytes en NCI desde SQL Server 2016, 900 en clustered).',
        'Orden de columnas de la clave: primero las de igualdad (=), luego la de rango (>, <, BETWEEN) y al final las usadas sólo para ordenar. La selectividad importa, pero el patrón de acceso manda.',
        'Advertencia: cada columna INCLUDE aumenta el tamaño del índice y el coste de cada escritura. No se debe "cubrir" cualquier consulta; se cubre la consulta crítica y frecuente.',
        'WITH (DROP_EXISTING = ON) permite redefinir un índice en una sola operación, evitando reconstruir los NCI dos veces; ONLINE = ON requiere Enterprise Edition.',
      ],
      preguntas: [
        '¿Por qué un SELECT * rara vez puede ser cubierto por un índice? ¿Qué alternativa propondríais al desarrollador?',
        'Vemos un Key Lookup con 80 % del coste del plan: ¿añadimos INCLUDE siempre? ¿Qué comprobaríais antes (nº de filas, columnas, frecuencia)?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.2, h: 3.95, size: 13, label: 'T-SQL · CREAR ÍNDICES',
    code: C(
      '-- Consulta frecuente',
      'SELECT PedidoId, FechaPedido, Total',
      'FROM dbo.Pedido',
      'WHERE ClienteId = 4217;',
      '',
      '-- 1) Sólo clave: Seek + Key Lookup por fila',
      'CREATE NONCLUSTERED INDEX IX_Pedido_Cliente',
      '    ON dbo.Pedido (ClienteId);',
      '',
      '-- 2) Covering: sin Key Lookup',
      'CREATE NONCLUSTERED INDEX IX_Pedido_Cliente_Cov',
      '    ON dbo.Pedido (ClienteId)',
      '    INCLUDE (FechaPedido, Total);'
    ),
  });
  H.card(s, {
    x: 8.1, y: 1.75, w: 4.63, h: 3.95, title: 'Qué ocurre por dentro', size: 14,
    bullets: [
      'La hoja del NCI guarda clave + puntero a la fila',
      'Key Lookup: 1 lectura aleatoria por fila',
      'INCLUDE: columnas sólo en la hoja, sin ordenar',
      'Más índices = más coste en INSERT/UPDATE/DELETE',
    ],
  });
  H.callout(s, { x: 0.6, y: 6.0, w: 12.13, h: 0.75, kind: 'info', size: 14, lead: 'Orden de la clave:', text: 'igualdad primero, rango después, y columnas de lectura en INCLUDE.' });

  // ───────────────────────── 47 · Filtered, columnstore, missing indexes ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Índices',
    title: 'Filtered, columnstore y missing indexes',
    notes: {
      obj: 'Conocer dos tipos especiales de índice (filtered y columnstore) y aprender a usar con cautela las sugerencias de índices que expone el propio motor.',
      guion: [
        'Filtered Index: es un NCI con cláusula WHERE que indexa sólo un subconjunto de filas (por ejemplo, pedidos abiertos, Estado = 1). Es más pequeño, más barato de mantener y sus estadísticas son más precisas para ese subconjunto.',
        'Limitaciones: el predicado debe ser determinista y simple; el optimizador sólo lo usa si la consulta garantiza el predicado. Con consultas parametrizadas (WHERE Estado = @e) puede no usarse sin OPTION (RECOMPILE). Requiere ciertas opciones SET (QUOTED_IDENTIFIER, ANSI_NULLS ON) en la sesión.',
        'Columnstore (sólo mención en este curso): almacena por columnas, comprimido y procesado en modo batch. Es ideal para analítica y Data Warehouse (agregaciones sobre millones de filas); no para búsquedas puntuales OLTP. Existe clustered columnstore y nonclustered columnstore; desde 2016 se puede combinar con OLTP (operational analytics).',
        'Missing Index DMVs (sys.dm_db_missing_index_details, _groups, _group_stats): el optimizador registra los índices que le habrían ayudado. Son sugerencias, no órdenes: ignoran el orden óptimo de las columnas, pueden proponer índices casi duplicados, no consideran el coste de escritura y se pierden al reiniciar el servicio.',
        'Procedimiento sano: usar las DMVs como punto de partida, validar con el plan real de la consulta, consolidar con índices existentes (sys.dm_db_index_usage_stats muestra user_seeks/scans/lookups frente a user_updates) y medir antes/después.',
        'Un índice con muchos user_updates y cero lecturas es candidato a eliminarse, pero hay que observar un ciclo de negocio completo (cierre mensual, informes anuales) y recordar que estas cifras se reinician al reiniciar la instancia.',
      ],
      preguntas: [
        '¿Qué casos de vuestro negocio tienen un subconjunto "caliente" de filas (pedidos abiertos, usuarios activos) donde un filtered index aportaría valor?',
        'Si el servidor lleva 3 días encendido, ¿es fiable concluir que un índice no se usa? ¿Qué información adicional necesitaríais?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 2.55, size: 12, label: 'T-SQL · FILTERED Y COLUMNSTORE',
    code: C(
      '-- Filtered: sólo pedidos abiertos',
      'CREATE NONCLUSTERED INDEX IX_Pedido_Abierto',
      '    ON dbo.Pedido (FechaPedido)',
      '    INCLUDE (Total)',
      '    WHERE Estado = 1;',
      '-- Columnstore (analítica / DW)',
      'CREATE NONCLUSTERED COLUMNSTORE INDEX',
      '    NCCI_Pedido ON dbo.Pedido (ClienteId, Total);'
    ),
  });
  H.card(s, {
    x: 0.6, y: 4.6, w: 5.9, h: 2.15, title: 'Cuándo usar cada uno', size: 14,
    bullets: [
      'Filtered: subconjuntos pequeños, predicado fijo',
      'Columnstore: agregaciones sobre millones de filas',
      'Filtered + parámetros: puede ignorarse sin RECOMPILE',
    ],
  });
  H.code(s, {
    x: 6.8, y: 1.75, w: 5.93, h: 3.2, size: 12, label: 'T-SQL · MISSING INDEX DMVS',
    code: C(
      'SELECT TOP (5)',
      '  d.statement AS tabla,',
      '  d.equality_columns, d.inequality_columns,',
      '  d.included_columns,',
      '  s.user_seeks, s.avg_user_impact',
      'FROM sys.dm_db_missing_index_details AS d',
      'JOIN sys.dm_db_missing_index_groups AS g',
      '  ON g.index_handle = d.index_handle',
      'JOIN sys.dm_db_missing_index_group_stats AS s',
      '  ON s.group_handle = g.index_group_handle',
      'ORDER BY s.user_seeks * s.avg_user_impact DESC;'
    ),
  });
  H.callout(s, { x: 6.8, y: 5.25, w: 5.93, h: 1.5, kind: 'warn', size: 14, lead: 'Con cautela:', text: 'son sugerencias, no órdenes. Pueden duplicar índices y se reinician con el servicio. Valídalas con el plan real.' });

  // ───────────────────────── 48 · Fragmentación y Page Splits ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Mantenimiento',
    title: 'Fragmentación, Page Splits y fillfactor',
    notes: {
      obj: 'Entender qué es la fragmentación de índices, cómo se mide con sys.dm_db_index_physical_stats y cómo decidir entre REORGANIZE y REBUILD apoyándose en el fillfactor.',
      guion: [
        'Fragmentación lógica (avg_fragmentation_in_percent): porcentaje de páginas hoja cuyo orden físico no coincide con el orden lógico de la clave. Afecta sobre todo a las lecturas de rango (read-ahead menos eficiente). Fragmentación interna: páginas poco llenas (avg_page_space_used_in_percent baja), que desperdician espacio y memoria del Buffer Pool.',
        'Page Split: cuando se inserta o se actualiza una fila en una página hoja llena, el motor reserva una página nueva, mueve ~50 % de las filas y enlaza la nueva página. Es costoso (log, bloqueos) y deja ambas páginas a medio llenar. Claves aleatorias (GUID) o UPDATEs que hacen crecer filas los multiplican.',
        'Se mide con sys.dm_db_index_physical_stats; el modo LIMITED es rápido (sólo niveles superiores) y suficiente para avg_fragmentation_in_percent; DETAILED recorre todo y es caro: no usarlo en horario de producción en tablas grandes.',
        'Regla de partida de Microsoft: ignorar índices de menos de ~1000 páginas; entre 5 y 30 % ALTER INDEX … REORGANIZE (siempre online, compacta hojas, interrumpible); por encima de 30 % ALTER INDEX … REBUILD (recrea el índice, actualiza estadísticas con FULLSCAN, puede ser ONLINE sólo en Enterprise). Son umbrales de partida, no leyes.',
        'FILLFACTOR deja un porcentaje libre en cada página hoja al reconstruir (por ejemplo 90) para absorber inserciones sin Page Split. Con claves crecientes lo habitual es 100; bájalo sólo en índices con inserciones aleatorias, y comprueba que reduce Page Splits (contador Page Splits/sec, sys.dm_db_index_operational_stats: leaf_allocation_count).',
        'En almacenamiento SSD/flash la fragmentación lógica penaliza menos; la densidad de página y las estadísticas siguen siendo relevantes. Un REBUILD masivo diario puede ser peor (log, bloqueos, réplicas) que el problema que intenta resolver.',
      ],
      preguntas: [
        'Un índice de 300 páginas con 60 % de fragmentación: ¿lo reconstruiríais? ¿Por qué?',
        '¿Qué efecto tendría un FILLFACTOR = 70 en una tabla de solo lectura? ¿Y en una con inserciones aleatorias?',
        '¿Cómo comprobaríais, tras cambiar el fillfactor, que de verdad disminuyen los Page Splits?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.2, h: 3.3, size: 12, label: 'T-SQL · MEDIR FRAGMENTACIÓN',
    code: C(
      'SELECT OBJECT_NAME(ips.object_id) AS Tabla,',
      '       i.name AS Indice,',
      '       ips.avg_fragmentation_in_percent AS Frag,',
      '       ips.page_count',
      'FROM sys.dm_db_index_physical_stats',
      '     (DB_ID(), NULL, NULL, NULL, N\'LIMITED\') AS ips',
      'JOIN sys.indexes AS i',
      '  ON i.object_id = ips.object_id',
      ' AND i.index_id = ips.index_id',
      'WHERE ips.page_count > 1000',
      '  AND ips.avg_fragmentation_in_percent > 5',
      'ORDER BY Frag DESC;'
    ),
  });
  H.code(s, {
    x: 0.6, y: 5.35, w: 7.2, h: 1.4, size: 12, label: 'T-SQL · REORGANIZE / REBUILD',
    code: C(
      'ALTER INDEX IX_Pedido_Cliente ON dbo.Pedido REORGANIZE;',
      'ALTER INDEX IX_Pedido_Cliente ON dbo.Pedido',
      '    REBUILD WITH (FILLFACTOR = 90);'
    ),
  });
  H.table(s, [
    ['Fragmentación', 'Acción'],
    ['< 5 %', 'No hacer nada'],
    ['5 – 30 %', 'REORGANIZE'],
    ['> 30 %', 'REBUILD'],
  ], { x: 8.1, y: 1.75, w: 4.63, colW: [2, 2.6], size: 14, maxH: 2.2 });
  H.card(s, {
    x: 8.1, y: 4.15, w: 4.63, h: 2.6, title: 'Page Split', size: 14,
    bullets: [
      'Página llena + inserción en medio: se parte en dos',
      'Deja páginas a medias y genera log extra',
      'Claves aleatorias (GUID) lo agravan',
    ],
  });

  // ───────────────────────── 49 · Estadísticas ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Optimizador',
    title: 'Estadísticas y cardinality estimator',
    notes: {
      obj: 'Comprender que el optimizador elige el plan a partir de estimaciones de cardinalidad basadas en estadísticas, y saber inspeccionarlas, mantenerlas y reconocer cuándo fallan.',
      guion: [
        'Las estadísticas describen la distribución de valores de una o varias columnas. El Query Optimizer las usa para estimar cuántas filas devolverá cada operador (cardinalidad) y, con ello, elegir Seek vs Scan, tipo de JOIN y concesión de memoria. Estadísticas malas = planes malos.',
        'Cada objeto de estadísticas tiene un encabezado (filas, filas muestreadas, última actualización), un vector de densidad y un histograma de hasta 200 pasos sobre la PRIMERA columna de la clave. Se inspecciona con DBCC SHOW_STATISTICS; para ver la fecha y el nº de modificaciones, sys.dm_db_stats_properties.',
        'AUTO_CREATE_STATISTICS crea estadísticas de columna (_WA_Sys_…) cuando una consulta filtra por una columna sin ellas; AUTO_UPDATE_STATISTICS las refresca cuando el número de cambios supera un umbral: clásico 500 + 20 % de las filas; con nivel de compatibilidad 130 o superior, umbral dinámico aproximado √(1000 × filas), mucho más sensible en tablas grandes. AUTO_UPDATE_STATISTICS_ASYNC evita bloquear la consulta que dispara la actualización.',
        'Las estadísticas del índice se actualizan con FULLSCAN al hacer REBUILD, no con REORGANIZE; el muestreo por defecto de UPDATE STATISTICS puede ser insuficiente en datos muy sesgados: considerar WITH FULLSCAN o PERSIST_SAMPLE_PERCENT (2016 SP1+/2019).',
        'Cardinality Estimator (CE): con nivel de compatibilidad 120+ se usa el CE nuevo (2014), que cambió supuestos de correlación y contención entre predicados. Si una migración provoca regresiones, se puede comparar con LEGACY_CARDINALITY_ESTIMATION (database scoped configuration) o el hint USE HINT.',
        'Síntoma clásico: en el plan real, Estimated Number of Rows muy distinto de Actual Number of Rows. Causas habituales: estadísticas obsoletas, parameter sniffing, variables locales, tablas variable, columnas correlacionadas.',
      ],
      preguntas: [
        '¿Por qué un REBUILD de índice "arregla" a veces un plan lento aunque la fragmentación fuera baja?',
        'Una tabla de 50 millones de filas con auto-update clásico necesitaría 10 millones de cambios para actualizar estadísticas: ¿qué consecuencias tiene y cómo lo mitiga el umbral dinámico?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 6.9, h: 5.0, size: 13, label: 'T-SQL · INSPECCIONAR ESTADÍSTICAS',
    code: C(
      '-- Opciones a nivel de base de datos',
      'SELECT name, is_auto_create_stats_on,',
      '       is_auto_update_stats_on,',
      '       is_auto_update_stats_async_on',
      'FROM sys.databases WHERE name = N\'Ventas\';',
      '',
      '-- Encabezado, densidad e histograma',
      'DBCC SHOW_STATISTICS (N\'dbo.Pedido\',',
      '                      N\'IX_Pedido_Cliente\');',
      '',
      '-- Actualización manual',
      'UPDATE STATISTICS dbo.Pedido IX_Pedido_Cliente',
      '    WITH FULLSCAN;'
    ),
  });
  H.cardsGrid(s, [
    { title: 'Auto-create / Auto-update', body: 'Se refrescan tras muchos cambios: umbral dinámico √(1000·filas) con compat. 130+.' },
    { title: 'Histograma', body: 'Hasta 200 pasos sobre la 1.ª columna de la clave: filas estimadas por valor.' },
    { title: 'Cardinality Estimator', body: 'El CE nuevo (compat. 120+) cambia estimaciones; compara con el Legacy CE.' },
  ], { cols: 1, x: 7.8, y: 1.75, w: 4.93, h: 5.0, gap: 0.25, size: 14, titleSize: 17 });

  // ───────────────────────── 50 · Operadores del plan ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Planes de ejecución',
    title: 'Planes: Scan, Seek y Key Lookup',
    notes: {
      obj: 'Reconocer los tres operadores de acceso a datos más frecuentes en un plan de ejecución y saber cuándo son normales y cuándo son una señal de alarma.',
      guion: [
        'Table Scan (Heap) / Clustered Index Scan / Index Scan: leen todas las páginas del objeto. Coste proporcional al número de páginas. No es malo por definición: en tablas pequeñas o cuando la consulta necesita la mayoría de las filas, un Scan secuencial con read-ahead es lo más eficiente.',
        'Index Seek: navega el B-Tree desde la raíz hasta el primer valor que cumple el predicado y lee sólo el rango necesario. Requiere un predicado SARGable (Search ARGument ABLE): columna sola a un lado, sin funciones ni conversiones implícitas (WHERE YEAR(Fecha) = 2024 anula el Seek; mejor un rango Fecha >= … AND Fecha < …).',
        'Un Seek también puede ser caro si devuelve millones de filas o se ejecuta muchas veces dentro de un Nested Loops (mirar Number of Executions y Actual Rows en las propiedades del operador).',
        'Key Lookup (Clustered) / RID Lookup (Heap): obtiene las columnas que el NCI no contiene. Va acompañado de Nested Loops. Si el nº de ejecuciones es alto, es el candidato nº 1 para un índice covering (INCLUDE).',
        'Coste CPU y E/S: cada operador muestra Estimated I/O Cost y Estimated CPU Cost; el porcentaje del plan es una estimación relativa del optimizador, calculada con un modelo de hardware de referencia, y NO equivale a tiempo real. Para tiempo real, usar el plan real y SET STATISTICS TIME.',
        'Orden de lectura: de derecha a izquierda y de arriba abajo (el flujo de datos va hacia la izquierda); el grosor de las flechas indica el volumen de filas.',
      ],
      preguntas: [
        'Veis un Clustered Index Scan sobre una tabla de 200 filas: ¿hay que arreglarlo? ¿Y si la tabla tiene 200 millones?',
        '¿Por qué WHERE CONVERT(VARCHAR(10), FechaPedido, 120) = \'2024-03-15\' impide el Index Seek? ¿Cómo lo reescribiríais?',
      ],
    },
  });
  H.cardsRow(s, [
    {
      title: 'Scan', icon: 'FaListUl', tone: 'light', size: 14,
      bullets: [
        'Lee todas las páginas del objeto',
        'Coste proporcional al tamaño (E/S)',
        'Correcto en tablas pequeñas o lecturas masivas',
        'Sospechoso: predicado no SARGable',
      ],
    },
    {
      title: 'Seek', icon: 'FaBullseye', tone: 'dark', size: 14,
      bullets: [
        'Navega el B-Tree hasta la clave',
        'Pocas lecturas lógicas',
        'Ideal con predicados selectivos',
        'Ojo: devolver millones de filas no es barato',
      ],
    },
    {
      title: 'Key Lookup', icon: 'FaKey', tone: 'light', size: 14,
      bullets: [
        'Un acceso al clustered por fila del NCI',
        'Lecturas aleatorias que se multiplican',
        'Plan típico: Nested Loops + Lookup',
        'Solución: INCLUDE o reescribir la consulta',
      ],
    },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 3.45, gap: 0.3 });
  H.callout(s, { x: 0.6, y: 5.35, w: 12.13, h: 1.35, kind: 'tip', size: 15, lead: 'Un Scan no es siempre un problema:', text: 'hay que cruzarlo con el nº de filas, el tamaño de la tabla y las lecturas lógicas reales antes de decidir crear un índice.' });

  // ───────────────────────── 51 · Leer un plan ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Planes de ejecución',
    title: 'Leer un plan: coste, warnings y estimados',
    notes: {
      obj: 'Aprender a obtener y leer un plan de ejecución real, medir E/S y tiempo con STATISTICS IO/TIME y detectar las desviaciones y avisos que indican un problema.',
      guion: [
        'Plan estimado (Ctrl+L): se genera sin ejecutar la consulta; sólo contiene estimaciones. Plan real (Ctrl+M antes de ejecutar): incluye métricas reales (Actual Rows, Actual Executions, tiempos) y avisos de ejecución como spills.',
        'SET STATISTICS IO ON muestra por tabla: Scan count, logical reads (páginas leídas de memoria), physical reads y read-ahead reads. Las lecturas lógicas son la métrica más estable para comparar versiones de una consulta, porque no dependen de la caché ni de la carga del servidor.',
        'SET STATISTICS TIME ON informa de CPU time y elapsed time; el elapsed incluye esperas (bloqueos, E/S). Comparar siempre con la caché caliente y repetir varias ejecuciones; evitar DBCC DROPCLEANBUFFERS en producción.',
        'Estimated vs Actual Rows: una diferencia de un orden de magnitud o más es la principal pista de estadísticas obsoletas, parameter sniffing o de un predicado que el CE no sabe estimar. Se ven en las propiedades de cada operador (F4).',
        'Warnings (triángulo amarillo): Sort/Hash Spill a tempdb por concesión de memoria insuficiente, conversión implícita (CONVERT_IMPLICIT) que anula Seeks, columnas sin estadísticas, Missing Index. Un spill indica memory grant mal estimado.',
        'Query Store (SQL Server 2016+; mención): guarda por base de datos las consultas, sus planes y métricas históricas; permite detectar regresiones de plan y forzar un plan anterior. Se activa con ALTER DATABASE … SET QUERY_STORE = ON y está activado por defecto en bases nuevas desde SQL Server 2022.',
      ],
      preguntas: [
        '¿Por qué elegimos lecturas lógicas y no el tiempo transcurrido para comparar dos versiones de una consulta?',
        'El plan muestra Estimated Rows = 1 y Actual Rows = 900.000: ¿qué hipótesis plantearíais y qué comprobaríais primero?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 6.6, h: 3.3, size: 13, label: 'T-SQL · MEDIR E/S Y TIEMPO',
    code: C(
      'SET STATISTICS IO ON;',
      'SET STATISTICS TIME ON;',
      '',
      'SELECT PedidoId, Total',
      'FROM dbo.Pedido',
      'WHERE ClienteId = 4217;',
      '',
      '-- Messages: Table \'Pedido\'. Scan count 1,',
      '--   logical reads 3, physical reads 0',
      '--   CPU time = 0 ms, elapsed time = 1 ms'
    ),
  });
  H.callout(s, { x: 0.6, y: 5.35, w: 6.6, h: 1.4, kind: 'tip', size: 14, lead: 'Métrica clave:', text: 'las lecturas lógicas son estables; el tiempo varía con la caché y la carga.' });
  H.card(s, {
    x: 7.5, y: 1.75, w: 5.23, h: 5.0, title: 'Qué mirar en el plan', icon: 'FaEye', size: 14,
    bullets: [
      { lead: 'Estimated vs Actual:', text: 'gran diferencia = estadísticas obsoletas o parameter sniffing' },
      { lead: 'Warnings:', text: 'spill a tempdb, conversión implícita, falta de estadísticas' },
      { lead: 'Coste %:', text: 'estimación relativa, no tiempo real' },
      { lead: 'Query Store:', text: 'planes e historial para detectar regresiones (2016+)' },
    ],
  });

  // ───────────────────────── 52 · DMVs: consultas y sesiones ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Monitorización',
    title: 'DMVs: consultas costosas y sesiones activas',
    notes: {
      obj: 'Usar las DMVs sys.dm_exec_query_stats y sys.dm_exec_requests junto con sys.dm_exec_sql_text/query_plan para localizar las consultas más costosas y ver qué está ejecutándose ahora mismo.',
      guion: [
        'Las Dynamic Management Views exponen el estado interno del motor sin instalar nada. Requieren el permiso VIEW SERVER STATE (VIEW SERVER PERFORMANCE STATE en SQL Server 2022) y sus datos son volátiles: se reinician al reiniciar la instancia.',
        'sys.dm_exec_query_stats acumula, por sentencia en la caché de planes, execution_count, total_worker_time (CPU, µs), total_elapsed_time, total_logical_reads/writes y últimos valores. Se une con sys.dm_exec_sql_text(sql_handle) para obtener el texto y con sys.dm_exec_query_plan(plan_handle) para el plan XML.',
        'Importante: sólo ve consultas cuyo plan sigue en caché; los planes expulsados por memoria o recompilados desaparecen, y las consultas con OPTION (RECOMPILE) no aparecen. Para histórico fiable, Query Store.',
        'Ordenar por total_worker_time identifica lo que más CPU consume en conjunto; por total_logical_reads, lo que más memoria/E-S toca; por promedio (dividir por execution_count) las consultas individualmente lentas. Una consulta de 5 ms ejecutada un millón de veces puede pesar más que una de 5 s ejecutada una vez.',
        'sys.dm_exec_requests muestra las peticiones activas ahora: status, command, wait_type, wait_time, blocking_session_id, cpu_time, logical_reads, database_id y sql_handle. Es el primer sitio al que mirar cuando "va lento ahora".',
        'Buenas prácticas: filtrar session_id > 50 o unir con sys.dm_exec_sessions (is_user_process = 1), excluir @@SPID y limitar columnas de texto (LEFT/SUBSTRING) para no devolver lotes enormes a SSMS.',
      ],
      preguntas: [
        '¿Por qué ordenar sólo por duración media puede ocultar la consulta que más daño hace al servidor?',
        'Reiniciamos el servicio ayer y hoy sys.dm_exec_query_stats está casi vacío: ¿qué conclusiones podemos (y no) extraer?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 3.55, size: 12, label: 'T-SQL · TOP CONSULTAS POR CPU',
    code: C(
      'SELECT TOP (5)',
      '  qs.execution_count,',
      '  qs.total_worker_time/qs.execution_count AS cpu_us,',
      '  qs.total_logical_reads,',
      '  LEFT(st.text, 100) AS batch_text',
      'FROM sys.dm_exec_query_stats AS qs',
      'CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st',
      '-- Plan: sys.dm_exec_query_plan(qs.plan_handle)',
      'ORDER BY qs.total_worker_time DESC;'
    ),
  });
  H.code(s, {
    x: 6.83, y: 1.75, w: 5.9, h: 3.55, size: 12, label: 'T-SQL · PETICIONES ACTIVAS',
    code: C(
      'SELECT r.session_id, r.status, r.command,',
      '       r.wait_type, r.wait_time,',
      '       r.blocking_session_id,',
      '       r.cpu_time, r.logical_reads,',
      '       DB_NAME(r.database_id) AS bd,',
      '       LEFT(t.text, 100) AS sql_text',
      'FROM sys.dm_exec_requests AS r',
      'CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t',
      'WHERE r.session_id <> @@SPID;'
    ),
  });
  H.callout(s, { x: 0.6, y: 5.6, w: 12.13, h: 1.15, kind: 'warn', size: 14, lead: 'Datos volátiles:', text: 'las DMVs acumulan desde el último reinicio y query_stats sólo ve planes en caché. Necesitas VIEW SERVER STATE (VIEW SERVER PERFORMANCE STATE en 2022).' });

  // ───────────────────────── 53 · DMVs: waits ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Monitorización',
    title: 'DMVs: esperas y bloqueos',
    notes: {
      obj: 'Aplicar el método de Wait Statistics: identificar los tipos de espera dominantes con sys.dm_os_wait_stats y localizar bloqueos con sys.dm_os_waiting_tasks.',
      guion: [
        'Cada hilo (worker) de SQL Server pasa por estados RUNNING, RUNNABLE y SUSPENDED. Cuando no puede avanzar (espera un bloqueo, una E/S, memoria…) registra una espera. Analizar dónde espera el servidor indica cuál es el cuello de botella dominante.',
        'sys.dm_os_wait_stats es acumulativa desde el inicio de la instancia (o desde DBCC SQLPERF(\'sys.dm_os_wait_stats\', CLEAR)): wait_time_ms incluye signal_wait_time_ms (tiempo en cola esperando CPU después de que el recurso esté listo). Si el signal wait supera ~20–25 % del total hay presión de CPU.',
        'Hay que filtrar las esperas benignas (SLEEP_*, LAZYWRITER_SLEEP, XE_TIMER_EVENT, BROKER_*, WAITFOR…). La lista real es larga; los scripts de referencia de la comunidad (por ejemplo, los de Paul Randal) mantienen un listado actualizado. La consulta de la diapositiva es una simplificación didáctica.',
        'Interpretación rápida: PAGEIOLATCH_SH/EX = lecturas de disco lentas o falta de memoria; WRITELOG = latencia del disco de log; LCK_M_* = bloqueos entre sesiones; SOS_SCHEDULER_YIELD = presión de CPU; CXPACKET/CXCONSUMER = paralelismo (no siempre un problema por sí solo); ASYNC_NETWORK_IO = el cliente tarda en consumir resultados.',
        'sys.dm_os_waiting_tasks es una vista instantánea de las tareas que esperan AHORA: session_id, wait_type, wait_duration_ms, blocking_session_id y resource_description (por ejemplo, el recurso bloqueado). Permite reconstruir cadenas de bloqueo y localizar el head blocker (el que bloquea y no está bloqueado).',
        'Método sano: tomar dos snapshots de wait_stats separados por unos minutos y calcular la diferencia; los valores acumulados desde hace semanas diluyen el problema actual.',
      ],
      preguntas: [
        'El 60 % de las esperas es PAGEIOLATCH_SH: ¿qué dos líneas de actuación distintas se os ocurren (E/S y memoria/consultas)?',
        '¿Por qué una consulta puede tardar 30 s con CPU time de 200 ms? ¿Dónde lo veríais?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 3.6, size: 12, label: 'T-SQL · TOP WAITS ACUMULADOS',
    code: C(
      'SELECT TOP (10)',
      '  wait_type,',
      '  waiting_tasks_count,',
      '  wait_time_ms,',
      '  signal_wait_time_ms,',
      '  CAST(100.0 * wait_time_ms /',
      '    SUM(wait_time_ms) OVER() AS DECIMAL(5,2)) AS pct',
      'FROM sys.dm_os_wait_stats',
      'WHERE wait_type NOT LIKE N\'SLEEP%\'',
      '  AND wait_type NOT IN (N\'LAZYWRITER_SLEEP\',',
      '                        N\'XE_TIMER_EVENT\')',
      'ORDER BY wait_time_ms DESC;'
    ),
  });
  H.callout(s, { x: 0.6, y: 5.65, w: 5.9, h: 1.1, kind: 'tip', size: 14, lead: 'Consejo:', text: 'toma dos snapshots y calcula la diferencia.' });
  H.code(s, {
    x: 6.83, y: 1.75, w: 5.9, h: 2.5, size: 12, label: 'T-SQL · TAREAS EN ESPERA AHORA',
    code: C(
      'SELECT wt.session_id, wt.wait_type,',
      '       wt.wait_duration_ms,',
      '       wt.blocking_session_id,',
      '       wt.resource_description',
      'FROM sys.dm_os_waiting_tasks AS wt',
      'WHERE wt.session_id > 50',
      'ORDER BY wt.wait_duration_ms DESC;'
    ),
  });
  H.table(s, [
    ['Wait type', 'Suele indicar'],
    ['PAGEIOLATCH_*', 'Lecturas de disco lentas'],
    ['LCK_M_*', 'Bloqueos entre sesiones'],
    ['SOS_SCHEDULER_YIELD', 'Presión de CPU'],
    ['WRITELOG', 'Latencia del disco de log'],
  ], { x: 6.83, y: 4.55, w: 5.9, colW: [2.6, 3.3], size: 13, maxH: 2.2 });

  // ───────────────────────── 54 · RTO y RPO ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'HA / DR',
    title: 'RTO y RPO: tiempo y datos en juego',
    notes: {
      obj: 'Definir RTO y RPO como los dos requisitos de negocio que determinan qué tecnología de HA/DR elegir, y distinguir alta disponibilidad de recuperación ante desastres.',
      guion: [
        'RPO (Recovery Point Objective): cuántos datos, medidos en tiempo, puede perder el negocio. RPO = 15 min significa que tras un fallo se aceptan hasta 15 minutos de transacciones perdidas. RPO ≈ 0 exige que cada commit esté ya en otro lugar antes de confirmarse (replicación síncrona).',
        'RTO (Recovery Time Objective): cuánto tiempo puede estar caído el servicio hasta restablecerse (incluye detección, decisión, failover y recuperación de la BD). RTO = 1 min exige failover automático; RTO = 4 h permite restaurar desde backup.',
        'Alta Disponibilidad (HA) protege frente a fallos locales (nodo, instancia, disco) con RTO/RPO bajos, normalmente en el mismo CPD. Disaster Recovery (DR) protege frente a la pérdida de un sitio entero, normalmente con replicación asíncrona a otra ubicación; el RPO suele ser mayor que cero.',
        'Cuanto más cercanos a cero son RTO y RPO, mayor es el coste (licencias Enterprise, hardware duplicado, red de baja latencia, complejidad operativa). Los requisitos los define el negocio, no el DBA; el DBA los traduce a arquitectura.',
        'La replicación y HA NO sustituyen a los backups: un DROP TABLE accidental o la corrupción lógica se replican al secundario. Los backups (Módulo 4) siguen siendo la defensa frente a errores humanos y ransomware.',
        'Para un ejercicio rápido: dar tres sistemas (tienda online, ERP interno, informes mensuales) y pedir que propongan RPO y RTO razonables y su justificación económica.',
      ],
      preguntas: [
        '¿Qué RPO y RTO fijaríais para el sistema de pedidos de una tienda online en campaña de Black Friday y para un datamart de informes mensuales?',
        'Si el RPO es 0 y el RTO 30 s, ¿qué opciones tecnológicas siguen disponibles? ¿Y si además hay que cubrir la pérdida de todo el CPD?',
      ],
    },
  });
  {
    const xs = [2.4, 6.5, 10.6];
    H.line(s, 0.9, 3.05, 12.45, 3.05, { color: COL.MUTED, width: 2 });
    H.line(s, xs[0], 2.4, xs[1], 2.4, { color: COL.CORAL, width: 2.5, arrow: 'both' });
    H.line(s, xs[1], 2.4, xs[2], 2.4, { color: COL.COBALT, width: 2.5, arrow: 'both' });
    H.text(s, 'RPO: datos que puedes perder', { x: xs[0], y: 1.85, w: xs[1] - xs[0], h: 0.4, size: 16, bold: true, color: COL.CORAL, align: 'center', valign: 'middle', label: 'rpo' });
    H.text(s, 'RTO: tiempo hasta restablecer', { x: xs[1], y: 1.85, w: xs[2] - xs[1], h: 0.4, size: 16, bold: true, color: COL.COBALT, align: 'center', valign: 'middle', label: 'rto' });
    [[COL.COBALT, 'Último punto recuperable\n(commit replicado o backup)'], [COL.CORAL, 'Fallo\n(caída de nodo o sitio)'], [COL.COBALT, 'Servicio restablecido\n(aplicación operativa)']].forEach(([c, t], i) => {
      s.addShape(H.SHAPE.ellipse, { x: xs[i] - 0.17, y: 2.88, w: 0.34, h: 0.34, fill: { color: c }, line: { type: 'none' } });
      H.text(s, t, { x: xs[i] - 1.6, y: 3.35, w: 3.2, h: 0.7, size: 14, color: COL.TEXT, align: 'center', label: 'hito' });
    });
    H.stat(s, { x: 0.6, y: 4.35, w: 3.84, h: 2.4, value: 'RPO ≈ 0', label: 'FCI o AG síncrono: ningún commit confirmado se pierde', valueSize: 36 });
    H.stat(s, { x: 4.745, y: 4.35, w: 3.84, h: 2.4, value: 'RTO: segundos', label: 'Failover automático con FCI o AG síncrono y listener', valueSize: 36, tone: 'dark' });
    H.stat(s, { x: 8.89, y: 4.35, w: 3.84, h: 2.4, value: 'RPO: minutos', label: 'Log Shipping: pérdida = intervalo de backup del log', valueSize: 36 });
  }

  // ───────────────────────── 55 · Comparativa HA/DR ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'HA / DR',
    title: 'Comparativa de tecnologías HA/DR',
    notes: {
      obj: 'Comparar Log Shipping, Replicación, Failover Cluster Instances y Always On Availability Groups según alcance, failover, pérdida de datos y requisitos, para saber elegir cada una.',
      guion: [
        'Log Shipping: automatiza el backup del Transaction Log de la primaria, su copia y su restauración en una o varias secundarias (NORECOVERY o STANDBY de sólo lectura). Es sencillo, barato, funciona en Standard y tiene RPO igual al intervalo de backup (minutos). El failover es manual: hay que restaurar la cola de log, recuperar la BD y redirigir las aplicaciones.',
        'Replicación (Snapshot, Transactional, Merge): distribuye datos a nivel de tablas/artículos, no de base de datos completa. Sirve para informes descargados, consolidación y escenarios de datos distribuidos; no es una solución de HA/DR completa (no replica logins, jobs, ni el esquema entero).',
        'Failover Cluster Instance (FCI): protege la INSTANCIA entera sobre un Windows Server Failover Cluster (WSFC) con almacenamiento compartido (SAN, S2D, SMB). Una sola copia de los datos: si el almacenamiento falla, todo falla. Failover automático (segundos a pocos minutos, incluida la recuperación de la BD), RPO ≈ 0. Disponible en Standard con 2 nodos.',
        'Always On Availability Groups (AG): protege un conjunto de bases de datos replicando el log a hasta 8 réplicas secundarias (Enterprise), síncronas (RPO 0, failover automático) o asíncronas (RPO > 0, failover manual forzado). No necesita almacenamiento compartido; las réplicas pueden ser legibles y usarse para backups o informes (Enterprise).',
        'Un AG no replica objetos a nivel de instancia (logins, SQL Agent jobs, linked servers): hay que sincronizarlos aparte. FCI y AG pueden combinarse (FCI como réplicas de un AG).',
        'Criterios de elección: RTO/RPO exigidos, edición y licencias, topología de red y almacenamiento, capacidad del equipo para operar un WSFC y presupuesto. No hay una opción "mejor" en abstracto.',
      ],
      preguntas: [
        'Una pyme con SQL Server Standard, un solo CPD y RTO de 30 min: ¿qué tecnología propondríais y qué limitaciones explicaríais a la dirección?',
        '¿Por qué un FCI no protege frente a la corrupción del almacenamiento compartido? ¿Cómo lo complementaríais?',
      ],
    },
  });
  H.table(s, [
    ['Tecnología', 'Alcance', 'Failover', 'Pérdida de datos (RPO)', 'Punto clave'],
    ['Log Shipping', 'Base de datos', 'Manual', 'Minutos (intervalo de log backup)', 'Simple y barato; secundaria STANDBY'],
    ['Replicación', 'Tablas / artículos', 'Manual (no es HA)', 'Variable (latencia de los agentes)', 'Distribuye datos; no es DR completo'],
    ['FCI', 'Instancia completa', 'Automático (WSFC)', '≈ 0 (almacenamiento compartido)', 'Requiere SAN; el disco es punto único'],
    ['Always On AG', 'Grupo de bases de datos', 'Automático (síncrona) o manual', '≈ 0 síncrona · > 0 asíncrona', 'Sin disco compartido; réplicas legibles'],
  ], { x: 0.6, y: 1.75, w: 12.13, colW: [1.9, 2.1, 2.4, 2.9, 3.0], size: 14, maxH: 3.9 });
  H.callout(s, { x: 0.6, y: 5.75, w: 12.13, h: 1.0, kind: 'tip', size: 14, lead: 'Elige por RTO/RPO, edición y presupuesto:', text: 'Standard ofrece Basic AG, FCI de 2 nodos y Log Shipping; Enterprise añade AG completos.' });

  // ───────────────────────── 56 · Topología Always On AG ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'HA / DR',
    title: 'Always On AG: topología y quorum',
    notes: {
      obj: 'Interpretar la topología de un Always On Availability Group (réplicas, modos de disponibilidad, listener y quorum) y conocer las variantes Basic AG y Distributed AG.',
      guion: [
        'Un AG se construye sobre un Windows Server Failover Cluster (WSFC) (o, en Linux, Pacemaker). Los nodos votan para decidir qué miembros siguen en servicio: es el quorum. Con un número par de nodos se añade un testigo (File Share Witness, Cloud Witness en Azure o Disk Witness) para evitar el split-brain, es decir, dos nodos creyéndose primarios.',
        'La réplica primaria acepta lecturas y escrituras y envía el log de transacciones (log blocks) a las secundarias. En modo de disponibilidad síncrono (synchronous-commit) el commit no se confirma al cliente hasta que el log está endurecido en la secundaria: RPO 0 a cambio de latencia añadida; permite failover automático. En modo asíncrono el commit no espera: RPO > 0 y sólo failover manual forzado (con posible pérdida de datos).',
        'El listener es un nombre de red virtual (VNN) y una o varias IP que siguen a la réplica primaria: las aplicaciones se conectan a él y tras un failover se reconectan a la nueva primaria (usar MultiSubnetFailover=True en la cadena de conexión). Con ApplicationIntent=ReadOnly y read-only routing se puede dirigir lectura a secundarias legibles (Enterprise).',
        'Basic Availability Groups (Standard Edition, desde 2016 SP1): un único par de réplicas, una sola base de datos por AG, sin lectura en la secundaria ni backups en ella. Es el sustituto de Database Mirroring, obsoleto.',
        'Distributed Availability Group (mención): un AG que contiene otros dos AG en clústeres WSFC distintos; útil para DR entre sitios, migraciones sin downtime y cambios de versión/SO. Enterprise Edition.',
        'Monitorización: sys.dm_hadr_availability_replica_states, sys.dm_hadr_database_replica_states (log_send_queue_size, redo_queue_size, synchronization_state_desc) y el Dashboard de Always On en SSMS.',
        'Advertencia de rendimiento: una réplica síncrona con red lenta o disco de log saturado en la secundaria penaliza a TODAS las transacciones de la primaria (esperas HADR_SYNC_COMMIT).',
      ],
      preguntas: [
        '¿Qué ocurriría con las escrituras en la primaria si la réplica síncrona pierde conectividad? ¿Cómo lo gestiona el AG?',
        'Tenéis dos nodos en un mismo CPD y quorum de mayoría de nodos: ¿qué pasa si cae uno? ¿Cómo ayuda un Cloud Witness?',
      ],
    },
  });
  {
    const bx = [0.6, 3.3, 6.0];
    const bw = 2.2;
    const cx = bx[1] + bw / 2; // eje central (primaria)
    H.box(s, { x: cx - 1.3, y: 1.75, w: 2.6, h: 0.45, text: 'Aplicaciones cliente', fill: COL.ICE, color: COL.NAVY, size: 14, line: COL.LINE });
    H.line(s, cx, 2.2, cx, 2.55, { color: COL.MUTED, width: 1.75, arrow: 'end' });
    H.box(s, { x: cx - 1.55, y: 2.55, w: 3.1, h: 0.5, text: 'Listener (nombre virtual + IP)', fill: COL.NAVY, size: 14 });
    H.line(s, cx, 3.05, cx, 3.5, { color: COL.MUTED, width: 1.75, arrow: 'end' });
    H.box(s, { x: bx[0], y: 3.5, w: bw, h: 1.2, text: 'Secundaria síncrona\nSQLNODE2 · legible', fill: COL.COBALT, size: 14 });
    H.box(s, { x: bx[1], y: 3.5, w: bw, h: 1.2, text: 'Réplica primaria\nSQLNODE1 · R/W', fill: COL.CORAL, size: 14 });
    H.box(s, { x: bx[2], y: 3.5, w: bw, h: 1.2, text: 'Secundaria asíncrona\nSQLNODE3 · DR', fill: COL.STEEL, color: COL.NAVY, size: 14 });
    H.line(s, bx[1], 4.1, bx[0] + bw, 4.1, { color: COL.NAVY, width: 2.5, arrow: 'end' });
    H.line(s, bx[1] + bw, 4.1, bx[2], 4.1, { color: COL.NAVY, width: 2.5, arrow: 'end', dash: 'dash' });
    H.text(s, 'Síncrona · RPO = 0\nFailover automático', { x: bx[0], y: 4.85, w: bw, h: 0.6, size: 13, color: COL.TEXT, align: 'center', label: 'lbl sync' });
    H.text(s, 'Envía el log de\ntransacciones', { x: bx[1], y: 4.85, w: bw, h: 0.6, size: 13, color: COL.MUTED, align: 'center', label: 'lbl log' });
    H.text(s, 'Asíncrona · RPO > 0\nFailover manual', { x: bx[2], y: 4.85, w: bw, h: 0.6, size: 13, color: COL.TEXT, align: 'center', label: 'lbl async' });
    H.box(s, { x: 0.6, y: 5.75, w: 7.6, h: 1.0, text: 'Windows Server Failover Cluster (WSFC)\nQuorum: voto por nodo + Witness (File Share / Cloud / Disk)', fill: COL.ICE, color: COL.NAVY, size: 14, line: COL.LINE });
    H.cardsGrid(s, [
      { title: 'Basic AG (Standard)', body: '2 réplicas, 1 BD por AG, sin lectura en la secundaria.' },
      { title: 'Distributed AG', body: 'Une dos AG en clústeres distintos: DR entre sitios y migraciones.' },
      { title: 'Quorum y Testigo', body: 'Mayoría de votos contra split-brain; testigo en nodos pares.' },
    ], { cols: 1, x: 8.55, y: 1.75, w: 4.18, h: 5.0, gap: 0.25, size: 14, titleSize: 16 });
  }

  // ───────────────────────── 57 · Lab 3.1 ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Laboratorio 3.1',
    title: 'Lab 3.1 · Índices y medición de lecturas',
    lab: true,
    notes: {
      obj: 'Crear índices Non-Clustered y covering sobre dbo.Pedido y cuantificar su efecto comparando operador, lecturas lógicas y plan antes y después.',
      guion: [
        'Duración orientativa: 35–40 minutos. Se trabaja en parejas con SSMS conectado a la instancia (Docker: localhost,1433).',
        'Idea central del laboratorio: el mismo SELECT pasa de un Clustered Index Scan, a un Index Seek con Key Lookup, y finalmente a un Index Seek puro cuando el índice es covering. Cada paso se mide con STATISTICS IO.',
        'Recalcar la disciplina de medir: anotar en una tabla (operador, logical reads, CPU/elapsed) para la versión sin índice, con índice de clave y con índice covering.',
        'Aviso de rendimiento: crear índices sobre 500.000 filas es rápido en el laboratorio, pero en producción es una operación pesada (bloqueos de esquema, log, E/S); se haría fuera de horario o con ONLINE = ON (Enterprise).',
      ],
      preguntas: [
        '¿Cuánto bajan las lecturas lógicas entre el Scan y el Seek? ¿Y entre Seek+Lookup y covering?',
        '¿Qué coste adicional tiene ahora un INSERT en dbo.Pedido? ¿Cómo lo medirías?',
      ],
      lab: [
        'PASO 0 · Preparar datos (si no existen ya de módulos anteriores). Ejecutar en SSMS: CREATE DATABASE Ventas; (si no existe) y USE Ventas;',
        'CREATE TABLE dbo.Cliente (ClienteId INT IDENTITY(1,1) CONSTRAINT PK_Cliente PRIMARY KEY, Nombre NVARCHAR(100) NOT NULL, Activo BIT NOT NULL DEFAULT 1);',
        'INSERT dbo.Cliente (Nombre) SELECT TOP (10000) N\'Cliente \' + CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS NVARCHAR(10)) FROM sys.all_objects a CROSS JOIN sys.all_objects b;',
        'CREATE TABLE dbo.Pedido (PedidoId INT IDENTITY(1,1) CONSTRAINT PK_Pedido PRIMARY KEY, ClienteId INT NOT NULL, FechaPedido DATE NOT NULL, Total DECIMAL(12,2) NOT NULL, Estado TINYINT NOT NULL DEFAULT 1, Notas CHAR(200) NOT NULL DEFAULT \'\');',
        'INSERT dbo.Pedido (ClienteId, FechaPedido, Total) SELECT TOP (500000) ABS(CHECKSUM(NEWID())) % 10000 + 1, DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 1460), CAST(GETDATE() AS DATE)), CAST(ABS(CHECKSUM(NEWID())) % 100000 / 100.0 AS DECIMAL(12,2)) FROM sys.all_objects a CROSS JOIN sys.all_objects b CROSS JOIN sys.all_objects c;',
        'PASO 1 · Línea base. SET STATISTICS IO, TIME ON; activar Ctrl+M (Incluir plan de ejecución real) y ejecutar: SELECT PedidoId, FechaPedido, Total FROM dbo.Pedido WHERE ClienteId = 4217 AND FechaPedido >= \'20240101\'; Anotar operador (Clustered Index Scan) y logical reads (varios miles).',
        'PASO 2 · Índice de clave. CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha ON dbo.Pedido (ClienteId, FechaPedido); Repetir la consulta: aparece Index Seek + Key Lookup (Nested Loops). Anotar lecturas.',
        'PASO 3 · Índice covering. CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha ON dbo.Pedido (ClienteId, FechaPedido) INCLUDE (Total) WITH (DROP_EXISTING = ON); Repetir: Index Seek sin Key Lookup, lecturas lógicas de un dígito.',
        'PASO 4 · Uso de índices. SELECT OBJECT_NAME(s.object_id) AS Tabla, i.name, s.user_seeks, s.user_scans, s.user_lookups, s.user_updates FROM sys.dm_db_index_usage_stats s JOIN sys.indexes i ON i.object_id = s.object_id AND i.index_id = s.index_id WHERE s.database_id = DB_ID() AND s.object_id = OBJECT_ID(\'dbo.Pedido\'); Comprobar que user_seeks aumenta con el nuevo índice.',
        'TRAMPAS HABITUALES: (a) olvidar activar el plan real y ver sólo el estimado; (b) ejecutar con la caché fría la primera vez y comparar con otra caliente: repetir 2–3 veces y usar logical reads; (c) la tabla tiene tan pocas filas que el optimizador sigue eligiendo Scan: comprobar que hay 500.000 filas (SELECT COUNT(*)); (d) error "ClienteId" inexistente: la tabla se creó en master porque faltó USE Ventas; (e) el generador CROSS JOIN no llega a 500.000 filas en una instancia vacía: añadir otro CROSS JOIN.',
        'GUÍA DE RESOLUCIÓN: si tras el paso 3 sigue habiendo Key Lookup, la consulta pide una columna que no está en el índice (por ejemplo Estado): añadirla en INCLUDE o quitarla del SELECT. Si el índice no se usa, revisar que el predicado sea SARGable y que los tipos coincidan (FechaPedido es DATE: usar literales en formato \'yyyymmdd\').',
      ],
    },
  });
  H.steps(s, [
    { title: 'Preparar datos', body: 'Genera 500 000 pedidos en la base de datos Ventas.' },
    { title: 'Línea base', body: 'Activa STATISTICS IO y plan real (Ctrl+M); anota las lecturas.' },
    { title: 'Crear índices', body: 'Crea el índice simple y luego la versión con INCLUDE.' },
    { title: 'Comparar', body: 'Repite la consulta y compara operador y lecturas lógicas.' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.6, dir: 'h', gap: 0.35, size: 14 });
  H.code(s, {
    x: 0.6, y: 4.65, w: 5.9, h: 2.1, size: 12, label: 'T-SQL · LÍNEA BASE',
    code: C(
      'USE Ventas;',
      'SET STATISTICS IO, TIME ON;',
      'SELECT PedidoId, FechaPedido, Total',
      'FROM dbo.Pedido',
      'WHERE ClienteId = 4217',
      '  AND FechaPedido >= \'20240101\';',
      '-- Anota: operador y logical reads'
    ),
  });
  H.code(s, {
    x: 6.83, y: 4.65, w: 5.9, h: 2.1, size: 12, label: 'T-SQL · CREAR Y MEJORAR EL ÍNDICE',
    code: C(
      'CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha',
      '  ON dbo.Pedido (ClienteId, FechaPedido);',
      '-- Lookup: añade INCLUDE y recrea',
      'CREATE NONCLUSTERED INDEX IX_Pedido_Cli_Fecha',
      '  ON dbo.Pedido (ClienteId, FechaPedido)',
      '  INCLUDE (Total)',
      '  WITH (DROP_EXISTING = ON);'
    ),
  });

  // ───────────────────────── 58 · Lab 3.2 ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Laboratorio 3.2',
    title: 'Lab 3.2 · Analizar planes de ejecución',
    lab: true,
    notes: {
      obj: 'Practicar la lectura de planes reales: contrastar un predicado no SARGable con uno SARGable, localizar un Key Lookup y registrar lecturas y desviaciones de cardinalidad.',
      guion: [
        'Duración orientativa: 30–35 minutos. Requiere haber completado el Lab 3.1 (tablas Ventas.dbo.Pedido con 500.000 filas).',
        'Objetivo: tres consultas casi idénticas con planes muy distintos. A) YEAR(FechaPedido) = 2024 obliga a evaluar la función sobre cada fila: Index Scan; B) rango de fechas SARGable: Index Seek; C) consulta que pide Total sobre un índice que no lo incluye: Seek + Key Lookup.',
        'Pedir que cada pareja rellene una tabla con operador, logical reads, Estimated vs Actual Rows y si hay warnings, y que justifique cuál es la mejor versión y por qué.',
        'Cerrar con una puesta en común: ¿qué cambio de código (no de índice) mejoró más? Insistir en que reescribir predicados suele ser más barato que crear índices.',
      ],
      preguntas: [
        '¿Por qué en la consulta A el optimizador no puede hacer un Seek aunque exista el índice sobre FechaPedido?',
        '¿Qué indica que Estimated Rows y Actual Rows difieran mucho en la consulta C y qué haríais para corregirlo?',
      ],
      lab: [
        'PASO 1 · SET STATISTICS IO ON; activar Ctrl+M. Crear el índice: CREATE NONCLUSTERED INDEX IX_Pedido_Fecha ON dbo.Pedido (FechaPedido);',
        'PASO 2 · Consulta A (no SARGable): SELECT PedidoId FROM dbo.Pedido WHERE YEAR(FechaPedido) = 2024; Resultado esperado: Index Scan sobre IX_Pedido_Fecha, lecturas lógicas altas. Anotar operador, logical reads y Estimated/Actual Rows.',
        'PASO 3 · Consulta B (SARGable): SELECT PedidoId FROM dbo.Pedido WHERE FechaPedido >= \'20240101\' AND FechaPedido < \'20250101\'; Resultado esperado: Index Seek con las mismas filas. Comparar lecturas con A.',
        'PASO 4 · Consulta C: SELECT PedidoId, Total FROM dbo.Pedido WHERE FechaPedido = \'20240315\'; Resultado esperado: Index Seek + Key Lookup (Total no está en el índice). Abrir las propiedades del Key Lookup (F4) y ver Number of Executions.',
        'PASO 5 · Resolver C: CREATE NONCLUSTERED INDEX IX_Pedido_Fecha ON dbo.Pedido (FechaPedido) INCLUDE (Total) WITH (DROP_EXISTING = ON); y repetir. El Key Lookup desaparece.',
        'PASO 6 · Opcional: en el plan, clic derecho → Show Execution Plan XML y localizar CardinalityEstimationModelVersion y StatementOptmLevel; luego comparar con ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = ON; (volver a OFF al terminar).',
        'TRAMPAS HABITUALES: (a) comparar planes estimados en lugar de reales; (b) el optimizador elige Scan en la consulta B si el año consultado abarca gran parte de la tabla: probar con un mes en vez de un año; (c) mezclar tipos (comparar con un literal NVARCHAR o con una columna de otro tipo) provoca CONVERT_IMPLICIT y warnings; (d) el plan cacheado de ejecuciones previas: usar OPTION (RECOMPILE) si hay dudas con parametrización.',
        'GUÍA DE RESOLUCIÓN: si B no hace Seek, comprobar que el índice IX_Pedido_Fecha existe (sys.indexes) y que se ha ejecutado en la base Ventas; si hay desviación de estimaciones, UPDATE STATISTICS dbo.Pedido WITH FULLSCAN y repetir.',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 6.9, h: 3.95, size: 13, label: 'T-SQL · TRES CONSULTAS, TRES PLANES',
    code: C(
      'SET STATISTICS IO ON;',
      'CREATE NONCLUSTERED INDEX IX_Pedido_Fecha',
      '    ON dbo.Pedido (FechaPedido);',
      '-- A) No SARGable: función sobre la columna',
      'SELECT PedidoId FROM dbo.Pedido',
      'WHERE YEAR(FechaPedido) = 2024;',
      '-- B) SARGable: rango',
      'SELECT PedidoId FROM dbo.Pedido',
      'WHERE FechaPedido >= \'20240101\'',
      '  AND FechaPedido <  \'20250101\';',
      '-- C) Seek + Key Lookup (pide Total)',
      'SELECT PedidoId, Total FROM dbo.Pedido',
      'WHERE FechaPedido = \'20240315\';'
    ),
  });
  H.table(s, [
    ['Qué anotar', 'Dónde verlo'],
    ['Operador (Scan/Seek)', 'Plan real (Ctrl+M)'],
    ['Logical reads', 'Pestaña Messages'],
    ['Estimated vs Actual', 'Propiedades (F4)'],
    ['Warnings', 'Triángulo amarillo'],
  ], { x: 7.8, y: 1.75, w: 4.93, colW: [2.5, 2.43], size: 14, maxH: 2.6 });
  H.callout(s, { x: 7.8, y: 4.4, w: 4.93, h: 1.3, kind: 'warn', size: 14, lead: 'Trampa:', text: 'compara siempre planes reales y repite cada consulta 2–3 veces.' });
  H.callout(s, { x: 0.6, y: 6.0, w: 12.13, h: 0.75, kind: 'tip', size: 14, lead: 'Entrega:', text: 'tabla con operador, lecturas lógicas y desviación estimado/real de A, B y C.' });

  // ───────────────────────── 59 · Lab 3.3 ─────────────────────────
  s = H.slide(pres, {
    mod: 3,
    badge: 'Laboratorio 3.3',
    title: 'Lab 3.3 · Cuellos de botella con DMVs',
    lab: true,
    notes: {
      obj: 'Provocar un bloqueo controlado y localizarlo con DMVs (sys.dm_exec_requests, sys.dm_os_waiting_tasks, sys.dm_os_wait_stats), identificando al head blocker y resolviendo la incidencia.',
      guion: [
        'Duración orientativa: 30 minutos. Se necesitan tres pestañas de consulta en SSMS (tres sesiones) contra la base Ventas.',
        'Narrativa: "la aplicación se queda colgada". Un desarrollador dejó una transacción abierta (Sesión 1); otra consulta (Sesión 2) queda bloqueada con LCK_M_S. La Sesión 3 es la del DBA que investiga solo con DMVs.',
        'Conceptos reforzados: blocking_session_id, wait_type LCK_M_*, head blocker, dm_os_waiting_tasks vs dm_exec_requests, y la lectura de dm_os_wait_stats antes/después.',
        'Cuando acabe el laboratorio, es el momento de mencionar READ_COMMITTED_SNAPSHOT (RCSI) como mitigación de bloqueos lector-escritor y de mantener transacciones cortas en la aplicación.',
      ],
      preguntas: [
        '¿Cómo distinguiríais entre una consulta lenta por CPU y una lenta por bloqueo mirando únicamente sys.dm_exec_requests?',
        '¿Es razonable ejecutar KILL sobre el head blocker en producción? ¿Qué información necesitáis antes?',
      ],
      lab: [
        'PASO 1 · SESIÓN 1 (pestaña 1): USE Ventas; BEGIN TRAN; UPDATE dbo.Cliente SET Activo = 0 WHERE ClienteId = 1; (no ejecutar COMMIT). Anotar el SPID con SELECT @@SPID;',
        'PASO 2 · SESIÓN 2 (pestaña 2): USE Ventas; SELECT Nombre FROM dbo.Cliente WHERE ClienteId = 1; La consulta queda "Ejecutando…" sin devolver resultados (bloqueada por LCK_M_S).',
        'PASO 3 · SESIÓN 3 (pestaña 3, la del DBA): SELECT r.session_id, r.blocking_session_id, r.wait_type, r.wait_time, t.text FROM sys.dm_exec_requests AS r CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS t WHERE r.blocking_session_id <> 0; Resultado esperado: la sesión 2 con blocking_session_id = SPID de la sesión 1 y wait_type LCK_M_S.',
        'PASO 4 · Ver la vista instantánea de esperas: SELECT session_id, wait_type, wait_duration_ms, blocking_session_id, resource_description FROM sys.dm_os_waiting_tasks WHERE session_id > 50; Localizar el head blocker (el SPID que aparece como bloqueante y no espera). Con sys.dm_exec_sessions comprobar login_name, host_name y program_name del responsable.',
        'PASO 5 · Resolver: en la Sesión 1 ejecutar ROLLBACK; (o KILL <spid> desde la sesión 3 en un caso real tras confirmar con el responsable). La Sesión 2 se completa.',
        'PASO 6 · Revisar esperas acumuladas: SELECT TOP (5) wait_type, wait_time_ms FROM sys.dm_os_wait_stats ORDER BY wait_time_ms DESC; y comentar que LCK_M_S de este experimento es insignificante frente a las esperas del sistema; por eso se necesitan dos snapshots.',
        'TRAMPAS HABITUALES: (a) la sesión 3 usa la misma pestaña que la 1 o 2 y queda bloqueada también: abrir pestañas distintas; (b) READ_COMMITTED_SNAPSHOT ON en la base evita el bloqueo del SELECT: comprobar con SELECT is_read_committed_snapshot_on FROM sys.databases WHERE name = N\'Ventas\'; (c) sin permiso VIEW SERVER STATE las DMVs fallan o devuelven vacío; (d) olvidar cerrar la transacción al final y dejar la tabla bloqueada para otros grupos.',
        'GUÍA DE RESOLUCIÓN: si no ves bloqueo, repetir con SET TRANSACTION ISOLATION LEVEL READ COMMITTED en la sesión 2 o actualizar la misma fila; para ver también las transacciones abiertas usar DBCC OPENTRAN o sys.dm_tran_active_transactions.',
      ],
    },
  });
  H.steps(s, [
    { title: 'Provocar un bloqueo', body: 'Sesión 1 abre una transacción con UPDATE sin COMMIT; Sesión 2 ejecuta un SELECT.' },
    { title: 'Localizar la espera', body: 'En Sesión 3 consulta sys.dm_exec_requests y sys.dm_os_waiting_tasks (LCK_M_S).' },
    { title: 'Resolver y revisar', body: 'Identifica al head blocker, haz ROLLBACK y revisa sys.dm_os_wait_stats.' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.7, dir: 'v', gap: 0.2, size: 14 });
  H.code(s, {
    x: 0.6, y: 4.75, w: 5.9, h: 2.0, size: 12, label: 'T-SQL · SESIONES 1 Y 2',
    code: C(
      '-- Sesión 1: transacción sin cerrar',
      'BEGIN TRAN;',
      'UPDATE dbo.Cliente SET Activo = 0',
      'WHERE ClienteId = 1;',
      '-- Sesión 2: queda bloqueada',
      'SELECT Nombre FROM dbo.Cliente',
      'WHERE ClienteId = 1;'
    ),
  });
  H.code(s, {
    x: 6.83, y: 4.75, w: 5.9, h: 2.0, size: 12, label: 'T-SQL · SESIÓN 3 (DBA)',
    code: C(
      'SELECT r.session_id, r.blocking_session_id,',
      '       r.wait_type, r.wait_time, t.text',
      'FROM sys.dm_exec_requests AS r',
      'CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t',
      'WHERE r.blocking_session_id <> 0;',
      '-- Resolver: ROLLBACK en la sesión 1'
    ),
  });

  // ───────────────────────── 60 · Resumen ─────────────────────────
  H.closing(pres, {
    mod: 3,
    title: 'Módulo 3: puntos clave',
    points: [
      { icon: 'FaProjectDiagram', title: 'Diseño de índices', text: 'Clustered estrecho y creciente; NCI con INCLUDE; vigila el coste de escritura.' },
      { icon: 'FaSearch', title: 'Diagnóstico', text: 'Plan real, STATISTICS IO y DMVs: mide antes de cambiar y compara después.' },
      { icon: 'FaTools', title: 'Mantenimiento', text: 'Reorganize 5–30 %, Rebuild > 30 %, estadísticas al día y fillfactor justificado.' },
      { icon: 'FaShieldAlt', title: 'HA/DR', text: 'Define RTO y RPO primero; elige Log Shipping, FCI o AG según edición y coste.' },
    ],
    notes: {
      obj: 'Consolidar los cuatro mensajes del módulo (diseño de índices, diagnóstico, mantenimiento y HA/DR) y repasar los errores más frecuentes antes de pasar al Módulo 4.',
      guion: [
        'Recapitular con el ciclo: medir → hipótesis → cambio → volver a medir. Cada herramienta del módulo (plan real, STATISTICS IO/TIME, DMVs, Query Store) sirve a una de esas fases.',
        'Índices: un Clustered Index estrecho, único, estático y creciente; NCI diseñados para las consultas críticas, con la clave en orden igualdad → rango y columnas de lectura en INCLUDE; revisar user_updates frente a user_seeks para eliminar índices inútiles.',
        'Errores comunes: crear índices a ciegas copiando Missing Index DMVs; reconstruir todos los índices cada noche con el mismo umbral; no ajustar el nivel de compatibilidad ni el CE tras migrar; predicados no SARGable (funciones sobre columnas, conversiones implícitas); confiar en el Coste % del plan como si fuera tiempo.',
        'Mantenimiento: sys.dm_db_index_physical_stats en modo LIMITED, reorganizar entre 5 y 30 %, reconstruir por encima de 30 % en índices de más de ~1000 páginas; mantener estadísticas actualizadas (el REBUILD ya lo hace con FULLSCAN; tras REORGANIZE, actualizarlas aparte).',
        'HA/DR: empezar siempre por RTO y RPO acordados con el negocio; Log Shipping (simple, manual), FCI (instancia, almacenamiento compartido), AG (base de datos, réplicas síncronas/asíncronas) y recordar que ninguna sustituye a los backups (Módulo 4).',
        'Transición: en el Módulo 4 se automatiza el mantenimiento de índices y estadísticas, se diseña la estrategia de backups y restauración, y se practican incidencias reales (LDF lleno, tempdb, deadlocks).',
      ],
      preguntas: [
        '¿Qué cambio de este módulo aplicaríais primero mañana en vuestro entorno real y cómo mediríais que ha funcionado?',
        '¿Qué diferencia hay entre "alta disponibilidad" y "copia de seguridad" tras lo visto? Comparad con la respuesta de inicio del módulo.',
      ],
    },
  });
};
