USE training;
GO

CREATE TABLE dbo.BaseConocimiento (
    DocumentoID INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
    Titulo NVARCHAR(200) NOT NULL,
    ContenidoTexto NVARCHAR(MAX) NOT NULL,
    
    -- Definimos el vector limitando estrictamente sus dimensiones
     ContenidoEmbedding VECTOR(4) NOT NULL
);
GO

-- 3. Insertamos datos de prueba con exactamente 4 elementos
INSERT INTO dbo.BaseConocimiento (Titulo, ContenidoTexto, ContenidoEmbedding)
VALUES 
    ('Microservicios', 'Arquitectura distribuida en componentes...', CAST('[0.111, -0.222, 0.333, 0.444]' AS VECTOR(4))),
    ('Bases de Datos Relacionales', 'Sistemas ACID tradicionales...', CAST('[0.999, 0.888, -0.777, 0.666]' AS VECTOR(4))),
    ('Inteligencia Artificial', 'Redes neuronales y LLMs...', CAST('[0.125, -0.450, 0.750, 0.050]' AS VECTOR(4)));
GO

-- 4. Ejecutamos la búsqueda semántica cruzando con un vector de 4 dimensiones
DECLARE @VectorPregunta VECTOR(4) = CAST('[0.123, -0.456, 0.789, 0.012]' AS VECTOR(4));

SELECT TOP 3
    Titulo,
    ContenidoTexto,
    VECTOR_DISTANCE('cosine', ContenidoEmbedding, @VectorPregunta) AS DistanciaSemantica
FROM dbo.BaseConocimiento
ORDER BY DistanciaSemantica ASC;
GO