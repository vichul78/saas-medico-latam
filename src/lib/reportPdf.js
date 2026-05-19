/**
 * reportPdf.js — generador de PDF clínico profesional.
 *
 * Usa jsPDF + jspdf-autotable para producir documentos con formato médico.
 * El PDF incluye:
 *   • Encabezado: logo texto + datos de la org + fecha/hora
 *   • Bloque de paciente (si está disponible en el contexto)
 *   • Cuerpo del reporte (secciones con texto enriquecido)
 *   • Pie de página: compliance HIPAA/LGPD + número de página
 *
 * Paleta del documento:
 *   • Color principal: Púrpura Eléctrico rgb(122,34,255)
 *   • Secundario:      Violeta        rgb(91,39,181)
 *   • Textos cuerpo:   Gris oscuro    rgb(28,28,41)
 *   • CERO verde en ningún elemento del PDF.
 *
 * Exporta:
 *   generateReportPdf(reportData)  → descarga el PDF
 *   getReportHtml(reportData)      → string HTML para preview
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/* ── Constantes de paleta ── */
const C = {
  electric: [122, 34,  255],  // #7A22FF
  violet:   [91,  39,  181],  // #5B27B5
  dark:     [28,  28,  41 ],  // #1C1C29
  mid:      [74,  74,  94 ],  // #4A4A5E
  light:    [244, 244, 248],  // #F4F4F8
  white:    [255, 255, 255],
};

/**
 * @typedef {object} ReportData
 * @property {string}   title       — Título del reporte
 * @property {string}   [patientName]
 * @property {string}   [patientId]
 * @property {string}   [dob]
 * @property {string}   [modality]  — CT | MR | DX | US…
 * @property {string}   [studyDate]
 * @property {string}   [accessionNumber]
 * @property {string}   [doctorName]
 * @property {string}   body        — Texto del cuerpo (puede incluir \n y **)
 * @property {string}   [orgName]   — Nombre de la organización
 * @property {string}   [currency]  — Moneda de la org (solo informativo)
 */

/**
 * Genera y descarga un PDF con el reporte clínico.
 * @param {ReportData} data
 */
