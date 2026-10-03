'use strict';
/**
 * diagrams.js — Activos visuales y diagramas conceptuales (tarea 3).
 * Todos los diagramas se componen con formas nativas de pptxgenjs (editables en PowerPoint).
 * Cada función recibe (slide, {x,y,w,h}) y dibuja dentro de ese rectángulo.
 */
const Hh = require('./layout_helpers');
const { COL, SHAPE, box, line, rect, text, iconCircle } = Hh;

function layer(slide, { x, y, w, h, label, items, fill = COL.ICE, edge = COL.COBALT, itemFill = COL.COBALT, itemColor = COL.WHITE, size = 12 }) {
  rect(slide, { x, y, w, h, fill, radius: 0.1, line: edge });
  text(slide, label, { x: x + 0.15, y: y + 0.06, w: w - 0.3, h: 0.26, size: 11, bold: true, color: edge, check: false });
  const n = items.length, gap = 0.12;
  const iw = (w - 0.3 - gap * (n - 1)) / n, ih = h - 0.46;
  items.forEach((t, i) => box(slide, { x: x + 0.15 + i * (iw + gap), y: y + 0.36, w: iw, h: ih, text: t, fill: itemFill, color: itemColor, size }));
}

/** 3.1 Arquitectura interna del motor: Relational Engine, Storage Engine, Buffer Pool, SQLOS y ficheros. */
function engineArchitecture(slide, { x, y, w, h }) {
  const sw = w - 1.9; // ancho de la pila
  const gap = 0.16;
  let cy = y;
  box(slide, { x, y: cy, w: sw, h: 0.45, text: 'Aplicación cliente · SSMS · sqlcmd · .NET', fill: COL.STEEL, color: COL.NAVY, size: 13 });
  cy += 0.45;
  line(slide, x + sw / 2, cy, x + sw / 2, cy + gap, { color: COL.CORAL, width: 2, arrow: 'end' });
  text(slide, 'TDS', { x: x + sw / 2 + 0.12, y: cy - 0.02, w: 0.6, h: 0.2, size: 11, bold: true, color: COL.CORAL, check: false });
  cy += gap;
  layer(slide, { x, y: cy, w: sw, h: 0.85, label: 'SNI · SQL Network Interface', items: ['Shared Memory', 'TCP/IP', 'Named Pipes'], fill: COL.ICE, edge: COL.COBALT, itemFill: COL.COBALT });
  cy += 0.85;
  line(slide, x + sw / 2, cy, x + sw / 2, cy + gap, { color: COL.CORAL, width: 2, arrow: 'end' });
  cy += gap;
  layer(slide, { x, y: cy, w: sw, h: 1.1, label: 'RELATIONAL ENGINE (Query Processor)', items: ['Parser', 'Algebrizer', 'Optimizer', 'Query Executor'], fill: 'DDE7F3', edge: COL.NAVY, itemFill: COL.NAVY });
  cy += 1.1;
  line(slide, x + sw / 2, cy, x + sw / 2, cy + gap, { color: COL.CORAL, width: 2, arrow: 'end' });
  cy += gap;
  const stY = cy;
  layer(slide, { x, y: cy, w: sw, h: 1.1, label: 'STORAGE ENGINE', items: ['Access Methods', 'Buffer Manager\n(Buffer Pool)', 'Transaction Manager'], fill: 'DDE7F3', edge: COL.NAVY, itemFill: COL.COBALT });
  cy += 1.1 + gap;
  layer(slide, { x, y: cy, w: sw, h: 0.85, label: 'SQLOS · servicios del sistema operativo', items: ['Schedulers', 'Memory Manager', 'I/O', 'Locks'], fill: COL.ICE, edge: COL.MUTED, itemFill: COL.MUTED });
  // ficheros a la derecha
  const fx = x + sw + 0.7, fw = w - sw - 0.7;
  line(slide, x + sw, stY + 0.55, fx - 0.05, stY + 0.55, { color: COL.CORAL, width: 2, arrow: 'both' });
  const cyl = (label, yy, fill) => {
    slide.addShape(SHAPE.can, { x: fx + 0.1, y: yy, w: fw - 0.2, h: 0.95, fill: { color: fill }, line: { type: 'none' } });
    text(slide, label, { x: fx, y: yy + 0.25, w: fw, h: 0.6, size: 12, bold: true, color: COL.WHITE, align: 'center', valign: 'middle', check: false });
  };
  text(slide, 'Disco', { x: fx, y: stY - 0.55, w: fw, h: 0.25, size: 12, bold: true, color: COL.NAVY, align: 'center', check: false });
  cyl('.mdf\n.ndf\n(datos)', stY - 0.25, COL.COBALT);
  cyl('.ldf\n(log WAL)', stY + 0.85, COL.CORAL);
}

