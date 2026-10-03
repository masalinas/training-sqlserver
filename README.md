# Curso de Administración de Bases de Datos en Microsoft SQL Server (25 Horas)

Material formativo oficial para la impartición de un curso técnico avanzado de **25 horas lectivas** sobre **Administración de Bases de Datos (DBA) en Microsoft SQL Server**, orientado a producción y buenas prácticas operativas.

---

## Creación del primer plan
Inicialmente exploraremos una plan(change) que defina mis necesidades

```bash
/explore Quiero crear el material formativo completo de un curso profesional de Microsoft SQL Server Database Administration de 25 horas lectivas.

Entrada y Temario oficial:
El curso se divide en 4 módulos principales:
1. Fundamentos y Arquitectura. Licenciamiento (arquitectura interna, storage engine, relational engine, buffer pool, MDF/NDF/LDF, instancias, bases del sistema, licenciamiento y SSMS).
2. Gestión y Seguridad (DDL, vistas, stored procedures, T-SQL avanzado, modelo de autenticación, logins vs users, roles, esquemas y permisos).
3. Optimización y Alta Disponibilidad (árboles B, índices agrupados/no agrupados, planes de ejecución, DMVs de monitorización, Always On AG, Log Shipping, clustering).
4. Prácticas Recomendadas y Mantenimiento (modelos de recuperación, cadena de backups Full/Diff/Log, point-in-time restore, DBCC CHECKDB, mantenimiento y caso práctico integrador).

Requisitos técnicos y restricciones de entrega:
- Idioma: Todo el contenido, diapositivas y documentación deben estar estrictamente en español.
- Formato de salida: Generar una presentación PowerPoint widescreen (16:9) con diseño corporativo moderno (paleta azul SQL Server / acero / acentos de contraste) usando la skill instalada de anthropic pptx (python-pptx).
- Extensión pedagógica: Al ser un curso de 25 horas, debe estructurarse como un Slide Deck formativo profundo de entre 70 y 80 diapositivas, combinando teoría, esquemas visuales y enunciados de laboratorios prácticos.
- Requisito crítico de notas del orador: CADA diapositiva debe incluir en su campo de speaker notes (`slide.notes_slide`) un guion pedagógico exhaustivo con objetivos de la lámina, explicación técnica detallada a bajo nivel (internals del motor), preguntas de debate para el aula y pistas/resolución para los laboratorios.
- Diagramas e imágenes: Generar o componer esquemas visuales clave para la arquitectura del motor, estructuras de árbol B de índices, capas de seguridad y la cadena cronológica de copias de seguridad.
- Entregables finales: Centralizar la salida en la raiz del proyecto, que contenga el archivo `curso_sql_server_dba_25h.pptx` y un archivo Markdown complementario `GUIA_DEL_DOCENTE.md` que extraiga todas las diapositivas con sus notas del orador para consulta offline.
- Finalmente exporta tanto `curso_sql_server_dba_25h.pptx` como `GUIA_DEL_DOCENTE.md` en pdf y guarsalos igualmente en la raiz del proyecto.
```

A continuación crearemos todos los recursos openspec necesarios para implementar este primer plan(change)
```bash
/openspec-propose 
```

A continuación implementaremos el plan diseñado
```bash
/openspec-apply-change
```

Finalmente tras la creación archivaremos el plan y podremos continuar con cambios si fueran necesarios con nuevos planes
```bash
/openspec-archive-change
```

## 📦 Entregables Principales

