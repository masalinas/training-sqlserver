# Caso Práctico: El lenguaje de las esperas y el servidor paralizado

## El Contexto

Es la hora punta en tu empresa (10:00 AM) y el sistema de reservas funciona a pedales. El equipo de infraestructura asegura que la CPU, la RAM y la red están perfectamente, por lo que el problema "tiene que ser la base de datos".

Para no dar palos de ciego, decides preguntar directamente a SQL Server "por qué está esperando". Ejecutas el script de "TAREAS EN ESPERA AHORA" y observas que decenas de conexiones (sesiones) están acumulando milisegundos en dos tipos de espera principales:

1. El 70% de las sesiones muestran un `wait_type` de tipo **`PAGEIOLATCH_SH`**.
2. El 30% restante de las sesiones muestran un `wait_type` de tipo **`LCK_M_X`** y apuntan a un mismo `blocking_session_id`.

Al ver esto, un administrador junior ejecuta rápidamente el script de la izquierda ("TOP WAITS ACUMULADOS") y entra en pánico: *"¡Jefe, esto es un desastre! Según el script acumulado, llevamos millones de horas de espera. ¡Llamaré al proveedor de hardware!"*.

## Misión del Alumno

Apoyándote en la diapositiva "DMVs: esperas y bloqueos" (imagen_26.png), diagnostica la situación y educa a tu equipo:

1. Usando la tabla de referencia de la diapositiva, traduce los dos síntomas. ¿Qué significa exactamente que el servidor esté esperando por `PAGEIOLATCH_*` y `LCK_M_*`? ¿Cuál es el cuello de botella real de la infraestructura y el de la aplicación?

2. En el script de la derecha se utiliza un filtro `WHERE wt.session_id > 50`, y en el de la izquierda se excluyen los `wait_type` con la palabra `'SLEEP'`. ¿Por qué es fundamental filtrar esto para no volvernos locos analizando?

3. Explícale al administrador junior por qué no debe asustarse por esos "millones de horas" acumuladas. 

4. Siguiendo el "Consejo" de la diapositiva, ¿cómo debería el junior medir el problema que está ocurriendo *ahora mismo* a las 10:00 AM usando esa vista acumulada de `sys.dm_os_wait_stats`?