## Solución Técnica

### 1. El comportamiento del Buffer Pool (No es un error)
SQL Server no tiene una fuga de memoria; está diseñado para ser "glotón" por defecto. Para maximizar el rendimiento, el motor intenta mantener la mayor cantidad posible de páginas de datos (de 8 KB) almacenadas en el **Buffer Pool**. Su objetivo es servir todas las peticiones mediante lecturas lógicas (desde la RAM, que es rapidísima) y evitar a toda costa las lecturas físicas (ir a buscar los datos al disco duro, que es muy lento). 

El problema es que, si el DBA no le pone un techo, SQL Server consumirá toda la memoria disponible en la máquina, ahogando al sistema operativo.

### 2. Los gestores de memoria: Checkpoint y Lazy Writer
*   **Checkpoint:** Es el encargado de garantizar la persistencia. Periódicamente, escanea el Buffer Pool buscando "páginas sucias" (datos que han sido modificados en memoria pero aún no guardados en disco) y las escribe en el disco duro.
*   **Lazy Writer:** Es el limpiador. Cuando el servidor empieza a sufrir "presión de memoria" (se está quedando sin RAM), el Lazy Writer entra en acción para liberar las páginas de memoria más antiguas o menos utilizadas (algoritmo LRU) y dejar espacio para datos nuevos.

### 3. La solución: Limitar el Max Server Memory
La regla de oro en producción es **siempre limitar la memoria máxima** de SQL Server para reservar al menos un 10% - 20% (o un mínimo de 4GB en servidores modernos) exclusivamente para el sistema operativo.

El script T-SQL para aplicar este límite a 12 GB es:

```sql
-- Habilitar la visualización de opciones avanzadas
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;

-- Limitar la memoria máxima del servidor a 12288 MB (12 GB)
EXEC sp_configure 'max server memory (MB)', 12288;
RECONFIGURE;
```

Al ejecutar esto, el Lazy Writer de SQL Server detectará inmediatamente que está por encima de su nuevo límite y comenzará a liberar memoria hasta ajustarse a los 12 GB, devolviendo la fluidez al sistema operativo sin necesidad de reiniciar el servicio.