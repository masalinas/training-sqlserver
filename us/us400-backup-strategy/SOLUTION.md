## Solución Técnica

### 1. La naturaleza acumulativa del Diferencial

Debemos utilizar **únicamente el Diferencial del Martes a las 22:00**.
A diferencia del log de transacciones, los backups diferenciales en SQL Server son acumulativos respecto al último Full. El diferencial del martes contiene todos los bloques de datos modificados desde el domingo a las 22:00. Por lo tanto, aplicar el diferencial del lunes sería una pérdida de tiempo, ya que el del martes ya incluye esos cambios y los del día posterior.

### 2. La secuencia y el estado NORECOVERY

La secuencia estricta es: Full (Domingo) -> Diferencial (Martes) -> Cadena de Logs hasta el punto de fallo.
La clave del éxito está en el estado **`NORECOVERY`**. Al añadir esta instrucción a los comandos `RESTORE`, le estamos diciendo a SQL Server: *"Restaura estos datos, pero deja la base de datos bloqueada y en estado de inicialización, porque voy a seguir inyectándole archivos de log encima"*. 
Si olvidáramos esto y ejecutáramos el Paso 2 con `RECOVERY`, el motor cerraría la base de datos poniéndola online para los usuarios. Esto rompería la cadena, imposibilitando aplicar los logs del miércoles por la mañana.

### 3. La cadena de Logs (Log chain)

En el Paso 3, debemos aplicar de forma secuencial y cronológica todos los archivos de backup del log de transacciones generados cada 15 minutos desde el martes a las 22:15 hasta el miércoles a las 10:30. 
Esta "cadena" contiene el registro exacto de cada `INSERT`, `UPDATE` y `DELETE` ocurrido en el hospital. Al aplicarlos en estado `NORECOVERY`, SQL Server está reproduciendo en cámara rápida todo el trabajo que hicieron los médicos la noche anterior y esa misma mañana.

### 4. Point-in-Time Recovery (STOPAT)

El Paso 4 es donde se salva el negocio. Tomamos el último backup del log (el que cubre el tramo de 10:30 a 10:45, a menudo forzando un *Tail-Log Backup* justo tras el desastre) y lo restauramos con la instrucción especial **`STOPAT = '2026-10-18T10:36:00'`**.

Esto obliga a SQL Server a leer el archivo de log reproduciendo las transacciones normales de las 10:31, 10:32... pero le ordena detenerse y frenar en seco exactamente en el milisegundo anterior a las 10:37 (cuando el junior lanzó el script destructivo). 
Al poner finalmente **`RECOVERY`** en esta línea, el motor sella la base de datos, consolida las transacciones hasta las 10:36, descarta cualquier cosa posterior, y abre la base de datos al público. ¡El hospital vuelve a estar operativo y los datos destruidos nunca llegaron a existir!