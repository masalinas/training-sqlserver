# Tasks: Adaptación del Curso a 20 Horas Lectivas

## 1. Ajuste de Código Fuente de la Presentación

- [x] 1.1 Actualizar pie de página y metadatos en `presentacion/src/layout_helpers.js` y `presentacion/src/build.js` reflejando «20 h» y la salida por defecto `curso_sql_server_dba_20h.pptx`.
- [x] 1.2 Actualizar en `presentacion/src/m0_m1.js` la portada (Slide 1: «CURSO DE FORMACIÓN · 20 H»), el mapa curricular (Slide 2: título «20 horas, 4 módulos», tarjetas stat con 0,5h, 4,0h, 5,5h, 5,0h, 5,0h y notas) y el separador de Módulo 1 (Slide 5: «≈ 4,0 H» y notas).
- [x] 1.3 Actualizar en `presentacion/src/m2.js` el separador de Módulo 2 (Slide 21: «5,5 h» y notas).
- [x] 1.4 Actualizar en `presentacion/src/m3.js` el separador de Módulo 3 (Slide 43: «5 h» y notas).
- [x] 1.5 Actualizar en `presentacion/src/m4.js` el separador de Módulo 4 (Slide 61: «5 h» y notas).

## 2. Ajuste de Scripts de la Guía del Docente y Documentación

- [x] 2.1 Actualizar `presentacion/src/extract_guide.py` para leer `curso_sql_server_dba_20h.pptx` y reflejar las 20 horas en la cabecera y en la tabla de desglose modular.
- [x] 2.2 Actualizar `make_pdf.js` con las duraciones del objeto `modulesMeta`, la métrica «20 h» de portada y el pie de página de la Guía.
- [x] 2.3 Actualizar `README.md` con las referencias a 20 horas lectivas y la tabla de desglose curricular.

## 3. Compilación y Validación de Entregables

- [x] 3.1 Ejecutar `node presentacion/src/build.js` y verificar que genere `curso_sql_server_dba_20h.pptx` con exactamente 81 diapositivas acumuladas y 0 avisos de maquetación.
- [x] 3.2 Exportar la presentación a PDF ejecutando `libreoffice --headless --convert-to pdf --outdir . curso_sql_server_dba_20h.pptx` y verificar que `curso_sql_server_dba_20h.pdf` contenga 81 páginas.
- [x] 3.3 Ejecutar `python3 presentacion/src/extract_guide.py` y verificar que `GUIA_DEL_DOCENTE.md` contenga la tabla de desglose con la suma de 20 horas lectivas.
- [x] 3.4 Ejecutar `npm run build:pdf` y verificar la generación exitosa de `GUIA_DEL_DOCENTE.pdf`.
