# Caso Práctico: El misterio de las columnas invisibles

## El Contexto

Estás impartiendo una mentoría a un programador junior que acaba de unirse al equipo de analítica de ventas. Le has pedido que extraiga un informe con el total de ventas por cliente para el año 2024, mostrando solo aquellos que hayan superado los 1000€ en compras.

El desarrollador te entrega este script, pero está frustrado porque SQL Server le devuelve un error constante: *"Invalid column name 'Anio'"* e *"Invalid column name 'VentasTotales'"*. 

El código que ha escrito es el siguiente:

```sql
SELECT c.Nombre, YEAR(p.Fecha) AS Anio, SUM(p.Total) AS VentasTotales
FROM dbo.Cliente c
JOIN dbo.Pedido p ON p.ClienteId = c.ClienteId
WHERE Anio >= 2024
GROUP BY c.Nombre, Anio
HAVING VentasTotales > 1000
ORDER BY VentasTotales DESC;
```

El desarrollador se queja diciendo: *"No lo entiendo, ¡las columnas `Anio` y `VentasTotales` están declaradas claramente en la primera línea del `SELECT`! ¿Por qué SQL Server me dice que no existen en el `WHERE` ni en el `HAVING`, pero sí me deja usarlas en el `ORDER BY`?"*

## Misión del Alumno

Apoyándote en la diapositiva "SELECT complejos: orden lógico de ejecución", ayuda a este desarrollador a comprender cómo lee realmente el motor de base de datos su código:

1. Enumera el orden lógico exacto (del 1 al 6) en el que SQL Server evalúa internamente esta consulta, ignorando cómo está escrita de arriba a abajo.
2. Explica técnicamente por qué se produce el error con los alias en el `WHERE`, el `GROUP BY` y el `HAVING`.
3. Explica por qué el alias `VentasTotales` sí funciona perfectamente dentro de la cláusula `ORDER BY`.
4. Reescribe el código para que funcione correctamente.