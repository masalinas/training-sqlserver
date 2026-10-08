# Spec Delta: Inserción de Bloque SSIS en Módulo 4 y Actualización Curricular

## MODIFIED Requirements

### Requirement: Notas del Orador y Cobertura Pedagógica
Cada diapositiva del slide deck SHALL incluir un guion pedagógico exhaustivo en su objeto `notes_slide`.

#### Scenario: Estructura estándar de notas docentes
- **WHEN** se consulta el panel de notas en PowerPoint o se extrae el guion
- **THEN** la nota contiene las secciones: *Objetivo Pedagógico*, *Guion y Explicación Técnica* (mín. 120 palabras con internals y advertencias), *Puntos de Interacción / Preguntas* e *Instrucciones de Laboratorio* (en slides prácticas).

#### Scenario: Cobertura del cien por cien
- **WHEN** se analiza el slide deck completo de 81 diapositivas
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
- **THEN** se cubren modelos de recuperación, backups Full/Diff/Log, Point-in-Time Restore (`STOPAT`), `DBCC CHECKDB`, automatización con SQL Server Agent, arquitectura e instalación de SQL Server Integration Services (motor y Visual Studio), pipeline ETL práctico de ingesta masiva desde CSV a SQL Server (Data Flow y Fast Load), catálogo SSISDB y proxies de seguridad, resolución de incidencias en producción, Laboratorio 4 y el Caso Práctico Integrador final.
