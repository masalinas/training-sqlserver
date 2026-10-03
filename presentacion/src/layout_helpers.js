'use strict';
/**
 * layout_helpers.js — Módulo base de diseño para la presentación del curso
 * "Administración de Bases de Datos en Microsoft SQL Server" (25 h).
 *
 * Implementa la skill `pptx` con pptxgenjs:
 *   - 2.1 Paleta, tipografías y lienzo 16:9 (13.333" x 7.5").
 *   - 2.2 Tarjetas, bloques de código T-SQL con resaltado, badges, tablas, pasos, callouts.
 *   - 2.3 Helper estandarizado de notas del orador (formato pedagógico).
 *
 * Todas las medidas están en pulgadas. Los helpers incluyen una estimación de
 * ajuste de texto que registra avisos (state.warnings) si el contenido no cabe.
 */
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const FA = require('react-icons/fa');

const SHAPE = new pptxgen().ShapeType; // sólo para el enum de formas

// ───────────────────────── 2.1 Paleta, tipografía, lienzo ─────────────────────────
const COL = {
  NAVY: '0B2545', // primario / corporativo
  COBALT: '134074', // secundario / motor
  CORAL: 'D95D39', // acento / alertas
  BG: 'F8F9FA', // fondo estándar
  DEEP: '081528', // fondo separador de módulo
  ICE: 'E8EEF5', // tinte de tarjeta
  STEEL: '8DA9C4', // azul acero claro
  TEXT: '1F2933',
  MUTED: '5C6B7A',
  LINE: 'D0D7DE',
  CODEBG: 'ECEFF3',
  WHITE: 'FFFFFF',
  WARNBG: 'FDEDE8',
  GREEN: '2A7F62',
  AMBER: 'E9A23B',
};
const FONT = { head: 'Calibri', body: 'Calibri', code: 'Consolas' };
const W = 13.333;
const H = 7.5;
const MX = 0.6; // margen horizontal
const CX = MX; // inicio del área de contenido
const CW = W - 2 * MX; // ancho del área de contenido (12.133)
const CY = 1.75; // inicio vertical del contenido
const CH = 5.0; // alto del área de contenido (hasta y = 6.75)

const MODULES = {
  0: 'Módulo 0 · Bienvenida y entorno',
  1: 'Módulo 1 · Fundamentos y arquitectura',
  2: 'Módulo 2 · Gestión y seguridad',
  3: 'Módulo 3 · Optimización y alta disponibilidad',
  4: 'Módulo 4 · Mantenimiento y buenas prácticas',
};

const state = { n: 0, slides: [], warnings: [], cur: null };

// ───────────────────────── Iconos (react-icons → PNG base64) ─────────────────────────
const iconCache = new Map();
const ICON_COLORS = [COL.WHITE, COL.NAVY, COL.COBALT, COL.CORAL];

async function preloadIcons(names, colors = ICON_COLORS) {
  for (const name of names) {
    const Comp = FA[name];
    if (!Comp) throw new Error(`Icono react-icons/fa inexistente: ${name}`);
    for (const c of colors) {
      const key = `${name}|${c}`;
      if (iconCache.has(key)) continue;
      let svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { size: '256' }));
      svg = svg.replace(/currentColor/g, `#${c}`);
      const png = await sharp(Buffer.from(svg), { density: 300 }).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
      iconCache.set(key, 'image/png;base64,' + png.toString('base64'));
    }
  }
}

function iconData(name, color) {
  const d = iconCache.get(`${name}|${color}`);
  if (!d) throw new Error(`Icono no precargado: ${name} (${color}). Usa un icono Fa* con color WHITE/NAVY/COBALT/CORAL.`);
  return d;
}

// ───────────────────────── Estimación de ajuste de texto ─────────────────────────
function lineCount(text, widthIn, sizePt, bold = false, factor) {
  const f = factor || (bold ? 0.53 : 0.5);
  const cpl = Math.max(1, Math.floor((widthIn * 72) / (sizePt * f)));
  let lines = 0;
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { lines += 1; continue; }
    let cur = 0, l = 1;
    for (const w of words) {
      if (cur === 0) cur = w.length;
      else if (cur + 1 + w.length <= cpl) cur += 1 + w.length;
      else { l++; cur = w.length; }
    }
    lines += l;
  }
  return lines;
}
/** paras: [{text,size,bold,after(pt),indent(in)}] → alto estimado en pulgadas */
function textHeight(paras, widthIn) {
  let h = 0;
  for (const p of paras) {
    const l = lineCount(p.text, widthIn - (p.indent || 0), p.size, p.bold);
    h += (l * p.size * 1.2) / 72 + (p.after || 0) / 72;
  }
  return h;
}
function warn(label, need, have) {
  if (need > have + 0.02) {
    const n = state.cur ? state.cur.n : '?';
    state.warnings.push(`slide ${n} [${label}]: necesita ~${need.toFixed(2)}" y hay ${have.toFixed(2)}"`);
  }
}

