# Tareas de Implementación

- [x] 1. Configurar la estructura del proyecto y verificar dependencias de Python (`python-pptx`, `Pillow` si se procesan imágenes) usando la skill `pptx`.
- [x] 2. Crear el módulo base de utilidades de diseño (`layout_helpers.py`):
  - [x] 2.1. Definición de paleta de colores, tipografías y proporciones 16:9.
  - [x] 2.2. Funciones para inserción de tarjetas contenedoras, bloques de código T-SQL con sintaxis clara y badges de sección.
  - [x] 2.3. Helper estandarizado para adjuntar `notes_slide` con el formato pedagógico requerido.
- [x] 3. Generar los activos visuales y diagramas conceptuales:
  - [x] 3.1. Diagrama de arquitectura interna del motor (Relational Engine, Storage Engine, Buffer Pool).
  - [x] 3.2. Esquema de distribución física (Páginas de 8KB, Extensiones y distribución MDF/LDF).
  - [x] 3.3. Diagrama de capas de seguridad (Autenticación -> Logins -> Permisos/Roles -> Objetos).
  - [x] 3.4. Diagrama de estructura de árbol B para índices clustered y non-clustered.
  - [x] 3.5. Cronograma visual de estrategia de Backups (Full + Diff + T-Log y Point-in-Time).
- [x] 4. Programar la generación del Módulo 0 y Módulo 1 (Diapositivas 1 a 20) incluyendo diapositivas de teoría, diagramas, laboratorios guiados y notas completas del docente.
- [x] 5. Programar la generación del Módulo 2: DDL, DML y Seguridad (Diapositivas 21 a 42) con fragmentos T-SQL y notas detalladas.
- [x] 6. Programar la generación del Módulo 3: Optimización, Índices y Alta Disponibilidad (Diapositivas 43 a 60) con visuales y notas.
- [x] 7. Programar la generación del Módulo 4: Mantenimiento, Copias de Seguridad y Caso Práctico Integrador (Diapositivas 61 a 78).
- [x] 8. Desarrollar script extractor que lea el archivo `.pptx` y genere `GUIA_DEL_DOCENTE.md` con todo el contenido y notas ordenadas para lectura offline.
- [x] 9. Ejecutar el ensamblado completo, validar la ausencia de solapamientos visuales en el PPTX generado y verificar que no quede ninguna diapositiva sin notas.