# Tasks: Reordenación del Bloque SSIS en el Módulo 4

## 1. Reordenación de Código en Módulo 4

- [x] 1.1 Mover el bloque de las 3 diapositivas de SSIS tras la diapositiva de Bloqueos en `presentacion/src/m4.js` y verificar con `node -c presentacion/src/m4.js` que la sintaxis sea correcta.
- [x] 1.2 Actualizar las marcas de comentarios numéricos en `presentacion/src/m4.js` (`// ════ 70..75 ════`) para establecer la secuencia 70 (LDF), 71 (TempDB), 72 (Bloqueos), 73 (SSIS arquitectura), 74 (Pipeline ETL) y 75 (Despliegue SSISDB), verificando que no existan duplicados.
- [x] 1.3 Actualizar los textos de resumen del Módulo 4 en `presentacion/src/extract_guide.py` y `make_pdf.js`, y corregir `friendlyTitles` en `make_pdf.js` para asignar la clave 79 a `'Laboratorio: Caso Práctico Integrador Final'` en vez del remanente 76.

## 2. Compilación y Generación de Entregables

- [x] 2.1 Ejecutar `node presentacion/src/build.js` y verificar que reporte exactamente 81 diapositivas acumuladas y 0 avisos de maquetación en `curso_sql_server_dba_25h.pptx`.
- [x] 2.2 Exportar la presentación a PDF ejecutando `libreoffice --headless --convert-to pdf --outdir . curso_sql_server_dba_25h.pptx` y verificar que `curso_sql_server_dba_25h.pdf` contenga exactamente 81 páginas.
- [x] 2.3 Ejecutar `python3 presentacion/src/extract_guide.py` para refactorizar y regenerar íntegramente `GUIA_DEL_DOCENTE.md`, verificando que las diapositivas 70 a 75 aparezcan en la nueva secuencia con todos sus contenidos y notas docentes.
- [x] 2.4 Ejecutar `node make_pdf.js` para refactorizar y compilar `GUIA_DEL_DOCENTE.pdf`, verificando la correcta paginación (87 páginas aprox.), marcadores interactivos y visualización de títulos.

## 3. Verificación Final y Validación OpenSpec

- [x] 3.1 Inspeccionar el orden resultante en el slide deck y en la guía docente para confirmar que las diapositivas de incidencias son las 70, 71 y 72, y las de SSIS son las 73, 74 y 75, manteniendo las 76 a 81 inalteradas.
- [x] 3.2 Ejecutar `openspec validate reordenar-bloque-ssis-modulo-4 --strict` y verificar que todas las especificaciones y artefactos sean estrictamente conformes.
