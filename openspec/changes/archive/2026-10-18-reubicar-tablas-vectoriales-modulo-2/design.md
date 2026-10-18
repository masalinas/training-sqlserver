# Design

## Context

La estructura del curso de 20 horas consta de 82 diapositivas repartidas en 5 módulos (0 al 4). En la versión previa, la diapositiva «SQL Server 2025: Tablas vectoriales y RAG» fue introducida al final del Módulo 1 (diapositiva 19), antes del Laboratorio 1. Como se detalla en `proposal.md`, este emplazamiento rompe la cohesión temática de arquitectura física del Módulo 1.

En el Módulo 2 («Gestión y Seguridad»), la sección de DML Avanzado culmina con la diapositiva «Agregados y window functions básicas». Insertar las tablas vectoriales y `VECTOR_DISTANCE` a continuación proporciona una progresión pedagógica óptima: desde orden lógico, joins físicos, subconsultas y funciones de ventana hasta el cálculo de distancias semánticas y consultas RAG híbridas en T-SQL.

## Goals / Non-Goals

**Goals:**
- Mover la diapositiva de tablas vectoriales desde `presentacion/src/m0_m1.js` hacia `presentacion/src/m2.js`, posicionándola inmediatamente tras «Agregados y window functions básicas» con badge `'DML avanzado'`.
- Ajustar la numeración de diapositivas en M1: Lab 1 (I y II) pasan de 20–21 a 19–20.
- Ajustar la numeración de diapositivas en M2: el separador pasa de 22 a 21, y las diapositivas previas al punto de inserción (23–33) retroceden una posición (22–32), ubicando la nueva diapositiva en la posición 33.
- Garantizar que a partir de la diapositiva 34 (Lab 2A) hasta la 82 (Cierre del curso) la numeración permanezca exactamente inalterada.
- Sincronizar separadores de módulo (Slide 5 y Slide 21), metadatos en `extract_guide.py` y `make_pdf.js`, y la documentación en `README.md`.
- Recompilar todos los artefactos (`.pptx`, `.md`, `.pdf`) verificando 0 avisos de maquetación.

**Non-Goals:**
- Modificar el contenido técnico, T-SQL, tarjetas o guion pedagógico de la diapositiva vectorial (se reutiliza íntegramente la maquetación validada).
- Modificar ninguna diapositiva de los Módulos 3 o 4.
- Alterar la duración total del curso (se mantiene en 20,0 horas lectivas exactas).

## Decisions

### Decisión 1: Posición exacta en Módulo 2 y badge temático
- **Elección:** Ubicar la diapositiva tras «Agregados y window functions básicas» como diapositiva 33, con el badge `'DML avanzado'`.
- **Razón:** El uso de `VECTOR_DISTANCE('cosine', Embedding, @VectorPregunta)` opera como una función analítica de ordenación (`ORDER BY Distancia ASC`) combinable con filtros relacionales (`WHERE`). Precede inmediatamente al Laboratorio 2A, donde los alumnos practican consultas avanzadas y procedimientos almacenados.
- **Alternativas consideradas:** Colocarla en la sección DDL junto a `CREATE TABLE` — descartado porque el valor pedagógico reside en la consulta semántica híbrida y RAG más que en la simple sintaxis DDL.

### Decisión 2: Cancelación de desplazamiento (Zero downstream shift para slides 34–82)
- **Elección:** Absorber el movimiento dentro de M1 y la primera mitad de M2:
  - M1: 17 $\rightarrow$ 16 slides (-1).
  - M2 (tramo inicial 21–32): retrocede 1 posición (-1).
  - Inserción en posición 33 (+1).
  - Tramo 34–82: desplazamiento neto $ -1 + 1 = 0 $.
- **Razón:** Elimina cualquier efecto dominó en los laboratorios posteriores (Lab 2A en 34, Lab 2B en 42, Labs 3.1/3.2/3.3 en M3, Lab 4 y Caso Integrador en M4), reduciendo drásticamente el riesgo de enlaces o referencias rotas.

### Decisión 3: Actualización de separadores y metadatos
- **Módulo 1:** Slide 5 pasa a cubrir diapositivas 5–20. Se retira el topic `{ icon: 'FaBrain', text: 'Tablas vectoriales (IA)' }`, quedando 6 temas centrados en arquitectura y licenciamiento.
- **Módulo 2:** Slide 21 pasa a ser el separador (antes 22), cubriendo diapositivas 21–43. Se actualiza el desglose para reflejar las tablas vectoriales en DML avanzado.

## Risks / Trade-offs

- **[Avisos de layout al mover la diapositiva a `m2.js`]** $\rightarrow$ *Mitigación:* Se importan los helpers y constantes visuales consistentes con `m2.js`. La composición visual de la diapositiva ya fue probada con márgenes seguros y altura de texto calibrada (0 warnings).
- **[Desincronización en la Guía del Docente o PDF]** $\rightarrow$ *Mitigación:* Actualizar `extract_guide.py` (función `get_module_info` y tabla resumen) y `make_pdf.js` (`modulesMeta`, `friendlyTitles`, tabla y tarjetas de la página 2).
- **[Referencias cruzadas en notas de laboratorio]** $\rightarrow$ *Mitigación:* Comprobar que Lab 2A hace referencia a la diapositiva 22 (que vuelve a ser exactamente «Creación de tablas y restricciones»).