// ───────────────────────── 2.3 Notas del orador ─────────────────────────
function toList(v) {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map((s) => `- ${s}`).join('\n');
  return String(v);
}
/**
 * Genera el guion con la estructura pedagógica requerida:
 *  Objetivo Pedagógico / Guion y Explicación Técnica / Puntos de Interacción / Preguntas /
 *  Instrucciones de Laboratorio (sólo si aplica).
 * Cada campo admite string o array de strings (se convierte en lista).
 */
function notes({ obj, guion, preguntas, lab }) {
  if (!obj || !guion || !preguntas) throw new Error('notes(): obj, guion y preguntas son obligatorios');
  let s = `Objetivo Pedagógico:\n${toList(obj)}\n\nGuion y Explicación Técnica:\n${toList(guion)}\n\nPuntos de Interacción / Preguntas:\n${toList(preguntas)}`;
  if (lab) s += `\n\nInstrucciones de Laboratorio:\n${toList(lab)}`;
  return s;
}

// ───────────────────────── Primitivas de forma ─────────────────────────
function shadow() {
  return { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.14 };
}
function rect(slide, { x, y, w, h, fill, line, radius = 0, shadowOn = false, transparency, shape }) {
  const o = { x, y, w, h, fill: fill ? { color: fill, transparency } : undefined };
  o.line = line ? { color: line, width: 0.75 } : { type: 'none' };
  if (radius > 0) { o.shape = SHAPE.roundRect; o.rectRadius = radius; }
  if (shape) o.shape = shape;
  if (shadowOn) o.shadow = shadow();
  slide.addShape(o.shape || SHAPE.rect, Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'shape')));
}
/** Línea/flecha entre dos puntos. opts: {color,width,arrow:'end'|'start'|'both',dash} */
function line(slide, x1, y1, x2, y2, { color = COL.MUTED, width = 1.5, arrow, dash } = {}) {
  let swapped = false;
  if (y2 < y1) { [x1, x2] = [x2, x1]; [y1, y2] = [y2, y1]; swapped = true; }
  const o = { x: Math.min(x1, x2), y: y1, w: Math.abs(x2 - x1), h: y2 - y1, line: { color, width } };
  if (x2 < x1) o.flipH = true;
  if (dash) o.line.dashType = dash;
  const endsAt = arrow === 'both' ? 'both' : arrow === 'end' ? (swapped ? 'start' : 'end') : arrow === 'start' ? (swapped ? 'end' : 'start') : null;
  if (endsAt === 'end' || endsAt === 'both') o.line.endArrowType = 'triangle';
  if (endsAt === 'start' || endsAt === 'both') o.line.beginArrowType = 'triangle';
  slide.addShape(SHAPE.line, o);
}
function text(slide, str, { x, y, w, h, size = 14, color = COL.TEXT, bold = false, italic = false, align = 'left', valign = 'top', font = FONT.body, margin = 0, label = 'text', charSpacing, check = true }) {
  if (check) warn(label, textHeight([{ text: Array.isArray(str) ? str.map((r) => r.text).join('') : str, size, bold }], w - (Array.isArray(margin) ? margin[1] + margin[3] : 2 * margin) / 72) , h);
  slide.addText(str, { x, y, w, h, fontFace: font, fontSize: size, color, bold, italic, align, valign, margin, charSpacing });
}
function pill(slide, label, { x, y, w, h = 0.3, fill = COL.COBALT, color = COL.WHITE, size = 10 }) {
  slide.addText(label, { x, y, w, h, shape: SHAPE.roundRect, rectRadius: h / 2, fill: { color: fill }, line: { type: 'none' }, fontFace: FONT.body, fontSize: size, bold: true, color, align: 'center', valign: 'middle', margin: 0, charSpacing: 1 });
}
function iconCircle(slide, name, x, y, d, { fill = COL.COBALT, color = COL.WHITE } = {}) {
  slide.addShape(SHAPE.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' } });
  const s = d * 0.5;
  slide.addImage({ data: iconData(name, color), x: x + (d - s) / 2, y: y + (d - s) / 2, w: s, h: s });
}
/** Caja de diagrama con texto centrado. */
function box(slide, { x, y, w, h, text: t, fill = COL.COBALT, color = COL.WHITE, size = 13, bold = true, line: ln, radius = 0.08, align = 'center', valign = 'middle', font = FONT.body, shadowOn = false, check = true }) {
  if (check) warn(`box "${String(t).slice(0, 18)}"`, textHeight([{ text: String(t).replace(/\n/g, '\n'), size, bold }], w - 0.16), h);
  const o = { x, y, w, h, shape: radius > 0 ? SHAPE.roundRect : SHAPE.rect, fill: { color: fill }, line: ln ? { color: ln, width: 1 } : { type: 'none' }, fontFace: font, fontSize: size, bold, color, align, valign, margin: [0.04, 0.08, 0.04, 0.08] };
  if (radius > 0) o.rectRadius = radius;
  if (shadowOn) o.shadow = shadow();
  slide.addText(t, o);
}

// ───────────────────────── Tipos de diapositiva ─────────────────────────
function register(slide, meta) {
  state.n += 1;
  const rec = { n: state.n, ...meta };
  state.slides.push(rec);
  state.cur = rec;
  return rec;
}
function footer(slide, n, mod, dark = false) {
  const c = dark ? COL.STEEL : COL.MUTED;
  slide.addText('Curso de Administración de SQL Server · 25 h', { x: MX, y: 7.0, w: 6, h: 0.3, fontFace: FONT.body, fontSize: 10, color: c, margin: 0, valign: 'middle' });
  slide.addText(`${MODULES[mod] ? MODULES[mod].split(' · ')[0] : ''}   ${n}`, { x: W - MX - 4, y: 7.0, w: 4, h: 0.3, fontFace: FONT.body, fontSize: 10, color: c, margin: 0, align: 'right', valign: 'middle' });
}

/**
 * Diapositiva de contenido estándar con cabecera (badge + título) y pie.
 * opts: {mod, badge, title, notes: string|object, lab?:bool, bg?}
 * Devuelve el slide. Las notas se adjuntan automáticamente (obligatorias).
 */
function slide(pres, { mod, badge, title, notes: nt, lab = false, bg = COL.BG }) {
  if (!nt) throw new Error(`slide "${title}": faltan notas del orador`);
  const s = pres.addSlide();
  s.background = { color: bg };
  const rec = register(s, { mod, title, lab, kind: 'content' });
  const label = (lab ? 'LABORATORIO · ' : '') + String(badge || '').toUpperCase();
  const bw = Math.max(1.6, label.length * 0.095 + 0.5);
  pill(s, label, { x: MX, y: 0.4, w: bw, fill: lab ? COL.CORAL : COL.COBALT });
  if (lineCount(title, CW, 34, true) > 1) state.warnings.push(`slide ${rec.n}: título demasiado largo (${title.length} car.)`);
  s.addText(title, { x: MX, y: 0.8, w: CW, h: 0.75, fontFace: FONT.head, fontSize: 34, bold: true, color: COL.NAVY, margin: 0, valign: 'middle' });
  footer(s, rec.n, mod);
  s.addNotes(typeof nt === 'string' ? nt : notes(nt));
  return s;
}

/** Diapositiva de portada (oscura). */
function titleSlide(pres, { title, subtitle, tag, notes: nt }) {
  const s = pres.addSlide();
  s.background = { color: COL.DEEP };
  const rec = register(s, { mod: 0, title, kind: 'title' });
  // composición decorativa: círculos concéntricos + icono de base de datos
  s.addShape(SHAPE.ellipse, { x: 8.1, y: 0.9, w: 5.2, h: 5.2, fill: { color: COL.COBALT, transparency: 70 }, line: { type: 'none' } });
  s.addShape(SHAPE.ellipse, { x: 8.75, y: 1.55, w: 3.9, h: 3.9, fill: { color: COL.COBALT, transparency: 45 }, line: { type: 'none' } });
  iconCircle(s, 'FaDatabase', 9.55, 2.35, 2.3, { fill: COL.CORAL });
  const sat = [['FaShieldAlt', 8.2, 1.25], ['FaBolt', 12.0, 1.55], ['FaSyncAlt', 8.55, 5.15], ['FaSave', 11.85, 5.05]];
  sat.forEach(([n, x, y]) => iconCircle(s, n, x, y, 0.7, { fill: COL.NAVY, color: COL.WHITE }));
  pill(s, tag, { x: 0.8, y: 1.6, w: 3.2, h: 0.36, fill: COL.CORAL, size: 11 });
  s.addText(title, { x: 0.8, y: 2.2, w: 7.0, h: 2.2, fontFace: FONT.head, fontSize: 46, bold: true, color: COL.WHITE, margin: 0, valign: 'top' });
  s.addText(subtitle, { x: 0.8, y: 4.6, w: 6.8, h: 1.0, fontFace: FONT.body, fontSize: 20, color: COL.STEEL, margin: 0, valign: 'top' });
  footer(s, rec.n, 0, true);
  s.addNotes(typeof nt === 'string' ? nt : notes(nt));
  return s;
}

/**
 * Separador de módulo (fondo DEEP). opts: {mod, title, subtitle, hours, topics:[{icon,text}], notes}
 * Máx. 6 temas.
 */
function divider(pres, { mod, title, subtitle, hours, topics, notes: nt }) {
  const s = pres.addSlide();
  s.background = { color: COL.DEEP };
  const rec = register(s, { mod, title, kind: 'divider' });
  s.addText(String(mod).padStart(2, '0'), { x: 0.8, y: 0.9, w: 5.5, h: 2.0, fontFace: FONT.head, fontSize: 120, bold: true, color: '1E5AA8', margin: 0, valign: 'top' });
  pill(s, `MÓDULO ${mod} · ${hours}`, { x: 0.8, y: 3.15, w: 2.9, h: 0.36, fill: COL.CORAL, size: 11 });
  s.addText(title, { x: 0.8, y: 3.7, w: 5.9, h: 1.7, fontFace: FONT.head, fontSize: 38, bold: true, color: COL.WHITE, margin: 0, valign: 'top' });
  s.addText(subtitle, { x: 0.8, y: 5.45, w: 5.9, h: 0.9, fontFace: FONT.body, fontSize: 16, color: COL.STEEL, margin: 0, valign: 'top' });
  warn('divider título', textHeight([{ text: title, size: 38, bold: true }], 5.9), 1.7);
  warn('divider subtítulo', textHeight([{ text: subtitle, size: 16 }], 5.9), 0.9);
  const n = topics.length;
  const rowH = Math.min(0.85, 5.2 / n);
  const y0 = (H - rowH * n) / 2 - 0.1;
  topics.forEach((t, i) => {
    const y = y0 + i * rowH;
    s.addShape(SHAPE.roundRect, { x: 7.3, y: y + 0.05, w: 5.4, h: rowH - 0.12, rectRadius: 0.1, fill: { color: COL.WHITE, transparency: 92 }, line: { type: 'none' } });
    iconCircle(s, t.icon, 7.45, y + (rowH - 0.5) / 2, 0.5, { fill: COL.CORAL });
    warn('divider tema', textHeight([{ text: t.text, size: 16 }], 4.3), rowH - 0.14);
    s.addText(t.text, { x: 8.15, y: y + 0.05, w: 4.4, h: rowH - 0.12, fontFace: FONT.body, fontSize: 16, color: COL.WHITE, margin: 0, valign: 'middle' });
  });
  footer(s, rec.n, mod, true);
  s.addNotes(typeof nt === 'string' ? nt : notes(nt));
  return s;
}

/** Diapositiva de cierre (oscura). opts: {title, points:[string], notes} */
function closing(pres, { mod = 4, title, points, notes: nt }) {
  const s = pres.addSlide();
  s.background = { color: COL.DEEP };
  const rec = register(s, { mod, title, kind: 'closing' });
  s.addText(title, { x: 0.8, y: 0.8, w: 11.7, h: 1.0, fontFace: FONT.head, fontSize: 40, bold: true, color: COL.WHITE, margin: 0, valign: 'middle' });
  const n = points.length;
  const cw = (11.7 - (n - 1) * 0.3) / n;
  points.forEach((p, i) => {
    const x = 0.8 + i * (cw + 0.3);
    s.addShape(SHAPE.roundRect, { x, y: 2.3, w: cw, h: 3.4, rectRadius: 0.12, fill: { color: COL.WHITE, transparency: 90 }, line: { type: 'none' } });
    iconCircle(s, p.icon, x + 0.3, 2.6, 0.7, { fill: COL.CORAL });
    s.addText(p.title, { x: x + 0.3, y: 3.5, w: cw - 0.6, h: 0.6, fontFace: FONT.head, fontSize: 18, bold: true, color: COL.WHITE, margin: 0, valign: 'top' });
    warn('closing título', textHeight([{ text: p.title, size: 18, bold: true }], cw - 0.6), 0.6);
    s.addText(p.text, { x: x + 0.3, y: 4.15, w: cw - 0.6, h: 1.4, fontFace: FONT.body, fontSize: 14, color: 'DCE6F2', margin: 0, valign: 'top' });
    warn('closing texto', textHeight([{ text: p.text, size: 14 }], cw - 0.6), 1.4);
  });
  footer(s, rec.n, mod, true);
  s.addNotes(typeof nt === 'string' ? nt : notes(nt));
  return s;
}

// ───────────────────────── 2.2 Componentes de contenido ─────────────────────────
/** Construye runs de viñetas. item: string | {lead,text} | {text,sub:[string|{lead,text}]} */
function bulletRuns(items, { size = 16, color = COL.TEXT, leadColor = COL.NAVY, after = 6 } = {}) {
  const runs = [];
  const paras = [];
  const push = (it, level) => {
    const lead = typeof it === 'object' && it.lead ? it.lead : null;
    const txt = typeof it === 'string' ? it : it.text || '';
    const sz = level ? size - 1 : size;
    const base = { bullet: { indent: level ? 14 : 16 }, indentLevel: level, paraSpaceAfter: after, fontFace: FONT.body, fontSize: sz, color };
    // sólo el primer run del párrafo lleva las propiedades de párrafo (bullet), si no pptxgenjs abre otro párrafo
    if (lead) {
      runs.push({ text: lead + ' ', options: { ...base, bold: true, color: leadColor } });
      runs.push({ text: txt, options: { fontFace: FONT.body, fontSize: sz, color, breakLine: true } });
    } else runs.push({ text: txt, options: { ...base, breakLine: true } });
    paras.push({ text: (lead ? lead + ' ' : '') + txt, size: sz, bold: false, after, indent: level ? 0.55 : 0.3 });
    if (typeof it === 'object' && it.sub) it.sub.forEach((s2) => push(s2, 1));
  };
  items.forEach((it) => push(it, 0));
  // quitar el último breakLine
  runs[runs.length - 1].options = { ...runs[runs.length - 1].options, breakLine: false };
  return { runs, paras };
}
function bullets(slide, items, { x, y, w, h, size = 16, color = COL.TEXT, leadColor = COL.NAVY, after = 6, valign = 'top', label = 'bullets' }) {
  const { runs, paras } = bulletRuns(items, { size, color, leadColor, after });
  warn(label, textHeight(paras, w), h);
  slide.addText(runs, { x, y, w, h, margin: 0, valign });
}

/**
 * Tarjeta: {x,y,w,h,title,body?,bullets?,icon?,tone:'light'|'tint'|'dark',size,titleSize,accent}
 */
function card(slide, { x, y, w, h, title, body, bullets: bl, icon, tone = 'light', size = 14, titleSize = 17, accent, side = false }) {
  if (side && icon) return cardSide(slide, { x, y, w, h, title, body, icon, tone, size, titleSize, accent });
  const dark = tone === 'dark';
  const fill = dark ? COL.COBALT : tone === 'tint' ? COL.ICE : COL.WHITE;
  rect(slide, { x, y, w, h, fill, radius: 0.12, shadowOn: tone === 'light', line: tone === 'light' ? COL.LINE : null });
  const tc = dark ? COL.WHITE : COL.NAVY;
  const bc = dark ? 'E6EEF8' : COL.TEXT;
  const pad = 0.25;
  let ty = y + pad;
  if (icon) {
    iconCircle(slide, icon, x + pad, ty, 0.6, { fill: accent || (dark ? COL.CORAL : COL.COBALT) });
    warn(`card "${title}" título`, textHeight([{ text: title, size: titleSize, bold: true }], w - 1.2), 0.6);
    slide.addText(title, { x: x + pad + 0.75, y: ty, w: w - 2 * pad - 0.75, h: 0.6, fontFace: FONT.head, fontSize: titleSize, bold: true, color: tc, margin: 0, valign: 'middle' });
    ty += 0.8;
  } else {
    const th = (lineCount(title, w - 2 * pad, titleSize, true) * titleSize * 1.2) / 72;
    slide.addText(title, { x: x + pad, y: ty, w: w - 2 * pad, h: th, fontFace: FONT.head, fontSize: titleSize, bold: true, color: tc, margin: 0, valign: 'top' });
    ty += th + 0.12;
  }
  const bh = y + h - ty - pad;
  if (bl) bullets(slide, bl, { x: x + pad, y: ty, w: w - 2 * pad, h: bh, size, color: bc, leadColor: dark ? COL.WHITE : COL.NAVY, after: 4, label: `card "${title}"` });
  else if (body) {
    warn(`card "${title}"`, textHeight([{ text: body, size }], w - 2 * pad), bh);
    slide.addText(body, { x: x + pad, y: ty, w: w - 2 * pad, h: bh, fontFace: FONT.body, fontSize: size, color: bc, margin: 0, valign: 'top' });
  }
}
/** Variante compacta de tarjeta: icono a la izquierda, título y texto a la derecha. */
function cardSide(slide, { x, y, w, h, title, body, icon, tone, size, titleSize, accent }) {
  const dark = tone === 'dark';
  rect(slide, { x, y, w, h, fill: dark ? COL.COBALT : tone === 'tint' ? COL.ICE : COL.WHITE, radius: 0.12, shadowOn: tone === 'light', line: tone === 'light' ? COL.LINE : null });
  const pad = 0.25, d = 0.7;
  iconCircle(slide, icon, x + pad, y + (h - d) / 2, d, { fill: accent || (dark ? COL.CORAL : COL.COBALT) });
  const tx = x + pad + d + 0.25, tw = w - pad * 2 - d - 0.25;
  const th = (lineCount(title, tw, titleSize, true) * titleSize * 1.2) / 72;
  const bh = textHeight([{ text: body, size }], tw);
  warn(`card "${title}"`, th + 0.08 + bh, h - 0.3);
  slide.addText([{ text: title, options: { bold: true, fontSize: titleSize, color: dark ? COL.WHITE : COL.NAVY, fontFace: FONT.head, breakLine: true } }, { text: body, options: { fontSize: size, color: dark ? 'E6EEF8' : COL.TEXT, fontFace: FONT.body } }], { x: tx, y: y + 0.1, w: tw, h: h - 0.2, margin: 0, valign: 'middle', paraSpaceAfter: 4 });
}
/** Fila de tarjetas iguales. cards: [{title,body|bullets,icon,tone}] */
function cardsRow(slide, cards, { x = CX, y = CY, w = CW, h = CH, gap = 0.3, size = 14, titleSize = 17 } = {}) {
  const n = cards.length;
  const cw = (w - gap * (n - 1)) / n;
  cards.forEach((c, i) => card(slide, { size, titleSize, ...c, x: x + i * (cw + gap), y, w: cw, h }));
}
/** Rejilla de tarjetas (cols x filas). */
function cardsGrid(slide, cards, { cols = 2, x = CX, y = CY, w = CW, h = CH, gap = 0.3, size = 14, titleSize = 16 } = {}) {
  const rows = Math.ceil(cards.length / cols);
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = (h - gap * (rows - 1)) / rows;
  cards.forEach((c, i) => card(slide, { size, titleSize, ...c, x: x + (i % cols) * (cw + gap), y: y + Math.floor(i / cols) * (ch + gap), w: cw, h: ch }));
}

// ─── Resaltado T-SQL ───
const KW = new Set(('ADD ALL ALTER AND ANY AS ASC AUTHORIZATION BACKUP BEGIN BETWEEN BREAK BY CASE CATCH CHECK CHECKPOINT CLOSE CLUSTERED COLUMN COMMIT COMPRESSION CONSTRAINT CONTAINS CONTINUE CREATE CROSS CURRENT CURSOR DATABASE DBCC DEALLOCATE DECLARE DEFAULT DELETE DENY DESC DISABLE DISTINCT DROP ELSE ENABLE END EXCEPT EXEC EXECUTE EXISTS FETCH FILE FILEGROUP FILEGROWTH FILENAME FOR FOREIGN FROM FULL FUNCTION GO GRANT GROUP HAVING IDENTITY IF IN INCLUDE INDEX INNER INSERT INTERSECT INTO IS JOIN KEY LEFT LIKE LOGIN MAXSIZE MERGE MOVE NOCHECK NONCLUSTERED NOT NULL OFF ON OPEN OPTION OR ORDER OUTER OVER PARTITION PRIMARY PROC PROCEDURE RAISERROR READ RECOMPILE RECOVERY REFERENCES REORGANIZE REBUILD RESTORE RETURN RETURNS REVOKE RIGHT ROLE ROLLBACK ROW ROWS SCHEMA SELECT SET SIZE STATISTICS STATS TABLE THEN THROW TOP TRAN TRANSACTION TRIGGER TRY TRUNCATE UNION UNIQUE UPDATE USE USER USING VALUES VIEW WHEN WHERE WHILE WITH NAME NO_WAIT NORECOVERY STOPAT REPLACE DIFFERENTIAL INIT FORMAT CHECKSUM COPY_ONLY PERCENT TIES PRECEDING FOLLOWING UNBOUNDED CURRENT_TIMESTAMP').split(/\s+/));
const TYPES = new Set('INT BIGINT SMALLINT TINYINT BIT DECIMAL NUMERIC MONEY FLOAT REAL DATE DATETIME DATETIME2 TIME CHAR VARCHAR NCHAR NVARCHAR TEXT UNIQUEIDENTIFIER XML VARBINARY MAX SYSNAME'.split(/\s+/));
const TOKEN = /(--.*$)|(N?'(?:[^']|'')*')|(@@?\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z_0-9]*\b)|(\[[^\]]+\])/g;

