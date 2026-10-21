USE training;
GO

---------------------------------------------------------
-- WAREHOUSE MODELO DE DATOS
---------------------------------------------------------

-- 1. Tabla Estanteria / Ubicaciones
-- Representa las estanterías y sus coordenadas exactas (posiciones x, y) dentro del almacén.
CREATE TABLE dbo.Estanteria (
    EstanteriaId INT IDENTITY(1,1) PRIMARY KEY,
    CodigoEstanteria VARCHAR(3) NOT NULL,
    X INT NOT NULL,
    Y INT NOT NULL,

    -- Clave primaria compuesta: identifica de forma unívoca una posición exacta (x, y) en una estantería.
    CONSTRAINT PK_Estanteria PRIMARY KEY CLUSTERED (CodigoEstanteria, X, Y),

    -- Validación estricta: Empieza por 'E' seguido exactamente de dos números (ej. E00, E06, E88)
    CONSTRAINT CK_Estanteria_CodigoFormat CHECK (CodigoEstanteria LIKE 'E[0-9][0-9]'),

    -- Validación: Posición longitudinal (x) debe ser un entero positivo estrictamente mayor igual a 0.
    CONSTRAINT CK_Estanteria_X_Positivo CHECK (X >= 0),

    -- Validación: Posición en altura (y) debe ser un entero positivo estrictamente mayor o igual a 0.
    CONSTRAINT CK_Estanteria_Y_Positivo CHECK (Y >= 0)
);
GO

-- 2. Tabla Stock
-- Representa la cantidad de producto ubicado en una posición específica de la estantería.
CREATE TABLE dbo.Stock (
    StockID INT IDENTITY(1,1) PRIMARY KEY,

    -- Referencia a la ubicación exacta en la estantería
    CodigoEstanteria VARCHAR(3) NOT NULL,
    X INT NOT NULL,
    Y INT NOT NULL,

    -- Atributos del stock y producto
    CodigoProducto VARCHAR(3) NOT NULL,
    Cantidad DECIMAL(18,4) NOT NULL,
    FechaCaducidad DATE NULL,

    -- Relación de integridad referencial con la ubicación
    CONSTRAINT FK_Stock_Estanteria FOREIGN KEY (CodigoEstanteria, X, Y)
        REFERENCES dbo.Estanteria (CodigoEstanteria, X, Y),

    -- Validación: Código de producto de hasta 20 caracteres alfanuméricos, no nulo.
    CONSTRAINT CK_Stock_CodigoProductoFormat CHECK (CodigoProducto LIKE 'E[0-9][0-9]'),

    -- Validación: La cantidad debe ser un decimal estrictamente mayor a cero.
    CONSTRAINT CK_Stock_CantidadPositiva CHECK (Cantidad > 0)
);
GO
