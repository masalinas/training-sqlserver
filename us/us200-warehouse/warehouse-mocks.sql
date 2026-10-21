---------------------------------------------------------
-- INSERCIÓN DE DATOS MOCK
---------------------------------------------------------

-- A. Crear las 3 estanterías (E01, E02, E03) con 3 posiciones X y 4 alturas Y (36 ubicaciones totales)
INSERT INTO dbo.Estanteria (CodigoEstanteria, X, Y)
SELECT
    e.Codigo,
    x.n AS X,
    y.n AS Y
FROM (VALUES ('E01'), ('E02'), ('E03')) AS e(Codigo)
CROSS JOIN (VALUES (1), (2), (3)) AS x(n)
CROSS JOIN (VALUES (1), (2), (3), (4)) AS y(n);
GO

-- B. Crear stock aleatorio para P01, P02 y P04 SOLO en las estanterías E01 y E02
-- (El producto P03 queda registrado conceptualmente pero sin stock asignado por ahora)
INSERT INTO dbo.Stock (CodigoEstanteria, X, Y, CodigoProducto, Cantidad, FechaCaducidad)
VALUES
    -- Estantería E01
    ('E01', 1, 1, 'P01', 150.50, '2027-06-15 00:00:00'),
    ('E01', 1, 2, 'P02', 45.00,  NULL),                  -- Sin fecha de caducidad
    ('E01', 2, 1, 'P04', 300.25, '2028-01-10 00:00:00'),
    ('E01', 2, 3, 'P01', 12.75,  '2027-12-31 00:00:00'),
    ('E01', 3, 4, 'P02', 88.00,  '2027-09-20 00:00:00'),

    -- Estantería E02
    ('E02', 1, 1, 'P04', 500.00, NULL),                  -- Sin fecha de caducidad
    ('E02', 2, 2, 'P01', 75.20,  '2027-03-11 00:00:00'),
    ('E02', 3, 1, 'P02', 230.10, '2028-05-18 00:00:00'),
    ('E02', 3, 3, 'P04', 42.50,  '2027-11-30 00:00:00');
GO
