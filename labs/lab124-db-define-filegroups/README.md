## Introducción

Este es un ejemplo de como crear una base de datos definiendo la distribucion, tamaño y crecimiento de los ficheros que conforman los archivos primarios o de administracion frente a los archivos asociados a recursos externos a la administracion de la base de datos

## Buena practicas

- **Distribución en Filegroup**

  - Aislamiento del sistema: Mantén el filegroup PRIMARY exclusivamente para el catálogo del sistema y los metadatos (el archivo .mdf). Ningún objeto de usuario debe crearse aquí.
  - Datos de usuario predeterminados: Crea un filegroup secundario (ej. `USER_DATA`) y configúralo como el predeterminado (`DEFAULT`). Esto asegura que todas las tablas nuevas vayan a los archivos .ndf aislados del sistema.
  - Separación de índices: En bases de datos con alta carga transaccional, sitúa los índices no agrupados en un filegroup dedicado y en discos físicos distintos para paralelizar las operaciones de entrada/salida (I/O).
  - Particionamiento y archivo: Utiliza filegroups separados para tablas históricas o muy masivas. Esto permite realizar copias de seguridad parciales (Filegroup Backups) y marcar datos antiguos como de solo lectura (`READ_ONLY`), acelerando los mantenimientos.

- **Cantidad de Ficheros Físicos**

  - Archivos de datos (.ndf): Para cargas estándar, un archivo por filegroup de usuario es suficiente. En entornos de alta concurrencia donde existe contención de asignación en memoria (esperas de tipo evento `PAGELATCH`), se recomienda dividir el filegroup en múltiples archivos de datos. La regla general es crear un archivo por cada núcleo lógico de CPU (hasta un máximo de 8), ubicados en distintos LUNs/discos para maximizar el ancho de banda.
  - Archivo de registro (.ldf): Solo debe existir un archivo de log de transacciones por base de datos, ubicado en el almacenamiento más rápido disponible (SSD/NVMe en RAID 10). Dado que SQL Server escribe en el log de forma estrictamente secuencial, tener múltiples archivos .ldf no mejora el rendimiento y solo añade sobrecarga administrativa.
  - Simetría obligatoria: Si utilizas múltiples archivos .ndf en un mismo filegroup, todos deben tener exactamente el mismo tamaño inicial y la misma configuración de crecimiento. Esto permite que el algoritmo Proportional Fill de SQL Server distribuya las escrituras equitativamente entre todos los archivos.

  - **Pero que es el evento PAGELATCH**:
  Un `PAGELATCH` es un mecanismo de sincronización ligero y de corta duración utilizado por el motor de almacenamiento de SQL Server para proteger las páginas de datos que ya se encuentran en la memoria RAM (Buffer Pool) contra modificaciones simultáneas por múltiples hilos.

  Para garantizar la integridad física de los datos en memoria, SQL Server aplica los siguientes principios mediante estos cerrojos:

    - Funcionamiento básico: Cuando un proceso necesita leer o escribir en una página residente en memoria, solicita un "latch" (cerrojo). Si otro proceso ya posee un latch incompatible sobre esa misma página, el nuevo proceso debe esperar, lo que genera un tipo de espera `PAGELATCH_EX` (exclusivo para modificaciones) o `PAGELATCH_SH` (compartido para lecturas).
    - Diferencia fundamental con `PAGEIOLATCH`: Un evento `PAGELATCH` indica estrictamente contención de concurrencia en la memoria RAM; el subsistema de almacenamiento físico no es el cuello de botella. Por el contrario, un `PAGEIOLATCH` indica que el hilo está bloqueado esperando a que el disco duro termine de leer o escribir la página solicitada.
    - Contención en la "última página" (Hotspots): Es la causa de rendimiento más habitual asociada a este evento. Ocurre en tablas con alta concurrencia de inserción que utilizan una clave principal secuencial (como una columna `IDENTITY` o un `DATETIME`). Como los registros se ordenan secuencialmente, todos los hilos de inserción intentan escribir exactamente en la misma y última página física del índice al mismo tiempo, creando un embudo en memoria.
    - Contención en TempDB: Se presenta cuando hay una creación y destrucción masiva y simultánea de tablas temporales por parte de múltiples sesiones. Esto satura las páginas internas de asignación de espacio de SQL Server (páginas PFS, GAM y SGAM) dentro de la base de datos TempDB.
    - Estrategias de mitigación: Este problema no se soluciona añadiendo más RAM o discos más rápidos. Se mitiga modificando la arquitectura lógica: dividiendo TempDB en múltiples archivos de datos del mismo tamaño, cambiando la clave principal por un valor no secuencial (como un GUID o un hash), aplicando particionamiento de tablas, o activando la opción `OPTIMIZE_FOR_SEQUENTIAL_KEY` introducida en SQL Server 2019.