1. **Presentación Técnica Oficial (78 Diapositivas 16:9):**
   - **PowerPoint editable:** [`curso_sql_server_dba_25h.pptx`](./curso_sql_server_dba_25h.pptx)
   - **Documento PDF exportado:** [`curso_sql_server_dba_25h.pdf`](./curso_sql_server_dba_25h.pdf)
   - **Formato:** Panorámico 16:9 (`13.333" × 7.5"`), paleta cromática corporativa de alto contraste (`#0B2545` Azul Marino, `#134074` Azul Cobalto, `#D95D39` Coral de acento y alertas, `#F8F9FA` Fondo claro).
   - **Elementos:** Tarjetas estructuradas (*cards*), tablas comparativas, fragmentos T-SQL reales con resaltado de sintaxis sobre cajas estilizadas, y composiciones vectoriales nativas de PowerPoint (diagramas editables sin imágenes rasterizadas).
   - **Notas del Orador:** El 100% de las diapositivas (78/78) contiene notas pedagógicas exhaustivas estructuradas en: *Objetivo Pedagógico*, *Guion y Explicación Técnica*, *Puntos de Interacción / Preguntas* e *Instrucciones de Laboratorio*.

2. **Guía Exhaustiva del Docente:**
   - [`GUIA_DEL_DOCENTE.md`](./GUIA_DEL_DOCENTE.md)
   - Documento Markdown de referencia (~230.000 caracteres) con el guion completo de las 25 horas lectivas para consulta offline y seguimiento en el aula, con todos los internals de SQL Server, trampas habituales y resolución detallada de cada laboratorio.

---

## 🗺️ Estructura Curricular (25 Horas)

| Módulo | Título | Horas | Diapositivas | Enfoque Pedagógico y Contenido Clave |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Bienvenida y Entorno** | 0,5 h | 1 – 4 | Presentación del curso, dinámica de clase, herramientas (SSMS, VS Code MSSQL) y despliegue del entorno con Docker. |
| **1** | **Fundamentos y Arquitectura. Licenciamiento** | 5,5 h | 5 – 20 | Historia y versiones, Relational Engine vs Storage Engine, Buffer Pool, SQLOS, páginas (8 KB), extensiones (64 KB), ficheros MDF/NDF/LDF, WAL, VLFs, bases del sistema, licenciamiento (Core vs Server+CAL), sqlcmd, Extended Events y **Laboratorio 1** (creación de BD, filegroups y autogrowth). |
| **2** | **Gestión y Seguridad** | 7,0 h | 21 – 42 | DDL y restricciones (PK, FK, CHECK, UNIQUE, DEFAULT), vistas estándar e indexadas, procedimientos almacenados (plan caching y recompilaciones), DML analítico y JOINs físicos (Hash, Merge, Loop), Window Functions, capas de seguridad (Autenticación $\rightarrow$ Logins $\rightarrow$ Users $\rightarrow$ Roles $\rightarrow$ Objetos), mínimos privilegios, ownership chaining y **Laboratorios 2A y 2B** (consultas analíticas y segregación de permisos). |
| **3** | **Optimización y Alta Disponibilidad** | 6,0 h | 43 – 60 | Índices Heap vs Clustered, Non-Clustered, árboles B-Tree, fragmentación y estadísticas, lectura de planes de ejecución (Seek vs Scan vs Key Lookup), monitorización con DMVs (`sys.dm_exec_query_stats`, `sys.dm_os_wait_stats`), RTO/RPO, comparativa de HA/DR (Log Shipping, FCI, Always On Availability Groups con topología de quórum y listener) y **Laboratorios 3.1 y 3.2** (covering indexes y análisis con DMVs). |
| **4** | **Mantenimiento, Copias de Seguridad y Caso Integrador** | 6,0 h | 61 – 78 | Modelos de recuperación (Simple, Full, Bulk-Logged), estrategia integral de backups (Full + Diferencial + Log Chain), restauración Point-in-Time (`STOPAT`, `NORECOVERY`), integridad física (`DBCC CHECKDB`), planes automatizados con SQL Server Agent, resolución de incidencias (LDF lleno, TempDB saturada, bloqueos/deadlocks), **Laboratorio 4** (simulación de desastre y restauración puntual), **Caso Práctico Integrador** final y checklist del DBA. |

---

## 📊 Diagramas Conceptuales Nativos Incorporados

