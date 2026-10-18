## Instroducción

Buffer Pool Extension (BPE): Funcionalidad que permite extender la memoria caché de datos (el Buffer Pool de la RAM) hacia discos de estado sólido (SSD). Actúa como una caché de nivel 2 (L2), reduciendo la latencia de lectura en entornos donde no hay suficiente RAM, pero sí almacenamiento flash rápido disponible.

## ¿Cómo se activa o desactiva?

Se gestiona mediante comandos de T-SQL a través de `ALTER SERVER CONFIGURATION`

- Para activarlo:

```sql
ALTER SERVER CONFIGURATION 
SET BUFFER POOL EXTENSION ON 
(FILENAME = 'D:\SQL_BPE\mssql_data_bpe.bpe', SIZE = 32 GB); -- Ajusta ruta y tamaño
```

- Para desactivarlo:

```sql
ALTER SERVER CONFIGURATION 
SET BUFFER POOL EXTENSION OFF;
```

