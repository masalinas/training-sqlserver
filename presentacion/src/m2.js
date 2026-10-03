'use strict';
/**
 * m2.js — MÓDULO 2 «Gestión y Seguridad (DDL, DML y Seguridad)» · 22 diapositivas (nº 21–42) · ~7 h.
 * BD de ejemplo coherente en todo el módulo: Ventas (dbo.Cliente, dbo.Pedido) + schemas rpt / app.
 */
module.exports = async (pres, H, D) => {
  const C = H.COL;
  const MOD = 2;
  const mk = (badge, title, notes, lab = false) => H.slide(pres, { mod: MOD, badge, title, notes, lab });

  // ───────────────────────── 21 · Separador de módulo ─────────────────────────
  H.divider(pres, {
    mod: MOD,
    title: 'Gestión y Seguridad',
    subtitle: 'DDL, DML y modelo de seguridad de SQL Server',
    hours: '~7 h',
    topics: [
      { icon: 'FaTable', text: 'Tablas, restricciones y vistas' },
      { icon: 'FaCogs', text: 'Procedimientos almacenados y plan cache' },
      { icon: 'FaProjectDiagram', text: 'JOINs, subconsultas y window functions' },
      { icon: 'FaUserShield', text: 'Logins, users, roles y permisos' },
      { icon: 'FaLink', text: 'Ownership chaining y mínimo privilegio' },
      { icon: 'FaFlask', text: 'Laboratorio 2: consultas y permisos' },
    ],
    notes: {
      obj: 'Situar al grupo en el recorrido del módulo: primero se construyen y consultan los datos (DDL y DML) y después se protegen (seguridad). Las dos mitades comparten la misma BD de ejemplo, Ventas.',
      guion: [
        'Este módulo es el más práctico del curso (~7 h): alterna teoría breve con T-SQL que los alumnos ejecutan en su instancia (Docker o local).',
        'Hilo conductor: la base de datos Ventas con dbo.Cliente y dbo.Pedido. Todos los ejemplos, el Laboratorio 2A y el 2B reutilizan esas tablas, de modo que cada concepto se apoya en el anterior.',
        'Bloque 1 (DDL): tablas con restricciones, vistas estándar e indexadas, procedimientos almacenados y cómo el motor cachea y recompila planes (Plan Cache).',
        'Bloque 2 (DML avanzado): orden lógico del SELECT, JOINs lógicos y sus tres algoritmos físicos (Nested Loops, Merge, Hash), subconsultas, CTE y window functions.',
        'Bloque 3 (seguridad): autenticación, jerarquía Login → User → Rol → Permiso, GRANT/DENY/REVOKE, ownership chaining, mínimo privilegio y auditoría básica.',
        'Aviso de planificación: Laboratorio 2A tras DML (~1 h) y Laboratorio 2B al final de seguridad (~1 h). Si el grupo va justo de tiempo, se recortan ejercicios opcionales, nunca los pasos de verificación.',
        'Requisito previo: SSMS o Azure Data Studio conectados a una instancia 2019/2022 con permisos de sysadmin (para crear logins y bases de datos).',
      ],
      preguntas: [
        '¿Qué parte de vuestro trabajo actual depende más de que el modelo de datos esté bien definido (integridad) y cuál de que esté bien protegido?',
        '¿Alguna vez habéis visto una aplicación conectándose con sa o con un usuario db_owner? ¿Qué podría salir mal?',
      ],
    },
  });

  // ───────────────────────── 22 · Creación de tablas y restricciones ─────────────────────────
  let s = mk('DDL', 'Creación de tablas y restricciones', {
    obj: 'Que el alumno sepa declarar tablas con las cinco restricciones básicas (PK, FK, CHECK, UNIQUE, DEFAULT) y entienda qué hace el motor internamente con cada una.',
    guion: [
      'Mostrar el script de dbo.Cliente y dbo.Pedido línea a línea. Se nombran explícitamente todas las restricciones (PK_, FK_, UQ_, CK_, DF_): si no, SQL Server genera nombres con sufijo aleatorio (p. ej. PK__Cliente__A1B2C3) que complican los scripts de despliegue y las comparaciones entre entornos.',
      'PRIMARY KEY: identifica la fila, obliga a NOT NULL y crea un índice único; por defecto es CLUSTERED salvo que ya exista uno. Elegir una clave estrecha, estática y creciente (IDENTITY) reduce Page Splits y el tamaño de todos los índices non-clustered, que incluyen la clave del clustered.',
      'UNIQUE: crea un índice único non-clustered. Admite un solo NULL por columna (a diferencia de la norma ANSI). Para «único salvo NULL» se usa un índice filtrado: CREATE UNIQUE INDEX ... WHERE Col IS NOT NULL.',
      'FOREIGN KEY: garantiza integridad referencial, pero SQL Server NO crea el índice en la columna hija. Sin índice, un DELETE en el padre obliga a escanear la tabla hija. Es el error de diseño más frecuente.',
      'CHECK: se evalúa en INSERT/UPDATE; si es «trusted», el optimizador la usa para eliminar ramas imposibles del plan. DEFAULT: se aplica cuando la columna se omite en el INSERT; es una restricción a nivel de columna.',
      'Tipos de datos: DECIMAL(12,2) para importes (nunca FLOAT/MONEY por redondeos), DATETIME2(0) en lugar de DATETIME (más preciso y compacto), NVARCHAR sólo si se necesita Unicode.',
      'Consultar el catálogo: sys.key_constraints, sys.foreign_keys, sys.check_constraints, sys.default_constraints; o EXEC sp_help N\'dbo.Pedido\'.',
    ],
    preguntas: [
      '¿Qué pasaría con un DELETE de un cliente que tiene 2 millones de pedidos si la FK no tiene índice de apoyo?',
      '¿Es mejor validar una regla de negocio en la aplicación, con un CHECK o con ambas? ¿Quién protege la BD de otra aplicación que escriba directamente?',
    ],
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.4, h: 5.0, size: 12, label: 'T-SQL · BD Ventas',
    code: `CREATE TABLE dbo.Cliente (
  ClienteId INT IDENTITY(1,1) NOT NULL,
  Email     NVARCHAR(150) NOT NULL,
  Nombre    NVARCHAR(100) NOT NULL,
  Alta      DATETIME2(0)  NOT NULL
            CONSTRAINT DF_Cliente_Alta DEFAULT SYSDATETIME(),
  CONSTRAINT PK_Cliente PRIMARY KEY (ClienteId),
  CONSTRAINT UQ_Cliente_Email UNIQUE (Email)
);

CREATE TABLE dbo.Pedido (
  PedidoId  INT IDENTITY(1,1) NOT NULL,
  ClienteId INT NOT NULL,
  Fecha     DATE NOT NULL,
  Total     DECIMAL(12,2) NOT NULL,
  CONSTRAINT PK_Pedido PRIMARY KEY (PedidoId),
  CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (ClienteId)
            REFERENCES dbo.Cliente (ClienteId),
  CONSTRAINT CK_Pedido_Total CHECK (Total >= 0)
);`,
  });
  H.card(s, {
    x: 8.3, y: 1.75, w: 4.43, h: 5.0, title: 'Las cinco restricciones', icon: 'FaKey', size: 14,
    bullets: [
      { lead: 'PK:', text: 'identifica la fila; crea índice clustered' },
      { lead: 'FK:', text: 'integridad referencial; sin índice automático' },
      { lead: 'UNIQUE:', text: 'valores no repetidos (índice único)' },
      { lead: 'CHECK:', text: 'regla de dominio por fila' },
      { lead: 'DEFAULT:', text: 'valor si se omite la columna' },
    ],
  });

  // ───────────────────────── 23 · Errores comunes DDL ─────────────────────────
  s = mk('Buenas prácticas', 'Errores comunes en el diseño DDL', {
    obj: 'Interiorizar los seis errores de diseño más habituales en producción y su consecuencia medible en rendimiento o integridad.',
    guion: [
      'Tabla sin PK (heap): permite duplicados, complica replicación transaccional, CDC y los UPDATE/DELETE con forwarded records. Salvo staging, toda tabla debe tener PK.',
      'FK sin índice en la columna hija: provoca scans y bloqueos largos al borrar o actualizar en el padre. Detectarlo con sys.foreign_keys cruzado con sys.index_columns.',
      'WITH NOCHECK: añade la restricción sin validar los datos existentes y la marca como no confiable (sys.foreign_keys.is_not_trusted = 1). El optimizador no puede usarla y pierde optimizaciones como la eliminación de joins. Reparar con ALTER TABLE ... WITH CHECK CHECK CONSTRAINT.',
      'VARCHAR vs NVARCHAR: NVARCHAR usa 2 bytes por carácter; mezclarlos en un JOIN o WHERE genera conversión implícita (CONVERT_IMPLICIT en el plan) y puede impedir un Index Seek por precedencia de tipos.',
      'GUID aleatorio como clustered key (NEWID()): inserciones por toda la B-Tree, Page Splits, fragmentación y Buffer Pool ineficiente. Alternativas: IDENTITY, SEQUENCE o NEWSEQUENTIALID().',
      'Tipos sobredimensionados (BIGINT, VARCHAR(MAX), CHAR(500)): más páginas de 8 KB, más I/O y más memoria de Buffer Pool para el mismo dato; y VARCHAR(MAX) no se puede indexar como clave.',
      'Regla práctica: el diseño físico se revisa con la herramienta de los datos, no con intuición: sys.dm_db_index_usage_stats y los planes de ejecución.',
    ],
    preguntas: [
      '¿Cuál de estos errores creéis que existe hoy en alguna de vuestras bases de datos? ¿Cómo lo detectaríais con una consulta al catálogo?',
      '¿Por qué un GUID aleatorio es mala idea como clustered key, pero puede ser aceptable como clave no agrupada?',
    ],
  });
  H.cardsGrid(s, [
    { title: 'Tabla sin clave primaria', icon: 'FaKey', body: 'Un heap sin PK admite duplicados y complica replicación y CDC. Define siempre una PK.' },
    { title: 'FK sin índice de apoyo', icon: 'FaLink', body: 'SQL Server no indexa la FK: un DELETE en el padre escanea la tabla hija y bloquea.' },
    { title: 'Restricciones WITH NOCHECK', icon: 'FaBan', body: 'La restricción queda «no confiable» y el optimizador deja de aprovecharla.' },
    { title: 'VARCHAR mezclado con NVARCHAR', icon: 'FaFont', body: 'La conversión implícita puede impedir un Index Seek y dispara la CPU.' },
    { title: 'GUID aleatorio como clustered', icon: 'FaRandom', body: 'NEWID() fragmenta el índice con Page Splits. Prefiere IDENTITY o NEWSEQUENTIALID().' },
    { title: 'Tipos sobredimensionados', icon: 'FaExpandArrowsAlt', body: 'Más páginas, más I/O y más memoria en el Buffer Pool para el mismo dato.' },
  ], { cols: 3, titleSize: 16, size: 14 });

  // ───────────────────────── 24 · Vistas estándar vs indexadas ─────────────────────────
  s = mk('Vistas', 'Vistas estándar frente a vistas indexadas', {
    obj: 'Distinguir una vista estándar (consulta almacenada, sin datos) de una vista indexada (resultado materializado) y saber cuándo conviene cada una.',
    guion: [
      'Vista estándar: sólo se guarda la definición en sys.sql_modules. Al consultarla, el optimizador la expande (view expansion) dentro de la consulta externa y genera un único plan; no hay penalización ni ganancia de rendimiento por sí misma.',
      'Usos: abstraer joins complejos, ocultar columnas sensibles y dar un punto de seguridad estable (GRANT SELECT sobre la vista sin dar acceso a la tabla; el ownership chaining lo hace posible).',
      'Anidar vistas sobre vistas es un antipatrón: cada capa añade joins que el optimizador debe simplificar y los planes se vuelven difíciles de leer.',
      'Vista indexada (materializada): al crear sobre ella un UNIQUE CLUSTERED INDEX, SQL Server almacena físicamente el resultado y lo mantiene sincronizado en cada INSERT/UPDATE/DELETE de las tablas base (coste en escrituras).',
      'En ediciones Enterprise/Developer el optimizador puede usar la vista indexada aunque la consulta no la nombre (matching automático); en Standard hay que usar la pista WITH (NOEXPAND).',
      'Cuándo usarla: agregaciones costosas y muy repetidas sobre tablas de lectura intensiva (informes, dashboards). Cuándo no: tablas con alta tasa de escritura, porque cada DML paga el mantenimiento.',
      'Consulta útil: SELECT name, type_desc FROM sys.views; y sys.indexes WHERE object_id = OBJECT_ID(\'dbo.vVentasCliente\').',
    ],
    preguntas: [
      '¿Una vista estándar mejora el rendimiento de una consulta? ¿Por qué sí o por qué no?',
      'Si una tabla recibe 5 000 inserciones por segundo, ¿pondríais una vista indexada sobre ella? ¿Qué medirías antes de decidir?',
    ],
  });
  H.card(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 3.2, title: 'Vista estándar', icon: 'FaEye', size: 14,
    bullets: ['Consulta guardada, sin datos propios', 'Se expande dentro de la consulta externa', 'Simplifica joins y centraliza permisos', 'Coste = el de la consulta subyacente'],
  });
  H.card(s, {
    x: 6.83, y: 1.75, w: 5.9, h: 3.2, title: 'Vista indexada', icon: 'FaDatabase', tone: 'dark', size: 14,
    bullets: ['Resultado materializado en un índice', 'Se mantiene en cada INSERT, UPDATE y DELETE', 'Acelera agregaciones repetitivas', 'Exige SCHEMABINDING y penaliza escrituras'],
  });
  H.code(s, {
    x: 0.6, y: 5.25, w: 12.13, h: 1.5, size: 12, label: 'T-SQL · vista estándar',
    code: `CREATE VIEW dbo.vPedidoCliente AS
SELECT c.ClienteId, c.Nombre, p.PedidoId, p.Fecha, p.Total
FROM   dbo.Cliente AS c JOIN dbo.Pedido AS p ON p.ClienteId = c.ClienteId;`,
  });

  // ───────────────────────── 25 · Vistas indexadas: requisitos ─────────────────────────
  s = mk('Vistas', 'Vistas indexadas: SCHEMABINDING y requisitos', {
    obj: 'Crear correctamente una vista indexada conociendo sus restricciones y sus costes de mantenimiento.',
    guion: [
      'WITH SCHEMABINDING enlaza la vista a las tablas base: impide ALTER/DROP de columnas usadas mientras la vista exista. Obliga a nombres de dos partes (dbo.Pedido) y prohíbe SELECT *.',
      'Si la vista agrupa (GROUP BY), debe incluir COUNT_BIG(*): permite al motor mantener el resultado de forma incremental al borrar filas. SUM sólo sobre expresiones no nulables (aquí Total es NOT NULL).',
      'Construcciones prohibidas: OUTER JOIN, subconsultas, DISTINCT, TOP, UNION, MIN/MAX/AVG, ORDER BY, CTE, tablas derivadas y auto-joins. Expresiones no deterministas (GETDATE) tampoco.',
      'El primer índice debe ser UNIQUE CLUSTERED; después se pueden crear índices non-clustered adicionales sobre la vista.',
      'Opciones SET requeridas al crearla y al modificar las tablas base: ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL y QUOTED_IDENTIFIER en ON; NUMERIC_ROUNDABORT en OFF. SSMS las trae bien por defecto; ciertos drivers antiguos no (error 1934).',
      'Consumo: en Standard hay que escribir WITH (NOEXPAND); en Enterprise el optimizador puede usarla automáticamente. Verificar en el plan: ¿aparece un Clustered Index Scan sobre la vista o se expande a las tablas base?',
      'Advertencia de rendimiento: cada INSERT sobre dbo.Pedido provoca también una modificación en el índice de la vista, con su bloqueo y su log. Medir con SET STATISTICS IO y sys.dm_db_index_operational_stats.',
    ],
    preguntas: [
      '¿Por qué creéis que se exige COUNT_BIG(*) cuando hay GROUP BY?',
      'Un desarrollador quiere borrar una columna de dbo.Pedido y recibe un error de dependencia. ¿Qué lo causa y cómo lo localizaríais?',
    ],
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 6.9, h: 3.75, size: 13, label: 'T-SQL · vista indexada',
    code: `CREATE VIEW dbo.vVentasCliente
WITH SCHEMABINDING
AS
SELECT  p.ClienteId,
        COUNT_BIG(*)  AS NumPedidos,
        SUM(p.Total)  AS TotalVentas
FROM    dbo.Pedido AS p
GROUP BY p.ClienteId;
GO
CREATE UNIQUE CLUSTERED INDEX IX_vVentasCliente
    ON dbo.vVentasCliente (ClienteId);
GO
SELECT * FROM dbo.vVentasCliente WITH (NOEXPAND);`,
  });
  H.callout(s, {
    x: 0.6, y: 5.8, w: 6.9, h: 0.95, kind: 'warn', lead: 'Coste:', size: 14,
    text: 'cada DML sobre dbo.Pedido también actualiza la vista.',
  });
  H.card(s, {
    x: 7.8, y: 1.75, w: 4.93, h: 5.0, title: 'Requisitos principales', icon: 'FaClipboardCheck', size: 14,
    bullets: [
      { lead: 'SCHEMABINDING', text: 'y nombres de dos partes' },
      { lead: 'COUNT_BIG(*)', text: 'si hay GROUP BY' },
      'Sin OUTER JOIN, subconsultas, DISTINCT, TOP, UNION ni MIN/MAX',
      { lead: 'Primer índice:', text: 'UNIQUE CLUSTERED' },
      'Opciones SET: ARITHABORT, ANSI_NULLS y QUOTED_IDENTIFIER en ON',
      { lead: 'Standard:', text: 'usar NOEXPAND' },
    ],
  });

  // ───────────────────────── 26 · Procedimientos almacenados ─────────────────────────
  s = mk('Programabilidad', 'Procedimientos almacenados', {
    obj: 'Entender qué aporta un procedimiento almacenado (rendimiento, encapsulación y seguridad) y escribir uno con las buenas prácticas básicas.',
    guion: [
      'Un procedimiento almacenado (stored procedure, SP) es código T-SQL con nombre guardado en la BD. Se compila en la primera ejecución y el plan queda en el Plan Cache para reutilizarse.',
      'Parámetros tipados: evitan la concatenación de cadenas y, con ella, la inyección SQL. Un parámetro con DEFAULT lo hace opcional.',
      'SET NOCOUNT ON suprime los mensajes «n filas afectadas»: reduce tráfico de red y evita que algunos drivers interpreten esos mensajes como resultados.',
      'CREATE OR ALTER (desde SQL Server 2016 SP1) conserva permisos y metadatos al modificar, a diferencia de DROP + CREATE que obliga a reasignar GRANTs.',
      'Seguridad: se puede dar EXECUTE sobre el procedimiento sin dar permisos sobre las tablas gracias al ownership chaining (se verá en la parte de seguridad). Es la «API» de la BD.',
      'Gestión de errores y transacciones: TRY...CATCH, THROW y SET XACT_ABORT ON para que cualquier error aborte y revierta la transacción abierta.',
      'Metadatos útiles: sys.procedures, sys.sql_modules (definición), sys.dm_exec_procedure_stats (veces ejecutado, tiempo, lecturas lógicas por procedimiento).',
    ],
    preguntas: [
      '¿Qué ventajas tiene dar EXECUTE sobre un procedimiento frente a dar SELECT/INSERT sobre las tablas?',
      '¿En qué se diferencia un procedimiento almacenado de una consulta enviada como cadena desde la aplicación (ad hoc)?',
    ],
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.4, h: 5.0, size: 14, label: 'T-SQL · procedimiento',
    code: `CREATE OR ALTER PROCEDURE dbo.usp_PedidosPorCliente
    @ClienteId INT,
    @Desde     DATE = '19000101'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.PedidoId, p.Fecha, p.Total
    FROM   dbo.Pedido AS p
    WHERE  p.ClienteId = @ClienteId
      AND  p.Fecha >= @Desde
    ORDER BY p.Fecha DESC;
END;
GO
EXEC dbo.usp_PedidosPorCliente @ClienteId = 42;`,
  });
  H.card(s, {
    x: 8.3, y: 1.75, w: 4.43, h: 5.0, title: 'Por qué usarlos', icon: 'FaCogs', size: 14,
    bullets: [
      'Plan reutilizable en el Plan Cache',
      'EXECUTE sin dar acceso a las tablas',
      'Lógica encapsulada con TRY...CATCH',
      'SET NOCOUNT ON reduce tráfico',
      'Parámetros tipados frente a SQL concatenado',
    ],
  });

  // ───────────────────────── 27 · Plan caching, sniffing, recompilaciones ─────────────────────────
  s = mk('Programabilidad', 'Plan caching, sniffing y recompilaciones', {
    obj: 'Comprender el ciclo compilar → cachear → reutilizar → recompilar y reconocer un problema de parameter sniffing con sus mitigaciones.',
    guion: [
      'Compilar es caro (CPU): parse, binding (algebrizer), optimización basada en costes con estadísticas. El plan resultante se guarda en el Plan Cache, parte del Buffer Pool, y se localiza por un hash del texto de la consulta más atributos (SET options, esquema por defecto).',
      'Reutilizar evita volver a compilar: es la gran ventaja de procedimientos y consultas parametrizadas. Las consultas ad hoc con literales distintos generan un plan cada una (cache bloat); mitigación: parametrizar, «optimize for ad hoc workloads» o PARAMETERIZATION FORCED.',
      'Parameter sniffing: en la primera ejecución el optimizador «espía» el valor real del parámetro y construye un plan óptimo para ese valor. Si los datos están sesgados (un cliente con 60 % de los pedidos), ese plan (Index Seek + Key Lookup) puede ser desastroso para el valor frecuente (necesita Scan).',
      'No es un bug, es un compromiso. Mitigaciones: OPTION (RECOMPILE) por consulta, OPTION (OPTIMIZE FOR UNKNOWN) o OPTIMIZE FOR (@p = valor), WITH RECOMPILE en el procedimiento, y Query Store con plan forcing (2016+). SQL Server 2022 añade Parameter Sensitive Plan (PSP) optimization con nivel de compatibilidad 160.',
      'Recompilación: el plan se invalida por cambios de esquema, actualización de estadísticas (umbral dinámico en compat. 130+), cambios de SET options, sp_recompile o ALTER del objeto. Desde 2005 la recompilación es a nivel de sentencia, no de todo el procedimiento.',
      'DMVs: sys.dm_exec_cached_plans (usecounts, size_in_bytes), sys.dm_exec_query_stats, sys.dm_exec_sql_text(plan_handle) y sys.dm_exec_query_plan(plan_handle). Contadores: «SQL Re-Compilations/sec» y «Batch Requests/sec».',
      'DBCC FREEPROCCACHE vacía la caché: sólo en entornos de prueba o con un plan_handle concreto; en producción provoca una tormenta de compilaciones.',
    ],
    preguntas: [
      'Un procedimiento va en 20 ms para unos clientes y en 40 s para otros. ¿Qué hipótesis plantearíais y qué mirarías primero en el plan?',
      '¿Por qué vaciar el Plan Cache «para arreglarlo» sólo oculta el problema durante un tiempo?',
    ],
  });
  H.steps(s, [
    { title: 'Compilar', body: 'El optimizador crea el plan con estadísticas y el valor del parámetro.' },
    { title: 'Cachear', body: 'El plan se guarda en el Plan Cache, localizado por hash del texto.' },
    { title: 'Reutilizar', body: 'Las siguientes ejecuciones se saltan la compilación.' },
    { title: 'Recompilar', body: 'Cambios de esquema, estadísticas o SET options lo invalidan.' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.95, size: 14 });
  H.code(s, {
    x: 0.6, y: 5.0, w: 7.5, h: 1.75, size: 12, label: 'T-SQL · mitigaciones y DMV',
    code: `-- Mitigaciones de parameter sniffing
EXEC dbo.usp_PedidosPorCliente @ClienteId = 42 WITH RECOMPILE;
-- En la consulta: OPTION (RECOMPILE) / OPTION (OPTIMIZE FOR UNKNOWN)
SELECT TOP (5) usecounts, size_in_bytes, objtype
FROM sys.dm_exec_cached_plans ORDER BY usecounts DESC;`,
  });
  H.callout(s, {
    x: 8.4, y: 5.0, w: 4.33, h: 1.75, kind: 'warn', lead: 'Sniffing:', size: 14,
    text: 'el primer valor compilado fija el plan para todos los demás.',
  });

  // ───────────────────────── 28 · SELECT: orden lógico ─────────────────────────
  s = mk('DML avanzado', 'SELECT complejos: orden lógico de ejecución', {
    obj: 'Aprender que el orden de escritura de un SELECT no es el orden en que se evalúa, y usarlo para razonar sobre alias, filtros y agregados.',
    guion: [
      'El orden lógico (logical query processing) es: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT (incluidas window functions) → DISTINCT → ORDER BY → TOP/OFFSET. Es un modelo conceptual: el optimizador puede reordenar físicamente mientras el resultado sea equivalente.',
      'Consecuencia 1: WHERE no puede usar alias definidos en SELECT (todavía no existen), pero ORDER BY sí. Consecuencia 2: WHERE filtra filas antes de agrupar; HAVING filtra grupos después de agregar.',
      'Consecuencia 3: las window functions se evalúan en la fase SELECT, por eso no pueden aparecer en WHERE ni en GROUP BY; para filtrarlas hay que envolverlas en una CTE o subconsulta.',
      'Rendimiento: filtrar pronto reduce filas. Predicados SARGable (Search ARGument ABLE) como Fecha >= \'20240101\' permiten Index Seek; envolver la columna en una función (YEAR(Fecha) = 2024) obliga a escanear.',
      'Evitar SELECT *: aumenta lecturas, rompe vistas y procedimientos al cambiar el esquema e impide usar índices cubrientes (covering).',
      'El ejemplo agrupa por cliente y año. Pedir a los alumnos que predigan el número de columnas del resultado y qué ocurre si se mueve SUM(p.Total) > 1000 del HAVING al WHERE (error: función de agregado no válida en WHERE).',
      'Mostrar el plan (Ctrl+M) para ver cómo el Stream Aggregate o Hash Match Aggregate aparece antes del Sort.',
    ],
    preguntas: [
      '¿Por qué puedo escribir ORDER BY Ventas DESC usando el alias, pero no WHERE Ventas > 1000?',
      '¿Qué diferencia práctica hay entre filtrar en WHERE y en HAVING cuando la condición no usa agregados?',
    ],
  });
  H.steps(s, [
    { title: 'FROM', body: 'Origen y JOINs' },
    { title: 'WHERE', body: 'Filtra filas' },
    { title: 'GROUP BY', body: 'Agrupa filas' },
    { title: 'HAVING', body: 'Filtra grupos' },
    { title: 'SELECT', body: 'Columnas y OVER' },
    { title: 'ORDER BY', body: 'Ordena y TOP' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.55, size: 14, gap: 0.3 });
  H.code(s, {
    x: 0.6, y: 4.6, w: 7.7, h: 2.15, size: 12, label: 'T-SQL · ventas por cliente y año',
    code: `SELECT   c.Nombre, YEAR(p.Fecha) AS Anio, SUM(p.Total) AS Ventas
FROM     dbo.Cliente AS c
JOIN     dbo.Pedido  AS p ON p.ClienteId = c.ClienteId
WHERE    p.Fecha >= '20240101'
GROUP BY c.Nombre, YEAR(p.Fecha)
HAVING   SUM(p.Total) > 1000
ORDER BY Ventas DESC;`,
  });
  H.callout(s, {
    x: 8.6, y: 4.6, w: 4.13, h: 2.15, kind: 'tip', lead: 'Alias:', size: 14,
    text: 'ORDER BY puede usar alias de SELECT porque se evalúa después; WHERE no.',
  });

  // ───────────────────────── 29 · JOINs lógicos ─────────────────────────
  s = mk('DML avanzado', 'JOINs: tipos lógicos y trampas habituales', {
    obj: 'Elegir el tipo de JOIN lógico adecuado y evitar la trampa clásica de filtrar la tabla externa en el WHERE.',
    guion: [
      'INNER JOIN devuelve sólo filas con coincidencia. LEFT JOIN conserva todas las filas de la izquierda y rellena con NULL; es la base del anti-join (clientes sin pedidos con WHERE p.PedidoId IS NULL).',
      'RIGHT JOIN es equivalente a un LEFT con las tablas invertidas; se evita por legibilidad. FULL JOIN se usa en conciliaciones entre dos fuentes. CROSS JOIN genera el producto cartesiano (n × m filas): útil para calendarios y combinaciones, peligroso si es accidental.',
      'Trampa principal: un predicado sobre la tabla derecha en el WHERE (p.Fecha >= ...) descarta las filas con NULL y convierte el LEFT JOIN en INNER JOIN. Si se quiere conservar los clientes sin pedidos en el rango, el filtro va en la cláusula ON.',
      'Trampa 2: duplicación de filas por relaciones 1:N. Sumar un importe del lado «uno» después de un JOIN a «varios» multiplica el total; agregar antes del JOIN o usar APPLY.',
      'Trampa 3: JOIN con columnas de tipos distintos (varchar vs nvarchar, int vs varchar) → conversión implícita y scans. Las claves de join deben tener el mismo tipo y collation.',
      'Alternativas semánticas: EXISTS / NOT EXISTS para semi y anti-joins (no multiplican filas); NOT IN falla silenciosamente si la subconsulta devuelve algún NULL.',
      'Pedir que ejecuten ambas consultas de la derecha y comparen el número de filas devuelto.',
    ],
    preguntas: [
      '¿Cuántas filas devuelve un CROSS JOIN entre 1 000 clientes y 365 días? ¿Y entre dos tablas de 1 millón?',
      'Si queréis clientes sin pedidos en 2024 (aunque tengan en otros años), ¿dónde pondríais el filtro de fecha y por qué?',
    ],
  });
  H.table(s, [
    ['Tipo', 'Devuelve', 'Uso típico'],
    ['INNER', 'Sólo coincidencias', 'Pedidos con su cliente'],
    ['LEFT', 'Toda la izquierda + NULL', 'Clientes sin pedidos'],
    ['RIGHT', 'Toda la derecha + NULL', 'Poco usado (invertir)'],
    ['FULL', 'Ambos lados completos', 'Conciliaciones'],
    ['CROSS', 'Producto cartesiano', 'Calendarios, combinaciones'],
  ], { x: 0.6, y: 1.75, w: 6.8, colW: [1.2, 2.7, 2.9], size: 13, maxH: 3.4 });
  H.callout(s, {
    x: 0.6, y: 5.55, w: 6.8, h: 1.2, kind: 'warn', lead: 'Trampa:', size: 14,
    text: 'filtrar la tabla derecha en el WHERE convierte el LEFT JOIN en INNER.',
  });
  H.code(s, {
    x: 7.7, y: 1.75, w: 5.03, h: 5.0, size: 13, label: 'T-SQL · LEFT JOIN',
    code: `-- 1) Anti-join: clientes sin pedidos
SELECT c.ClienteId, c.Nombre
FROM   dbo.Cliente AS c
LEFT JOIN dbo.Pedido AS p
       ON p.ClienteId = c.ClienteId
WHERE  p.PedidoId IS NULL;

-- 2) Filtra la tabla derecha en el ON
SELECT c.Nombre, p.PedidoId
FROM   dbo.Cliente AS c
LEFT JOIN dbo.Pedido AS p
       ON p.ClienteId = c.ClienteId
      AND p.Fecha >= '20240101';`,
  });

  // ───────────────────────── 30 · JOINs físicos ─────────────────────────
  s = mk('DML avanzado', 'JOINs: algoritmos físicos del optimizador', {
    obj: 'Reconocer en un plan de ejecución los tres operadores físicos de join, saber cuándo es adecuado cada uno y qué señales indican una mala elección.',
    guion: [
      'Un JOIN lógico se implementa con un operador físico que el optimizador elige por coste, según cardinalidad estimada, índices y orden disponible.',
      'Nested Loops: por cada fila de la entrada externa (outer) busca coincidencias en la interna (inner). Brilla cuando la externa es pequeña y la interna tiene un índice para Index Seek. Coste ≈ filas externas × coste del seek. Es el típico de consultas OLTP.',
      'Merge Join: recorre en paralelo dos entradas ordenadas por la clave de join, una sola pasada. Requiere condición de igualdad y orden (de un índice o de un operador Sort, caro). Muy eficiente con volúmenes grandes ya ordenados.',
      'Hash Match: construye una tabla hash en memoria con la entrada más pequeña (build) y «sondea» con la grande (probe). No necesita índices ni orden; es el caballo de batalla de cargas analíticas. Consume memory grant: si se subestima, se derrama a tempdb (Hash Spill, aviso en el plan).',
      'Señales de problema: Nested Loops con millones de iteraciones (estimación de filas muy baja), warnings de spill en Hash/Sort, diferencias grandes entre Estimated y Actual Rows (estadísticas obsoletas o parameter sniffing).',
      'Pistas de join (OPTION (HASH JOIN), LOOP JOIN, MERGE JOIN) existen pero se usan sólo como último recurso diagnóstico: fijan el algoritmo y ocultan el problema de fondo.',
      'Novedades: Adaptive Joins (2017+, batch mode) deciden entre Hash y Nested Loops en tiempo de ejecución; en 2019+ el batch mode también funciona sobre tablas rowstore. DMVs: sys.dm_exec_query_memory_grants y sys.dm_exec_query_stats.',
    ],
    preguntas: [
      '¿Por qué un Hash Match suele aparecer en consultas analíticas y un Nested Loops en consultas OLTP?',
      'Si veis un Nested Loops con 5 millones de ejecuciones en la entrada interna, ¿qué sospecharíais sobre las estimaciones?',
    ],
  });
  H.cardsRow(s, [
    {
      title: 'Nested Loops', icon: 'FaSyncAlt',
      bullets: ['Por cada fila externa busca en la interna', 'Ideal: externa pequeña + Index Seek', 'Típico en OLTP'],
    },
    {
      title: 'Merge Join', icon: 'FaCodeBranch',
      bullets: ['Recorre dos entradas ordenadas', 'Exige igualdad y orden (índice o Sort)', 'Eficiente con grandes volúmenes'],
    },
    {
      title: 'Hash Match', icon: 'FaHashtag',
      bullets: ['Tabla hash con la entrada pequeña', 'No exige índices ni orden', 'Usa memory grant; puede derramar a tempdb'],
    },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 3.8, size: 14, titleSize: 17 });
  H.callout(s, {
    x: 0.6, y: 5.85, w: 12.13, h: 0.9, kind: 'info', lead: 'En el plan:', size: 14,
    text: 'compara Estimated frente a Actual Rows. Estadísticas obsoletas provocan joins inadecuados.',
  });

  // ───────────────────────── 31 · Subconsultas, EXISTS y CTE ─────────────────────────
  s = mk('DML avanzado', 'Subconsultas, EXISTS y CTE', {
    obj: 'Usar subconsultas escalares y correlacionadas, EXISTS y CTE de forma legible sin penalizar el rendimiento.',
    guion: [
      'Subconsulta escalar: devuelve un único valor y se usa como expresión (Total > (SELECT AVG(Total) ...)). Si devolviera más de una fila, error 512. No correlacionada: se evalúa una vez.',
      'Subconsulta correlacionada: referencia columnas de la consulta externa (p.ClienteId = c.ClienteId). Lógicamente se evalúa por cada fila, pero el optimizador la transforma casi siempre en un semi-join (Left Semi Join) con un coste mucho menor.',
      'EXISTS se detiene en la primera coincidencia y devuelve verdadero/falso; es ideal para «existe algún pedido». IN sobre una lista es equivalente en la mayoría de los casos, pero NOT IN devuelve cero filas si la subconsulta contiene un NULL: preferir NOT EXISTS.',
      'CTE (Common Table Expression, WITH ... AS): mejora la legibilidad y permite recursividad (jerarquías). En SQL Server NO se materializa: se expande como una vista en línea cada vez que se referencia; si se usa 3 veces, se ejecuta 3 veces. Para reutilizar un resultado costoso, usar una tabla temporal #tabla.',
      'CROSS APPLY / OUTER APPLY: permiten invocar una subconsulta correlacionada o una función con valores de tabla por cada fila (típico: «los 3 últimos pedidos de cada cliente»).',
      'Rendimiento: comprobar siempre el plan; una subconsulta en la lista de SELECT correlacionada puede ejecutarse fila a fila (Nested Loops con muchas iteraciones). Reescribir como JOIN agregado suele ser más estable.',
      'Ejercicio rápido: reescribir la consulta EXISTS con un JOIN y comparar los planes y el número de lecturas lógicas con SET STATISTICS IO ON.',
    ],
    preguntas: [
      '¿Qué devuelve WHERE ClienteId NOT IN (SELECT ClienteId FROM ...) si la subconsulta contiene un NULL? ¿Y con NOT EXISTS?',
      '¿Una CTE guarda el resultado en memoria o en tempdb? ¿Cómo lo comprobaríais en el plan de ejecución?',
    ],
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 3.55, size: 12, label: 'T-SQL · subconsulta y EXISTS',
    code: `-- Subconsulta escalar
SELECT PedidoId, Total
FROM   dbo.Pedido
WHERE  Total > (SELECT AVG(Total)
                FROM dbo.Pedido);

-- EXISTS (correlacionada)
SELECT c.Nombre
FROM   dbo.Cliente AS c
WHERE  EXISTS (SELECT 1 FROM dbo.Pedido AS p
               WHERE p.ClienteId = c.ClienteId);`,
  });
  H.code(s, {
    x: 6.83, y: 1.75, w: 5.9, h: 3.55, size: 12, label: 'T-SQL · CTE',
    code: `WITH VentasCliente AS (
    SELECT ClienteId, SUM(Total) AS Ventas
    FROM   dbo.Pedido
    GROUP BY ClienteId
)
SELECT TOP (5) c.Nombre, v.Ventas
FROM   VentasCliente AS v
JOIN   dbo.Cliente  AS c ON c.ClienteId = v.ClienteId
ORDER BY v.Ventas DESC;`,
  });
  H.callout(s, {
    x: 0.6, y: 5.6, w: 12.13, h: 1.15, kind: 'tip', lead: 'Recuerda:', size: 14,
    text: 'NOT IN con algún NULL devuelve cero filas: usa NOT EXISTS. Una CTE no materializa datos: se expande como una vista en línea.',
  });

  // ───────────────────────── 32 · Agregados y window functions ─────────────────────────
  s = mk('DML avanzado', 'Agregados y window functions básicas', {
    obj: 'Diferenciar GROUP BY (colapsa filas) de las window functions (mantienen el detalle) y aplicar ROW_NUMBER, RANK, SUM OVER y LAG.',
    guion: [
      'Funciones de agregado (COUNT, SUM, AVG, MIN, MAX) con GROUP BY colapsan el conjunto en una fila por grupo. Las window functions calculan sobre una «ventana» de filas relacionadas pero devuelven una fila por cada fila de entrada, conservando el detalle.',
      'Sintaxis: función() OVER (PARTITION BY ... ORDER BY ... [ROWS|RANGE ...]). PARTITION BY define los grupos (como un GROUP BY sin colapsar); ORDER BY define el orden dentro de la partición; la cláusula de frame define las filas incluidas.',
      'ROW_NUMBER(): numera 1, 2, 3 sin empates (los desempates son no deterministas si el ORDER BY no es único). RANK(): los empates comparten posición y deja huecos (1, 1, 3); DENSE_RANK() no deja huecos.',
      'SUM(...) OVER (PARTITION BY ... ORDER BY ...): total acumulado (running total). Advertencia de rendimiento: si no se especifica frame, el valor por defecto es RANGE UNBOUNDED PRECEDING, que usa un worktable en disco; especificar ROWS UNBOUNDED PRECEDING es mucho más rápido y suele ser lo que se desea.',
      'LAG(col, n, default) y LEAD(col, n): acceden a filas anterior/siguiente sin auto-join (disponibles desde SQL Server 2012). Útiles para variaciones periodo a periodo.',
      'Las window functions sólo se permiten en SELECT y ORDER BY; para filtrar por rn = 1 («último pedido por cliente») hay que usar CTE/subconsulta. Un índice con PARTITION BY y ORDER BY como claves (en ese orden) evita el operador Sort.',
      'En el plan buscar los operadores Segment, Sequence Project y Window Spool (si aparece Window Spool, revisar el frame).',
    ],
    preguntas: [
      '¿Qué diferencia hay entre ROW_NUMBER y RANK cuando dos pedidos tienen el mismo importe?',
      '¿Cómo obtendríais el último pedido de cada cliente usando una window function? ¿Y con GROUP BY?',
    ],
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.3, h: 3.6, size: 12, label: 'T-SQL · window functions',
    code: `SELECT ClienteId, Fecha, Total,
  ROW_NUMBER() OVER (PARTITION BY ClienteId
                     ORDER BY Fecha DESC) AS rn,
  RANK()       OVER (ORDER BY Total DESC) AS ranking,
  SUM(Total)   OVER (PARTITION BY ClienteId
                     ORDER BY Fecha
                     ROWS UNBOUNDED PRECEDING) AS acumulado,
  LAG(Total)   OVER (PARTITION BY ClienteId
                     ORDER BY Fecha) AS anterior
FROM dbo.Pedido;`,
  });
  H.table(s, [
    ['Función', 'Resultado'],
    ['ROW_NUMBER', '1, 2, 3 sin empates'],
    ['RANK', 'Empates comparten puesto; hay huecos'],
    ['SUM OVER', 'Total acumulado por cliente'],
    ['LAG', 'Valor de la fila anterior'],
  ], { x: 8.2, y: 1.75, w: 4.53, colW: [1.5, 3.03], size: 13, maxH: 3.6 });
  H.callout(s, {
    x: 0.6, y: 5.65, w: 12.13, h: 1.1, kind: 'info', lead: 'GROUP BY vs OVER:', size: 14,
    text: 'GROUP BY colapsa filas; OVER mantiene el detalle. Indica ROWS en el frame para evitar el worktable de RANGE.',
  });

  // ───────────────────────── 33 · LAB 2A ─────────────────────────
  s = mk('Consultas y SP', 'Laboratorio 2A: consultas y procedimientos', {
    obj: 'Aplicar DML avanzado (window functions, CTE) y encapsular el resultado en un procedimiento almacenado, observando plan caching y parameter sniffing en vivo.',
    guion: [
      'Duración orientativa: 60–70 min. Los alumnos trabajan individualmente o por parejas sobre la BD Ventas creada en las diapositivas de DDL.',
      'Objetivo técnico: ver con sus propios ojos que (1) las window functions resuelven en una consulta lo que antes requería auto-joins, (2) un procedimiento reutiliza plan y (3) el mismo plan puede ser bueno para un parámetro y malo para otro.',
      'El docente recorre los puestos al paso 3: es donde más se atascan (CTE antes del SELECT, ORDER BY dentro de la CTE, nombres de columna).',
      'Criterio de éxito: el procedimiento devuelve las 3 mejores ventas de cada cliente y el alumno sabe explicar por qué el plan para @ClienteId = 1 (60 % de las filas) es diferente del de un cliente raro.',
      'Cierre: puesta en común de 5 minutos; pedir a un grupo que enseñe su plan con el Key Lookup y a otro el plan con Clustered Index Scan.',
    ],
    preguntas: [
      '¿Por qué el plan de la segunda ejecución es idéntico al de la primera aunque el parámetro sea distinto?',
      '¿Qué cambia en el plan al añadir OPTION (RECOMPILE)? ¿Qué coste tiene hacerlo en cada ejecución?',
    ],
    lab: [
      'Requisito: contenedor SQL Server 2022 en marcha (docker run -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD=<clave> -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest) y SSMS conectado a localhost,1433.',
      'Paso 1 — Datos: CREATE DATABASE Ventas; USE Ventas; crear dbo.Cliente y dbo.Pedido con los scripts de la diapositiva 22. Cargar 500 clientes: INSERT dbo.Cliente (Email, Nombre) SELECT TOP (500) CONCAT(\'c\', n, \'@demo.es\'), CONCAT(N\'Cliente \', n) FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n FROM sys.all_objects a CROSS JOIN sys.all_objects b) AS t ORDER BY n;',
      'Paso 1b — Pedidos sesgados: INSERT dbo.Pedido (ClienteId, Fecha, Total) SELECT TOP (50000) CASE WHEN ABS(CHECKSUM(NEWID())) % 10 < 6 THEN 1 ELSE 2 + ABS(CHECKSUM(NEWID())) % 499 END, DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 730, CAST(GETDATE() AS date)), CAST(10 + ABS(CHECKSUM(NEWID())) % 990 AS decimal(12,2)) FROM sys.all_objects a CROSS JOIN sys.all_objects b; Después: CREATE INDEX IX_Pedido_Cliente ON dbo.Pedido (ClienteId) INCLUDE (Fecha, Total);',
      'Paso 2 — Consulta analítica: top 3 pedidos por importe de cada cliente con ROW_NUMBER() OVER (PARTITION BY ClienteId ORDER BY Total DESC) dentro de una CTE y WHERE rn <= 3 fuera. Añadir una columna con SUM(Total) OVER (PARTITION BY ClienteId) para el % sobre el total del cliente.',
      'Paso 3 — Procedimiento: CREATE OR ALTER PROCEDURE dbo.usp_TopPedidosCliente @ClienteId INT, @N INT = 3 con SET NOCOUNT ON y SELECT TOP (@N) ... ORDER BY Total DESC. Probar EXEC con @ClienteId = 1 y luego con 250.',
      'Paso 4 — Plan y sniffing: activar plan real (Ctrl+M) y SET STATISTICS IO ON. Ejecutar primero con un cliente raro (Seek + Key Lookup) y luego con el cliente 1 (compara lecturas lógicas). Ver el plan cacheado: SELECT usecounts, plan_handle FROM sys.dm_exec_cached_plans CROSS APPLY sys.dm_exec_sql_text(plan_handle) WHERE text LIKE \'%usp_TopPedidosCliente%\'. Repetir con EXEC ... WITH RECOMPILE y comparar.',
      'Trampas habituales: (a) ORDER BY dentro de una CTE sin TOP → error 1033; (b) filtrar rn en el mismo SELECT donde se calcula → error 4108 (usar CTE); (c) ejecutar CREATE PROCEDURE sin GO previo cuando hay más sentencias en el lote; (d) olvidar USE Ventas y crear los objetos en master.',
      'Guía de resolución: si el alumno no ve diferencia de planes, confirmar que el sesgo existe (SELECT ClienteId, COUNT(*) FROM dbo.Pedido GROUP BY ClienteId ORDER BY 2 DESC) y que el índice IX_Pedido_Cliente está creado; vaciar la caché sólo con DBCC FREEPROCCACHE en el contenedor de laboratorio.',
    ],
  }, true);
  H.steps(s, [
    { title: 'Preparar datos', body: 'Crea Ventas con Cliente y Pedido y carga 50 000 pedidos sesgados.' },
    { title: 'Consulta analítica', body: 'Top 3 pedidos por cliente con ROW_NUMBER y SUM OVER.' },
    { title: 'Procedimiento', body: 'Crea usp_TopPedidosCliente con parámetros y SET NOCOUNT ON.' },
    { title: 'Plan y sniffing', body: 'Ejecuta con cliente 1 y con otro; compara planes con Ctrl+M.' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.95, size: 14 });
  H.code(s, {
    x: 0.6, y: 5.0, w: 7.5, h: 1.75, size: 12, label: 'T-SQL · punto de partida del paso 2',
    code: `WITH R AS (SELECT ClienteId, PedidoId, Total,
   ROW_NUMBER() OVER (PARTITION BY ClienteId
                      ORDER BY Total DESC) AS rn
   FROM dbo.Pedido)
SELECT * FROM R WHERE rn <= 3;`,
  });
  H.callout(s, {
    x: 8.4, y: 5.0, w: 4.33, h: 1.75, kind: 'warn', lead: 'Trampa:', size: 14,
    text: 'no puedes filtrar rn en el mismo SELECT; envuélvelo en una CTE.',
  });

  // ───────────────────────── 34 · Modelo de seguridad ─────────────────────────
  s = mk('Seguridad', 'Modelo de seguridad de SQL Server', {
    obj: 'Presentar la cadena completa de seguridad (autenticación → login → user → roles/permisos → objetos) y la frontera entre nivel de instancia y de base de datos.',
    guion: [
      'Una petición atraviesa varias capas en orden. 1) Autenticación: ¿quién eres? Windows (Kerberos/NTLM) o SQL Server (usuario y contraseña). 2) Login: principal a nivel de servidor que permite entrar a la instancia (sys.server_principals).',
      '3) User: principal de base de datos mapeado a un login (sys.database_principals); sin user (o guest) no se accede a la BD aunque el login sea válido. 4) Roles y permisos: GRANT/DENY/REVOKE sobre objetos, schemas o la propia BD. 5) Objetos: tablas, vistas, procedimientos, agrupados en schemas.',
      'Los permisos se evalúan jerárquicamente: servidor → base de datos → schema → objeto → columna. Un permiso concedido en un nivel alto (p. ej. SELECT sobre la BD) se hereda por los inferiores, salvo DENY.',
      'Principals: logins, users, roles de servidor/BD y roles de aplicación. Securables: servidor, BD, schema, objeto. Permission: CONNECT, SELECT, EXECUTE, ALTER, CONTROL, etc.',
      'Idea clave para el DBA: el login abre la puerta de la instancia, pero no da acceso a ningún dato; ahí entran el user, los roles y los permisos. Por eso «tener un login» y «tener acceso» no son lo mismo.',
      'Otras capas complementarias fuera de esta diapositiva: cifrado en tránsito (TLS), TDE, Always Encrypted, Row-Level Security y Dynamic Data Masking. Se mencionan, no se desarrollan.',
      'Vistas de catálogo de referencia: sys.server_principals, sys.database_principals, sys.server_permissions, sys.database_permissions y sys.fn_my_permissions.',
    ],
    preguntas: [
      '¿Puede un login con credenciales válidas conectarse a la instancia y aun así no ver ninguna base de datos de usuario? ¿Por qué?',
      '¿Qué diferencia hay entre un permiso concedido a nivel de schema y uno concedido tabla a tabla en una base de datos con 500 tablas?',
    ],
  });
  D.securityLayers(s, { x: 0.6, y: 1.75, w: 12.13, h: 4.2 });
  H.callout(s, {
    x: 0.6, y: 6.0, w: 12.13, h: 0.75, kind: 'tip', lead: 'Recuerda:', size: 14,
    text: 'un login abre la puerta de la instancia; los permisos los decide el user en cada base de datos.',
  });

  // ───────────────────────── 35 · Autenticación ─────────────────────────
  s = mk('Seguridad', 'Autenticación: Windows frente a SQL Server', {
    obj: 'Comparar los dos modos de autenticación, saber cuándo habilitar el modo mixto y cuáles son sus riesgos.',
    guion: [
      'Autenticación de Windows (integrada): SQL Server confía en la identidad validada por Active Directory (Kerberos, o NTLM como alternativa). Se gestionan contraseñas, caducidad, bloqueo y MFA en el directorio, y se pueden crear logins para grupos de AD, lo que simplifica el alta y baja de personas.',
      'Autenticación de SQL Server: el login y el hash de la contraseña (SHA-512 con sal desde 2012) se guardan en master (sys.sql_logins). Sirve para aplicaciones heredadas, servidores fuera de dominio, instancias en Linux o contenedores sin AD y herramientas de terceros.',
      'Modo de autenticación del servidor: «Sólo Windows» o «Mixto» (Windows + SQL). Se cambia en Propiedades del servidor → Seguridad y requiere reiniciar el servicio. SERVERPROPERTY(\'IsIntegratedSecurityOnly\') indica el modo (1 = sólo Windows).',
      'En modo mixto la cuenta sa pasa a estar activa: es el objetivo número uno de los ataques de fuerza bruta. Buenas prácticas: contraseña robusta, cambiar el nombre (ALTER LOGIN sa WITH NAME = ...) o deshabilitarla (ALTER LOGIN sa DISABLE).',
      'Para logins SQL activar CHECK_POLICY = ON (aplica la política de contraseñas de Windows) y CHECK_EXPIRATION según el caso. Visible en sys.sql_logins (is_policy_checked, is_expiration_checked).',
      'Problema del doble salto (double hop): con Kerberos mal configurado (SPN ausente), las conexiones remotas caen a NTLM o fallan. Verificar con SELECT auth_scheme FROM sys.dm_exec_connections WHERE session_id = @@SPID.',
      'En Docker/Linux (contenedor del laboratorio) la autenticación inicial es SQL (sa); Windows/AD se habilita con adutil en SQL Server 2019+ pero queda fuera del alcance del curso.',
    ],
    preguntas: [
      '¿Qué ventajas operativas tiene crear un login para un grupo de Active Directory en lugar de uno por persona?',
      '¿Qué haríais con la cuenta sa en un servidor en modo mixto expuesto a varias aplicaciones? ¿Y si una aplicación sólo soporta SQL Auth?',
    ],
  });
  H.table(s, [
    ['Aspecto', 'Autenticación de Windows', 'Autenticación de SQL Server'],
    ['Identidad', 'Cuenta o grupo de Active Directory', 'Login y contraseña guardados en master'],
    ['Seguridad', 'Kerberos/NTLM, caducidad y MFA en AD', 'CHECK_POLICY; riesgo de fuerza bruta (sa)'],
    ['Recomendado', 'Opción preferida', 'Apps heredadas, Linux/Docker, fuera de dominio'],
  ], { x: 0.6, y: 1.75, w: 12.13, colW: [1.8, 5.1, 5.2], size: 14, maxH: 2.9 });
  H.code(s, {
    x: 0.6, y: 4.95, w: 7.3, h: 1.8, size: 12, label: 'T-SQL · modo y política',
    code: `-- 1 = sólo Windows, 0 = modo mixto
SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS SoloWindows;
SELECT name, is_policy_checked, is_expiration_checked
FROM   sys.sql_logins;`,
  });
  H.callout(s, {
    x: 8.2, y: 4.95, w: 4.53, h: 1.8, kind: 'warn', lead: 'Modo mixto:', size: 14,
    text: 'requiere reiniciar el servicio y deja sa expuesta: deshabilítala.',
  });

  // ───────────────────────── 36 · Logins, Users y Schemas ─────────────────────────
  s = mk('Seguridad', 'Logins, Users y Schemas', {
    obj: 'Distinguir login (instancia) de user (base de datos), entender su mapeo por SID y usar los schemas como espacio de nombres y unidad de permisos.',
    guion: [
      'Login = principal de servidor; User = principal de base de datos. Se enlazan por el SID (Security Identifier). CREATE USER ... FOR LOGIN guarda el SID del login en sys.database_principals.',
      'Un login puede tener un user distinto en cada BD; sin user en la BD (y guest deshabilitado) no hay acceso. Cada BD tiene el user especial dbo (propietario) y los de sistema (guest, INFORMATION_SCHEMA, sys).',
      'Usuario huérfano (orphaned user): tras restaurar una BD en otra instancia, el SID del user no coincide con ningún login. Detectar con sp_change_users_login \'Report\' o comparando SIDs; reparar con ALTER USER ... WITH LOGIN = login. Alternativa moderna: bases de datos contenidas (CONTAINMENT = PARTIAL) con usuarios con contraseña propios.',
      'Schema = espacio de nombres y contenedor de seguridad dentro de la BD. No es lo mismo que el user (desde 2005 están separados): el propietario del schema puede cambiarse sin renombrar objetos.',
      'Un permiso concedido a nivel de schema (GRANT SELECT ON SCHEMA::rpt) cubre los objetos actuales y los futuros; es la forma más mantenible de segregar permisos (rpt para informes, app para procedimientos de aplicación, dbo para administración).',
      'DEFAULT_SCHEMA del user determina cómo se resuelven nombres sin calificar; mejor calificar siempre (dbo.Pedido) para evitar resoluciones ambiguas y ahorrar recompilaciones en el plan cache.',
      'Cuidado con CREATE LOGIN ... WITH PASSWORD en scripts versionados: nunca contraseñas reales en el control de código. Para Windows: CREATE LOGIN [DOMINIO\\ana] FROM WINDOWS (sólo con AD).',
    ],
    preguntas: [
      '¿Qué ocurre si restauráis una copia de Ventas en otro servidor donde el login lg_analista existe pero se creó con otro SID?',
      '¿Qué ventaja tiene organizar los objetos en schemas (rpt, app, dbo) frente a tenerlo todo en dbo?',
    ],
  });
  const flow = [
    ['LOGIN lg_analista', 'Nivel de instancia (master)', C.COBALT],
    ['USER analista', 'Nivel de BD: Ventas, mismo SID', C.NAVY],
    ['ROL rol_lectura_rpt', 'Agrupa permisos', C.NAVY],
    ['SCHEMA rpt', 'Objetos y permisos', C.COBALT],
  ];
  flow.forEach(([t, d, f], i) => {
    const y = 1.75 + i * 1.3;
    H.box(s, { x: 0.6, y, w: 4.9, h: 0.9, text: `${t}\n${d}`, fill: f, size: 14, shadowOn: true });
    if (i < flow.length - 1) H.line(s, 3.05, y + 0.9, 3.05, y + 1.3, { color: C.CORAL, width: 2.25, arrow: 'end' });
  });
  H.code(s, {
    x: 5.8, y: 1.75, w: 6.93, h: 3.75, size: 12, label: 'T-SQL · login, schema y user',
    code: `-- 1) Instancia: el login
CREATE LOGIN lg_analista
    WITH PASSWORD = N'C0mpl3ja!2024', CHECK_POLICY = ON;

-- 2) Base de datos: schema y user mapeado
USE Ventas;
GO
CREATE SCHEMA rpt AUTHORIZATION dbo;
GO
CREATE USER analista FOR LOGIN lg_analista
    WITH DEFAULT_SCHEMA = rpt;`,
  });
  H.callout(s, {
    x: 5.8, y: 5.8, w: 6.93, h: 0.95, kind: 'warn', lead: 'Huérfano:', size: 14,
    text: 'tras un restore, ALTER USER ... WITH LOGIN = ... repara el SID.',
  });

  // ───────────────────────── 37 · Roles ─────────────────────────
  s = mk('Seguridad', 'Roles fijos y roles personalizados', {
    obj: 'Conocer los roles fijos más relevantes y justificar por qué se prefieren roles personalizados con permisos sobre schemas.',
    guion: [
      'Roles fijos de servidor: sysadmin (control total, ignora DENY), securityadmin (administra logins; casi equivale a sysadmin por escalada), dbcreator (crea/restaura BDs), serveradmin, processadmin, diskadmin, bulkadmin, setupadmin y public. SQL Server 2022 añade roles granulares como ##MS_ServerStateReader## para monitorización sin sysadmin.',
      'Roles fijos de BD: db_owner (control total de la BD), db_datareader/db_datawriter (SELECT/INSERT-UPDATE-DELETE sobre todas las tablas), db_ddladmin (DDL), db_securityadmin, db_accessadmin, db_backupoperator y los db_denydatareader/db_denydatawriter.',
      'El rol public existe en servidor y BD, y todos los principals pertenecen a él: no se le debe conceder nada que no se quiera dar a todo el mundo.',
      'Problema de los roles fijos: son «todo o nada» (db_datareader lee todas las tablas presentes y futuras). Para el mínimo privilegio se definen roles personalizados (CREATE ROLE) y se les concede permisos sobre un schema o procedimientos concretos.',
      'Gestión: ALTER ROLE rol ADD MEMBER usuario (desde 2012; sp_addrolemember está obsoleto). En SQL Server 2012+ también existen roles de servidor definidos por el usuario (CREATE SERVER ROLE).',
      'Los roles pueden anidarse (un rol miembro de otro), pero la anidación excesiva complica las auditorías. Convención: rol_<función>, p. ej. rol_lectura_rpt, rol_operador.',
      'Auditar membresías: SELECT r.name AS rol, m.name AS miembro FROM sys.database_role_members rm JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id JOIN sys.database_principals m ON m.principal_id = rm.member_principal_id; y sys.server_role_members para servidor.',
    ],
    preguntas: [
      '¿Por qué un login miembro de securityadmin debe tratarse casi como un sysadmin?',
      '¿Qué ocurre con las tablas creadas el próximo mes si añadimos a un usuario a db_datareader? ¿Y si le damos SELECT sobre un schema?',
    ],
  });
  H.table(s, [
    ['Rol', 'Ámbito', 'Capacidad'],
    ['sysadmin', 'Servidor', 'Control total de la instancia'],
    ['securityadmin', 'Servidor', 'Gestiona logins y permisos'],
    ['dbcreator', 'Servidor', 'Crea y restaura bases de datos'],
    ['db_owner', 'Base de datos', 'Control total sobre la BD'],
    ['db_datareader / db_datawriter', 'Base de datos', 'SELECT / DML en todas las tablas'],
    ['db_ddladmin', 'Base de datos', 'Ejecuta DDL (CREATE, ALTER)'],
  ], { x: 0.6, y: 1.75, w: 7.5, colW: [2.9, 1.6, 3.0], size: 13, maxH: 3.8 });
  H.code(s, {
    x: 8.4, y: 1.75, w: 4.33, h: 3.8, size: 12, label: 'T-SQL · rol personalizado',
    code: `CREATE ROLE rol_lectura_rpt;
GRANT SELECT ON SCHEMA::rpt
    TO rol_lectura_rpt;

CREATE ROLE rol_operador;
GRANT EXECUTE ON SCHEMA::app
    TO rol_operador;

ALTER ROLE rol_lectura_rpt
    ADD MEMBER analista;`,
  });
  H.callout(s, {
    x: 0.6, y: 5.85, w: 12.13, h: 0.9, kind: 'tip', lead: 'Mejor práctica:', size: 14,
    text: 'evita db_owner y sysadmin en aplicaciones; usa roles personalizados con permisos sobre un schema.',
  });

  // ───────────────────────── 38 · GRANT / DENY / REVOKE ─────────────────────────
  s = mk('Seguridad', 'GRANT, DENY y REVOKE', {
    obj: 'Aplicar correctamente las tres sentencias de permisos y razonar sobre la precedencia entre ellas y entre roles.',
    guion: [
      'GRANT concede un permiso (SELECT, INSERT, UPDATE, DELETE, EXECUTE, ALTER, CONTROL…) sobre un securable. WITH GRANT OPTION permite al receptor delegarlo; usarlo con extrema cautela.',
      'DENY prohíbe explícitamente el permiso y tiene precedencia sobre cualquier GRANT, incluso heredado de un rol o de un nivel superior. Excepciones: no afecta a sysadmin ni al user dbo.',
      'REVOKE elimina un GRANT o un DENY previo y devuelve al estado «sin permiso explícito»: no equivale a denegar, y el usuario puede seguir teniendo el permiso por otro camino (rol o schema).',
      'Orden de evaluación: DENY > GRANT > sin permiso (denegado implícito). Los permisos de roles se acumulan, salvo un DENY en cualquiera de ellos.',
      'Los permisos se pueden aplicar a niveles distintos: servidor, BD, schema (GRANT SELECT ON SCHEMA::rpt), objeto, columna (GRANT SELECT (Nombre, Email) ON dbo.Cliente). Favorecer schema y rol.',
      'Verificación: sys.fn_my_permissions(\'dbo.Pedido\', \'OBJECT\') para el contexto actual; combinar con EXECUTE AS USER = \'x\' para probar como otro usuario (siempre cerrar con REVERT). Catálogo: sys.database_permissions.',
      'Error típico del alumno: usar DENY como mecanismo principal. DENY es una excepción, no una estrategia: complica el análisis de permisos efectivos. Mejor construir la lista de GRANT mínima.',
    ],
    preguntas: [
      'Un usuario pertenece a dos roles: uno con GRANT SELECT sobre dbo.Pedido y otro con DENY SELECT. ¿Qué ocurre al consultar? ¿Y si se hace REVOKE del DENY?',
      '¿Cómo comprobaríais los permisos efectivos de un usuario sin iniciar sesión como él?',
    ],
  });
  H.cardsRow(s, [
    { title: 'GRANT', icon: 'FaCheckCircle', body: 'Concede un permiso; WITH GRANT OPTION permite delegarlo.' },
    { title: 'DENY', icon: 'FaBan', tone: 'dark', body: 'Prohíbe el permiso y gana siempre al GRANT, también el heredado.' },
    { title: 'REVOKE', icon: 'FaUndo', body: 'Quita un GRANT o un DENY previo; no equivale a denegar.' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.55, size: 14, titleSize: 18 });
  H.code(s, {
    x: 0.6, y: 4.6, w: 7.6, h: 2.15, size: 12, label: 'T-SQL · permisos sobre dbo.Pedido',
    code: `GRANT SELECT, INSERT ON dbo.Pedido TO rol_operador;
DENY  DELETE         ON dbo.Pedido TO rol_operador;
REVOKE INSERT        ON dbo.Pedido FROM rol_operador;

-- Permisos efectivos del contexto actual
SELECT * FROM sys.fn_my_permissions(N'dbo.Pedido', N'OBJECT');`,
  });
  H.callout(s, {
    x: 8.5, y: 4.6, w: 4.23, h: 2.15, kind: 'tip', lead: 'Precedencia:', size: 14,
    text: 'DENY > GRANT > sin permiso. Los roles se acumulan, salvo DENY.',
  });

  // ───────────────────────── 39 · Ownership chaining ─────────────────────────
  s = mk('Seguridad', 'Ownership chaining (cadena de propiedad)', {
    obj: 'Entender cómo la cadena de propiedad permite exponer datos sólo a través de procedimientos o vistas y cuándo se rompe.',
    guion: [
      'Cuando un objeto (vista, procedimiento) accede a otro con el mismo propietario, SQL Server comprueba sólo el permiso sobre el primer objeto (p. ej. EXECUTE) y omite la comprobación sobre los objetos subyacentes. Eso es el ownership chaining.',
      'Aplicación práctica: el operador recibe EXECUTE sobre app.usp_AltaPedido y no tiene ningún permiso sobre dbo.Pedido. El procedimiento escribe en la tabla porque el propietario del schema app y de dbo es el mismo (dbo): la cadena es intacta.',
      'La cadena se rompe cuando el propietario cambia a lo largo de ella (p. ej. procedimiento propiedad de otro user): entonces se evalúan los permisos del llamador sobre el objeto siguiente y falla con error 229 si no los tiene.',
      'Limitaciones: sólo cubre SELECT, INSERT, UPDATE, DELETE y EXECUTE; no cubre DDL (TRUNCATE TABLE, CREATE, ALTER) ni, importante, SQL dinámico: EXEC(@sql) y sp_executesql se ejecutan en otro contexto y rompen la cadena.',
      'Entre bases de datos, el cross-database ownership chaining está desactivado por defecto (DB_CHAINING OFF) y es un riesgo si se activa: un propietario de BD con db_owner puede alcanzar objetos de otras BDs.',
      'Alternativas explícitas y más controlables: EXECUTE AS OWNER en el módulo (cambio de contexto) o firma de procedimientos con certificados (module signing).',
      'Comprobación en laboratorio: EXECUTE AS USER = \'operador\'; EXEC app.usp_AltaPedido ...; SELECT * FROM dbo.Pedido; (error 229). Documentarlo: es la forma más clara de demostrarlo a los alumnos.',
    ],
    preguntas: [
      '¿Por qué un procedimiento con SQL dinámico (EXEC(@sql)) falla con «permiso denegado» aunque el usuario tenga EXECUTE sobre él?',
      '¿Qué riesgo introduce activar cross-database ownership chaining entre dos bases de datos con administradores distintos?',
    ],
  });
  const chain = (y, title, boxes, ok) => {
    H.text(s, title, { x: 0.6, y, w: 12.13, h: 0.4, size: 16, bold: true, color: C.NAVY, valign: 'middle' });
    const ws = [2.5, 3.3, 2.6, 2.5];
    const gap = (12.13 - ws.reduce((a, b) => a + b, 0)) / 3;
    let x = 0.6;
    boxes.forEach((t, i) => {
      const last = i === 3;
      H.box(s, { x, y: y + 0.5, w: ws[i], h: 1.0, text: t, size: 14, fill: last ? (ok ? C.GREEN : C.CORAL) : i === 0 ? C.NAVY : C.COBALT, shadowOn: true });
      if (i < 3) H.line(s, x + ws[i] + 0.04, y + 1.0, x + ws[i] + gap - 0.04, y + 1.0, { color: C.MUTED, width: 2.25, arrow: 'end' });
      x += ws[i] + gap;
    });
  };
  chain(1.75, 'Cadena intacta (mismo propietario)', ['Usuario operador', 'app.usp_AltaPedido\nowner: dbo', 'dbo.Pedido\nowner: dbo', 'Sólo se valida\nEXECUTE'], true);
  chain(3.55, 'Cadena rota (propietarios distintos)', ['Usuario operador', 'app.usp_Otro\nowner: usr_app', 'dbo.Pedido\nowner: dbo', 'Se exige permiso\nsobre la tabla'], false);
  H.callout(s, {
    x: 0.6, y: 5.5, w: 5.9, h: 1.25, kind: 'tip', lead: 'Utilidad:', size: 14,
    text: 'da EXECUTE sobre el procedimiento, no acceso a las tablas: es una API controlada.',
  });
  H.callout(s, {
    x: 6.83, y: 5.5, w: 5.9, h: 1.25, kind: 'warn', lead: 'Límites:', size: 14,
    text: 'el SQL dinámico rompe la cadena; entre bases de datos exige DB_CHAINING.',
  });

  // ───────────────────────── 40 · Mínimo privilegio y auditoría ─────────────────────────
  s = mk('Buenas prácticas', 'Mínimo privilegio y auditoría básica', {
    obj: 'Traducir el principio de mínimo privilegio en reglas concretas y conocer las tres herramientas básicas de auditoría de SQL Server.',
    guion: [
      'Mínimo privilegio: cada principal recibe sólo los permisos imprescindibles, durante el tiempo imprescindible. En la práctica: permisos a roles (no a usuarios sueltos), GRANT sobre schemas o procedimientos, cuentas separadas para aplicaciones y para administración, y revisión periódica de miembros de sysadmin y db_owner.',
      'Cuentas de servicio: ejecutar el motor con una cuenta de bajo privilegio (idealmente gMSA o cuenta virtual), no como administrador del dominio. Deshabilitar sa y el user guest; quitar CONNECT a guest en las BDs de usuario.',
      'SQL Server Audit: objeto de auditoría (destino: archivo, Application Log o Security Log) + especificación a nivel de servidor o de BD con grupos de acciones (FAILED_LOGIN_GROUP, DATABASE_ROLE_MEMBER_CHANGE_GROUP, SCHEMA_OBJECT_ACCESS_GROUP…). Disponible en todas las ediciones a nivel de servidor; las especificaciones de BD son para todas desde 2016 SP1.',
      'Login auditing: Propiedades del servidor → Seguridad → Auditoría de inicio de sesión (Ninguno, Sólo erróneos, Sólo correctos, Ambos); escribe en el Error Log. Barato y suficiente para detectar ataques de fuerza bruta (error 18456).',
      'DMVs y catálogo para revisión: sys.dm_exec_sessions (quién está conectado y desde dónde), sys.dm_exec_connections (auth_scheme), sys.server_principals, sys.database_permissions y sys.dm_server_audit_status.',
      'Leer el resultado de la auditoría: SELECT * FROM sys.fn_get_audit_file(\'/var/opt/mssql/audit/*.sqlaudit\', DEFAULT, DEFAULT). Extended Events y triggers DDL cubren cambios de esquema.',
      'Advertencia: una auditoría demasiado amplia (p. ej. SELECT sobre tablas calientes) genera mucho volumen y penaliza el rendimiento; auditar lo que importa y proteger el destino contra manipulación.',
    ],
    preguntas: [
      '¿Qué eventos auditaríais primero en un servidor de producción con presupuesto limitado de I/O?',
      '¿Cómo detectaríais que un usuario ha sido añadido a db_owner la semana pasada sin que nadie lo notificara?',
    ],
  });
  H.card(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 3.0, title: 'Mínimo privilegio', icon: 'FaUserShield', size: 14,
    bullets: ['Permisos a roles, no a usuarios sueltos', 'GRANT sobre schemas o procedimientos', 'Cuentas de aplicación ≠ administración', 'sa deshabilitada y sysadmin revisado'],
  });
  H.card(s, {
    x: 6.83, y: 1.75, w: 5.9, h: 3.0, title: 'Auditoría básica', icon: 'FaClipboardCheck', tone: 'dark', size: 14,
    bullets: ['SQL Server Audit a archivo o Event Log', 'Login auditing: fallos y éxitos', 'DMVs: sys.dm_exec_sessions, sys.server_principals', 'Triggers DDL / Extended Events'],
  });
  H.code(s, {
    x: 0.6, y: 5.05, w: 7.9, h: 1.7, size: 12, label: 'T-SQL · SQL Server Audit',
    code: `CREATE SERVER AUDIT Aud_Seguridad
    TO FILE (FILEPATH = N'/var/opt/mssql/audit/');
CREATE SERVER AUDIT SPECIFICATION Aud_Seg_Spec
    FOR SERVER AUDIT Aud_Seguridad
    ADD (FAILED_LOGIN_GROUP) WITH (STATE = ON);
ALTER SERVER AUDIT Aud_Seguridad WITH (STATE = ON);`,
  });
  H.callout(s, {
    x: 8.8, y: 5.05, w: 3.93, h: 1.7, kind: 'tip', lead: 'Lectura:', size: 14,
    text: 'consulta los eventos con sys.fn_get_audit_file.',
  });

  // ───────────────────────── 41 · LAB 2B ─────────────────────────
  s = mk('Permisos', 'Laboratorio 2B: permisos segregados', {
    obj: 'Diseñar e implementar un esquema de permisos segregados (analista de lectura y operador de aplicación) siguiendo el mínimo privilegio, y verificarlo con EXECUTE AS.',
    guion: [
      'Duración orientativa: 60 min. Escenario: dos perfiles sobre la BD Ventas. El analista sólo consulta informes (schema rpt); el operador sólo da de alta pedidos mediante un procedimiento (schema app) y NO debe poder leer ni modificar dbo.Pedido directamente.',
      'Objetivo técnico: poner en práctica login → user → rol → permiso sobre schema, y demostrar ownership chaining (EXECUTE sobre el procedimiento basta para insertar).',
      'Criterio de éxito: el analista puede hacer SELECT en rpt.vVentasCliente pero no en dbo.Pedido; el operador ejecuta app.usp_AltaPedido con éxito pero recibe el error 229 al hacer SELECT directo.',
      'El docente debe insistir en el patrón de verificación: probar siempre lo que NO debe poder hacerse. Una prueba sólo de éxito no demuestra el mínimo privilegio.',
      'Cierre: revisar entre todos la salida de sys.database_permissions y sys.database_role_members como inventario de permisos del esquema creado.',
    ],
    preguntas: [
      '¿Qué permisos tiene realmente el operador? Demostrad con sys.fn_my_permissions y con pruebas negativas.',
      '¿Qué pasaría si el procedimiento usara SQL dinámico para insertar? ¿Cómo lo resolveríais sin dar permisos sobre la tabla?',
    ],
    lab: [
      'Requisito: BD Ventas con dbo.Cliente, dbo.Pedido y datos (Laboratorio 2A) y sesión con rol sysadmin.',
      'Paso 1 — Principals: CREATE LOGIN lg_analista WITH PASSWORD = N\'<clave fuerte>\', CHECK_POLICY = ON; y lo mismo con lg_operador. USE Ventas; CREATE SCHEMA rpt AUTHORIZATION dbo; (en su propio lote con GO) y CREATE SCHEMA app AUTHORIZATION dbo; CREATE USER analista FOR LOGIN lg_analista WITH DEFAULT_SCHEMA = rpt; CREATE USER operador FOR LOGIN lg_operador WITH DEFAULT_SCHEMA = app;',
      'Paso 2 — Objetos: CREATE VIEW rpt.vVentasCliente AS SELECT c.ClienteId, c.Nombre, COUNT(*) AS NumPedidos, SUM(p.Total) AS Ventas FROM dbo.Cliente c JOIN dbo.Pedido p ON p.ClienteId = c.ClienteId GROUP BY c.ClienteId, c.Nombre; y CREATE PROCEDURE app.usp_AltaPedido @ClienteId INT, @Total DECIMAL(12,2) AS BEGIN SET NOCOUNT ON; INSERT dbo.Pedido (ClienteId, Fecha, Total) VALUES (@ClienteId, CAST(GETDATE() AS date), @Total); END;',
      'Paso 3 — Roles y permisos: CREATE ROLE rol_lectura_rpt; GRANT SELECT ON SCHEMA::rpt TO rol_lectura_rpt; ALTER ROLE rol_lectura_rpt ADD MEMBER analista; CREATE ROLE rol_operador; GRANT EXECUTE ON SCHEMA::app TO rol_operador; ALTER ROLE rol_operador ADD MEMBER operador; DENY SELECT ON dbo.Pedido TO operador;',
      'Paso 4 — Verificación: EXECUTE AS USER = \'operador\'; EXEC app.usp_AltaPedido @ClienteId = 1, @Total = 99.90; (debe funcionar); SELECT TOP (1) * FROM dbo.Pedido; (error 229); REVERT; Repetir con EXECUTE AS USER = \'analista\': SELECT * FROM rpt.vVentasCliente; (ok) y SELECT * FROM dbo.Cliente; (error 229). Inventario: SELECT * FROM sys.database_permissions WHERE grantee_principal_id IN (DATABASE_PRINCIPAL_ID(\'rol_lectura_rpt\'), DATABASE_PRINCIPAL_ID(\'rol_operador\'));',
      'Paso 5 (opcional) — Conexión real: crear conexiones nuevas en SSMS (Autenticación SQL) con cada login y repetir las pruebas.',
      'Trampas habituales: (a) CREATE SCHEMA no es la primera instrucción del lote → error 111, separar con GO; (b) olvidar REVERT tras EXECUTE AS: las pruebas siguientes se ejecutan como el usuario suplantado; (c) el DENY directo sobre dbo.Pedido NO bloquea el procedimiento porque la cadena de propiedad omite la comprobación; si el alumno espera que falle, explicar la regla; (d) usar un login sin user en Ventas → error 916 (la entidad de seguridad no puede acceder a la BD).',
      'Guía de resolución: si el operador no puede ejecutar el procedimiento, comprobar con sys.fn_my_permissions(\'app.usp_AltaPedido\', \'OBJECT\') y que el schema app pertenece a dbo (sys.schemas.principal_id); si la cadena no funciona, verificar que ambos objetos tienen el mismo propietario efectivo.',
    ],
  }, true);
  H.steps(s, [
    { title: 'Crear principals', body: 'Dos logins, sus users en Ventas y los schemas rpt y app.' },
    { title: 'Definir roles', body: 'rol_lectura_rpt sobre rpt y rol_operador con EXECUTE sobre app.' },
    { title: 'Asignar y denegar', body: 'Añade miembros y un DENY SELECT sobre dbo.Pedido al operador.' },
    { title: 'Probar', body: 'EXECUTE AS USER, REVERT y sys.fn_my_permissions.' },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 2.95, size: 14 });
  H.code(s, {
    x: 0.6, y: 5.0, w: 8.2, h: 1.75, size: 12, label: 'T-SQL · verificación',
    code: `EXECUTE AS USER = 'operador';
EXEC app.usp_AltaPedido @ClienteId = 1, @Total = 99.90; -- OK
SELECT TOP (1) * FROM dbo.Pedido;                       -- error 229
REVERT;`,
  });
  H.callout(s, {
    x: 9.1, y: 5.0, w: 3.63, h: 1.75, kind: 'warn', lead: 'Trampa:', size: 14,
    text: 'olvidar REVERT deja la sesión suplantada.',
  });

  // ───────────────────────── 42 · Resumen ─────────────────────────
  s = mk('Resumen', 'Resumen del Módulo 2: puntos clave', {
    obj: 'Consolidar los cuatro bloques del módulo y conectar con el siguiente (rendimiento y alta disponibilidad).',
    guion: [
      'DDL e integridad: las cinco restricciones son la primera línea de calidad de datos; el índice de apoyo de las FK y los tipos ajustados evitan problemas de rendimiento futuros.',
      'Vistas y procedimientos: la vista indexada materializa agregaciones (coste en escritura); los procedimientos reutilizan plan y son la «API» de la BD, pero exigen vigilar el parameter sniffing y las recompilaciones.',
      'DML analítico: el orden lógico del SELECT explica alias, WHERE y HAVING; los tres algoritmos de join (Nested Loops, Merge, Hash) se reconocen en el plan; las window functions evitan auto-joins; usa ROWS en el frame.',
      'Seguridad: login (instancia) → user (BD) → rol → permiso sobre schema/objeto; DENY gana a GRANT; el ownership chaining permite exponer sólo procedimientos; mínimo privilegio y auditoría (SQL Server Audit, login auditing, DMVs).',
      'Hacer una ronda de «una cosa que aplicaré el lunes» (1 min por persona) y recoger dudas pendientes para repasarlas antes del siguiente módulo.',
      'Puente al Módulo 3: hemos visto que la elección de join, el Index Seek y el sniffing dependen de índices y estadísticas. El siguiente módulo explica cómo se construyen (B-Tree), cómo leer planes de ejecución y cómo detectar cuellos de botella con DMVs.',
    ],
    preguntas: [
      '¿Qué decisión de este módulo tendría mayor impacto en vuestra BD de producción esta semana?',
      '¿Qué concepto de seguridad os parece más difícil de explicar a un desarrollador y cómo lo haríais?',
    ],
  });
  H.cardsRow(s, [
    { title: 'DDL e integridad', icon: 'FaTable', bullets: ['PK, FK, CHECK, UNIQUE, DEFAULT', 'FK con índice de apoyo', 'Tipos ajustados al dato'] },
    { title: 'Vistas y SP', icon: 'FaCogs', bullets: ['Vistas indexadas con SCHEMABINDING', 'Plan cache y sniffing', 'SP como API segura'] },
    { title: 'DML analítico', icon: 'FaProjectDiagram', bullets: ['Orden lógico del SELECT', 'Nested, Merge y Hash', 'OVER, RANK y LAG'] },
    { title: 'Seguridad', icon: 'FaUserShield', tone: 'dark', bullets: ['Login, user, rol, permiso', 'DENY gana a GRANT', 'Mínimo privilegio y auditoría'] },
  ], { x: 0.6, y: 1.75, w: 12.13, h: 3.7, size: 14, titleSize: 17 });
  H.callout(s, {
    x: 0.6, y: 5.75, w: 12.13, h: 1.0, kind: 'info', lead: 'Siguiente módulo:', size: 14,
    text: 'índices y B-Tree, planes de ejecución, DMVs de rendimiento y alta disponibilidad (RTO/RPO).',
  });
};
