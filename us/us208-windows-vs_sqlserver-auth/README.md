# Caso Práctico: El conflicto entre Ciberseguridad y Desarrollo

## El Contexto

Tu empresa está auditando la seguridad de toda la infraestructura de datos. El Director de Ciberseguridad (CISO) ha emitido una nueva directiva estricta: *"Absolutamente todos los accesos a bases de datos deben estar integrados con nuestro Active Directory corporativo para forzar políticas de caducidad de contraseñas y doble factor de autenticación (MFA)"*.

Sin embargo, el Arquitecto de Software se opone rotundamente y exige que se habilite el "Modo Mixto" de autenticación en los nuevos servidores, argumentando dos problemas:
1. El equipo está empezando a desplegar microservicios de SQL Server dentro de contenedores **Docker** en servidores Linux.
2. Tienen una **aplicación heredada** (legacy) de hace 15 años en la fábrica que no soporta integración con Active Directory.

Durante la auditoría, el CISO además detecta un escaneo de red alarmante: el puerto 1433 del servidor de pruebas está recibiendo miles de intentos de conexión fallidos por minuto intentando adivinar la contraseña del usuario `sa`.

## Misión del Alumno

Apoyándote en la diapositiva "Autenticación: Windows frente a SQL Server", media en este conflicto y resuelve los problemas de arquitectura:

1. ¿Quién tiene razón en el debate sobre la autenticación? Justifica por qué el Arquitecto de Software necesita usar Autenticación de SQL Server para sus escenarios concretos.
2. Explica al equipo de Ciberseguridad dónde guarda SQL Server físicamente los usuarios y contraseñas cuando no se usa Windows, y cómo se puede mitigar (parcialmente) la falta de Active Directory usando `CHECK_POLICY`.
3. Según la alerta de la diapositiva, si decides cambiar el servidor a "Modo mixto" para dar soporte a la app heredada, ¿qué acción administrativa debes realizar para que aplique el cambio?
4. ¿Qué es el usuario `sa`, qué tipo de ataque está sufriendo y cuál es la recomendación estricta de seguridad sobre esta cuenta?