# Especificación: Presentación y Material Docente SQL Server DBA

## 1. Idioma y Tono
- **Idioma:** Español técnico estándar (España/Latam).
- **Tono:** Profesional, riguroso, práctico y orientado a producción (Buenas prácticas de DBA).
- **Terminología:** Mantener los términos estándar del motor en inglés cuando proceda (ej. *Buffer Pool*, *Transaction Log*, *Clustered Index*, *Page Splits*, *Always On Availability Groups*, *DMVs*).

## 2. Parámetros Visuales y Layouts (Reglas Skill `pptx`)
- **Dimensiones:** Formato panorámico 16:9 (13.333 x 7.5 pulgadas / 1920x1080 nativo).
- **Paleta de Colores:**
  - Primario / Corporativo: Azul Marino Profundo (`#0B2545`)
  - Secundario / Motor: Azul Acero / Cobalto (`#134074`)
  - Acento / Alertas / Destacados: Ámbar / Coral (`#D95D39` o `#EE6C4D`)
  - Fondo Estándar: Blanco roto / Gris muy claro (`#F8F9FA`)
  - Fondo Separador de Módulo: Azul oscuro profundo (`#081528`)
- **Tipografía:**
  - Títulos: *Segoe UI* o *Calibri* (Bold, 32-40 pt)
  - Cuerpo / Puntos: *Calibri* o *Segoe UI* (14-18 pt)
  - Fragmentos de Código / T-SQL: *Consolas* (12-14 pt, sobre caja con fondo gris claro)
- **Reglas de Maquetación de la Skill:**
  - Espaciado y márgenes calculados para evitar cualquier solapamiento de cajas de texto o formas.
  - No usar bloques densos de texto en la diapositiva; emplear tarjetas (*cards*), contenedores y esquemas estructurados.
  - Insertar diagramas/imágenes vectoriales (o composiciones nativas de formas `python-pptx`) en los temas de arquitectura, árboles B y seguridad.

## 3. Estándar de Notas del Orador (*Speaker Notes*)
Cada diapositiva DEBE contener un guion completo en `slide.notes_slide.notes_text_frame` con la siguiente estructura:
1. **Objetivo Pedagógico:** Qué concepto debe asimilar el alumno en esta diapositiva.
2. **Guion y Explicación Técnica:** Desarrollo conceptual detallado (internals de SQL Server, cómo actúa el motor, advertencias de rendimiento).
3. **Puntos de Interacción / Preguntas:** Preguntas socráticas o debates para lanzar al grupo.
4. **Instrucciones de Laboratorio (si aplica):** Pasos prácticos a realizar en SSMS/Docker y trampas habituales que encontrarán los alumnos.

## 4. Distribución del Contenido (~75 Diapositivas / 25 Horas)

### Módulo 0: Bienvenida y Entorno (3-4 slides / ~0.5h)
- Presentación del curso, dinámica, entorno de trabajo (SSMS, Azure Data Studio, Docker/Local).

### Módulo 1: Fundamentos y Arquitectura. Licenciamiento (16 slides / ~5.5h)
- Historia y versiones; Arquitectura del motor (SNI, Relational Engine, Storage Engine, Buffer Pool).
- Estructura física vs lógica: Páginas (8KB), Extensiones (64KB), archivos MDF, NDF y LDF (VLF y WAL).
- Instancias y bases de datos del sistema (`master`, `model`, `msdb`, `tempdb`).
- Ediciones (Express, Standard, Enterprise) y modelo de licenciamiento (Core vs Server/CAL).
- Herramientas: SSMS, Profiler/XEvents básicos, línea de comandos (`sqlcmd`).
- Laboratorio 1: Creación de BD con particionado de archivos y configuración de crecimiento.

### Módulo 2: Gestión y Seguridad (22 slides / ~7h)
- Creación de tablas, restricciones (PK, FK, Check, Unique, Default).
- Vistas estándar, vistas indexadas y procedimientos almacenados (plan caching y recompilaciones).
- Fundamentos DML avanzados: Consultas SELECT complejas, JOINs (Hash, Merge, Loop), Subconsultas y Funciones de Agregado / Window Functions básicas.
- Modelo de Seguridad de SQL Server: Capas de autenticación (Windows vs SQL Server Auth).
- Jerarquía de seguridad: Logins (servidor) vs Users (base de datos), Schemas y Roles (fijos y personalizados).
- Principio de mínimo privilegio y auditoría básica.
- Laboratorio 2: Consultas analíticas, procedimientos almacenados y configuración de esquema de permisos segregados.

### Módulo 3: Optimización y Alta Disponibilidad (18 slides / ~6h)
- Arquitectura de índices: Heap vs Clustered Index, Non-Clustered Indexes y estructuras B-Tree.
- Fragmentación de índices, estadísticas y Page Splits.
- Lectura básica de Planes de Ejecución (Table Scan vs Index Seek, Coste de CPU/IO).
- Monitorización del rendimiento con Dynamic Management Views (DMVs) clave (`sys.dm_exec_query_stats`, `sys.dm_os_waiting_tasks`).
- Fundamentos de Alta Disponibilidad y Disaster Recovery (HA/DR): RTO y RPO.
- Comparativa tecnológica: Log Shipping, Replicación, Failover Cluster Instances (FCI) y Always On Availability Groups.
- Laboratorio 3: Creación de índices, análisis de planes de ejecución y detección de cuellos de botella con DMVs.

### Módulo 4: Prácticas Recomendadas y Mantenimiento (18 slides / ~6h)
- Modelos de recuperación: Simple, Full y Bulk-Logged.
- Estrategia integral de Backups: Completo (Full), Diferencial y Registro de Transacciones (Log Backup Chain).
- Procedimientos de restauración y recuperación puntual (*Point-in-Time Restore*).
- Integridad física: `DBCC CHECKDB`, detección de corrupción y reparación.
- Planes de mantenimiento automatizados (Reorganize vs Rebuild de índices, actualización de estadísticas, limpieza de historial).
- Resolución de incidencias comunes: LDF lleno, TempDB saturada, deadlocks y bloqueos prolongados.
- Laboratorio 4: Simulación de pérdida de datos y restauración *point-in-time*, seguido del Caso Práctico Integrador final.

## 5. Entregables
1. `curso_sql_server_dba_25h.pptx` (Deck completo con estilos, diagramas y notas).
2. `GUIA_DEL_DOCENTE.md` (Documento markdown con el guion completo de las 25 horas).