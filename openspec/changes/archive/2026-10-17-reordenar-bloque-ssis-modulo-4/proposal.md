# Proposal: Reordenar Bloque SSIS en Módulo 4

## Why

En el Módulo 4 de la presentación oficial del curso (`curso_sql_server_dba_25h.pptx`), las diapositivas sobre SQL Server Integration Services (SSIS) están actualmente ubicadas inmediatamente después de la Diapositiva 69 (*Mantenimiento automatizado con Agent*). Esta posición interrumpe prematuramente la continuidad temática del motor relacional, partiendo la transición entre el mantenimiento diario y la resolución de incidencias operativas del motor (*LDF lleno*, *TempDB saturada* y *Bloqueos prolongados y deadlocks*).

Reubicar las 3 diapositivas de SSIS para que se expongan inmediatamente después de *Bloqueos prolongados y deadlocks* restituye la coherencia didáctica: primero se aborda el ciclo completo de salud, monitorización e incidencias de la base de datos relacional, y a continuación se introduce SSIS como plataforma complementaria de integración y ETL empresarial antes de dar paso a los laboratorios de desastre y recuperación.

## What Changes

- **Reordenación de diapositivas en Módulo 4 (`presentacion/src/m4.js`)**:
  - Mover el bloque de 3 diapositivas de SSIS tras la diapositiva *Bloqueos prolongados y deadlocks*.
  - Las diapositivas de incidencias recuperan su numeración secuencial original (70, 71 y 72).
  - Las diapositivas de SSIS se renumeran secuencialmente a 73, 74 y 75.
  - Las diapositivas 76 a 81 (*Laboratorio 4 [A, B, C]*, *Caso Integrador*, *Checklist* y *Cierre*) conservan exactamente sus números y posiciones actuales.
- **Sincronización de artefactos compilados y documentación**:
  - Recompilar la presentación PowerPoint `curso_sql_server_dba_25h.pptx` (81 diapositivas).
  - Regenerar la versión para lectura y proyección `curso_sql_server_dba_25h.pdf` (81 páginas).
  - Regenerar `GUIA_DEL_DOCENTE.md` y compilar `GUIA_DEL_DOCENTE.pdf` reflejando el orden pedagógico actualizado.
  - Actualizar los resúmenes del Módulo 4 en `presentacion/src/extract_guide.py` y `make_pdf.js`.

## Capabilities

### New Capabilities

*(Ninguna)*

### Modified Capabilities

- `presentacion-curso-sql-server-dba`: Actualizar el escenario de secuenciación temática del Módulo 4 dentro del requisito de distribución curricular para fijar que la resolución de incidencias en producción precede a la plataforma SSIS.

## Impact

- **Código fuente**: `presentacion/src/m4.js` (reordenación del bloque de llamadas `H.slide`), `presentacion/src/extract_guide.py` y `make_pdf.js` (textos de índice del Módulo 4).
- **Entregables generados**: `curso_sql_server_dba_25h.pptx`, `curso_sql_server_dba_25h.pdf`, `GUIA_DEL_DOCENTE.md`, `GUIA_DEL_DOCENTE.pdf`.
- **Invarianza**: El cómputo total de 25 horas lectivas, las 81 diapositivas totales y el contenido íntegro de todas las diapositivas previas y de los laboratorios permanecen 100% inalterados.
