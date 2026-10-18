# Caso Práctico: El colapso del historial y el índice engordado

## El Contexto

Eres el arquitecto de bases de datos de un CRM. Tienes una tabla llamada `HistorialInteracciones` que registra cada vez que un cliente contacta con la empresa. 

El desarrollador que la diseñó inicialmente lo hizo de forma rápida para cargar millones de registros antiguos, por lo que **no le puso Clave Primaria (Primary Key)**. Además, cuando un comercial añade notas a una interacción antigua, hace un `UPDATE` sobre un campo `VARCHAR` que originalmente estaba vacío y pasa a tener cientos de caracteres.

Últimamente, leer esta tabla es un suplicio y los discos están saturados. Un desarrollador senior analiza el problema y te hace la siguiente propuesta: *"El problema es que la tabla es un Heap. Para arreglarlo, pongámosle un Índice Clustered. Como casi siempre buscamos las interacciones por el correo del cliente, hagamos que la columna `EmailUsuario` (que es un `VARCHAR(150)`) sea la clave primaria y el Índice Clustered"*.

## Misión del Alumno

Apoyándote en la diapositiva "Heap vs Clustered Index", audita el problema actual y la solución propuesta:

1. ¿Por qué los `UPDATE` que hacen crecer el texto están saturando el disco en la tabla actual sin clave primaria? Nombra y explica el fenómeno físico que ocurre en un Heap.

2. Evalúa la propuesta del desarrollador senior de usar `EmailUsuario VARCHAR(150)` como Índice Clustered. Según las cuatro características de la "Clave ideal" de la diapositiva, ¿cuáles cumple y cuáles suspende estrepitosamente?

3. Lee con atención la "Regla práctica" del recuadro inferior. ¿Qué efecto catastrófico tendría elegir un `VARCHAR(150)` sobre el resto de índices (Non-Clustered) que crees en esa tabla en el futuro?

4. ¿Cuál es la solución arquitectónica correcta (el tipo de dato) para solucionar este problema en un entorno transaccional (OLTP)?