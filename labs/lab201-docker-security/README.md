## Introducción

Configurar conexion de un microservicio en ASP con Docker

**Activar obligatoriamente la Autenticaci￳n de SQL Server**

Dado que estas en Docker, debes configurar tu base de datos en Modo Mixto (Windows y SQL Server). Tu cadena de conexi￳n (Connection String) requerira un usuario y una contrase￱a explicitos.

- Error com￺n a evitar: Nunca uses Trusted_Connection=True; o Integrated Security=True; en tu archivo de configuración dentro de Docker, porque el contenedor Linux fallará inmediatamente al intentar buscar un dominio de Windows que no conoce.

**Prohibido "Hardcodear" credenciales en el código**

Bajo ninguna circunstancia dejes el usuario y la contraseña escritos directamente en el archivo appsettings.json o web.config de tu imagen de Docker. Si subes esa imagen a un repositorio (como Docker Hub o un registro privado), tus credenciales quedarán expuestas.

**Inyección mediante Variables de Entorno**

Configura un appsettings.json base con una cadena de conexión "plantilla" o vacía, y haz que tu contenedor reciba las credenciales reales en tiempo de ejecución a través de variables de entorno de Docker.

## Ejemplo

Aquí tienes el script `docker-compose.yml` práctico en que demuestra como definir las credenciales a la hora de configurar un microservicio de backend en ASP

**Nota de arquitectura**: 
Fíjate que el formato ConnectionStrings__DefaultConnection (con doble guion bajo) es la convención que utiliza .NET para mapear variables de entorno directamente a la jerarquía de configuraciones de tu aplicación. El valor ${DB_PASSWORD} se leerá de manera segura desde un archivo .env local en tu servidor de despliegue que no se sube al control de versiones.