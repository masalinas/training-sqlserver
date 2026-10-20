## Tabla Comparativa Core

| Característica | Funciones (UDF) 🔢 | Procedimientos Almacenados (SP) ⚙️ |
| :--- | :--- | :--- |
| **Objetivo Principal** | **Calcular y devolver** un valor o una tabla de datos. | **Ejecutar tareas**, lógica de negocio o procesos complejos. |
| **Uso en consultas (`SELECT`)** | **Sí.** Se pueden usar en el `SELECT`, `WHERE`, `HAVING` o `JOIN`. | **No.** No se pueden llamar dentro de una consulta `SELECT`. |
| **Modificar datos (`INSERT`/`UPDATE`)** | **No permitido.** Solo opera con los datos en memoria. | **Sí.** Puede hacer cualquier cambio en las tablas de la BD. |
| **Manejo de Errores (`TRY-CATCH`)** | **No permitido.** Si algo falla internamente, se detiene. | **Sí.** Soporta bloques `BEGIN TRY ... END CATCH`. |
| **Transacciones (`BEGIN TRAN`)** | **No permitido.** No puede iniciar ni cerrar transacciones. | **Sí.** Control total sobre confirmaciones o rollbacks. |
| **Parámetros de salida (`OUTPUT`)** | **No.** Devuelve un valor directo (`RETURNS`). | **Sí.** Puede devolver múltiples parámetros `OUTPUT`. |
| **Llamar al otro objeto** | Solo puede llamar a otras **funciones**. | Puede llamar a **funciones y a otros procedimientos**. |
