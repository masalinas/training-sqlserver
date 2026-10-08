# Hilo Argumental y Registro de Decisiones: Inclusión de SSIS en el Curso SQL Server DBA (25h)

> **Documento:** `PROMPT_SPEC_02.md`  
> **Proyecto:** Training SQL Server DBA (25 horas lectivas)  
> **Fecha:** Octubre 2026  
> **Propósito:** Registrar de forma íntegra y cronológica el hilo argumental, el debate pedagógico, las restricciones técnicas y las decisiones tomadas entre el Usuario y el Asistente durante la fase de exploración e implementación del bloque de **SQL Server Integration Services (SSIS)**.

---

## 1. Contexto Inicial y Antecedentes

El proyecto dispone de un sistema automatizado para generar todo el material docente de un curso oficial de 25 horas sobre **Administración de Bases de Datos en Microsoft SQL Server**:
- **Presentación oficial:** Generada mediante código en Node.js (`pptxgenjs`) en `presentacion/src/` (`build.js`, `m0_m1.js`, `m2.js`, `m3.js`, `m4.js`), produciendo un slide deck panorámico 16:9 (`curso_sql_server_dba_25h.pptx`) de 78 diapositivas originales con notas del orador integradas.
- **Guía del Docente:** Extraída programáticamente a Markdown (`GUIA_DEL_DOCENTE.md`) mediante `presentacion/src/extract_guide.py` y exportada a PDF de alta calidad editorial (`GUIA_DEL_DOCENTE.pdf`) mediante `make_pdf.js`.
- **Marco de Gobierno:** Gestionado bajo la metodología **OpenSpec** (`openspec/`), con especificaciones orientadas a capacidades (`presentacion-curso-sql-server-dba/spec.md`).

---

## 2. Solicitud Inicial del Usuario

El usuario inició la interacción activando el modo de exploración libre (`/openspec-explore`) con los siguientes requerimientos:

> **Petición del Usuario:**
> - Leer en primer lugar la especificación existente en `openspec/specs/presentacion-curso-sql-server-dba/spec.md`.
> - Añadir nuevas diapositivas a la presentación `curso_sql_server_dba_25h.pptx` relacionadas con **SQL Server Integration Services (SSIS)**.
> - Refactorizar la guía de estudio para incorporar estas nuevas transparencias.
> - Cubrir dos contenidos esenciales:
>   1. Cómo instalar el servicio: motor en el servidor y herramienta visual de desarrollo.
>   2. Un ejemplo sencillo de pipeline ETL en el que se importe un archivo Excel o CSV a una tabla relacional de SQL Server.

---

## 3. Fase de Exploración Técnica y Debate Pedagógico (`/openspec-explore`)

### 3.1. Análisis de la Arquitectura del Repositorio
El Asistente inspeccionó la base de código y la especificación existente, identificando los siguientes puntos de partida:
1. Las 78 diapositivas estaban repartidas en 5 bloques:
   - Módulo 0 (Bienvenida y entorno): Diapositivas 1–4 (~0,5 h).
   - Módulo 1 (Fundamentos y arquitectura): Diapositivas 5–20 (~5,5 h).
   - Módulo 2 (Gestión y seguridad): Diapositivas 21–42 (~7,0 h).
   - Módulo 3 (Optimización y alta disponibilidad): Diapositivas 43–60 (~6,0 h).
   - Módulo 4 (Mantenimiento y buenas prácticas): Diapositivas 61–78 (~6,0 h).
2. El script `presentacion/src/extract_guide.py` tenía mapeados estáticamente los rangos de módulos (`n <= 4`, `n <= 20`, `n <= 42`, `n <= 60`, y resto Módulo 4) y referenciaba 78 diapositivas totales.
3. La especificación exigía cobertura del 100% de diapositivas con notas docentes exhaustivas (mínimo 120 palabras de *internals*, advertencias operativas y preguntas de aula).

### 3.2. Debate sobre la Ubicación Curricular (Módulo 2 vs. Módulo 4)
El Asistente planteó al usuario el dilema de dónde ubicar SSIS en un curso orientado específicamente al **DBA**:

* **Opción A (Módulo 2 - Gestión y Seguridad):**
  - *Argumento a favor:* SSIS realiza ingesta de datos y encaja con la creación y manipulación de tablas (DDL/DML).
  - *Argumento en contra:* En el Módulo 2 aún no se ha impartido SQL Server Agent, por lo que la parte crítica de automatización, despliegue en servidor y proxies de seguridad quedaría descolgada.
* **Opción B (Módulo 4 - Mantenimiento y Automatización) [RECOMENDADA]:**
  - *Argumento a favor:* La Diapositiva 69 ya introduce SQL Server Agent y menciona explícitamente los pasos de tipo SSIS. Para un DBA en producción, SSIS se administra mediante el catálogo `SSISDB` y Jobs del Agent con Proxies de bajo privilegio.
  - *Argumento en contra:* El Módulo 4 ya era extenso y requería cuadrar la duración sin canibalizar los laboratorios.

