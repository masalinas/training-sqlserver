## Introducción

Comparativa de los modos de licenciamiento

## La única excepción web (Licencia Server + CAL)

El modelo Server + CAL solo se podría usar en una web si es un portal estrictamente privado y cerrado, donde:

1. El acceso requiere usuario y contraseña obligatorios.
2. Todos los usuarios pertenecen, por ejemplo, a tu empresa u organizaciones asociadas.
3. Tienes control absoluto del número exacto de cuentas creadas y a cada una le has comprado y asignado previamente su CAL.

Si la web no cumple con ese control total y cerrado, la única opción técnica y legal viable es el modelo Por Core.

## Casos de uso ideales para Server + CAL

| Caso de Uso	 | ¿Por qué es viable y rentable? |
|--------------|--------------|
| Pequeñas y Medianas Empresas (PyMEs) | Una empresa con 30 empleados que usan un sistema contable local. Pagar la licencia por Core (que exige un mínimo muy costoso) no tiene sentido cuando puedes comprar 1 licencia de servidor barata y 30 CALs de usuario. |
| Entornos de Dispositivos Compartidos (Fábricas / Hospitales) | En una planta industrial con 3 turnos de trabajo y 200 empleados, pero donde solo hay 15 computadoras en total conectadas a las máquinas de producción. Aquí se compran CALs por Dispositivo. Pagas solo 15 CALs y no importa que 200 personas distintas las usen. |
| Sistemas Internos Aislados (ERMs / CRMs internos) | Herramientas de recursos humanos, intranets de control de asistencia o software de nóminas donde el número de empleados con acceso está perfectamente definido en el departamento de TI. |
| Servidores secundarios de Reportes o Data Warehouse interno | Un servidor SQL Server exclusivo para que el equipo de analistas de datos (ej. 5 personas) extraiga reportes empresariales. |

## El "Punto de Equilibrio" financiero (Server+CAL vs. Cores)**

La decisión de usar este modelo se reduce a un cálculo puramente matemático y económico.
Las licencias por Core de SQL Server son sumamente costosas (especialmente la versión Enterprise). Las CALs, en cambio, son muy económicas por unidad. Por lo tanto, el modelo Server + CAL deja de ser conveniente cuando el costo de sumar tantas CALs supera el costo de la "tarifa plana" de los Cores:

- Es un caso de uso ganador: Cuando tienes pocos usuarios y servidores con muchos núcleos.
- Es un caso de uso perdedor: Cuando la empresa supera los cientos de usuarios, momento en el cual conviene migrar al modelo por Core para congelar el costo de licenciamiento sin importar cuánto siga creciendo la plantilla.

## Calculadora de licenciamiento SQL Server

Uno de los dilemas arquitectónicos y financieros más importantes que un administrador de bases de datos debe resolver: elegir entre el modelo de licenciamiento por capacidad de cómputo (Per Core) o por cantidad de usuarios (Server + CAL)

Calculadoras de licenciamiento de [WintelGuy](WintelGuy.com):

