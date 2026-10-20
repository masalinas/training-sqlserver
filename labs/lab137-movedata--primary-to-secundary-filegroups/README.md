Una precisión: `master` es una base de datos del sistema, no un filegroup, y no hay que tocarla. Entiendo que te refieres al filegroup **PRIMARY** de tu base de datos de usuario. Y sí, es una buena práctica dejar PRIMARY solo para los objetos del sistema y poner los datos de usuario en un filegroup propio. Facilita la administración (restores parciales, backups por filegroup, repartir ficheros en discos distintos). Si todo está en el mismo volumen, no esperes una mejora de rendimiento.

## 1. Crear el nuevo filegroup y hacerlo el predeterminado

```sql
ALTER DATABASE MiBD ADD FILEGROUP FG_DATA;

ALTER DATABASE MiBD ADD FILE (
    NAME = MiBD_data1,
    FILENAME = 'D:\Data\MiBD_data1.ndf',
    SIZE = 1GB, FILEGROWTH = 256MB
) TO FILEGROUP FG_DATA;

ALTER DATABASE MiBD MODIFY FILEGROUP FG_DATA DEFAULT;
```

Con esto, todo objeto nuevo irá a `FG_DATA`. Los existentes siguen en PRIMARY hasta que los muevas.

## 2. Ver qué queda en PRIMARY

```sql
SELECT s.name AS esquema, o.name AS objeto, i.name AS indice,
       i.type_desc, ds.name AS filegroup
FROM sys.indexes i
JOIN sys.objects o ON o.object_id = i.object_id
JOIN sys.schemas s ON s.schema_id = o.schema_id
JOIN sys.data_spaces ds ON ds.data_space_id = i.data_space_id
WHERE o.is_ms_shipped = 0 AND ds.name = 'PRIMARY';
```

## 3. Mover cada objeto

Mover una tabla significa reconstruir su índice clustered en el nuevo filegroup, y lo mismo con cada índice no clustered.

**Tabla con índice clustered (incluida una PK clustered):** reconstruir con `DROP_EXISTING`, con la misma definición y el mismo nombre.

```sql
CREATE UNIQUE CLUSTERED INDEX PK_Pedido
    ON dbo.Pedido (PedidoId)
    WITH (DROP_EXISTING = ON, ONLINE = ON)   -- ONLINE solo en Enterprise/Azure
    ON FG_DATA;
```

**Índices no clustered:** igual, uno a uno.

```sql
CREATE NONCLUSTERED INDEX IX_Pedido_ClienteId
    ON dbo.Pedido (ClienteId)
    WITH (DROP_EXISTING = ON)
    ON FG_DATA;
```

**Heaps (tablas sin clustered):** crear un clustered temporal en el nuevo filegroup y borrarlo. El heap se queda donde estaba el índice.

```sql
CREATE CLUSTERED INDEX tmp_move ON dbo.TablaHeap (ColumnaCualquiera) ON FG_DATA;
DROP INDEX tmp_move ON dbo.TablaHeap;
```

## 4. Cuidado con los datos LOB

Reconstruir el índice **no mueve** las columnas `varchar(max)`, `nvarchar(max)`, `varbinary(max)`, `xml`, etc. Esas páginas siguen en el filegroup original. Para detectarlo:

```sql
SELECT OBJECT_NAME(p.object_id) AS tabla, au.type_desc, ds.name AS filegroup
FROM sys.allocation_units au
JOIN sys.partitions p ON p.partition_id = au.container_id
JOIN sys.data_spaces ds ON ds.data_space_id = au.data_space_id
WHERE au.type_desc = 'LOB_DATA' AND ds.name = 'PRIMARY'
  AND OBJECTPROPERTY(p.object_id, 'IsUserTable') = 1;
```

Para esas tablas hay que recrearlas con `TEXTIMAGE_ON FG_DATA`, copiar los datos y renombrar. También se puede usar el truco del esquema de partición.

## 5. Después

