# Solución del Ejercicio y Explicación

### 1. El descarte del modelo "Server + CAL"
El primer paso de un arquitecto es analizar la entrada de usuarios. Como el sistema da soporte a un portal web público con miles de clientes externos no identificados, es técnicamente imposible contabilizar y comprar una licencia CAL para cada uno. El modelo *Server + CAL* queda automáticamente descartado. La empresa está obligada a licenciar por capacidad de cómputo (*Per Core*).

### 2. Resolución de la Fase 1 (5 Máquinas Virtuales)
En este momento, la empresa necesita alimentar 5 VMs de 4 vCPUs (Total: 20 vCPUs virtuales).
*   **Opción A (Standard por Máquina Virtual):** Se deben licenciar los 20 vCPUs. Esto requiere 10 paquetes de 2 núcleos. (10 x $4.000 = **$40.000**).
*   **Opción B (Enterprise por Máquina Virtual):** Licenciar los mismos 20 vCPUs costaría 10 paquetes. (10 x $15.000 = **$150.000**).
*   **Opción C (Enterprise por Hardware Físico):** En lugar de contar las VMs, licenciamos el "hierro" base: los 16 núcleos físicos del servidor, lo que requiere 8 paquetes. Al cubrir el servidor físico completo (y tener Software Assurance), Microsoft otorga virtualización ilimitada. (8 x $15.000 = **$120.000**).

> **Veredicto Fase 1:** La opción más barata para arrancar el proyecto es **SQL Server Standard**, licenciando cada máquina virtual de forma individual ($40.000).

### 3. Resolución de la Fase 2 (El punto de inflexión de consolidación)
El próximo año, la empresa añadirá 7 VMs nuevas, alcanzando un total de 12 máquinas virtuales. Cada una tiene 4 vCPUs, lo que dispara la demanda a **48 vCPUs virtuales**, todas corriendo sobre el mismo servidor de 16 núcleos físicos.
*   **El coste de mantener Standard:** Para mantener la legalidad, habría que comprar licencias Standard para los 48 vCPUs (24 paquetes). El coste acumulado se dispara a **$96.000** (24 x $4.000).
*   **El coste del modelo Enterprise Físico:** Como en la Fase 1 vimos que blindar el servidor físico entero costaba **$120.000** permitiendo virtualización ilimitada, al llegar a la Fase 2 el coste sigue congelado en esos $120.000. No hay que pagar un euro más por las nuevas máquinas.

### La lección arquitectónica
Si el arquitecto solo mira el corto plazo, recomendará Standard. Sin embargo, al acercarse a las 15 o más máquinas virtuales (60 vCPUs), el modelo Standard superará la barrera de los $120.000. La respuesta correcta de un arquitecto de bases de datos senior es que, si la consolidación de servidores (alojar muchas VMs en un solo host potente) va a ser agresiva, **licenciar el host físico completo con Enterprise Edition** se convierte en una "tarifa plana" que a largo plazo ahorra decenas de miles de dólares, a pesar de ser mucho más caro el primer día.