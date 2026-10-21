## Enunciado
Modelo de dominio para gestionar stock dentro de un almacén\

Las entidades del dominio y sus atributos son las siguientes:

- Estantería: representa un conjunto de ubicaciones en donde se pude almacenar productos. Sus atributos son:
  - Clave primaria. Sus características son:
    - Nombre: EstanteriaId
    - Tipo: Int, autoincremental, clave primaria
    - Obligatorio: Si    
  - Código de la estantería. Sus características son:
    - Nombre: CodigoEstanteria
    - Tipo: String
    - Obligatorio: Si
    - Restricción: Único
    - Tamaño: 3
    - Formato: alfanumérico empezando por la letra E y seguido de dos números.
  - Posición longitudinal dentro de la estantería. Sus atributos son:
    - Nombre: x
    - Tipo: Int, positivo cero mas
    - Obligatorio: Si
  - Posición en altura dentro de la misma estantería. Sus atributos son:
    - Nombre: y
    - Tipo: Int, positivo cero mas
    - Obligatorio: Si  

- Stock: representa la cantidad de producto ubicado en una posición exacta de una estantería del almacén. Sus atributos son:
  - Clave primaria. Sus características son:
    - Nombre: StockId
    - Tipo: Int, autoincremental, clave primaria
    - Obligatorio: Si  
  - Clave ajena. Sus características son:
    - Nombre: EstanteriaId
    - Tipo: Int, clave ajena de la columna EstanteriaId de la tabla Estanteria
    - Obligatorio: Si
  - Código de producto. Sus características son:
    - Nombre: CodigoProducto
    - Tipo: String
    - Obligatorio: Si    
    - Tamaño: 3
    - Formato: alfanumérico empezando por la letra P y seguido de dos números.    
  - Cantidad de producto. Sus características son:
    - Nombre: Cantidad
    - Tipo: Decimal, positivo, con 3 digitos enteros y dos decimales.
    - Obligatorio: Si
  - Fecha caducidad. Sus características son:
    - Nombre: Caducidad
    - Tipo: tipo date
    - Obligatorio: No

## Resolver:
- Crear script sql para crear el modelo de datos.

- Crear mock sql data para este modelo de datos para poder consultarlo.

  - Crear 3 estanterías con códigos: E01, E02, E03 cada una de ellas con 3 posiciones longitudinales x y 4 alturas y para cada una de ellas.
  - Crear 4 productos con nombres: P01, P02, P03 y P04.
  - Crear stock ubicados de forma aleatoria para los productos: P1, P2 y P4 con cantidades aleatorias en solo 2 estanterías: E1 y E2, y con caducidades
   aleatorias, con fecha superior a hoy, puediendo no tener caducidad para algunos de ellos

- consultas:  

  - Buscar roturas de stock, es decir, productos que no tenga stock en el almacén
  - Busca los estanterias vacias
  - Buscar la estanteria mas llena
  - Buscar los 3 productos que antes caduquen ordenados por fecha de caducidad
  - Buscar en cada un de las estanterias el producto mas ubicado
