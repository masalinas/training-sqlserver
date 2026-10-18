## Solución Técnica

### 1. El mito del COMMIT y el protocolo WAL (Write-Ahead Logging)

El desarrollador está equivocado respecto a cómo SQL Server consolida los datos. El motor no escribe directamente en el archivo de datos (`.mdf`) durante una transacción por motivos de rendimiento. Utiliza el protocolo WAL siguiendo estos 4 pasos:

1.  **Modificación en memoria:** La página se modifica primero en la memoria RAM (Buffer Pool) y se marca como "sucia".
2.  **Log Buffer:** Se registra la operación (con su número de secuencia LSN) en una caché temporal de log.
3.  **COMMIT (Flush al disco):** Al hacer COMMIT, SQL Server fuerza la escritura de ese bloque de log al archivo físico de registro (`.ldf`). En ese preciso instante, el cliente recibe el "OK" confirmando que su transacción es duradera.
4.  **Checkpoint diferido:** Mucho más tarde, el proceso Checkpoint pasará de forma asíncrona para volcar las páginas "sucias" de la memoria RAM al archivo de datos final (`.mdf`).

### 2. El cuello de botella en el arranque: Fragmentación de VLFs

Durante un reinicio (o tras una caída), SQL Server debe leer el archivo de log completo para asegurar la consistencia (rehacer transacciones confirmadas y deshacer las incompletas). 

El archivo físico `.ldf` se divide internamente en porciones más pequeñas llamadas **VLFs (Virtual Log Files)**. Cada vez que el archivo crece automáticamente, se crean nuevos VLFs. 
Al tener el *autogrowth* configurado en incrementos minúsculos de 1 MB a lo largo de los años, el motor creó **más de 15.000 VLFs**. Leer y procesar miles de VLFs diminutos requiere un esfuerzo masivo de procesamiento y saltos de lectura, lo que ralentizó la fase de recuperación del motor a 45 minutos.

### 3. La solución arquitectónica

Para resolver esta "fragmentación" del log de transacciones y evitar tiempos de recuperación lentos, se deben seguir dos pasos:

*   **Saneamiento inmediato:** En una ventana de mantenimiento, realizar una copia de seguridad del log (para vaciarlo), encoger (Shrink) el archivo de log para eliminar esos miles de VLFs diminutos, y luego volver a expandir el archivo de golpe a un tamaño final adecuado (por ejemplo, 10 GB).
*   **Prevención (La Regla de Oro):** Dimensionar siempre el archivo `.ldf` a su tamaño máximo estimado desde el primer día. Además, cambiar el *Autogrowth* de 1 MB a un valor fijo grande (por ejemplo, 500 MB o 1 GB) para que, si alguna vez necesita crecer, cree pocos VLFs pero de gran tamaño.