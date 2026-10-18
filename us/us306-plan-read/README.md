# Caso Práctico: Lectura avanzada de planes de ejecución y métricas

## El Contexto
El equipo de desarrollo backend se queja de que una consulta clave del módulo de reportes tiene un rendimiento muy errático. A veces responde en 10 milisegundos y otras veces tarda casi 2 segundos. 

Un desarrollador de la aplicación te envía una captura del Plan de Ejecución de SQL Server Management Studio (SSMS) y te comenta: *"El problema no es esta consulta. He mirado el plan y dice que su Coste es solo del 15% respecto a todo el script, así que tiene que ser culpa de la red o del disco. Además, no me he fijado en más detalles porque no da error, aunque sí sale un triángulo amarillo en un operador de ordenación (SORT)"*.

Sabes que basar el diagnóstico solo en el tiempo transcurrido o en el "Coste %" estimado es una trampa muy habitual en el análisis de rendimiento. 

### Material de Apoyo (Código del sistema)
Para salir de dudas, decides ejecutar la consulta tú mismo, activando previamente las métricas internas del motor para ver el trabajo real:

```sql
-- Activar métricas de sesión para diagnóstico
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Consulta bajo análisis
SELECT PedidoId, Total
FROM dbo.Pedido
WHERE ClienteId = 4217;
```

*Salida obtenida en la pestaña de Mensajes de SSMS:*
```text
Table 'Pedido'. Scan count 1, logical reads 3, physical reads 0.
CPU time = 0 ms, elapsed time = 1 ms.
```

## Misión del Alumno
1. A la luz de los resultados de `STATISTICS IO`, ¿por qué los administradores de bases de datos confían más en la métrica de **`logical reads`** (lecturas lógicas) que en la de **`elapsed time`** (tiempo transcurrido) para medir la eficiencia real y repetible de una consulta?
2. El desarrollador argumenta que la consulta es inocente porque su "Coste" es solo del 15%. ¿Por qué es muy peligroso guiarse ciegamente por el porcentaje de coste que muestra el Plan de Ejecución?
3. Al inspeccionar a fondo el plan de ejecución real, comparas el **Estimated Number of Rows** con el **Actual Number of Rows** y ves una diferencia abismal (el motor esperaba 1 fila y la consulta devuelve 50.000). ¿Qué problema clásico nos indica este síntoma?
4. El plan mostraba un triángulo de *Warning* (advertencia) amarillo. Nombra tres posibles problemas graves de rendimiento que SQL Server suele reportar de forma silenciosa mediante estos *warnings*.