- Los objetos del sistema siguen en PRIMARY, así que el `.mdf` no desaparece, pero quedará casi vacío.
- No hagas `SHRINKFILE` agresivo del `.mdf`, porque fragmenta los índices. Redúcelo solo si necesitas recuperar espacio, y hazlo con cuidado.
- Es recomendable que el `.mdf` mantenga un tamaño pequeño y fijo.

## Recomendaciones

- Haz un backup completo antes y ejecútalo fuera de horas: reconstruir índices genera mucho log y bloqueos (si no usas `ONLINE`).
- Reserva espacio en `FG_DATA` equivalente al de los datos que vas a mover, más margen.
- Prueba primero en una copia de la base de datos.

## Explicación del script automatización

El script mover_objetos_filegroup.sql genera los CREATE INDEX ... DROP_EXISTING ... ON FG_DATA de toda la base de datos. No lo he ejecutado contra ningún servidor, así que pruébalo primero en una copia.

Cómo usarlo

Conéctate a la base de datos objetivo y ajusta las variables del principio: @FilegroupDestino (por defecto FG_DATA), @Online y @MaxDop.
Déjalo con @Ejecutar = 0 para revisar las sentencias generadas, que salen ordenadas por fase.
Cuando estés conforme, pon @Ejecutar = 1. Las ejecuta una a una, muestra el progreso y, si alguna falla, sigue con la siguiente y cuenta los errores.

Qué mueve

- **Heaps**: crea un clustered temporal y lo borra.
- **Clustered**: incluye PK y UNIQUE, y los clustered columnstore.
- **Nonclustered**: también los nonclustered columnstore, e índices sobre vistas indexadas.
- **Orden**: primero los heaps, luego los clustered y al final los nonclustered. Así los nonclustered se reconstruyen una sola vez.
- **Opciones**: conserva FILLFACTOR, PAD_INDEX, INCLUDE, filtros, locks y compresión.

Qué no mueve (los lista en dos informes finales)

- **Índices que se quedan**: los XML, los espaciales y los deshabilitados. Hay que moverlos a mano.
- **Columnas max y xml**: las columnas varchar(max), nvarchar(max), varbinary(max) y xml siguen en el filegroup origen, porque reconstruir el índice no las mueve. El segundo informe las lista por tabla con su tamaño; para moverlas hay que recrear la tabla con TEXTIMAGE_ON.
- **Heaps sin columna válida**: los heaps sin ninguna columna que se pueda usar como clave quedan fuera y no aparecen en los informes.

Las PK referenciadas por FKs se pueden reconstruir con DROP_EXISTING sin tocar las FKs, porque la definición no cambia. Antes de ejecutar, haz backup, comprueba el espacio libre en FG_DATA y revisa que el log pueda crecer. @Online = 1 solo funciona en Enterprise o Azure SQL.

## Ejecución
**Con SSMS o Azure Data Studio**

1. Descarga mover_objetos_filegroup.sql y ábrelo con Archivo → Abrir → Archivo.
2. Selecciona la base de datos objetivo en el desplegable. También puedes añadir USE [MiBD]; en la primera línea.
3. Ajusta las variables del principio: @FilegroupDestino y, si procede, @Online y @MaxDop.
4. Pulsa Ejecutar (F5) con @Ejecutar = 0. Verás la lista de sentencias generadas en la pestaña de resultados, más los dos informes de lo que no se mueve.
5. Cuando la revisión esté bien, cambia a @Ejecutar = 1 y vuelve a ejecutar. El progreso aparece en la pestaña Mensajes.

**Con sqlcmd**
```sql
sqlcmd -S MiServidor -d MiBD -E -i mover_objetos_filegroup.sql -o salida.txt
```

**Requisitos antes de lanzarlo**

- El filegroup destino debe existir antes (ALTER DATABASE ... ADD FILEGROUP y su fichero .ndf), o el script se detiene con un error.
- La cuenta necesita permiso ALTER sobre las tablas (por ejemplo, db_owner).
- Hazlo fuera de horario si no usas ONLINE = ON, porque las tablas quedan bloqueadas mientras se reconstruyen.
