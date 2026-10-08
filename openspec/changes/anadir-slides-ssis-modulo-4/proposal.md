# Propuesta: Inserción de Bloque SSIS en Módulo 4 y Actualización de Guía Docente

## Why

El curso de Administración de SQL Server (25 h) requiere cubrir el servicio oficial de integración de datos de Microsoft, SQL Server Integration Services (SSIS), desde la perspectiva operativa y de gestión del DBA. Se necesita capacitar al alumnado en la instalación del motor y herramientas visuales modernas, el diseño de un pipeline ETL elemental de ingesta masiva (CSV a tabla relacional) y su despliegue/automatización desasistida mediante SQL Server Agent y el catálogo SSISDB, respetando de forma estricta las 25 horas lectivas totales y conservando intactas todas las diapositivas ya existentes.

## What Changes

- **Inserción de 3 nuevas diapositivas en el Módulo 4**: Se incorporan inmediatamente después de la diapositiva 69 (*Mantenimiento automatizado con Agent*), pasando el slide deck de 78 a 81 diapositivas:
  - *Slide 70*: SSIS: Arquitectura e Instalación del Servicio y Entorno (Motor en servidor, `MsDtsSrvr`, CLR, SSISDB vs. Visual Studio con extensión SSIS Projects).
  - *Slide 71*: Pipeline ETL Práctico: Ingesta de CSV a SQL Server (Data Flow Task, Flat File Source, Data Conversion de tipos y OLE DB Destination con Fast Load).
  - *Slide 72*: Despliegue en SSISDB, Proxies de Seguridad y Automatización con Agent (Proyectos `.ispac`, Step de Agent, Credenciales y Proxies para ejecución segura sin `sysadmin`).
- **Preservación absoluta de diapositivas existentes**: Ninguna de las 78 diapositivas existentes sufre modificaciones en su contenido, diseño, tarjetas o textos; las diapositivas posteriores a la 69 se desplazan automáticamente tres posiciones.
- **Ajuste y cuadre de tiempos a 25 horas exactas**: El Módulo 4 absorbe el bloque de SSIS (asignando ~40 minutos entre explicación y demostración) dentro de sus 6,0 horas previstas, manteniendo la suma total del curso en 25,0 horas lectivas exactas.
- **Refactorización de la Guía del Docente (`GUIA_DEL_DOCENTE.md`)**: Actualización de [`presentacion/src/extract_guide.py`](file:///home/miguel/git/training-sqlserver/presentacion/src/extract_guide.py) para registrar el nuevo rango del Módulo 4 (61 a 81) y regeneración de la guía con los guiones técnicos, preguntas de interacción e instrucciones de demo de las nuevas diapositivas.
- **Consistencia de diseño visual**: Aplicación estricta de la paleta oficial (Navy `#0B2545`, Cobalt `#134074`, Coral `#D95D39`, White/Line), tipografías (Calibri y Consolas) y componentes vectoriales nativos de [`layout_helpers.js`](file:///home/miguel/git/training-sqlserver/presentacion/src/layout_helpers.js).

## Capabilities

### New Capabilities
*(Ninguna; se amplía la capacidad existente del material docente).*

### Modified Capabilities
- `presentacion-curso-sql-server-dba`: Actualiza los requisitos de cobertura de diapositivas (de 78 a 81 diapositivas) y amplía el escenario del Módulo 4 para incluir la cobertura de instalación del servicio SSIS, diseño del pipeline ETL con CSV y automatización con SSISDB y SQL Agent.

## Impact

- Código fuente de la presentación: [`presentacion/src/m4.js`](file:///home/miguel/git/training-sqlserver/presentacion/src/m4.js).
- Script de extracción de guía docente: [`presentacion/src/extract_guide.py`](file:///home/miguel/git/training-sqlserver/presentacion/src/extract_guide.py).
- Entregables generados: [`curso_sql_server_dba_25h.pptx`](file:///home/miguel/git/training-sqlserver/curso_sql_server_dba_25h.pptx) y [`GUIA_DEL_DOCENTE.md`](file:///home/miguel/git/training-sqlserver/GUIA_DEL_DOCENTE.md).
- Especificación OpenSpec: [`openspec/specs/presentacion-curso-sql-server-dba/spec.md`](file:///home/miguel/git/training-sqlserver/openspec/specs/presentacion-curso-sql-server-dba/spec.md).