El deck incluye composiciones visuales desarrolladas mediante formas vectoriales nativas en PowerPoint:
- **Slide 7:** Arquitectura interna del motor (SNI, Relational Engine, Storage Engine, Buffer Pool, SQLOS y subsistema de E/S).
- **Slide 10:** Estructura física interna (anatomía de una página de 8 KB, extensiones mixtas/uniformes de 64 KB y organización de VLFs en el transaction log).
- **Slide 36:** Modelo jerárquico de seguridad en capas (Autenticación $\rightarrow$ Login $\rightarrow$ User $\rightarrow$ Roles/Permisos $\rightarrow$ Objetos).
- **Slide 46:** Estructura de árbol B-Tree comparando índices Clustered (hojas con datos) vs Non-Clustered (hojas con clave + puntero).
- **Slide 63:** Cronograma visual de la estrategia de backups (Full + Diferencial + T-Log cada 15 min) y secuencia paso a paso de recuperación *Point-in-Time*.

---

## 🛠️ Estructura del Repositorio y Scripts de Generación

```text
training-sqlserver/
├── README.md                                    # Este documento resumen
├── GUIA_DEL_DOCENTE.md                          # Manual completo para el instructor (230K caracteres)
├── curso_sql_server_dba_25h.pptx                # Slide deck generado (78 diapositivas)
├── curso_sql_server_dba_25h.pdf                 # Presentación completa exportada a PDF
├── package.json                                 # Dependencias Node.js (pptxgenjs, sharp, react-icons, etc.)
├── openspec/
│   ├── changes/archive/                         # Historial de cambios archivados
│   └── specs/presentacion-curso-sql-server-dba/ # Especificación formal viva del curso
└── presentacion/
    ├── qa/                                      # Renders y hojas de contacto visual de verificación (ignorado en Git)
    └── src/
        ├── layout_helpers.js                    # Motor base de diseño, paleta, medidas y notas
        ├── diagrams.js                          # Módulo de diagramas nativos
        ├── m0_m1.js                             # Contenido Módulo 0 y Módulo 1 (Slides 1–20)
        ├── m2.js                                # Contenido Módulo 2 (Slides 21–42)
        ├── m3.js                                # Contenido Módulo 3 (Slides 43–60)
        ├── m4.js                                # Contenido Módulo 4 (Slides 61–78)
        ├── build.js                             # Ensamblador del deck completo
        ├── extract_guide.py                     # Extractor de diapositivas y notas a Markdown
        ├── render.py                            # Renderizador PPTX -> PDF -> JPG por diapositiva
        └── montage.py                           # Generador de hojas de contacto 2x2 para QA visual
```

---

## 🚀 Comandos de Utilidad

### 0. Iniciar agente antigravity modo skip permissions
Este modo permite que el agente ejecute comandos sin tener que esperar por ninguna la aprovación
```bash
agy --dangerously-skip-permissions
```

### 1. Reconstruir el Slide Deck PPTX
```bash
node presentacion/src/build.js
```

### 2. Validar Esquema y Estructura OpenXML (Skill `pptx`)
```bash
.venv/bin/python .agent/skills/pptx/scripts/office/validate.py curso_sql_server_dba_25h.pptx
```

### 3. Extraer y Sincronizar la Guía del Docente
```bash
.venv/bin/python presentacion/src/extract_guide.py
```

### 4. Renderizar Diapositivas a Imágenes para QA Visual
```bash
# Renderizar diapositivas individuales
.venv/bin/python presentacion/src/render.py curso_sql_server_dba_25h.pptx presentacion/qa/full_deck 80

# Generar hojas de contacto 2x2
.venv/bin/python presentacion/src/montage.py presentacion/qa/full_deck
```

---

## ✅ Control de Calidad y Validación Técnica

- **Validación OpenXML:** `All validations PASSED!` en validación XSD, Content Types, relaciones y consistencia de diapositivas.
- **Cobertura de Notas:** 100% (78/78 diapositivas con notas completas).
- **Control de Desbordamiento:** 0 advertencias de desbordamiento en el motor de compilación (`Sin avisos de maquetación`).
- **Verificación Visual:** Todas las diapositivas han sido inspeccionadas visualmente mediante renders de alta resolución asegurando ausencia de solapamientos, márgenes regulares ($\ge 0,5"$) y excelente legibilidad.