function highlightLine(lineStr, size) {
  const runs = [];
  const add = (t, o = {}) => {
    if (!t) return;
    const last = runs[runs.length - 1];
    const same = last && !!last.options.bold === !!o.bold && !!last.options.italic === !!o.italic && last.options.color === (o.color || COL.TEXT);
    if (same) last.text += t;
    else runs.push({ text: t, options: { fontFace: FONT.code, fontSize: size, color: o.color || COL.TEXT, bold: !!o.bold, italic: !!o.italic } });
  };
  let last = 0, m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(lineStr))) {
    add(lineStr.slice(last, m.index));
    const t = m[0];
    if (m[1]) add(t, { color: '6B7280', italic: true });
    else if (m[2]) add(t, { color: 'B4441F' });
    else if (m[3]) add(t, { color: '0F766E' });
    else if (m[4]) add(t, { color: '9A3412' });
    else if (m[5]) {
      const up = t.toUpperCase();
      if (KW.has(up)) add(t, { color: '1D4ED8', bold: true });
      else if (TYPES.has(up)) add(t, { color: '7C3AED' });
      else add(t);
    } else if (m[6]) add(t, { color: COL.TEXT });
    last = m.index + t.length;
  }
  add(lineStr.slice(last));
  if (!runs.length) add(' ');
  return runs;
}

