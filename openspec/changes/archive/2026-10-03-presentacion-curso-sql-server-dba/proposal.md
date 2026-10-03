# Propuesta: Generación de Presentación Técnica y Guía Docente - Curso SQL Server DBA (25 Horas)

## Contexto y Necesidad
Se requiere una presentación técnica completa y profesional para impartir un curso de 25 horas lectivas sobre Administración de Bases de Datos en Microsoft SQL Server, siguiendo el temario oficial de 4 módulos.
Dado el volumen horario, las diapositivas deben estructurarse como un *Slide Deck formativo* (~70-80 diapositivas) completamente en **español**, con notas del orador exhaustivas en cada diapositiva para guiar la exposición del instructor y acompañar los laboratorios prácticos.

## Solución Propuesta
1. Emplear la **skill `pptx` de Anthropic** para programar la generación de la presentación mediante scripts modulares en Python (`python-pptx`).
2. Diseñar una presentación en formato panorámico 16:9 con paleta cromática profesional corporativa (tonos azul marino/acero de SQL Server, acentos de llamada a la acción y fondos de alto contraste legibles en proyector/pantalla).
3. Incorporar esquemas visuales y diagramas explicativos clave (arquitectura de motor, almacenamiento en páginas/extensiones, modelo de seguridad en capas, árboles B de índices y topologías Always On).
4. Generar notas del orador completas (`notes_slide`) en cada diapositiva con explicaciones técnicas de bajo nivel, preguntas de interacción con los alumnos y guías de resolución de los ejercicios.
5. Exportar un documento complementario en Markdown (`GUIA_DEL_DOCENTE.md`) con el texto íntegro de diapositivas y notas para facilitar la lectura y seguimiento en el aula.