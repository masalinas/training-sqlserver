# Caso Práctico: El problema del Parameter Sniffing

## El Contexto
Eres el DBA de una empresa mayorista. Tienes un procedimiento almacenado en producción llamado `dbo.usp_PedidosPorCliente` que recibe un único parámetro de entrada: `@ClienteId`. 

La gran mayoría de los clientes de la empresa son pequeñas tiendas de barrio que acumulan entre 5 y 10 pedidos en el histórico. Sin embargo, existe un cliente corporativo gigante (el Cliente ID 42) que es una cadena nacional de hipermercados y acumula cientos de miles de pedidos.

El equipo de soporte te reporta un comportamiento extraño y contradictorio:
- **Lunes a jueves:** El sistema funciona muy rápido para los clientes pequeños, pero cuando el Cliente 42 intenta sacar su informe, el sistema se queda "congelado" varios minutos hasta dar un timeout.
- **Viernes:** Esta mañana, de madrugada, aplicaste parches de Windows y reiniciaste el servidor de base de datos. Casualmente, el primer usuario en conectarse a primera hora fue el Cliente 42 y su informe cargó sorprendentemente en solo dos segundos. ¡Pero un rato después, todos los clientes pequeños empezaron a quejarse de que el sistema va lentísimo!

## Misión del Alumno
1. Basándote en el diagrama de "Plan caching, sniffing y recompilaciones", explica detalladamente por qué ocurre este efecto "balancín" en el rendimiento. Asegúrate de usar el concepto de *Sniffing* que aparece en la alerta de la diapositiva.
2. Utilizando los scripts de "Mitigaciones y DMV", ¿qué comando T-SQL ejecutarías si el equipo de contabilidad te pide que saques el informe del Cliente 42 de forma manual y urgente sin arruinar el rendimiento del resto de usuarios?
3. Si quisieras arreglar el procedimiento almacenado definitivamente desde el código, ¿qué opciones (hints) de la diapositiva añadirías al final de la consulta?