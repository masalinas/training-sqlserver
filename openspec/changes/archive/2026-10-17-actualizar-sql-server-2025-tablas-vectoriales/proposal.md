# Proposal: Actualización a SQL Server 2025 e Incorporación de Tablas Vectoriales

## Why

El curso de Administración de Bases de Datos en Microsoft SQL Server debe modernizarse para tomar como versión base de referencia **SQL Server 2025** (tanto en entorno host como en contenedores Docker), incorporando una de sus capacidades más destacadas: el soporte nativo de **tablas vectoriales (tipo `VECTOR`) y funciones de distancia para IA/búsquedas semánticas (RAG)**. Esto permite formar a los DBAs en la gestión de cargas de inteligencia artificial directamente en el motor relacional tradicional sin recurrir a bases de datos vectoriales externas dedicadas. El curso mantiene su duración total estricta de **20 horas lectivas**, requiriendo un ajuste fino del reparto interno y la expansión del slide deck de 81 a 82 diapositivas.

## What Changes

- **Versión de referencia oficial actualizada a SQL Server 2025**:
  - Actualización del entorno de prácticas Docker a `mcr.microsoft.com/mssql/server:2025-latest` con contenedor `sql2025` y credenciales adaptadas.
  - Actualización de la instalación local a *SQL Server 2025 Developer Edition*.
  - Resalte de SQL Server 2025 en la línea temporal de versiones (compatibilidad `170`), diapositiva de ediciones y notas de los módulos.
  - Actualización de `labs/lab108-docker/docker-compose.yml`.
- **Nueva diapositiva sobre Tablas Vectoriales e Inteligencia Artificial en el Módulo 1**:
  - Inserción de la diapositiva 19 en el Módulo 1: *«SQL Server 2025: Tablas vectoriales y búsqueda semántica»*.
  - Contenido visual con sintaxis T-SQL de declaración de `VECTOR(n)`, funciones de cálculo de distancia `VECTOR_DISTANCE('cosine', ...)` y conceptos clave de RAG.
  - Notas exhaustivas para el docente vinculadas al laboratorio existente [`labs/lab115-vector-table/vector_table.sql`](file:///home/miguel/git/training-sqlserver/labs/lab115-vector-table/vector_table.sql).
- **Ajuste del reparto horario (20 Horas)**:
  - Se mantiene la duración global de 20,0 h.
  - El Módulo 1 absorbe la nueva diapositiva pasando a 17 diapositivas (slides 5 a 21), manteniendo 4,0 h lectivas mediante un balance interno de 2,75 h de teoría/demostración (incluyendo demo de `VECTOR`) y 1,25 h de Laboratorio 1.
- **Desplazamiento en cadena de la numeración de diapositivas**:
  - El slide deck total pasa de 81 a 82 diapositivas.
  - M0: 1–4, M1: 5–21, M2: 22–43, M3: 44–61, M4: 62–82.
- **Regeneración de todos los entregables**:
  - `curso_sql_server_dba_20h.pptx` (82 diapositivas).
  - `curso_sql_server_dba_20h.pdf` (82 diapositivas).
  - `GUIA_DEL_DOCENTE.md` y `GUIA_DEL_DOCENTE.pdf` (con la nueva ficha pedagógica y numeración sincronizada).
  - `README.md` actualizado con el conteo y novedades de SQL Server 2025.

## Capabilities

### New Capabilities
*(Ninguna; se amplía la capacidad existente del material docente).*

### Modified Capabilities
- `presentacion-curso-sql-server-dba`: Actualización de la especificación para reflejar 82 diapositivas totales, versión de referencia SQL Server 2025 y la cobertura de tablas vectoriales (`VECTOR`) e IA en el temario y notas de Módulo 1 dentro de las 20 horas lectivas.

## Impact

- **Código y generadores de presentación**:
  - `presentacion/src/m0_m1.js`: Inserción de la slide 19 y actualización de textos/código a SQL Server 2025.
  - `presentacion/src/m2.js`, `m3.js`, `m4.js`: Actualización de numeración en notas, comentarios y prerrequisitos de versión.
  - `presentacion/src/extract_guide.py`: Rangos de diapositivas por módulo adaptados al nuevo total (82).
  - `make_pdf.js`: Mapeo de módulos, rangos y títulos de apertura actualizados para la generación de `GUIA_DEL_DOCENTE.pdf`.
- **Laboratorios y Docker**:
  - `labs/lab108-docker/docker-compose.yml`: Imagen `mcr.microsoft.com/mssql/server:2025-latest`.
- **Documentación**:
  - `GUIA_DEL_DOCENTE.md`, `GUIA_DEL_DOCENTE.pdf`, `README.md`.
