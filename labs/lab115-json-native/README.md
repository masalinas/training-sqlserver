## Introducción

Tipo JSON nativo: Desde 2016, SQL Server procesaba JSON, pero se almacenaba como texto plano en columnas NVARCHAR. El nuevo tipo nativo JSON guarda los documentos en un formato binario optimizado para el motor, lo que elimina la sobrecarga de análisis (parsing) en tiempo de ejecución y acelera drásticamente las consultas sobre estructuras jerárquicas y esquemas flexibles.