/* ============================================================
 * 错题练习卷导出 PDF
 * 纯前端、零依赖：Canvas 按 A4 排版 → JPEG → 手写 PDF 封装。
 * 适用于单文件离线版（dist），也避免引入 jsPDF 等第三方库。
 * ============================================================ */

const PDF_SHEET = { w: 794, h: 1123, margin: 56, scale: 2 }; // 96dpi 版式，2 倍渲染
const PDF_A4 = { w: 595.28, h: 841.89 };                     // PDF 页面尺寸（pt）

function pdfFont(size, weight) {
  return `${weight || 'normal'} ${size}px "Microsoft YaHei","PingFang SC","Noto Sans CJK SC","Hiragino Sans GB",sans-serif`;
}

/** 按像素宽度逐字折行（中文友好） */
function pdfWrapLines(ctx, text, maxWidth) {
  const chars = String(text == null ? '' : text);
  const lines = [];
  let line = '';
  for (const ch of chars) {
    if (ch === '\n') { lines.push(line); line = ''; continue; }
    const next = line + ch;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  lines.push(line);
  return lines;
}

function pdfCreateSheet() {
  const canvas = document.createElement('canvas');
  canvas.width = PDF_SHEET.w * PDF_SHEET.scale;
  canvas.height = PDF_SHEET.h * PDF_SHEET.scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(PDF_SHEET.scale, PDF_SHEET.scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PDF_SHEET.w, PDF_SHEET.h);
  ctx.textBaseline = 'top';
  return { canvas, ctx, y: PDF_SHEET.margin };
}

function pdfDateStamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

/** Canvas 排版试卷；返回每页 canvas 数组 */
function buildWrongSheets(course, wrongs) {
  const pages = [];
  let sheet = pdfCreateSheet();
  pages.push(sheet);

  const contentW = PDF_SHEET.w - PDF_SHEET.margin * 2;

  const ensure = need => {
    if (sheet.y + need > PDF_SHEET.h - PDF_SHEET.margin) {
      sheet = pdfCreateSheet();
      pages.push(sheet);
    }
  };

  /** 写一段（可自动折行）文本 */
  const draw = (text, opts) => {
    const o = opts || {};
    const size = o.size || 14;
    const weight = o.weight || 'normal';
    const indent = o.indent || 0;
    const lineH = Math.round(size * (o.lineH || 1.55));
    const ctx = sheet.ctx;
    ctx.font = pdfFont(size, weight);
    const lines = pdfWrapLines(ctx, text, contentW - indent);
    lines.forEach(line => {
      ensure(lineH);
      const c = sheet.ctx;
      c.font = pdfFont(size, weight);
      c.fillStyle = o.color || '#111827';
      c.fillText(line, PDF_SHEET.margin + indent, sheet.y);
      sheet.y += lineH;
    });
  };

  /** 作答横线 */
  const answerLines = n => {
    for (let i = 0; i < n; i++) {
      ensure(26);
      const c = sheet.ctx;
      c.strokeStyle = '#e5e7eb';
      c.lineWidth = 1;
      c.setLineDash([4, 4]);
      c.beginPath();
      c.moveTo(PDF_SHEET.margin + 14, sheet.y + 20);
      c.lineTo(PDF_SHEET.w - PDF_SHEET.margin, sheet.y + 20);
      c.stroke();
      c.setLineDash([]);
      sheet.y += 26;
    }
  };

  /* ---------- 卷头 ---------- */
  draw(`错题练习卷 · ${course ? course.name : '课程'}`, { size: 22, weight: '700' });
  draw(`共 ${wrongs.length} 题 · 生成于 ${pdfDateStamp()} · 知课 AI`, { size: 10.5, color: '#6b7280' });
  sheet.y += 6;

  const hc = sheet.ctx;
  hc.font = pdfFont(12);
  hc.fillStyle = '#374151';
  hc.fillText('姓名：________________', PDF_SHEET.margin, sheet.y);
  hc.fillText('学号：________________', PDF_SHEET.margin + 300, sheet.y);
  sheet.y += 24;

  hc.strokeStyle = '#d1d5db';
  hc.lineWidth = 1;
  hc.beginPath();
  hc.moveTo(PDF_SHEET.margin, sheet.y);
  hc.lineTo(PDF_SHEET.w - PDF_SHEET.margin, sheet.y);
  hc.stroke();
  sheet.y += 20;

  /* ---------- 题目 ---------- */
  wrongs.forEach((w, index) => {
    const q = w.question || {};
    ensure(110);
    draw(`${index + 1}. ${q.stem || ''}`, { size: 15, weight: '600' });
    const meta = [
      q.type === 'single' ? '单选题' : '简答题',
      `${q.score || 0} 分`,
      w.point ? `${w.point.title} · 课件第 ${w.point.page} 页` : ''
    ].filter(Boolean).join(' · ');
    draw(meta, { size: 10.5, color: '#6b7280' });
    sheet.y += 2;

    if (q.type === 'single') {
      (q.options || []).forEach((opt, oi) => {
        draw(`${String.fromCharCode(65 + oi)}. ${opt}`, { size: 13, indent: 14 });
      });
      answerLines(2);
    } else {
      answerLines(5);
    }
    sheet.y += 16;
  });

  /* ---------- 答案页 ---------- */
  sheet = pdfCreateSheet();
  pages.push(sheet);
  draw('参考答案与解析', { size: 20, weight: '700' });
  draw('（完成练习后对照检查；本页可单独撕下）', { size: 10.5, color: '#6b7280' });
  sheet.y += 10;

  wrongs.forEach((w, index) => {
    const q = w.question || {};
    ensure(56);
    let answer;
    if (q.type === 'single') {
      answer = `${String.fromCharCode(65 + q.answer)}. ${(q.options || [])[q.answer] || ''}`;
    } else {
      answer = q.reference || (q.keywords || []).join('、') || '见课件原文';
    }
    draw(`${index + 1}. 答案：${answer}`, { size: 13, weight: '600' });
    const reason = q.diagnosis && q.diagnosis.reason;
    if (reason) draw(`错因提醒：${reason}`, { size: 10.5, color: '#6b7280', indent: 14 });
    sheet.y += 8;
  });

  return pages;
}

/** canvas → JPEG 字节（去掉 dataURL 头） */
function canvasToJpegBytes(canvas) {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const bin = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, width: canvas.width, height: canvas.height };
}