/**
 * Bloque de código T-SQL con resaltado sobre caja gris clara.
 * opts: {x,y,w,h,code,label='T-SQL',size=12}
 */
function code(slide, { x, y, w, h, code: src, label = 'T-SQL', size = 12 }) {
  rect(slide, { x, y, w, h, fill: COL.CODEBG, radius: 0.1, line: COL.LINE });
  slide.addText(label, { x: x + 0.2, y: y + 0.1, w: 3, h: 0.25, fontFace: FONT.body, fontSize: 10, bold: true, color: COL.COBALT, margin: 0, charSpacing: 1 });
  const lines = src.replace(/\n+$/, '').split('\n');
  const runs = [];
  lines.forEach((ln, i) => {
    const r = highlightLine(ln, size);
    if (i < lines.length - 1) r[r.length - 1].options.breakLine = true;
    runs.push(...r);
  });
  const inner = { w: w - 0.4, h: h - 0.5 };
  const maxLen = Math.max(...lines.map((l) => l.length));
  const needW = (maxLen * size * 0.58) / 72; // Consolas ≈ 0.55 em
  const needH = (lines.length * size * 1.22) / 72;
  if (needW > inner.w + 0.02) state.warnings.push(`slide ${state.cur ? state.cur.n : '?'} [código]: línea larga, necesita ~${needW.toFixed(2)}" y hay ${inner.w.toFixed(2)}"`);
  warn('código (alto)', needH, inner.h);
  slide.addText(runs, { x: x + 0.2, y: y + 0.4, w: inner.w, h: inner.h, margin: 0, valign: 'top', fontFace: FONT.code, fontSize: size, wrap: false });
}

