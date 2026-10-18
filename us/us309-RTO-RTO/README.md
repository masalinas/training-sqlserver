# Caso Práctico: El presupuesto de contingencia y la realidad del negocio

## El Contexto

Eres el Arquitecto de Datos de una plataforma de pasarelas de pago. Te convocan a una reunión crítica con el CEO y el Director Financiero (CFO) para diseñar el plan de recuperación ante desastres (Disaster Recovery) de la base de datos principal (`PagosDB`).

El CEO toma la palabra y establece los requisitos del negocio: 
*"Si nuestro centro de datos principal se incendia o sufre un apagón, nuestro servicio no puede estar caído más de unos pocos segundos, o perderemos clientes. Además, procesamos miles de euros por minuto; bajo ninguna circunstancia podemos perder ni una sola transacción que ya haya sido confirmada al cliente. ¡Ah! Y por cierto, el presupuesto es muy ajustado, así que el equipo de sistemas ha propuesto usar un sistema de copias de seguridad del log de transacciones (Log Shipping) que se envíe a otro servidor cada 15 minutos."*

## Misión del Alumno

Apoyándote en la diapositiva "RTO y RPO: tiempo y datos en juego", analiza las exigencias de la directiva y responde:

1. Basándote en la línea de tiempo de la diapositiva, defínele al CEO qué significan exactamente las siglas **RPO** y **RTO** en lenguaje de negocio.

2. Analiza la propuesta de usar "Log Shipping" cada 15 minutos por temas de presupuesto. Según el recuadro de la derecha, ¿cuál sería el RPO real de esta solución? ¿Cumple con la exigencia del CEO de "no perder ni una sola transacción"?

3. Para cumplir realmente con las exigencias del CEO (cero pérdida de datos y caída de apenas segundos), ¿qué valores numéricos de RPO y RTO necesitas alcanzar y qué tecnologías de SQL Server (mencionadas en los recuadros oscuro y blanco izquierdo) debes presupuestar e implementar obligatoriamente?