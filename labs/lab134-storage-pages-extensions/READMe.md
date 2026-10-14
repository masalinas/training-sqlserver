## Introducción

La arquitectura de almacenamiento es La ubicación lógica y física de los propios archivos de datos y de registro, los grupos de archivos (Filegroups) y cómo se está asignando el espacio interno en páginas y extensiones. Se refiere a cómo organiza SQL Server por dentro el espacio dentro de los archivos de datos, es decir, a qué ocurre dentro de un .mdf o .ndf una vez que ya sabes dónde está.

La frase tiene dos partes. La primera es la arquitectura externa: qué archivos hay, en qué disco están y en qué filegroup. La segunda, es la arquitectura interna, que se basa en dos unidades:

- Página (page): es la unidad mínima de almacenamiento y de I/O, de **8 KB**. Los datos de tablas e índices viven en páginas. Una fila normalmente no puede ocupar más de una página, y de los 8 KB solo unos 8060 bytes son útiles, porque el resto es cabecera. Si una fil superase el tamaño de una pagina, SQL Server no divide la fila entre dos páginas, sino que saca algunas columnas de la página principal y las guarda aparte, dejando un puntero. El comportamiento depende del tipo de columna.

    - Si la fila supera los ~8060 bytes, SQL Server mueve una o más de estas columnas (empezando por la más ancha) a otra unidad de asignación llamada ROW_OVERFLOW_DATA cuando las columnas de longitud variable normales (varchar(n), nvarchar(n), varbinary(n), sql_variant 
    - Si la fila supera los ~8060 bytes, SQL Server mueve una o más de estas columnas cuando las columnas son de tipos grandes (varchar(max), nvarchar(max), varbinary(max), xml, y los antiguos text, ntext, image)

- Extensión (extent): es un **grupo de 8 páginas contiguas, 64 KB**, y es la unidad en la que se reserva espacio. Cuando una tabla o un índice crece, SQL Server no le da páginas sueltas, sino extensiones enteras. Pueden ser uniformes (todas sus páginas son de un único objeto) o mixtas (se reparten entre varios objetos pequeños). En las versiones modernas, para bases de datos de usuario lo normal es usar extensiones uniformes desde el principio.

Archivo de datos
└── Extensión (64 KB) ── 8 páginas de 8 KB
      ├── Página 1 ── cabecera + filas + espacio libre
      ├── Página 2
      └── ...

Por tanto, “cómo se está asignando el espacio en páginas y extensiones” equivale a preguntarse:

Cuántas extensiones y páginas ha reservado cada tabla o índice, y cuántas usa de verdad.
Qué tan llenas están las páginas. Páginas medio vacías por page splits o por un FILLFACTOR bajo significan más I/O y más memoria para leer los mismos datos.
Cuánta fragmentación hay, es decir, si las páginas siguen un orden lógico o están desordenadas en el archivo.
Cómo se reparte el espacio entre los archivos del filegroup. SQL Server usa proportional fill, de modo que escribe más en los archivos con más espacio libre.

Para saberlo, SQL Server mantiene unas páginas especiales de control (GAM, SGAM, PFS e IAM) que registran qué extensiones y páginas están libres o asignadas, y a qué objeto pertenecen.

Esto importa para el diagnóstico porque una base de datos puede parecer sana por fuera, con archivos y filegroups bien repartidos, y tener por dentro mucha fragmentación o espacio desperdiciado. Por eso se incluye en la auditoría. Las vistas habituales son `sys.dm_db_partition_stats` (páginas reservadas y usadas), `sys.dm_db_index_physical_stats` (fragmentación y `avg_page_space_used_in_percent`) y el procedimiento `sp_spaceused`.    