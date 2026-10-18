## Solución Técnica

La diferencia de rendimiento no es un error, sino el comportamiento diseñado del motor para ahorrar trabajo repetitivo aprovechando la memoria en dos fases distintas: la **Plan Cache** (Paso 2) y el **Buffer Pool** (Paso 5).

### Análisis de la Primera Ejecución (La ruta pesada):
1. **Parse + Algebrize:** SQL Server verifica la sintaxis del código y resuelve que las tablas existan y el desarrollador tenga permisos de lectura sobre ellas.
2. **Plan cache:** El motor busca en la memoria si existe un plan de ejecución previo para este texto exacto. Al ser la primera vez, el resultado es negativo.
3. **Optimize:** Al no haber un plan reutilizable, el Optimizador entra en acción. Analiza las estadísticas de la tabla `Pedido` para estimar cuántas filas superan los 500€ y gasta tiempo de CPU calculando el plan de menor coste.
4. **Execute:** Se inician los iteradores del plan elegido pidiendo las filas necesarias.
5. **Buffer Pool + TDS:** Los datos de las tablas no están en memoria. El motor está obligado a ir al disco duro para leer las páginas (Lectura Física), lo que provoca el mayor cuello de botella. Finalmente, envía el resultado al cliente mediante el protocolo TDS.

### Análisis de la Segunda Ejecución (El atajo en memoria):
Cuando el desarrollador repite la acción, el motor toma dos atajos masivos:
* Tras validar la sintaxis (Paso 1), llega al **Paso 2 (Plan cache)** y detecta el plan guardado hace unos segundos. Gracias a esto, **se salta la optimización (Paso 3)**, ahorrando un valioso tiempo de compilación de CPU.
* Al llegar al **Paso 5 (Buffer Pool)**, las páginas de datos de clientes y pedidos ya están almacenadas en la memoria RAM por culpa de la primera ejecución. SQL Server realiza una lectura lógica ultra rápida sin tocar el disco duro.

### Evidencia empírica con `STATISTICS`:
Al haber activado la opción sugerida en la diapositiva (`SET STATISTICS IO, TIME ON`), la pestaña de mensajes de SQL Server demostrará la teoría de dos maneras:
* **El tiempo de compilación (TIME):** La primera vez mostrará milisegundos consumidos en *SQL Server parse and compile time*. La segunda vez, este valor será `0 ms`.
* **La lectura de datos (IO):** La primera vez el indicador `physical reads` será mayor a cero (disco). La segunda vez, el `physical reads` será `0` y todo el esfuerzo se concentrará en los `logical reads` (memoria RAM).