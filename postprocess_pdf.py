import os
import json
import pymupdf

def postprocess():
    raw_pdf_path = "GUIA_DEL_DOCENTE_raw.pdf"
    output_pdf_path = "GUIA_DEL_DOCENTE.pdf"
    meta_path = "slides_meta.json"
    
    if not os.path.exists(raw_pdf_path):
        print(f"Error: {raw_pdf_path} not found.")
        return

    doc = pymupdf.open(raw_pdf_path)
    total_pages = len(doc)
    print(f"Loaded raw PDF with {total_pages} pages.")

    # 1. Redact header and footer on Page 1 (Cover Page)
    cover_page = doc[0]
    rect_top = pymupdf.Rect(0, 0, cover_page.rect.width, 60)
    rect_bottom = pymupdf.Rect(0, cover_page.rect.height - 60, cover_page.rect.width, cover_page.rect.height)
    cover_page.add_redact_annot(rect_top, fill=(1, 1, 1))
    cover_page.add_redact_annot(rect_bottom, fill=(1, 1, 1))
    cover_page.apply_redactions()
    print("Page 1 header and footer redacted successfully.")

    # 2. Load slides metadata
    slides_meta = []
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            slides_meta = json.load(f)
    print(f"Loaded metadata for {len(slides_meta)} slides.")

    # 3. Detect slide pages in the document
    slide_pages = {}

    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        for s in range(1, 79):
            if s not in slide_pages:
                s_str = f"Diapositiva {s:02d}"
                s_str_upper = f"DIAPOSITIVA {s:02d}"
                if s_str in text or s_str_upper in text:
                    slide_pages[s] = page_num + 1

    print(f"Detected {len(slide_pages)} slide pages.")

    module_titles = {
        0: "MÓDULO 0: Bienvenida y Entorno",
        1: "MÓDULO 1: Fundamentos y Arquitectura. Licenciamiento",
        2: "MÓDULO 2: Gestión y Seguridad",
        3: "MÓDULO 3: Optimización y Alta Disponibilidad",
        4: "MÓDULO 4: Mantenimiento y Buenas Prácticas"
    }

    # First slide of each module
    mod_first_slides = {
        0: 1,
        1: 5,
        2: 21,
        3: 43,
        4: 61
    }

    # Build TOC outline
    toc = [
        [1, "Portada - Guía del Docente", 1],
        [1, "Estructura General del Curso", 2]
    ]

    current_module = -1
    for s_info in slides_meta:
        s_num = s_info["num"]
        s_title = s_info["title"]
        s_badge = s_info.get("badge", "")

        # Determine module
        mod_num = 0
        if 1 <= s_num <= 4: mod_num = 0
        elif 5 <= s_num <= 20: mod_num = 1
        elif 21 <= s_num <= 42: mod_num = 2
        elif 43 <= s_num <= 60: mod_num = 3
        elif 61 <= s_num <= 78: mod_num = 4

        if mod_num != current_module:
            current_module = mod_num
            mod_page = slide_pages.get(mod_first_slides[mod_num], 1)
            toc.append([1, module_titles[mod_num], mod_page])

        s_page = slide_pages.get(s_num, 1)
        is_lab = "LAB" in s_badge.upper() or "LAB" in s_title.upper()
        
        if is_lab:
            label = f"[LAB] Diapositiva {s_num:02d}: {s_title}"
        else:
            label = f"Diapositiva {s_num:02d}: {s_title}"

        toc.append([2, label, s_page])

    doc.set_toc(toc)
    doc.save(output_pdf_path)
    doc.close()
    print(f"Final PDF saved to {output_pdf_path} with {len(toc)} bookmark entries.")

if __name__ == "__main__":
    postprocess()
