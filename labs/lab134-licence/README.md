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
