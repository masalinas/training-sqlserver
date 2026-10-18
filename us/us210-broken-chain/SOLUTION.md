## Solución Técnica

### 1. El poder de la Cadena Intacta (Mismo Propietario)

Mi procedimiento funcionó gracias al mecanismo de **Ownership Chaining** de SQL Server. Cuando un objeto (procedimiento) intenta acceder a otro objeto (tabla), SQL Server compara quién es el dueño de ambos. 

Como ambos objetos pertenecen a `dbo`, SQL Server asume que el creador del procedimiento confía en sí mismo. Por tanto, la cadena está "intacta": el motor **sólo valida que el usuario tenga permiso de `EXECUTE`** en el procedimiento y omite verificar los permisos sobre la tabla subyacente.
**Ventaja de diseño:** Como indica el tip de la diapositiva, esto permite crear una API hiper-segura. El usuario puede ejecutar la lógica controlada del procedimiento, pero no puede hacer un `SELECT`, `UPDATE` o `DELETE` malicioso directamente sobre la tabla, mitigando ataques o errores humanos.

### 2. La Cadena Rota (Distinto Propietario)

El procedimiento del equipo externo falló porque rompieron la cadena. El procedimiento pertenece a `usr_app` y la tabla a `dbo`. 
Al ser propietarios distintos, SQL Server no puede asumir que haya confianza (para evitar que un desarrollador cualquiera haga un procedimiento que lea tablas de las que no es dueño). La cadena se rompe en ese eslabón.
Al romperse la cadena, SQL Server se vuelve estricto: no le basta con el `EXECUTE`, sino que **exige que el usuario tenga el permiso explícito (ej. `SELECT`) sobre la tabla subyacente**. Al no tenerlo, el acceso es denegado.

### 3. El límite del SQL Dinámico

El caso de la búsqueda dinámica es una de las grandes excepciones de seguridad, señalada en rojo en la diapositiva.
Aunque el procedimiento y la tabla tengan el mismo dueño (`dbo`), **ejecutar SQL Dinámico (`EXEC` o `sp_executesql`) rompe inmediatamente la cadena de propiedad**. 
SQL Server evalúa las cadenas de texto dinámicas en un contexto de seguridad separado (como si el usuario lo hubiera escrito directamente en una consola). Por lo tanto, el motor vuelve a exigir permisos directos sobre la tabla `dbo.Pedido`. 

*Nota: Para solucionar esto sin dar permisos a la tabla, el desarrollador tendría que usar técnicas avanzadas como firmar el procedimiento con un certificado, o usar la cláusula `EXECUTE AS`.*