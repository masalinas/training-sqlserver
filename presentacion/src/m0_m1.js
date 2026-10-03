'use strict';
/**
 * m0_m1.js — Módulo 0 (Bienvenida y entorno) y Módulo 1 (Fundamentos y arquitectura. Licenciamiento).
 * Diapositivas 1–20.
 */
module.exports = async (pres, H, D) => {
  const { COL, CX, CW, CY, CH } = H;

  // ════════════════════════ MÓDULO 0 — Bienvenida y entorno (1–4) ════════════════════════

  // 1 ─ Portada
  H.titleSlide(pres, {
    tag: 'CURSO DE FORMACIÓN · 25 H',
    title: 'Administración de SQL Server',
    subtitle: 'De la arquitectura del motor a la alta disponibilidad: operar bases de datos en producción',
    notes: {
      obj: 'Dar la bienvenida, situar el curso en el rol real de un DBA y fijar expectativas sobre lo que el alumno sabrá hacer al terminar.',
      guion: [
        'Presentación del instructor y de los alumnos: ronda rápida (rol, experiencia previa con T-SQL, qué versión de SQL Server usan hoy en su empresa).',
        'Mensaje clave: un DBA no "administra tablas", garantiza que los datos estén disponibles, íntegros, seguros y rápidos. Los cuatro adjetivos estructuran el curso.',
        'El curso son 25 horas repartidas en 4 módulos: Fundamentos y arquitectura (5,5 h), Gestión y seguridad (7 h), Optimización y alta disponibilidad (6 h) y Mantenimiento y buenas prácticas (6 h), más 0,5 h de bienvenida y entorno.',
        'Cada módulo termina con un laboratorio guiado y el curso cierra con un caso práctico integrador que obliga a combinar todo: diseño, seguridad, índices y backups.',
        'Versión de referencia: SQL Server 2022 (compatible con 2019). Las diferencias relevantes con 2016/2017 y 2025 se señalan cuando importan.',
      ],
      preguntas: [
        '¿Quién ha sufrido alguna vez una caída de producción por falta de espacio, de backups o de índices? (Sirve de gancho para todo el curso.)',
        '¿Qué esperáis poder hacer el último día que hoy no sabéis hacer?',
      ],
    },
  });

  // 2 ─ Objetivos y estructura del curso
  let s = H.slide(pres, {
    mod: 0, badge: 'Bienvenida', title: 'Qué vamos a aprender: 25 horas, 4 módulos',
    notes: {
      obj: 'Que el alumno visualice el mapa completo del curso, el reparto horario y las competencias que adquirirá.',
      guion: [
        'Módulo 1 (5,5 h): cómo es SQL Server por dentro. Sin entender Buffer Pool, páginas, ficheros y log no se puede diagnosticar nada después. Incluye ediciones y licenciamiento, que es donde más dinero se gasta o se pierde.',
        'Módulo 2 (7 h): crear objetos (tablas, restricciones, vistas, procedimientos), consultar con soltura (JOINs, window functions) y asegurar el acceso con el principio de mínimo privilegio.',
        'Módulo 3 (6 h): rendimiento (índices, estadísticas, planes de ejecución, DMVs) y alta disponibilidad / recuperación ante desastres (RTO, RPO, Log Shipping, FCI, Always On AG).',
        'Módulo 4 (6 h): lo que separa a un aficionado de un DBA: modelos de recuperación, backups, restauración point-in-time, DBCC CHECKDB, automatización con Agent y resolución de incidencias.',
        'Los números no son rígidos: si un laboratorio genera debate, se recorta teoría. El tiempo de laboratorio es el más valioso.',
        'Al final del curso el alumno podrá diseñar una estrategia de backup que cumpla un RPO dado, interpretar un plan de ejecución, y montar un esquema de permisos segregado.',
      ],
      preguntas: [
        'De los cuatro bloques, ¿cuál creéis que os va a costar más y por qué?',
        '¿Qué tema que no aparece aquí os gustaría ver? (Anotarlo para el cierre del curso.)',
      ],
    },
  });
  const mods = [
    ['0,5 h', 'Bienvenida y entorno'],
    ['5,5 h', 'Fundamentos y arquitectura'],
    ['7 h', 'Gestión y seguridad'],
    ['6 h', 'Optimización y alta disponibilidad'],
    ['6 h', 'Mantenimiento y buenas prácticas'],
  ];
  const sw = (CW - 4 * 0.25) / 5;
  mods.forEach(([v, l], i) => H.stat(s, { x: CX + i * (sw + 0.25), y: CY, w: sw, h: 1.9, value: v, label: `M${i} · ${l}`, tone: i === 0 ? 'dark' : 'light', valueSize: 40 }));
  H.card(s, { x: CX, y: 3.95, w: CW / 2 - 0.15, h: 2.8, title: 'Al terminar sabrás…', icon: 'FaGraduationCap', tone: 'tint', bullets: ['Explicar cómo ejecuta el motor una consulta', 'Crear objetos y un modelo de permisos seguro', 'Leer un plan de ejecución y diagnosticar con DMVs'] });
  H.card(s, { x: CX + CW / 2 + 0.15, y: 3.95, w: CW / 2 - 0.15, h: 2.8, title: '…y serás capaz de operar', icon: 'FaTools', tone: 'tint', bullets: ['Diseñar backups según RPO/RTO y restaurar a un punto exacto', 'Automatizar mantenimiento y resolver incidencias comunes', 'Elegir la solución de HA/DR adecuada'] });

  // 3 ─ Dinámica del curso
  s = H.slide(pres, {
    mod: 0, badge: 'Bienvenida', title: 'Cómo trabajaremos',
    notes: {
      obj: 'Acordar la dinámica: teoría breve, laboratorio inmediato y participación constante; fijar reglas de seguridad del entorno de práctica.',
      guion: [
        'Formato: bloques de teoría de 20-30 minutos, siempre seguidos de una demostración o ejercicio. Un curso de administración se aprende con las manos en el teclado.',
        'Los laboratorios se hacen sobre un contenedor Docker o una instancia local propia: cada alumno puede romper su servidor sin afectar a nadie. Romper cosas a propósito (llenar el log, corromper una página) es parte del plan.',
        'Regla de oro: nunca ejecutar los scripts del curso contra un servidor de producción. Se pide confirmar el nombre del servidor (SELECT @@SERVERNAME) antes de cualquier script destructivo; es un hábito profesional.',
        'Material: diapositivas, scripts T-SQL del curso y la Guía del Docente en Markdown con todo el guion. Cada diapositiva de laboratorio incluye una guía de resolución en las notas.',
        'Evaluación: participación, entrega del Laboratorio 4 y resolución del caso práctico integrador final (con criterios explícitos que se verán al comienzo del caso).',
        'Se anima a interrumpir con preguntas: es más barato resolver una duda ahora que durante un incidente real.',
      ],
      preguntas: [
        '¿Qué entorno tiene cada uno disponible: Windows con SSMS, macOS/Linux con Docker, ambos?',
        '¿Qué os frena más al aprender administración: no tener un servidor donde practicar o miedo a romperlo?',
      ],
    },
  });
  H.cardsRow(s, [
    { icon: 'FaChalkboardTeacher', title: 'Teoría breve', body: 'Bloques de 20-30 min con esquemas, demostraciones en vivo y fragmentos T-SQL reales.' },
    { icon: 'FaFlask', title: 'Laboratorios guiados', body: 'Cuatro laboratorios y un caso integrador. Cada alumno trabaja en su propia instancia.' },
    { icon: 'FaComments', title: 'Participación', body: 'Preguntas y debates en cada tema. Los errores son material de aprendizaje.' },
  ], { y: CY, h: 2.9 });
  H.callout(s, { x: CX, y: 5.0, w: CW, h: 1.0, kind: 'warn', lead: 'Regla de seguridad:', text: 'los scripts del curso son destructivos a propósito. Comprueba siempre SELECT @@SERVERNAME antes de ejecutarlos y nunca los lances contra producción.' });
  H.callout(s, { x: CX, y: 5.7, w: CW, h: 1.0, kind: 'tip', lead: 'Material:', text: 'diapositivas con guion completo en las notas, scripts T-SQL del curso y la Guía del Docente en Markdown.' });

  // 4 ─ Entorno de trabajo
  s = H.slide(pres, {
    mod: 0, badge: 'Entorno', title: 'Entorno de trabajo del curso',
    notes: {
      obj: 'Dejar el entorno preparado: instancia SQL Server accesible y herramienta cliente conectada antes de empezar el Módulo 1.',
      guion: [
        'Tres piezas: una instancia SQL Server (Docker o local), una herramienta cliente (SSMS en Windows; extensión MSSQL de VS Code en macOS/Linux) y un editor de scripts.',
        'Azure Data Studio ha llegado al final de su soporte (28 de febrero de 2026): Microsoft recomienda la extensión MSSQL de Visual Studio Code. Si algún alumno lo tiene instalado, funciona pero ya no recibe actualizaciones.',
        'Docker: la imagen oficial mcr.microsoft.com/mssql/server:2022-latest es multiplataforma. En Mac con Apple Silicon hay que ejecutar Docker Desktop con emulación x86_64 (--platform linux/amd64) y activar Rosetta en los ajustes; el arranque es más lento pero funciona.',
        'Variables imprescindibles: ACCEPT_EULA=Y y MSSQL_SA_PASSWORD con una contraseña que cumpla la política de complejidad (8+ caracteres, tres de cuatro categorías); si no, el contenedor arranca y se detiene sin avisar: se diagnostica con docker logs sql2022.',
        'El volumen -v sqldata:/var/opt/mssql persiste los ficheros .mdf/.ldf si se elimina el contenedor. Se usará en el laboratorio de restauración del Módulo 4.',
        'Opción local (Windows): SQL Server 2022 Developer Edition (gratuita, con todas las funciones de Enterprise y sólo para desarrollo y pruebas) + SSMS 20/21.',
      ],
      preguntas: [
        '¿Qué diferencia hay entre conectarse con la cuenta sa y con autenticación de Windows? (Anticipa el Módulo 2.)',
        '¿Por qué crees que el contenedor se detiene si la contraseña de sa no cumple la política?',
      ],
      lab: [
        'Arrancar el contenedor con el comando de la diapositiva y comprobar con docker ps que el estado es Up.',
        'Conectar desde SSMS o VS Code: servidor localhost,1433, usuario sa, marcar "Trust server certificate".',
        'Ejecutar SELECT @@VERSION, @@SERVERNAME; y guardar el resultado como evidencia.',
        'Trampas: puerto 1433 ocupado por otra instancia local (usar -p 14333:1433 y conectar a localhost,14333); contraseña con caracteres especiales mal escapados en el shell (usar comillas simples en zsh/bash).',
      ],
    },
  });
  const ex = CX, exw = 5.9;
  const ch3 = (CH - 2 * 0.25) / 3;
  [['FaDesktop', 'SSMS (Windows)', 'Cliente completo: objetos, planes de ejecución, Agent, Profiler.'],
   ['FaCode', 'VS Code + extensión MSSQL', 'Multiplataforma; sustituye a Azure Data Studio (fin de soporte 28/02/2026).'],
   ['FaDocker', 'Docker o instalación local', 'Imagen oficial 2022-latest, o Developer Edition en Windows.']].forEach(([ic, t, b], i) =>
    H.card(s, { x: ex, y: CY + i * (ch3 + 0.25), w: exw, h: ch3, icon: ic, title: t, body: b, size: 14, tone: 'light', side: true }));
  H.code(s, { x: 6.9, y: CY, w: 5.83, h: 3.4, label: 'BASH · DOCKER', size: 12, code: 'docker run -d --name sql2022 \\\n  -e "ACCEPT_EULA=Y" \\\n  -e "MSSQL_SA_PASSWORD=Curso#SQL2022!" \\\n  -p 1433:1433 \\\n  -v sqldata:/var/opt/mssql \\\n  mcr.microsoft.com/mssql/server:2022-latest\n\ndocker ps\ndocker logs sql2022 | tail -n 5' });
  H.callout(s, { x: 6.9, y: 5.45, w: 5.83, h: 1.3, kind: 'warn', lead: 'Si el contenedor se para:', text: 'revisa docker logs. Casi siempre es una contraseña de sa que no cumple la política de complejidad.' });

  // ════════════════════════ MÓDULO 1 — Fundamentos y arquitectura (5–20) ════════════════════════

  // 5 ─ Separador
  H.divider(pres, {
    mod: 1, title: 'Fundamentos y arquitectura', subtitle: 'Incluye licenciamiento: cómo es SQL Server por dentro y qué edición y licencia necesitas', hours: '≈ 5,5 H',
    topics: [
      { icon: 'FaHistory', text: 'Historia y versiones' },
      { icon: 'FaProjectDiagram', text: 'Arquitectura del motor' },
      { icon: 'FaHdd', text: 'Páginas, extensiones y ficheros' },
      { icon: 'FaDatabase', text: 'Instancias y bases del sistema' },
      { icon: 'FaTag', text: 'Ediciones y licenciamiento' },
      { icon: 'FaFlask', text: 'Laboratorio 1' },
    ],
    notes: {
      obj: 'Introducir el Módulo 1 y justificar por qué empezamos por la arquitectura interna antes que por la sintaxis.',
      guion: [
        'Idea fuerza: casi todos los problemas que veremos más adelante (bloqueos, rendimiento, log lleno, restauraciones) se explican con cuatro conceptos: Buffer Pool, páginas, Transaction Log y tempdb. Este módulo los instala en la cabeza del alumno.',
        'Recorrido: historia y versiones → arquitectura → estructura física (páginas, extensiones, MDF/NDF/LDF, WAL y VLFs) → instancias y bases del sistema → ediciones y licenciamiento → herramientas → Laboratorio 1.',
        'Duración estimada 5,5 horas: ~3,5 de teoría con demostraciones y ~2 de laboratorio.',
      ],
      preguntas: ['¿Qué creéis que ocurre exactamente entre que escribís un INSERT y que el dato está "guardado"? Anotad las respuestas, las revisaremos al explicar el WAL.'],
    },
  });

  // 6 ─ Historia y versiones
  s = H.slide(pres, {
    mod: 1, badge: 'Historia', title: 'Versiones de SQL Server',
    notes: {
      obj: 'Situar las versiones actuales, sus hitos y su ciclo de vida para decidir cuál instalar o a cuál migrar.',
      guion: [
        'SQL Server nace en 1989 (Sybase/Microsoft/Ashton-Tate). Los hitos modernos empiezan con 2005 (DMVs, TRY/CATCH, CLR), 2008 (compresión, Policy-Based Management) y 2012 (Always On AG y columnstore).',
        '2014: In-Memory OLTP (Hekaton) y Buffer Pool Extension. 2016: Query Store, Always Encrypted, Row-Level Security, temporal tables. 2017: primera versión en Linux y Docker; adaptive query processing.',
        '2019: Intelligent Query Processing (memory grant feedback, batch mode en rowstore), Accelerated Database Recovery (ADR) y UTF-8. 2022: Ledger, Parameter Sensitive Plan optimization, Contained Availability Groups y copia a S3.',
        '2025: incorpora el tipo vector y funciones de IA, el tipo json nativo y expresiones regulares en T-SQL. Conviene verificar en la página de ciclo de vida de Microsoft las fechas de soporte vigentes.',
        'Ciclo de vida: 5 años de soporte principal + 5 de soporte extendido (parches de seguridad). SQL Server 2016 terminó su soporte extendido en julio de 2026; 2017 termina en octubre de 2027, 2019 en enero de 2030 y 2022 en enero de 2033.',
        'Nivel de compatibilidad (COMPATIBILITY_LEVEL): 130=2016, 140=2017, 150=2019, 160=2022. Una BD restaurada en una versión nueva mantiene su nivel de compatibilidad hasta que se cambie; es clave en migraciones.',
      ],
      preguntas: [
        '¿Qué versión tenéis en producción y en qué fecha termina su soporte extendido?',
        '¿Qué riesgo tiene subir el nivel de compatibilidad de una base de datos sin probarla? (Cambios en el optimizador/CE, regresiones de planes.)',
      ],
    },
  });
  const vers = [
    ['2012', ['Always On AG', 'Columnstore', 'Secuencias']],
    ['2014', ['In-Memory OLTP', 'Buffer Pool Ext.', 'Backup cifrado']],
    ['2016', ['Query Store', 'Always Encrypted', 'Temporal tables']],
    ['2017', ['Linux y Docker', 'Adaptive QP', 'Python']],
    ['2019', ['Intelligent QP', 'ADR', 'UTF-8']],
    ['2022', ['Ledger', 'PSP optimization', 'Contained AG']],
    ['2025', ['Tipo vector (IA)', 'Tipo json', 'Regex en T-SQL']],
  ];
  const vw = (CW - 6 * 0.15) / 7;
  vers.forEach(([y, f], i) => {
    const x = CX + i * (vw + 0.15);
    H.rect(s, { x, y: CY, w: vw, h: 3.4, fill: i === 5 ? COL.NAVY : COL.WHITE, radius: 0.12, shadowOn: true, line: COL.LINE });
    s.addText(y, { x, y: CY + 0.2, w: vw, h: 0.6, fontFace: H.FONT.head, fontSize: 28, bold: true, color: i === 5 ? COL.WHITE : COL.CORAL, align: 'center', margin: 0 });
    H.bullets(s, f, { x: x + 0.15, y: CY + 1.0, w: vw - 0.25, h: 2.3, size: 13, color: i === 5 ? COL.WHITE : COL.TEXT, leadColor: COL.NAVY, after: 8 });
  });
  H.callout(s, { x: CX, y: 5.5, w: CW, h: 1.2, kind: 'warn', lead: 'Ciclo de vida:', text: '5 años de soporte principal + 5 de soporte extendido. SQL Server 2016 ya no recibe parches de seguridad (jul-2026); 2022 es la referencia del curso.' });

  // 7 ─ Arquitectura del motor
  s = H.slide(pres, {
    mod: 1, badge: 'Arquitectura', title: 'Arquitectura interna del motor',
    notes: {
      obj: 'Que el alumno identifique las capas del motor (SNI, Relational Engine, Storage Engine, SQLOS) y sepa qué responsabilidad tiene cada una.',
      guion: [
        'Seguir el recorrido de arriba abajo con el puntero. El cliente se comunica mediante el protocolo TDS (Tabular Data Stream) sobre un protocolo de red: Shared Memory (local), TCP/IP (el habitual, puerto 1433 por defecto) o Named Pipes. La capa SNI (SQL Network Interface) los abstrae.',
        'Relational Engine (query processor): el Parser comprueba la sintaxis; el Algebrizer resuelve nombres de objetos/tipos y produce un árbol de consulta; el Optimizer, basado en costes, elige un plan a partir de estadísticas; el Query Executor lo ejecuta operador a operador.',
        'Storage Engine: Access Methods (cómo leer/escribir filas, índices, heaps), Buffer Manager (gestiona el Buffer Pool: caché de páginas de datos en memoria) y Transaction Manager (log, bloqueos, aislamiento: ACID).',
        'SQLOS es una capa propia de SQL Server (no es el sistema operativo): planificación cooperativa con schedulers (uno por CPU lógica), gestión de memoria, I/O, sincronización y bloqueos. Explica los wait types (PAGEIOLATCH, CXPACKET, LCK_M_*).',
        'A la derecha, el disco: ficheros de datos (.mdf/.ndf) y de log (.ldf). El motor nunca escribe directamente en el disco de datos al hacer COMMIT: primero escribe en el log (WAL). Lo veremos en la diapositiva del Transaction Log.',
        'Punto de vista del DBA: cada capa suele ser origen de un tipo de problema: red (latencias, fallos de conexión), optimizador (planes malos), almacenamiento (E/S lenta, log), SQLOS (esperas de CPU/memoria).',
      ],
      preguntas: [
        '¿En qué capa se decide si una consulta usa un Index Seek o un Index Scan? ¿Y quién lo ejecuta?',
        'Si el servidor sufre esperas PAGEIOLATCH_SH, ¿qué capas están implicadas?',
      ],
    },
  });
  D.engineArchitecture(s, { x: CX, y: CY, w: 7.7, h: 5.0 });
  H.card(s, { x: 8.7, y: CY, w: 4.03, h: 2.4, icon: 'FaBrain', title: 'Relational Engine', bullets: ['Decide el cómo (plan)', 'Parser → Algebrizer → Optimizer', 'Cost-based con estadísticas'], size: 14 });
  H.card(s, { x: 8.7, y: CY + 2.6, w: 4.03, h: 2.4, icon: 'FaServer', title: 'Storage Engine', bullets: ['Ejecuta el acceso a los datos', 'Buffer Pool y Access Methods', 'Log, bloqueos y transacciones'], size: 14 });

  // 8 ─ Ciclo de vida de una consulta
  s = H.slide(pres, {
    mod: 1, badge: 'Arquitectura', title: 'Ciclo de vida de una consulta',
    notes: {
      obj: 'Comprender el recorrido completo de una sentencia, qué se cachea (plan cache) y por qué la segunda ejecución es más barata.',
      guion: [
        'Paso 1 – Parse: validación sintáctica; si hay error aquí nunca llega al optimizador. Paso 2 – Bind/Algebrize: resuelve tablas, columnas y tipos; comprueba permisos sobre los objetos.',
        'Paso 3 – Optimize: antes de optimizar, el motor busca en el plan cache un plan reutilizable con hash de la consulta. Si no existe, el optimizador explora alternativas (join order, tipos de join, acceso por índice) y elige el de menor coste estimado; no busca el óptimo absoluto, sino uno "suficientemente bueno" en tiempo limitado (Good Enough Plan Found).',
        'Paso 4 – Execute: el Query Executor es un modelo de iteradores (cada operador pide filas al siguiente). Pide a Access Methods las filas y estos al Buffer Manager las páginas.',
        'Paso 5 – Lectura de páginas: si la página está en el Buffer Pool es una lectura lógica; si no, se lee del disco (lectura física) y se sube al Buffer Pool. SET STATISTICS IO muestra ambas.',
        'Resultado: se envían filas al cliente por TDS en paquetes (4096 bytes por defecto). Un cliente lento consumiendo resultados provoca la espera ASYNC_NETWORK_IO, que no es un problema del servidor.',
        'El plan cache se vacía al reiniciar, con DBCC FREEPROCCACHE o por presión de memoria. Consultas ad hoc con literales distintos generan un plan por cada variante (plan cache bloat); la parametrización lo evita.',
      ],
      preguntas: [
        '¿Por qué la primera ejecución de una consulta suele ser más lenta que las siguientes? (Compilación + lecturas físicas.)',
        '¿Qué ventaja tiene que el plan quede cacheado y qué riesgo introduce? (Parameter sniffing, se verá en el Módulo 2.)',
      ],
    },
  });
  H.steps(s, [
    { title: 'Parse + Algebrize', body: 'Sintaxis, resolución de objetos y permisos.' },
    { title: 'Plan cache', body: '¿Existe un plan reutilizable? Si sí, se salta la optimización.' },
    { title: 'Optimize', body: 'Elige el plan de menor coste estimado con estadísticas.' },
    { title: 'Execute', body: 'Operadores en iteradores piden filas y páginas.' },
    { title: 'Buffer Pool + TDS', body: 'Lectura lógica o física; resultado al cliente.' },
  ], { y: CY, h: 3.4, gap: 0.35, size: 14 });
  H.callout(s, { x: CX, y: 5.5, w: CW, h: 1.2, kind: 'tip', lead: 'Pruébalo:', text: 'SET STATISTICS IO, TIME ON; muestra lecturas lógicas, físicas y tiempo de compilación frente a ejecución.' });

  // 9 ─ Buffer Pool y memoria
  s = H.slide(pres, {
    mod: 1, badge: 'Arquitectura', title: 'Buffer Pool y gestión de memoria',
    notes: {
      obj: 'Entender que SQL Server usa casi toda la memoria disponible por diseño, qué se guarda en ella y cómo limitarla correctamente.',
      guion: [
        'El Buffer Pool es la mayor parte de la memoria de la instancia: caché de páginas de datos (8 KB). Leer de memoria cuesta microsegundos, de disco milisegundos. Por eso SQL Server "se come" la RAM: es su comportamiento normal, no una fuga.',
        'El Plan Cache guarda planes compilados. Otras cachés: Memory Grants (workspace para sorts y hashes), caché de metadatos y de bloqueos.',
        'Página sucia (dirty page): modificada en memoria y aún no escrita en el .mdf. Dos procesos las escriben: Checkpoint (periódico, controla el tiempo de recuperación; objetivo por defecto 60 s en BD nuevas) y Lazy Writer (libera páginas cuando hay presión de memoria).',
        'max server memory: por defecto 2.147.483.647 MB (sin límite). En producción hay que fijarlo dejando memoria al SO y otros procesos (regla de partida: 10-20% o al menos 4 GB, más si hay otras instancias o servicios). Sin límite, el SO puede paginar y el rendimiento se degrada.',
        'Indicadores: Page Life Expectancy (PLE) y Buffer Cache Hit Ratio; el segundo es engañoso. Lo más fiable: esperas PAGEIOLATCH y tasa de lecturas físicas.',
        'En virtualización, recomendar reservar la memoria (memory reservation) para evitar ballooning, que quita memoria al Buffer Pool sin que SQL Server lo sepa.',
      ],
      preguntas: [
        'El administrador del sistema dice "SQL Server usa el 95% de la RAM, hay una fuga". ¿Qué respondéis?',
        '¿Qué diferencia hay entre Checkpoint y Lazy Writer?',
      ],
      lab: ['Opcional (demo): consultar sys.dm_os_sys_memory y sys.dm_os_process_memory; cambiar max server memory y observar cómo cambia el valor de Target Server Memory en sys.dm_os_performance_counters.'],
    },
  });
  H.cardsRow(s, [
    { icon: 'FaMemory', title: 'Buffer Pool', body: 'Caché de páginas de datos de 8 KB. Lectura lógica (memoria) frente a física (disco).' },
    { icon: 'FaLayerGroup', title: 'Plan Cache', body: 'Planes compilados reutilizables. Se pierde al reiniciar o por presión de memoria.' },
    { icon: 'FaSyncAlt', title: 'Checkpoint y Lazy Writer', body: 'Checkpoint escribe páginas sucias periódicamente; Lazy Writer libera memoria bajo presión.' },
  ], { y: CY, h: 3.0 });
  H.code(s, { x: CX, y: 5.15, w: 7.3, h: 1.6, size: 12, label: 'T-SQL · LIMITAR LA MEMORIA', code: "EXEC sp_configure 'show advanced options', 1; RECONFIGURE;\nEXEC sp_configure 'max server memory (MB)', 12288; RECONFIGURE;" });
  H.callout(s, { x: 8.2, y: 5.15, w: 4.53, h: 1.6, kind: 'warn', lead: 'Siempre limita', text: 'max server memory en producción y deja memoria libre para el sistema operativo.' });

  // 10 ─ Estructura física
  s = H.slide(pres, {
    mod: 1, badge: 'Almacenamiento', title: 'Estructura física: páginas y extensiones',
    notes: {
      obj: 'Conocer la unidad básica de almacenamiento (página de 8 KB) y su agrupación en extensiones, y relacionarlas con ficheros y log.',
      guion: [
        'Página = 8 KB (8192 bytes), unidad mínima de E/S. Estructura: cabecera de 96 bytes (tipo de página, ids, LSN, contadores), área de filas, y un array de desplazamientos de fila al final (2 bytes por fila) que crece hacia arriba.',
        'Máximo 8060 bytes de datos de fila en página (no LOB). Si las columnas variables exceden, se mueven a páginas ROW_OVERFLOW; los LOB (varchar(max), xml, etc.) van a páginas LOB_DATA.',
        'Extensión = 8 páginas contiguas = 64 KB, unidad de asignación. Mixtas (comparten objetos distintos; las primeras 8 páginas de un objeto en versiones antiguas) y uniformes (un solo objeto). Desde SQL Server 2016, la opción por defecto en BD de usuario es asignar extensiones uniformes (MIXED_PAGE_ALLOCATION OFF).',
        'Tipos de página de asignación: PFS (espacio libre), GAM/SGAM (qué extensiones están libres/mixtas), IAM (qué extensiones pertenecen a un objeto). Importante en tempdb: contención en PFS/GAM/SGAM.',
        'Demostración: DBCC IND / sys.dm_db_database_page_allocations y DBCC PAGE (con TRACE FLAG 3604) para ver una página real; muy ilustrativo en el laboratorio avanzado.',
        'Consecuencia práctica: leer una fila implica leer una página entera. Filas anchas = menos filas por página = más E/S. El diseño de tablas importa.',
      ],
      preguntas: [
        '¿Cuántas filas de 200 bytes caben aproximadamente en una página? (≈ 40.)',
        '¿Por qué un SELECT de una sola fila puede acabar leyendo 8 KB o más?',
      ],
    },
  });
  D.physicalLayout(s, { x: CX, y: CY, w: CW, h: 5.0 });

  // 11 ─ Ficheros MDF, NDF, LDF
  s = H.slide(pres, {
    mod: 1, badge: 'Almacenamiento', title: 'Ficheros de datos y de log: MDF, NDF, LDF',
    notes: {
      obj: 'Distinguir los tres tipos de fichero, el concepto de filegroup y las prácticas correctas de tamaño y crecimiento.',
      guion: [
        'Toda base de datos tiene al menos un fichero de datos primario (.mdf, con el catálogo de la BD) y un fichero de log (.ldf). Los secundarios (.ndf) son opcionales y se agrupan en filegroups.',
        'Filegroup: unidad lógica de administración. PRIMARY es el predeterminado. Sirven para repartir E/S entre discos, restaurar parcialmente (piecemeal restore), colocar tablas calientes en almacenamiento rápido o particionar tablas.',
        'Los ficheros de un mismo filegroup se llenan por el algoritmo proportional fill: más espacio libre = más escrituras. Por eso conviene que tengan el mismo tamaño y el mismo crecimiento.',
        'Autogrowth: configúralo siempre en MB fijos (p. ej. 256-512 MB para datos grandes) y no en porcentaje, porque crecer un 10% de un fichero de 500 GB son 50 GB bloqueando operaciones. El tamaño inicial debe estimarse para evitar crecimientos frecuentes.',
        'Instant File Initialization (IFI): el privilegio "Perform volume maintenance tasks" evita poner a cero los ficheros de datos al crecer o restaurar (el log siempre se pone a cero, salvo mejoras recientes de 2022 para crecimientos pequeños). Reduce drásticamente el tiempo de restauración.',
        'Un solo fichero de log por BD es suficiente: se escribe de forma secuencial; añadir más ficheros no mejora el rendimiento, sólo complica la gestión.',
      ],
      preguntas: [
        '¿Por qué un autogrowth del 10% es una mala práctica en un fichero grande?',
        '¿Qué ventaja tiene separar tablas en distintos filegroups si todos los discos son el mismo array?',
      ],
    },
  });
  H.cardsRow(s, [
    { icon: 'FaDatabase', title: 'Primario · .mdf', body: 'Uno por BD. Contiene el catálogo y, si no hay más, los datos. Filegroup PRIMARY.' },
    { icon: 'FaCopy', title: 'Secundarios · .ndf', body: 'Opcionales. Reparten datos en varios discos y permiten restaurar por filegroup.' },
    { icon: 'FaStream', title: 'Log · .ldf', body: 'Registro secuencial de cambios (WAL). Con uno es suficiente y no pertenece a ningún filegroup.' },
  ], { y: CY, h: 2.8 });
  H.callout(s, { x: CX, y: 4.95, w: CW / 2 - 0.15, h: 1.8, kind: 'warn', lead: 'Autogrowth en MB, no en %:', text: 'un 10% de 500 GB son 50 GB de golpe. Dimensiona el tamaño inicial para evitar crecer.' });
  H.callout(s, { x: CX + CW / 2 + 0.15, y: 4.95, w: CW / 2 - 0.15, h: 1.8, kind: 'tip', lead: 'IFI (Instant File Initialization):', text: 'concede "Perform volume maintenance tasks" a la cuenta del servicio para crear y restaurar ficheros de datos mucho más rápido.' });

  // 12 ─ Transaction Log, WAL y VLF
  s = H.slide(pres, {
    mod: 1, badge: 'Almacenamiento', title: 'Transaction Log: WAL y VLFs',
    notes: {
      obj: 'Entender el protocolo Write-Ahead Logging, por qué COMMIT sólo espera al log, y cómo el log se divide en VLFs que se reutilizan.',
      guion: [
        'WAL (Write-Ahead Logging): antes de modificar una página de datos en disco, el registro de log que describe el cambio debe estar en disco. Al hacer COMMIT, SQL Server sólo espera a que el log esté persistido (flush); las páginas de datos modificadas se escriben después por Checkpoint/Lazy Writer.',
        'Por eso, ante un fallo, la recuperación (crash recovery) rehace (REDO) transacciones confirmadas cuyas páginas no llegaron al disco y deshace (UNDO) las no confirmadas. Es la base de la durabilidad (D de ACID).',
        'El log es una secuencia lógica de registros identificados por un LSN. Internamente se divide en Virtual Log Files (VLFs). El motor reutiliza los VLFs ya no necesarios; un VLF no se puede reutilizar mientras contenga log activo (transacciones abiertas, replicación pendiente, backup de log pendiente, AG…).',
        'Qué libera log: en modelo SIMPLE, un checkpoint; en FULL/BULK_LOGGED, un backup de log. Si el log crece sin parar en FULL y no hay backups de log, la causa es esa (se verá con log_reuse_wait_desc en Módulo 4).',
        'Demasiados VLFs (miles) por autogrowths pequeños ralentizan el arranque, la recuperación y los backups de log. Se mide con sys.dm_db_log_info (SQL Server 2016 SP2 en adelante).',
        'ADR (Accelerated Database Recovery, 2019): mantiene un version store persistente para que la recuperación y el rollback sean casi instantáneos, independientemente del tamaño de la transacción.',
      ],
      preguntas: [
        'Si el servidor se apaga justo después de un COMMIT, ¿cómo es posible que el dato no se pierda aunque la página de datos no se haya escrito?',
        '¿Por qué un SELECT grande no genera log pero un UPDATE grande sí?',
      ],
    },
  });
  H.steps(s, [
    { title: 'Se modifica la página', body: 'Cambio en el Buffer Pool; la página queda sucia.' },
    { title: 'Se escribe el log', body: 'Registro con LSN en el log buffer.' },
    { title: 'COMMIT', body: 'Flush del log a disco. El cliente recibe OK.' },
    { title: 'Checkpoint', body: 'Más tarde, las páginas sucias se escriben al .mdf.' },
  ], { y: CY, h: 2.9, gap: 0.35, size: 14 });
  H.code(s, { x: CX, y: 4.95, w: 7.6, h: 1.8, size: 12, label: 'T-SQL · VLFS DE LA BD ACTUAL', code: 'SELECT COUNT(*) AS vlf_total,\n       SUM(CASE WHEN vlf_active = 1 THEN 1 ELSE 0 END) AS vlf_activos\nFROM sys.dm_db_log_info(DB_ID());' });
  H.callout(s, { x: 8.5, y: 4.95, w: 4.23, h: 1.8, kind: 'warn', lead: 'Miles de VLFs', text: 'por autogrowths pequeños ralentizan arranque y recuperación. Dimensiona el log de una vez.' });

  // 13 ─ Instancias
  s = H.slide(pres, {
    mod: 1, badge: 'Instancias', title: 'Instancias: predeterminada y con nombre',
    notes: {
      obj: 'Entender qué es una instancia, cómo se identifican y conectan, y por qué se usan varias en un mismo servidor.',
      guion: [
        'Una instancia es una copia independiente del motor (procesos, memoria, bases del sistema, cuentas, configuración). Un servidor puede alojar una instancia predeterminada (MSSQLSERVER) y hasta 50 con nombre.',
        'Conexión: la predeterminada se accede por nombre de servidor (puerto TCP 1433 por defecto); las nombradas como SERVIDOR\\INSTANCIA, normalmente con puerto dinámico que resuelve el servicio SQL Server Browser (UDP 1434). En entornos con cortafuegos se recomienda fijar puerto estático.',
        'Casos de uso: aislar versiones o parches, separar entornos (desarrollo/preproducción), aislar cargas, separar administración y seguridad. Contrapartida: más memoria y CPU repartidas manualmente; hay que fijar max server memory por instancia.',
        'SERVERPROPERTY devuelve metadatos: InstanceName, Edition, ProductVersion, ProductLevel, IsClustered, etc. Es la forma estándar de inventariar instancias con T-SQL.',
        'Cada instancia tiene su cuenta de servicio. Recomendación: cuentas de dominio dedicadas o gMSA (Group Managed Service Accounts), nunca LocalSystem.',
        'En contenedores Docker, cada contenedor es de hecho una instancia aislada: es la forma más cómoda de tener varias versiones para pruebas.',
      ],
      preguntas: [
        '¿En qué caso elegirías dos instancias en el mismo servidor frente a dos servidores?',
        '¿Qué ocurre si el servicio SQL Server Browser está parado y te conectas a una instancia con nombre sin indicar puerto?',
      ],
    },
  });
  H.cardsRow(s, [
    { icon: 'FaServer', title: 'Predeterminada', body: 'Nombre de servicio MSSQLSERVER. Se conecta por nombre de host, puerto TCP 1433.' },
    { icon: 'FaNetworkWired', title: 'Con nombre', body: 'SERVIDOR\\INSTANCIA. Puerto dinámico resuelto por SQL Server Browser (UDP 1434).' },
  ], { y: CY, h: 2.4 });
  H.code(s, { x: CX, y: 4.45, w: 7.2, h: 2.3, size: 12, label: 'T-SQL · IDENTIFICAR LA INSTANCIA', code: "SELECT @@SERVERNAME                    AS servidor,\n       SERVERPROPERTY('InstanceName')   AS instancia,\n       SERVERPROPERTY('Edition')        AS edicion,\n       SERVERPROPERTY('ProductVersion') AS version;" });
  H.callout(s, { x: 8.1, y: 4.45, w: 4.63, h: 2.3, kind: 'tip', lead: 'En producción:', text: 'fija puertos estáticos, usa cuentas de servicio dedicadas (gMSA) y configura max server memory en cada instancia.' });

  // 14 ─ Bases de datos del sistema
  s = H.slide(pres, {
    mod: 1, badge: 'Instancias', title: 'Bases de datos del sistema',
    notes: {
      obj: 'Conocer la función de cada base de datos del sistema, su criticidad y qué incluir en la política de backups.',
      guion: [
        'master: catálogo de la instancia (logins, configuración, endpoints, ubicación de ficheros de todas las BD). Si se pierde, la instancia no arranca. Backup obligatorio tras cualquier cambio de logins o configuración.',
        'model: plantilla para CREATE DATABASE; sus propiedades (modelo de recuperación, tamaño, autogrowth) se heredan. También lo es para tempdb en cada reinicio.',
        'msdb: SQL Server Agent (jobs, alertas, operadores), historial de backups y restauraciones, Database Mail, planes de mantenimiento. Backup obligatorio.',
        'tempdb: espacio de trabajo temporal (tablas #temp, variables de tabla, spills de sort/hash, version store, cursores). Se recrea en cada arranque, no se hace backup, y es compartida por toda la instancia: un consumidor puede afectar a todos. Buenas prácticas: varios ficheros de datos iguales (hasta 8 inicialmente), en almacenamiento rápido.',
        'mssqlsystemresource (Resource database): sólo lectura, oculta, contiene los objetos del sistema (sys.*). Se actualiza al parchear. No se ve en SSMS, pero existe en el disco.',
        'Otras BD del sistema según configuración: distribution (replicación), BD de SSISDB, etc. Importante no confundir "BD del sistema" con "objetos del sistema": no se crean tablas de usuario en master.',
      ],
      preguntas: [
        '¿Qué ocurre con los jobs de mantenimiento si se pierde msdb y no hay backup?',
        '¿Por qué tempdb no necesita backup, pero sí necesita planificación de capacidad?',
      ],
    },
  });
  H.cardsGrid(s, [
    { icon: 'FaKey', title: 'master', body: 'Catálogo de la instancia: logins, configuración, ubicación de las BD. Sin ella no arranca.' },
    { icon: 'FaCopy', title: 'model', body: 'Plantilla de las nuevas BD y de tempdb en cada arranque.' },
    { icon: 'FaCalendarAlt', title: 'msdb', body: 'Agent: jobs y alertas; historial de backups; Database Mail.' },
    { icon: 'FaBolt', title: 'tempdb', body: 'Objetos temporales, spills y version store. Se recrea al arrancar. Sin backup.' },
    { icon: 'FaLock', title: 'mssqlsystemresource', body: 'Sólo lectura y oculta. Contiene los objetos del sistema (sys.*).' },
    { icon: 'FaSave', title: 'Backup obligatorio', body: 'master, model y msdb. tempdb y Resource no se respaldan.', tone: 'dark' },
  ], { cols: 3, size: 14, titleSize: 17 });

  // 15 ─ Ediciones
  s = H.slide(pres, {
    mod: 1, badge: 'Licenciamiento', title: 'Ediciones de SQL Server 2022',
    notes: {
      obj: 'Elegir la edición adecuada según límites de cómputo, memoria y funcionalidades, y entender las restricciones de cada una.',
      guion: [
        'Express: gratuita, para aplicaciones pequeñas y aprendizaje. Límites: 1 socket o 4 cores (el menor), 1.410 MB para el Buffer Pool, 10 GB por base de datos; sin SQL Server Agent.',
        'Standard: para cargas departamentales. Hasta 4 sockets o 24 cores, 128 GB de Buffer Pool. Incluye Basic Availability Groups (una BD por AG, una réplica secundaria), compresión de backup, TDE (desde 2019) y cifrado.',
        'Enterprise: sin límites de cómputo (el máximo que permita el SO) y todas las funciones: particionado online, compresión de datos, Always On AG avanzados, rebuild online de índices, in-memory ampliado, Resource Governor, etc.',
        'Developer: mismas funciones que Enterprise, gratis pero sin derecho a producción. Es la edición ideal para el laboratorio y desarrollo. La edición Evaluation dura 180 días.',
        'Web existe sólo para proveedores de hosting. Las cifras de límites pueden variar entre versiones: validar siempre con la documentación oficial "Editions and supported features of SQL Server 2022".',
        'Criterios de elección: necesidad de HA avanzada, volumen de memoria/CPU, funciones de seguridad y cumplimiento, y coste. Standard cubre mucho más de lo que se cree; Enterprise se justifica por funciones concretas, no por prestigio.',
      ],
      preguntas: [
        '¿Qué funcionalidad concreta justificaría pagar Enterprise en vuestra organización?',
        '¿Por qué una base de datos de 40 GB no puede alojarse en Express aunque la aplicación sea pequeña?',
      ],
    },
  });
  H.table(s, [
    ['Edición', 'Uso típico', 'Cómputo', 'Memoria (Buffer Pool)', 'Claves'],
    ['Express', 'Apps pequeñas, aprendizaje', '1 socket o 4 cores', '1,4 GB', 'Gratuita · 10 GB/BD · sin Agent'],
    ['Standard', 'Cargas departamentales', '4 sockets o 24 cores', '128 GB', 'Basic AG · backup comprimido'],
    ['Enterprise', 'Misión crítica y alta carga', 'Máximo del SO', 'Máximo del SO', 'AG completos · online · particionado'],
    ['Developer', 'Desarrollo y laboratorio', 'Como Enterprise', 'Como Enterprise', 'Gratis · prohibido en producción'],
  ], { x: CX, y: CY, w: CW, colW: [1.5, 2.8, 2.2, 2.2, 3.4], size: 14, maxH: 3.6 });
  H.callout(s, { x: CX, y: 5.5, w: CW, h: 1.2, kind: 'info', lead: 'Regla práctica:', text: 'empieza por Standard y justifica Enterprise con una función concreta. Developer para pruebas, nunca para producción.' });

  // 16 ─ Licenciamiento
  s = H.slide(pres, {
    mod: 1, badge: 'Licenciamiento', title: 'Modelos de licencia: Core vs Server + CAL',
    notes: {
      obj: 'Comprender los dos modelos de licenciamiento, sus reglas mínimas y cuándo conviene cada uno.',
      guion: [
        'Licenciamiento por núcleo (Per Core): se licencian todos los núcleos físicos de cada procesador del servidor, con un mínimo de 4 licencias de núcleo por procesador; se venden en paquetes de 2 núcleos. No requiere CAL: usuarios y dispositivos ilimitados. Es el único modelo para Enterprise.',
        'Servidor + CAL (Server + Client Access License): sólo para Standard. Una licencia de servidor por instancia/servidor más una CAL por usuario o por dispositivo que accede. Conviene con pocos usuarios identificables y estables; con acceso por web/internet o muchos usuarios, suele salir peor.',
        'En máquinas virtuales se licencian los núcleos virtuales asignados (mínimo 4 por VM); con Enterprise y Software Assurance se puede licenciar todo el host y ejecutar un número ilimitado de VMs.',
        'Software Assurance (SA): da derecho a nuevas versiones, y para HA, el derecho a tener una réplica secundaria pasiva de failover sin licencia adicional (con ciertas condiciones: no atender consultas ni backups).',
        'Los precios y condiciones cambian: no se citan cifras en el curso; recomendar validar con un partner de licenciamiento (LAR) antes de comprar y documentar el inventario de licencias.',
        'Error típico de auditoría: instancias de Developer usadas en producción, o más núcleos licenciados de los que realmente corresponden. Un DBA debe poder demostrar el inventario.',
      ],
      preguntas: [
        'Un servidor con 1 procesador de 2 núcleos físicos, ¿cuántas licencias de núcleo hay que comprar con Per Core? (4, por el mínimo.)',
        '¿Qué modelo elegirías para una aplicación pública accesible por Internet? ¿Por qué?',
      ],
    },
  });
  H.card(s, { x: CX, y: CY, w: CW / 2 - 0.15, h: 2.9, icon: 'FaMicrochip', title: 'Per Core (por núcleo)', bullets: ['Standard y Enterprise', 'Usuarios y dispositivos ilimitados', 'Mínimo 4 núcleos por procesador y VM', 'Paquetes de 2 núcleos'], size: 14 });
  H.card(s, { x: CX + CW / 2 + 0.15, y: CY, w: CW / 2 - 0.15, h: 2.9, icon: 'FaUsers', title: 'Server + CAL', bullets: ['Sólo Standard', 'Licencia de servidor + CAL por usuario o dispositivo', 'Conviene con pocos usuarios identificados', 'No válido para acceso masivo desde internet'], size: 14, tone: 'tint' });
  const lw3 = (CW - 2 * 0.3) / 3;
  [['4', 'núcleos mínimos por procesador'], ['2', 'núcleos por paquete de licencia'], ['SA', 'Software Assurance: derechos de failover']].forEach(([v, l], i) =>
    H.stat(s, { x: CX + i * (lw3 + 0.3), y: 4.95, w: lw3, h: 1.8, value: v, label: l, tone: i === 2 ? 'dark' : 'light', valueSize: 40 }));

  // 17 ─ Herramientas
  s = H.slide(pres, {
    mod: 1, badge: 'Herramientas', title: 'Herramientas de administración',
    notes: {
      obj: 'Conocer las herramientas principales de trabajo del DBA y cuándo usar cada una.',
      guion: [
        'SSMS (SQL Server Management Studio): herramienta de referencia en Windows. Explorador de objetos, editor T-SQL, planes de ejecución gráficos, Agent, Activity Monitor, asistentes de backup/restore, XEvents Profiler. Se actualiza independientemente del motor (versión 20/21); administra desde 2008 hasta 2022 y Azure SQL.',
        'Extensión MSSQL de VS Code (y Azure Data Studio, hasta su fin de soporte el 28/02/2026): multiplataforma, notebooks, extensiones, integración con Git. Menos funciones de administración que SSMS, pero suficiente para consultas y scripts.',
        'sqlcmd: utilidad de línea de comandos para ejecutar T-SQL o scripts en lotes, automatizable en shell o CI. Variante moderna go-sqlcmd (multiplataforma, instalable con winget/brew).',
        'SQL Server Profiler y Extended Events: Profiler (traza) está obsoleto para el motor y consume más recursos; Extended Events (XEvents) es su sustitución ligera. SSMS incluye XEvent Profiler y el visor de eventos en vivo.',
        'Otras: SQL Server Configuration Manager (servicios, protocolos, puertos), PowerShell con dbatools (módulo comunitario imprescindible), Database Engine Tuning Advisor, Query Store GUI y Azure Arc / portal para entornos híbridos.',
        'Buena práctica: administrar con scripts (T-SQL/PowerShell) versionados en lugar de sólo con asistentes gráficos: son repetibles, auditables y reducen errores humanos.',
      ],
      preguntas: [
        '¿Qué ventaja tiene lanzar una tarea con sqlcmd frente a hacerla con el asistente de SSMS?',
        '¿Por qué se desaconseja dejar una traza de Profiler contra un servidor en producción?',
      ],
    },
  });
  H.cardsGrid(s, [
    { icon: 'FaDesktop', title: 'SSMS', body: 'Referencia en Windows: objetos, planes gráficos, Agent, asistentes de backup/restore.' },
    { icon: 'FaCode', title: 'VS Code + extensión MSSQL', body: 'Multiplataforma, notebooks y Git. Sustituye a Azure Data Studio.' },
    { icon: 'FaTerminal', title: 'sqlcmd', body: 'Línea de comandos para scripts, CI y automatización.' },
    { icon: 'FaBolt', title: 'Extended Events', body: 'Trazas ligeras. Sustituyen a SQL Server Profiler (obsoleto).' },
  ], { cols: 2, size: 14, titleSize: 17 });

  // 18 ─ sqlcmd y XEvents
  s = H.slide(pres, {
    mod: 1, badge: 'Herramientas', title: 'sqlcmd y Extended Events básicos',
    notes: {
      obj: 'Saber lanzar consultas con sqlcmd y crear una sesión básica de Extended Events para capturar sentencias lentas.',
      guion: [
        'sqlcmd -S servidor -U usuario -P clave -Q "consulta" ejecuta una sentencia y sale. -E usa autenticación de Windows; -i ejecuta un fichero; -o redirige a salida; -b hace que falle con código de error si hay error (útil en scripts). -C confía en el certificado del servidor (necesario con ODBC 18 cuando el certificado es autofirmado).',
        'Nunca dejar contraseñas en texto claro en scripts o en el historial de shell: usar variables de entorno (SQLCMDPASSWORD) o autenticación integrada.',
        'Extended Events: arquitectura event-driven ligera. Una sesión tiene eventos (qué ocurre), acciones (datos adicionales), predicados (filtros) y targets (dónde se escribe: event_file, ring_buffer).',
        'En el ejemplo, sql_statement_completed con duration > 1.000.000 µs (1 segundo) y destino fichero .xel. Siempre filtrar con predicados para limitar sobrecarga. Se lee con sys.fn_xe_file_target_read_file o con el visor de SSMS.',
        'La sesión system_health viene activa por defecto: captura deadlocks, errores graves, esperas largas. Es el primer sitio donde mirar tras un incidente.',
        'Para eliminar: DROP EVENT SESSION [lentas] ON SERVER; Para ver las sesiones activas: sys.dm_xe_sessions.',
      ],
      preguntas: [
        '¿Qué riesgo tiene capturar todos los eventos sin predicados en un servidor muy cargado?',
        '¿Qué información útil esperaríais encontrar en system_health tras una caída de rendimiento?',
      ],
      lab: [
        'Conectar con sqlcmd al contenedor y ejecutar SELECT @@VERSION; verificar el código de salida con echo $?.',
        'Crear la sesión "lentas", ejecutar WAITFOR DELAY \'00:00:02\' desde otra conexión y abrir el visor de datos en vivo en SSMS.',
        'Trampa: el nombre del fichero .xel es relativo al directorio de log de la instancia; en Linux, ruta /var/opt/mssql/log/.',
      ],
    },
  });
  H.code(s, { x: CX, y: CY, w: 5.4, h: 2.4, size: 12, label: 'BASH · SQLCMD', code: 'sqlcmd -S localhost,1433 -U sa -C \\\n  -P "Curso#SQL2022!" \\\n  -Q "SELECT @@VERSION"\n\nsqlcmd -S .\\SQLEXPRESS -E -b \\\n  -i script.sql -o salida.txt' });
  H.code(s, { x: 6.3, y: CY, w: 6.43, h: 3.9, size: 12, label: 'T-SQL · EXTENDED EVENTS', code: "CREATE EVENT SESSION [lentas] ON SERVER\nADD EVENT sqlserver.sql_statement_completed\n  (WHERE duration > 1000000)   -- > 1 s (µs)\nADD TARGET package0.event_file\n  (SET filename = N'lentas.xel')\nWITH (STARTUP_STATE = OFF);\nGO\nALTER EVENT SESSION [lentas] ON SERVER\n  STATE = START;" });
  H.callout(s, { x: CX, y: 4.45, w: 5.4, h: 2.3, kind: 'tip', lead: 'system_health', text: 'ya está activa por defecto y recoge deadlocks y errores graves. Mírala primero tras un incidente.' });
  H.callout(s, { x: 6.3, y: 5.9, w: 6.43, h: 0.85, kind: 'warn', text: 'Filtra siempre con predicados para limitar la sobrecarga.' });

  // 19 ─ Laboratorio 1 (I)
  s = H.slide(pres, {
    mod: 1, badge: 'Base de datos', title: 'Lab 1 (I): BD con ficheros y filegroups', lab: true,
    notes: {
      obj: 'Aplicar lo aprendido: crear una base de datos con filegroup propio, varios ficheros de datos y log dimensionado, usando T-SQL.',
      guion: [
        'Resumen de lo que debe lograr el alumno: crear Ventas con filegroup PRIMARY (catálogo), filegroup FG_DATOS con dos ficheros de igual tamaño (proportional fill) y un fichero de log.',
        'Insistir en la elección de tamaños: inicial razonable y FILEGROWTH en MB. Es habitual que los alumnos pongan porcentajes o 1 MB por costumbre.',
        'Las rutas de ejemplo corresponden al contenedor Linux (/var/opt/mssql/data y /log). En Windows serían p. ej. C:\\SQLData\\.',
      ],
      preguntas: [
        '¿Qué pasaría si los dos ficheros de FG_DATOS tuvieran tamaños distintos? (Proportional fill: el más grande recibe más escrituras.)',
        '¿Por qué conviene que PRIMARY contenga sólo el catálogo y los datos del usuario vayan a otro filegroup?',
      ],
      lab: [
        'Paso 1: conectar a la instancia y comprobar SELECT @@SERVERNAME (hábito de seguridad).',
        'Paso 2: ejecutar el CREATE DATABASE Ventas de la diapositiva. Si da error de ruta, comprobar que el directorio existe y que el usuario mssql tiene permisos.',
        'Paso 3: verificar en SSMS (Propiedades de la BD → Archivos) que aparecen 4 ficheros y 2 filegroups.',
        'Trampas habituales: comillas simples tipográficas copiadas de Word; olvidar la coma entre ficheros del mismo filegroup; usar rutas de Windows en el contenedor Linux.',
        'Solución: ver el script completo de la diapositiva; si el alumno ya tiene una BD Ventas, hacer DROP DATABASE Ventas primero (con USE master).',
      ],
    },
  });
  H.code(s, { x: CX, y: CY, w: 7.6, h: 5.0, size: 12, label: 'T-SQL · LABORATORIO 1', code: "CREATE DATABASE Ventas\nON PRIMARY\n  (NAME = Ventas_sys, FILENAME = '/var/opt/mssql/data/Ventas.mdf',\n   SIZE = 64MB,  FILEGROWTH = 64MB),\nFILEGROUP FG_DATOS\n  (NAME = Ventas_d1,  FILENAME = '/var/opt/mssql/data/Ventas_d1.ndf',\n   SIZE = 256MB, FILEGROWTH = 128MB),\n  (NAME = Ventas_d2,  FILENAME = '/var/opt/mssql/data/Ventas_d2.ndf',\n   SIZE = 256MB, FILEGROWTH = 128MB)\nLOG ON\n  (NAME = Ventas_log, FILENAME = '/var/opt/mssql/log/Ventas.ldf',\n   SIZE = 128MB, FILEGROWTH = 64MB);\nGO" });
  H.card(s, { x: 8.55, y: CY, w: 4.18, h: 5.0, icon: 'FaFlask', title: 'Enunciado', size: 14, bullets: ['Crea la BD Ventas con los ficheros indicados', 'Dos ficheros del mismo tamaño en FG_DATOS', 'Autogrowth en MB, nunca en %', 'Comprueba el resultado en SSMS (Propiedades → Archivos)'], tone: 'tint' });

  // 20 ─ Laboratorio 1 (II)
  s = H.slide(pres, {
    mod: 1, badge: 'Base de datos', title: 'Lab 1 (II): verificar y hacer crecer', lab: true,
    notes: {
      obj: 'Verificar la estructura creada con las vistas de catálogo, establecer el filegroup predeterminado y comprobar el comportamiento del crecimiento.',
      guion: [
        'Tras crear la BD, fijar FG_DATOS como filegroup predeterminado: las tablas nuevas irán allí por defecto y PRIMARY queda reservado para el catálogo. Es una práctica muy extendida.',
        'sys.database_files muestra tamaño en páginas de 8 KB (de ahí size*8/1024 para MB) y las propiedades de crecimiento; is_percent_growth debe ser 0 en todos.',
        'Para ver el efecto del crecimiento: crear una tabla ancha en FG_DATOS e insertar más datos que los 512 MB iniciales; los ficheros crecerán en bloques de 128 MB y se puede consultar en sys.database_files o en el reporte de eventos de SSMS.',
        'Cierre del Módulo 1: repasar los cuatro conceptos que han aparecido hoy (Buffer Pool, páginas/extensiones, Transaction Log/WAL, tempdb) y conectarlos con los módulos siguientes.',
      ],
      preguntas: [
        '¿Qué diferencia observáis entre el tamaño reservado y el espacio realmente usado? (FILEPROPERTY(name,\'SpaceUsed\').)',
        '¿Qué haríais si un fichero de datos alcanza el límite de disco? (Añadir fichero en otra unidad, no shrink indiscriminado.)',
      ],
      lab: [
        'Paso 1: ejecutar ALTER DATABASE Ventas MODIFY FILEGROUP FG_DATOS DEFAULT.',
        'Paso 2: ejecutar las dos consultas de verificación y comprobar que size_mb es 64/256/256/128 y que growth está en MB.',
        'Paso 3 (extra): crear una tabla dbo.Prueba(id INT IDENTITY, relleno CHAR(8000)) y insertar 100.000 filas con un WHILE; revisar si ha crecido algún fichero.',
        'Trampas: querer cambiar el filegroup predeterminado a uno que no contiene ficheros (error); confundir size (páginas) con MB.',
        'Resolución: las consultas de la diapositiva con size*8/1024 devuelven MB; si growth = 16384 y is_percent_growth = 0, equivale a 128 MB (16384 páginas × 8 KB).',
      ],
    },
  });
  H.code(s, { x: CX, y: CY, w: 7.4, h: 3.2, size: 12, label: 'T-SQL · VERIFICACIÓN', code: "ALTER DATABASE Ventas MODIFY FILEGROUP FG_DATOS DEFAULT;\nGO\nSELECT name, physical_name, size*8/1024 AS size_mb,\n       growth*8/1024 AS growth_mb, is_percent_growth\nFROM Ventas.sys.database_files;\n\nSELECT name, is_default FROM Ventas.sys.filegroups;" });
  H.cardsRow(s, [
    { icon: 'FaCheckCircle', title: 'Comprueba', body: 'Cuatro ficheros, dos filegroups, FG_DATOS predeterminado.' },
    { icon: 'FaExclamationTriangle', title: 'Vigila', body: 'is_percent_growth = 0 en todos los ficheros.' },
  ], { x: 8.3, y: CY, w: 4.43, h: 3.2, gap: 0.25, size: 14, titleSize: 16 });
  H.callout(s, { x: CX, y: 5.2, w: CW, h: 1.5, kind: 'info', lead: 'Cierre del módulo:', text: 'Buffer Pool, páginas y extensiones, Transaction Log (WAL) y tempdb explican la mayoría de incidencias que veremos en los módulos siguientes.' });
};
