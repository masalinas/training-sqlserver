## Solución Técnica

El script contiene múltiples antipatrones graves descritos en la diapositiva. Aquí está la auditoría detallada:

### 1. Tabla sin clave primaria (El problema del Heap)
* **El Error:** La tabla `Auditoria` no tiene `PRIMARY KEY`. 
* **El Impacto:** SQL Server almacena esta tabla como un "Heap" (montón desordenado). Esto admite filas duplicadas, hace que las búsquedas sean escaneos completos (Table Scan) y, lo más grave a nivel arquitectónico, imposibilita utilizar tecnologías de alta disponibilidad o replicación como CDC (Change Data Capture) o Transactional Replication, que exigen una PK.
* **Solución:** Añadir siempre una clave primaria, por ejemplo: `LogID INT IDENTITY(1,1) PRIMARY KEY`.

### 2. GUID aleatorio como Clustered Index (El problema de la fragmentación)
* **El Error:** En la tabla `Factura`, se usa `NEWID()` para generar un GUID como Primary Key Clustered.
* **El Impacto:** El índice agrupado (Clustered) define el orden físico de los datos en el disco. `NEWID()` genera valores totalmente aleatorios, obligando a SQL Server a insertar cada nueva factura en medio de páginas de datos ya existentes. Esto provoca una fragmentación masiva llamada **Page Splits** (división de páginas), hundiendo el rendimiento de inserción y de lectura.
* **Solución:** Cambiar `NEWID()` por `NEWSEQUENTIALID()` (que genera GUIDs ordenados) o usar un clásico `INT IDENTITY`.

### 3. FK sin índice de apoyo (El problema de los bloqueos)
* **El Error:** Existe una clave ajena (`FK_Factura_Cliente`) sobre la columna `ClienteID`, pero SQL Server **no** crea índices automáticamente para las Foreign Keys.
* **El Impacto:** Si alguien intenta borrar o actualizar un registro en la tabla padre (`Cliente`), SQL Server tiene que comprobar que no existan facturas huérfanas. Al no haber índice en `ClienteID` dentro de `Factura`, el motor se ve obligado a escanear toda la tabla de facturas de principio a fin, bloqueando la tabla entera durante el proceso y causando los *timeouts* en el test de carga.
* **Solución:** Crear siempre un índice no agrupado explícito: `CREATE NONCLUSTERED INDEX IX_Factura_ClienteID ON Factura(ClienteID);`

### 4. Tipos sobredimensionados (El problema del Buffer Pool)
* **El Error:** El campo `CodigoEstado` está definido como `NVARCHAR(255)` para guardar simplemente estados cortos como "PAGADO".
* **El Impacto:** Aunque sea de longitud variable, las reservas de memoria para ordenar y procesar esta columna se sobredimensionan. Ocupará más espacio por fila (al ser N = Unicode, usa 2 bytes por carácter), exigiendo más páginas de datos, más lecturas de disco (I/O) y robando memoria valiosísima del Buffer Pool para almacenar espacio vacío.
* **Solución:** Ajustar el tipo de dato estrictamente a la necesidad del negocio, por ejemplo: `VARCHAR(15)`. Además, esto evita otro problema futuro de la diapositiva: mezclar `VARCHAR` con `NVARCHAR` en los `JOINs`, lo cual provocaría una conversión implícita que anula el uso de índices (*Index Seek*) y dispara la CPU.