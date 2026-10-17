# Proposal: Adaptación del Curso SQL Server DBA a 20 Horas Lectivas

## Why

El curso oficial de Administración de Bases de Datos en Microsoft SQL Server ha sido reconfigurado para impartirse en una modalidad de **20 horas lectivas** (anteriormente 25 horas). Se requiere adaptar la carga horaria global, el reparto de tiempos por módulo, los títulos, notas de orador y metadatos de los entregables generados, manteniendo una **invarianza estricta del 100%** sobre las 81 diapositivas existentes, sus contenidos técnicos, diagramas vectoriales nativos, laboratorios y el desarrollo pedagógico de la Guía del Docente.

## What Changes

- **Invarianza pedagógica y técnica total**: No se modifica, añade ni elimina ninguna de las 81 diapositivas. Todos los laboratorios (Labs 1, 2A, 2B, 3.1, 3.2, 4 y Caso Integrador) y explicaciones técnicas permanecen 100% idénticos.
- **Ajuste global de duración (25 h $\rightarrow$ 20 h)**: Actualización de todas las referencias de duración en la presentación (portada, pie de página global, mapa curricular y separadores de módulo) y en los generadores de la Guía del Docente (`extract_guide.py`, `make_pdf.js`).
- **Nuevo reparto horario oficial (Opción A Ponderada)**:
  - **Módulo 0 (Bienvenida y Entorno)**: 0,5 h (Slides 1–4)
  - **Módulo 1 (Fundamentos y Arquitectura. Licenciamiento)**: 4,0 h (Slides 5–20)
  - **Módulo 2 (Gestión y Seguridad)**: 5,5 h (Slides 21–42)
  - **Módulo 3 (Optimización y Alta Disponibilidad)**: 5,0 h (Slides 43–60)
  - **Módulo 4 (Mantenimiento, Backups, SSIS y Caso Integrador)**: 5,0 h (Slides 61–81)
  - **Total**: 20,0 horas lectivas exactas.
- **Renombrado de entregables**: Actualización del ensamblador y scripts para generar `curso_sql_server_dba_20h.pptx` y `curso_sql_server_dba_20h.pdf` como salidas oficiales.

## Capabilities

### Modified Capabilities
- `presentacion-curso-sql-server-dba`: Actualiza el requisito de *Distribución Curricular* de 25 a 20 horas con el nuevo desglose por módulo (0,5h + 4,0h + 5,5h + 5,0h + 5,0h) y actualiza el requisito de *Entregables Complementarios* para reflejar los archivos `curso_sql_server_dba_20h.pptx` y `curso_sql_server_dba_20h.pdf`.

## Impact

- **Presentación (`presentacion/src/`)**:
  - `layout_helpers.js`: pie de página común actualizado a `· 20 h`.
  - `build.js`: nombre por defecto de salida `curso_sql_server_dba_20h.pptx` y título de metadatos.
  - `m0_m1.js`: portada (20 H), mapa curricular (20 h, cards de módulos actualizadas a 0,5 / 4,0 / 5,5 / 5,0 / 5,0 h) y separador M1 (4,0 H).
  - `m2.js`: separador M2 (5,5 h).
  - `m3.js`: separador M3 (5,0 h).
  - `m4.js`: separador M4 (5,0 h).
- **Guía del Docente (`presentacion/src/extract_guide.py` y `make_pdf.js`)**:
  - Tabla de estructura general y metadatos actualizados a 20 h y duraciones de módulos correspondientes.
  - Generación de `GUIA_DEL_DOCENTE.md` y `GUIA_DEL_DOCENTE.pdf` con métricas de 20 h.
- **Documentación y Especificaciones**:
  - `README.md` actualizado con la duración de 20 h y la nueva tabla horaria.
