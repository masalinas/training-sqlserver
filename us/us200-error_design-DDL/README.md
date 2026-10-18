# Caso Práctico: Auditoría de código DDL al desarrollador junior

## El Contexto

Acabas de incorporarte como Arquitecto de Datos en una startup. El equipo de desarrollo ha diseñado un nuevo módulo para el sistema de facturación y te piden que revises el script de creación de tablas (DDL) antes de pasarlo a producción.

Durante los primeros tests de carga en el entorno de pre-producción, el sistema está sufriendo bloqueos masivos, lentitud extrema al insertar datos y un consumo de CPU altísimo. 

El código que te entregan para auditar es el siguiente:

```sql
-- 1. Tabla de Auditoría (Registro de eventos)
CREATE TABLE Auditoria (
    Fecha DATETIME,
    Usuario VARCHAR(50),
    Accion NVARCHAR(MAX)
);

-- 2. Tabla de Facturas
CREATE TABLE Factura (
    FacturaID UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY CLUSTERED,
    ClienteID INT,
    CodigoEstado NVARCHAR(255), -- Solo guardará "PAGADO" o "PENDIENTE"
    Total DECIMAL(18,2),
    
    CONSTRAINT FK_Factura_Cliente FOREIGN KEY (ClienteID) REFERENCES Cliente(ClienteID)
    -- Nota: No se ha creado ningún índice adicional para esta tabla
);
```

## Misión del Alumno

Apoyándote en la diapositiva "Errores comunes en el diseño DDL", conviértete en el auditor del código y detecta al menos 4 errores graves de rendimiento y arquitectura en este script. 

Para cada error que encuentres, explica:
1. ¿Cuál es el problema técnico y qué síntoma provoca en el motor de SQL Server?
2. ¿Cómo lo solucionarías o reescribirías?