## Solución Técnica

### 1. Los permisos efectivos y REVOKE vs DENY

Actualmente, el `rol_operador` **solo tiene permiso de `SELECT`**. 

El administrador junior confundió los conceptos de quitar un permiso y prohibir un permiso:
* **`REVOKE INSERT`**: El comando `REVOKE` simplemente elimina un `GRANT` anterior. Al revocar el `INSERT`, el rol vuelve a un estado neutro (sin permiso), pero no lo prohíbe. Si el usuario consiguiera el permiso por otra vía (otro rol), podría insertar.
* **`DENY DELETE`**: Esto es un bloqueo explícito y absoluto. No solo dice "no tienes el permiso", sino que graba a fuego la regla "tienes prohibido realizar esta acción bajo cualquier circunstancia".

### 2. La regla de precedencia (DENY siempre gana)

El problema de Ana es el choque de permisos al pertenecer a múltiples roles. 
Como indica la regla de oro de la diapositiva: **"Los roles se acumulan, salvo DENY" (DENY > GRANT)**.

Ana pertenece a `rol_supervisor` (`GRANT DELETE`) pero sigue perteneciendo a `rol_operador` (`DENY DELETE`). Cuando SQL Server evalúa si Ana puede borrar, junta todos sus permisos. Al detectar que existe al menos un `DENY` en su árbol de identidades, este anula inmediatamente cualquier `GRANT` que pudiera tener por ser supervisora. 

**Solución:** Para que Ana pueda borrar, debe ser eliminada del `rol_operador` (que contiene el bloqueo tóxico) o se debe quitar el `DENY` de ese rol usando `REVOKE DELETE ON dbo.Pedido FROM rol_operador;`.

### 3. Diagnóstico de permisos efectivos

Para demostrarle a Ana o al desarrollador qué es lo que SQL Server le está permitiendo hacer en ese preciso momento, debe iniciar sesión con su usuario y ejecutar la función de sistema indicada en el script:

```sql
SELECT * FROM sys.fn_my_permissions(N'dbo.Pedido', N'OBJECT');
```

Esta función es vital para los DBAs, ya que no lee las tablas de configuración, sino que calcula dinámicamente la resolución final de conflictos (GRANTs vs DENYs) en el contexto de seguridad del usuario que la ejecuta.