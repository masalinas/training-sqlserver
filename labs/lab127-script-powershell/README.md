## Introducción

Automatizacin detareas de SQL Server utlizando powershell y el comando sqlcmd para interactuar con la base de datos.

## Ejemplo

```shell
$env:SQL_USER="sa"; $env:SQL_PASSWORD="!Thingtrack2010"; .\sample.ps1
La carpeta 'resultados' no existÃ­a y ha sido creada.
Iniciando despliegue de base de datos...
Ejecutando: sqlcmd -S localhost -U sa -P ****** -C -b -i C:\git\training-sqlserver\labs\lab98-script-powershell\sql\script.sql -o C:\git\training-sqlserver\labs\lab98-script-powershell\resultados\script.log
Â¡Despliegue completado con Ã©xito!
```
