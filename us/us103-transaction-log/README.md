# Caso Práctico: El arranque eterno y los miles de VLFs

## El Contexto

Eres el DBA de una institución financiera. El fin de semana pasado, el equipo de sistemas aplicó parches de seguridad en Windows y reinició el servidor principal de bases de datos. 

Al arrancar, el servidor levantó rápido, pero la base de datos principal de transacciones (`FinanzasDB`) se quedó en estado *"In Recovery"* (En recuperación) durante **45 minutos** antes de permitir que los usuarios se conectaran. 

Para investigar la lentitud, ejecutas el script de diagnóstico de la vista dinámica `sys.dm_db_log_info` y el resultado arroja que tienes **15.420 VLFs totales** en tu archivo de log (`.ldf`). Revisas la configuración y notas que el *Autogrowth* del log de transacciones estaba configurado para crecer en incrementos de apenas **1 MB**.

## Misión del Alumno

Apoyándote en la diapositiva "Transaction Log: WAL y VLFs", analiza este incidente y responde:

1. Un desarrollador te dice: *"No entiendo por qué tarda tanto en recuperarse si, cuando hacemos COMMIT, los datos se guardan inmediatamente en el archivo .mdf"*. Utilizando el modelo de 4 pasos (WAL), explícale por qué está equivocado.
2. ¿Por qué la base de datos tardó 45 minutos en arrancar? Relaciona este problema con el concepto de VLF (Virtual Log File) y el tamaño de *autogrowth*.
3. ¿Cómo solucionarías este problema a nivel de arquitectura para que no vuelva a ocurrir en el futuro?