-- FULL Backup
BACKUP DATABASE [training]
TO DISK = N'C:\Backups\training_FULL.bak'
WITH NAME = 'Backup Completo - DB training', -- descripción del backup
     MEDIANAME = 'DB_Training', -- llave de seguridad (Estricto) para evitar machacar el backup con otra db diferente a Training
     FORMAT, -- Borra todo, crea el archivo y le pega la etiqueta física MEDIANAME. Guarda el backup dentro y no controla que esta etiqueta coincida o no
     -- INIT -- Borra todo, crea el archivo y valida que MEDIANAME coincida con la ya existente (evita machacar sin querer un backup)
     -- NOINIT
     STATS = 10, -- mostrar por pantalla cada 10%;
     NORECOVERY;
GO

-- DIFFERENTIAL Backup
BACKUP DATABASE [training]
TO DISK = N'C:\Backups\training_DIFF.bak'
WITH DIFFERENTIAL,
    NAME = 'Backup Diferencial - DB training', -- descripción del backup
     INIT,
     COMPRESSION,
     NORECOVERY;
GO

-- Transaction LOG Backup
DECLARE @FileName NVARCHAR(255);
SET @FileName = N'C:\Backups\training_LOG_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmm') + '.trn';
GO

BACKUP LOG [training]
TO DISK = @FileName
WITH COMPRESSION,
     RECOVERY;
GO

-- Listar todos los backups de todas las base de datos
SELECT
    bs.database_name AS [Base de Datos],
    CASE bs.type
        WHEN 'D' THEN 'Completo (Full)'
        WHEN 'I' THEN 'Diferencial'
        WHEN 'L' THEN 'Log de Transacciones'
        WHEN 'F' THEN 'Archivo/Grupo de archivos'
        WHEN 'G' THEN 'Diferencial de archivo'
        WHEN 'P' THEN 'Parcial'
        WHEN 'Q' THEN 'Diferencial parcial'
    END AS [Tipo de Backup],
    bs.backup_start_date AS [Fecha de Inicio],
    bs.backup_finish_date AS [Fecha de Fin],
    (bs.backup_size / 1024 / 1024) AS [Tamaño (MB)],
    bmf.physical_device_name AS [Ruta Física del Archivo],
    bs.user_name AS [Usuario que lo ejecutó]
FROM msdb.dbo.backupset bs
INNER JOIN msdb.dbo.backupmediafamily bmf
    ON bs.media_set_id = bmf.media_set_id
ORDER BY
    bs.backup_finish_date DESC;
GO