/**
 * Tabla comparativa. rows[0] = cabecera. Celdas: string | {text,bold,color,fill}.
 * opts: {x,y,w,colW:[...],size=13,firstColBold=true}
 */
function table(slide, rows, { x = CX, y = CY, w = CW, colW, size = 13, headSize, firstColBold = true, maxH = CH }) {
  const n = rows[0].length;
  const cw = colW || Array(n).fill(w / n);
  const sum = cw.reduce((a, b) => a + b, 0);
  const cws = cw.map((c) => (c * w) / sum);
  const hs = headSize || size;
  let total = 0;
  const rowH = rows.map((r, ri) => {
    const lines = Math.max(...r.map((c, ci) => lineCount(typeof c === 'string' ? c : c.text, cws[ci] - 0.24, ri === 0 ? hs : size, ri === 0 || (ci === 0 && firstColBold))));
    const hgt = (lines * (ri === 0 ? hs : size) * 1.2) / 72 + 0.2;
    total += hgt;
    return hgt;
  });
  warn('tabla', total, maxH);
  const data = rows.map((r, ri) =>
    r.map((c, ci) => {
      const o = typeof c === 'string' ? { text: c } : c;
      const head = ri === 0;
      return {
        text: o.text,
        options: {
          fontFace: FONT.body,
          fontSize: head ? hs : size,
          bold: head || o.bold || (ci === 0 && firstColBold),
          color: head ? COL.WHITE : o.color || (ci === 0 && firstColBold ? COL.NAVY : COL.TEXT),
          fill: { color: head ? COL.NAVY : o.fill || (ri % 2 ? COL.WHITE : COL.ICE) },
          valign: 'middle',
          align: 'left',
          margin: [0.06, 0.12, 0.06, 0.12],
          border: { type: 'solid', color: COL.LINE, pt: 0.75 },
        },
      };
    })
  );
  slide.addTable(data, { x, y, w, colW: cws, rowH });
  return total;
}

