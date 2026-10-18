## Solución Técnica

**1. Lecturas Lógicas vs Tiempo del Reloj**
La **métrica clave y determinante** para optimizar son las lecturas lógicas (`logical reads`). Esta métrica es totalmente estable: indica exactamente cuántas páginas de 8KB tuvo que leer el motor de la memoria (Buffer Pool) para resolver la petición. El tiempo (`elapsed time`), por el contrario, es engañoso y variable; depende de si los datos ya estaban en caché o hubo que ir a disco (lecturas físicas), de la saturación de CPU en ese instante, de la latencia de red, o de si la consulta sufrió bloqueos (*blocking*) esperando a otros procesos.

**2. El mito del "Coste %"**
El porcentaje de coste que muestra SSMS es simplemente una **estimación algorítmica** basada en el coste esperado, no es una medida de tiempo de ejecución real. Si las estadísticas están mal, el motor puede calcular un coste estimadísimo bajísimo (ej. 15%) para un operador que luego, en tiempo real, destroza el rendimiento del servidor. Además, es un coste puramente *relativo* al resto de las sentencias que forman parte de ese mismo lote (batch).

**3. Discrepancia entre Estimado y Real**
Una diferencia enorme entre las filas estimadas (Estimated) y las que realmente fluyeron por el plan (Actual) es la prueba inequívoca de que el Optimizador de Consultas tomó decisiones "a ciegas". Las causas principales de esta desviación son **estadísticas obsoletas** (el motor no conoce la distribución real de los datos actuales) o el clásico problema de **Parameter Sniffing** (el plan compilado sirvió para un parámetro inicial muy selectivo, pero falla estrepitosamente para otros valores).

**4. El peligro de ignorar los Warnings**
Ignorar un warning en un plan de ejecución (el triángulo amarillo con signo de exclamación) oculta problemas arquitectónicos severos. Tres advertencias muy críticas que reportan son:
*   **Spill a TempDB:** El motor calculó mal la memoria RAM necesaria (*Memory Grant*) basándose en estimaciones erróneas y tuvo que volcar datos al disco duro físico (TempDB) para poder ordenar (SORT) o hacer un Hash Join, paralizando la consulta.
*   **Conversión Implícita de tipos de datos:** Por ejemplo, al mezclar `VARCHAR` con `NVARCHAR`, lo que impide al optimizador usar índices (*Index Seek*) y le obliga a escanear toda la tabla, disparando la CPU.
*   **Falta de estadísticas (Missing Stats):** El motor avisa de que tuvo que inventarse las estimaciones porque no existen estadísticas para las columnas implicadas en los filtros.