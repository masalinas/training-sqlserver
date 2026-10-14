## Introducción

En SQL Server, un sinónimo es un objeto de base de datos que funciona como un alias o nombre alternativo para otro objeto (conocido como objeto base), el cual puede ser una tabla, vista, procedimiento almacenado o función.

Principales ventajas y casos de uso:

- Simplificación de identificadores: Permite reemplazar nombres largos y complejos de hasta cuatro partes (Servidor.BaseDeDatos.Esquema.Objeto) por un nombre mucho más corto y directo, facilitando la escritura y lectura del código T-SQL.
- Abstracción y desacoplamiento: Crea una capa de separación entre la aplicación cliente y la estructura real de los datos. Si el objeto base cambia de nombre, de esquema o se migra a un servidor completamente distinto, solo es necesario redefinir el sinónimo; el código de la aplicación o los scripts que lo referencian permanecen intactos.
- Transparencia de objetos remotos: Resulta especialmente útil para consultar objetos ubicados en otras bases de datos o en servidores vinculados (Linked Servers), haciendo que el sistema los trate de forma transparente como si fueran objetos locales.

## Ejemplo

```sql
-- En lugar de escribir la ruta completa en cada consulta:
-- SELECT * FROM ServidorRemoto.CRM_DB.Ventas.Clientes;

-- Se crea el sinónimo:
CREATE SYNONYM dbo.ClientesExternos FOR ServidorRemoto.CRM_DB.Ventas.Clientes;

-- Se consulta utilizando únicamente el alias local:
SELECT * FROM dbo.ClientesExternos;
```