/** 3.2 Distribución física: página de 8 KB, extensión de 64 KB, MDF/NDF/LDF y VLFs. */
function physicalLayout(slide, { x, y, w, h }) {
  // Columna izquierda: anatomía de página
  const pw = 3.3;
  text(slide, 'Página = 8 KB (unidad mínima de E/S)', { x, y, w: pw, h: 0.3, size: 14, bold: true, color: COL.NAVY, check: false });
  const parts = [
    ['Page Header · 96 bytes', COL.NAVY, COL.WHITE, 0.55],
    ['Filas de datos\n(crecen hacia abajo ↓)', COL.COBALT, COL.WHITE, 1.65],
    ['Espacio libre', COL.WHITE, COL.MUTED, 0.9],
    ['Row Offset Array\n(2 bytes/fila, crece hacia arriba ↑)', COL.CORAL, COL.WHITE, 0.9],
  ];
  let py = y + 0.4;
  parts.forEach(([t, f, c, hh]) => { box(slide, { x, y: py, w: pw, h: hh, text: t, fill: f, color: c, size: 13, radius: 0, line: COL.LINE }); py += hh; });
  text(slide, 'Máx. 8060 bytes de datos por fila en página (límite en fila)', { x, y: py + 0.12, w: pw, h: 0.6, size: 12, color: COL.MUTED, check: false });

  // Columna derecha
  const rx = x + pw + 0.5, rw = w - pw - 0.5;
  // Extensión
  text(slide, 'Extensión = 8 páginas contiguas = 64 KB', { x: rx, y, w: rw, h: 0.3, size: 14, bold: true, color: COL.NAVY, check: false });
  const sq = (rw - 7 * 0.08) / 8;
  for (let i = 0; i < 8; i++) box(slide, { x: rx + i * (sq + 0.08), y: y + 0.4, w: sq, h: 0.6, text: `P${i + 1}\n8 KB`, fill: i === 0 ? COL.CORAL : COL.COBALT, size: 11, radius: 0.06 });
  text(slide, 'Mixta: páginas de distintos objetos · Uniforme: un solo objeto (desde la 9.ª página)', { x: rx, y: y + 1.05, w: rw, h: 0.3, size: 12, color: COL.MUTED, check: false });

  // Ficheros de datos
  const dy = y + 1.55;
  text(slide, 'Ficheros de datos agrupados en filegroups', { x: rx, y: dy, w: rw, h: 0.3, size: 14, bold: true, color: COL.NAVY, check: false });
  rect(slide, { x: rx, y: dy + 0.38, w: rw, h: 1.15, fill: COL.ICE, radius: 0.1, line: COL.COBALT });
  text(slide, 'Filegroup PRIMARY (por defecto)', { x: rx + 0.15, y: dy + 0.43, w: rw - 0.3, h: 0.25, size: 11, bold: true, color: COL.COBALT, check: false });
  const fw = (rw - 0.3 - 0.15) / 2;
  box(slide, { x: rx + 0.15, y: dy + 0.75, w: fw, h: 0.65, text: 'Primario .mdf\n(catálogo + datos)', fill: COL.COBALT, size: 12 });
  box(slide, { x: rx + 0.3 + fw, y: dy + 0.75, w: fw, h: 0.65, text: 'Secundario .ndf\n(datos adicionales)', fill: COL.COBALT, size: 12 });

  // Log
  const ly = dy + 1.8;
  text(slide, 'Transaction log (.ldf) — secuencia circular de VLFs', { x: rx, y: ly, w: rw, h: 0.3, size: 14, bold: true, color: COL.NAVY, check: false });
  rect(slide, { x: rx, y: ly + 0.38, w: rw, h: 0.95, fill: COL.WARNBG, radius: 0.1, line: COL.CORAL });
  const vn = 8, vw = (rw - 0.3 - (vn - 1) * 0.06) / vn;
  for (let i = 0; i < vn; i++) {
    const fill = i < 3 ? COL.MUTED : i < 6 ? COL.CORAL : COL.WHITE;
    box(slide, { x: rx + 0.15 + i * (vw + 0.06), y: ly + 0.5, w: vw, h: 0.4, text: `VLF ${i + 1}`, fill, color: i < 6 ? COL.WHITE : COL.MUTED, size: 11, radius: 0.05, line: i < 6 ? null : COL.LINE });
  }
  text(slide, 'Gris: reutilizables · Naranja: activos (log activo) · Blanco: libres', { x: rx + 0.15, y: ly + 0.96, w: rw - 0.3, h: 0.3, size: 11, color: COL.MUTED, check: false });
}

