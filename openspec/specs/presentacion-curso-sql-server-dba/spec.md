# Presentación y Material Docente SQL Server DBA Specification

## Purpose

Definir los requisitos técnicos, visuales y pedagógicos para la generación automatizada de la presentación oficial y la guía docente del curso de 25 horas lectivas sobre Administración de Bases de Datos en Microsoft SQL Server.

## Requirements

### Requirement: Formato y Parámetros Visuales (Skill pptx)
El generador de la presentación SHALL maquetar el slide deck en formato panorámico 16:9 con paleta cromática profesional corporativa y componentes visuales nativos sin solapamientos.

#### Scenario: Dimensiones y paleta cromática de alta legibilidad
- **WHEN** se compila el slide deck con `node presentacion/src/build.js`
- **THEN** el archivo generado posee dimensiones panorámicas 16:9 (13.333" × 7.5"), emplea colores primarios `#0B2545` (Navy), secundarios `#134074` (Cobalt), acentos `#D95D39` (Coral) y fondos `#F8F9FA` / `#081528`, respetando márgenes mínimos de 0.5" y tipografías seguras (Calibri/Consolas).

#### Scenario: Inserción de diagramas vectoriales nativos
- **WHEN** se explican conceptos complejos de arquitectura interna, distribución física, seguridad, árboles B o planes de backup
- **THEN** se dibujan composiciones vectoriales nativas de PowerPoint (editables sin imágenes rasterizadas fijas) para facilitar la explicación técnica en proyector.

### Requirement: Notas del Orador y Cobertura Pedagógica
Cada diapositiva del slide deck SHALL incluir un guion pedagógico exhaustivo en su objeto `notes_slide`.

#### Scenario: Estructura estándar de notas docentes
- **WHEN** se consulta el panel de notas en PowerPoint o se extrae el guion
- **THEN** la nota contiene las secciones: *Objetivo Pedagógico*, *Guion y Explicación Técnica* (mín. 120 palabras con internals y advertencias), *Puntos de Interacción / Preguntas* e *Instrucciones de Laboratorio* (en slides prácticas).

#### Scenario: Cobertura del cien por cien
- **WHEN** se analiza el slide deck completo de 78 diapositivas
- **THEN** ninguna diapositiva carece de notas del orador estructuradas.

### Requirement: Distribución Curricular de 25 Horas
El contenido del curso SHALL estructurarse en 4 módulos técnicos más un módulo introductorio conforme al temario oficial.

#### Scenario: Módulo 0 (Bienvenida y Entorno)
- **WHEN** se inicia el curso (~0.5 h)
- **THEN** se presenta el mapa curricular y se prepara el entorno de trabajo con Docker y herramientas cliente (SSMS y VS Code MSSQL).

#### Scenario: Módulo 1 (Fundamentos y Arquitectura. Licenciamiento)
- **WHEN** se imparte el bloque de arquitectura (~5.5 h)
- **THEN** se aborda el Relational Engine, Storage Engine, Buffer Pool, páginas de 8 KB, extensiones, ficheros MDF/NDF/LDF, WAL, VLFs, bases del sistema, licenciamiento (Core vs CAL) y el Laboratorio 1.

#### Scenario: Módulo 2 (Gestión y Seguridad)
- **WHEN** se imparte el bloque de gestión y seguridad (~7.0 h)
- **THEN** se cubren restricciones DDL, vistas indexadas, procedimientos almacenados, DML avanzado (JOINs físicos y Window Functions), modelo jerárquico de permisos (Logins, Users, Schemas, Roles) y Laboratorios 2A/2B.

#### Scenario: Módulo 3 (Optimización y Alta Disponibilidad)
- **WHEN** se imparte el bloque de rendimiento y resiliencia (~6.0 h)
- **THEN** se cubren índices Clustered/Non-Clustered (B-Tree), estadísticas, lectura de planes de ejecución (Seek vs Scan vs Lookup), diagnóstico con DMVs, métricas RTO/RPO, Always On Availability Groups y Laboratorios 3.1/3.2.

#### Scenario: Módulo 4 (Mantenimiento, Backups y Caso Integrador)
- **WHEN** se imparte el bloque de continuidad y buenas prácticas (~6.0 h)
- **THEN** se cubren modelos de recuperación, backups Full/Diff/Log, Point-in-Time Restore (`STOPAT`), `DBCC CHECKDB`, automatización con SQL Server Agent, resolución de incidencias en producción, Laboratorio 4 y el Caso Práctico Integrador final.

### Requirement: Entregables Complementarios
El repositorio SHALL proporcionar tanto el slide deck editable como los documentos exportados para lectura offline.

#### Scenario: Disponibilidad de formatos
- **WHEN** el alumno o docente accede al material
- **THEN** dispone de `curso_sql_server_dba_25h.pptx` (presentación editable), `curso_sql_server_dba_25h.pdf` (documento para lectura o impresión) y `GUIA_DEL_DOCENTE.md` (manual de 230K caracteres en Markdown).
