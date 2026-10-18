# Caso Práctico: La API de base de datos y la cadena rota

## El Contexto

Como Arquitecto de Datos, has diseñado una política de seguridad estricta para la base de datos de producción: **Ningún usuario final ni aplicación debe tener acceso directo a las tablas**. Quieres que la base de datos funcione como una API, donde todas las lecturas y escrituras se hagan exclusivamente a través de Procedimientos Almacenados (Stored Procedures).

Para implementar esto, creas el procedimiento `app.usp_AltaPedido` (perteneciente al esquema/propietario `dbo`) que inserta datos en la tabla `dbo.Pedido` (también del propietario `dbo`). Le das al usuario operador únicamente permiso de `EXECUTE` sobre el procedimiento. El usuario prueba a crear un pedido y **funciona perfectamente**, sin tener permisos de `INSERT` en la tabla.

Al ver el éxito, el equipo de desarrollo intenta replicar tu modelo, pero chocan con dos muros:

1. Crean un procedimiento llamado `rep.usp_ReporteDiario`. Como lo hizo un equipo externo, le asignaron un propietario distinto al esquema (`owner: usr_app`), aunque lee de la misma tabla `dbo.Pedido`. Al ejecutarlo, el usuario recibe un error: *"Permiso DENEGADO sobre el objeto 'Pedido'"*.

2. Otro desarrollador crea el procedimiento `app.usp_BusquedaDinamica` (propietario `dbo`). Dentro del código, para permitir búsquedas flexibles, usa SQL Dinámico: `EXEC('SELECT * FROM dbo.Pedido WHERE ' + @filtro)`. Al ejecutarlo, también lanza el error *"Permiso DENEGADO sobre el objeto 'Pedido'"*.

## Misión del Alumno

Apoyándote en el diagrama y las alertas de la diapositiva "Ownership chaining (cadena de propiedad)", explica al equipo de desarrollo por qué su código está fallando mientras que tu procedimiento original funciona sin problemas:

1. Explica el concepto de la **"Cadena intacta"**: ¿Por qué tu procedimiento `app.usp_AltaPedido` logró insertar un registro en la tabla sin que el usuario tuviera permisos de `INSERT`? ¿Cuál es la gran ventaja de diseño de esta característica?

2. Analiza el fallo del procedimiento `rep.usp_ReporteDiario`: ¿Por qué falló si el usuario también tenía permisos de `EXECUTE` sobre este procedimiento? ¿Qué comprobación extra hizo SQL Server?

3. Analiza el fallo de `app.usp_BusquedaDinamica`: Si tanto este procedimiento como la tabla pertenecen al mismo propietario (`dbo`), la cadena debería estar intacta. ¿Por qué el motor de base de datos denegó el acceso a la tabla?