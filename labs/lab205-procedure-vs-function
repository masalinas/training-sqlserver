## Introducción

La diferencia fundamental entre un Procedimiento Almacenado (`STORED PROCEDURE`) y una Función (`USER-DEFINED FUNCTION` o `UDF`) radica en su propósito y flexibilidad: los procedimientos están diseñados para ejecutar acciones y lógica de negocio compleja (modificar datos), mientras que las funciones están diseñadas puramente para calcular y devolver valores sin alterar el estado de la base de datos.


## Tabla Comparativa: Procedimiento vs Función:

| Característica | Procedimiento Almacenado (`PROCEDURE`) | Función Almacenada (`FUNCTION`) |
| :--- | :--- | :--- |
| **Objetivo Principal** | Ejecutar una serie de acciones o lógica de negocio. | Calcular y **devolver un valor** (o una tabla). |
| **Modificación de Datos (DML)** | **Permitido**. Puede hacer `INSERT`, `UPDATE`, `DELETE`. | **Prohibido**. Solo puede leer datos (`SELECT`). No altera tablas. |
| **Uso en consultas SQL** | No se puede usar dentro de un `SELECT` o `WHERE`. | **Sí**. Se puede integrar directamente en `SELECT`, `WHERE`, `JOIN`. |
| **Retorno de Valores** | Opcional. Puede devolver 0, 1 o múltiples conjuntos de datos. | **Obligatorio**. Debe tener una cláusula `RETURN` con un valor o tabla. |
| **Parámetros de salida** | Soporta parámetros `OUTPUT` para devolver variables. | Solo recibe parámetros de entrada. |
| **Manejo de Errores** | Permite bloques **`TRY...CATCH`** complejos. | **No permite** bloques `TRY...CATCH`. |
| **Transacciones** | Puede iniciar, confirmar o revertir transacciones (`BEGIN TRAN`). | No puede manejar transacciones. |
| **Llamada / Invocación** | Se ejecuta con la palabra clave **`EXEC`** o `EXECUTE`. | Se invoca en línea (ej: `SELECT dbo.MiFuncion(ID)`). |
