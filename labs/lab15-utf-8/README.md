## Introducción

UTF-8: Soporte nativo de codificación UTF-8 a nivel de intercalación (collation). Permite almacenar caracteres Unicode directamente en columnas estándar VARCHAR o CHAR (en lugar de requerir el tipo NVARCHAR). Para bases de datos con texto mayoritariamente en alfabeto latino que solo necesitan Unicode ocasionalmente, esto reduce el espacio de almacenamiento casi a la mitad.

UTF-8 (Unicode Transformation Format - 8-bit) es un sistema de codificación de caracteres de longitud variable que traduce el estándar universal Unicode a secuencias de bytes comprensibles para los sistemas informáticos.

VARCHAR consume 1 byte por carácter (solo puede almacenar un idioma, definido por intercalación (collation) de la columna y NVARCHAR consume 2 bytes por carcacter, pero puede almacenar cualquier idioma, sin depender de la configuración regional del sistema operativo o de la base de datos

Si instalas SQL Server en un entorno en español, el valor por defecto suele ser Modern_Spanish_CI_AS. Desglosado, significa que el motor ordenará las letras usando el alfabeto español moderno (donde la 'ch' y la 'll' ya no son letras independientes en el ORDER BY), no distinguirá mayúsculas (CI), pero sí será estricto con las tildes (AS).


## Impacto en la arquitectura (El caso de Always Encrypted) 

Cuando creaste la tabla de ejemplo para probar Always Encrypted, la columna NumeroSeguridadSocial exigía el collation Latin1_General_BIN2

Ejemplo del uso de collation en T-SQL:

- En un entorno CI_AS, esto devuelve 'Admin', 'ADMIN' o 'admin'
`SELECT * FROM Usuarios WHERE Username = 'admin';`
      
- Forzamos la regla para que la base de datos busque la coincidencia exacta (CS)
`SELECT * FROM Usuarios WHERE Username = 'admin' COLLATE Latin1_General_CS_AS;`