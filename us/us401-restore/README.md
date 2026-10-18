# Caso Práctico: El rescate con MOVE y STOPAT en código T-SQL

## El Contexto

Eres el Administrador de Bases de Datos de una plataforma de comercio electrónico. Tras un error humano en el entorno de producción que afectó a la base de datos `Ventas`, el director técnico te exige restaurar el servicio en un servidor de pruebas alternativo utilizando exactamente los archivos de backup que dejó el último plan de respaldo.

Al revisar la ruta de destino en el nuevo servidor, descubres que la estructura de carpetas es diferente a la del servidor original. Si intentas restaurar el backup a ciegas, fallará porque intentará buscar las rutas antiguas `/var/opt/mssql/data/`. 

Además, necesitas aplicar una serie de respaldos de registro de transacciones (logs) encadenados y detener la recuperación exactamente un minuto antes del desastre, asegurándote de que la base de datos quede abierta y operativa (`ONLINE`) para que los auditores puedan verificar los datos.

## Misión del Alumno

Apoyándote en la diapositiva "Restauración point-in-time (STOPAT)", analiza la sintaxis T-SQL y responde:

1. En el **Paso 1 (Full)**, aparece la cláusula `MOVE`. Explica para qué sirve y qué ocurriría si omites esta instrucción al intentar restaurar el archivo `Ventas_FULL.bak` en un servidor nuevo con carpetas distintas.

2. A lo largo de la secuencia T-SQL, puedes ver que los pasos 1, 2 y el primer log usan la instrucción `WITH NORECOVERY`. Sin embargo, el último log utiliza simultáneamente `WITH STOPAT = ... , RECOVERY`. Explica la función de ambos parámetros en esa última línea.

3. Observa el panel derecho de la diapositiva donde se define la opción **`STANDBY`**. ¿En qué escenario del mundo real utilizarías `STANDBY` en lugar de `NORECOVERY` o `RECOVERY`?