# Tasks: Actualización a SQL Server 2025 e Incorporación de Tablas Vectoriales

## 1. Actualización de Versión y Slide Deck (Módulos 0 y 1)

- [x] 1.1 Actualizar `labs/lab108-docker/docker-compose.yml` con la imagen `mcr.microsoft.com/mssql/server:2025-latest` y contenedor `sqlserver-dev`
- [x] 1.2 Actualizar las referencias a SQL Server 2025 en `presentacion/src/m0_m1.js` (Slide 1 versión base, Slide 4 comando Docker/SSMS, Slide 6 cronología con resalte en 2025 y compatibilidad 170, Slide 15 ediciones 2025 y Slide 18 sqlcmd)
- [x] 1.3 Maquetar la diapositiva 19 en `presentacion/src/m0_m1.js` sobre tablas vectoriales (`VECTOR`), función `VECTOR_DISTANCE` y patrón RAG con sus notas del orador estructuradas vinculadas a `labs/lab115-vector-table`

## 2. Ajuste de Numeración y Referencias en Módulos 2, 3 y 4

- [x] 2.1 Actualizar numeración de diapositivas (desplazamiento +1) y requisitos de versión 2025 en los comentarios y notas de `presentacion/src/m2.js`, `presentacion/src/m3.js` y `presentacion/src/m4.js`
- [x] 2.2 Compilar el slide deck completo con `node presentacion/src/build.js` y verificar que genera `curso_sql_server_dba_20h.pptx` con 82 diapositivas exactas y sin avisos de maquetación

## 3. Guía Docente y Compilación de PDF

- [x] 3.1 Actualizar `presentacion/src/extract_guide.py` con los nuevos rangos modulares (M1: 5–21, M2: 22–43, M3: 44–61, M4: 62–82) y regenerar `GUIA_DEL_DOCENTE.md`
- [x] 3.2 Actualizar `make_pdf.js` (`modulesMeta`, `friendlyTitles` para slides 5, 22, 44, 62, 80 y badge slide 82) y compilar `GUIA_DEL_DOCENTE.pdf` con Playwright

## 4. Exportación Final y Documentación

- [x] 4.1 Generar o sincronizar `curso_sql_server_dba_20h.pdf` verificando las 82 diapositivas panorámicas
- [x] 4.2 Actualizar `README.md` reflejando el cómputo de 82 diapositivas, las 20 horas lectivas y la incorporación de SQL Server 2025 con tablas vectoriales
