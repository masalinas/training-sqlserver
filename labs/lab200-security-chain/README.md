## Introducción

Crear de forma recursiva login -> usuarios -> permisos

Aquí tienes el script práctico en T-SQL que demuestra la relación exacta en cadena desde el servidor hasta el objeto.
Ejecuta este código conectado como Administrador (sa o un usuario sysadmin):

## Ejemplo

Aquí tienes el script `credentials.sql` práctico en T-SQL que demuestra la relación exacta en cadena desde el servidor hasta el objeto.
Ejecuta este código conectado como Administrador (sa o un usuario sysadmin)

**¿Qué pasa cuando el usuario intenta usar este acceso?**

Cuando el analista inicia sesión en el servidor con el login JuanAnalista, SQL Server procesa la cadena de la siguiente manera:
1. Autenticación (Instancia): Revisa si JuanAnalista y la contraseña coinciden. Si es correcto, ingresa al servidor.
2. Autorización (Base de datos): Intenta usar la base de datos TiendaDemo. El motor valida que existe el usuario AnalistaVentas mapeado a él.
3. Control de Acceso (Esquema/Objeto): Si el usuario ejecuta SELECT * FROM Comercial.Facturas;, SQL Server valida si el usuario tiene permisos directos sobre el objeto o heredados a través de su esquema contenedor (Comercial). Como tiene permiso de esquema, la consulta se ejecuta con éxito. Si intenta consultar una tabla en otro esquema (como dbo.Configuracion), el motor bloqueará el acceso.