## Solución Técnica

### 1. El caso de uso legítimo de la Autenticación SQL

Ambos tienen razón en su contexto, pero la directiva del CISO no es realista al 100%. Como indica la diapositiva, la Autenticación de Windows es siempre la **opción preferida**, pero la Autenticación de SQL Server es el estándar obligatorio para:
* **Apps heredadas:** Sistemas antiguos que solo saben enviar cadenas de conexión con usuario y contraseña planos.
* **Linux/Docker:** Entornos aislados y modernos que a menudo viven "fuera del dominio" corporativo de Windows.

### 2. Identidad y mitigación de contraseñas (CHECK_POLICY)

Cuando se usa Autenticación de SQL Server, las credenciales no dependen de Windows; el login y el hash de la contraseña se guardan internamente en la base de datos del sistema **`master`**.
Para tranquilizar a Ciberseguridad, puedes aplicar la opción `CHECK_POLICY` al crear logins de SQL. Esto obliga a SQL Server a llamar a la API de Windows subyacente para forzar que la contraseña cumpla con los requisitos de complejidad y caducidad del sistema operativo, aunque no sea una cuenta de Active Directory.

### 3. El Modo Mixto y el reinicio

SQL Server permite habilitar el "Modo mixto" (que acepta tanto tokens de Windows como logins de SQL). Sin embargo, este es un cambio estructural profundo en el motor. Como advierte la diapositiva, requiere obligatoriamente **reiniciar el servicio de SQL Server** para que tenga efecto (lo cual requiere una ventana de mantenimiento temporal en producción).

*Nota: Se puede comprobar si un servidor está en modo mixto con el script de la diapositiva: `SELECT SERVERPROPERTY('IsIntegratedSecurityOnly');` (donde 0 significa mixto).*

### 4. El peligro de 'sa' (System Administrator)

El usuario `sa` es la cuenta maestra predeterminada de SQL Server (equivalente al `root` de Linux). El ataque que está sufriendo el servidor es un clásico ataque de **fuerza bruta**. Como los atacantes saben que el usuario `sa` siempre existe en todos los SQL Server del mundo, automatizan diccionarios de claves contra él.

**La regla de oro de la seguridad:** Al habilitar el Modo Mixto, la cuenta `sa` queda expuesta. La mejor práctica absoluta es **deshabilitar la cuenta sa**, renombrarla, o asignarle una contraseña kilométrica y usar en su lugar grupos de administradores de Windows.