- [Calculadora Licenciamiento Standard SQL Server](https://wintelguy.com/mssql-std-licensing-calc.pl)
- [Calculadora Licenciamiento Enterprise SQL Server](https://wintelguy.com/mssql-ent-licensing-calc.pl)

## Ejemplo

- Ejemplo 1: SQL Server Standard:

    1. El escenario base (Entradas de la infraestructura)
    El ejercicio plantea una infraestructura con 2 máquinas virtuales (VMs) destinadas a SQL Server. Cada una de estas máquinas tiene asignados 4 núcleos virtuales (vCPUs). Finalmente, se ha estipulado que un total de 50 usuarios o dispositivos únicos accederán a estas bases de datos.   

    2. Modelo 1: Licenciamiento "Per Core" (Columna izquierda)Este modelo ignora cuánta gente se conecta y cobra exclusivamente por la potencia del servidor. Es el estándar para aplicaciones web donde es imposible contar los usuarios.

    - Se deben licenciar los 8 vCPUs totales (2 VMs multiplicadas por 4 vCPUs cada una).   
    - Microsoft vende las licencias perpetuas de núcleo en "paquetes de 2" (2-core pack). Para cubrir los 8 núcleos, la calculadora indica que se requieren 4 de estos paquetes.
    - Al multiplicar los 4 paquetes por su precio unitario de 3.945, el coste total de las licencias perpetuas asciende a 15.780.   
    - Ademas tienes que pagar licencias SA por valor 986 (2-core pack) * 4 ( 8 cores) = 3.944
    - Ademas necesitasuna subscription anual por valor 1.418 * 4(packs de 2 cores) = 5.672
    - Por ultimo has de pagar un PAYG por valor 73*8(cores)*12(meses) = 7008

    3. Modelo 2: Licenciamiento "Server + CAL" (Columna derecha)Este modelo es más tradicional: pagas una licencia base barata por cada servidor encendido, pero debes comprar una licencia de acceso de cliente (CAL) individual para cada persona que vaya a usarlo.

    - Se requieren 2 licencias de Servidor puro, una para cada máquina virtual. A un precio de 989 cada una, el coste del servidor es de 1.978.
    - Además, se necesitan 50 licencias CAL (una por usuario/dispositivo). A 230 cada una, el coste de las CALs se dispara a 11.500.   
    - Al igual que en modo per core tienes que pagar licencias SA por valor 986 (2-core pack) * 4 ( 8 cores) = 3.944
    - Sumando ambos conceptos, la inversión inicial de este modelo es ligeramente más barata en este escenario concreto que el modelo por núcleos.

    4. Mantenimiento y Alternativas (Software Assurance y Suscripciones)

    - SA (Software Assurance): Es el seguro de mantenimiento de Microsoft que da derecho a actualizar a futuras versiones (como pasar a SQL Server 2025). El coste anual del SA es de 3.944 para el modelo por núcleos y de 3.394 para el modelo de Servidor + CAL.
    - Modelos de alquiler: La calculadora también muestra que si no se quiere comprar la licencia perpetua "Per Core", se puede optar por una Suscripción anual con un coste de 5.672. Alternativamente, el modelo de pago por uso puro (PAYG) facturado mensualmente supondría un coste de 7.008 al año

    Para tu curso, la gran lección de esta tabla es el punto de inflexión. Si esta misma empresa contratase a 30 empleados más (pasando de 50 a 80 usuarios), el modelo "Server + CAL" se encarecería muchísimo por culpa de las CALs individuales, haciendo que el modelo "Per Core" pasase a ser la opción más rentable, ya que admite usuarios ilimitados.

- Ejemplo 2: - Ejemplo 1: SQL Server Enterprise:

    Esta captura muestra una calculadora de licenciamiento para SQL Server Enterprise Edition en un entorno virtualizado. A diferencia de la versión Standard (donde el debate era entre licenciar núcleos o usuarios), el gran dilema arquitectónico y financiero en la edición Enterprise radica en decidir si es más rentable licenciar el hardware físico completo ("by physical core") o licenciar cada máquina virtual de forma aislada ("by VM").\

    1. El escenario base (Infraestructura física frente a virtual)

    - Capacidad del hardware físico: Se dispone de 1 servidor (Host) equipado con 2 procesadores físicos (CPUs), y cada CPU tiene 8 núcleos. Esto suma un total de 16 núcleos físicos en la máquina.
    - Demanda del entorno virtual: Sobre ese hardware, el administrador necesita levantar 5 máquinas virtuales (VMs) de SQL Server, asignando 4 procesadores virtuales (vCPUs) a cada una. Esto suma un requerimiento total de 20 núcleos virtuales.   

    2. Modelo 1: Licenciamiento por núcleo físico (Columna "by physical core")
    Este enfoque asume el coste de licenciar toda la capacidad real del servidor, independientemente de lo que se ejecute encima.

    - Para cubrir los 16 núcleos físicos, se deben adquirir 8 paquetes de 2 núcleos (2-core packs).   
    - Utilizando el modelo de Licencia Perpetua (Perpetual licenses), el coste inicial es de 120.984 (8 paquetes multiplicados por el precio base de 15.123), sumado a un coste anual de mantenimiento (SA) de 30.248.
    - Si se prefiere el alquiler (Subscription licenses), el coste es de 43.472 al año.   
    - La ventaja absoluta de Enterprise: Al licenciar los núcleos físicos del host con Enterprise Edition + Software Assurance, Microsoft permite ejecutar un número Ilimitado (Unlimited) de máquinas virtuales de SQL Server en ese hardware. Es la opción definitiva para la alta consolidación de bases de datos.

    3. Modelo 2: Licenciamiento por Máquina Virtual (Columna "by VM")
    Este enfoque evalúa el coste de licenciar estrictamente los recursos virtuales asignados, ignorando el tamaño del servidor físico.

    - Para cubrir los 20 vCPUs demandados, se necesitan adquirir 10 paquetes de 2 núcleos.
    - En el modelo de Licencia Perpetua, el coste inicial asciende a 151.230, con un mantenimiento anual (SA) de 37.810.
    - La modalidad de Suscripción anual se encarece hasta los 54.340.
    - Esta columna también habilita el modelo de pago mensual puro (PAYG), que proyectado a un año completo supondría un gasto de 65.760 (basado en el coste de 274 por núcleo al mes multiplicado por 20 vCPUs).
    - A diferencia del modelo físico, este método te restringe a ejecutar un máximo de 5 máquinas virtuales (Max # of licensed VMs)

    En este escenario, el licenciamiento del hardware físico completo es considerablemente más barato que licenciar por VM porque el administrador ha asignado más núcleos virtuales (20) que los físicos reales que tiene la máquina (16). El licenciamiento por VM solo resulta rentable cuando tienes un servidor físico masivo (por ejemplo, 64 núcleos) pero solo necesitas encender un par de máquinas virtuales pequeñas de SQL Server.