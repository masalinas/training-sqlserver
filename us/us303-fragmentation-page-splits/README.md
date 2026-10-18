# Caso Práctico: El disco saturado y el mantenimiento nocturno

## El Contexto

Eres el Database Administrator (DBA) responsable de optimizar una base de datos de producción que está sufriendo graves problemas de lentitud de disco y un crecimiento desmesurado del archivo de log de transacciones (`.ldf`).

Sospechas que hay un problema grave de fragmentación. Ejecutas el script de diagnóstico de la diapositiva ("T-SQL - Medir fragmentación") y el resultado te arroja los siguientes datos sobre dos índices clave:

*   **Índice 1:** `PK_Cliente_GUID` (Clustered, usa una clave aleatoria GUID). Fragmentación: **45%**.
*   **Índice 2:** `IX_Pedido_Fecha` (Non-Clustered). Fragmentación: **18%**.

El equipo de desarrollo te pregunta por qué el índice de clientes se fragmenta tan rápido y te pide que diseñes un plan de mantenimiento para solucionar el problema esta misma noche.

## Misión del Alumno

Apoyándote en la diapositiva "Fragmentación, Page Splits y fillfactor", analiza la situación y responde:

1. Basándote en el recuadro "Page Split", explícale al equipo de desarrollo por qué usar claves aleatorias (como los GUID) está destrozando el rendimiento y haciendo crecer el archivo de log. ¿Qué es exactamente un Page Split?
2. Consultando la tabla de acciones de la diapositiva, ¿qué comando de mantenimiento exacto (REORGANIZE o REBUILD) aplicarías al `PK_Cliente_GUID` (45%) y cuál al `IX_Pedido_Fecha` (18%)?
3. En el script de REBUILD aparece la cláusula `WITH (FILLFACTOR = 90)`. ¿Para qué sirve esto y cómo ayudará a prevenir los Page Splits del índice de clientes en el futuro?
4. Observa el script de medición de fragmentación. ¿Por qué crees que incluye el filtro `WHERE ips.page_count > 1000`? ¿Qué pasaría si intentáramos desfragmentar tablas diminutas?