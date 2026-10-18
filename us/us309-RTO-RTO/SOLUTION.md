## Solución Técnica

### 1. RPO y RTO en lenguaje de negocio

Para que la directiva lo entienda, debemos separar ambos conceptos del momento del fallo:

* **RPO (Recovery Point Objective):** Representa "los datos que puedes perder". Es el tiempo que transcurre desde el último punto recuperable (la última copia) hasta que ocurre el desastre. Si el RPO es de 1 hora, significa que la empresa acepta perder todas las ventas de la última hora.
* **RTO (Recovery Time Objective):** Representa el "tiempo hasta restablecer". Es el cronómetro que arranca en el momento en que se cae el sistema y se detiene cuando la aplicación vuelve a estar operativa. Es el tiempo que el negocio estará paralizado.

### 2. La trampa del Log Shipping y el presupuesto

La propuesta técnica actual (Log Shipping cada 15 minutos) choca frontalmente con los requisitos del negocio.
Como indica la diapositiva, el Log Shipping ofrece un **RPO de minutos** (la pérdida de datos equivale al intervalo de backup del log). Si el servidor explota en el minuto 14, se perderán todas las transacciones confirmadas en esos 14 minutos. Esto incumple totalmente la regla estricta del CEO de no perder transacciones. Además, el Log Shipping requiere una intervención manual para levantar el servidor secundario, lo que dispararía el RTO (tiempo de caída) a varios minutos o horas.

### 3. La arquitectura correcta (FCI o AG Síncrono)

Para cumplir lo que el CEO pide, las matemáticas de la contingencia no perdonan; se requiere mayor inversión tecnológica:

* Para lograr no perder nada (**RPO ≈ 0**), necesitamos tecnologías que escriban los datos en dos servidores al mismo tiempo antes de decirle al cliente que el pago está OK. Como indica la diapositiva, esto requiere un clúster **FCI (Failover Cluster Instance)** o un **AG síncrono (Availability Group en modo síncrono)**. Así, ningún *commit* confirmado se pierde.
* Para lograr que el servicio vuelva casi al instante (**RTO: segundos**), no podemos depender de un DBA haciendo clics. Necesitamos el **failover automático y un listener**, para que cuando el nodo principal caiga, el secundario asuma el control en segundos y las aplicaciones se reconecten solas sin intervención humana.