#!/usr/bin/env python3
"""
extract_guide.py — Lee curso_sql_server_dba_25h.pptx y genera GUIA_DEL_DOCENTE.md.
Extrae títulos, contenidos de diapositiva y el guion pedagógico completo de las notas.
"""
import sys
import pathlib
import pptx

def extract():
    script_dir = pathlib.Path(__file__).resolve().parent
    root_dir = script_dir.parents[1]
    deck_path = root_dir / 'curso_sql_server_dba_25h.pptx'
    out_path = root_dir / 'GUIA_DEL_DOCENTE.md'

    if not deck_path.exists():
        print(f"Error: no existe {deck_path}")
        sys.exit(1)

    prs = pptx.Presentation(str(deck_path))
    slides = prs.slides

    md = []
    md.append("# Guía del Docente: Curso de Administración de SQL Server (25 Horas)\n")
    md.append("> **Manual de Referencia y Guion Técnico para el Instructor**  ")
    md.append("> **Duración:** 25 horas lectivas (4 módulos + módulo introductorio)  ")
    md.append("> **Entregable complementario:** `curso_sql_server_dba_25h.pptx` (78 diapositivas panorámicas 16:9 con diagramas nativos y notas integradas)  \n")
    md.append("---\n")
    md.append("## Estructura General del Curso\n")
    md.append("| Módulo | Título | Horas | Diapositivas | Enfoque Pedagógico |")
    md.append("| :---: | :--- | :---: | :---: | :--- |")
    md.append("| **0** | Bienvenida y Entorno | 0,5 h | 1 – 4 | Objetivos, dinámica de clase y despliegue del entorno Docker/SSMS |")
    md.append("| **1** | Fundamentos y Arquitectura. Licenciamiento | 5,5 h | 5 – 20 | Motor relacional, Buffer Pool, páginas/extensiones, WAL/VLF y Lab 1 |")
    md.append("| **2** | Gestión y Seguridad | 7,0 h | 21 – 42 | DDL, restricciones, procedimientos, DML analítico, permisos, roles y Lab 2 |")
    md.append("| **3** | Optimización y Alta Disponibilidad | 6,0 h | 43 – 60 | Índices B-Tree, estadísticas, planes de ejecución, DMVs, Always On y Lab 3 |")
    md.append("| **4** | Mantenimiento, Copias de Seguridad y Caso Final | 6,0 h | 61 – 78 | Backups, Point-in-Time, CHECKDB, Agent, incidencias, Lab 4 y Caso Integrador |")
    md.append("\n---\n")

    # Mapeo de módulos por número de slide
    def get_module_info(n):
        if n <= 4:
            return 0, "Bienvenida y Entorno"
        elif n <= 20:
            return 1, "Fundamentos y Arquitectura. Licenciamiento"
        elif n <= 42:
            return 2, "Gestión y Seguridad"
        elif n <= 60:
            return 3, "Optimización y Alta Disponibilidad"
        else:
            return 4, "Mantenimiento y Buenas Prácticas"

    current_mod = -1

    for idx, slide in enumerate(slides, 1):
        mod_num, mod_name = get_module_info(idx)
        if mod_num != current_mod:
            current_mod = mod_num
            md.append(f"\n# MÓDULO {mod_num}: {mod_name.upper()}\n")

        # Extraer textos y título
        texts = []
        tables = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                txt = shape.text_frame.text.strip()
                if txt:
                    texts.append(txt)
            elif shape.has_table:
                tbl = shape.table
                rows_data = []
                for row in tbl.rows:
                    rows_data.append([cell.text.strip().replace('\n', ' ') for cell in row.cells])
                tables.append(rows_data)

        # Determinar título de slide
        # Normalmente el título es uno de los primeros textos o el que tiene mayor tamaño
        title = f"Diapositiva {idx}"
        badge = ""
        body_texts = []
        for t in texts:
            if t.startswith("Curso de Administración") or t.startswith("Módulo "):
                continue
            if t.isupper() and len(t) < 30 and not badge:
                badge = t
                continue
            if title == f"Diapositiva {idx}" and len(t) < 80 and '\n' not in t:
                title = t
            else:
                body_texts.append(t)

        notes = ""
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes = slide.notes_slide.notes_text_frame.text.strip()

        md.append(f"## Diapositiva {idx:02d}: {title}")
        if badge:
            md.append(f"*Categoría / Badge:* `{badge}`  ")
        md.append(f"*Módulo:* {mod_num} · {mod_name}\n")

        if body_texts:
            md.append("### Contenido Clave en Pantalla")
            for bt in body_texts:
                # Si parece bloque de código T-SQL o comandos
                if any(kw in bt.upper() for kw in ['SELECT ', 'CREATE ', 'ALTER ', 'BACKUP ', 'RESTORE ', 'DBCC ', 'DOCKER ']):
                    md.append("```sql\n" + bt + "\n```\n")
                else:
                    lines = [ln.strip() for ln in bt.split('\n') if ln.strip()]
                    for ln in lines:
                        if ln.startswith('-') or ln.startswith('•'):
                            md.append(f"{ln}")
                        else:
                            md.append(f"- {ln}")
                    md.append("")

        if tables:
            md.append("### Tabla Resumen en Pantalla")
            for tbl in tables:
                if len(tbl) >= 2:
                    header = tbl[0]
                    md.append("| " + " | ".join(header) + " |")
                    md.append("| " + " | ".join([":---"] * len(header)) + " |")
                    for row in tbl[1:]:
                        md.append("| " + " | ".join(row) + " |")
                    md.append("")

        if notes:
            md.append("### Guion del Docente y Notas Técnicas")
            # Parsear las secciones pedagógicas si están presentes
            md.append(notes)
            md.append("")

        md.append("\n---\n")

    content = "\n".join(md)
    out_path.write_text(content, encoding='utf-8')
    print(f"Guía generada exitosamente en {out_path} ({len(content)} caracteres, {len(slides)} diapositivas)")

if __name__ == '__main__':
    extract()
