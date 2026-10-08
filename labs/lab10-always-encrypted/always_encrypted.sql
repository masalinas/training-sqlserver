USE training;
GO

CREATE TABLE Empleados_Seguros (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100),
    
    -- Cifrado Determinista (permite búsquedas WHERE NumeroSeguridadSocial = @ssn)
    NumeroSeguridadSocial NVARCHAR(15) COLLATE Latin1_General_BIN2 
    ENCRYPTED WITH (
        COLUMN_ENCRYPTION_KEY = MiClaveDeColumna,
        ENCRYPTION_TYPE = Deterministic, 
        ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
    ) NOT NULL,

    -- Cifrado Aleatorio (máxima seguridad, sin patrones visuales)
    Salario DECIMAL(10,2)
    ENCRYPTED WITH (
        COLUMN_ENCRYPTION_KEY = MiClaveDeColumna,
        ENCRYPTION_TYPE = Randomized, 
        ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256'
    ) NOT NULL
);
GO