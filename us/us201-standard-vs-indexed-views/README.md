# Caso Práctico: El cuadro de mando paralizado y el coste de materializar

## El Contexto

Eres el Database Administrator (DBA) de una cadena de tiendas. El equipo de BI (Business Intelligence) ha creado un cuadro de mando financiero que se actualiza cada 5 minutos. Este panel consulta una vista llamada `vResumenVentasCliente`, que cruza la tabla `Cliente` (100.000 filas) con la tabla `Pedido` (50 millones de filas) para mostrar el total gastado por cada usuario.

El código actual de la vista es similar al de la diapositiva:
```sql
CREATE VIEW dbo.vResumenVentasCliente AS
SELECT c.ClienteId, c.Nombre, SUM(p.Total) AS TotalGastado
FROM dbo.Cliente c 
JOIN dbo.Pedido p ON p.ClienteId = c.ClienteId
GROUP BY c.ClienteId, c.Nombre;
```

El problema es que cada vez que el cuadro de mando se refresca, la base de datos se satura y la CPU llega al 100%. Un desarrollador junior sugiere: *"He leído que si convertimos esta vista en una **vista indexada**, el panel cargará al instante. ¡Vamos a hacerlo ahora mismo en producción!"*.

## Misión del Alumno

Apoyándote en la diapositiva "Vistas estándar frente a vistas indexadas", audita este escenario y responde:

1. ¿Por qué la **vista estándar** actual está saturando la CPU cada 5 minutos? ¿Acaso las vistas no guardan los datos para que sea más rápido consultarlos?
2. Para convertirla en una vista indexada (materializada), la diapositiva menciona que se exige un requisito llamado `SCHEMABINDING`. Explica qué es esto y por qué el motor lo necesita obligatoriamente.
3. Como Arquitecto de Datos, debes frenar al desarrollador junior antes de que aplique el cambio a la ligera. ¿Cuál es el gran **peligro oculto (penalización)** de las vistas indexadas para el sistema de ventas diario (OLTP)?