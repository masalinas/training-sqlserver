## Introducción

Ejecutar sql con y sin indice y con indice en la columna Total y con indice Total incluyendo todas las columnas.

En SQL Server, la elección del índice correcto es fundamental para optimizar el rendimiento de la base de datos. Las diferentes estructuras se adaptan a distintos tipos de cargas de trabajo, como transaccionales (OLTP) o analíticas (OLAP).

Esta tabla compara los diferentes indices que podemos utilizar en SQL Server

| Tipo de Índice | Estructura Física | Límite por Tabla | Uso Principal / Caso de Éxito | Impacto en Escritura (INSERT/UPDATE) |
| :--- | :--- | :--- | :--- | :--- |
| **Agrupado** *(Clustered)* | Ordena físicamente las filas de la tabla según la clave. | 1 por tabla. | Consultas de rango (`BETWEEN`), ordenamientos (`ORDER BY`) y búsquedas por Llave Primaria. | **Alto**. Si se inserta en desorden, puede causar fragmentación (división de páginas). |
| **No Agrupado** *(Non-Clustered)* | Estructura separada de los datos (árbol B+) que apunta a las filas físicas. | 999 por tabla. | Búsquedas exactas (`WHERE columna = 'valor'`) en columnas secundarias frecuentemente consultadas. | **Medio-Alto**. Cada índice adicional debe actualizarse con cada inserción o modificación. |
| **De Almacén de Columnas** *(Columnstore)* | Datos organizados en formato de columnas comprimidas en segmentos. | 1 si es agrupado. | Data Warehouses, analítica masiva y agregaciones (`SUM`, `AVG`) en millones de filas. | **Medio**. Diseñado para cargas de datos masivas (*bulk inserts*). |
| **Filtrado** *(Filtered)* | Índice no agrupado aplicado solo a un subconjunto de datos (cláusula `WHERE`). | Múltiples. | Columnas con muchos valores `NULL` o búsqueda de estados específicos (ej. `Donde Procesado = 0`). | **Bajo**. Solo se actualiza si la fila modificada cumple con la condición del filtro. |
| **De Cobertura** *(With INCLUDED columns)* | Índice no agrupado que añade columnas en el nivel hoja sin ser parte de la clave. | Múltiples. | Evita el paso adicional de búsqueda (*Key Lookup*) al responder la consulta usando solo el índice. | **Medio**. Aumenta ligeramente el espacio de almacenamiento del índice. |
| **Hash** | Estructura basada en cubos (*buckets*) mediante una función hash. | Múltiples. | Tablas optimizadas para memoria (*In-Memory OLTP*). Búsquedas puntuales e hiperrápidas. | **Bajo**. Operaciones extremadamente rápidas en memoria RAM. |


**Criterios clave para elegir el índice adecuado**

- Llaves Primarias: Por defecto, SQL Server crea un Índice Agrupado al definir una `PRIMARY KEY`. Asegúrate de que esta clave sea estrecha (preferiblemente numérica y secuencial, como un `IDENTITY`) para evitar penalizaciones de rendimiento.
- Estrategia de Indexación: Evita el error común de indexar todas las columnas. Esto sobrecarga el almacenamiento y degrada gravemente el rendimiento de los procesos de guardado y edición de datos.
- Consultas "SARGable": Para que SQL Server aproveche un índice (Index Seek), los filtros no deben contener funciones del lado izquierdo (ej. usa `WHERE Fecha >= '2026-01-01'` en lugar de `WHERE YEAR(Fecha) = 2026`).

## Ejemplo

- Ejecutar sql script `total-without-index.sql` desde SQL Server Management Studio sin indice alguno y ver el plan. Es el caso mas desfavorable pues no existe indice alguno contra la columna que utilizamos en el discrimante de la consulta.

- Ejecutar sql script `total-index.sql` desde SQL Server Management Studio habiendo creado un indice contra la columna Total, pero sin incluir las columnas que seguimos requiriendo en el select. Aunque podra parecer que este indice ayudaria a crear un mejor plan, la realidad es que al no incluir las columnas en el mismo, resulta mas caro ejecutar la sql con este indice, que hacer un Clustered Index Scan, es decir leer todas la tabla desde el punto estadistico, porque al buscar los pedidos mayores a 990, SQL Server ha calculado estadísticamente cuántas filas van a cumplir esa condición. Como el índice básico no tiene las columnas ClienteID, FechaPedido ni Estado, el motor tendría que hacer un "Key Lookup" (un salto a la tabla original) por cada una de esas filas. El optimizador de SQL Server es lo suficientemente inteligente para darse cuenta de que dar tantos cientos de saltos va a ser más lento que simplemente leer la tabla entera desde el principio.

Si te fijas en la parte superior de tu plan de ejecución, hay un texto de color verde que dice: Falta índice (impacto 74.0981): `CREATE NONCLUSTERED INDEX....` SQL Server te está pidiendo a gritos que crees exactamente el Covering Index (el índice con INCLUDE) que comentamos en el laboratorio anterior. El motor sabe que si le das las columnas incluidas, se ahorrará el 74% del esfuerzo

- Ejecutar sql script `total-covering-index.sql` desde SQL Server Management Studio, en este caso modificamos en anterior indice de la columna Total y le añadimos al mismo las columnas que recuperamos en la sql. Ahora si que utiliza el indice pues es el mas optimo estadisticamente, pues ya puede recuperar todos los datos desde el mismo sin tener que ir fila a fila recuperando ninguna columna. nos hemos ahorrado un 74%. Tambien veremos que las lecturas logicas han bajado bastante.

![Index Comparation](index_comparation.jpg)
