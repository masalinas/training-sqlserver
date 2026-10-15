## Introducción

SQL Server Service Broker es un marco de mensajería asíncrona y encolamiento de tareas integrado nativamente en el motor de la base de datos. Permite a las bases de datos enviar y recibir mensajes garantizando su entrega, lo que resulta fundamental para crear aplicaciones distribuidas y escalables directamente desde T-SQL.

Principales características y casos de uso:

- Procesamiento asíncrono: Permite que una transacción (como un trigger o un procedimiento almacenado) coloque una tarea en una cola para que se ejecute en segundo plano, evitando bloquear al usuario mientras se procesan operaciones pesadas.
- Entrega garantizada: Asegura que los mensajes se entreguen exactamente una vez y en el orden correcto. Como las colas se almacenan físicamente en disco dentro de la base de datos, los mensajes sobreviven a reinicios del servidor o caídas del sistema.
- Desacoplamiento arquitectónico: Facilita la comunicación entre distintas bases de datos o instancias de SQL Server sin exigir que el servidor receptor esté en línea en el momento exacto en que se emite el mensaje.

Al desplegar la carpeta Service Broker en SQL Server Management Studio, encontrarás los objetos que componen esta arquitectura:

- Tipos de mensaje (Message Types): Definen el formato y la validación de la información que se transmite (por ejemplo, validando que sea un XML bien formado).
- Contratos (Contracts): Acuerdos que establecen qué tipos de mensajes están permitidos en una conversación y qué parte (emisor o receptor) puede enviarlos.
- Colas (Queues): Estructuras de almacenamiento (similares a tablas ocultas) que retienen los mensajes recibidos hasta que la aplicación o servicio destino los procesa.
- Servicios (Services): Los puntos finales (endpoints) lógicos que enrutan los mensajes hacia una cola específica y aplican los contratos definidos.