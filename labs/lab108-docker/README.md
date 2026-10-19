## Introducción

Primera versión en Linux y Docker: Un hito histórico. Microsoft desacopló el motor de base de datos del sistema operativo Windows mediante una capa de abstracción (SQLPAL). Esto permitió ejecutar SQL Server nativamente en distribuciones como Ubuntu, RHEL y SUSE, y su empaquetado en contenedores Docker, abriendo la puerta a despliegues en Kubernetes y arquitecturas modernas de microservicios.

Ver un ejemplo de despliegue de SQL Server en Docker con `docker-compose.yml` ejecutarlo desde el shell con Docker instalado.

# Ejemplo
Si queremos arrancar SQL Server 2025 directamente en docker ejecutamos este comando:

```shell
docker run -d \
  --name sqlserver \
  -p 1433:1433 \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD='TuPasswordSeguro123!'" \
  -v sqldata:/var/opt/mssql/data \
  -v sqlbackups:/var/opt/mssql/backup \
  mcr.microsoft.com/mssql/server:2025-latest
```

Arrancar el servicio de SQL Server utilizando docker compose. El modo detach (libera la consola o shell en el arranque).
```shell
docker compose up -d
```

Parar y borrar el servicio de SQL Server y los volumenes asociados al mismo. La imagen de SQL Server bajada en la instalacin permanece.
```shell
docker compose down -v
```
