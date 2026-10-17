# Design: Actualización a SQL Server 2025 e Incorporación de Tablas Vectoriales

## Context

El curso de Administración de Bases de Datos en Microsoft SQL Server consta de 81 diapositivas en formato panorámico 16:9 organizadas en 5 scripts modulares (`m0_m1.js`, `m2.js`, `m3.js`, `m4.js`) ensamblados mediante `build.js`. A partir de la presentación se extrae la `GUIA_DEL_DOCENTE.md` con `extract_guide.py` y se compila el PDF de alta fidelidad con `make_pdf.js` vía Playwright. Se requiere migrar la versión base a **SQL Server 2025** e incorporar la nueva característica de **Tablas Vectoriales (`VECTOR`)** manteniendo el cómputo lectivo en **20 horas exactas**.

## Goals / Non-Goals

**Goals:**
- Actualizar la referencia de versión a SQL Server 2025 en diapositivas de entorno, Docker, cronología, licenciamiento y notas técnicas.
- Insertar una diapositiva dedicada a tablas vectoriales e IA en el Módulo 1 (Diapositiva 19), antes del Laboratorio 1.
- Mantener la duración lectiva en 20,0 horas exactas, ajustando la dinámica interna del Módulo 1 (2,75 h teoría/demos + 1,25 h lab = 4,0 h).
- Desplazar de forma consistente la numeración de diapositivas en todos los scripts generadores, guías y metadatos (81 → 82 diapositivas).
- Regenerar todos los artefactos (`curso_sql_server_dba_20h.pptx`, `curso_sql_server_dba_20h.pdf`, `GUIA_DEL_DOCENTE.md`, `GUIA_DEL_DOCENTE.pdf`).

**Non-Goals:**
- No se altera la estructura conceptual ni el temario de los Módulos 2, 3 y 4 (sólo se actualizan sus índices de diapositiva y referencias a versión).
- No se modifican los ejercicios del Laboratorio 1 (se mantiene la práctica de creación de BD, filegroups y autogrowth; la demo vectorial queda referenciada a `labs/lab115-vector-table/vector_table.sql`).

## Decisions

### Decisión 1: Ubicación de la diapositiva en la posición 19 (Módulo 1)
- **Opción elegida:** Situar la diapositiva inmediatamente tras *sqlcmd y Extended Events básicos* (Slide 18) y justo antes de *Lab 1 (I): BD con ficheros y filegroups* (ahora Slide 20).
- **Justificación:** Cierra el bloque conceptual del motor y almacenamiento de SQL Server 2025 antes de comenzar el laboratorio práctico de diseño físico.
- **Alternativa descartada:** Ubicarla en el Módulo 2 (DDL). Aunque `CREATE TABLE` se trata en M2, el tipo `VECTOR` es la bandera tecnológica de SQL Server 2025 y un concepto de arquitectura de almacenamiento que complementa la visión global del motor en M1.

### Decisión 2: Reparto horario de 20 horas sin alterar los demás módulos
- **Opción elegida:** M0: 0,5 h | M1: 4,0 h | M2: 5,5 h | M3: 5,0 h | M4: 5,0 h = 20,0 h.
- **Justificación:** M1 pasa de 16 a 17 diapositivas (~14 min/diapositiva). Se redistribuye internamente a 2,75 h de teoría/demostración (incluyendo la demo de búsqueda semántica con `VECTOR_DISTANCE`) y 1,25 h de laboratorio guiado.

### Decisión 3: Parámetros del entorno Docker y versión 2025
- **Imagen Docker:** `mcr.microsoft.com/mssql/server:2025-latest` (con compatibilidad documentada para etiquetas preview si aplica).
- **Nombre de contenedor:** `sql2025`.
- **Contraseña de ejemplo:** `Curso#SQL2025!`.
- **Nivel de compatibilidad:** Documentar `170` para SQL Server 2025.

### Decisión 4: Mapeo y desplazamiento en cadena de diapositivas
Al insertar la diapositiva 19:
- Módulo 0: Diapositivas 1 – 4 (4 diapositivas)
- Módulo 1: Diapositivas 5 – 21 (17 diapositivas) *(antes 5 – 20)*
- Módulo 2: Diapositivas 22 – 43 (22 diapositivas) *(antes 21 – 42)*
- Módulo 3: Diapositivas 44 – 61 (18 diapositivas) *(antes 43 – 60)*
- Módulo 4: Diapositivas 62 – 82 (21 diapositivas) *(antes 61 – 81)*
- Total: 82 diapositivas.

Se actualizan las funciones de mapeo en `extract_guide.py` (`get_module_info`) y `make_pdf.js` (`modulesMeta`, `friendlyTitles`).

## Risks / Trade-offs

- **[Riesgo] Desalineación de referencias de diapositivas en la guía docente o en los marcadores de `make_pdf.js`**  
  → *Mitigación:* Se auditará `make_pdf.js` actualizando `friendlyTitles` (Slide 5, 22, 44, 62, 80) y la condición de cierre (`slideNum === 82`). Se verificará la salida generada de `extract_guide.py` y el renderizado Playwright.
- **[Riesgo] Desbordamiento visual en la diapositiva 19**  
  → *Mitigación:* Utilizar la plantilla estándar de 2 columnas de `layout_helpers.js`: columna izquierda para el fragmento T-SQL compacto y callout; columna derecha para 2 cards explicativas.
