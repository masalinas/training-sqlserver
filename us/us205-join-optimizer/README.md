# Caso Práctico: El "Bucle de la Muerte" y las Estadísticas Mentirosas

## El Contexto

Eres el DBA de una empresa de retail. El sistema de facturación ejecuta constantemente una consulta que une la tabla `Cliente` con la tabla `Factura` para un día específico. Normalmente, esta consulta tarda menos de 1 segundo.

Sin embargo, tras una importación masiva de datos que ocurrió anoche, el sistema se ha paralizado. El equipo de desarrollo te pasa la consulta exacta que está fallando:

```sql
SELECT c.Nombre, f.Total
FROM dbo.Cliente c
JOIN dbo.Factura f ON c.ClienteId = f.ClienteId
WHERE f.FechaCompra = '2026-10-18';
```

Decides sacar el **Plan de Ejecución Actual** y observas lo siguiente:
* El motor ha elegido el algoritmo **Nested Loops (Bucles Anidados)** para unir las tablas.
* Al pasar el ratón por encima de la flecha del plan, ves una discrepancia alarmante: **Estimated Rows (Filas Estimadas): 5** frente a **Actual Rows (Filas Reales): 850.000**.

## Misión del Alumno

Apoyándote en la diapositiva "JOINs: algoritmos físicos del optimizador", audita este incidente y responde:

1. ¿Por qué el motor eligió inicialmente un algoritmo **Nested Loops** y por qué esta elección está provocando que el servidor se paralice en este momento? 
2. Según el recuadro inferior de la diapositiva, ¿cuál es la causa raíz de que haya tanta diferencia entre las filas estimadas y las reales, y cómo se soluciona?
3. Si ambas tablas tuvieran millones de registros y estuvieran perfectamente indexadas (ordenadas) por la columna `ClienteId`, ¿qué algoritmo físico sería el más eficiente para unirlas?
4. El equipo de Data Science lanza consultas cruzando tablas temporales masivas sin ningún tipo de índice ni orden. ¿Qué algoritmo usará SQL Server y cuál es el gran riesgo para el rendimiento (mencionado en la diapositiva)?