/**
 * Pasos numerados con flechas. steps: [{title,body}], dir 'h' (columnas) o 'v' (filas).
 */
function steps(slide, items, { x = CX, y = CY, w = CW, h = CH, dir = 'h', gap = 0.35, size = 14, accent = COL.COBALT } = {}) {
  const n = items.length;
  if (dir === 'h') {
    const cw = (w - gap * (n - 1)) / n;
    items.forEach((it, i) => {
      const cx = x + i * (cw + gap);
      rect(slide, { x: cx, y, w: cw, h, fill: COL.WHITE, radius: 0.12, shadowOn: true, line: COL.LINE });
      slide.addShape(SHAPE.ellipse, { x: cx + 0.25, y: y + 0.25, w: 0.55, h: 0.55, fill: { color: accent }, line: { type: 'none' } });
      slide.addText(String(i + 1), { x: cx + 0.25, y: y + 0.25, w: 0.55, h: 0.55, fontFace: FONT.head, fontSize: 18, bold: true, color: COL.WHITE, align: 'center', valign: 'middle', margin: 0 });
      warn(`paso "${it.title}"`, textHeight([{ text: it.title, size: 16, bold: true }], cw - 0.5), 0.7);
      slide.addText(it.title, { x: cx + 0.25, y: y + 0.95, w: cw - 0.5, h: 0.7, fontFace: FONT.head, fontSize: 16, bold: true, color: COL.NAVY, margin: 0, valign: 'top' });
      warn(`paso "${it.title}" cuerpo`, textHeight([{ text: it.body, size }], cw - 0.5), h - 1.8);
      slide.addText(it.body, { x: cx + 0.25, y: y + 1.7, w: cw - 0.5, h: h - 1.8, fontFace: FONT.body, fontSize: size, color: COL.TEXT, margin: 0, valign: 'top' });
      if (i < n - 1) slide.addShape(SHAPE.rightArrow, { x: cx + cw + 0.04, y: y + 0.38, w: gap - 0.08, h: 0.3, fill: { color: COL.CORAL }, line: { type: 'none' } });
    });
  } else {
    const rh = (h - gap * (n - 1)) / n;
    items.forEach((it, i) => {
      const ry = y + i * (rh + gap);
      rect(slide, { x, y: ry, w, h: rh, fill: COL.WHITE, radius: 0.12, shadowOn: true, line: COL.LINE });
      slide.addShape(SHAPE.ellipse, { x: x + 0.25, y: ry + (rh - 0.55) / 2, w: 0.55, h: 0.55, fill: { color: accent }, line: { type: 'none' } });
      slide.addText(String(i + 1), { x: x + 0.25, y: ry + (rh - 0.55) / 2, w: 0.55, h: 0.55, fontFace: FONT.head, fontSize: 18, bold: true, color: COL.WHITE, align: 'center', valign: 'middle', margin: 0 });
      warn(`paso "${it.title}"`, textHeight([{ text: it.title, size: 16, bold: true }], 2.6), rh - 0.1);
      slide.addText(it.title, { x: x + 1.05, y: ry, w: 2.7, h: rh, fontFace: FONT.head, fontSize: 16, bold: true, color: COL.NAVY, margin: 0, valign: 'middle' });
      warn(`paso "${it.title}" cuerpo`, textHeight([{ text: it.body, size }], w - 4.3), rh - 0.1);
      slide.addText(it.body, { x: x + 3.9, y: ry, w: w - 4.15, h: rh, fontFace: FONT.body, fontSize: size, color: COL.TEXT, margin: 0, valign: 'middle' });
    });
  }
}

