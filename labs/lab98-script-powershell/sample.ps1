# 1. Definición de variables de entorno (Ajustado a tu laboratorio)
$Servidor   = "127.0.0.1,1433"
#$Usuario    = "sa"
#$Password   = "!Thingtrack2010"
$ArchivoSQL = "C:\ruta\a\tu\script.sql"
$ArchivoLog = "C:\ruta\a\tu\resultado.log"

Write-Host "Iniciando despliegue de base de datos..." -ForegroundColor Cyan

# 2. Captura de credenciales seguras vía variables de entorno
$Usuario  = $env:SQL_USER
$Password = $env:SQL_PASSWORD

# Validación de seguridad: abortar si la variable está vacía
if ([string]::IsNullOrWhiteSpace($Password)) {
    Write-Host "ERROR CRÍTICO: La variable de entorno SQL_PASSWORD no está definida." -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando despliegue de base de datos..." -ForegroundColor Cyan

# 3. Ejecución de sqlcmd
# Usamos -b para abortar en caso de error y -C para confiar en el certificado
sqlcmd -S $Servidor -U $Usuario -P $Password -C -b -i $ArchivoSQL -o $ArchivoLog

# 4. Validación del resultado
# $LASTEXITCODE captura el código de retorno del ejecutable anterior (0 = Éxito)
if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Despliegue completado con éxito!" -ForegroundColor Green
}
else {
    Write-Host "¡ALERTA! El script T-SQL ha fallado." -ForegroundColor Red
    Write-Host "Últimas líneas del registro de errores:" -ForegroundColor Yellow

    # Leemos automáticamente las últimas 5 líneas del archivo de salida para ver el error
    Get-Content $ArchivoLog -Tail 5

    # Forzamos a que PowerShell también termine con error (útil para GitHub Actions / Jenkins)
    exit 1
}
