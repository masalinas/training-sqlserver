## Solución Técnica

### 1. Traduciendo el "Wait Type"

SQL Server es muy educado: cuando no puede avanzar, registra exactamente qué le detiene.

* **`PAGEIOLATCH_SH`:** Como indica la diapositiva (`PAGEIOLATCH_*`), esto significa "Lecturas de disco lentas". El motor está intentando traer páginas de datos del disco físico a la memoria RAM (Buffer Pool) y el disco no responde lo suficientemente rápido. El cuello de botella físico real es el almacenamiento (o faltan índices, lo que obliga a leer demasiado disco).
* **`LCK_M_X`:** El prefijo `LCK` viene de "Lock" (Bloqueo). Como indica la tabla, son "Bloqueos entre sesiones". Significa que una consulta está intentando modificar datos y choca con otra sesión que tiene esos datos bloqueados. El cuello de botella aquí es el código de la aplicación o una transacción que se quedó abierta (aislamiento).

### 2. Filtrando el ruido del sistema (Session > 50 y SLEEP)

SQL Server ejecuta decenas de procesos internos en segundo plano (recolección de basura, escritura perezosa, monitorización). 
Por diseño histórico, **las sesiones del 1 al 50 están reservadas para el sistema**, por lo que filtrar `session_id > 50` nos aísla para ver solo las peticiones reales de usuarios y aplicaciones.
Por otro lado, excluir los tipos de espera `SLEEP` o `LAZYWRITER_SLEEP` es vital porque el motor registra como "espera" el tiempo que sus hilos internos pasan "durmiendo" sin hacer nada. Si no los filtramos, parecerá que el servidor está colapsado, cuando en realidad simplemente está ocioso esperando trabajo.

### 3. El sesgo de la vista acumulada

El junior entró en pánico porque la vista dinámica `sys.dm_os_wait_stats` guarda un historial acumulativo **desde la última vez que se reinició el servicio de SQL Server**. Si el servidor lleva encendido 2 años, mostrará la suma de esperas de 2 años. Esos "millones de horas" no reflejan el problema actual de las 10:00 AM, sino la vida histórica del servidor.

### 4. La técnica del Delta (Snapshots)

Para usar la vista de estadísticas acumuladas y diagnosticar un problema puntual, hay que seguir el consejo de la diapositiva: la técnica del *Snapshot* (instantánea).

El procedimiento correcto es:
1. Volcar el resultado de `sys.dm_os_wait_stats` en una tabla temporal (Foto A).
2. Esperar 5 o 10 minutos (durante la crisis de rendimiento).
3. Volcar el resultado de nuevo (Foto B).
4. Restar los valores (Foto B - Foto A). El delta resultante nos dirá exactamente por qué estaba esperando el servidor de SQL durante esa ventana de tiempo específica de 10 minutos.