/** Cifra destacada: {x,y,w,h,value,label,tone:'light'|'dark'} */
function stat(slide, { x, y, w, h, value, label, tone = 'light', valueSize = 44 }) {
  const dark = tone === 'dark';
  rect(slide, { x, y, w, h, fill: dark ? COL.NAVY : COL.WHITE, radius: 0.12, shadowOn: !dark, line: dark ? null : COL.LINE });
  slide.addText(value, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: h * 0.5, fontFace: FONT.head, fontSize: valueSize, bold: true, color: dark ? COL.WHITE : COL.CORAL, margin: 0, align: 'center', valign: 'middle' });
  warn(`stat "${value}"`, textHeight([{ text: label, size: 13 }], w - 0.4), h * 0.5 - 0.15);
  slide.addText(label, { x: x + 0.2, y: y + h * 0.55, w: w - 0.4, h: h * 0.4, fontFace: FONT.body, fontSize: 13, color: dark ? 'DCE6F2' : COL.MUTED, margin: 0, align: 'center', valign: 'top' });
}

/** Callout: {x,y,w,h,text,kind:'tip'|'warn'|'info',size,lead} */
function callout(slide, { x, y, w, h, text: t, kind = 'tip', size = 14, lead }) {
  const warnK = kind === 'warn';
  rect(slide, { x, y, w, h, fill: warnK ? COL.WARNBG : COL.ICE, radius: 0.12 });
  const ic = warnK ? 'FaExclamationTriangle' : kind === 'info' ? 'FaCheckCircle' : 'FaLightbulb';
  const d = 0.5;
  iconCircle(slide, ic, x + 0.2, y + (h - d) / 2, d, { fill: warnK ? COL.CORAL : COL.COBALT });
  const runs = lead ? [{ text: lead + ' ', options: { bold: true, color: warnK ? 'A8431F' : COL.NAVY } }, { text: t, options: {} }] : [{ text: t, options: {} }];
  warn('callout', textHeight([{ text: (lead ? lead + ' ' : '') + t, size }], w - 1.1), h - 0.1);
  slide.addText(runs, { x: x + 0.9, y, w: w - 1.1, h, fontFace: FONT.body, fontSize: size, color: COL.TEXT, margin: 0, valign: 'middle' });
}

module.exports = {
  pptxgen, SHAPE, COL, FONT, W, H, MX, CX, CW, CY, CH, MODULES, state,
  preloadIcons, iconData, lineCount, textHeight, warn,
  notes, slide, titleSlide, divider, closing,
  rect, line, text, pill, iconCircle, box, bullets, card, cardsRow, cardsGrid, code, table, steps, stat, callout,
};
