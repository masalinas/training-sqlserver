# ====================================================================
# 1. Definición de colores corporativos / estándar
# ====================================================================
$C_Info  = "Cyan"
$C_Exito = "Green"
$C_Error = "Red"
$C_Aviso = "Yellow"
$C_Debug = "DarkGray"

# 1. Definición de variables de entorno (Ajustado a tu laboratorio)
$Servidor   = "localhost,1433"

# Definimos las rutas dinámicas usando carpetas relativas
$ArchivoSQL = "$PSScriptRoot\sql\script.sql"
$CarpetaResultados = "$PSScriptRoot\resultados"
$ArchivoLog = "$CarpetaResultados\script.log"

# ====================================================================
# NUEVO: Comprobar si la subcarpeta 'resultados' existe. Si no, crearla.
# ====================================================================
if (-not (Test-Path -Path $CarpetaResultados)) {
    # Creamos un directorio en lugar de un archivo
    New-Item -Path $CarpetaResultados -ItemType Directory -Force | Out-Null
    Write-Host "La carpeta 'resultados' no existía y ha sido creada." -ForegroundColor $C_Debug
}
# ====================================================================

# 2. Captura de credenciales seguras vía variables de entorno
#$Usuario    = "sa"
#$Password   = "!Thingtrack2010"
$Usuario  = $env:SQL_USER
$Password = $env:SQL_PASSWORD

# Validación de seguridad: abortar si la variable está vacía
if ([string]::IsNullOrWhiteSpace($Password)) {
    Write-Host "ERROR CRÍTICO: La variable de entorno SQL_PASSWORD no está definida." -ForegroundColor $C_Error
    exit 1
}

Write-Host "Iniciando despliegue de base de datos..." -ForegroundColor $C_Info

# 3. Ejecución de sqlcmd
# Usamos -b para abortar en caso de error y -C para confiar en el certificado
Write-Host "Ejecutando: sqlcmd -S $Servidor -U $Usuario -P ****** -C -b -i $ArchivoSQL -o $ArchivoLog" -ForegroundColor $C_Debug
sqlcmd -S $Servidor -U $Usuario -P $Password -C -b -i $ArchivoSQL -o $ArchivoLog

# 4. Validación del resultado
# $LASTEXITCODE captura el código de retorno del ejecutable anterior (0 = Éxito)
if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Despliegue completado con éxito!" -ForegroundColor $C_Exito
}
else {
    Write-Host "¡ALERTA! El script T-SQL ha fallado." -ForegroundColor $C_Error
    Write-Host "Últimas líneas del registro de errores:" -ForegroundColor $C_Aviso

    # Leemos automáticamente las últimas 5 líneas del archivo de salida para ver el error
    Get-Content $ArchivoLog -Tail 5

    # Forzamos a que PowerShell también termine con error (útil para GitHub Actions / Jenkins)
    exit 1
}
