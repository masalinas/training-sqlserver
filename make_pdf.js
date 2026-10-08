const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');
const { chromium } = require('playwright');
const { execSync } = require('child_process');

// Configure marked with highlight.js
marked.use({
  breaks: false,
  gfm: true,
  renderer: {
    code({ text, lang }) {
      const language = (lang && hljs.getLanguage(lang)) ? lang : 'sql';
      let highlighted = '';
      try {
        highlighted = hljs.highlight(text, { language }).value;
      } catch (e) {
        highlighted = text;
      }
      return `<div class="code-wrapper"><div class="code-badge">${language.toUpperCase()}</div><pre><code class="hljs ${language}">${highlighted}</code></pre></div>`;
    },
    table(header, body) {
      return `<div class="table-container"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
    }
  }
});

const mdContent = fs.readFileSync(path.join(__dirname, 'GUIA_DEL_DOCENTE.md'), 'utf8');

// Split parts by slide
const parts = mdContent.split(/^## Diapositiva /m);

// Parse modules info
const modulesMeta = {
  0: { title: 'MÓDULO 0: BIENVENIDA Y ENTORNO', duration: '0,5 h', slides: '1 – 4', focus: 'Objetivos, dinámica de clase y despliegue del entorno Docker/SSMS' },
  1: { title: 'MÓDULO 1: FUNDAMENTOS Y ARQUITECTURA. LICENCIAMIENTO', duration: '5,5 h', slides: '5 – 20', focus: 'Motor relacional, Buffer Pool, páginas/extensiones, WAL/VLF y Lab 1' },
  2: { title: 'MÓDULO 2: GESTIÓN Y SEGURIDAD', duration: '7,0 h', slides: '21 – 42', focus: 'DDL, restricciones, procedimientos, DML analítico, permisos, roles y Lab 2' },
  3: { title: 'MÓDULO 3: OPTIMIZACIÓN Y ALTA DISPONIBILIDAD', duration: '6,0 h', slides: '43 – 60', focus: 'Índices B-Tree, estadísticas, planes de ejecución, DMVs, Always On y Lab 3' },
  4: { title: 'MÓDULO 4: MANTENIMIENTO, COPIAS DE SEGURIDAD Y CASO FINAL', duration: '6,0 h', slides: '61 – 81', focus: 'Backups, Point-in-Time, CHECKDB, Agent, SSIS, incidencias, Lab 4 y Caso Integrador' }
};

// Friendly slide titles for opener slides
const friendlyTitles = {
  5: '01 · Apertura del Módulo: Fundamentos y Arquitectura',
  21: '02 · Apertura del Módulo: Gestión y Seguridad',
  43: '03 · Apertura del Módulo: Optimización y Alta Disponibilidad',
  61: '04 · Apertura del Módulo: Mantenimiento y Buenas Prácticas',
  76: 'Laboratorio: Caso Práctico Integrador Final'
};

const slides = [];

for (let i = 1; i < parts.length; i++) {
  let text = parts[i];
  let nextMod = null;
  const modMatch = text.match(/\n(# MÓDULO [^\n]+)/);
  if (modMatch) {
    nextMod = modMatch[1];
    text = text.substring(0, modMatch.index);
  }
  text = text.replace(/\n---\s*$/, '').trim();

  const lines = text.split('\n');
  const firstLine = lines[0].trim();
  const slideNumMatch = firstLine.match(/^(\d+):\s*(.*)$/);
  const slideNum = parseInt(slideNumMatch[1], 10);
  let slideTitle = slideNumMatch[2].trim();
  if (friendlyTitles[slideNum]) {
    slideTitle = friendlyTitles[slideNum];
  }

  // Metadata
  let badge = '';
  let modulo = '';
  const badgeMatch = text.match(/\*Categoría \/ Badge:\*\s*`([^`]+)`/);
  if (badgeMatch) badge = badgeMatch[1];
  const modInfoMatch = text.match(/\*Módulo:\*\s*([^\n]+)/);
  if (modInfoMatch) modulo = modInfoMatch[1].trim();

  // If badge is empty, infer from title
  if (!badge) {
    if (slideTitle.toUpperCase().includes('LABORATORIO') || slideTitle.toUpperCase().includes('LAB')) {
      badge = 'LABORATORIO PRÁCTICO';
    } else if (slideTitle.includes('Apertura del Módulo')) {
      badge = 'INTRODUCCIÓN MÓDULO';
    } else if (slideNum === 81) {
      badge = 'CIERRE DEL CURSO';
    } else {
      badge = 'ADMINISTRACIÓN';
    }
  }

  // Find sections
  const contIdx = text.indexOf('### Contenido Clave en Pantalla');
  const tabIdx = text.indexOf('### Tabla Resumen en Pantalla');
  const guionIdx = text.indexOf('### Guion del Docente y Notas Técnicas');

  let contenidoScreen = '';
  let tablaResumen = '';
  if (tabIdx !== -1 && tabIdx < guionIdx) {
    contenidoScreen = text.substring(contIdx + '### Contenido Clave en Pantalla'.length, tabIdx).trim();
    tablaResumen = text.substring(tabIdx + '### Tabla Resumen en Pantalla'.length, guionIdx).trim();
  } else {
    contenidoScreen = text.substring(contIdx + '### Contenido Clave en Pantalla'.length, guionIdx).trim();
  }

  const guionBody = text.substring(guionIdx + '### Guion del Docente y Notas Técnicas'.length).trim();

  const objIdx = guionBody.indexOf('Objetivo Pedagógico:');
  const expIdx = guionBody.indexOf('Guion y Explicación Técnica:');
  const pregIdx = guionBody.indexOf('Puntos de Interacción / Preguntas:');
  const labIdx = guionBody.indexOf('Instrucciones de Laboratorio:');

  const objetivo = guionBody.substring(objIdx + 'Objetivo Pedagógico:'.length, expIdx).trim();
  const explicacion = guionBody.substring(expIdx + 'Guion y Explicación Técnica:'.length, pregIdx).trim();
  let preguntas = '';
  let lab = '';
  if (labIdx !== -1) {
    preguntas = guionBody.substring(pregIdx + 'Puntos de Interacción / Preguntas:'.length, labIdx).trim();
    lab = guionBody.substring(labIdx + 'Instrucciones de Laboratorio:'.length).trim();
  } else {
    preguntas = guionBody.substring(pregIdx + 'Puntos de Interacción / Preguntas:'.length).trim();
  }

  // Check density of screen content bullets
  const bulletCount = (contenidoScreen.match(/^- /gm) || []).length;
  let denseClass = '';
  if (bulletCount >= 22) denseClass = 'very-dense';
  else if (bulletCount >= 9) denseClass = 'dense';

  // Pre-process explicacion and lab to highlight topic leaders if not bolded
  let formattedExplicacion = explicacion.replace(/^- ([A-ZÁÉÍÓÚ0-9][A-Za-zÁÉÍÓÚáéíóúñ0-9 /()«»,.–-]+?):/gm, '- **$1:**');
  let formattedLab = lab ? lab.replace(/^- ([A-ZÁÉÍÓÚ0-9][A-Za-zÁÉÍÓÚáéíóúñ0-9 /()«»,.–-]+?):/gm, '- **$1:**') : '';

  slides.push({
    num: slideNum,
    title: slideTitle,
    badge,
    modulo,
    denseClass,
    contenidoScreenHtml: marked.parse(contenidoScreen),
    tablaResumenHtml: tablaResumen ? marked.parse(tablaResumen) : '',
    objetivoHtml: marked.parse(objetivo),
    explicacionHtml: marked.parse(formattedExplicacion),
    preguntasHtml: marked.parse(preguntas),
    labHtml: lab ? marked.parse(formattedLab) : '',
    nextMod
  });
}

// Export metadata for Python postprocessor
fs.writeFileSync('slides_meta.json', JSON.stringify(slides.map(s => ({
  num: s.num,
  title: s.title,
  badge: s.badge,
  modulo: s.modulo
})), null, 2));

// Build HTML content
let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Guía del Docente - Curso de Administración de SQL Server</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm 12mm 14mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 8.5pt;
      line-height: 1.40;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      height: 260mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      padding: 5mm 5mm 5mm 5mm;
    }

    .cover-top-badge {
      display: inline-block;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 6px;
      margin-bottom: 22px;
    }

    .cover-title {
      font-size: 33pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 19pt;
      font-weight: 600;
      color: #0284c7;
      line-height: 1.3;
      margin: 0 0 18px 0;
    }

    .cover-tagline {
      font-size: 10.5pt;
      color: #475569;
      line-height: 1.6;
      max-width: 95%;
      margin-bottom: 24px;
      border-left: 3px solid #cbd5e1;
      padding-left: 15px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 22px 0;
    }

    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .metric-num {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cover-meta-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      margin-top: 12px;
    }

    .cover-meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 8.8pt;
    }
    
    .cover-meta-row:last-child {
      margin-bottom: 0;
    }

    .cover-meta-label {
      font-weight: 700;
      color: #334155;
    }

    .cover-meta-val {
      color: #475569;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
    }

    /* Course Structure / Overview */
    .overview-page {
      page-break-before: always;
      page-break-after: always;
      break-before: page;
      break-after: page;
      padding-top: 2mm;
    }

    .section-main-title {
      font-size: 16.5pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #0284c7;
    }

    .section-intro-text {
      font-size: 9pt;
      color: #475569;
      margin-bottom: 12px;
      line-height: 1.48;
    }

    /* Module Divider Banner */
    .module-banner {
      page-break-before: always;
      break-before: page;
      break-after: avoid;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      border-radius: 6px;
      padding: 11px 16px;
      margin-bottom: 10px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }

    .module-banner-pill {
      display: inline-block;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #38bdf8;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .module-banner-title {
      font-size: 13pt;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 3px 0;
      line-height: 1.2;
    }

    .module-banner-desc {
      font-size: 8.3pt;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.35;
    }

    /* Slide Card */
    .slide-card {
      margin-bottom: 15px;
    }

    .slide-card.page-break-slide {
      page-break-before: always;
      break-before: page;
    }

    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      padding-bottom: 5px;
      border-bottom: 1.5px solid #0f172a;
      break-after: avoid;
    }

    .slide-title-left {
      flex: 1;
    }

    .slide-num-pill {
      display: inline-block;
      background: #0284c7;
      color: #ffffff;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      padding: 1px 6px;
      border-radius: 4px;
      margin-bottom: 3px;
    }

    .slide-title {
      font-size: 11.2pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .slide-meta-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      margin-left: 10px;
    }

    .badge-category {
      background: #e0f2fe;
      color: #0369a1;
      font-size: 6.8pt;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .badge-category.lab {
      background: #dcfce7;
      color: #15803d;
    }

    .badge-module {
      font-size: 6.8pt;
      color: #64748b;
      white-space: nowrap;
    }

    /* Screen Content Box (Lo que ve el alumno) */
    .screen-content-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 6px 10px;
      margin-bottom: 6px;
      break-inside: avoid;
    }

    .box-title-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 7.2pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
    }

    .screen-body {
      font-size: 8.1pt;
      color: #334155;
      line-height: 1.34;
    }

    .screen-body ul {
      margin: 2px 0 3px 0;
      padding-left: 14px;
    }

    .screen-body.dense ul {
      columns: 2;
      column-gap: 16px;
    }

    .screen-body.very-dense ul {
      columns: 3;
      column-gap: 14px;
    }

    .screen-body.dense li, .screen-body.very-dense li {
      break-inside: avoid;
      margin-bottom: 1px;
    }

    .screen-body li {
      margin-bottom: 1px;
    }

    .screen-body p {
      margin: 2px 0;
    }

    /* Pedagogical Objective */
    .objective-box {
      background: #eff6ff;
      border-left: 3.5px solid #2563eb;
      border-radius: 4px;
      padding: 5px 9px;
      margin-bottom: 6px;
      break-inside: avoid;
    }

    .objective-title {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e40af;
      margin-bottom: 2px;
    }

    .objective-text {
      font-size: 8.2pt;
      color: #1e3a8a;
      font-style: italic;
      line-height: 1.36;
      margin: 0;
    }
    
    .objective-text p {
      margin: 0;
    }

    /* Teacher Script Box */
    .script-section {
      margin-bottom: 6px;
    }

    .script-title {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin: 0 0 3px 0;
      padding-bottom: 2px;
      border-bottom: 1px solid #e2e8f0;
      break-after: avoid;
    }

    .script-body {
      font-size: 8.2pt;
      color: #1e293b;
      line-height: 1.38;
    }

    .script-body ul {
      margin: 2px 0;
      padding-left: 14px;
    }

    .script-body li {
      margin-bottom: 2px;
    }

    .script-body p {
      margin: 2px 0;
    }

    /* Questions / Interaction Box */
    .interaction-box {
      background: #fffbeb;
      border-left: 3.5px solid #f59e0b;
      border-radius: 4px;
      padding: 5px 9px;
      margin-bottom: 6px;
      break-inside: avoid;
    }

    .interaction-title {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #b45309;
      margin-bottom: 2px;
    }

    .interaction-body {
      font-size: 8.1pt;
      color: #78350f;
      line-height: 1.35;
    }

    .interaction-body ul {
      margin: 2px 0;
      padding-left: 14px;
    }

    .interaction-body li {
      margin-bottom: 1px;
    }

    /* Laboratory Box */
    .lab-box {
      background: #f0fdf4;
      border-left: 3.5px solid #10b981;
      border-radius: 4px;
      padding: 6px 9px;
      margin-top: 5px;
      margin-bottom: 6px;
    }

    .lab-title {
      font-size: 7.8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #065f46;
      margin-bottom: 3px;
      break-after: avoid;
    }

    .lab-body {
      font-size: 8.1pt;
      color: #064e3b;
      line-height: 1.36;
    }

    .lab-body ul {
      margin: 2px 0;
      padding-left: 14px;
    }

    .lab-body li {
      margin-bottom: 2px;
    }

    /* Code Blocks */
    .code-wrapper {
      position: relative;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      margin: 4px 0;
      overflow: hidden;
      break-inside: avoid;
    }

    .code-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #e2e8f0;
      color: #475569;
      font-size: 6pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 1px 4px;
      border-bottom-left-radius: 3px;
      border-left: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
    }

    pre {
      margin: 0;
      padding: 5px 8px;
      font-family: "SF Mono", Monaco, Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 7.2pt;
      line-height: 1.30;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    code {
      font-family: inherit;
    }

    p code, li code {
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      padding: 1px 3px;
      border-radius: 3px;
      font-size: 7.6pt;
      font-family: "SF Mono", Monaco, Menlo, Consolas, monospace;
    }

    /* Syntax Highlighting Light Palette */
    .hljs-keyword { color: #0052cc; font-weight: 700; }
    .hljs-built_in { color: #6f42c1; font-weight: 600; }
    .hljs-string { color: #059669; }
    .hljs-comment { color: #64748b; font-style: italic; }
    .hljs-number { color: #d97706; }
    .hljs-variable { color: #b45309; }
    .hljs-literal { color: #dc2626; }

    /* Tables */
    .table-container {
      margin: 4px 0;
      overflow-x: auto;
      break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      margin: 2px 0;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 3px 5px;
      border: 1px solid #0f172a;
    }

    td {
      padding: 2.5px 5px;
      border: 1px solid #cbd5e1;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Overview Table special */
    .overview-table th {
      background-color: #1e3a8a;
      border-color: #1e3a8a;
      font-size: 8pt;
      padding: 4px 6px;
    }

    .overview-table td {
      font-size: 8pt;
      padding: 3px 6px;
    }

    /* Modules Quick Index */
    .modules-index-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 8px;
    }

    .mod-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 9px;
      break-inside: avoid;
    }

    .mod-card-header {
      font-size: 7.5pt;
      font-weight: 800;
      color: #0369a1;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .mod-card-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .mod-card-meta {
      font-size: 7.3pt;
      color: #64748b;
      line-height: 1.32;
    }
  </style>
</head>
<body>

  <!-- PORTADA / COVER PAGE -->
  <div class="cover-page">
    <div>
      <div class="cover-top-badge">Capacitación Técnica Oficial · SQL Server DBA</div>
      <h1 class="cover-title">Guía del Docente</h1>
      <h2 class="cover-subtitle">Curso de Administración de SQL Server (25 Horas)</h2>
      <div class="cover-tagline">
        Manual de referencia técnico y metodológico para el instructor. Incluye desglose pormenorizado de las 81 diapositivas, objetivos pedagógicos, explicaciones técnicas a bajo nivel de la arquitectura del motor, preguntas de dinamización para el aula, resolución paso a paso de los laboratorios y el checklist operativo de buenas prácticas del Administrador de Bases de Datos.
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-num">25 h</div>
          <div class="metric-label">Duración Lectiva</div>
        </div>
        <div class="metric-card">
          <div class="metric-num">5</div>
          <div class="metric-label">Módulos (0 al 4)</div>
        </div>
        <div class="metric-card">
          <div class="metric-num">81</div>
          <div class="metric-label">Diapositivas con Guion</div>
        </div>
        <div class="metric-card">
          <div class="metric-num">14</div>
          <div class="metric-label">Prácticas y Laboratorios</div>
        </div>
        <div class="metric-card">
          <div class="metric-num">77</div>
          <div class="metric-label">Scripts y Bloques T-SQL</div>
        </div>
        <div class="metric-card">
          <div class="metric-num">1</div>
          <div class="metric-label">Caso Práctico Integrador</div>
        </div>
      </div>

      <div class="cover-meta-box">
        <div class="cover-meta-row">
          <span class="cover-meta-label">Motor de Referencia:</span>
          <span class="cover-meta-val">Microsoft SQL Server 2022 (compatible con 2019 / 2016)</span>
        </div>
        <div class="cover-meta-row">
          <span class="cover-meta-label">Entorno de Prácticas:</span>
          <span class="cover-meta-val">Contenedores Docker (mcr.microsoft.com/mssql/server:2022-latest) y SSMS</span>
        </div>
        <div class="cover-meta-row">
          <span class="cover-meta-label">Material Complementario:</span>
          <span class="cover-meta-val">curso_sql_server_dba_25h.pptx (81 diapositivas panorámicas 16:9)</span>
        </div>
        <div class="cover-meta-row">
          <span class="cover-meta-label">Repositorio del Proyecto:</span>
          <span class="cover-meta-val">training-sqlserver · Documento Maestro de Referencia</span>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>Capacitación Técnica Especializada · DBA</span>
      <span>Guía del Docente · Documento de Referencia</span>
    </div>
  </div>

  <!-- ESTRUCTURA GENERAL DEL CURSO -->
  <div class="overview-page">
    <h2 class="section-main-title">Estructura General del Curso</h2>
    <div class="section-intro-text">
      El curso está diseñado para cubrir de forma progresiva desde la arquitectura física del motor relacional hasta la alta disponibilidad y las operaciones críticas ante desastres. Cada módulo alterna bloques teóricos de 20–30 minutos con demostraciones y laboratorios guiados en instancias dedicadas.
    </div>

    <div class="table-container">
      <table class="overview-table">
        <thead>
          <tr>
            <th style="width: 10%; text-align: center;">Módulo</th>
            <th style="width: 32%;">Título</th>
            <th style="width: 10%; text-align: center;">Horas</th>
            <th style="width: 12%; text-align: center;">Diapositivas</th>
            <th style="width: 36%;">Enfoque Pedagógico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; font-weight: 700;">0</td>
            <td><strong>Bienvenida y Entorno</strong></td>
            <td style="text-align: center;">0,5 h</td>
            <td style="text-align: center;">1 – 4</td>
            <td>Objetivos, dinámica de clase y despliegue del entorno Docker/SSMS</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 700;">1</td>
            <td><strong>Fundamentos y Arquitectura. Licenciamiento</strong></td>
            <td style="text-align: center;">5,5 h</td>
            <td style="text-align: center;">5 – 20</td>
            <td>Motor relacional, Buffer Pool, páginas/extensiones, WAL/VLF y Lab 1</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 700;">2</td>
            <td><strong>Gestión y Seguridad</strong></td>
            <td style="text-align: center;">7,0 h</td>
            <td style="text-align: center;">21 – 42</td>
            <td>DDL, restricciones, procedimientos, DML analítico, permisos, roles y Lab 2</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 700;">3</td>
            <td><strong>Optimización y Alta Disponibilidad</strong></td>
            <td style="text-align: center;">6,0 h</td>
            <td style="text-align: center;">43 – 60</td>
            <td>Índices B-Tree, estadísticas, planes de ejecución, DMVs, Always On y Lab 3</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 700;">4</td>
            <td><strong>Mantenimiento, Copias de Seguridad y Caso Final</strong></td>
            <td style="text-align: center;">6,0 h</td>
            <td style="text-align: center;">61 – 81</td>
            <td>Backups, Point-in-Time, CHECKDB, Agent, SSIS, incidencias, Lab 4 y Caso Integrador</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 12px;">
      <h3 style="font-size: 9.5pt; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Mapa de Contenidos por Módulo</h3>
      <div class="modules-index-grid">
        <div class="mod-card">
          <div class="mod-card-header">Módulo 0 · 0,5 h · Diaps. 1–4</div>
          <div class="mod-card-title">Bienvenida y Entorno de Trabajo</div>
          <div class="mod-card-meta">Presentación del curso, dinámica de aprendizaje práctico, reglas de seguridad y despliegue del contenedor SQL Server 2022 en Docker.</div>
        </div>
        <div class="mod-card">
          <div class="mod-card-header">Módulo 1 · 5,5 h · Diaps. 5–20</div>
          <div class="mod-card-title">Arquitectura y Licenciamiento</div>
          <div class="mod-card-meta">Relational Engine vs Storage Engine, Buffer Pool, páginas de 8 KB, MDF/NDF/LDF, WAL y VLFs, bases del sistema, ediciones y licencias Core vs Server+CAL.<br><strong>Lab 1:</strong> Ficheros y Filegroups.</div>
        </div>
        <div class="mod-card">
          <div class="mod-card-header">Módulo 2 · 7,0 h · Diaps. 21–42</div>
          <div class="mod-card-title">Gestión y Seguridad</div>
          <div class="mod-card-meta">DDL robusto, vistas indexadas, Stored Procedures y plan cache sniffing, JOINs lógicos vs físicos, Window Functions, Logins, Users, Schemas, Roles y Ownership Chaining.<br><strong>Lab 2A:</strong> Consultas y SP · <strong>Lab 2B:</strong> Permisos segregados.</div>
        </div>
        <div class="mod-card">
          <div class="mod-card-header">Módulo 3 · 6,0 h · Diaps. 43–60</div>
          <div class="mod-card-title">Optimización y Alta Disponibilidad</div>
          <div class="mod-card-meta">Heaps vs Clustered, B-Tree, Non-Clustered y covering indexes, estadísticas y estimador de cardinalidad, planes de ejecución, DMVs de rendimiento, RTO/RPO y Always On AG.<br><strong>Lab 3.1:</strong> Índices · <strong>Lab 3.2:</strong> Planes · <strong>Lab 3.3:</strong> DMVs.</div>
        </div>
        <div class="mod-card" style="grid-column: span 2;">
          <div class="mod-card-header">Módulo 4 · 6,0 h · Diaps. 61–81</div>
          <div class="mod-card-title">Mantenimiento, Copias de Seguridad y Caso Final</div>
          <div class="mod-card-meta">Modelos Simple vs Full, cadena Full + Diff + Log con CHECKSUM, restauración Point-in-Time (STOPAT), DBCC CHECKDB, mantenimiento automatizado con Agent, SSIS (motor, ETL y SSISDB), alertas de gravedad 19–25, resolución de incidencias críticas (log lleno, TempDB saturada, deadlocks) y Checklist de Buenas Prácticas del DBA.<br><strong>Lab 4:</strong> Preparación, desastre y restauración · <strong>Caso Práctico Integrador Final</strong> (Rúbrica completa).</div>
        </div>
      </div>
    </div>
  </div>
`;

// Add slides and module banners
let currentModule = -1;
const moduleFirstSlides = [1, 5, 21, 43, 61];

slides.forEach((slide) => {
  // Check if we need to insert a module banner
  let modNum = -1;
  if (slide.num >= 1 && slide.num <= 4) modNum = 0;
  else if (slide.num >= 5 && slide.num <= 20) modNum = 1;
  else if (slide.num >= 21 && slide.num <= 42) modNum = 2;
  else if (slide.num >= 43 && slide.num <= 60) modNum = 3;
  else if (slide.num >= 61 && slide.num <= 81) modNum = 4;

  if (modNum !== currentModule) {
    currentModule = modNum;
    const meta = modulesMeta[modNum];
    html += `
    <!-- MODULE BANNER ${modNum} -->
    <div class="module-banner">
      <div class="module-banner-pill">${meta.duration} · DIAPOSITIVAS ${meta.slides}</div>
      <h2 class="module-banner-title">${meta.title}</h2>
      <p class="module-banner-desc">${meta.focus}</p>
    </div>
    `;
  }

  const isModuleFirst = moduleFirstSlides.includes(slide.num);
  const isLab = slide.badge.toUpperCase().includes('LAB') || slide.title.toUpperCase().includes('LAB');

  html += `
  <!-- SLIDE ${slide.num} -->
  <div class="slide-card ${isModuleFirst ? '' : 'page-break-slide'}" id="slide-${slide.num}">
    <div class="slide-header">
      <div class="slide-title-left">
        <span class="slide-num-pill">Diapositiva ${String(slide.num).padStart(2, '0')}</span>
        <h2 class="slide-title">${slide.title}</h2>
      </div>
      <div class="slide-meta-right">
        <span class="badge-category ${isLab ? 'lab' : ''}">${slide.badge}</span>
        <span class="badge-module">${slide.modulo}</span>
      </div>
    </div>

    <!-- Screen Content Box -->
    <div class="screen-content-box">
      <div class="box-title-bar">
        <span>📺 Contenido Clave en Pantalla (Proyección)</span>
      </div>
      <div class="screen-body ${slide.denseClass}">
        ${slide.contenidoScreenHtml}
        ${slide.tablaResumenHtml ? `<div style="margin-top: 4px;"><strong>Tabla Resumen en Diapositiva:</strong>${slide.tablaResumenHtml}</div>` : ''}
      </div>
    </div>

    <!-- Pedagogical Objective -->
    <div class="objective-box">
      <div class="objective-title">🎯 Objetivo Pedagógico</div>
      <div class="objective-text">
        ${slide.objetivoHtml}
      </div>
    </div>

    <!-- Teacher Script -->
    <div class="script-section">
      <div class="script-title">🎙️ Guion del Docente y Explicación Técnica</div>
      <div class="script-body">
        ${slide.explicacionHtml}
      </div>
    </div>

    <!-- Interaction Questions -->
    <div class="interaction-box">
      <div class="interaction-title">💬 Puntos de Interacción y Preguntas para la Clase</div>
      <div class="interaction-body">
        ${slide.preguntasHtml}
      </div>
    </div>

    <!-- Laboratory Guidance (if present) -->
    ${slide.labHtml ? `
    <div class="lab-box">
      <div class="lab-title">🧪 Instrucciones de Laboratorio y Pautas de Resolución</div>
      <div class="lab-body">
        ${slide.labHtml}
      </div>
    </div>
    ` : ''}
  </div>
  `;
});

html += `
</body>
</html>
`;

// Write HTML file
const htmlPath = path.join(__dirname, 'GUIA_DEL_DOCENTE_temp.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML generated successfully at', htmlPath);

// Generate PDF via Playwright
(async () => {
  console.log('Launching Chromium for PDF rendering...');
  const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined });
  const page = await browser.newPage();
  
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  
  console.log('Rendering PDF with Playwright...');
  const rawPdfPath = path.join(__dirname, 'GUIA_DEL_DOCENTE_raw.pdf');
  await page.pdf({
    path: rawPdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 7.2pt; color: #64748b; width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 0 14mm;">
        <span style="font-weight: 600;">Guía del Docente · Administración de SQL Server (25 Horas)</span>
        <span>Manual Técnico del Instructor</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 7.2pt; color: #64748b; width: 100%; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 3px; margin: 0 14mm;">
        <span>training-sqlserver · Documento de Formación</span>
        <span style="font-weight: 600;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '14mm',
      right: '14mm'
    }
  });

  await browser.close();
  console.log('Raw PDF rendered successfully at', rawPdfPath);

  // Run python post-processor
  console.log('Running Python PyMuPDF post-processor...');
  execSync('./.venv/bin/python3 postprocess_pdf.py', { stdio: 'inherit' });

  // Clean up intermediate files
  if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
  if (fs.existsSync(rawPdfPath)) fs.unlinkSync(rawPdfPath);
  if (fs.existsSync(path.join(__dirname, 'slides_meta.json'))) fs.unlinkSync(path.join(__dirname, 'slides_meta.json'));

  console.log('All PDF processing completed and temporary files cleaned up!');
})();

