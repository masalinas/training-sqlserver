## Solución Técnica

### 1. El problema del Heap y los Forwarded Records

La tabla actual es un Heap (no tiene orden físico). Cuando se hace un `UPDATE` y una fila crece tanto que ya no cabe en su página de datos original (de 8 KB), SQL Server no puede simplemente empujar el resto de filas hacia abajo. 
Lo que hace es mover la fila entera a una página nueva y dejar un puntero en la página original que apunta a la nueva ubicación. Este fenómeno se llama **Forwarded Records** (registros reenviados). Al leer la tabla (Table Scan), el disco duro tiene que estar saltando constantemente entre páginas para seguir esos punteros, destrozando el rendimiento de entrada/salida (I/O).

### 2. Evaluando el Email como Clustered Index

La propuesta del desarrollador de usar el `EmailUsuario` suspende en casi todos los requisitos de una clave ideal:

* **Estrecha (Suspende):** Ocupa 150 bytes. Es enorme comparada con un número entero (4 bytes).
* **Única (Suspende/Depende):** Un usuario puede tener múltiples interacciones, por lo que el email se repetirá y SQL Server tendrá que añadir un "uniquifier" oculto, engordando más la clave.
* **Estática (Suspende):** Los usuarios cambian de email. Si actualizas un Clustered Index, la fila entera debe cambiar de ubicación física.
* **Creciente (Suspende):** Los correos no entran en orden alfabético. Al insertar "ana@..." después de "zack@...", SQL Server tendrá que meter la fila de Ana a la fuerza en medio de páginas ya llenas, provocando **Page Splits** (división de páginas) y una fragmentación masiva.

### 3. La trampa del engorde (El tip de la Regla Práctica)

El mayor peligro, como advierte la diapositiva, es que **la clave del Clustered Index se copia internamente en las hojas de todos los índices No Clustered** para que estos sepan cómo encontrar la fila real.
Si usas un `VARCHAR(150)` como clave, y luego creas 5 índices secundarios para acelerar otras búsquedas (por fecha, por comercial, etc.), esos 150 bytes se duplicarán 5 veces por cada fila. La base de datos engordará gigabytes innecesariamente, expulsando datos útiles de la memoria RAM (Buffer Pool).

### 4. La solución arquitectónica (OLTP)

La solución óptima es rechazar el email como clave. Se debe aplicar la regla práctica: añadir una nueva columna sintética que sea **`INT IDENTITY`** (Autonumérica) y designarla como Clave Primaria (Clustered Index). 

Al ser un número secuencial (1, 2, 3...), siempre es **estrecho** (4 bytes), **único**, **estático** (nunca cambia) y estrictamente **creciente** (los nuevos registros se añaden limpios al final, evitando los *Page Splits*). Para solucionar la necesidad del comercial, simplemente se crea un índice secundario (No Clustered) normal sobre la columna `EmailUsuario`.