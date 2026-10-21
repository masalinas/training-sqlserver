## Enunciado
Modelo de dominio para gestionar productos dentro de un almacén\

Las entidades del dominio y sus atributos son:

- Estantería: representa un conjunto de ubicaciones en donde se pude almacenar productos. Sus atributos son:
  - Código de la estantería: string de 5 caracteres no especiales y no nulo que identifica de forma univoca a una estantería dentro del almacén
  - x: posición longitudinal dentro de la estantería: entero positivo no nulo
  - y: posición en altura dentro de la misma estantería: entero positivo no nulo

- Stock: representa la cantidad de producto ubicado en una posición exacta de una estantería del almacén. Sus atributos son:
  - código de producto: string de 20 caracteres no especiales, que identifica de forma univoca a un producto no nulo
  . cantidad: cantidad de producto ubicada en una ubicación particular de una estantería, decimal, no nulo y siempre mayor a cero.
  - fecha caducidad: fecha de caducidad del producto


## Resolver:

- Crear script sql para crear el modelo de datos.

- Crear mock sql data para este modelo de datos para poder consultarlo.

  - Crear 3 estanterías con códigos: E1, E2, E3 cada una de ellas con 3 posiciones longitudinales y 4 alturas para cada una de ellas.
  - Crear 4 productos con nombres: P1, P2, P3 y P4.
  - Crear stock para los productos: P1, P2 y P4 con cantidades aleatorias en solo 2 estanterías: E1 y E2

- consultas:  

  - Buscar roturas de stock, es decir, productos que no tenga stock en el almacén
  - Busca los estanterias vacias
  - Buscar la estanteria mas llena
  - Buscar los 3 productos que antes caduquen ordenados por fecha de caducidad
  - Buscar en cada un de las estanterias el producto mas ubicado
