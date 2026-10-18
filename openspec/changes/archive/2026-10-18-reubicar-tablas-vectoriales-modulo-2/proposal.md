# Proposal

## Why

La diapositiva «SQL Server 2025: Tablas vectoriales y RAG» fue ubicada inicialmente al final del Módulo 1 (antes del Laboratorio 1 de ficheros y filegroups), interrumpiendo el flujo pedagógico centrado en la arquitectura interna del motor y almacenamiento físico (páginas de 8 KB, extensiones, MDF/NDF/LDF, WAL).

Reubicarla en el Módulo 2 («Gestión y Seguridad»), específicamente tras la diapositiva «Agregados y window functions básicas» dentro de la sección de DML Avanzado, sitúa el uso del tipo nativo `VECTOR(n)` y la función `VECTOR_DISTANCE` donde pedagógicamente corresponde: como una extensión del T-SQL declarativo y analítico para consultas de búsqueda semántica combinadas con predicados relacionales.

## What Changes

- **Reubicación de slide en Módulo 2:** Trasladar la diapositiva «SQL Server 2025: Tablas vectoriales y RAG» desde `presentacion/src/m0_m1.js` hacia `presentacion/src/m2.js` colocándola inmediatamente después de «Agregados y window functions básicas».
- **Ajuste de límites y numeración modular:**
  - El Módulo 1 pasa de 17 a 16 diapositivas (diapositivas 5–20), finalizando con el Laboratorio 1 (I y II) en las posiciones 19 y 20.
  - El Módulo 2 pasa de 22 a 23 diapositivas (diapositivas 21–43), comenzando en la diapositiva 21 y alojando la diapositiva vectorial en la posición 33.
  - Los Módulos 3 (diapositivas 44–61) y 4 (diapositivas 62–82) mantienen inalterada su numeración y contenidos.
- **Sincronización de separadores y metadatos:**
  - En el separador del Módulo 1 (Slide 5), retirar el tema «Tablas vectoriales (IA)».
  - En el separador del Módulo 2 (Slide 21), incorporar la referencia a tablas vectoriales/IA en DML avanzado.
  - Actualizar `make_pdf.js` y `extract_guide.py` para reflejar los nuevos rangos (M1: 5–20, M2: 21–43) y el opener de M2 (Slide 21).
  - Actualizar la tabla curricular y referencias de diagramas en `README.md`.
- **Cómputo global:** El total del slide deck permanece exactamente en 82 diapositivas y la carga horaria en 20 horas lectivas.

## Capabilities

### New Capabilities
<!-- No se introducen nuevas capacidades a nivel de especificación. -->

### Modified Capabilities
- `presentacion-curso-sql-server-dba`: Modifica el requisito `Distribución Curricular de 20 Horas` transfiriendo la cobertura del tipo nativo `VECTOR` y funciones de distancia para IA/RAG desde el escenario del Módulo 1 al escenario del Módulo 2.

## Impact

- Código del generador de presentaciones: `presentacion/src/m0_m1.js`, `presentacion/src/m2.js`.
- Scripts de extracción y generación de documentación: `presentacion/src/extract_guide.py`, `make_pdf.js`.
- Entregables generados: `curso_sql_server_dba_20h.pptx`, `curso_sql_server_dba_20h.pdf`, `GUIA_DEL_DOCENTE.md`, `GUIA_DEL_DOCENTE.pdf`.
- Documentación de proyecto: `README.md`.
- Especificaciones: `openspec/specs/presentacion-curso-sql-server-dba/spec.md`.
