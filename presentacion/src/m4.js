'use strict';
/**
 * m4.js — MÓDULO 4 «Prácticas Recomendadas y Mantenimiento» (diapositivas 61–78, ~6 h).
 * Modelos de recuperación, estrategia de backups, restauración point-in-time, DBCC CHECKDB,
 * mantenimiento automatizado, resolución de incidencias, Laboratorio 4, caso integrador y cierre.
 */
module.exports = async (pres, H, D) => {
  const C = H.COL;
  const BK = '/var/opt/mssql/backup/'; // ruta de backups en el contenedor Docker (Linux)

  // ───────── helper local: tarjeta horizontal (icono o nº + título + cuerpo) ─────────
  function rowCard(s, { x, y, w, h, icon, num, title, body, size = 14 }) {
    H.rect(s, { x, y, w, h, fill: C.WHITE, radius: 0.12, shadowOn: true, line: C.LINE });
    const d = 0.6;
    const cy = y + (h - d) / 2;
    if (icon) H.iconCircle(s, icon, x + 0.2, cy, d, { fill: C.COBALT });
    else {
      s.addShape(H.SHAPE.ellipse, { x: x + 0.2, y: cy, w: d, h: d, fill: { color: C.COBALT }, line: { type: 'none' } });
      s.addText(String(num), { x: x + 0.2, y: cy, w: d, h: d, fontFace: H.FONT.head, fontSize: 18, bold: true, color: C.WHITE, align: 'center', valign: 'middle', margin: 0 });
    }
    const tx = x + 0.2 + d + 0.2;
    const tw = w - (tx - x) - 0.2;
    H.warn(`rowCard "${title}"`, H.textHeight([{ text: title, size: 16, bold: true, after: 2 }, { text: body, size }], tw), h - 0.16);
    s.addText(
      [
        { text: title, options: { bold: true, fontSize: 16, color: C.NAVY, fontFace: H.FONT.head, breakLine: true, paraSpaceAfter: 2 } },
        { text: body, options: { fontSize: size, color: C.TEXT, fontFace: H.FONT.body } },
      ],
      { x: tx, y, w: tw, h, margin: 0, valign: 'middle' }
    );
  }

  // ═════════════════════════ 61 · Separador de módulo ═════════════════════════
  H.divider(pres, {
    mod: 4,
    title: 'Mantenimiento y Buenas Prácticas',
    subtitle: 'Recuperación, integridad, automatización y resolución de incidencias',
    hours: '6 h',
    topics: [
      { icon: 'FaUndoAlt', text: 'Modelos de recuperación y backups' },
      { icon: 'FaHistory', text: 'Restauración point-in-time' },
      { icon: 'FaSearch', text: 'Integridad física: DBCC CHECKDB' },
      { icon: 'FaTools', text: 'Mantenimiento automatizado' },
      { icon: 'FaBug', text: 'Incidencias: LDF, TempDB, bloqueos' },
      { icon: 'FaClipboardCheck', text: 'Laboratorio 4 y caso integrador' },
    ],
    notes: {
      obj: 'Situar al alumnado en el último bloque del curso: pasar de «saber crear y consultar» a «saber proteger, mantener y recuperar» una instancia en producción.',
      guion: [
        'Este módulo es el que separa a un desarrollador con conocimientos de SQL Server de un DBA: aquí se juega la continuidad del negocio. Todo lo anterior (arquitectura, seguridad, índices, HA) converge en una pregunta: ¿qué ocurre cuando algo falla a las 3 de la madrugada?',
        'Recorrido: (1) modelos de recuperación y cómo condicionan el Transaction Log; (2) estrategia de backups Full + Diferencial + Log y su verificación; (3) restauración point-in-time; (4) integridad física con DBCC CHECKDB; (5) mantenimiento automatizado con SQL Server Agent; (6) incidencias típicas (LDF lleno, TempDB saturada, bloqueos y deadlocks).',
        'Cerraremos con el Laboratorio 4 (pérdida de datos simulada y recuperación a un instante exacto) y un caso integrador que evalúa todo el curso: seguridad, índices, backups y RPO/RTO.',
        'Recordar el hilo conductor: el Transaction Log (WAL) que vimos en el Módulo 1 es la pieza que hace posible la durabilidad (la «D» de ACID), el crash recovery y la restauración a un punto en el tiempo. Casi todo lo de este módulo es una consecuencia del WAL.',
        'Tiempo orientativo: ~6 h (teoría ~3,5 h, laboratorio 4 ~1,5 h, caso integrador ~1 h). Si el grupo va justo de tiempo, la diapositiva de mantenimiento de índices puede darse como lectura y recuperarse en el caso final.',
      ],
      preguntas: [
        '¿Quién ha sufrido alguna vez una pérdida de datos o ha tenido que restaurar una base de datos? ¿Qué falló: el backup, el proceso o la comunicación?',
        '¿Cuál es el backup más importante: el que se hace o el que se ha probado restaurar?',
      ],
    },
  });

  // ═════════════════════════ 62 · Modelos de recuperación ═════════════════════════
  let s = H.slide(pres, {
    mod: 4,
    badge: 'Backups',
    title: 'Modelos de recuperación',
    notes: {
      obj: 'Entender que el recovery model no cambia lo que se registra para el crash recovery, sino cuándo se puede truncar el log y hasta qué punto se puede restaurar.',
      guion: [
        'Recovery model Simple: el log se sigue usando (rollback y crash recovery) pero se trunca automáticamente en cada checkpoint cuando no hay otro motivo de retención. No existe BACKUP LOG y sólo se puede restaurar al último Full o Diferencial: RPO = tiempo desde el último backup.',
        'Full: toda operación se registra completa y el log NO se trunca hasta que un BACKUP LOG marca los VLFs como reutilizables (log_reuse_wait_desc = LOG_BACKUP). Permite STOPAT y un RPO cercano a cero con tail-log backup. Ojo: hasta el primer Full backup la base se comporta como Simple (la log chain aún no se ha iniciado).',
        'Bulk-Logged: igual que Full salvo en operaciones masivas (BULK INSERT, bcp, INSERT…SELECT con TABLOCK, SELECT INTO, CREATE/ALTER INDEX) que usan minimal logging: sólo se registran las asignaciones de extents, no las filas. El log backup posterior copia además esos extents (bitmap ML), por lo que puede ser grande.',
        'Limitación clave de Bulk-Logged: un log backup que contiene operaciones minimally logged no admite STOPAT dentro de él (error 4341) y, si el MDF se pierde, no se puede hacer tail-log. Por eso se activa sólo durante la ventana ETL y se vuelve a Full inmediatamente, con un log backup antes y otro después.',
        'Cambiar de modelo: ALTER DATABASE Ventas SET RECOVERY FULL. De Simple a Full hay que tomar un Full (o Diferencial) para iniciar la cadena. De Full a Simple se rompe la log chain: tras volver a Full, nuevo Full obligatorio.',
        'Dato práctico: la base model viene en Full, así que toda base nueva nace en Full. Si nadie programa BACKUP LOG, el LDF crece sin límite hasta llenar el disco (causa nº 1 de «LDF lleno»; lo veremos en las incidencias). Consulta: SELECT name, recovery_model_desc, log_reuse_wait_desc FROM sys.databases.',
      ],
      preguntas: [
        'Si una base es Simple, ¿cuántos datos puedes perder como máximo si el disco falla justo antes del siguiente backup? ¿Es aceptable para un ERP?',
        '¿Por qué cambiar a Bulk-Logged «sólo un rato» es una decisión con riesgo para el RPO?',
        '¿Qué recovery model elegirías para un entorno de desarrollo y cuál para la base Ventas de producción?',
      ],
    },
  });
  H.table(
    s,
    [
      ['Aspecto', 'Simple', 'Full', 'Bulk-Logged'],
      ['Truncado del log', 'Automático en cada checkpoint', 'Sólo tras BACKUP LOG', 'Sólo tras BACKUP LOG'],
      ['Log chain', 'No existe; BACKUP LOG no permitido', 'Continua; log backups obligatorios', 'Continua; log backups obligatorios'],
      ['Operaciones masivas', 'Minimal logging', 'Registro completo', 'Minimal logging (extents)'],
      ['Restauración posible', 'Último Full o Diferencial', 'Cualquier instante (STOPAT)', 'Cualquier instante, salvo dentro de logs con carga masiva'],
      ['Uso típico', 'Desarrollo, DWH recargable', 'OLTP en producción', 'Ventanas ETL puntuales'],
    ],
    { x: 0.6, y: 1.75, w: 12.13, colW: [2.1, 3.2, 3.4, 3.43], size: 13, maxH: 3.55 }
  );
  H.callout(s, { x: 0.6, y: 5.6, w: 12.13, h: 1.1, kind: 'warn', lead: 'Minimal logging:', text: 'registra sólo la asignación de extents, no cada fila. Es más rápido y genera menos log, pero un log backup con carga masiva no permite STOPAT en su interior.', size: 14 });

  // ═════════════════════════ 63 · Estrategia Full + Diff + Log chain ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Backups',
    title: 'Estrategia: Full + Diferencial + Log chain',
    notes: {
      obj: 'Diseñar una estrategia de backups que combine los tres tipos para cumplir un RPO y un RTO concretos, y entender la log chain y los LSN.',
      guion: [
        'Full: copia todas las páginas asignadas más la parte activa del log necesaria para dejar la base consistente al terminar. Es la base de cualquier restauración; en el ejemplo, cada domingo a las 22:00.',
        'Diferencial: copia los extents modificados desde el último Full, que el motor localiza con el bitmap DCM (Differential Changed Map). Es acumulativo: para restaurar sólo se necesita el último diferencial, no todos. Crece a lo largo de la semana; si supera ~50 % del Full conviene un nuevo Full.',
        'Log backup: copia el log desde el último BACKUP LOG y permite truncar. Cada log backup enlaza con el anterior mediante LSN (el first_lsn de uno es el last_lsn del anterior); esa secuencia ininterrumpida es la log chain. Se rompe al pasar a Simple o si se pierde/borra un .trn.',
        'RPO y RTO: el RPO lo marca la frecuencia del log backup (cada 15 min → hasta 15 min de pérdida; con tail-log backup, casi cero). El RTO depende del tamaño del Full, del diferencial y de cuántos logs hay que reaplicar: más diferenciales = menos logs que reproducir = restauración más rápida.',
        'Ejemplo del diagrama: fallo el miércoles a las 10:37. Restauramos el Full del domingo (NORECOVERY), el diferencial del martes (NORECOVERY), los logs del martes 22:15 al miércoles 10:30 (NORECOVERY) y el último con STOPAT 10:36 y RECOVERY. Cualquier log que falte interrumpe la secuencia.',
        'COPY_ONLY no restablece el bitmap DCM ni afecta a la cadena: es lo que se usa para copias puntuales (por ejemplo, pasar la base a pre-producción) sin invalidar el plan. En msdb.dbo.backupset las columnas first_lsn, last_lsn, database_backup_lsn y differential_base_lsn permiten auditar la cadena.',
      ],
      preguntas: [
        'Con un Full semanal, diferencial diario y log cada 15 minutos, ¿cuál es el peor caso de pérdida de datos? ¿Y qué ocurre si falla el disco donde están también los backups?',
        '¿Qué backups hay que restaurar si el fallo ocurre el jueves a las 09:00 y el diferencial del miércoles está corrupto?',
        '¿Cómo equilibrarías RTO y coste de almacenamiento al decidir entre más diferenciales o más logs?',
      ],
    },
  });
  D.backupTimeline(s, { x: 0.6, y: 1.75, w: 12.13, h: 5.0 });

  // ═════════════════════════ 64 · T-SQL de backup ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Backups',
    title: 'T-SQL de backup: Full, Diff y Log',
    notes: {
      obj: 'Dominar la sintaxis de BACKUP con las opciones que se usan en producción (COMPRESSION, CHECKSUM, COPY_ONLY, TO URL) y saber por qué se usan.',
      guion: [
        'BACKUP DATABASE … TO DISK con WITH COMPRESSION reduce el tamaño (típicamente 3–5× según los datos) y la E/S de escritura, a costa de algo de CPU. Está disponible en Standard y Enterprise desde SQL Server 2008 R2/2012. Se puede forzar por defecto con sp_configure «backup compression default».',
        'CHECKSUM hace que el motor valide el checksum de cada página al leerla y calcule un checksum global del backup. Si encuentra una página corrupta, el backup falla (a menos que se use CONTINUE_AFTER_ERROR), lo cual es una detección temprana de corrupción. Es obligatorio en toda la estrategia.',
        'INIT sobrescribe el fichero; sin él se anexan sets al mismo medio (NOINIT). STATS = 10 muestra el avance. Convención de nombres con fecha y hora (Ventas_FULL_20250312_2200.bak) para evitar sobrescrituras y facilitar la limpieza.',
        'DIFFERENTIAL: sólo cambios desde el último Full «base». Un BACKUP LOG sólo es posible en Full/Bulk-Logged y tras un primer Full; si la base está en Simple devuelve el error 4208.',
        'COPY_ONLY: copia independiente que no actualiza differential_base_lsn ni trunca el log (en BACKUP LOG). Úsalo para extraer copias para desarrollo o auditoría.',
        'BACKUP … TO URL (Azure Blob Storage) permite enviar copias fuera del datacenter con una credencial SAS (CREATE CREDENTIAL sobre la URL del contenedor). Desde 2022 también se admite S3. Regla 3-2-1: 3 copias, 2 soportes distintos, 1 fuera de sitio. Para backups grandes en Azure, usar striping (varios TO URL) por el límite de bloque.',
        'En Docker/Linux las rutas son /var/opt/mssql/backup/…; el proceso mssql necesita permisos de escritura en esa carpeta (usuario mssql). Un backup en el mismo disco que los datos no es un backup.',
      ],
      preguntas: [
        '¿Qué ventaja tiene CHECKSUM frente a lanzar un backup sin verificación de páginas?',
        '¿Cuándo usarías COPY_ONLY y qué se rompería si hicieras ese backup sin la opción?',
        '¿Dónde guardarías los ficheros .bak para cumplir la regla 3-2-1?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.7, h: 5.0, size: 12,
    code: `-- Full semanal con compresión y verificación de páginas
BACKUP DATABASE Ventas
TO DISK = N'${BK}Ventas_FULL.bak'
WITH COMPRESSION, CHECKSUM, INIT, STATS = 10;

-- Diferencial diario (cambios desde el último Full)
BACKUP DATABASE Ventas
TO DISK = N'${BK}Ventas_DIFF.bak'
WITH DIFFERENTIAL, COMPRESSION, CHECKSUM;

-- Log cada 15 min (sólo Full / Bulk-Logged)
BACKUP LOG Ventas
TO DISK = N'${BK}Ventas_LOG_01.trn'
WITH COMPRESSION, CHECKSUM;

-- Copia puntual que no altera la cadena
BACKUP DATABASE Ventas
TO DISK = N'${BK}Ventas_CO.bak'
WITH COPY_ONLY, COMPRESSION, CHECKSUM;`,
  });
  [
    ['FaFileArchive', 'COMPRESSION + CHECKSUM', 'Menos E/S y tamaño; valida páginas al leer.'],
    ['FaCopy', 'COPY_ONLY', 'Copia ad hoc sin alterar diferencial ni log chain.'],
    ['FaCloud', 'TO URL (Azure Blob)', 'Copia externa en la nube con credencial SAS.'],
  ].forEach(([icon, title, body], i) => rowCard(s, { x: 8.6, y: 1.75 + i * 1.77, w: 4.13, h: 1.46, icon, title, body }));

  // ═════════════════════════ 65 · Tail-log, verificación e historial msdb ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Backups',
    title: 'Tail-log, verificación e historial msdb',
    notes: {
      obj: 'Saber salvar la cola del log antes de restaurar, verificar que un backup es legible y consultar el historial de backups en msdb.',
      guion: [
        'Tail-log backup: es el log backup que se hace ANTES de restaurar para capturar las transacciones que aún no estaban en ningún backup. WITH NORECOVERY deja la base en estado RESTORING e impide nuevas transacciones; WITH NO_TRUNCATE permite hacerlo aunque la base esté dañada (siempre que el LDF sea accesible). Es lo que da un RPO cercano a cero.',
        'Si el LDF también se ha perdido, el tail-log es imposible y el RPO queda en el último log backup. Por eso conviene separar MDF y LDF en discos distintos, y por eso los log backups frecuentes importan más que los Full.',
        'RESTORE VERIFYONLY comprueba que el set de backup está completo y es legible (cabecera, checksums si se tomó WITH CHECKSUM). NO restaura datos ni garantiza que la base sea consistente: es una verificación mínima. La prueba real es restaurar en otro servidor y lanzar DBCC CHECKDB.',
        'msdb.dbo.backupset guarda un registro por backup (type: D = Full, I = Diferencial, L = Log; is_copy_only, first_lsn, last_lsn, backup_size, compressed_backup_size) y backupmediafamily la ruta física. msdb.dbo.restorehistory documenta las restauraciones. Son la fuente de verdad para reconstruir la cadena cuando alguien pregunta «¿cuál fue el último backup?».',
        'Limpieza: msdb crece con el historial; programar sp_delete_backuphistory @oldest_date (lo veremos en mantenimiento) y vigilar el tamaño de msdb. Alerta: un backup «reciente» en msdb no implica que el fichero exista aún en disco.',
        'RESTORE HEADERONLY, RESTORE FILELISTONLY y RESTORE LABELONLY inspeccionan el contenido de un .bak sin restaurarlo; FILELISTONLY es imprescindible para saber qué nombres lógicos usar en MOVE.',
      ],
      preguntas: [
        '¿Qué diferencia hay entre «el backup se ha verificado» y «la base se puede restaurar»?',
        '¿Qué haces si el servidor ha caído, el MDF está corrupto pero el LDF está intacto?',
        '¿Cómo detectarías con una consulta que lleva dos semanas sin hacerse un log backup en alguna base?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 5.9, h: 3.35, size: 12,
    code: `-- Tail-log: salvar el final del log antes de restaurar
BACKUP LOG Ventas
TO DISK = N'${BK}Ventas_TAIL.trn'
WITH NO_TRUNCATE, NORECOVERY, CHECKSUM;

-- Verificar el backup sin restaurarlo
RESTORE VERIFYONLY
FROM DISK = N'${BK}Ventas_FULL.bak'
WITH CHECKSUM;`,
  });
  H.code(s, {
    x: 6.8, y: 1.75, w: 5.93, h: 3.35, size: 12,
    label: 'T-SQL · HISTORIAL EN MSDB',
    code: `SELECT TOP (10) bs.database_name,
       bs.type,   -- D=Full I=Diff L=Log
       bs.backup_finish_date,
       bs.is_copy_only,
       bmf.physical_device_name
FROM msdb.dbo.backupset AS bs
JOIN msdb.dbo.backupmediafamily AS bmf
  ON bmf.media_set_id = bs.media_set_id
WHERE bs.database_name = N'Ventas'
ORDER BY bs.backup_finish_date DESC;`,
  });
  H.callout(s, { x: 0.6, y: 5.45, w: 12.13, h: 1.25, kind: 'warn', lead: 'VERIFYONLY no basta:', text: 'sólo comprueba que el fichero es legible. La prueba real es restaurar en otro servidor y ejecutar DBCC CHECKDB; planifícala (p. ej. mensualmente).', size: 14 });

  // ═════════════════════════ 66 · Restauración point-in-time ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Restauración',
    title: 'Restauración point-in-time (STOPAT)',
    notes: {
      obj: 'Ser capaz de escribir y razonar la secuencia completa de RESTORE (Full → Diff → Logs) para volver a un instante concreto, entendiendo NORECOVERY, RECOVERY, STANDBY y MOVE.',
      guion: [
        'Orden estricto: 1) RESTORE DATABASE del Full con NORECOVERY; 2) el último Diferencial con NORECOVERY (opcional pero acelera); 3) todos los RESTORE LOG en orden de LSN con NORECOVERY; 4) el último log con STOPAT y RECOVERY (o sólo RECOVERY si se quiere hasta el final).',
        'NORECOVERY deja la base en RESTORING y NO deshace transacciones sin confirmar, para poder seguir aplicando backups. RECOVERY (opción por defecto) ejecuta la fase de undo, abre la base y ya no admite más backups de la cadena. STANDBY = fichero undo + base de sólo lectura entre restauraciones (útil en Log Shipping para consultar la réplica).',
        'STOPAT = fecha/hora: el motor reaplica el log hasta ese instante y descarta las transacciones posteriores (la hora es la del servidor, no UTC). Alternativas: STOPATMARK / STOPBEFOREMARK con transacciones marcadas (BEGIN TRAN … WITH MARK) y STOPAT con LSN en 2022.',
        'MOVE reubica los ficheros lógicos al restaurar (otro volumen o servidor). Los nombres lógicos se ven con RESTORE FILELISTONLY. En Linux/Docker las rutas son /var/opt/mssql/data/…; si no se usa MOVE, el motor intenta usar las rutas originales y falla si no existen.',
        'REPLACE sobrescribe una base existente: úsalo sólo si estás seguro. Antes, hacer siempre un tail-log. Para restauraciones parciales existen RESTORE … PAGE (restauración de página, online en Enterprise) y RESTORE con PARTIAL / filegroups.',
        'Progreso: STATS = 5 o sys.dm_exec_requests.percent_complete. El tiempo de restauración incluye la fase de recovery (redo/undo): un log de transacción largo con una transacción grande abierta alarga el undo. El Instant File Initialization acelera la creación de los MDF/NDF, no del LDF.',
        'Tras RECOVERY: validar el negocio (COUNT(*) de tablas clave), ejecutar DBCC CHECKDB y recrear logins huérfanos con ALTER USER … WITH LOGIN o sp_change_users_login (mismatch de SID al restaurar en otro servidor).',
      ],
      preguntas: [
        '¿Qué pasa si restauras el Full con RECOVERY y luego intentas aplicar un diferencial?',
        'Un compañero ejecutó DELETE sin WHERE a las 10:36. ¿Qué STOPAT usarías y qué harías con los datos introducidos entre las 10:36 y las 10:50?',
        '¿Por qué conviene restaurar con otro nombre en un servidor distinto antes de tocar producción?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.85, h: 5.0, size: 12,
    code: `-- 1) Full. MOVE reubica los ficheros lógicos
RESTORE DATABASE Ventas
FROM DISK = N'${BK}Ventas_FULL.bak'
WITH NORECOVERY,
  MOVE N'Ventas' TO N'/var/opt/mssql/data/Ventas.mdf',
  MOVE N'Ventas_log' TO N'/var/opt/mssql/data/Ventas.ldf';

-- 2) Último diferencial
RESTORE DATABASE Ventas
FROM DISK = N'${BK}Ventas_DIFF.bak'
WITH NORECOVERY;

-- 3) Logs en orden; el último, con STOPAT
RESTORE LOG Ventas
FROM DISK = N'${BK}Ventas_LOG_01.trn'
WITH NORECOVERY;

RESTORE LOG Ventas
FROM DISK = N'${BK}Ventas_LOG_02.trn'
WITH STOPAT = N'2025-03-12T10:36:00', RECOVERY;`,
  });
  [
    ['FaPause', 'NORECOVERY', 'Deja la BD en RESTORING; permite encadenar más backups.'],
    ['FaPlay', 'RECOVERY', 'Deshace lo no confirmado y abre la BD (ONLINE).'],
    ['FaEye', 'STANDBY', 'Sólo lectura entre restauraciones; usa fichero undo.'],
  ].forEach(([icon, title, body], i) => rowCard(s, { x: 8.75, y: 1.75 + i * 1.77, w: 3.98, h: 1.46, icon, title, body }));

  // ═════════════════════════ 67 · DBCC CHECKDB ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Integridad',
    title: 'Integridad física: DBCC CHECKDB',
    notes: {
      obj: 'Comprender cómo se detecta la corrupción (PAGE_VERIFY CHECKSUM, DBCC CHECKDB, errores 823/824/825) y por qué la reparación con pérdida de datos es el último recurso.',
      guion: [
        'PAGE_VERIFY CHECKSUM (por defecto desde 2005 en bases nuevas) escribe un checksum en la cabecera de cada página al grabarla a disco y lo valida al leerla. Detecta corrupción introducida por el subsistema de E/S. Comprobar con SELECT name, page_verify_option_desc FROM sys.databases; las bases migradas de 2000 pueden estar en TORN_PAGE_DETECTION o NONE.',
        'Los errores típicos: 823 = fallo de E/S del sistema operativo al leer/escribir (CRC, disco o controladora); 824 = error lógico de consistencia (checksum o torn page incorrectos); 825 = la lectura falló pero tuvo éxito tras reintentos (read-retry): es una alerta temprana de un disco que se está degradando. Todos son gravedad 24: crear alertas del Agent para 823, 824, 825 y gravedades 19–25.',
        'DBCC CHECKDB combina CHECKALLOC (asignación), CHECKTABLE (estructuras de tablas e índices), CHECKCATALOG y validación de Service Broker/vistas indexadas. Trabaja sobre un snapshot interno (sparse, sin bloqueos) y usa mucho TempDB y E/S. Con WITH PHYSICAL_ONLY es mucho más rápido (sólo estructura física y checksums); ejecutar la verificación completa al menos semanalmente.',
        'msdb.dbo.suspect_pages registra las páginas con error 823/824 (event_type 1–3: error de E/S, mal checksum, torn page; 4 = restaurada; 5 = reparada; 7 = desasignada). En un Availability Group, la réplica puede reparar páginas automáticamente (sys.dm_hadr_auto_page_repair).',
        'Reparación: REPAIR_REBUILD arregla problemas menores (por ejemplo, índices non-clustered) sin pérdida; REPAIR_ALLOW_DATA_LOSS borra páginas y filas para restaurar consistencia estructural, sin respetar integridad referencial ni reglas de negocio. Exige SINGLE_USER y siempre después de hacer un backup. Es el último recurso.',
        'Primera opción ante corrupción: restaurar desde backup (o RESTORE … PAGE si afecta a pocas páginas y existe log chain) y reaplicar logs; así no se pierden datos. Ejecuta CHECKDB sobre una copia restaurada para descargar producción y, de paso, probar los backups.',
      ],
      preguntas: [
        '¿Por qué un backup WITH CHECKSUM no sustituye a DBCC CHECKDB?',
        'Aparece un error 825 en el errorlog, pero las aplicaciones funcionan. ¿Qué haces y con qué urgencia?',
        '¿Cuándo es defendible usar REPAIR_ALLOW_DATA_LOSS, y qué comunicarías al negocio después?',
      ],
    },
  });
  [
    ['823', 'Error de E/S del sistema operativo'],
    ['824', 'Error lógico: checksum o página rota'],
    ['825', 'Lectura con éxito tras reintentos: disco en riesgo'],
  ].forEach(([v, l], i) => H.stat(s, { x: 0.6 + i * (3.84 + 0.3), y: 1.75, w: 3.84, h: 1.5, value: v, label: l }));
  H.code(s, {
    x: 0.6, y: 3.55, w: 6.9, h: 3.2, size: 12,
    code: `-- Verificación de páginas a nivel de BD
ALTER DATABASE Ventas SET PAGE_VERIFY CHECKSUM;

DBCC CHECKDB (N'Ventas') WITH NO_INFOMSGS, ALL_ERRORMSGS;

-- Páginas dañadas registradas por el motor
SELECT database_id, file_id, page_id, event_type
FROM msdb.dbo.suspect_pages;`,
  });
  H.card(s, {
    x: 7.8, y: 3.55, w: 4.93, h: 3.2, title: 'Opciones de reparación', icon: 'FaExclamationTriangle', accent: C.CORAL, size: 14,
    bullets: [
      { lead: 'REPAIR_REBUILD:', text: 'sin pérdida de datos.' },
      { lead: 'ALLOW_DATA_LOSS:', text: 'último recurso, tras backup.' },
      'Antes: restaurar desde backup.',
    ],
  });

  // ═════════════════════════ 68 · Reorganize vs Rebuild ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Mantenimiento',
    title: 'Reorganize vs Rebuild y estadísticas',
    notes: {
      obj: 'Elegir entre REORGANIZE y REBUILD según el nivel de fragmentación y entender por qué las estadísticas actualizadas importan más que la fragmentación.',
      guion: [
        'Fragmentación: sys.dm_db_index_physical_stats con modo LIMITED (barato, sólo nivel hoja padre) mide avg_fragmentation_in_percent (fragmentación lógica por Page Splits). Regla clásica: < 5 % no hacer nada; 5–30 % REORGANIZE; > 30 % REBUILD; ignorar índices de menos de ~1000 páginas (no merece la pena).',
        'REORGANIZE: compacta y reordena las páginas hoja en el sitio, siempre ONLINE, en pequeñas transacciones, se puede interrumpir sin perder el trabajo hecho, y NO actualiza estadísticas. Usa poco log pero lo genera de forma sostenida.',
        'REBUILD: crea un índice nuevo completo y elimina el viejo; actualiza las estadísticas del índice con el equivalente a FULLSCAN, aplica el fill factor y puede reducir el espacio. Es offline por defecto; ONLINE = ON sólo en Enterprise (con WAIT_AT_LOW_PRIORITY desde 2014 y RESUMABLE desde 2017). Registra mucho log en Full: vigilar el LDF y los log backups durante la ventana.',
        'Realidad moderna: con SSD/SAN y Buffer Pool grande la fragmentación influye menos que antes (sobre todo en scans y read-ahead). Lo realmente importante son las estadísticas: el optimizador estima cardinalidades con el histograma; estadísticas obsoletas = planes malos.',
        'Auto update statistics se dispara con ~20 % de filas modificadas (+500) en bases antiguas; con compatibilidad 130+ el umbral dinámico es SQRT(1000 × filas), mucho más sensible en tablas grandes. Se consulta con sys.dm_db_stats_properties (modification_counter, last_updated). UPDATE STATISTICS … WITH FULLSCAN en horas valle para tablas críticas.',
        'Recordatorio: REBUILD de todos los índices cada noche es un antipatrón de los Maintenance Plans clásicos; genera log, bloquea y no suele mejorar nada. Mejor soluciones por umbrales (Ola Hallengren) y fill factor adecuado para reducir los Page Splits.',
      ],
      preguntas: [
        '¿Por qué un REBUILD no necesita luego un UPDATE STATISTICS sobre el mismo índice, pero un REORGANIZE sí?',
        '¿Qué riesgo tiene un REBUILD nocturno de todos los índices en una base en recovery Full?',
        'Si la fragmentación está al 40 % en un índice de 200 páginas, ¿merece la pena actuar?',
      ],
    },
  });
  H.table(
    s,
    [
      ['Criterio', 'REORGANIZE', 'REBUILD'],
      ['Fragmentación', '5 – 30 %', '> 30 %'],
      ['Modo', 'Siempre online', 'Offline (online en Enterprise)'],
      ['Interrumpible', 'Sí, sin perder avance', 'No (salvo RESUMABLE)'],
      ['Estadísticas', 'No las actualiza', 'Actualiza con FULLSCAN'],
      ['Log', 'Moderado y sostenido', 'Mucho en recovery Full'],
    ],
    { x: 0.6, y: 1.75, w: 5.7, colW: [1.5, 2.0, 2.2], size: 13, maxH: 3.8 }
  );
  H.code(s, {
    x: 6.6, y: 1.75, w: 6.13, h: 3.7, size: 12,
    code: `SELECT OBJECT_NAME(ips.object_id) AS Tabla, i.name,
       ips.avg_fragmentation_in_percent AS Frag
FROM sys.dm_db_index_physical_stats
     (DB_ID(), NULL, NULL, NULL, 'LIMITED') AS ips
JOIN sys.indexes AS i
  ON i.object_id = ips.object_id
 AND i.index_id = ips.index_id
WHERE ips.page_count > 1000 AND i.index_id > 0;

ALTER INDEX IX_Pedido_Fecha ON dbo.Pedido REORGANIZE;
ALTER INDEX IX_Pedido_Fecha ON dbo.Pedido REBUILD;
UPDATE STATISTICS dbo.Pedido WITH FULLSCAN;`,
  });
  H.callout(s, { x: 0.6, y: 5.75, w: 12.13, h: 1.0, kind: 'tip', lead: 'Estadísticas primero:', text: 'actualízalas por umbral de cambios (dm_db_stats_properties) y en horas valle; suelen aportar más que reconstruir índices.', size: 14 });

  // ═════════════════════════ 69 · Mantenimiento automatizado ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Mantenimiento',
    title: 'Mantenimiento automatizado con Agent',
    notes: {
      obj: 'Conocer las piezas para automatizar el mantenimiento (Agent jobs, Maintenance Plans, scripts de Ola Hallengren, limpieza de msdb, Database Mail y alertas) y saber elegir entre ellas.',
      guion: [
        'SQL Server Agent ejecuta jobs: pasos (T-SQL, CmdExec, PowerShell, SSIS), schedules, notificaciones y reintentos. El estado vive en msdb (sysjobs, sysjobsteps, sysjobhistory). No existe en Express. En Docker/Linux se activa con MSSQL_AGENT_ENABLED=true (o mssql-conf set sqlagent.enabled true).',
        'Maintenance Plans: asistente gráfico, genera paquetes SSIS. Son fáciles pero poco flexibles: la tarea «Rebuild Index» reconstruye todo sin mirar fragmentación y la tarea «Shrink Database» es un antipatrón (fragmenta de nuevo y provoca crecimiento posterior).',
        'Scripts de Ola Hallengren (ola.hallengren.com): DatabaseBackup, DatabaseIntegrityCheck e IndexOptimize como procedimientos almacenados con parámetros (@FragmentationLevel1 = 5, @FragmentationLevel2 = 30, @UpdateStatistics = «ALL», @LogToTable). Son el estándar de facto, se auditan en la tabla CommandLog y funcionan con jobs de Agent. Recomendados sobre los Maintenance Plans.',
        'Limpieza de msdb: sp_delete_backuphistory @oldest_date, sp_purge_jobhistory, sysmail_delete_mailitems_sp y sysmail_delete_log_sp. Un msdb con años de historial ralentiza SSMS y las restauraciones (el asistente consulta backupset).',
        'Database Mail (sp_configure «Database Mail XPs», perfil + cuenta SMTP) permite que el Agent notifique. Los operadores (sp_add_operator) definen quién recibe correos de fallo de job. Alertas del Agent: por gravedad 19–25 y por errores concretos (823, 824, 825, 9002); la alerta dispara un job o notifica a un operador.',
        'Calendario de referencia en producción: log backup cada 15 min; diferencial diario; Full semanal; CHECKDB semanal; IndexOptimize diario/semanal; limpieza de historial semanal. Todo con notificación de fallo y vigilancia de que el job «no se ha ejecutado» (un job que nunca corre no falla).',
      ],
      preguntas: [
        '¿Qué ventajas ofrece una solución basada en scripts frente a un Maintenance Plan gráfico? ¿Y desventajas?',
        '¿Cómo te enterarías de que un job de backup lleva tres noches sin ejecutarse?',
        '¿Qué errores y gravedades darías de alta como alertas en una instancia nueva?',
      ],
    },
  });
  H.cardsGrid(
    s,
    [
      { icon: 'FaCalendarAlt', title: 'SQL Server Agent jobs', body: 'Pasos T-SQL o CmdExec, schedules e historial en msdb.' },
      { icon: 'FaClipboardList', title: 'Maintenance Plans', body: 'Asistente gráfico (SSIS): simple, pero poco flexible.' },
      { icon: 'FaCode', title: 'Scripts Ola Hallengren', body: 'DatabaseBackup, IntegrityCheck e IndexOptimize por umbrales.' },
      { icon: 'FaBroom', title: 'Limpieza de msdb', body: 'sp_delete_backuphistory y sp_purge_jobhistory semanales.' },
      { icon: 'FaEnvelope', title: 'Database Mail y operadores', body: 'El operador recibe el correo cuando un job falla.' },
      { icon: 'FaBell', title: 'Alertas del Agent', body: 'Gravedad 19–25 y errores 823, 824, 825 y 9002.' },
    ],
    { cols: 3, x: 0.6, y: 1.75, w: 12.13, h: 5.0, size: 14, titleSize: 16 }
  );

  // ═════════════════════════ 70 · LDF lleno ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Incidencias',
    title: 'Incidencia: log de transacciones lleno',
    notes: {
      obj: 'Diagnosticar un LDF lleno (error 9002) mediante log_reuse_wait_desc, tratar la causa raíz y evitar «soluciones» peligrosas como borrar el fichero o encadenar SHRINKFILE.',
      guion: [
        'Síntoma: error 9002 «The transaction log for database is full due to …». El motivo se indica al final del mensaje y en sys.databases.log_reuse_wait_desc: es lo que impide que los VLFs inactivos se marquen como reutilizables (truncado lógico).',
        'LOG_BACKUP: la causa más habitual; la base está en Full/Bulk-Logged y no hay BACKUP LOG programado (o ha fallado). Solución: hacer log backup y programarlos cada 15 min.',
        'ACTIVE_TRANSACTION: una transacción larga o abandonada mantiene activo el MinLSN; el log no se puede truncar aunque se hagan log backups. DBCC OPENTRAN o sys.dm_tran_active_transactions + sys.dm_exec_sessions localizan al responsable; cerrar la transacción en el cliente es preferible a KILL (el rollback puede tardar tanto como el trabajo hecho).',
        'AVAILABILITY_REPLICA y REPLICATION: una réplica del AG atrasada (sys.dm_hadr_database_replica_states) o un Log Reader Agent parado retienen el log hasta que el consumidor lo lea. También hay OLDEST_PAGE, CHECKPOINT, ACTIVE_BACKUP_OR_RESTORE y DATABASE_MIRRORING.',
        'Medición: DBCC SQLPERF (LOGSPACE) o sys.dm_db_log_space_usage; sys.dm_db_log_info (2016 SP2+) muestra los VLFs. Un autogrowth pequeño (1 MB o 10 %) crea cientos de VLFs y ralentiza recuperación y backups: configurar crecimiento fijo (p. ej. 512 MB–1 GB) y tamaño inicial adecuado.',
        'Qué NO hacer: borrar o renombrar el .ldf, pasar a Simple «para que se vacíe» sin entender que se rompe la log chain, o reducir (SHRINKFILE) en bucle. En emergencia puede añadirse un segundo fichero de log en otro volumen y retirarlo después. La reducción es puntual, tras resolver la causa.',
      ],
      preguntas: [
        '¿Por qué hacer un BACKUP LOG no libera espacio si hay una transacción abierta desde ayer?',
        '¿Qué implica cambiar la base a Simple en mitad de la incidencia para el RPO del negocio?',
        '¿Cómo evitarías que se repita (monitorización, tamaño inicial, autogrowth, alertas)?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 5.2, h: 3.3, size: 12,
    code: `SELECT name, recovery_model_desc,
       log_reuse_wait_desc
FROM sys.databases
WHERE name = N'Ventas';

DBCC SQLPERF (LOGSPACE);
DBCC OPENTRAN (N'Ventas');

BACKUP LOG Ventas
TO DISK = N'${BK}Log2.trn';`,
  });
  H.table(
    s,
    [
      ['log_reuse_wait_desc', 'Causa', 'Acción'],
      ['LOG_BACKUP', 'Sin log backups', 'BACKUP LOG y programarlo'],
      ['ACTIVE_TRANSACTION', 'Transacción larga abierta', 'DBCC OPENTRAN; cerrarla'],
      ['AVAILABILITY_REPLICA', 'Réplica AG atrasada', 'Revisar red y réplica'],
      ['REPLICATION', 'Log Reader parado', 'Reiniciar el agente'],
    ],
    { x: 6.1, y: 1.75, w: 6.63, colW: [2.3, 2.2, 2.2], size: 13, maxH: 3.3 }
  );
  H.callout(s, { x: 0.6, y: 5.4, w: 12.13, h: 1.3, kind: 'warn', lead: 'Nunca borres el .ldf:', text: 'la base puede quedar sin recuperar. Resuelve la causa raíz (log_reuse_wait_desc) y reduce el fichero sólo una vez, después.', size: 14 });

  // ═════════════════════════ 71 · TempDB saturada ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Incidencias',
    title: 'Incidencia: TempDB saturada',
    notes: {
      obj: 'Identificar qué consume TempDB (objetos de usuario, internos y version store) y reconocer y mitigar la contención de páginas de asignación PFS/GAM/SGAM.',
      guion: [
        'TempDB se recrea en cada arranque a partir de model; usa un log que no hace redo y es siempre «minimal». Todas las sesiones la comparten: una consulta descontrolada o una transacción larga puede llenarla y afectar a toda la instancia (errores 1105 y 9002 sobre tempdb).',
        'Consumidores: (1) objetos de usuario (#tablas, @variables tabla, cursores); (2) objetos internos (sorts, hash joins, spools, spills a disco por una mala estimación del memory grant: aparecen como Sort/Hash Warning en el plan); (3) version store, con RCSI, SNAPSHOT, triggers, online index operations: lo limpia una tarea de fondo, pero una transacción larga abierta impide la limpieza.',
        'Diagnóstico: sys.dm_db_file_space_usage (user_object_reserved_page_count, internal_object_reserved_page_count, version_store_reserved_page_count), sys.dm_db_session_space_usage y sys.dm_db_task_space_usage por sesión; sys.dm_tran_active_snapshot_database_transactions para la transacción más antigua del version store.',
        'Contención de asignación: PFS (página 1, cada 8088 páginas), GAM (página 2) y SGAM (página 3) se protegen con latches. Con muchas sesiones creando/destruyendo objetos temporales aparecen esperas PAGELATCH_UP/EX sobre 2:1:1, 2:1:2, 2:1:3 (sys.dm_os_waiting_tasks). Con 2019 se añade contención de metadatos, mitigable con MEMORY_OPTIMIZED TEMPDB_METADATA.',
        'Mitigación: varios ficheros de datos del MISMO tamaño y FILEGROWTH (1 por núcleo lógico hasta 8; si persiste, de 4 en 4); el instalador (2016+) propone el número y los TF 1117/1118 son comportamiento por defecto en tempdb. Pre-dimensionar y ponerla en almacenamiento rápido.',
        'No reducir tempdb de forma rutinaria: reiniciar la instancia la devuelve a su tamaño configurado. Si se llena, localizar la sesión (KILL con cautela), corregir la consulta (índices, estadísticas, memory grant) o acortar la transacción que retiene el version store.',
      ],
      preguntas: [
        '¿Qué diferencia hay entre un spill a TempDB y la creación explícita de una #tabla? ¿Cómo lo reconoces en el plan?',
        'Si activamos RCSI en Ventas, ¿qué cambia en el consumo de TempDB y qué vigilarías?',
        '¿Por qué los ficheros de tempdb deben tener el mismo tamaño?',
      ],
    },
  });
  H.cardsGrid(
    s,
    [
      { icon: 'FaLayerGroup', title: 'Version store', body: 'RCSI y snapshot guardan versiones; una transacción larga las retiene.' },
      { icon: 'FaDatabase', title: 'Spills y temporales', body: 'Sort/hash sin memoria suficiente y #tablas grandes.' },
      { icon: 'FaLock', title: 'PFS / GAM / SGAM', body: 'Contención PAGELATCH en páginas de asignación.' },
      { icon: 'FaHdd', title: 'Varios ficheros', body: 'Ficheros de igual tamaño: 1 por core, hasta 8.' },
    ],
    { cols: 2, x: 0.6, y: 1.75, w: 6.9, h: 5.0, size: 14, titleSize: 16 }
  );
  H.code(s, {
    x: 7.8, y: 1.75, w: 4.93, h: 3.45, size: 12,
    code: `-- ¿Quién consume TempDB?
SELECT TOP (5) session_id,
  internal_objects_alloc_page_count AS p_int
FROM sys.dm_db_session_space_usage
ORDER BY p_int DESC;

-- ¿Contención de asignación?
SELECT session_id, wait_type
FROM sys.dm_os_waiting_tasks
WHERE wait_type LIKE N'PAGELATCH%'
  AND resource_description LIKE N'2:%';`,
  });
  H.callout(s, { x: 7.8, y: 5.5, w: 4.93, h: 1.25, kind: 'tip', text: 'Ficheros iguales y pre-dimensionados; no hagas shrink rutinario.', size: 14 });

  // ═════════════════════════ 72 · Bloqueos y deadlocks ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Incidencias',
    title: 'Bloqueos prolongados y deadlocks',
    notes: {
      obj: 'Distinguir bloqueo prolongado de deadlock, localizar al bloqueador raíz con DMVs, leer el grafo de deadlock de system_health y aplicar mitigaciones (RCSI, índices, orden de acceso) sin abusar de KILL.',
      guion: [
        'Bloqueo (blocking): una sesión pide un lock incompatible con el que otra mantiene y espera (LCK_M_S, LCK_M_X, LCK_M_U…). Es normal y breve; es incidencia cuando se prolonga porque el bloqueador tiene una transacción abierta (sesión sleeping con open_transaction_count > 0).',
        'Diagnóstico: sys.dm_exec_requests.blocking_session_id muestra quién bloquea a cada petición; el bloqueador raíz es la sesión que bloquea a otras y no está bloqueada (blocking_session_id = 0). sys.dm_tran_locks (request_status = WAIT / GRANT) detalla recurso y modo; sys.dm_os_waiting_tasks da la cadena de esperas; sys.dm_exec_sql_text(sql_handle) y most_recent_sql_handle en dm_exec_connections revelan la consulta.',
        'Deadlock: dos o más sesiones se esperan en ciclo. El Lock Monitor (cada 5 s, más a menudo si hay deadlocks) elige una víctima (DEADLOCK_PRIORITY, luego menor coste de rollback) y devuelve el error 1205 al cliente. El grafo (xml_deadlock_report) está en la sesión Extended Events system_health (siempre activa, ficheros .xel); también TF 1222 lo escribe en el errorlog.',
        'Mitigación: transacciones cortas, acceder a los objetos siempre en el mismo orden, índices adecuados (menos filas bloqueadas, evita table scans bajo lock y la escalada a lock de tabla a las ~5000 locks), reintentos con TRY…CATCH ante el error 1205 y LOCK_TIMEOUT.',
        'Niveles de aislamiento: READ COMMITTED (por defecto) bloquea lectores contra escritores. READ_COMMITTED_SNAPSHOT (RCSI) hace que los lectores lean la última versión confirmada del version store (en TempDB) sin bloquear: ALTER DATABASE Ventas SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE. Coste: TempDB y 14 bytes por fila. SNAPSHOT añade lecturas consistentes por transacción y conflictos de actualización (error 3960).',
        'KILL <session_id> termina la sesión y revierte su transacción: el rollback puede ser tan largo como lo ya hecho (KILL … WITH STATUSONLY indica el avance) y mientras tanto sigue reteniendo locks. Nunca matar sesiones del sistema ni sin entender qué hace el proceso (backup, restore, rebuild). Es el último paso, tras intentar contactar al propietario.',
      ],
      preguntas: [
        '¿Cómo distingues desde las DMVs entre un bloqueo largo y un deadlock? ¿Qué ve el usuario en cada caso?',
        '¿Qué gana y qué pierde Ventas al activar RCSI? ¿Quién paga el coste?',
        'Encuentras que el bloqueador raíz es una sesión «sleeping» con una transacción abierta de hace 3 horas. ¿Qué haces antes de ejecutar KILL?',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 6.9, h: 5.0, size: 12,
    code: `-- Peticiones bloqueadas y su bloqueador
SELECT r.session_id, r.blocking_session_id,
       r.wait_type, r.wait_time, t.text
FROM sys.dm_exec_requests AS r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS t
WHERE r.blocking_session_id <> 0;

-- Locks en espera
SELECT resource_type, request_mode,
       request_status, request_session_id
FROM sys.dm_tran_locks
WHERE request_status = N'WAIT';

-- Grafo de deadlock (system_health)
SELECT CAST(xe.event_data AS XML) AS grafo
FROM sys.fn_xe_file_target_read_file
     (N'system_health*.xel', NULL, NULL, NULL) AS xe
WHERE xe.object_name = N'xml_deadlock_report';`,
  });
  [
    ['FaLock', 'Bloqueo prolongado', 'Transacción abierta sin COMMIT: el resto espera.'],
    ['FaSyncAlt', 'Deadlock (error 1205)', 'Ciclo de esperas; el Lock Monitor elige víctima.'],
    ['FaBalanceScale', 'RCSI y KILL con cautela', 'Los lectores no bloquean; KILL, el último recurso.'],
  ].forEach(([icon, title, body], i) => rowCard(s, { x: 7.8, y: 1.75 + i * 1.77, w: 4.93, h: 1.46, icon, title, body }));

  // ═════════════════════════ 73 · Lab 4 (A): preparar BD y cadena ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Laboratorio 4 · Preparación',
    title: 'Preparar la BD y la cadena de backups',
    lab: true,
    notes: {
      obj: 'Dejar la base Ventas lista para el ejercicio de desastre: recovery model Full y una log chain completa (Full, log, diferencial, log) con actividad entre backups.',
      guion: [
        'Contexto: el laboratorio simula el escenario del diagrama de la estrategia: un Full, actividad, backups intermedios y un desastre posterior. Todo se hace sobre Ventas (la base creada en los laboratorios anteriores) en el contenedor Docker de SQL Server.',
        'Importancia del orden: sin Full previo, BACKUP LOG falla (error 4214 / «no hay backup actual de la base»); un diferencial exige un Full base. Por eso el primer paso es el Full, y por eso la log chain empieza aquí.',
        'WITH COMPRESSION, CHECKSUM, INIT: INIT sobrescribe el fichero si se repite el ejercicio; CHECKSUM valida páginas. Las rutas son /var/opt/mssql/backup/ dentro del contenedor; hay que montarla como volumen (docker run -v …) si se quiere ver desde el host.',
        'La actividad entre backups (INSERT en dbo.Cliente) sirve para que cada tipo de backup contenga datos distintos y para poder comprobar después hasta dónde se restauró.',
        'Anotar la hora (SYSDATETIME) justo antes del desastre es el dato más importante de la práctica: será el STOPAT. Pedir al alumnado que lo copie en un bloc de notas.',
        'Tiempo: ~20 min. Mientras corren los backups, aprovechar para repasar msdb.dbo.backupset y la columna type.',
      ],
      preguntas: [
        '¿Qué ocurre si se lanza BACKUP LOG antes del primer Full? ¿Por qué?',
        '¿Qué contiene el diferencial respecto del log backup anterior?',
      ],
      lab: [
        'Paso 1 (SSMS o sqlcmd conectado al contenedor): ejecutar USE master; ALTER DATABASE Ventas SET RECOVERY FULL; y comprobar con SELECT recovery_model_desc FROM sys.databases WHERE name = N\'Ventas\'.',
        'Paso 2: tomar el Full inicial (Ventas_L4_FULL.bak). Verificar que aparece en msdb.dbo.backupset con type = D.',
        'Paso 3: insertar un cliente y tomar el primer log backup (Ventas_L4_LOG1.trn); insertar otro y tomar el diferencial (Ventas_L4_DIFF.bak).',
        'Paso 4: insertar un tercer cliente y tomar un segundo log backup (Ventas_L4_LOG2.trn). Ejecutar SELECT COUNT(*) FROM dbo.Pedido y anotar el resultado (baseline).',
        'Trampas habituales: (a) el usuario mssql del contenedor no tiene permiso sobre la carpeta del volumen montado (error 3201/«Operating system error 5»); (b) la base estaba en SIMPLE y no se cambió (BACKUP LOG devuelve el error 4208); (c) la columna Nombre de dbo.Cliente tiene otras columnas NOT NULL: adaptar el INSERT; (d) rutas Windows (C:\\…) en un contenedor Linux.',
        'Guía de resolución: SELECT bs.type, bs.backup_finish_date, bmf.physical_device_name FROM msdb.dbo.backupset bs JOIN msdb.dbo.backupmediafamily bmf ON bmf.media_set_id = bs.media_set_id WHERE bs.database_name = N\'Ventas\' ORDER BY bs.backup_finish_date; debe mostrar D, L, I, L en ese orden. Si falta alguno, repetir ese paso.',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.7, h: 5.0, size: 12,
    code: `USE master;
ALTER DATABASE Ventas SET RECOVERY FULL;

BACKUP DATABASE Ventas
TO DISK = N'${BK}Ventas_L4_FULL.bak'
WITH COMPRESSION, CHECKSUM, INIT;

USE Ventas;
INSERT dbo.Cliente (Nombre) VALUES (N'Lab4 A');
BACKUP LOG Ventas
TO DISK = N'${BK}Ventas_L4_LOG1.trn'
WITH CHECKSUM, INIT;

INSERT dbo.Cliente (Nombre) VALUES (N'Lab4 B');
BACKUP DATABASE Ventas
TO DISK = N'${BK}Ventas_L4_DIFF.bak'
WITH DIFFERENTIAL, CHECKSUM, INIT;`,
  });
  [
    ['Full en recovery Full', 'ALTER DATABASE y BACKUP DATABASE con CHECKSUM.'],
    ['Log backup 1', 'Tras insertar datos, inicia la log chain.'],
    ['Diferencial', 'Tras más actividad: WITH DIFFERENTIAL.'],
    ['Segundo log backup', 'Un cliente más y BACKUP LOG; anota el COUNT.'],
  ].forEach(([title, body], i) => rowCard(s, { x: 8.6, y: 1.75 + i * 1.27, w: 4.13, h: 1.0, num: i + 1, title, body }));

  // ═════════════════════════ 74 · Lab 4 (B): desastre y tail-log ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Laboratorio 4 · Desastre',
    title: 'Simular la pérdida de datos y el tail-log',
    lab: true,
    notes: {
      obj: 'Provocar un error humano (DELETE sin WHERE), registrar la hora previa y salvar las transacciones con un tail-log backup antes de restaurar.',
      guion: [
        'El error humano es la causa de pérdida de datos más frecuente en producción (más que el fallo hardware). Simulamos un DELETE FROM dbo.Pedido sin WHERE: las filas desaparecen de forma lógica pero el log las contiene.',
        'Capturar SYSDATETIME() justo antes, y esperar unos segundos (WAITFOR DELAY) antes del DELETE para que haya margen entre HoraOK y el accidente al fijar STOPAT. La hora es la del servidor: en Docker normalmente UTC.',
        'Tail-log backup con NORECOVERY: toma la cola del log (incluye el DELETE y todo lo anterior) y deja la base en RESTORING, bloqueando nuevas escrituras mientras se restaura. En producción es el paso que evita perder los últimos minutos.',
        'Explicar la lección: lo que se restaura es la base anterior al DELETE, pero los datos legítimos hechos entre el accidente y la detección se perderían; alternativa: restaurar con otro nombre (RESTORE … AS Ventas_Recup) y copiar sólo las filas borradas con INSERT…SELECT.',
        'Verificar el estado tras el tail-log: SELECT name, state_desc FROM sys.databases WHERE name = N\'Ventas\'; debe mostrar RESTORING.',
      ],
      preguntas: [
        '¿Por qué hay que hacer el tail-log ANTES de empezar a restaurar?',
        '¿Qué alternativa tendrías si sólo quisieras recuperar las filas borradas sin revertir toda la base?',
      ],
      lab: [
        'Paso 1: en una pestaña de SSMS ejecutar USE Ventas; SELECT COUNT(*) AS Pedidos FROM dbo.Pedido; y anotar el valor.',
        'Paso 2: ejecutar SELECT SYSDATETIME() AS HoraOK; copiar el valor (p. ej. 2025-03-12 10:36:05.1234567) y esperar 5 s con WAITFOR DELAY.',
        'Paso 3: ejecutar el «accidente»: DELETE FROM dbo.Pedido; y comprobar COUNT(*) = 0.',
        'Paso 4: desde master tomar el tail-log (Ventas_L4_TAIL.trn) WITH NORECOVERY, CHECKSUM. Si la sesión que borró sigue conectada a Ventas, cerrarla antes o añadir ALTER DATABASE … SET SINGLE_USER WITH ROLLBACK IMMEDIATE.',
        'Trampas habituales: (a) dejar USE Ventas activo y no poder pasar a RESTORING (hay conexiones abiertas); (b) olvidar anotar la hora; (c) usar NORECOVERY en el tail-log y luego querer consultar la base (está en RESTORING, es lo esperado); (d) confundir hora local y UTC.',
        'Guía de resolución: si el tail-log falla por conexiones, ejecutar ALTER DATABASE Ventas SET SINGLE_USER WITH ROLLBACK IMMEDIATE y repetir. Si se olvidó la hora, buscarla con fn_dblog o, tras restaurar a otro nombre, con una consulta por la fecha de la última fila válida.',
      ],
    },
  });
  [
    ['Anota HoraOK', 'SELECT SYSDATETIME() antes del accidente.'],
    ['Provoca el error', 'DELETE sin WHERE sobre dbo.Pedido.'],
    ['Salva la cola', 'Tail-log con NORECOVERY: la BD pasa a RESTORING.'],
  ].forEach(([title, body], i) => rowCard(s, { x: 0.6, y: 1.75 + i * 1.3, w: 5.0, h: 1.0, num: i + 1, title, body }));
  H.code(s, {
    x: 5.9, y: 1.75, w: 6.83, h: 3.7, size: 12,
    code: `USE Ventas;
SELECT COUNT(*) AS Pedidos FROM dbo.Pedido;
SELECT SYSDATETIME() AS HoraOK;    -- anótala
WAITFOR DELAY '00:00:05';

DELETE FROM dbo.Pedido;            -- "accidente"

USE master;
BACKUP LOG Ventas
TO DISK = N'${BK}Ventas_L4_TAIL.trn'
WITH NORECOVERY, CHECKSUM, INIT;`,
  });
  H.callout(s, { x: 0.6, y: 5.75, w: 12.13, h: 1.0, kind: 'warn', lead: 'Trampa:', text: 'si hay conexiones abiertas a Ventas, usa ALTER DATABASE … SET SINGLE_USER WITH ROLLBACK IMMEDIATE antes del tail-log.', size: 14 });

  // ═════════════════════════ 75 · Lab 4 (C): restauración point-in-time ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Laboratorio 4 · Restauración',
    title: 'Restaurar a un punto en el tiempo',
    lab: true,
    notes: {
      obj: 'Ejecutar la secuencia completa de restauración con STOPAT, recuperar Pedido y verificar el resultado comparándolo con el baseline.',
      guion: [
        'Secuencia: Full (NORECOVERY, REPLACE) → diferencial (NORECOVERY) → log 1 (NORECOVERY) → log 2 (NORECOVERY, si se tomó) → tail-log con STOPAT = HoraOK y RECOVERY. Cada paso debe devolver «RESTORE DATABASE successfully processed» antes del siguiente.',
        'El STOPAT ha de ir en el último log que cubra la hora y estar ANTES del DELETE. Si la hora indicada es anterior al inicio de ese log, el motor devuelve el error 4326 («too early to apply»); si es posterior al final, avisa de que el log termina antes (y la base queda recuperada al final del log).',
        'REPLACE es necesario porque la base existe (en RESTORING) y se sobrescribe. Si alguien omite NORECOVERY en el Full, el siguiente RESTORE falla («the database is online / el log no se puede restaurar»): hay que volver a empezar.',
        'Verificación: SELECT COUNT(*) FROM dbo.Pedido debe igualar el baseline anotado antes del DELETE. Después: DBCC CHECKDB (Ventas) WITH NO_INFOMSGS y una consulta a msdb.dbo.restorehistory para ver la secuencia.',
        'Cierre pedagógico: discutir el RTO real medido (cuánto tardó) y el RPO (qué se perdió, en este caso nada gracias al tail-log); conectar con el caso integrador.',
      ],
      preguntas: [
        '¿Qué diferencia habría si en vez de STOPAT usáramos sólo RECOVERY con el tail-log completo?',
        'Si el COUNT(*) es menor que el baseline, ¿qué hipótesis comprobarías primero?',
      ],
      lab: [
        'Paso 1: desde master, RESTORE DATABASE Ventas FROM DISK = Ventas_L4_FULL.bak WITH NORECOVERY, REPLACE.',
        'Paso 2: RESTORE DATABASE Ventas FROM DISK = Ventas_L4_DIFF.bak WITH NORECOVERY.',
        'Paso 3: RESTORE LOG con Ventas_L4_LOG1.trn (NORECOVERY); si se tomó el segundo log (LOG2), restaurarlo también en orden.',
        'Paso 4: RESTORE LOG con Ventas_L4_TAIL.trn WITH STOPAT = N\'<HoraOK>\', RECOVERY (usar el valor anotado; formato aaaa-mm-ddThh:mm:ss).',
        'Paso 5: comprobar COUNT(*) FROM dbo.Pedido = baseline, state_desc = ONLINE y ejecutar DBCC CHECKDB.',
        'Trampas habituales: (a) aplicar un log fuera de orden o saltarse uno: error 4305 («log too recent / LSN too early»); (b) STOPAT posterior al DELETE: la tabla sigue vacía; (c) restaurar el Full sin NORECOVERY: la base se abre y la cadena se corta; (d) nombres lógicos distintos al usar MOVE (revisar con RESTORE FILELISTONLY).',
        'Guía de resolución: si se cometió el error (c), repetir desde el paso 1 con REPLACE. Si STOPAT queda tarde, repetir toda la secuencia con una hora anterior (restaurando de nuevo desde el Full). Comprobar los LSN con RESTORE HEADERONLY o en msdb.dbo.backupset (first_lsn / last_lsn).',
      ],
    },
  });
  H.code(s, {
    x: 0.6, y: 1.75, w: 7.7, h: 5.0, size: 12,
    code: `USE master;
RESTORE DATABASE Ventas
FROM DISK = N'${BK}Ventas_L4_FULL.bak'
WITH NORECOVERY, REPLACE;

RESTORE DATABASE Ventas
FROM DISK = N'${BK}Ventas_L4_DIFF.bak'
WITH NORECOVERY;

RESTORE LOG Ventas
FROM DISK = N'${BK}Ventas_L4_LOG1.trn'
WITH NORECOVERY;

RESTORE LOG Ventas
FROM DISK = N'${BK}Ventas_L4_TAIL.trn'
WITH STOPAT = N'2025-03-12T10:36:00', RECOVERY;

SELECT COUNT(*) AS Pedidos FROM Ventas.dbo.Pedido;`,
  });
  H.card(s, {
    x: 8.6, y: 1.75, w: 4.13, h: 2.7, title: 'Verifica el resultado', tone: 'tint', icon: 'FaCheckCircle',
    bullets: ['COUNT(*) igual al baseline', 'state_desc = ONLINE', 'DBCC CHECKDB sin errores'],
  });
  H.callout(s, { x: 8.6, y: 4.75, w: 4.13, h: 2.0, kind: 'warn', lead: 'Trampa:', text: 'STOPAT va en HoraOK, antes del DELETE, y sin NORECOVERY en el último paso.', size: 14 });

  // ═════════════════════════ 76 · Caso práctico integrador ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Caso integrador final',
    title: 'Caso práctico integrador final',
    lab: true,
    notes: {
      obj: 'Integrar todo el curso en un único entregable: dejar una instancia lista para producción con seguridad, rendimiento, estrategia de backups y mantenimiento que cumpla un RPO y un RTO dados.',
      guion: [
        'Escenario: «Ventas S.A.» pone en producción la base Ventas (Cliente, Pedido, Producto) en una instancia nueva. Se pide un plan de operación defendible ante el responsable de sistemas, con un RPO ≤ 15 min y un RTO ≤ 60 min.',
        'Requisitos de seguridad (Módulo 2): login SQL o de dominio para la aplicación con permisos mínimos (db_datareader/db_datawriter o permisos sobre schema), rol de sólo lectura para informes, ningún miembro de sysadmin salvo el DBA; auditoría básica de logins fallidos.',
        'Requisitos de rendimiento (Módulo 3): al menos 2 índices justificados con plan de ejecución antes/después (por ejemplo, Pedido por ClienteId + Fecha con INCLUDE de Total) y una consulta analítica que pase de scan a seek; evidencias con SET STATISTICS IO.',
        'Requisitos de backups (Módulo 4): recovery Full, Full semanal, Diferencial diario, Log cada 15 min con COMPRESSION y CHECKSUM, copia fuera del servidor (Azure Blob o ruta de red), restauración de prueba en otro nombre (Ventas_Test) con medición del tiempo real.',
        'Mantenimiento: jobs de Agent para backups, CHECKDB semanal, mantenimiento de índices y estadísticas por umbrales, limpieza de msdb, alertas 823/824/825 y gravedad 19–25, Database Mail y operador DBA.',
        'Evaluación: seguridad 25 %, rendimiento 25 %, backups y restauración 30 %, mantenimiento y alertas 20 %. Entregables: script T-SQL (idempotente y comentado), informe breve de 1–2 páginas con RPO/RTO medidos y capturas de la restauración.',
      ],
      preguntas: [
        '¿Cómo demostrarías con datos que se cumple el RPO de 15 minutos? ¿Y el RTO de 60 minutos?',
        '¿Qué riesgo queda sin cubrir con este diseño (p. ej. fallo del sitio completo) y cómo lo mitigarías con lo visto en HA/DR?',
        '¿Qué pondrías en el runbook para que otra persona pueda restaurar a las 3 de la madrugada?',
      ],
      lab: [
        'Dinámica: trabajo individual o en parejas, ~60 min más 10 min de puesta en común. El docente recorre los grupos con la rúbrica.',
        'Paso 1 (10 min): seguridad: CREATE LOGIN + CREATE USER + roles; probar con EXECUTE AS que la app no puede DROP ni leer fuera de su schema.',
        'Paso 2 (15 min): índices: capturar el plan antes (Table Scan / Key Lookup), crear el índice (con INCLUDE), capturar después (Index Seek) y comparar lecturas lógicas.',
        'Paso 3 (20 min): backups: recovery Full, Full + Diff + Log con CHECKSUM, simular un fallo y restaurar a otro nombre con MOVE, medir el RTO.',
        'Paso 4 (15 min): mantenimiento: crear al menos un job (log backup cada 15 min), una alerta (error 823 o gravedad 24) y el operador DBA.',
        'Trampas habituales: backups en el mismo volumen que los datos; no probar la restauración; dar sysadmin a la aplicación «para ir más rápido»; índices duplicados; olvidar el INCLUDE y mantener el Key Lookup; no iniciar la log chain (falta del primer Full).',
        'Guía de resolución: seguridad correcta = login → user → rol/permisos sin sysadmin; rendimiento = lecturas lógicas menores y plan con Seek; backups = cadena msdb completa (D, I, L) y tiempo de restore medido < 60 min; mantenimiento = jobs con historial en msdb y alertas visibles en sysjobs / sysalerts.',
      ],
    },
  });
  [
    ['15 min', 'RPO: log backup cada 15 minutos'],
    ['60 min', 'RTO: restaurar y validar en una hora'],
    ['3 roles', 'Mínimo privilegio: app, informes, DBA'],
    ['1 / sem', 'DBCC CHECKDB semanal con alerta'],
  ].forEach(([v, l], i) => H.stat(s, { x: 0.6 + i * (2.81 + 0.3), y: 1.75, w: 2.81, h: 1.45, value: v, label: l, valueSize: 40 }));
  H.card(s, {
    x: 0.6, y: 3.5, w: 7.0, h: 3.25, title: 'Requisitos de Ventas S.A.', icon: 'FaClipboardList',
    bullets: [
      { lead: 'Seguridad:', text: 'logins y roles sin sysadmin.' },
      { lead: 'Índices:', text: '2 justificados con su plan.' },
      { lead: 'Backups:', text: 'Full, Diff y Log; prueba de restore.' },
      { lead: 'Mantenimiento:', text: 'jobs, CHECKDB y alertas.' },
    ],
  });
  H.card(s, {
    x: 7.9, y: 3.5, w: 4.83, h: 3.25, title: 'Evaluación y entregables', tone: 'tint', icon: 'FaStopwatch',
    bullets: [
      { lead: 'Peso:', text: '25 · 25 · 30 · 20 %.' },
      'Script T-SQL comentado.',
      'Informe con RPO y RTO medidos.',
    ],
  });

  // ═════════════════════════ 77 · Checklist de buenas prácticas DBA ═════════════════════════
  s = H.slide(pres, {
    mod: 4,
    badge: 'Resumen',
    title: 'Checklist de buenas prácticas del DBA',
    notes: {
      obj: 'Consolidar en una lista accionable los hábitos que protegen la instancia y que el alumnado puede aplicar desde el primer día de trabajo.',
      guion: [
        'Backups: el estándar es recovery Full con Full + Diff + Log según RPO/RTO, siempre con CHECKSUM y compresión, guardados fuera del servidor (3-2-1) y con una restauración de prueba mensual. «Un backup no probado es una esperanza».',
        'Integridad: PAGE_VERIFY CHECKSUM en todas las bases, DBCC CHECKDB al menos semanal (idealmente sobre una copia restaurada) y alertas 823, 824, 825 y gravedad 19–25 enviadas por Database Mail.',
        'Mantenimiento: reorganizar/reconstruir por umbrales (5 %/30 %, > 1000 páginas), estadísticas actualizadas, limpieza de msdb y revisión del historial de jobs. Evitar SHRINK y rebuild ciegos.',
        'Capacidad y rendimiento: autogrowth en MB fijos y tamaños iniciales realistas, ficheros de tempdb iguales, monitorización de espacio, log_reuse_wait_desc y esperas con DMVs. Baseline para detectar desviaciones.',
        'Seguridad: mínimo privilegio, sin cuentas compartidas, sa deshabilitada o con contraseña robusta, auditoría de sysadmin y parches (CU) al día con ventana de mantenimiento.',
        'Operación: runbooks documentados, contactos de escalado, pruebas de DR periódicas (RPO/RTO medidos) y control de cambios. La automatización reduce errores humanos, la principal causa de incidentes.',
      ],
      preguntas: [
        '¿Qué elemento del checklist es el más barato de implantar y el más caro de olvidar?',
        '¿Cuáles de estos hábitos ya se aplican en vuestra organización y cuáles no? ¿Qué impide hacerlo?',
      ],
    },
  });
  const chk = [
    ['Backups probados', 'Full + Diff + Log con CHECKSUM, copia externa y restore mensual.'],
    ['Recovery Full en producción', 'Log backups cada 15 min según el RPO.'],
    ['Integridad vigilada', 'PAGE_VERIFY CHECKSUM y CHECKDB semanal.'],
    ['Mantenimiento por umbrales', 'Índices y estadísticas con scripts, no a ciegas.'],
    ['Capacidad controlada', 'Autogrowth fijo, tempdb igual y espacio monitorizado.'],
    ['Alertas operativas', 'Errores 823/824/825 y gravedad 19–25 por correo.'],
    ['Mínimo privilegio', 'Roles ajustados y auditoría de sysadmin.'],
    ['Runbook y DR', 'Procedimientos documentados y RPO/RTO medidos.'],
  ];
  chk.forEach(([title, body], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    rowCard(s, { x: 0.6 + col * (5.915 + 0.3), y: 1.75 + row * 1.275, w: 5.915, h: 0.975, icon: 'FaCheckCircle', title, body });
  });

  // ═════════════════════════ 78 · Cierre del curso ═════════════════════════
  H.closing(pres, {
    mod: 4,
    title: 'Gracias: ahora piensas como un DBA',
    points: [
      { icon: 'FaCogs', title: 'Entiende el motor', text: 'Buffer Pool, WAL y VLFs explican rendimiento y recuperación.' },
      { icon: 'FaShieldAlt', title: 'Protege los datos', text: 'Mínimo privilegio y backups con CHECKSUM, probados.' },
      { icon: 'FaTachometerAlt', title: 'Optimiza con datos', text: 'Índices, estadísticas y DMVs antes de tocar nada.' },
      { icon: 'FaSyncAlt', title: 'Automatiza y vigila', text: 'Jobs, alertas y runbooks: menos errores humanos.' },
    ],
    notes: {
      obj: 'Cerrar el curso resumiendo las ideas que el alumnado debe recordar y animarle a seguir practicando con un entorno propio.',
      guion: [
        'Resumen en cuatro ideas. 1) Entender el motor: Relational Engine, Storage Engine, Buffer Pool y el Transaction Log (WAL) explican por qué SQL Server rinde y se recupera como lo hace; casi todo problema se resuelve mejor sabiendo qué hay debajo.',
        '2) Proteger los datos: mínimo privilegio, estrategia de backups alineada con RPO/RTO, CHECKSUM, tail-log, restauraciones de prueba y DBCC CHECKDB. La disciplina vale más que las herramientas.',
        '3) Optimizar con evidencia: medir primero (DMVs, planes de ejecución, esperas) y actuar después (índices adecuados, estadísticas actualizadas), evitando «recetas» como rebuild nocturno o shrink.',
        '4) Automatizar y vigilar: jobs del Agent, alertas, Database Mail y runbooks. Un DBA eficaz es el que consigue que lo previsible no requiera intervención y que lo imprevisto se detecte pronto.',
        'Próximos pasos recomendados: montar un laboratorio personal en Docker; practicar Always On Availability Groups, TDE y Always Encrypted; explorar Query Store y Extended Events; preparar las certificaciones DP-300 (Azure Database Administrator) o similares.',
        'Cerrar con la evaluación del caso integrador, la encuesta del curso y un espacio para dudas. Agradecer la participación y compartir los scripts y la guía del docente.',
      ],
      preguntas: [
        '¿Qué es lo primero que cambiarías mañana en tu instancia de producción tras este curso?',
        '¿Qué parte te gustaría profundizar: alta disponibilidad, tuning de consultas o seguridad avanzada?',
      ],
    },
  });
};
