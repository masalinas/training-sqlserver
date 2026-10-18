# Caso Práctico: El optimizador ciego y el histograma desfasado

## El Contexto

Eres el Database Administrator (DBA) de un portal de e-commerce. Ayer por la noche, en preparación para el Black Friday, se ejecutó una carga masiva (ETL) que insertó 2 millones de registros nuevos en la tabla `dbo.Pedido`.

Esta mañana, el equipo de ventas intenta sacar un informe filtrando por la fecha de hoy. La consulta está tardando horas. Al revisar el plan de ejecución, notas algo familiar y alarmante: para el índice `IX_Pedido_Cliente`, el Optimizador estimó que la consulta devolvería **1 fila**, pero en la realidad (Actual Rows) está devolviendo **500.000 filas**. 

Esta mala estimación ha provocado que el motor elija un algoritmo físico desastroso (Nested Loops) en lugar de uno preparado para grandes volúmenes (Hash Match).

## Misión del Alumno

Apoyándote en la diapositiva "Estadísticas y cardinality estimator", audita este problema de estimación (Cardinality Estimation) y responde:

1. ¿Qué es exactamente el **Histograma** de una estadística y por qué el Optimizador creyó que solo iba a encontrar 1 fila para los pedidos de hoy?
2. ¿Qué comando T-SQL utilizarías para inspeccionar las tripas de esa estadística (el encabezado y el histograma) y demostrarle al equipo que los datos están desactualizados?
3. El desarrollador junior pregunta: *"¿Pero SQL Server no actualiza las estadísticas automáticamente?"*. Explícale cómo funciona el umbral de actualización dinámica en las versiones modernas (compatibilidad 130+) usando la fórmula matemática de la diapositiva.
4. ¿Qué comando T-SQL exacto ejecutarías para solucionar el problema ahora mismo, obligando al motor a leer el 100% de la tabla para recalcular los datos a la perfección?