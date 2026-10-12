## Introducción

Este es un ejemplo de como crear una base de datos definiendo la distribucion, tamaño y crecimiento de los ficheros que conforman los archivos primarios o de administracion frente a los archivos asociados a recursos externos a la administracion de la base de datos

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