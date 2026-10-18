## Solución Técnica

### 1. El peligro del Autogrowth en porcentaje (%)

El problema principal de los bloqueos es el crecimiento automático mal configurado. Al estar definido en un 10%, cada vez que la base de datos de 500 GB se llena, SQL Server le pide a Windows que asigne **50 GB de golpe** de espacio adicional.

Mientras el sistema operativo reserva y prepara esos 50 GB en el disco duro, todas las transacciones de escritura (las ventas de los supermercados) se quedan en cola esperando, lo que provoca que la aplicación colapse por *timeout*. 

**Solución:** El *Autogrowth* nunca debe estar en porcentaje en bases de datos grandes. Debe configurarse en **MB fijos** (por ejemplo, crecimientos controlados de 500 MB o 1000 MB). Aún mejor: la buena práctica dicta pre-dimensionar el archivo al tamaño necesario para varios meses o años, evitando que tenga que crecer en pleno horario laboral.

### 2. Instant File Initialization (IFI)

El tiempo de "congelación" es tan alto (2 minutos) porque Windows, por defecto, rellena con ceros (zero-initialization) todo el nuevo espacio en disco por motivos de seguridad antes de entregárselo a SQL Server. Escribir 50 GB de ceros toma mucho tiempo.

**Solución:** Se debe otorgar el permiso "Perform volume maintenance tasks" a la cuenta de servicio de SQL Server en las políticas locales de Windows. Esto habilita **IFI (Instant File Initialization)**, permitiendo que el motor de base de datos reclame espacio para archivos de datos (`.mdf` o `.ndf`) instantáneamente, sin tener que rellenarlos con ceros.

### 3. Arquitectura de Archivos (.mdf vs .ndf)

Actualmente, todo está mezclado en un único archivo primario (`.mdf`). Esto es una mala práctica para bases de datos de alto rendimiento.

**Solución arquitectónica:**
* El archivo primario **`.mdf`** (asociado al Filegroup PRIMARY) debe dejarse exclusivamente para almacenar el catálogo del sistema de SQL Server y los metadatos.
* Se deben crear uno o más archivos secundarios **`.ndf`** asociados a un nuevo Filegroup (ej. `FG_DatosUsuario`) para almacenar las tablas reales (Ventas, Clientes). 
* Si se dispone de múltiples discos físicos, repartir estos `.ndf` entre ellos multiplicará la velocidad de lectura/escritura y permitirá estrategias avanzadas de *backup/restore* por *filegroup*. El archivo de log (`.ldf`) debe ir siempre aislado en su propio disco por su comportamiento secuencial (WAL).