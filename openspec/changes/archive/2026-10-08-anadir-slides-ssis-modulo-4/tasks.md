# Tasks

## 1. Implementación de Diapositivas de SSIS en Módulo 4

- [x] 1.1 Diseñar e insertar la Diapositiva 70 (SSIS: Arquitectura e Instalación del Servicio y Entorno de Desarrollo) en `presentacion/src/m4.js` tras la diapo 69, con maquetación vectorial y notas pedagógicas exhaustivas
- [x] 1.2 Diseñar e insertar la Diapositiva 71 (Pipeline ETL Práctico: Ingesta de CSV a SQL Server mediante Data Flow Task, conversiones en memoria y OLE DB Destination con Fast Load) en `presentacion/src/m4.js`
- [x] 1.3 Diseñar e insertar la Diapositiva 72 (Despliegue en SSISDB, Proxies de Seguridad y Automatización con SQL Server Agent) en `presentacion/src/m4.js`
- [x] 1.4 Verificar mediante `git diff` que ninguna de las 78 diapositivas originales ha sido modificada en su contenido o maquetación

## 2. Compilación del Slide Deck y Verificación Visual

- [x] 2.1 Compilar la presentación con `node presentacion/src/build.js` y verificar que finaliza con éxito emitiendo exactamente 81 diapositivas sin advertencias de maquetación
- [x] 2.2 Verificar que el entregable `curso_sql_server_dba_25h.pptx` contiene las 81 diapositivas en formato 16:9 con la paleta de colores corporativa (Navy/Cobalt/Coral) y notas de orador integradas

## 3. Refactorización y Regeneración de la Guía del Docente

- [x] 3.1 Actualizar `presentacion/src/extract_guide.py` para reflejar el total de 81 diapositivas y el rango 61–81 para el Módulo 4 en la tabla resumen y metadatos
- [x] 3.2 Ejecutar `python3 presentacion/src/extract_guide.py` y validar que `GUIA_DEL_DOCENTE.md` se genera con el contenido y guion técnico completo de las 81 diapositivas
