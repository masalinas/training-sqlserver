# Caso Práctico: El atasco en directo y la memoria volátil

## El Contexto

Es viernes a las 11:00 AM y el servidor de base de datos de producción alcanza un uso del 99% de CPU. Las aplicaciones de los usuarios se quedan "cargando" indefinidamente. 

Logras conectarte por consola y le pides a un administrador junior que ejecute el script de "TOP CONSULTAS POR CPU" de la diapositiva para ver qué ha estado consumiendo tanta CPU durante la última semana. El junior lo ejecuta y te responde sorprendido: *"La consulta que más CPU ha consumido en todo el historial solo tiene 5 ejecuciones y apenas unos milisegundos de tiempo de procesador. ¡El historial está casi vacío!"*. 

Recuerdas entonces que, debido a un parche de seguridad de Windows, el servidor se reinició automáticamente anoche a las 3:00 AM. 

Ante la falta de historial, decides usar el script de "PETICIONES ACTIVAS" para ver qué está pasando *justo en este momento* en el servidor. Al ejecutarlo, ves 50 sesiones (conexiones) activas. Todas ellas tienen el campo `r.status` como "suspended" y en la columna `r.blocking_session_id` aparece el número **75**.

## Misión del Alumno

Apoyándote en la diapositiva "DMVs: consultas costosas y sesiones activas", analiza la emergencia y responde:

1. ¿Por qué el script de "TOP CONSULTAS POR CPU" mostró tan poca información y datos tan bajos si el servidor lleva meses funcionando? Explica el concepto de "Datos volátiles" de la diapositiva.

2. Al revisar las peticiones activas, descubriste que 50 sesiones están bloqueadas por el `blocking_session_id` número 75. ¿Qué harías con el script de la derecha para saber exactamente qué código SQL está ejecutando el responsable de este atasco (la sesión 75)?

3. En el script de la izquierda se utiliza la fórmula `qs.total_worker_time/qs.execution_count`. ¿Qué información valiosa nos da esta división a la hora de optimizar consultas en lugar de mirar solo el total absoluto de CPU?

4. Un desarrollador intenta ejecutar estas consultas de diagnóstico desde su Management Studio, pero SQL Server le lanza un error de permisos. Según la alerta de la diapositiva, ¿qué permiso específico debe solicitarle al DBA para poder consultar estas DMVs?