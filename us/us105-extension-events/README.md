# Caso Práctico: El fantasma de la lentitud nocturna y la consola de emergencia

## El Contexto

Eres el DBA principal de una plataforma de comercio electrónico. El equipo de soporte te avisa de que, aleatoriamente y sobre todo por las noches, los usuarios experimentan parones de más de 1 o 2 segundos al navegar por la web. Cuando tú te conectas por la mañana con Management Studio, todo funciona a la perfección.

Para empeorar las cosas, por políticas de seguridad del cliente, no tienes acceso con interfaz gráfica (SSMS) al servidor de producción en este momento; solo tienes acceso por SSH a una terminal (consola) Bash.

## Misión del Alumno

Apoyándote en la diapositiva "sqlcmd y Extended Events básicos", resuelve este incidente operativo:

1. Necesitas ejecutar un script de diagnóstico preventivo llamado `check_estado.sql` que te ha pasado un compañero y quieres que el resultado se guarde en un archivo `resultado.txt` para leerlo después. ¿Qué comando de `sqlcmd` utilizarías en la terminal?

2. Para cazar las consultas "fantasma" que ralentizan el sistema por la noche, un DBA junior te sugiere crear una sesión de Extended Events (o usar el viejo Profiler) que capture absolutamente *todas* las sentencias SQL que se ejecutan en el servidor. ¿Por qué es una pésima idea y qué advertencia clave nos da la diapositiva al respecto?

3. Analiza el código T-SQL de creación del Extended Event `[lentas]` de las transparencia sqlcmd y Extended Events básicos. Si queremos capturar consultas que tarden más de 1 segundo, ¿por qué el código indica `duration > 1000000`? ¿Qué ocurre con la memoria al usar `TARGET package0.event_file`?

4. A la mañana siguiente, descubres que el servidor sufrió una caída grave de madrugada por interbloqueos masivos (deadlocks). Si no habías configurado ninguna sesión para capturar deadlocks, ¿está todo perdido o puedes revisar algún sitio?