/** 3.3 Capas de seguridad: Autenticación → Login → User → Roles/Permisos → Objetos. */
function securityLayers(slide, { x, y, w, h }) {
  const stages = [
    ['FaKey', 'Autenticación', 'Windows o SQL Server', 'inst'],
    ['FaUserLock', 'Login', 'Principal de servidor', 'inst'],
    ['FaUsers', 'User', 'Principal de base de datos', 'db'],
    ['FaShieldAlt', 'Roles y permisos', 'GRANT · DENY · REVOKE', 'db'],
    ['FaTable', 'Objetos', 'Schemas, tablas, SP, vistas', 'db'],
  ];
  const gaps = [0.35, 0.8, 0.35, 0.35]; // el hueco mayor separa instancia / base de datos
  const bw = (w - 0.4 - gaps.reduce((a, b) => a + b, 0)) / 5; // ancho de cada etapa
  const bandY = y + 0.55, bandH = h - 0.55;
  const sx = [x + 0.2];
  for (let i = 1; i < 5; i++) sx.push(sx[i - 1] + bw + gaps[i - 1]);
  rect(slide, { x, y: bandY, w: sx[1] + bw + 0.2 - x, h: bandH, fill: COL.ICE, radius: 0.12 });
  rect(slide, { x: sx[2] - 0.2, y: bandY, w: sx[4] + bw + 0.2 - (sx[2] - 0.2), h: bandH, fill: 'DDE7F3', radius: 0.12 });
  text(slide, 'NIVEL DE INSTANCIA (servidor)', { x, y, w: sx[1] + bw + 0.2 - x, h: 0.4, size: 13, bold: true, color: COL.NAVY, align: 'center', valign: 'middle', check: false });
  text(slide, 'NIVEL DE BASE DE DATOS', { x: sx[2] - 0.2, y, w: sx[4] + bw + 0.2 - (sx[2] - 0.2), h: 0.4, size: 13, bold: true, color: COL.NAVY, align: 'center', valign: 'middle', check: false });
  stages.forEach(([ic, t, d], i) => {
    const px = sx[i];
    rect(slide, { x: px, y: bandY + 0.3, w: bw, h: bandH - 0.6, fill: COL.WHITE, radius: 0.12, shadowOn: true, line: COL.LINE });
    iconCircle(slide, ic, px + (bw - 0.7) / 2, bandY + 0.5, 0.7, { fill: i < 2 ? COL.COBALT : COL.NAVY });
    text(slide, t, { x: px + 0.1, y: bandY + 1.35, w: bw - 0.2, h: 0.65, size: 16, bold: true, color: COL.NAVY, align: 'center', valign: 'top', label: 'seg título' });
    text(slide, d, { x: px + 0.1, y: bandY + 2.05, w: bw - 0.2, h: 0.9, size: 13, color: COL.TEXT, align: 'center', valign: 'top', label: 'seg desc' });
    if (i < 4) slide.addShape(SHAPE.rightArrow, { x: px + bw + (gaps[i] - 0.3) / 2, y: bandY + 0.65, w: 0.3, h: 0.3, fill: { color: COL.CORAL }, line: { type: 'none' } });
  });
}

