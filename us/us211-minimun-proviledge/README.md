# Caso Práctico: La auditoría del caos y el rastro digital

## El Contexto

Acabas de ser contratado como Arquitecto de Datos para poner orden en una startup. Al revisar el servidor de producción (que se ejecuta en un contenedor Docker con Linux), descubres el siguiente panorama configurado por el antiguo equipo:

1.  La aplicación web principal (el *backend*) se conecta a la base de datos utilizando el usuario `sa` y su contraseña.
2.  Hay 15 desarrolladores en la plantilla. Si revisas los permisos de las tablas, ves que cada desarrollador tiene un `GRANT SELECT, UPDATE` asignado individualmente a su nombre de usuario (ej. `GRANT SELECT ON dbo.Cliente TO Pedro;`, `GRANT SELECT ON dbo.Cliente TO Maria;`).
3.  El sistema va muy lento por las noches. Sospechas que algún bot está intentando hacer ataques de fuerza bruta adivinando contraseñas, pero al revisar el visor de eventos normal, no encuentras información detallada.

Decides que es hora de aplicar mano dura basándote en las políticas corporativas.

## Misión del Alumno

Apoyándote en la diapositiva "Mínimo privilegio y auditoría básica", audita este entorno y responde:

1.  Señala los dos violaciones flagrantes del principio de **"Mínimo privilegio"** que existen en este servidor. ¿Cómo deberías rediseñar la seguridad para cumplir con las buenas prácticas de la diapositiva?

2.  Analiza el script T-SQL de la diapositiva. Explica paso a paso qué hace este código y por qué la ruta del archivo (`FILEPATH`) tiene ese formato tan particular (`/var/opt/mssql/audit/`). 

3.  Una vez ejecutado el script, dejas el servidor vigilando toda la noche. Según la recomendación de la diapositiva, ¿cómo leerás a la mañana siguiente el archivo generado para ver si el ataque de fuerza bruta es real?
