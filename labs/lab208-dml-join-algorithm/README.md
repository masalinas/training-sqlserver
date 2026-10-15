## Introducción

Existen varios algoritmos en la db que marcan el rendimiento diferente entre el código lógico y la ejecución física. Cuando un desarrollador escribe un `INNER JOIN` en su código T-SQL, el motor de SQL Server puede elegir entre tres algoritmos físicos distintos (Nested Loops, Merge Join o Hash Match) para realizar ese cruce, dependiendo del volumen de datos y de los índices existentes.

1. Nested Loops (Bucles Anidados)

Es el algoritmo de la "fuerza bruta" ágil. Funciona tomando la primera tabla y, por cada fila de esta tabla externa, realiza una búsqueda completa en la tabla interna.   

- Cuándo se elige: Es típico en entornos transaccionales (OLTP), y su escenario ideal es cuando la tabla externa es muy pequeña y la tabla interna tiene un índice (Index Seek) que permite búsquedas instantáneas.
- Ejemplo práctico: Un usuario entra a la web y quiere ver sus compras. La consulta busca al Cliente ID = 4 (una sola fila externa). Luego, el motor hace un "bucle" y va a la tabla Pedido buscando a través del índice todos los pedidos donde ClienteID = 4 (Index Seek). Es rapidísimo para consultas puntuales.

2. Merge Join (Combinación de Mezcla)

Es el algoritmo de la "cremallera". Recorre simultáneamente dos entradas de datos que ya están previamente ordenadas. Para funcionar, exige obligatoriamente que la condición del cruce sea de igualdad y que ambas tablas estén ordenadas (ya sea por un índice físico o porque el motor ejecutó un operador Sort antes)

- Cuándo se elige: Es extremadamente eficiente para cruzar grandes volúmenes de datos.   
- Ejemplo práctico: Quieres sacar un informe mensual listando a todos tus millones de clientes junto con sus millones de pedidos. Como ambas tablas tienen un índice agrupado (Clustered Index) por ClienteID, SQL Server simplemente las pone en paralelo y las va leyendo a la vez, emparejando los IDs consecutivamente como si cerrara una cremallera (1 con 1, 2 con 2, 3 con 3...). No tiene que rebuscar; solo avanza hacia abajo.

3. Hash Match (Coincidencia de Hash)

Es el algoritmo "pesado". El motor toma la tabla más pequeña de las dos y construye con ella una tabla hash en la memoria RAM. Una vez construida, escanea la tabla grande fila por fila y calcula su hash para ver si hace "match" (coincide) con algo en la memoria:

- Cuándo se elige: Se utiliza cuando el optimizador no tiene más remedio porque no se exigen índices ni los datos están ordenados.
- El peligro (Atención DBA): Al construir esaestructura temporal, consume mucha memoria RAM (memory grant), y si los datos son demasiado grandes para la memoria asignada, el proceso "derrama" hacia el disco duro (hacia la base de datos tempdb). Esto hunde drásticamente el rendimiento.
- Ejemplo práctico: Un analista de Power BI hace un cruce masivo entre una tabla de VentasHistoricas de 50 millones de filas y un archivo temporal importado de Excel sin ningún tipo de clave primaria ni índice. El motor tendrá que usar la RAM para intentar cuadrarlos.
