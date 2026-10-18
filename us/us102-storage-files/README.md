# Caso Práctico: Los "micro-cortes" de fin de mes

## El Contexto

Eres el arquitecto de bases de datos de una cadena de supermercados. El sistema de ventas (`VentasDB`) tiene un tamaño actual de 500 GB. La infraestructura de discos es moderna y rápida, pero la aplicación de punto de venta experimenta "congelaciones" severas (timeouts) de hasta 2 minutos cada vez que hay picos masivos de ventas a fin de mes.

Al revisar la configuración de la base de datos `VentasDB`, descubres lo siguiente:
* Toda la base de datos (catálogo del sistema y datos de usuario) está contenida en un único archivo `VentasDB.mdf` y un registro `VentasDB_log.ldf`.
* El crecimiento automático (Autogrowth) del archivo de datos está configurado al **10%**.
* Al revisar las políticas de seguridad de Windows del servidor, notas que la cuenta de servicio de SQL Server **no** tiene asignado el privilegio "Perform volume maintenance tasks".

## Misión del Alumno

Basándote en los conceptos de la diapositiva "Ficheros de datos y de log", audita este entorno y responde:

1. ¿Por qué la aplicación se "congela" durante casi dos minutos en los picos de ventas masivos? Explica el problema matemático del crecimiento configurado.
2. ¿Qué configuración a nivel de sistema operativo está agravando este tiempo de espera al momento de crecer y cómo lo solucionarías (IFI)?
3. A nivel de arquitectura de archivos, ¿qué recomiendas hacer con los archivos `.mdf` y `.ndf` para mejorar el diseño y el rendimiento futuro?