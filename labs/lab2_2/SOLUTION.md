## Solución

1.  Crear principals
    
    Asumiendo que tu base de datos se llama Ventas (o la que estamos usando de ejemplo), el script realiza las acciones necesarias de forma segura:

    Ejecutar `1_principals.sql`

    ### ¿Qué estructura de seguridad hemos montado aquí?

    El script organiza los accesos separando la autenticación global de la autorización local dentro de la base de datos mediante esquemas contenedores:

    | Objeto Creado | Nivel de Alcance | Propietario / Enlace | Propósito del Diseño de Seguridad |
    | :--- | :--- | :--- | :--- |
    | **`LoginAppUser`** | Servidor | Instancia Global | Credencial física para que la aplicación (API, web o móvil) se conecte al motor. |
    | **`LoginRptUser`** | Servidor | Instancia Global | Credencial física para que las herramientas de analítica y BI (PowerBI, Excel) se conecten. |
    | **`UserApp`** | Base de Datos | Enlazado a `LoginAppUser` | Identidad interna encargada de ejecutar las operaciones operativas en las tablas. |
    | **`UserRpt`** | Base de Datos | Enlazado a `LoginRptUser` | Identidad interna con permisos restringidos exclusivamente a la lectura de informes. |
    | **`app`** *(Schema)* | Base de Datos | Autorizado a `UserApp` | Contenedor de seguridad para agrupar tablas transaccionales y procedimientos de aplicación. |
    | **`rpt`** *(Schema)* | Base de Datos | Autorizado a `UserRpt` | Contenedor de seguridad aislado para agrupar vistas analíticas y reportes consolidados. |

2.  Definir roles

    Este script creará los dos roles de base de datos solicitados (rol_lectura_rpt y rol_operador) y les asignará permisos directamente a nivel de esquema (Schema). Esta es la mejor práctica de seguridad, ya que cualquier objeto nuevo que crees dentro de esos esquemas en el futuro heredará los permisos automáticamente.

    Ejecutar `2_roles.sql`

    ### Matriz de Control de Accesos por Esquema

    Al asignar los permisos directamente a nivel de contenedor (esquema) en lugar de hacerlo objeto por objeto, simplificamos la administración y garantizamos que cualquier tabla o procedimiento nuevo herede la seguridad automáticamente:

    | Rol Creado | Permiso Asignado | Ámbito de Aplicación | Usuario Miembro | ¿Qué puede hacer en la Base de Datos? |
    | :--- | :--- | :--- | :--- | :--- |
    | **`rol_lectura_rpt`** | `GRANT SELECT` | Todo el esquema **`rpt`** | `UserRpt` | Puede consultar información mediante sentencias `SELECT` en cualquier vista o tabla del contenedor de reportes. Tiene prohibido modificar datos o ejecutar código. |
    | **`rol_operador`** | `GRANT EXECUTE` | Todo el esquema **`app`** | `UserApp` | Puede llamar y ejecutar (`EXEC`) cualquier procedimiento almacenado o función ubicado en el contenedor de la aplicación. No tiene acceso directo de lectura a las tablas base. |

3.  Asignar y denegar

    Este script realiza dos acciones de seguridad críticas. En primer lugar, asegura la asignación de los miembros a sus roles (como veníamos haciendo con UserApp en rol_operador). En segundo lugar, aplica una restricción DENY SELECT explícita sobre la tabla dbo.Pedido para el rol del operador.\
    En SQL Server, un DENY tiene la prioridad más alta: aunque un usuario tenga permisos de lectura por otras vías, el DENY anula cualquier autorización previa. Esto obliga a que el operador solo pueda interactuar con los pedidos a través de los procedimientos almacenados permitidos.

    Ejecutar `3_asignar_denegar.sql`

    **Impacto de la Configuración de Seguridad en el Operador**

    La combinación de permisos que acabas de estructurar sigue el principio de seguridad de encapsulamiento. Esto cambia drásticamente el comportamiento del usuario UserApp (miembro de rol_operador):

    ### Impacto de la Configuración de Seguridad en el Operador

    La combinación de permisos que acabas de estructurar sigue el principio de seguridad de **encapsulamiento de datos**. A continuación se detalla cómo responderá SQL Server ante las acciones del usuario `UserApp` (miembro del `rol_operador`):

    | Acción intentada por el Operador | Resultado en SQL Server | Motivo Técnico de Seguridad |
    | :--- | :---: | :--- |
    | **`SELECT * FROM dbo.Pedido;`** | ❌ **Bloqueado**<br>*(Error de permisos)* | La restricción **`DENY SELECT`** tiene prioridad absoluta en el motor de base de datos. Anula cualquier otro permiso y prohíbe taxativamente la lectura directa de la tabla. |
    | **`EXEC app.usp_TopPedidosCliente...`** |  **Permitido**<br>*(Ejecución Exitosa)* | El rol posee `GRANT EXECUTE` sobre todo el esquema `app`. Al invocar el procedimiento, actúa la **Cadena de Propiedad (Ownership Chaining)**: SQL Server permite al código interno del SP acceder a los datos de la tabla base sin requerir que el usuario final tenga permisos directos sobre ella. |


4.  Probar

    Este script utiliza el comando EXECUTE AS USER para cambiar el contexto de seguridad actual y suplantar la identidad del usuario UserApp (el operador). De este modo, simularemos sus acciones exactas para auditar sus permisos reales con sys.fn_my_permissions y comprobar de primera mano el efecto del bloqueo DENY que creamos en el paso anterior. Al finalizar, usaremos REVERT para regresar a tu cuenta de administrador.

    Ejecutar `4_probar.sql`


    **Resultados esperados en las auditorías de permisos**

    Cuando ejecutas las funciones de sistema dentro del contexto suplantado, SQL Server te devolverá las siguientes estructuras de datos:

    ### Resultados esperados en las auditorías de permisos

    Al ejecutar la auditoría de seguridad mediante las funciones del sistema bajo el contexto suplantado del operador (`UserApp`), SQL Server arrojará la siguiente información en las cuadrículas de resultados:

    | Objeto Evaluado | Resultado de `sys.fn_my_permissions` | Explicación del Comportamiento Técnico |
    | :--- | :--- | :--- |
    | **`dbo.Pedido`** *(OBJECT)* | **Devuelve 0 filas** (Resultado completamente vacío). | Debido al comando explícito `DENY SELECT`, el usuario no cuenta con ningún privilegio efectivo ni derecho de visibilidad sobre este objeto en particular. |
    | **`app`** *(SCHEMA)* | Devuelve una fila con la columna *permission_name* en **`EXECUTE`**. | Confirma de manera transparente que el rol del operador posee la autorización delegada para invocar rutinas, funciones y procedimientos dentro del contenedor de la aplicación. |
