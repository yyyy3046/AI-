/* ============================================================
 * 幻灯片原图浏览：静态课件图集注册表
 * 不写入 localStorage，因此即便本地是旧演示数据也能看到新课件。
 * dir  ：幻灯片图片相对站点根的目录（开发/多文件版）
 * count：总页数
 * file ：下载用的原始 PPT 文件名（放在站点根目录）
 * 单文件版（dist）会注入 window.__SD_INLINE 以 data URI 内联图片，
 * 此时 slideImgSrc 优先使用内联数据，保证离线可独立打开。
 * ============================================================ */

const SLIDE_DECKS = {
  math: {
    title: '高等数学 · 知识地图',
    sub: '十章梳理 · 全课程知识脉络总览',
    dir: 'slides/gaoshu-map',
    count: 16,
    file: '高等数学-知识地图.pptx'
  },
  physics: {
    title: '静电场 · 课堂展示',
    sub: '大学物理 · 第六章 · 课堂讲解',
    dir: 'slides/jingdianchang',
    count: 20,
    file: '静电场-课堂展示.pptx'
  }
};

/** 当前（或指定）课程是否配有幻灯片原图 */
function slideDeckOf(courseId) {
  const id = courseId || (typeof db !== 'undefined' && db ? db.courseId : null);
  return id && SLIDE_DECKS[id] ? SLIDE_DECKS[id] : null;
}

/** 取某一页图片地址；单文件版内联时优先用 data URI */
function slideImgSrc(deck, page) {
  const n = Math.max(1, Math.min(deck.count, Number(page) || 1));
  const inline = (typeof window !== 'undefined' && window.__SD_INLINE) ? window.__SD_INLINE : null;
  if (inline && inline[deck.dir] && inline[deck.dir][n - 1]) return inline[deck.dir][n - 1];
  if (deck.images && deck.images[n - 1]) return deck.images[n - 1];
  return `${deck.dir}/slide_${String(n).padStart(2, '0')}.png`;
}

/* 键盘控制：← → 翻页、Esc 关闭、空格下一页 */
document.addEventListener('keydown', e => {
  if (typeof ui === 'undefined' || !ui || !ui.slideDeck) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const deck = SLIDE_DECKS[ui.slideDeck.id];
  if (!deck) return;
  if (e.key === 'Escape') {
    ui.slideDeck = null;
    render();
  } else if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    ui.slideDeck.page = Math.min(deck.count, (ui.slideDeck.page || 1) + 1);
    render();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    ui.slideDeck.page = Math.max(1, (ui.slideDeck.page || 1) - 1);
    render();
  } else if (e.key === 'Home') {
    ui.slideDeck.page = 1; render();
  } else if (e.key === 'End') {
    ui.slideDeck.page = deck.count; render();
  }
});