/**
 * 最小 PDF 封装：每页一张整页 JPEG（DCTDecode）。
 * @param {Array<{bytes:Uint8Array,width:number,height:number}>} images
 */
function buildPdfFromJpegs(images, pageW, pageH) {
  const parts = [];
  let offset = 0;
  const enc = new TextEncoder();
  const pushText = s => { const b = enc.encode(s); parts.push(b); offset += b.length; };
  const pushBytes = b => { parts.push(b); offset += b.length; };
  const offsets = {};
  const beginObj = n => { offsets[n] = offset; pushText(`${n} 0 obj\n`); };
  const endObj = () => pushText('endobj\n');

  pushText('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const pageIds = images.map((_, i) => 3 + i * 3);
  beginObj(1); pushText('<< /Type /Catalog /Pages 2 0 R >>\n'); endObj();
  beginObj(2); pushText(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${images.length} >>\n`); endObj();

  images.forEach((img, i) => {
    const pageId = 3 + i * 3;
    const contentId = 4 + i * 3;
    const imgId = 5 + i * 3;
    const content = `q ${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm /Im0 Do Q`;

    beginObj(pageId);
    pushText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>\n`);
    endObj();

    beginObj(contentId);
    pushText(`<< /Length ${content.length} >>\nstream\n${content}\nendstream\n`);
    endObj();

    beginObj(imgId);
    pushText(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`);
    pushBytes(img.bytes);
    pushText('\nendstream\n');
    endObj();
  });

  const maxId = 2 + images.length * 3;
  const xrefStart = offset;
  pushText(`xref\n0 ${maxId + 1}\n`);
  pushText('0000000000 65535 f \n');
  for (let n = 1; n <= maxId; n++) {
    pushText(`${String(offsets[n] || 0).padStart(10, '0')} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(parts, { type: 'application/pdf' });
}

function downloadBlobFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1500);
}

/** 错题本：勾选错题 → 一键导出 PDF 练习卷 */
async function exportWrongPdf() {
  const courseId = currentWrongCourseId();
  const wrongs = studentWrongQuestions(courseId);
  const selected = (ui.wrongSelected || []).filter(qid => wrongs.some(w => w.qid === qid));
  if (!selected.length) {
    toast('请先勾选要导出的错题');
    return;
  }
  const picked = selected.map(qid => wrongs.find(w => w.qid === qid)).filter(Boolean);
  const course = studentCourses().find(c => c.courseId === courseId);

  toast(`正在生成 PDF（${picked.length} 题）…`);
  await new Promise(r => setTimeout(r, 30));

  try {
    const canvases = buildWrongSheets(course, picked);
    const images = [];
    for (const sheet of canvases) {
      images.push(canvasToJpegBytes(sheet.canvas));
      await new Promise(r => setTimeout(r, 0));
    }
    const blob = buildPdfFromJpegs(images, PDF_A4.w, PDF_A4.h);
    const name = `错题练习卷-${course ? course.name : '课程'}-${pdfDateStamp()}.pdf`;
    downloadBlobFile(blob, name);
    toast(`已导出 ${picked.length} 道错题的 PDF 练习卷`);
  } catch (e) {
    toast('PDF 生成失败，请重试');
  }
}
