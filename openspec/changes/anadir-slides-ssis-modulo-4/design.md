# Diseño Técnico: Inserción de Bloque SSIS en Módulo 4

## Context

Véase [`proposal.md`](file:///home/miguel/git/training-sqlserver/openspec/changes/anadir-slides-ssis-modulo-4/proposal.md) para la motivación y el alcance general. El sistema actual compila diapositivas a través de scripts en Node.js (`pptxgenjs`) en [`presentacion/src/`](file:///home/miguel/git/training-sqlserver/presentacion/src/) y extrae la guía docente Markdown mediante [`presentacion/src/extract_guide.py`](file:///home/miguel/git/training-sqlserver/presentacion/src/extract_guide.py).

## Goals / Non-Goals

**Goals:**
- Insertar exactamente 3 nuevas diapositivas en [`presentacion/src/m4.js`](file:///home/miguel/git/training-sqlserver/presentacion/src/m4.js) tras la diapositiva 69 (*Mantenimiento automatizado con Agent*), convirtiéndose en las slides 70, 71 y 72.
- Mantener las 78 diapositivas originales 100% intactas, sin modificar su contenido, textos, parámetros ni estructura.
- Modelar un pipeline ETL práctico enfocado exclusivamente en archivos planos CSV (*Flat File Source* ➔ *Data Conversion* ➔ *OLE DB Destination Fast Load*).
- Aplicar de manera estricta la paleta de colores corporativa (`NAVY #0B2545`, `COBALT #134074`, `CORAL #D95D39`, `WHITE/LINE`), tipografías (`Calibri`/`Consolas`) y componentes vectoriales nativos (`H.card`, `rowCard`, flechas vectoriales).
- Garantizar que cada nueva diapositiva incluya notas exhaustivas (`obj`, `guion` de más de 120 palabras, `preguntas` e instrucciones de demostración práctica).
- Ajustar [`extract_guide.py`](file:///home/miguel/git/training-sqlserver/presentacion/src/extract_guide.py) para mapear el Módulo 4 de la diapositiva 61 a la 81 y regenerar [`GUIA_DEL_DOCENTE.md`](file:///home/miguel/git/training-sqlserver/GUIA_DEL_DOCENTE.md).
- Cuadrar los tiempos para que el Módulo 4 dure 6,0 h y el curso total sume exactamente 25,0 horas.

**Non-Goals:**
- No modificar ninguna diapositiva existente (ni su maquetación ni su texto).
- No implementar orígenes Excel ni requerir drivers de Access Database Engine OLE DB.
- No alterar la duración ni los contenidos de los Módulos 0, 1, 2 y 3.

## Decisions

### Decisión 1: Ubicación en Módulo 4 tras Diapositiva 69
- **Elección**: Insertar SSIS inmediatamente después de *Mantenimiento automatizado con Agent*.
- **Razón**: La diapositiva 69 ya introduce SQL Server Agent y menciona los pasos de tipo SSIS. Para un DBA, SSIS se opera mediante el catálogo `SSISDB` y Jobs del Agent con Proxies.
- **Alternativa descartada**: Ubicar en Módulo 2 (Gestión). Descartado porque en Módulo 2 aún no se ha presentado SQL Server Agent ni los conceptos de automatización y administración de servicios.

### Decisión 2: Enfoque exclusivo en CSV / Archivos Planos
- **Elección**: Desarrollar el pipeline ETL sobre `Flat File Source` (CSV) hacia `OLE DB Destination`.
- **Razón**: El formato CSV es el estándar de la industria para cargas batch automatizadas, carece de dependencias externas y evita los errores de drivers OLE DB de 32/64 bits típicos de Microsoft Office/Excel.
- **Alternativa descartada**: Ejemplo con Excel Source. Descartado por la complejidad de compatibilidad de drivers en entornos mixtos.

### Decisión 3: Asignación de 40 minutos dentro de las 6,0 horas de Módulo 4
- **Elección**: Módulo 4 absorbe el bloque SSIS (10 min en slide 70, 15 min en slide 71 con demo, 15 min en slide 72) optimizando el tiempo de exposición teórica sin recortar los laboratorios.
- **Razón**: Permite mantener el cómputo total de 25,0 horas exactas del curso sin alterar la diapositiva de bienvenida ni el temario oficial.

### Decisión 4: Uso de componentes vectoriales nativos
- **Elección**: Utilizar `H.slide`, `H.card`, `rowCard`, `H.iconCircle` y formas de `pptxgenjs` (rectángulos, elipses, conectores) sin imágenes estáticas.
- **Razón**: Garantiza nitidez en cualquier resolución de proyección y uniformidad con las 78 diapositivas existentes.

## Risks / Trade-offs

- **[Riesgo] Desbordamiento de texto en las tarjetas de las nuevas slides**  
  *Mitigación*: Emplear `H.warn` y validar la altura de los textos con `H.textHeight` para asegurar márgenes adecuados en la caja `13.333" × 7.5"`.
- **[Riesgo] Desajuste de rangos de diapositivas en el extractor de la guía**  
  *Mitigación*: Actualizar la función `get_module_info` en [`extract_guide.py`](file:///home/miguel/git/training-sqlserver/presentacion/src/extract_guide.py) y comprobar que la tabla resumen refleje `61 – 81` para el Módulo 4.
- **[Riesgo] Alteración involuntaria de diapositivas previas**  
  *Mitigación*: Añadir el código de las 3 diapositivas como un bloque continuo de inserción en `m4.js`, verificando con `git diff` que ninguna otra línea de las diapositivas previas o posteriores haya cambiado.