/** 3.4 Estructura de árbol B: índice clustered (izq.) y non-clustered (der.). */
function btreeDiagram(slide, { x, y, w, h }) {
  const lw = 1.35; // columna de etiquetas de nivel
  const tw = (w - lw - 0.5) / 2; // ancho de cada árbol
  const levelY = [y + 0.55, y + 1.85, y + 3.15];
  const nh = 0.5;
  const labels = ['Raíz (Root)', 'Nivel intermedio', 'Nivel hoja (Leaf)'];
  labels.forEach((l, i) => text(slide, l, { x, y: levelY[i], w: lw, h: i === 2 ? 0.9 : nh, size: 12, bold: true, color: COL.MUTED, valign: 'middle', check: false }));

  const drawTree = (tx, title, color, mids, leaves, leafH) => {
    text(slide, title, { x: tx, y, w: tw, h: 0.4, size: 15, bold: true, color: COL.NAVY, align: 'center', valign: 'middle', check: false });
    const rootW = 1.4;
    const rootX = tx + (tw - rootW) / 2;
    box(slide, { x: rootX, y: levelY[0], w: rootW, h: nh, text: mids.root, fill: COL.NAVY, size: 13 });
    const mw = 1.5, mgap = (tw - 3 * mw) / 2;
    const midX = [0, 1, 2].map((i) => tx + i * (mw + mgap));
    mids.nodes.forEach((t, i) => {
      box(slide, { x: midX[i], y: levelY[1], w: mw, h: nh, text: t, fill: COL.COBALT, size: 13 });
      line(slide, rootX + rootW / 2, levelY[0] + nh, midX[i] + mw / 2, levelY[1], { color: COL.MUTED, width: 1.25 });
    });
    const lwid = (tw - 3 * 0.22) / 4;
    leaves.forEach((t, i) => {
      const lx = tx + i * (lwid + 0.22);
      box(slide, { x: lx, y: levelY[2], w: lwid, h: leafH, text: t, fill: color, color: COL.WHITE, size: 12, bold: false, radius: 0.06 });
      const parent = i < 2 ? 0 : i === 2 ? 1 : 2;
      const pidx = i === 0 ? 0 : i === 1 ? 0 : i === 2 ? 1 : 2;
      line(slide, midX[pidx] + mw / 2, levelY[1] + nh, lx + lwid / 2, levelY[2], { color: COL.MUTED, width: 1.25 });
      if (i < 3) line(slide, lx + lwid, levelY[2] + leafH / 2, lx + lwid + 0.22, levelY[2] + leafH / 2, { color: COL.CORAL, width: 1.5, arrow: 'both' });
    });
    return lwid;
  };
  const cx = x + lw;
  drawTree(cx, 'Clustered Index', COL.CORAL, { root: '50 | 100', nodes: ['10 | 30', '60 | 80', '110 | 130'] }, ['Filas\n1–9', 'Filas\n10–49', 'Filas\n50–99', 'Filas\n100+'], 0.9);
  const nx = cx + tw + 0.5;
  drawTree(nx, 'Non-Clustered Index', COL.GREEN, { root: 'M | T', nodes: ['A | F', 'M | P', 'T | W'] }, ['Alonso→17\nBravo→42', 'Casas→8\nDíaz→61', 'Mora→23\nNúñez→5', 'Torres→90\nVega→33'], 0.9);
  text(slide, 'La hoja = páginas de datos (la tabla ES el índice). Hojas enlazadas en lista doble.', { x: cx, y: levelY[2] + 1.05, w: tw, h: 0.55, size: 12, color: COL.MUTED, align: 'center', check: false });
  text(slide, 'La hoja guarda clave + puntero (clave clustered o RID) → Key Lookup.', { x: nx, y: levelY[2] + 1.05, w: tw, h: 0.55, size: 12, color: COL.MUTED, align: 'center', check: false });
}

