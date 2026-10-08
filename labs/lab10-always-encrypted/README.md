## Introducción

Un modelo de seguridad donde los datos se cifran y descifran en el lado del cliente (la aplicación), no en el servidor. Las claves de cifrado nunca se revelan al motor de base de datos. Esto garantiza que ni siquiera los administradores (DBAs o sysadmins) con acceso total al servidor puedan ver los datos confidenciales en texto plano.

Ver la implementación en `C:\git\PruebaAlwaysEncrypted`. 

Ver un ejemplo simulado en y `always_encrypted.sql` desde SQL Server Management Studio.