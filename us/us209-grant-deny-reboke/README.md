# Caso Práctico: El becario bloqueado y la regla de oro del DENY

## El Contexto

Eres el DBA de la empresa. El departamento de Atención al Cliente tiene un rol en base de datos llamado `rol_operador`. Los usuarios de este rol necesitan poder consultar los pedidos, pero por políticas de seguridad, no pueden borrarlos.

Para configurar esto, un administrador junior ejecutó exactamente el script que aparece en la diapositiva:

```sql
GRANT SELECT, INSERT ON dbo.Pedido TO rol_operador;
DENY DELETE ON dbo.Pedido TO rol_operador;
REVOKE INSERT ON dbo.Pedido FROM rol_operador;
```

Hoy, una operadora llamada Ana (que pertenece a `rol_operador`) ha sido ascendida temporalmente a supervisora. Para darle más privilegios, el administrador junior la añade a un segundo rol llamado `rol_supervisor`. Este nuevo rol tiene un `GRANT DELETE ON dbo.Pedido`, para que los supervisores puedan cancelar pedidos anulados.

Sin embargo, Ana te llama frustrada: *"El sistema me da un error de 'Permiso denegado' cuando intento borrar un pedido, y tampoco me deja insertar pedidos nuevos. ¡Pero soy supervisora!"*

## Misión del Alumno

Apoyándote en la diapositiva "GRANT, DENY y REVOKE", analiza este incidente de seguridad y responde:

1. Tras la ejecución del script inicial, ¿qué permisos efectivos tiene realmente el `rol_operador` sobre la tabla `dbo.Pedido`? Explica la diferencia entre lo que hizo el comando `DENY DELETE` y el comando `REVOKE INSERT`.

2. Si Ana pertenece al `rol_supervisor` (que tiene un `GRANT DELETE` explícito), ¿por qué SQL Server le bloquea el borrado? Explica cómo funciona la acumulación de roles y la precedencia.

3. ¿Qué comando T-SQL exacto (incluido en la diapositiva) le pedirías a Ana que ejecute en su sesión para que ella misma pueda comprobar qué permisos efectivos tiene realmente sobre la tabla de pedidos?