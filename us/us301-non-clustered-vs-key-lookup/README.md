# Caso Práctico: El asesino silencioso del rendimiento (Key Lookup)

## El Contexto

El equipo de backend ha desarrollado un microservicio que muestra a los usuarios su historial de compras en la App. La consulta que se ejecuta miles de veces por minuto es exactamente la de la diapositiva:

```sql
SELECT PedidoId, FechaPedido, Total
FROM dbo.Pedido
WHERE ClienteId = 4217;
```

Para optimizarla, un desarrollador junior revisó la cláusula `WHERE` y creó este índice básico:
`CREATE NONCLUSTERED INDEX IX_Pedido_Cliente ON dbo.Pedido (ClienteId);`

Sin embargo, el monitor de rendimiento muestra que, aunque el motor usa este índice (hace un *Index Seek*), la consulta sigue consumiendo muchísimos recursos de disco (I/O) cuando el cliente tiene cientos de pedidos. Al revisar el plan de ejecución, notas un operador muy costoso llamado **"Key Lookup"**.

## Misión del Alumno

Apoyándote en la diapositiva "Non-Clustered, Key Lookup y covering", ayuda a tu equipo resolviendo estas cuestiones:

1. Explica al desarrollador junior qué es exactamente un **Key Lookup**. ¿Por qué SQL Server tiene que hacer este trabajo extra si el índice `IX_Pedido_Cliente` ya le dice dónde están los pedidos del cliente 4217?
2. ¿Por qué este fenómeno es tan destructivo para el rendimiento si el cliente tiene, por ejemplo, 1.000 pedidos históricos? (Pista: fíjate en el tipo de lectura que menciona la diapositiva).
3. ¿Cómo soluciona este problema el segundo script de la diapositiva (el que usa la cláusula `INCLUDE`)? Explica el concepto de "Índice Covering".
4. El desarrollador junior sugiere otra idea: *"En vez de usar INCLUDE, ¿por qué no ponemos todas las columnas directamente en la clave del índice, así: `ON dbo.Pedido (ClienteId, FechaPedido, Total)`?"*. Explícale por qué esto es una mala idea usando la lógica de "Orden de la clave".