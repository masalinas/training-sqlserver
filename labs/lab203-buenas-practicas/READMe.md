## Introducción


- Restricciones WITH NOCHECK\

  Cuando agregas una restricción nueva a una tabla que ya tiene millones de filas (por ejemplo, una regla que dice que la columna Edad debe ser mayor a 18), tienes dos opciones:

  - WITH CHECK (Por defecto): SQL Server bloquea la tabla y revisa todas las filas existentes. Si encuentra un solo menor de edad, da error y no aplica la regla.
  - WITH NOCHECK: SQL Server aplica la regla solo para los datos nuevos que se inserten a partir de ese momento. No pierde tiempo revisando el pasado.

  Al hacer esto último, la restricción queda marcada internamente en el sistema como is_not_trusted (no confiable). SQL Server sabe que la regla está activa, pero asume que en el pasado podría haber datos que la rompen.


  Ejemplo práctico:

  Imagina que creaste la regla Edad > 18 con WITH NOCHECK (no confiable). Luego ejecutas esta consulta:

  ```sql
  SELECT * FROM Empleados WHERE Edad = 10;
  ```

  Usa el código con precaución:

  - Si la restricción fuera confiable: El optimizador diría: "Sé al 100% que es imposible que existan menores de 18 en esta tabla porque la regla es de total confianza. Ni siquiera voy a abrir el disco duro a buscar." Te devuelve 0 resultados de forma instantánea (0 ms de tiempo de lectura).
  - Como usaste WITH NOCHECK (no confiable): El optimizador dice: "La regla dice que no entren menores, pero como no revisaron el pasado, puede que haya algún registro viejo con edad 10." En consecuencia, SQL Server se ve obligado a leer la tabla e indexar el disco para buscar, desperdiciando recursos y tiempo de procesamiento.

  **¿Por qué el optimizador deja de aprovecharla?**

  El optimizador es el cerebro de SQL Server. Cuando tú le pides datos, él busca la forma más rápida y eficiente de entregártelos.
  Si una restricción es confiable (TRUSTED), el optimizador la usa para ahorrar trabajo mediante una técnica llamada Contradiction Detection (Detección de contradicciones).


- GUID aleatorio como clustered\

  Si usas un identificador único aleatorio (NEWID()) como la clave principal que ordena físicamente tu tabla (un índice clustered), obligarás a SQL Server a romper las páginas de memoria, desordenar el disco duro y ralentizar drásticamente las consultas.

  Un índice Clustered define el orden físico en el que se guardan los datos en el disco duro, exactamente como un archivador de oficina ordenado alfabéticamente o por números correlativos.

  **Caso 1: El buen empleado (IDENTITY o números secuenciales)**

  Cuando usas IDENTITY(1,1), las filas nuevas llegan numeradas como el 1, 2, 3, 4...
  - SQL Server simplemente las va metiendo al final de la última carpeta del archivador.
  - Es un proceso limpio, rápido y ordenado.

  **Caso 2: El empleado caótico (NEWID() / GUID Aleatorio)**

  NEWID() genera un código alfanumérico gigante totalmente al azar (ej: 6F9619FF-8B86-D011-B42D-00C04FC964FF).
  Si este código es tu índice clustered, SQL Server tiene que guardarlo en su sitio alfabético exacto.
  - Imagina que llega un nuevo registro cuya letra inicial va en medio de una carpeta que ya está completamente llena de hojas.
  - Como físicamente no cabe, el motor tiene que sacar la mitad de las hojas de esa carpeta, meterlas en una carpeta nueva vacía y colocar el nuevo registro en medio.
  - A este proceso técnico de romper una página llena para abrir espacio a la fuerza se le llama Page Split (División de página).

  **¿Cuáles son las consecuencias de los "Page Splits"?**

  1. Fragmentación extrema: Tu base de datos se vuelve un caos físico. La información de una misma tabla queda esparcida por todo el disco.
  2. Alto uso de disco (I/O) y CPU: Escribir un solo registro obliga al servidor a mover y reescribir datos antiguos, multiplicando el esfuerzo del hardware.
  3. Consultas lentas: Cuando quieras leer la tabla, SQL Server tardará mucho más porque tiene que saltar de un sitio a otro para juntar los datos desordenados.

- VARCHAR mezclado con NVARCHAR

  Significa que si buscas un texto dentro de una columna de tipo NVARCHAR (Unicode), pero en tu consulta de SQL o desde tu código de programación envías el texto como VARCHAR (o viceversa), SQL Server se ve obligado a traducir el tipo de datos fila por fila en toda la tabla, ignorando por completo tus índices.\

  Un Index Seek es la operación más rápida de SQL Server. Es cuando el motor usa un índice como si fuera el índice de un libro físico: va directo a la página exacta y encuentra el dato en microsegundos.

  ### 2. ¿Por qué impide el "Index Seek" y dispara la CPU?

  Un **Index Seek** es la operación más rápida de SQL Server. Es cuando el motor usa un índice como si fuera el índice de un libro físico: va directo a la página exacta y encuentra el dato en microsegundos.

  El problema es el **dónde** ocurre la conversión:

  #### ❌ El escenario del desastre (`Index Scan`)

  Imagina que tienes una tabla con 10 millones de clientes y la columna `DocumentoIdentidad` es **`NVARCHAR`** y tiene un índice. Si tú ejecutas esto:

  ```sql
  -- El texto 'A123' se interpreta por defecto como VARCHAR
  SELECT * FROM Clientes WHERE DocumentoIdentidad = 'A123';
  ```

  Como mezclaste `NVARCHAR` (la columna) con `VARCHAR` (tu valor `'A123'`), SQL Server tiene que transformar los datos para poder compararlos. Pero debido a sus reglas internas, **no convierte tu valor de búsqueda; ¡convierte la columna entera!**

  El motor termina haciendo esto mentalmente:

  ```sql
  SELECT * FROM Clientes WHERE CONVERT(NVARCHAR, DocumentoIdentidad) = 'A123';
  ```

  Al aplicar una función de conversión sobre la columna, **el índice se vuelve completamente inútil**. SQL Server ya no puede hacer un *Index Seek* directo. Ahora tiene que hacer un **Index Scan**: leer las 10 millones de filas una por una, procesar la conversión en la CPU para cada fila y verificar si coincide. Esto consume gigabytes de memoria y satura la CPU.
