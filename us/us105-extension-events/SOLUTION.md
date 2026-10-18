## Solución Técnica

### 1. Ejecución desatendida con sqlcmd

Al no tener interfaz gráfica, `sqlcmd` es la herramienta salvavidas. Para ejecutar un archivo de entrada y redirigir la salida a un archivo de texto, el comando adecuado (asumiendo conexión local con autenticación de Windows/Integrada) sería:

`sqlcmd -S .\SQLEXPRESS -E -b -i check_estado.sql -o resultado.txt`

*(Si fuera SQL Server en Linux o con autenticación SQL, se usarían las banderas `-U` para el usuario, `-P` para la contraseña y `-C` para confiar en el certificado, tal como indica el primer ejemplo de la diapositiva).*

### 2. El peligro del "Efecto Observador" (Sobrecarga)

Capturar *todas* las consultas de un servidor en producción es un error crítico. La herramienta de monitorización generaría tanta carga de trabajo escribiendo cada pequeño SELECT en el disco, que colapsaría el servidor (el remedio sería peor que la enfermedad). 

Como advierte la diapositiva en rojo: **"Filtra siempre con predicados para limitar la sobrecarga"**. Los Extended Events son ultra-ligeros, pero solo si usamos filtros (`WHERE`) para decirle al motor que descarte inmediatamente en memoria el 99% del tráfico normal.

### 3. Anatomía del Extended Event [lentas]

* **El filtro de duración:** El predicado indica `WHERE duration > 1000000` porque, en SQL Server, la duración de los Extended Events para sentencias completadas se mide internamente en **microsegundos** (millonésimas de segundo). Por lo tanto, 1.000.000 microsegundos equivalen exactamente a 1 segundo.
* **El almacenamiento (TARGET):** Al enviar la salida a `event_file` (generando un archivo `.xel`), estamos haciendo que el evento sea persistente en disco. Esto nos permite dejar la sesión encendida (`STATE = START`) toda la noche, irnos a dormir, y analizar el archivo al día siguiente sin miedo a perder los datos si se reinicia el servicio.

### 4. El salvavidas: system_health

No está todo perdido. Como bien indica el recordatorio de la diapositiva, SQL Server incluye una sesión de Extended Events llamada **`system_health`** que ya está activa por defecto desde el momento en que se instala el motor. 

Esta sesión está diseñada con un impacto de rendimiento casi nulo y se encarga de monitorizar en segundo plano errores de severidad alta, alertas de memoria y **deadlocks**. El primer paso tras cualquier caída inesperada siempre debe ser consultar los registros históricos de `system_health`.