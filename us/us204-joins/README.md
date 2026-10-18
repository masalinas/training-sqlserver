# Caso Práctico: La campaña de marketing y los clientes desaparecidos

## El Contexto

El departamento de Marketing está preparando la campaña promocional de verano. Han pedido al equipo de desarrollo extraer un listado maestro que incluya **a todos los clientes de la base de datos**. 

Las reglas de negocio para el informe son claras:
* Si el cliente ha realizado algún pedido durante el año 2024, quieren ver el número de pedido para enviarle un email de "Gracias por su fidelidad".
* Si el cliente no ha comprado nada en 2024 (o nunca ha comprado nada), **también debe aparecer en la lista** (con el pedido en blanco/NULL), para enviarle un email con un cupón de descuento por "Te echamos de menos".

Un desarrollador junior te entrega el siguiente código asegurando que ha usado un `LEFT JOIN` para garantizar que todos los clientes salgan, tengan o no pedidos:

```sql
SELECT c.Nombre, p.PedidoId, p.Fecha
FROM dbo.Cliente AS c
LEFT JOIN dbo.Pedido AS p ON c.ClienteId = p.ClienteId
WHERE p.Fecha >= '20240101';
```

Al rato, Marketing te llama enfadado: *"¡El listado está mal! Solo aparecen 500 clientes, y nosotros tenemos más de 5.000 registrados en el sistema. Todos los que no han comprado en 2024 han desaparecido mágicamente de la lista."*

## Misión del Alumno

Apoyándote en la diapositiva "JOINs: tipos lógicos y trampas habituales", audita este código y responde a las siguientes preguntas:

1. ¿Por qué han desaparecido los clientes del listado si el desarrollador utilizó explícitamente un `LEFT JOIN`? Explica la advertencia (trampa) que menciona la diapositiva.

2. Reescribe el código correctamente para que el `LEFT JOIN` mantenga a todos los clientes, filtrando únicamente los pedidos de 2024.

3. Marketing te pide de repente un segundo informe: Quieren ver **única y exclusivamente** a los clientes que se registraron pero que **nunca** han llegado a hacer ni un solo pedido en toda la historia (los clientes con 0 pedidos históricos). Escribe la consulta utilizando el patrón "Anti-join".