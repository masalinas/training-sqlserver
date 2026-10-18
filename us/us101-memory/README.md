# Caso Práctico: El colapso del sistema operativo

## El Contexto

Un administrador de sistemas de tu empresa te llama de urgencia. El servidor de producción de SQL Server (que cuenta con 16 GB de memoria RAM en total) está extremadamente lento. Sin embargo, la lentitud no es solo en las consultas, sino en el propio sistema operativo; incluso intentar abrir el explorador de archivos o una terminal es casi imposible.

Al lograr abrir el monitor de recursos, el administrador nota que el proceso de SQL Server está consumiendo el 98% de la memoria RAM disponible. Alarmado, te pregunta si el motor tiene una "fuga de memoria" (memory leak) y te sugiere reiniciar el servidor inmediatamente.

## Misión del Alumno

Apoyándote en los conceptos de la transparencia "Buffer Pool y gestión de memoria", responde a las siguientes cuestiones:
1. Explica al administrador de sistemas por qué SQL Server está consumiendo tanta RAM y por qué **no** es un error ni una fuga de memoria.
2. ¿Qué roles juegan el **Checkpoint** y el **Lazy Writer** en este ecosistema de memoria?
3. Proporciona el script T-SQL exacto para solucionar este problema de raíz, limitando la memoria de SQL Server a 12 GB (12288 MB) para dejar respirar al sistema operativo.