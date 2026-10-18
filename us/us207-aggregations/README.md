# Caso Práctico: El reporte detallado y el colapso del GROUP BY

## El Contexto

El Director Comercial te ha pedido un reporte analítico muy específico sobre los hábitos de compra de los clientes. Quiere ver un listado con **todos los pedidos individuales** de la tabla `dbo.Pedido`, pero añadiendo tres columnas calculadas para cada fila:

1. Un número que indique si es la 1ª, 2ª o 3ª compra de ese cliente (cronológicamente).
2. El dinero acumulado que llevaba gastado el cliente hasta ese momento.
3. El importe del pedido inmediatamente anterior de ese mismo cliente (para ver si ahora ha gastado más o menos).

Un desarrollador junior ha intentado resolverlo usando `GROUP BY ClienteId`, pero te pide ayuda frustrado: *"¡Es imposible! En cuanto pongo un `SUM(Total)` y agrupo por cliente, el `GROUP BY` aplasta las filas. Me da el total global, pero pierdo el detalle de las fechas y de cada pedido individual. Y para sacar el valor del pedido anterior estoy intentando hacer un `JOIN` de la tabla consigo misma que está tardando horas"*.

## Misión del Alumno

Apoyándote en la diapositiva "Agregados y window functions básicas", ayuda al desarrollador respondiendo a estas cuestiones:

1. Explícale el concepto fundamental que aparece en el recuadro inferior: ¿Cuál es la diferencia de comportamiento entre `GROUP BY` y la cláusula `OVER`?

2. Utilizando la función `SUM` con la cláusula `OVER`, ¿cómo se calcula el "total acumulado" (running total) sin perder el detalle del pedido? Explica por qué es vital incluir la frase `ROWS UNBOUNDED PRECEDING` a nivel de rendimiento.

3. ¿Qué función analítica le enseñaría al desarrollador para obtener el valor del pedido anterior sin necesidad de hacer complejos y lentos `JOINs` de la tabla consigo misma?

4. Si el Director Comercial quisiera hacer un ranking de los mejores pedidos globales, ¿cuál sería la diferencia entre usar `ROW_NUMBER()` y `RANK()` si el pedido de 'Ana' y el de 'Luis' empatan exactamente con un total de $500?