### 3.3. Propuesta Estructural de 3 Diapositivas
El Asistente propuso desglosar el tema en 3 diapositivas:
1. **Slide 70:** *SSIS: Arquitectura e Instalación (Motor y Visual Studio)*.
2. **Slide 71:** *Pipeline ETL Práctico: Ingesta de CSV a SQL Server (Data Flow)*.
3. **Slide 72:** *Despliegue en SSISDB, Proxies de Seguridad y Automatización con Agent*.

---

## 4. Decisiones y Restricciones Críticas Fijadas por el Usuario

El usuario respondió y fijó los tres parámetros de diseño, añadiendo dos restricciones no negociables:

### 4.1. Decisiones Temáticas
1. **Ubicación:** **Módulo 4**, tal como recomendó el Asistente.
2. **Alcance del ejemplo ETL:** **Exclusivamente CSV (Flat File)**, descartando Excel para evitar dependencias externas, drivers de Access Database Engine OLE DB y conflictos de 32 vs. 64 bits.
3. **Número de diapositivas:** **3 diapositivas**.

### 4.2. Restricciones Críticas de Negocio
> **Instrucción Taxativa del Usuario 1:**  
> *"Todas las diapositivas ya creadas no las toques en ningún caso, solamente añade las tres diapositivas en el lugar que corresponda, ajusta los tiempos para que al final sume las 25 horas, de la manera que tu quieras, pero insisto las slides ya existentes no se tocan, solamente se reajusta el tiempo para que todo cuadre y listo."*

> **Instrucción Taxativa del Usuario 2:**  
> *"El estilo, colores y formato ya escogidos en la presentación, por supuesto se mantiene y se utiliza en los tres nuevos slides."*

---

## 5. Solución de Cuadre Matemático y Diseño Visual

### 5.1. Cuadre de Tiempos (25 Horas Exactas)
Para cumplir con la prohibición de alterar las diapositivas previas (incluyendo la Diapositiva 2 con el mapa de horas y la Diapositiva 61 de apertura del Módulo 4 con 6 h):
- Los módulos M0 (0,5 h), M1 (5,5 h), M2 (7,0 h) y M3 (6,0 h) se mantuvieron inalterados.
- El **Módulo 4 se mantuvo en 6,0 h**, absorbiendo internamente los 40 minutos dedicados a SSIS:
  - *Bloque Backups, Restore, CHECKDB e Índices (Slides 61–68):* 2,5 h.
  - *Bloque Automatización con Agent y SSIS (Slides 69–72):* 1,0 h (Agent: 20 min; 3 slides de SSIS: 40 min).
  - *Bloque Incidencias de Producción (Slides 73–75):* 0,5 h.
  - *Laboratorio 4 Práctico (Slide 76):* 1,0 h.
  - *Caso Integrador y Cierre (Slides 77–81):* 1,0 h.
  - **Total Módulo 4: 6,0 h | Total Curso: 25,0 h exactas.**

### 5.2. Estándares Visuales
- **Paleta oficial:** Primario Navy (`#0B2545`), Secundario Cobalt (`#134074`), Acento Coral (`#D95D39`), Fondos `WHITE` y líneas `LINE`.
- **Tipografía:** `Calibri` para títulos y cuerpo; `Consolas` para código T-SQL, rutas y tipos de datos (`DT_STR`, `DT_I4`).
- **Componentes:** Formas vectoriales nativas (`H.card`, `H.steps`, `rowCard`, `H.callout`), sin imágenes rasterizadas fijas.

---

## 6. Formalización en OpenSpec (`anadir-slides-ssis-modulo-4`)

Siguiendo el flujo del proyecto, se scaffolded y validó el cambio en OpenSpec:
1. **`proposal.md`:** Motivación, qué cambia, alcance en Módulo 4 y compromiso de preservación de las 78 diapositivas previas.
2. **`specs/presentacion-curso-sql-server-dba/spec.md` (Delta Spec):**
   - Modificación del requisito de cobertura para elevar el total a 81 diapositivas.
   - Actualización del escenario del Módulo 4 para incorporar los internals de SSIS.
3. **`design.md`:** Justificación técnica de las 4 decisiones clave y plan de mitigación de riesgos de maquetación.
4. **`tasks.md`:** Desglose en 8 tareas medibles y auditables organizadas en 3 grupos.
5. **Validación:** Superada con éxito (`Change 'anadir-slides-ssis-modulo-4' is valid`).

---

## 7. Implementación Paso a Paso (`/openspec-apply-change`)

### 7.1. Inserción de las Diapositivas en `presentacion/src/m4.js`
Se insertaron como un bloque contiguo inmediatamente tras la Diapositiva 69 (línea 408):
- **Slide 70 (SSIS: Arquitectura e Instalación):**
  - Tarjeta 1: Motor en el Servidor (`Setup.exe`, `MsDtsSrvr.exe`, CLR activado con `sp_configure`, base `SSISDB` protegida por Database Master Key).
  - Tarjeta 2: Herramienta de Diseño (Visual Studio 2019/2022 + extensión oficial de SSIS Projects, proyectos `.dtproj` y paquetes `.dtsx`).
  - Callout: Desacoplamiento clave del instalador.
