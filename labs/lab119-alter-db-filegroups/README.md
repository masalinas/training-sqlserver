## Introduccion
Vamos a ver como cambiar el tamaño de los ficheros primarios y secundarios de la base de datos antes creada y configurada

## Ejemplo

Podemos ejecutar el ejemplo T-SQL `alter-filegroups.sql` para modificar estos tamaños. Las lineas del mismo representan lo siguiente:

La primer linea de codigo sirve para cambiar el grupo de archivos predeterminado

```sql
ALTER DATABASE training MODIFY FILEGROUP FG_DATOS DEFAULT;
GO
```

• ALTER DATABASE training: Indica que vas a realizar una modificación en la estructura o configuración de la base de datos llamada training.
• MODIFY FILEGROUP FG_DATOS DEFAULT;: Cambia el grupo de archivos predeterminado (por defecto) de la base de datos al grupo FG_DATOS (el cual creaste en el script anterior). A partir de que ejecutas esta línea, cualquier tabla o índice nuevo que crees se guardará automáticamente en FG_DATOS, a menos que especifiques lo contrario. De forma nativa, el grupo por defecto siempre es el PRIMARY.
• GO: Envía esta instrucción al motor para que se ejecute inmediatamente antes de pasar a las siguientes consultas.

Esta consulta extrae información técnica sobre los archivos físicos (.mdf, .ndf, .ldf) que componen la base de datos training:

```sql
SELECT name, physical_name, size*8/1024 AS size_mb,
  growth*8/1024 AS growth_mb, is_percent_growth 
FROM training.sys.database_files;
```

• SELECT name, physical_name...: Solicita el nombre lógico del archivo y su ruta física en el disco duro (por ejemplo, /var/opt/mssql/data/training.mdf).
• size*8/1024 AS size_mb: Internamente, SQL Server almacena el tamaño de los archivos en páginas de 8 KB. Para convertir este valor a Megabytes (MB) y que sea legible para un humano, se multiplica por 8 (para pasarlo a KB) y se divide entre 1024 (para pasarlo a MB).
• growth*8/1024 AS growth_mb: Hace exactamente la misma operación matemática para mostrarte cuánto va a crecer el archivo (el FILEGROWTH) expresado en Megabytes.
• is_percent_growth: Te devuelve un valor booleano (1 o 0). Te indica si el crecimiento del archivo está configurado en porcentaje (como 10%) o en un tamaño fijo en Megabytes (como el 128MB de tu ejemplo anterior).
• FROM training.sys.database_files;: Especifica que la información se debe extraer de la vista de catálogo del sistema sys.database_files apuntando específicamente a la base de datos training.

Finalmente la consulta final

Verificar el grupo de archivos predeterminado

`SELECT name, is_default FROM training.sys.filegroups;`

• SELECT name, is_default: Solicita el nombre de los grupos de archivos existentes y una columna llamada is_default (es predeterminado).
• FROM training.sys.filegroups;: Consulta la vista de catálogo que lista los grupos de archivos de la base de datos training.
• Resultado esperado: Tras haber ejecutado la primera instrucción (ALTER DATABASE), al correr esta línea verás que el grupo FG_DATOS tendrá un 1 (Verdadero) en la columna is_default, mientras que el grupo PRIMARY tendrá un 0 (Falso)