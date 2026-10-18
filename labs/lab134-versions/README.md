
## Introducción

Resumen de los principales topics de la versiones de SQL Server:

| Año | Característica / Tópico | Explicación en una línea |
| :--- | :--- | :--- |
| **2012** | Always On AG | Alta disponibilidad y recuperación ante desastres mediante grupos de disponibilidad de bases de datos. |
| | Columnstore | Formato de almacenamiento columnar diseñado para acelerar consultas analíticas masivas. |
| | Secuencias | Objetos independientes que generan valores numéricos secuenciales nativos (alternativa a IDENTITY). |
| **2014** | In-Memory OLTP | Motor optimizado en memoria RAM para transacciones ultrarrápidas sin bloqueos (*Hekaton*). |
| | Buffer Pool Ext. | Extensión de la memoria caché del motor utilizando almacenamiento en discos de estado sólido (SSD). |
| | Backup cifrado | Cifrado nativo de los archivos de copia de seguridad durante su creación para proteger los datos. |
| **2016** | Query Store | Registrador interno que captura automáticamente el historial de ejecución y rendimiento de las consultas. |
| | Always Encrypted | Cifrado de datos sensibles de extremo a extremo, ocultándolos incluso de los administradores (DBAs). |
| | Temporal tables | Tablas del sistema que guardan automáticamente el histórico completo de cambios de los datos en el tiempo. |
| **2017** | Linux y Docker | Compatibilidad nativa para ejecutar SQL Server en sistemas operativos Linux y contenedores Docker. |
| | Adaptive QP | Procesamiento de consultas que ajusta su estrategia de ejecución de forma dinámica sobre la marcha. |
| | Python | Integración nativa del lenguaje Python para ejecutar scripts de análisis avanzado y Machine Learning en la BD. |
| **2019** | Intelligent QP | Características que corrigen automáticamente problemas comunes de rendimiento en las consultas en tiempo de ejecución. |
| | ADR | Recuperación acelerada de bases de datos que agiliza el inicio tras un fallo, sin importar el tamaño de la transacción. |
| | UTF-8 | Soporte nativo de codificación UTF-8 para almacenar caracteres internacionales reduciendo el espacio en disco. |
| **2022** | Ledger | Tablas con tecnología de cadena de bloques (*blockchain*) para garantizar datos completamente inmutables y auditables. |
| | PSP optimization | Optimización automática de planes de ejecución cuando las consultas varían su rendimiento según los parámetros. |
| | Contained AG | Grupos de disponibilidad que sincronizan también objetos a nivel de instancia como inicios de sesión y jobs. |
| **2025** | Tipo vector (IA) | Soporte nativo de datos vectoriales para almacenar y buscar empotramientos (*embeddings*) de Inteligencia Artificial. |
| | Tipo json | Tipo de datos dedicado para almacenar, validar y consultar documentos JSON de forma eficiente y nativa. |
| | Regex en T-SQL | Soporte nativo para buscar y manipular texto utilizando expresiones regulares complejas directamente en T-SQL. |
