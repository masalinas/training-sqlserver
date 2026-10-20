## Introducción

Ocurre cuando hay que insertar una fila en una página que ya está llena y que debe ir justo ahí por su valor de clave.

Ejemplo simplificado, con páginas de 4 filas:

Antes:   Página A: [10] [20] [30] [40]     (llena)
Insertas la clave 25. Debe ir entre 20 y 30, pero no cabe.

Después: Página A: [10] [20] [25]          (~50-75 % llena)
         Página B: [30] [40]               (~50 % llena, página nueva)

SQL Server hace entonces lo siguiente:

1. Reserva una página nueva.
2. Mueve aproximadamente la mitad de las filas a ella.
3. Actualiza los enlaces de las páginas vecinas y la página padre del índice.
4. Registra todo en el log de transacciones.

Es una operación bastante cara: más escrituras, más log y bloqueos más largos que un insert normal. Además, la página nueva puede quedar físicamente lejos de la original.

## Por qué el GUID aleatorio lo agrava

Con INT IDENTITY (clave creciente): cada fila nueva es mayor que todas las anteriores, así que va siempre a la última página. Cuando se llena, se añade una página nueva al final. No hay split, sino una simple asignación, y todas las páginas quedan casi al 100 %.\

Con NEWID() (clave aleatoria): cada inserción cae en una página cualquiera del índice. Como el índice ya está lleno de páginas casi al límite, la mayoría de inserciones provocan un split. En régimen estable, las páginas acaban en torno al 50-70 % de ocupación. Un índice que debería ocupar 1 GB puede acabar en 1,5-2 GB.

## Consecuencias prácticas

- Más espacio en disco, en backups y en memoria. Cada página medio vacía ocupa 8 KB en el buffer pool igualmente.
- Más lecturas para el mismo número de filas, sobre todo en scans y consultas por rango.
- Peor read-ahead: SQL Server lee por adelantado bloques contiguos, y eso funciona peor con páginas dispersas.
- Más log en cada split, lo que afecta a backups de log, replicación y Always On.
- Mantenimiento recurrente: reorganizar o reconstruir el índice con frecuencia, y se vuelve a fragmentar rápido.
