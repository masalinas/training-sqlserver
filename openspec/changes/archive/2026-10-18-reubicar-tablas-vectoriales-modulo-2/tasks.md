# Tasks

## 1. Refactorización del código de presentación (Módulo 1 y Módulo 2)

- [x] 1.1 Extraer la diapositiva de tablas vectoriales de `presentacion/src/m0_m1.js`, renumerar Lab 1 (I y II) a diapositivas 19 y 20, y actualizar el separador del Módulo 1 (Slide 5: rango 5–20 y retiro del topic de IA); verificar con `git diff presentacion/src/m0_m1.js`.
- [x] 1.2 Insertar la diapositiva de tablas vectoriales en `presentacion/src/m2.js` tras «Agregados y window functions básicas» como diapositiva 33 con badge `'DML avanzado'`, actualizar el separador del Módulo 2 (Slide 21: rango 21–43 y topics de DML con IA) y ajustar comentarios de numeración de las diapositivas 21 a 32; verificar con `git diff presentacion/src/m2.js`.

## 2. Compilación y validación del Slide Deck

- [x] 2.1 Ejecutar `node presentacion/src/build.js` y verificar que genera `curso_sql_server_dba_20h.pptx` con exactamente 82 diapositivas y 0 advertencias de layout.
- [x] 2.2 Exportar `curso_sql_server_dba_20h.pdf` mediante LibreOffice en modo headless y comprobar que el PDF resultante tiene 82 páginas y coincide con la presentación.

## 3. Sincronización de guías docentes y documentación

- [x] 3.1 Actualizar `presentacion/src/extract_guide.py` (función `get_module_info` con límite en slide 20 para M1 y tabla resumen), ejecutar el script y comprobar que `GUIA_DEL_DOCENTE.md` clasifica correctamente las diapositivas 5–20 en M1 y 21–43 en M2.
- [x] 3.2 Actualizar `make_pdf.js` (`modulesMeta`, `friendlyTitles`, tabla y tarjetas de la página 2), ejecutar `node make_pdf.js` y verificar que `GUIA_DEL_DOCENTE.pdf` se genera con 88 páginas y 90 marcadores PDF correctamente estructurados.
- [x] 3.3 Actualizar la tabla curricular y la lista de diagramas nativos en `README.md` (Slide 33 para tablas vectoriales); verificar que las referencias y enlaces son consistentes.

## 4. Verificación integral de especificaciones

- [x] 4.1 Ejecutar `openspec validate --all` y comprobar que la propuesta, el delta spec y el proyecto pasan la validación sin errores.
