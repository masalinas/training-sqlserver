CREATE TRIGGER trg_Forzar_PK_En_Tablas
ON DATABASE
FOR CREATE_TABLE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Extraer el esquema y nombre de la tabla desde el XML del evento DDL
    DECLARE @EventData XML = EVENTDATA();
    DECLARE @SchemaName SYSNAME = @EventData.value('(/EVENT_INSTANCE/SchemaName)[1]', 'SYSNAME');
    DECLARE @TableName SYSNAME = @EventData.value('(/EVENT_INSTANCE/ObjectName)[1]', 'SYSNAME');
    DECLARE @ObjectId INT = OBJECT_ID(QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName));

    -- Verificar si existe un constraint de tipo 'PK' para este nuevo Object ID
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE type = 'PK' AND parent_object_id = @ObjectId)
    BEGIN
        PRINT 'ERROR: Política de Arquitectura. Toda tabla debe crearse definiendo una Clave Primaria (Primary Key) inline.';
        ROLLBACK TRANSACTION;
    END
END;