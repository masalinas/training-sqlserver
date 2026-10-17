## Introducción

Row-Level Security (Seguridad a nivel de fila): Permite restringir el acceso a los registros de una tabla basándose en el contexto de ejecución del usuario. Mediante políticas de seguridad, se puede lograr que, bajo una misma consulta `SELECT * FROM Pedido`, un vendedor solo vea sus propios pedidos, mientras que el gerente regional vea las de todo el equipo, sin necesidad de modificar el código de la aplicación.


**Ejemplo práctico: Un sistema de ventas**

Imagina una tabla de Ventas donde trabajan vendedores de distintas regiones (Norte, Sur, Este, Oeste). Sin RLS, tendrías que crear vistas distintas para cada región o controlar el filtro desde el código de tu aplicación web. Con RLS, el proceso se automatiza:
• Si el vendedor "Juan" (región Norte) ejecuta: SELECT * FROM Ventas;
• El motor de SQL Server intercepta la consulta y, por detrás, la transforma en: SELECT * FROM Ventas WHERE Region = 'Norte';
• Juan nunca sabrá que existen filas de otras regiones en esa misma tabla.