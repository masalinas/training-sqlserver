## Introducción

La utilidad `sqlcmd` es una herramienta de línea de comandos (CLI) de Microsoft que permite conectarse a SQL Server (así como a Azure SQL y Microsoft Fabric) para ejecutar consultas, procedimientos y scripts de Transact-SQL (T-SQL).

Es una herramienta fundamental para administradores y desarrolladores debido a su ligereza y capacidad de automatización


## Modos de funcionamiento principales

1. Modo Interactivo: Abre una sesión en la terminal donde se escriben consultas en vivo. El prompt muestra 1> para ingresar el código.
2. Modo de Comando (Automatización): Permite ejecutar un archivo de script .sql existente o lanzar una consulta directa sin abrir la sesión interactiva.
3. Modo SQLCMD en SSMS: SQL Server Management Studio cuenta con una opción para activar este modo en su editor de consultas, permitiendo combinar scripts T-SQL con variables propias de la herramienta


## Parámetros comunes de sintaxis

Al ejecutar sqlcmd en la consola de comandos, se suelen utilizar las siguientes opciones esenciales:
- -S (Server): Especifica el nombre del servidor o la instancia de SQL Server (ej: -S localhost\SQLEXPRESS).
- -E (Trusted): Utiliza la autenticación de Windows del usuario actual (conexión de confianza).
- -U y -P: Indican el usuario y la contraseña si se prefiere usar la autenticación de SQL Server.
- -q o -Q: Ejecutan una consulta directamente desde la línea de comandos. La variante -Q cierra la utilidad inmediatamente tras mostrar el resultado.
- -i (Input): Especifica la ruta de un archivo de script .sql de entrada que se desea ejecutar.
- -o (Output): Redirecciona el resultado de la consulta hacia un archivo de texto en disco

```bash
sqlcmd -S localhost -U sa -P "!Thingtrack2010" -C -Q "SELECT @@VERSION"
sqlcmd -S localhost -E -C -Q "SELECT @@VERSION"
```


## Comandos internos y de flujo

Cuando estás en el modo interactivo, existen reglas específicas para que los comandos se procesen:
- `GO`: Es obligatorio escribirlo en una línea nueva y presionar Enter para que sqlcmd envíe el bloque de código acumulado al servidor y lo ejecute.
- `EXIT` o `QUIT`: Termina la sesión de la herramienta y regresa al símbolo del sistema local.
- `:ED`: Abre el editor de texto configurado en el sistema con el contenido del búfer actual para modificarlo fácilmente.
- `:RESET`: Borra el búfer de comandos que aún no ha sido enviado con un GO

 ## Casos de uso clave

- **Automatización de tareas**: Programación de respaldos, mantenimiento de índices o migraciones de datos mediante scripts .bat, PowerShell o tareas programadas de Windows.

Ejemplo: Este comando se conecta al servidor local mediante autenticación de Windows, ejecuta una consulta rápida y guarda el resultado en un archivo de texto. Es el que se utiliza dentro de scripts automatizados. Crea un archivo llamado mis_bases_de_datos.txt con la lista de tus primeras 5 bases de datos y la fecha en que fueron creadas.

```bash
sqlcmd -S localhost -E -Q "SELECT TOP 5 name, create_date FROM sys.databases;" -o "C:\reportes\mis_bases_de_datos.txt"
```

- **Ejecución de archivos gigantes**: Ideal para desplegar scripts de bases de datos masivas que harían colapsar la interfaz gráfica de SSMS.

Ejemplo: Si tienes un archivo .sql muy pesado (por ejemplo, una copia de seguridad de datos de 500 MB que bloquea el SQL Server Management Studio), sqlcmd lo ejecuta en segundos consumiendo el mínimo de memoria

```bash
sqlcmd -S localhost\SQLEXPRESS -E -i "C:\scripts\crear_tablas_masivas.sql"
```

- Conexión de Diagnóstico (DAC): Utilizando el parámetro -A, permite el ingreso exclusivo a administradores cuando el servidor está saturado o congelado y no acepta conexiones normales

Ejemplo:

```bash
sqlcmd -S localhost -E -A
```

Te abre la línea de comandos interactiva (1>). Una vez dentro, puedes ejecutar comandos de emergencia para ver qué proceso está bloqueando el servidor y finalizarlo:

```bash
1> SELECT session_id, status, command FROM sys.dm_exec_requests;
2> GO
```