export function generateReportPdf(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();   // 210
  const H   = doc.internal.pageSize.getHeight();  // 297
  const now = new Date();

  /* ─────────────────────────────────────────
     1. ENCABEZADO
  ───────────────────────────────────────── */
  // Banda de color superior
  doc.setFillColor(...C.electric);
  doc.rect(0, 0, W, 22, 'F');

  // Logotipo texto
  doc.setTextColor(...C.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MediCo LatAm', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Plataforma clínica regional', 14, 19);

  // Org + fecha en la derecha
  doc.setFontSize(8);
  const orgLine = data.orgName ? `Org: ${data.orgName}` : 'MediCo LatAm';
  const dateLine = `Emisión: ${now.toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' })} ${now.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' })}`;
  doc.text(orgLine,  W - 14, 13, { align: 'right' });
  doc.text(dateLine, W - 14, 19, { align: 'right' });

  /* ─────────────────────────────────────────
     2. LÍNEA VIOLETA DECORATIVA
  ───────────────────────────────────────── */
  doc.setDrawColor(...C.violet);
  doc.setLineWidth(0.8);
  doc.line(0, 22.8, W, 22.8);

  /* ─────────────────────────────────────────
     3. TÍTULO DEL REPORTE
  ───────────────────────────────────────── */
  let y = 32;
  doc.setTextColor(...C.electric);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(data.title || 'Reporte Clínico', 14, y);
  y += 8;

  /* ─────────────────────────────────────────
     4. DATOS DEL ESTUDIO Y PACIENTE
  ───────────────────────────────────────── */
  const infoRows = [
    data.patientName      && ['Paciente',     data.patientName],
    data.patientId        && ['ID / N° Doc.', data.patientId],
    data.dob              && ['F. Nacimiento', data.dob],
    data.modality         && ['Modalidad',    data.modality],
    data.studyDate        && ['Fecha estudio', data.studyDate],
    data.accessionNumber  && ['Accesión',     data.accessionNumber],
    data.doctorName       && ['Médico',       data.doctorName],
  ].filter(Boolean);

  if (infoRows.length) {
    doc.autoTable({
      startY:    y,
      margin:    { left: 14, right: 14 },
      head:      [],
      body:      infoRows,
      styles:    { fontSize: 9, cellPadding: 2.5, textColor: C.dark },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: C.violet, cellWidth: 42 },
        1: { textColor: C.dark },
      },
      theme: 'plain',
      tableLineColor: C.light,
      tableLineWidth: 0.2,
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  /* ─────────────────────────────────────────
     5. SEPARADOR
  ───────────────────────────────────────── */
  doc.setDrawColor(...C.light);
  doc.setLineWidth(0.4);
  doc.line(14, y, W - 14, y);
  y += 6;

  /* ─────────────────────────────────────────
     6. CUERPO DEL REPORTE (con secciones)
  ───────────────────────────────────────── */
  const bodyText = data.body || '';
  const sections = parseSections(bodyText);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  for (const section of sections) {
    if (section.isHeading) {
      // Encabezado de sección
      doc.setFillColor(...C.light);
      doc.rect(14, y - 2, W - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C.violet);
      doc.text(section.text.toUpperCase(), 16, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 10;
    } else {
      // Párrafo normal
      doc.setTextColor(...C.dark);
      const lines = doc.splitTextToSize(cleanMarkdown(section.text), W - 28);
      lines.forEach(line => {
        if (y > H - 25) {
          doc.addPage();
          _addFooter(doc, W, H);
          y = 20;
        }
        doc.text(line, 14, y);
        y += 5.5;
      });
      y += 2;
    }

    if (y > H - 25) {
      doc.addPage();
      _addFooter(doc, W, H);
      y = 20;
    }
  }

  /* ─────────────────────────────────────────
     7. FIRMA
  ───────────────────────────────────────── */
  y += 8;
  if (y > H - 40) { doc.addPage(); _addFooter(doc, W, H); y = 20; }

  doc.setDrawColor(...C.mid);
  doc.setLineWidth(0.3);
  doc.line(14, y, 90, y);
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...C.mid);
  doc.text(data.doctorName ? `Dr/a. ${data.doctorName}` : 'Médico responsable', 14, y);
  doc.text(`Fecha: ${now.toLocaleDateString('es')}`, 14, y + 5);

  // Nota IA
  y += 14;
  doc.setFontSize(7.5);
  doc.setTextColor(...C.mid);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'NOTA: Este documento fue asistido por Iris IA (MediCo LatAm). Requiere revisión y firma del médico responsable.';
  const dLines = doc.splitTextToSize(disclaimer, W - 28);
  doc.text(dLines, 14, y);

  /* ─────────────────────────────────────────
     8. PIE DE PÁGINA (primera página)
  ───────────────────────────────────────── */
  _addFooter(doc, W, H);

  /* ─────────────────────────────────────────
     9. DESCARGA
  ───────────────────────────────────────── */
  const filename = `reporte_${(data.patientName ?? 'clinico').replace(/\s+/g, '_').toLowerCase()}_${now.toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
}

/* ── Pie de página ── */
function _addFooter(doc, W, H) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.mid);
  doc.text('MediCo LatAm · Plataforma clínica regional', 14, H - 8);
  doc.text('HIPAA · LGPD · LFPDPPP', W / 2, H - 8, { align: 'center' });
  doc.text(`Pág. ${doc.internal.getNumberOfPages()}`, W - 14, H - 8, { align: 'right' });

  // Línea superior del pie
  doc.setDrawColor(91, 39, 181);
  doc.setLineWidth(0.3);
  doc.line(0, H - 12, W, H - 12);
}

/* ── Parsea el texto en secciones (detecta líneas que sean encabezados) ── */
function parseSections(text) {
  if (!text) return [];
  return text.split('\n').map(line => {
    const trimmed = line.trim();
    // Detecta encabezados: líneas en MAYÚSCULAS o con patrón "## Texto"
    const isHeading = /^(#{1,3}\s+.+|[A-ZÁÉÍÓÚ\s]{8,}:?)$/.test(trimmed) && trimmed.length < 60;
    return { text: trimmed.replace(/^#+\s+/, ''), isHeading };
  }).filter(s => s.text.length > 0);
}

/* ── Elimina markdown básico para texto plano en PDF ── */
function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **negrita** → negrita
    .replace(/\*(.+?)\*/g, '$1')        // *cursiva* → cursiva
    .replace(/`(.+?)`/g, '$1')          // `código` → código
    .trim();
}

/**
 * Genera el HTML del reporte para preview en-pantalla (pestaña nueva).
 * Igual que el PDF pero como string HTML.
 * @param {ReportData} data
 * @returns {string}
 */
export function getReportHtml(data) {
  const now = new Date();
  const infoRows = [
    data.patientName      && `<tr><th>Paciente</th><td>${esc(data.patientName)}</td></tr>`,
    data.patientId        && `<tr><th>ID / N° Doc.</th><td>${esc(data.patientId)}</td></tr>`,
    data.dob              && `<tr><th>F. Nacimiento</th><td>${esc(data.dob)}</td></tr>`,
    data.modality         && `<tr><th>Modalidad</th><td>${esc(data.modality)}</td></tr>`,
    data.studyDate        && `<tr><th>Fecha estudio</th><td>${esc(data.studyDate)}</td></tr>`,
    data.accessionNumber  && `<tr><th>Accesión</th><td>${esc(data.accessionNumber)}</td></tr>`,
    data.doctorName       && `<tr><th>Médico</th><td>${esc(data.doctorName)}</td></tr>`,
  ].filter(Boolean).join('');

  const bodyHtml = (data.body || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(data.title || 'Reporte Clínico')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1C1C29; background: #FAFAFE; }
  .header { background: linear-gradient(135deg,#7A22FF,#5B27B5); color:#fff; padding:20px 32px; }
  .header h1 { font-size:22px; font-weight:700; }
  .header p  { font-size:11px; opacity:.8; margin-top:2px; }
  .header-meta { font-size:10px; opacity:.7; margin-top:4px; }
  .accent-bar { height:3px; background:linear-gradient(90deg,#7A22FF,#5B27B5); }
  .content { max-width:760px; margin:0 auto; padding:28px 32px; }
  h2 { font-size:18px; color:#7A22FF; margin-bottom:12px; }
  table.info { width:100%; border-collapse:collapse; margin-bottom:20px; }
  table.info th { text-align:left; font-size:11px; color:#5B27B5; font-weight:600; width:140px; padding:5px 8px; border-bottom:1px solid #E7E7EE; }
  table.info td { font-size:11px; padding:5px 8px; border-bottom:1px solid #E7E7EE; }
  .body-text { font-size:13px; line-height:1.75; color:#2F2F40; white-space:pre-wrap; }
  .signature { margin-top:32px; border-top:1px solid #9A9AAE; padding-top:12px; font-size:11px; color:#6B6B82; }
  .disclaimer { margin-top:16px; font-size:10px; color:#9A9AAE; font-style:italic; }
  .footer { background:#0F0F18; color:#9A9AAE; font-size:10px; padding:12px 32px; text-align:center; margin-top:40px; }
  @media print { .footer { position:fixed; bottom:0; width:100%; } }
</style>
</head>
<body>
<div class="header">
  <h1>MediCo LatAm · ${esc(data.title || 'Reporte Clínico')}</h1>
  <p>${esc(data.orgName || 'Plataforma clínica regional')}</p>
  <p class="header-meta">Emisión: ${now.toLocaleString('es')}</p>
</div>
<div class="accent-bar"></div>
<div class="content">
  <h2>${esc(data.title || 'Reporte Clínico')}</h2>
  ${infoRows ? `<table class="info">${infoRows}</table>` : ''}
  <div class="body-text">${bodyHtml}</div>
  <div class="signature">
    <p>${data.doctorName ? `Dr/a. ${esc(data.doctorName)}` : 'Médico responsable'}</p>
    <p>Fecha: ${now.toLocaleDateString('es')}</p>
  </div>
  <p class="disclaimer">
    NOTA: Este documento fue asistido por Iris IA (MediCo LatAm).
    Requiere revisión y firma del médico responsable.
  </p>
</div>
<div class="footer">MediCo LatAm &nbsp;|&nbsp; HIPAA · LGPD · LFPDPPP</div>
</body>
</html>`;
}

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
