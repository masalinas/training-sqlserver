# Caso Práctico: El misterio de la consulta acelerada

## El Contexto
El equipo de desarrollo ha implementado un nuevo cuadro de mando en la intranet. Un desarrollador junior te contacta preocupado por un comportamiento errático en el rendimiento. 

Te explica que cuando ejecuta una consulta analítica cruzando las tablas `Cliente` y `Pedido` a primera hora de la mañana, la consulta tarda casi 3 segundos en devolver los datos. Sin embargo, si vuelve a pulsar el botón y ejecuta exactamente la misma consulta unos segundos después, la respuesta es instantánea (0 milisegundos).

El desarrollador te entrega su código y te pide ayuda para entender qué está pasando "bajo el capó" del motor:

```sql
-- Herramienta de diagnóstico activada por el DBA
SET STATISTICS IO, TIME ON;

SELECT c.Nombre, p.cod_pedido, p.Total, p.Estado
FROM dbo.Cliente c
INNER JOIN dbo.Pedido p ON c.ClienteID = p.ClienteID
WHERE p.Total > 500;
```

## Misión del Alumno
Apoyándote en las 5 fases del diagrama "Ciclo de vida de una consulta", explica al equipo de desarrollo por qué ocurre esta diferencia extrema de tiempos detallando qué ruta toma SQL Server en la primera ejecución frente a la segunda. Finalmente, indica qué métricas exactas del comando `STATISTICS` confirmarían esta teoría.