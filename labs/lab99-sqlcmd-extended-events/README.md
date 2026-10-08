## Introducción

Lanzar SQL con sqlcmd

```bash
sqlcmd -S localhost -U sa -P "!Thingtrack2010" -C -Q "SELECT @@VERSION"
sqlcmd -S localhost -E -C -Q "SELECT @@VERSION"
```

Los Extended Events (Eventos Extendidos o XEvents) son el sistema de monitorización de rendimiento nativo, avanzado y de bajo impacto de SQL Server. Fueron diseñados para reemplazar definitivamente al antiguo y pesado SQL Server Profiler (SQL Trace).
La gran ventaja de los XEvents es que están integrados profundamente en el núcleo del motor relacional. Mientras que el antiguo Profiler consumía muchísima CPU y RAM (y no se recomendaba dejarlo encendido en producción), los Extended Events son tan ligeros que puedes dejarlos corriendo permanentemente para capturar telemetría sin degradar el rendimiento del servidor.

Para dominar los XEvents, solo necesitas entender la arquitectura de sus 4 componentes básicos:
1. Eventos (Events): Son los "anzuelos" que el motor lanza cuando ocurre algo específico. Hay miles disponibles: desde que una consulta termina (sql_statement_completed), hasta que ocurre un bloqueo (lock_deadlock), o cuando el motor tiene que leer del disco duro (page_fault).

2. Acciones (Actions): Es la información extra que le pides al motor que recolecte cuando el evento se dispara. Por ejemplo, si se dispara el evento "consulta terminada", puedes pedirle la Acción de adjuntar el "nombre de usuario", "la IP de origen" o "el texto T-SQL de la consulta".

3. Predicados (Predicates / Filtros): Es la condición para que el evento se guarde. Aquí es donde los XEvents brillan: puedes decirle "captura las consultas terminadas, SOLO SI la duración fue mayor a 3 segundos". El motor evalúa esto en microsegundos; si la consulta tardó 1 segundo, la descarta inmediatamente sin consumir recursos.

4. Destinos (Targets): Es el lugar donde se guardan los datos recolectados. Los más básicos son:
- ring_buffer: Memoria RAM. Rápido, pero los datos se pierden si apagas el servidor. Ideal para desarrollo.
- event_file: Un archivo físico en el disco (.xel). Ideal para auditorías en producción.

## Ejemplo

Ver un ejemplo de creación de un evento en `event.sql` y la simulación del mismo en `simulate.sql` desde SQL Server Management Studio.