/** 3.5 Cronograma de backups Full + Diff + T-Log y restauración Point-in-Time. */
function backupTimeline(slide, { x, y, w, h }) {
  const lw = 1.9; // etiquetas de fila
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves'];
  const cw = (w - lw) / days.length;
  const tx = x + lw;
  // cabecera de días
  days.forEach((d, i) => box(slide, { x: tx + i * cw, y, w: cw - 0.04, h: 0.38, text: d, fill: COL.NAVY, size: 13, radius: 0 }));
  const rows = [
    ['Full', COL.CORAL, y + 0.5],
    ['Diferencial', COL.COBALT, y + 1.15],
    ['Log de transacciones', COL.GREEN, y + 1.8],
  ];
  rows.forEach(([l, c, ry]) => {
    text(slide, l, { x, y: ry, w: lw - 0.1, h: 0.5, size: 14, bold: true, color: c, valign: 'middle', check: false });
    rect(slide, { x: tx, y: ry + 0.24, w: w - lw, h: 0.02, fill: COL.LINE });
  });
  const at = (day, frac) => tx + (day + frac) * cw; // frac 0..1 dentro del día
  const mark = (day, frac, ry, c, label) => {
    slide.addShape(SHAPE.roundRect, { x: at(day, frac) - 0.2, y: ry + 0.04, w: 0.4, h: 0.4, rectRadius: 0.06, fill: { color: c }, line: { type: 'none' } });
    text(slide, label, { x: at(day, frac) - 0.55, y: ry + 0.46, w: 1.1, h: 0.2, size: 10, color: COL.MUTED, align: 'center', check: false });
  };
  mark(0, 0.9, rows[0][2], COL.CORAL, 'Dom 22:00');
  [1, 2].forEach((d) => mark(d, 0.9, rows[1][2], COL.COBALT, ['', 'Lun 22:00', 'Mar 22:00'][d]));
  // ticks de log cada 15 min (representados cada 0.0625 del día aprox.)
  const failDay = 3, failFrac = 0.44;
  for (let d = 0; d <= failDay; d++) {
    for (let f = d === 0 ? 0.92 : 0; f < (d === failDay ? failFrac : 1); f += 0.04) {
      slide.addShape(SHAPE.rect, { x: at(d, f) - 0.02, y: rows[2][2] + 0.12, w: 0.04, h: 0.24, fill: { color: COL.GREEN }, line: { type: 'none' } });
    }
  }
  text(slide, 'cada 15 min', { x: at(1, 0.55), y: rows[2][2] + 0.46, w: 1.1, h: 0.2, size: 10, color: COL.MUTED, align: 'center', check: false });
  // incidente
  line(slide, at(failDay, failFrac), y + 0.4, at(failDay, failFrac), y + 2.55, { color: COL.CORAL, width: 2, dash: 'dash' });
  box(slide, { x: at(failDay, failFrac) - 1.25, y: y + 2.58, w: 2.5, h: 0.42, text: 'Incidente · Mié 10:37', fill: COL.CORAL, size: 13, radius: 0.08 });
  // secuencia de restauración
  const ry = y + 3.3;
  text(slide, 'Secuencia de restauración (STOPAT = 10:36)', { x, y: ry, w, h: 0.32, size: 15, bold: true, color: COL.NAVY, check: false });
  const chips = [
    ['1 · RESTORE FULL', 'Domingo · NORECOVERY', COL.CORAL],
    ['2 · RESTORE DIFF', 'Martes · NORECOVERY', COL.COBALT],
    ['3 · RESTORE LOG(s)', 'Mar 22:15 → Mié 10:30 · NORECOVERY', COL.GREEN],
    ['4 · LOG final', 'WITH STOPAT = 10:36, RECOVERY', COL.NAVY],
  ];
  const gap = 0.3, chw = (w - gap * 3) / 4;
  chips.forEach(([t, d, c], i) => {
    const cx = x + i * (chw + gap);
    rect(slide, { x: cx, y: ry + 0.45, w: chw, h: 1.1, fill: COL.WHITE, radius: 0.1, shadowOn: true, line: COL.LINE });
    box(slide, { x: cx + 0.12, y: ry + 0.55, w: chw - 0.24, h: 0.38, text: t, fill: c, size: 13, radius: 0.06 });
    text(slide, d, { x: cx + 0.12, y: ry + 0.98, w: chw - 0.24, h: 0.5, size: 12, color: COL.TEXT, align: 'center', valign: 'top', label: 'chip' });
    if (i < 3) slide.addShape(SHAPE.rightArrow, { x: cx + chw + 0.03, y: ry + 0.85, w: gap - 0.06, h: 0.26, fill: { color: COL.CORAL }, line: { type: 'none' } });
  });
}

module.exports = { engineArchitecture, physicalLayout, securityLayers, btreeDiagram, backupTimeline };
