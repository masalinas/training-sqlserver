## Información

El catálogo (o catálogo del sistema) es el conjunto de tablas internas donde SQL Server almacena todos los metadatos (objetos) de la base de datos. Es, en esencia, el diccionario de datos o "la base de datos sobre la base de datos".

El archivo primario .mdf es el único que aloja obligatoriamente este catálogo y la información de inicialización, incluso si la base de datos se distribuye en múltiples archivos secundarios (.ndf).

El catálogo registra y administra la siguiente información estructural:

- Definiciones de objetos: La existencia y estructura de todas las tablas, vistas, procedimientos almacenados, funciones, índices y claves (primarias/foráneas).
- Seguridad y control de acceso: Los usuarios de la base de datos, los roles a los que pertenecen y los permisos granulares asignados sobre cada objeto.
- Arquitectura de almacenamiento: La ubicación lógica y física de los propios archivos de datos y de registro, los grupos de archivos (Filegroups) y cómo se está asignando el espacio interno en páginas y extensiones.
- Tipos de datos y configuraciones: Los tipos de datos del sistema, los creados por el usuario y los parámetros de configuración específicos a nivel de base de datos.

Como medida de protección, SQL Server no permite a los usuarios ni a los administradores modificar o consultar directamente las tablas base del catálogo. Para interactuar con estos metadatos o extraer información sobre la estructura, se deben utilizar las Vistas de catálogo (Catalog Views) estandarizadas, tales como `sys.tables`, `sys.columns` o `sys.objects`