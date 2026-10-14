# Design: Reordenación del Bloque SSIS en el Módulo 4

## Context

La presentación del curso se genera proceduralmente con Node.js (`pptxgenjs`) en `presentacion/src/build.js`, invocando secuencialmente los módulos `m0_m1.js`, `m2.js`, `m3.js` y `m4.js`. En `m4.js`, cada diapositiva se declara mediante `H.slide(pres, {...})`.

Actualmente, las llamadas a `H.slide` para las 3 diapositivas de SSIS (*SSIS: arquitectura, motor y herramientas*, *Pipeline ETL: ingesta de CSV a SQL Server* y *Despliegue en SSISDB y Jobs con Agent*) se sitúan inmediatamente tras la diapositiva 69 (*Mantenimiento automatizado con Agent*). Las 3 diapositivas de incidencias (*Incidencia: log de transacciones lleno*, *Incidencia: TempDB saturada* y *Bloqueos prolongados y deadlocks*) se ejecutan a continuación, seguidas por el bloque de laboratorios y cierre (diapositivas 76 a 81).

Ver `proposal.md` para la motivación pedagógica del cambio.

## Goals / Non-Goals

**Goals:**
- Trasladar el bloque de código de las 3 diapositivas de SSIS en `presentacion/src/m4.js` para ejecutarse inmediatamente tras la diapositiva *Bloqueos prolongados y deadlocks*.
- Renumerar los encabezados de comentarios en `presentacion/src/m4.js` (`// ════ 70..75 ════`) para eliminar duplicados y reflejar la secuencia exacta 61 a 81.
- Actualizar los textos de resumen y metadatos del Módulo 4 en `presentacion/src/extract_guide.py` y `make_pdf.js`.
- Regenerar de forma determinista la suite completa de entregables: `curso_sql_server_dba_25h.pptx`, `curso_sql_server_dba_25h.pdf`, `GUIA_DEL_DOCENTE.md` y `GUIA_DEL_DOCENTE.pdf`.

**Non-Goals:**
- No alterar los contenidos internos, estilos, tarjetas, tablas o notas pedagógicas de ninguna diapositiva existente.
- No modificar los módulos 0, 1, 2 o 3 (diapositivas 1 a 60).
- No alterar la posición ni el contenido de las diapositivas 76 a 81 (*Laboratorio 4*, *Caso Integrador*, *Checklist* y *Cierre*).
- No alterar el cómputo total de 25,0 horas lectivas ni las 6,0 horas asignadas al Módulo 4.

## Decisions

### Decisión 1: Reordenación contigua en `presentacion/src/m4.js`
Se moverá el bloque contiguo correspondiente a las slides de SSIS (aproximadamente líneas 409 a 554 de `m4.js`) para situarse tras el cierre de la diapositiva de Bloqueos (tras la llamada a `rowCard` de la línea 699 de `m4.js`).

*Alternativas consideradas:*
- Crear un submódulo independiente para SSIS: Descartado por innecesario; la arquitectura monolítica por módulo (`m4.js`) es consistente y directa.

### Decisión 2: Asignación correlativa de números en comentarios
En `m4.js`, se actualizarán los comentarios delimitadores:
- *Incidencia: log de transacciones lleno* pasa a comentarse como `70 · LDF lleno`.
- *Incidencia: TempDB saturada* pasa a comentarse como `71 · TempDB saturada`.
- *Bloqueos prolongados y deadlocks* pasa a comentarse como `72 · Bloqueos y deadlocks`.
- *SSIS: arquitectura, motor y herramientas* pasa a comentarse como `73 · SSIS: Arquitectura e instalación`.
- *Pipeline ETL: ingesta de CSV a SQL Server* pasa a comentarse como `74 · Pipeline ETL práctico`.
- *Despliegue en SSISDB y Jobs con Agent* pasa a comentarse como `75 · Despliegue en SSISDB y Agent`.
- Las diapositivas 76 a 81 ya tienen comentarios secuenciales correctos (`76 · Lab 4 (A)`, etc.).

### Decisión 3: Refactorización integral de la Guía del Docente y entregables
La Guía del Docente (`GUIA_DEL_DOCENTE.md` y `GUIA_DEL_DOCENTE.pdf`) se refactoriza por completo para mantener coherencia milimétrica con la nueva secuencia de la presentación:
1. `presentacion/src/extract_guide.py` y `make_pdf.js`: Actualizar la tabla de contenidos y resúmenes del Módulo 4 (incidencias en 70–72 preceden a SSIS en 73–75).
2. `make_pdf.js`: Corregir el mapeo de `friendlyTitles`, asignando la clave 79 (en lugar del remanente 76) a `'Laboratorio: Caso Práctico Integrador Final'` para evitar que el Laboratorio 4.A quede incorrectamente titulado.
3. Cadena de compilación y extracción:
   - `node presentacion/src/build.js` → genera `curso_sql_server_dba_25h.pptx` (81 diapositivas, 0 avisos).
   - `libreoffice --headless --convert-to pdf --outdir . curso_sql_server_dba_25h.pptx` → exporta `curso_sql_server_dba_25h.pdf` (81 páginas).
   - `python3 presentacion/src/extract_guide.py` → refactoriza y regenera íntegramente `GUIA_DEL_DOCENTE.md` extrayendo las 81 diapositivas y guiones pedagógicos en el nuevo orden.
   - `node make_pdf.js` → compila el documento editorial `GUIA_DEL_DOCENTE.pdf` con Chromium/Playwright (87 páginas aprox., con marcadores interactivos).

## Risks / Trade-offs

- **Riesgo:** Desbordamientos visuales o regresiones de layout al reubicar diapositivas.  
  *Mitigación:* Como el contenido de las diapositivas no se modifica y cada diapositiva se maqueta de forma independiente en una nueva página `H.slide`, no hay afectación de coordenadas. Se verificará que `build.js` reporte 0 advertencias de desbordamiento.
- **Riesgo:** Desincronización de referencias en la Guía del Docente.  
  *Mitigación:* La guía se extrae programáticamente desde el `.pptx` final; cualquier cambio en el orden se refleja de forma automática en los títulos y números de sección de `GUIA_DEL_DOCENTE.md` y `GUIA_DEL_DOCENTE.pdf`.
