# Arquitectura Interna del Motor de SQL Server

Este documento resume los componentes fundamentales de la arquitectura de SQL Server y el flujo que sigue una consulta desde que es enviada por el cliente hasta su interacción con el almacenamiento físico.

---

## 1. Capas Principales del Motor

El motor de SQL Server divide sus responsabilidades en cuatro niveles lógicos bien definidos que trabajan de forma secuencial y coordinada:

| Capa / Componente | Elementos Internos | Función Principal en el Motor |
| :--- | :--- | :--- |
| **SNI** *(SQL Network Interface)* | Shared Memory, TCP/IP, Named Pipes | Capa de conectividad de red. Recibe las peticiones de las aplicaciones cliente (SSMS, `.NET`, `sqlcmd`) utilizando el protocolo **TDS** *(Tabular Data Stream)*. |
| **Relational Engine** *(Query Processor)* | Parser, Algebrizer, Optimizer, Query Executor | **Decide el "cómo" (el plan de ejecución).** Comprueba la sintaxis, valida la existencia de tablas/columnas, optimiza la consulta basándose en el costo de las estadísticas y genera el plan de ejecución más eficiente. |
| **Storage Engine** | Access Methods, Buffer Manager *(Buffer Pool)*, Transaction Manager | **Ejecuta el acceso real a los datos.** Se encarga de leer y escribir las páginas de datos en la memoria RAM, administrar los bloqueos (*locks*) y asegurar que las transacciones sean seguras e íntegras. |
| **SQLOS** *(Servicios del S.O.)* | Schedulers, Memory Manager, I/O, Locks | Un mini sistema operativo integrado de bajo nivel. Gestiona directamente los hilos de la CPU, la asignación de la memoria RAM global, las operaciones de entrada/salida a disco y los recursos del sistema sin depender totalmente del sistema operativo host. |

---

## 2. El Flujo de Ejecución del Relational Engine

Cuando una consulta entra al procesador de consultas, pasa por el siguiente flujo de procesamiento jerárquico:

1. **Parser:** Analiza la sintaxis de la consulta T-SQL para verificar que esté bien escrita gramaticalmente.
2. **Algebrizer:** Valida que los objetos (tablas, vistas, columnas) realmente existan en la base de datos y que el usuario tenga los tipos de datos correctos.
3. **Optimizer:** Es el cerebro del motor. Analiza múltiples planes de ejecución posibles y, mediante un cálculo basado en el costo de las **estadísticas**, elige el camino que consuma menos CPU y lecturas de disco.
4. **Query Executor:** Toma el plan optimizado y le da la orden de ejecución al *Storage Engine* para que extraiga o modifique la información.

---

## 3. Estructura de Almacenamiento en Disco

El *Storage Engine* interactúa constantemente con dos tipos de archivos físicos fundamentales en el sistema de archivos:

* **Archivos de Datos (`.mdf` / `.ndf`):** Son las bases de datos físicas donde se estructuran las tablas y los índices. La información aquí se organiza internamente en bloques de memoria de 8 KB llamados **Páginas de datos**.
* **Archivo de Registro (`.ldf`):** Es el registro de transacciones que implementa el mecanismo **WAL** *(Write-Ahead Logging)*. Por seguridad de los datos, SQL Server escribe obligatoriamente cualquier cambio de forma secuencial en este archivo de registro *antes* de modificar las páginas en el archivo de datos final.
