# Caso Práctico de Arquitectura: Proyecto "Horizonte"

## El Contexto
La empresa logística "Horizonte" está renovando su centro de datos. Han adquirido un nuevo servidor físico de alto rendimiento y van a migrar toda su infraestructura de bases de datos a máquinas virtuales (VMs). Como consultor DBA, te han contratado para auditar su plan de licenciamiento y evitar que gasten presupuesto innecesariamente.

## Datos de la Infraestructura
*   **Hardware Físico (Host):** 1 Servidor equipado con 2 procesadores físicos de 8 núcleos cada uno (Total: 16 núcleos físicos reales).
*   **Fase 1 (Despliegue Inmediato):** 5 máquinas virtuales de SQL Server. Cada VM tendrá asignados 4 núcleos virtuales (vCPUs).
*   **Fase 2 (Crecimiento a 12 meses):** Tienen aprobado desplegar 7 máquinas virtuales adicionales (con 4 vCPUs cada una) en ese mismo servidor físico para nuevos microservicios.
*   **Acceso de Usuarios:** Las bases de datos darán soporte tanto a 150 empleados internos de almacén como a un portal web público donde miles de clientes externos consultan el estado de sus envíos diariamente.

## Tabla de Precios (Licencias Perpetuas de Referencia)
*   **Standard Server:** 1.000€ / **Standard CAL:** 230€
*   **Standard (Paquete 2 núcleos):** 4.000€
*   **Enterprise (Paquete 2 núcleos):** 15.000€

*(Nota: Asumimos la contratación de Software Assurance en las licencias por núcleo para habilitar derechos de virtualización).*

---

## Misión del Alumno
Utilizando la lógica de la calculadora de licenciamiento (WintelGuy), resuelve los siguientes dilemas de arquitectura:
1. Para la Fase 1, ¿qué modelo y edición de licenciamiento es el más barato?
2. Cuando la empresa ejecute la Fase 2, ¿el modelo elegido en la Fase 1 seguirá siendo rentable o habrán cometido un error financiero?