- **Políticas de Crecimiento (Autogrowth) y Asignación**

  - Pre-asignación inicial: Calcula el volumen de datos esperado para los próximos 12 a 24 meses y crea los archivos con ese tamaño desde el principio. El objetivo del autogrowth debe ser actuar como una red de seguridad ante imprevistos, no como el mecanismo principal de asignación de espacio.
  - Crecimiento en megabytes, nunca en porcentaje: Desactiva el crecimiento porcentual (ej. 10%). A medida que el archivo crece, un porcentaje exige expansiones cada vez mayores, lo que bloquea las transacciones de forma impredecible y puede provocar un timeout en la aplicación. Configura incrementos fijos y moderados (ej. 512 MB o 1024 MB).
  - Instant File Initialization (IFI): Es crítico habilitar el privilegio de Windows "Perform volume maintenance tasks" para la cuenta de servicio de SQL Server. Esto permite que el motor asigne espacio para los archivos de datos (.mdf y .ndf) instantáneamente sin tener que rellenar el disco con ceros, evitando la parálisis de la base de datos durante un evento de autogrowth. (Nota: IFI no aplica al log de transacciones, que siempre debe ser rellenado con ceros por diseño).
  - Límites máximos: Establece un límite máximo de crecimiento (MAXSIZE) para evitar que una transacción descontrolada (como un bucle infinito que llena el log) consuma el 100% del disco físico y derribe el servidor operativo.

## Ejemplo

Podemos ejecutar el ejemplo T-SQL `db-filegroups.sql` para crear un ejemplo de base de datos con estas configuraciones. Las lineas del mismo representan lo siguiente:

1. El archivo de datos principal (Grupo PRIMARY):

CREATE DATABASE Ventas ON PRIMARY -> Indica al motor que se va a crear una base de datos llamada Ventas y define el grupo de archivos primario (PRIMARY), que contendrá las tablas del sistema y los metadatos.
(NAME = Ventas_sys, -> Asigna el nombre lógico del archivo dentro de SQL Server. Se usará internamente para tareas de administración.
FILENAME = '/var/opt/mssql/data/Ventas.mdf', -> Define la ruta física y el nombre del archivo en el disco. La extensión .mdf (Master Data File) es para el archivo de datos principal.
SIZE = 64MB, -> Establece el tamaño inicial con el que se creará este archivo en el disco.
FILEGROWTH = 64MB) ->	Indica que cada vez que el archivo se llene, crecerá automáticamente en bloques de 64 megabytes.


2. El grupo de archivos secundario (FG_DATOS):

FILEGROUP FG_DATOS -> Crea un grupo de archivos secundario y personalizado llamado FG_DATOS. Se suele usar para almacenar tablas de datos de usuario separadas del sistema.
(NAME = Ventas_d1, FILENAME = '/var/opt/mssql/data/Ventas_d1.ndf',	-> Define el primer archivo secundario de este grupo. La extensión .ndf (Next Data File) denota un archivo de datos secundario.
SIZE = 256MB, FILEGROWTH = 128MB),-> Asigna un tamaño inicial de 256 MB y un crecimiento de 128 MB para el archivo Ventas_d1.
(NAME = Ventas_d2, FILENAME = '/var/opt/mssql/data/Ventas_d2.ndf',	-> Define un segundo archivo de datos (Ventas_d2) dentro del mismo grupo FG_DATOS. SQL Server distribuirá la información entre ambos archivos para mejorar el rendimiento.
SIZE = 256MB, FILEGROWTH = 128MB) -> Asigna los mismos tamaños iniciales y de crecimiento que al archivo anterior.


3. El archivo del registro de transacciones (LOG ON):

LOG ON -> Inicia la sección para configurar el registro de transacciones (Transaction Log), que graba todas las modificaciones antes de escribirlas en los archivos de datos para garantizar la recuperación del sistema en caso de fallos.
(NAME = Ventas_log, FILENAME = '/var/opt/mssql/log/Ventas.ldf',	-> Define el nombre lógico y la ruta física del log. La extensión .ldf (Log Data File) es exclusiva para estos registros de transacciones.
SIZE = 128MB, FILEGROWTH = 64MB); -> Establece que el log iniciará con 128 MB y crecerá en porciones de 64 MB cuando se quede sin espacio. El punto y coma finaliza la instrucción.

GO -> Es un comando de las herramientas de SQL Server (como SSMS) para enviar el bloque de instrucciones anterior al motor de la base de datos para que lo ejecute

## Notas

Es recomendable utilizar Mb y no % a la hora de definir el FILEGROWTH. Por ejemplo, FILEGROWTH = 10%. Si el archivo mide 100 GB, el próximo crecimiento será de 10 GB (pasando a 110 GB), pero cuando mida 500 GB, ¡el siguiente crecimiento será de golpe de 50 GB! Esto puede ralentizar el servidor o agotar el disco inesperadamente, por lo que suele evitarse en archivos grandes.