- **Slide 71 (Pipeline ETL Práctico CSV):**
  - Diagrama de flujo horizontal nativo con flechas (`H.steps`):
    1. `Flat File Source (CSV)`: delimitadores, comillas, codificación UTF-8, cadenas `DT_STR`/`DT_WSTR`.
    2. `Data Conversion (RAM)`: transformación en memoria a enteros `DT_I4`, importes y fechas, con redirección de errores (`Error Output`).
    3. `OLE DB Destination`: destino en modo `Table or view - fast load` (`BULK INSERT` con `TABLOCK` sin saturar el transaction log).
  - Callout: Razones por las que CSV es el estándar de producción.
- **Slide 72 (Despliegue, Catálogo SSISDB y Agent):**
  - Cuatro tarjetas horizontales (`rowCard`):
    1. Despliegue del `.ispac` en el catálogo `SSISDB` y entornos (`Environments`).
    2. Programación de Job Step en SQL Server Agent de tipo *Integration Services Package*.
    3. Seguridad con Proxies: Credenciales de Windows + Proxy del Agent para lectura NTFS restringida sobre la carpeta de red.
    4. Monitorización: Informes nativos *All Executions* en SSMS y vistas `catalog.executions`.
  - Callout de advertencia: Trampa habitual de fallos de red por omisión de Proxies.

### 7.2. Verificación de Inmutabilidad con `git diff`
Se auditó mediante `git diff presentacion/src/m4.js` que el 100% de las 78 diapositivas preexistentes permanecían idénticas, con cero líneas borradas o alteradas fuera del bloque de inserción.

### 7.3. Depuración y Compilación de la Presentación
- Primera compilación con `node presentacion/src/build.js`: se detectó un aviso leve de desbordamiento de 0.11" en la tarjeta de instalación de la Slide 70.
- Se refinó la concisión del texto de viñetas.
- Segunda compilación: **81 diapositivas generadas con 0 avisos de maquetación** en `curso_sql_server_dba_25h.pptx`.

### 7.4. Refactorización de la Guía del Docente
- **`presentacion/src/extract_guide.py`:** Se actualizó la referencia general a 81 diapositivas y el rango del Módulo 4 a `61 – 81`.
- **Ejecución:** Se resolvió la dependencia del entorno virtual ejecutando con Python y `python-pptx`, generando `GUIA_DEL_DOCENTE.md` (242.139 caracteres con las 81 diapositivas y sus guiones docentes).
- **`make_pdf.js` y `GUIA_DEL_DOCENTE.pdf`:** Se actualizaron los rangos en `make_pdf.js`, se configuró Chromium headless del sistema y se compiló `GUIA_DEL_DOCENTE.pdf` (87 páginas, 89 marcadores interactivos).

---

## 8. Exportación de la Presentación a PDF

A petición posterior del usuario (*"exporta curso_sql_server_dba_25h.pptx a pdf tambieb"*):
- Se invocó LibreOffice en modo headless (`libreoffice --headless --convert-to pdf --outdir . curso_sql_server_dba_25h.pptx`).
- Se verificó mediante `pymupdf` que `curso_sql_server_dba_25h.pdf` contenía exactamente **81 páginas**, en formato panorámico 16:9 (`960 × 540 pt`), con el texto y las formas vectoriales de las diapositivas 70, 71 y 72 renderizadas a la perfección.

---

## 9. Matriz Final de Entregables del Proyecto

| Fichero | Formato | Diapositivas / Páginas | Estado |
| :--- | :--- | :---: | :--- |
| `curso_sql_server_dba_25h.pptx` | Presentación PowerPoint editable | 81 diapositivas | Actualizado y validado |
| `curso_sql_server_dba_25h.pdf` | Presentación para proyección/lectura | 81 páginas | Exportado y verificado |
| `GUIA_DEL_DOCENTE.md` | Manual técnico en Markdown | 81 diapositivas | Regenerado íntegramente |
| `GUIA_DEL_DOCENTE.pdf` | Manual editorial en PDF | 87 páginas | Compilado con marcadores |
| `presentacion/src/m4.js` | Código fuente del Módulo 4 | Diaps. 61 a 81 | Insertadas slides 70, 71 y 72 |
| `openspec/changes/anadir-slides-ssis-modulo-4/` | Paquete de cambio OpenSpec | 4 artefactos | 100% completado (`all_done`) |

---

## 10. Conclusiones y Valor Aportado

1. **Rigor Curricular:** Se integró un componente esencial de la plataforma de datos de Microsoft (SSIS) desde la óptica del administrador de sistemas y bases de datos, evitando un enfoque meramente de programador de ETL.
2. **Cumplimiento de Restricciones:** Se respetaron a rajatabla la inmutabilidad de los contenidos previos, la coherencia de estilos y el cómputo total de 25 horas lectivas.
3. **Reproducibilidad:** El ecosistema de scripts del proyecto (`build.js`, `extract_guide.py`, `make_pdf.js`) mantiene sincronizados todos los entregables ante cualquier futura actualización.
