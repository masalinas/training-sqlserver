# Caso Práctico: El pánico al Scan y el falso Seek

## El Contexto

Eres el DBA responsable de revisar las consultas de un equipo de desarrollo antes de pasarlas a producción. Un desarrollador junior te trae dos consultas que le preocupan tras analizar sus planes de ejecución gráficos en SQL Server Management Studio:

**Consulta A:** 
Ejecuta un `SELECT * FROM dbo.Configuracion_Paises WHERE Continente = 'Europa';`. La tabla tiene apenas 200 filas (ocupa 2 páginas de memoria). El desarrollador está asustado porque el plan muestra un operador **Clustered Index Scan** enorme. Quiere crear un índice nuevo inmediatamente porque "le han enseñado que los Scans son siempre malos".

**Consulta B:**
Ejecuta un `SELECT Id, Fecha, Total, Estado FROM dbo.Ventas WHERE ClienteId = 1500;`. La tabla de ventas tiene 50 millones de registros. El desarrollador está muy orgulloso porque el plan de ejecución empieza con un icono de **Index Seek** (usando el índice que él creó sobre `ClienteId`), pero no entiende por qué la consulta tarda 30 segundos en ejecutarse. Al mirar el plan completo, ves que justo al lado del Seek hay un operador **Key Lookup**.

## Misión del Alumno

Apoyándote en la diapositiva "Planes: Scan, Seek y Key Lookup", audita ambas consultas y educa al desarrollador:

1. Basándote en el recuadro "Scan" y el tip inferior de la diapositiva, ¿qué le responderías al desarrollador sobre su pánico al "Scan" en la Consulta A? ¿Debería crear un índice?

2. Explica la diferencia teórica básica entre cómo un "Scan" y un "Seek" buscan los datos físicamente.

3. En la Consulta B, el desarrollador cree que por tener un "Seek" la consulta ya está optimizada. Basándote en la columna "Key Lookup", explícale por qué el rendimiento es tan malo. ¿Qué está ocurriendo por detrás con el disco?

4. ¿Cuál es la solución exacta que recomienda la diapositiva para eliminar el Key Lookup de la Consulta B?