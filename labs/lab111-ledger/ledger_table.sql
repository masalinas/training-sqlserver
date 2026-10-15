-- 1. Cambiamos al contexto de la base de datos del sistema temporalmente si es necesario
USE master;
GO

-- 2. Activar el aislamiento de instantáneas en tu base de datos
ALTER DATABASE training SET ALLOW_SNAPSHOT_ISOLATION ON;
GO

-- 3. Volver al contexto de tu laboratorio y ejecutar la verificación
USE training;
GO
EXEC sp_verify_database_ledger;
GO

USE training;
GO

CREATE TABLE dbo.SaldosBancarios (
    CuentaID INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    Titular NVARCHAR(100) NOT NULL,
    Saldo DECIMAL(15,2) NOT NULL
)
WITH (
    -- Al igual que las tablas temporales, requiere una tabla histórica
    SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.SaldosBancarios_Historial),
    -- Esta instrucción activa el blindaje criptográfico de blockchain
    LEDGER = ON
);
GO

-- Transacción 1: Insertar datos iniciales
INSERT INTO dbo.SaldosBancarios (Titular, Saldo) 
VALUES ('Miguel Ángel', 10000.00);
GO

-- Transacción 2: Modificar el saldo
UPDATE dbo.SaldosBancarios 
SET Saldo = 8500.00 
WHERE Titular = 'Miguel Ángel';
GO

-- Transacción 3: Borrar el registro (Simular cierre de cuenta)
DELETE FROM dbo.SaldosBancarios 
WHERE Titular = 'Miguel Ángel';
GO

SELECT 
    CuentaID,
    Titular,
    Saldo,
    ledger_operation_type_desc AS TipoOperacion,
    ledger_transaction_id AS TransaccionID
FROM dbo.SaldosBancarios_Ledger
ORDER BY ledger_transaction_id;