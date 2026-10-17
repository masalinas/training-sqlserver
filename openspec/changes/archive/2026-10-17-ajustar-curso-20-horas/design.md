# Technical Design: Adaptación del Curso a 20 Horas Lectivas

## Context

El proyecto genera un slide deck profesional (`pptx`), una versión para lectura e impresión (`pdf`) y la Guía del Docente (`md` y `pdf`). Actualmente, las referencias horarias de 25 horas están distribuidas en:
1. `presentacion/src/layout_helpers.js`: pie de página común de todas las diapositivas.
2. `presentacion/src/build.js`: nombre por defecto del archivo PPTX y título de metadatos.
3. `presentacion/src/m0_m1.js`: diapositiva 1 (portada), diapositiva 2 (cards de estructura curricular) y diapositiva 5 (separador de Módulo 1).
4. `presentacion/src/m2.js`: diapositiva 21 (separador de Módulo 2).
5. `presentacion/src/m3.js`: diapositiva 43 (separador de Módulo 3).
6. `presentacion/src/m4.js`: diapositiva 61 (separador de Módulo 4).
7. `presentacion/src/extract_guide.py`: script de extracción que compila la tabla de horas en `GUIA_DEL_DOCENTE.md`.
8. `make_pdf.js`: script de maquetación HTML/Playwright que renderiza `GUIA_DEL_DOCENTE.pdf`.
9. `README.md`: documentación del repositorio.

Ver `proposal.md` y `specs/presentacion-curso-sql-server-dba/spec.md` para los requisitos y motivación detallada.

## Goals / Non-Goals

**Goals:**
- Ajustar de forma consistente y determinista todas las referencias horarias de 25 h a 20 h lectivas.
- Implementar el reparto oficial ponderado: M0 (0,5 h), M1 (4,0 h), M2 (5,5 h), M3 (5,0 h) y M4 (5,0 h).
- Renombrar los archivos de salida a `curso_sql_server_dba_20h.pptx` y `curso_sql_server_dba_20h.pdf`.
- Mantener la suite de compilación automatizada y sincronizada: PPTX $\rightarrow$ PDF $\rightarrow$ Guía MD $\rightarrow$ Guía PDF.

**Non-Goals:**
- Modificar, fusionar o eliminar diapositivas (se mantienen las 81 diapositivas exactas).
- Modificar explicaciones conceptuales, diagramas vectoriales, scripts T-SQL o enunciados y resoluciones de laboratorios.

## Decisions

### Decisión 1: Reparto de 20 Horas Ponderado (Opción A)
- **Elección:** M0 (0,5 h), M1 (4,0 h), M2 (5,5 h), M3 (5,0 h), M4 (5,0 h) = 20,0 h totales.
- **Razón:** M2 es el módulo con mayor densidad de slides (22) y dos laboratorios prácticos (2A y 2B). M4 incluye la práctica de Point-in-Time y el Caso Práctico Integrador final que requiere tiempo de resolución en aula. M1 tiene un solo laboratorio y 16 diapositivas conceptuales, permitiendo absorber la mayor reducción (-1,5 h).
- **Alternativas consideradas:**
  - *Reducción proporcional idéntica:* Dejaba fracciones horarias poco naturales (ej. 4,4 h o 4,8 h).
  - *Reducción simétrica (M1: 4,5h / M4: 4,5h):* Dejaba a M4 con poco margen para el caso integrador.

### Decisión 2: Nomenclatura de Archivos Generados
- **Elección:** Actualizar la salida por defecto en `build.js` a `curso_sql_server_dba_20h.pptx`, la exportación a `curso_sql_server_dba_20h.pdf` y actualizar `extract_guide.py` para leer el nuevo archivo.
- **Razón:** Claridad y consistencia para los alumnos y el docente; evita confusión con materiales antiguos de 25h.

### Decisión 3: Pipeline de Compilación Determinista
- **Flujo:**
  1. `node presentacion/src/build.js` $\rightarrow$ compila `curso_sql_server_dba_20h.pptx`.
  2. `libreoffice --headless --convert-to pdf --outdir . curso_sql_server_dba_20h.pptx` $\rightarrow$ exporta `curso_sql_server_dba_20h.pdf`.
  3. `python3 presentacion/src/extract_guide.py` $\rightarrow$ extrae notas y genera `GUIA_DEL_DOCENTE.md` actualizado.
  4. `npm run build:pdf` (`node make_pdf.js`) $\rightarrow$ renderiza `GUIA_DEL_DOCENTE.pdf`.

## Risks / Trade-offs

- **[Riesgo] Referencias huérfanas al archivo de 25h en scripts**:
  - *Mitigación:* Se auditan y actualizan todas las referencias en `build.js`, `extract_guide.py`, `make_pdf.js`, `package.json` y `README.md`.
- **[Riesgo] Descuadre en la suma total**:
  - *Mitigación:* Se valida algebraicamente que $0,5 + 4,0 + 5,5 + 5,0 + 5,0 = 20,0$ en todos los artefactos y tarjetas visuales.

## Migration Plan

1. Modificar los archivos fuente en `presentacion/src/` (`layout_helpers.js`, `build.js`, `m0_m1.js`, `m2.js`, `m3.js`, `m4.js`).
2. Modificar `extract_guide.py` y `make_pdf.js`.
3. Actualizar `README.md`.
4. Ejecutar el pipeline de compilación completo y verificar la generación de los 4 entregables principales (`curso_sql_server_dba_20h.pptx`, `curso_sql_server_dba_20h.pdf`, `GUIA_DEL_DOCENTE.md` y `GUIA_DEL_DOCENTE.pdf`).
5. Limpiar/sustituir los antiguos archivos `_25h` obsoletos si procede.
