'use strict';
/**
 * build.js — Ensambla la presentación completa.
 *   node presentacion/src/build.js            → presentacion/curso_sql_server_dba_25h.pptx
 *   MODS=m0_m1,m2 node ... build.js           → sólo esos módulos (pruebas)
 *   OUT=ruta.pptx node ... build.js           → fichero de salida alternativo
 *   START=21 node ... build.js                → numeración inicial de diapositivas (pie de página)
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const H = require('./layout_helpers');
const D = require('./diagrams');

const MODULES = (process.env.MODS || 'm0_m1,m2,m3,m4').split(',');
const OUT = process.env.OUT || path.join(__dirname, '..', '..', 'curso_sql_server_dba_25h.pptx');

(async () => {
  // Precarga de iconos: se detectan todos los FaXxx referenciados en el código fuente.
  const files = ['layout_helpers.js', 'diagrams.js', ...MODULES.map((m) => `${m}.js`)];
  const icons = new Set();
  for (const f of files) {
    const p = path.join(__dirname, f);
    if (!fs.existsSync(p)) continue;
    for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bFa[A-Z][A-Za-z0-9]+\b/g)) icons.add(m[0]);
  }
  await H.preloadIcons([...icons]);

  H.state.n = (parseInt(process.env.START || '1', 10) || 1) - 1; // nº de la primera diapositiva (para pruebas de un solo módulo)
  const pres = new H.pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333" x 7.5" (16:9)
  pres.title = 'Curso de Administración de SQL Server (25 h)';
  pres.subject = 'SQL Server DBA';
  pres.author = 'Formación SQL Server';

  for (const m of MODULES) {
    const p = path.join(__dirname, `${m}.js`);
    if (!fs.existsSync(p)) { console.warn(`(aviso) módulo no encontrado: ${m}.js`); continue; }
    const before = H.state.n;
    await require(p)(pres, H, D);
    console.log(`${m}: ${H.state.n - before} diapositivas (acumulado ${H.state.n})`);
  }

  // pptxgenjs emite un <a:pPr> por cada run; en párrafos con varios runs eso deja pPr duplicados
  // a mitad de párrafo (no válidos en el esquema). Se conserva sólo el primero de cada <a:p>.
  const buf = await pres.write({ outputType: 'nodebuffer' });
  const zip = await JSZip.loadAsync(buf);
  const PPR = /<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g;
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async('string');
    const fixed = xml.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (m, inner) => {
      let first = true;
      const body = inner.replace(PPR, (pp) => (first && inner.trimStart().startsWith('<a:pPr') ? ((first = false), pp) : ''));
      return `<a:p>${body}</a:p>`;
    });
    zip.file(name, fixed);
  }
  fs.writeFileSync(OUT, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log(`\nGenerado: ${OUT}  (${H.state.n} diapositivas)`);
  if (H.state.warnings.length) {
    console.log(`\n⚠ ${H.state.warnings.length} avisos de ajuste/maquetación:`);
    H.state.warnings.forEach((w) => console.log('  - ' + w));
  } else console.log('Sin avisos de maquetación.');
})().catch((e) => { console.error(e); process.exit(1); });
