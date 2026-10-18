# Caso Práctico: El UPDATE sin WHERE del miércoles por la mañana

## El Contexto

Eres el DBA principal de un hospital. El sistema de gestión de pacientes tiene configurada exactamente la estrategia de copias de seguridad (backups) que aparece en el diagrama:

*   **Full Backup:** Todos los domingos a las 22:00.
*   **Diferencial:** Todos los lunes y martes a las 22:00.
*   **Log de Transacciones:** Cada 15 minutos (ej: 10:00, 10:15, 10:30, 10:45...).

Es **Miércoles a las 10:37 AM**. De repente, recibes una llamada de pánico del equipo de desarrollo. Un programador junior estaba haciendo un parche urgente en producción y ejecutó un `UPDATE` sobre la tabla de diagnósticos **sin poner la cláusula `WHERE`**, sobrescribiendo los historiales médicos de todos los pacientes del hospital. 

El negocio te exige que devuelvas la base de datos a su estado exacto justo un minuto antes del desastre, es decir, a las **10:36 AM**.

## Misión del Alumno

Apoyándote en la diapositiva "Estrategia: Full + Diferencial + Log chain" (imagen_27.png), diseña y explica el plan de rescate:

1.  Al revisar el almacén de backups, ves que tienes las copias diferenciales del Lunes y del Martes. ¿Cuál debes utilizar y por qué no necesitas la otra?
2.  Explica paso a paso la secuencia de restauración (los 4 pasos del recuadro inferior). ¿Por qué es absolutamente crítico utilizar el comando `NORECOVERY` en los tres primeros pasos? ¿Qué pasaría si te olvidas y usas `RECOVERY` en el paso 2?
3.  ¿Qué son exactamente los archivos que debes restaurar en el Paso 3 (`Mar 22:15 -> Mié 10:30`) y qué función cumplen en la cadena?
4.  Explica cómo funciona la "magia" del Paso 4. ¿Qué es el `STOPAT = 10:36` y por qué este último paso sí lleva la instrucción `RECOVERY`?