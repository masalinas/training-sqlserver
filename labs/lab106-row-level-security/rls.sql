/*
Paso 1: Crear la tabla de datos y los usuarios de prueba
-- Primero, creamos tres usuarios directamente en la base de datos y una tabla con datos de diferentes sucursales.
*/
-- 1. Crear usuarios de prueba (sin contraseñas reales para el ejemplo)
CREATE USER GerenteNorte WITHOUT LOGIN;
CREATE USER GerenteSur WITHOUT LOGIN;
CREATE USER AuditorGeneral WITHOUT LOGIN;

-- 2. Crear la tabla de clientes
CREATE TABLE Clientes (
    ClienteID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50),
    Sucursal VARCHAR(20),
    MontoCredito INT
);

-- 3. Insertar datos de prueba
INSERT INTO Clientes (Nombre, Sucursal, MontoCredito) VALUES 
('Juan Pérez', 'Norte', 5000),
('María López', 'Norte', 7500),
('Carlos Gómez', 'Sur', 3000),
('Ana Rodríguez', 'Sur', 9000);

-- 4. Dar permisos de lectura a los usuarios
GRANT SELECT ON Clientes TO GerenteNorte, GerenteSur, AuditorGeneral;


/*
Paso 2: Crear la Función de Predicado (La regla de negocio)
Esta función define quién tiene derecho a ver qué. Retornará un valor si el usuario cumple la condición. En este caso:
- El usuario AuditorGeneral puede ver todo.
- Los demás usuarios solo pueden ver las filas donde la columna Sucursal coincida con su nombre de usuario (ej. GerenteNorte solo ve Norte).
*/
-- Creamos un esquema separado por buenas prácticas de seguridad
CREATE SCHEMA Seguridad;
GO

CREATE FUNCTION Seguridad.fn_FiltroSucursal(@Sucursal AS VARCHAR(20))
    RETURNS TABLE
WITH SCHEMABINDING
AS
    RETURN SELECT 1 AS fn_FiltroSucursal_Result
    WHERE 
        USER_NAME() = 'AuditorGeneral' -- El auditor ve todo
        OR 
        USER_NAME() = 'Gerente' + @Sucursal; -- Mapea 'GerenteNorte' con 'Norte'
GO

/*
Paso 3: Crear la Directiva de Seguridad (Activar el filtro)
Ahora vinculamos la función que acabamos de crear a nuestra tabla Clientes. A partir de este momento, el filtro se vuelve invisible y obligatorio.
*/
CREATE SECURITY POLICY Seguridad.FiltroClientesPolicy
ADD FILTER PREDICATE Seguridad.fn_FiltroSucursal(Sucursal) -- Evaluará la columna 'Sucursal'
ON dbo.Clientes
WITH (STATE = ON); -- Activamos la directiva
GO

/*
Paso 4: Probar el funcionamiento (Simulación)
Para ver el efecto de RLS, vamos a suplantar la identidad de cada usuario utilizando el comando EXECUTE AS USER y ejecutaremos exactamente la misma consulta: SELECT * FROM Clientes;.
*/
-- Probar como Gerente del Norte
EXECUTE AS USER = 'GerenteNorte';
SELECT * FROM Clientes; 
REVERT; -- Volver al usuario administrador

-- Probar como Gerente del Sur
EXECUTE AS USER = 'GerenteSur';
SELECT * FROM Clientes;
REVERT;

-- Probar como Auditor
EXECUTE AS USER = 'AuditorGeneral';
SELECT * FROM Clientes;
REVERT;

/*
¿Cómo se desactivaría si necesitas hacer mantenimiento?
Si en algún momento necesitas apagar esta regla para realizar una migración o mantenimiento masivo de datos, simplemente ejecutas:
*/
ALTER SECURITY POLICY Seguridad.FiltroClientesPolicy WITH (STATE = OFF);
