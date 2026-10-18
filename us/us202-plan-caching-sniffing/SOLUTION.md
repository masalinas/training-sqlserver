## Solución Técnica

### 1. Explicación del fenómeno (Parameter Sniffing)
El problema radica en cómo SQL Server optimiza y recicla el trabajo para ahorrar ciclos de procesador:
*   **El escenario de Lunes a Jueves:** Un cliente pequeño ejecuta el informe por primera vez. En el Paso **1 (Compilar)**, el Optimizador "olfatea" (hace *sniffing*) el valor del parámetro. Al estimar con las estadísticas que solo traerá 5 filas, crea un plan de ejecución rápido y quirúrgico para pocas lecturas (ej. *Index Seek* + *Nested Loops*). En el Paso **2 (Cachear)**, guarda este plan en el *Plan Cache*. Cuando entra el Cliente 42, el motor aplica el Paso **3 (Reutilizar)**. Sin embargo, procesar cientos de miles de filas con *Nested Loops* colapsa la RAM y la CPU del servidor.
*   **El escenario del Viernes (tras el reinicio):** El reinicio del servidor provocó un borrado del *Plan Cache* (causa de Recompilación en el Paso 4). Al entrar el Cliente 42 primero, el motor "olfateó" su parámetro masivo y compiló un plan pesado orientado a leer media base de datos (ej. *Clustered Index Scan* + *Hash Match*). Al cachear este plan pesado, ahora los clientes pequeños están reutilizando un escaneo masivo para buscar solo 5 filas. 

Como advierte la diapositiva: *el primer valor compilado fija el plan para todos los demás.*

### 2. Mitigación temporal de emergencia
Para ejecutar el informe del cliente gigante forzando un plan óptimo, sin envenenar la caché de los pequeños (o saltándose una caché ya envenenada), usaremos la ejecución con recompilación:

```sql
EXEC dbo.usp_PedidosPorCliente @ClienteId = 42 WITH RECOMPILE;
```

Esto le indica a SQL Server que salte el paso 3 (Reutilizar), genere un plan perfecto exclusivamente para el Cliente 42, lo ejecute, y lo destruya inmediatamente sin alterar el *Plan Cache*.

### 3. Solución definitiva en código
Para que los desarrolladores lo solucionen estructuralmente dentro del DML del procedimiento, deben alterar la consulta interna añadiendo los denominados "Query Hints":
*   **`OPTION (RECOMPILE)`**: Obligará a que la consulta se compile (Paso 1) en *cada* ejecución. Soluciona el problema de raíz, a cambio de gastar un poco más de CPU por no reutilizar planes.
*   **`OPTION (OPTIMIZE FOR UNKNOWN)`**: Obliga al optimizador a ignorar el valor exacto del parámetro de entrada y compilar un plan "promedio" seguro basado en la densidad general de la tabla, logrando un rendimiento decente para todos sin agotar la CPU por recompilaciones constantes.

*(Nota para el DBA: Puedes monitorizar qué planes están en memoria y cuántas veces se han reutilizado cruzando el Paso 3 usando la DMV `sys.dm_exec_cached_plans` y ordenando por `usecounts DESC`).*