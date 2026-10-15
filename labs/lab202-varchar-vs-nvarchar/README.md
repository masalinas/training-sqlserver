## Introducción

La diferencia principal entre varchar y nvarchar radica en cómo almacenan los datos y el soporte para diferentes idiomas: varchar utiliza codificación de 1 byte por carácter (estándar ANSI) y es ideal para caracteres occidentales, mientras que nvarchar utiliza 2 bytes por carácter (codificación Unicode UTF-16) para soportar cualquier idioma del mundo (como chino, japonés, árabe o emojis). \

A continuación, se presenta un desglose detallado de sus características técnicas y las mejores recomendaciones para su uso:

| Característica | `varchar` | `nvarchar` |
| :--- | :--- | :--- |
| **Tipo de datos** | Cadenas de caracteres de longitud variable (No-Unicode). | Cadenas de caracteres de longitud variable **Unicode**. |
| **Espacio en disco** | **1 byte** por carácter. | **2 bytes** por carácter (el doble de espacio). |
| **Soporte de Idiomas** | Limitado al alfabeto local del servidor (ej. Español/Inglés). | **Universal**. Soporta cualquier idioma, símbolos y emojis. |
| **Capacidad Máxima** | Hasta 8,000 caracteres (o 2 GB usando `MAX`). | Hasta 4,000 caracteres (o 2 GB usando `MAX`). |
| **Sintaxis de literal** | Se escribe normal: `'Texto'`. | Requiere el prefijo N: **`N'Texto'`**. |

## Buenas Prácticas de Uso

- Elige nvarchar de forma predeterminada para Datos Globales: Utilízalo en campos propensos a recibir datos internacionales o caracteres especiales, tales como Nombres de personas (Nombre, Apellido), Direcciones físicas, Correos electrónicos o Comentarios libres.
- Usa varchar estrictamente para Códigos Alfanuméricos: Si el campo contiene datos estructurados que nunca cambiarán de idioma, prefiere varchar para ahorrar el 50% de espacio en disco y memoria RAM. Ejemplos ideales: Códigos de barras, IDs alfanuméricos, Códigos de moneda (USD, EUR), URLs o Estados de procesos (PENDING, APPROVED).
- Usa el prefijo N en tus consultas con nvarchar: Cuando hagas filtros WHERE sobre columnas nvarchar, antepone siempre la letra N al texto (ej. WHERE Apellido = N'Muñoz'). Si no lo haces, SQL Server se verá obligado a realizar una conversión implícita de tipos de datos en cada fila, destruyendo el rendimiento de tus índices (Index Scan en lugar de Index Seek).
- Evita el abuso indiscriminado de MAX: Declarar columnas como varchar(max) o nvarchar(max) por pereza a definir un límite rompe la optimización de almacenamiento en páginas de datos. Define longitudes realistas (ej. nvarchar(150)) y reserva el MAX solo para textos verdaderamente gigantescos (como descripciones de productos muy largas o bitácoras).
- Mantén la consistencia entre la Aplicación y la Base de Datos: Si tus tablas usan nvarchar, asegúrate de que las variables en tu código backend (C#, Java, Node.js) estén parametrizadas como tipos Unicode (como String o DbDataType.NVarChar). La discrepancia de tipos obliga al motor a realizar conversiones costosas en tiempo de ejecución.
