/* ============================================================
 * 学生端页面
 * ============================================================ */

function learnView() {
  const testedPoints = new Set(db.questions.filter(q => assignmentOfQuestion(q.id)).map(q => q.knowledgeId));
  const ownSubs = db.submissions.filter(s => s.studentId === 's1' && s.courseId === db.courseId);
  const mastered = new Set();
  ownSubs.forEach(sub => {
    Object.entries(sub.scores).forEach(([qid, score]) => {
      const q = Q(qid);
      if (q && q.type === 'single' && score === q.score) mastered.add(q.knowledgeId);
    });
  });

  const now = Date.now();
  const courses = studentCourses();
  const courseCards = courses.map(c => {
    const data = db.courses[c.courseId];
    const active = c.courseId === db.courseId;
    let pending = 0;
    let done = 0;
    data.assignments.forEach(a => {
      const sub = db.submissions.find(s => s.assignmentId === a.id && s.studentId === 's1');
      if (sub) done++;
      else if (!isExpired(a)) pending++;
    });
    (data.distributed || []).filter(d => d.classId === c.classId).forEach(d => {
      const sub = (db.exerciseSubmissions || []).find(s => s.distId === d.id && s.studentId === 's1');
      if (sub) done++;
      else if (d.dueAt > now) pending++;
    });
    return `
    <button class="course-card ${active ? 'active' : ''}" data-act="switch-student-course" data-id="${c.courseId}">
      <div class="course-card-top">
        <span class="badge ${active ? 'brand' : ''}">${active ? '当前课程' : '已加入'}</span>
        <span class="course-card-teacher">${esc(c.teacher)}</span>
      </div>
      <b>${esc(c.name)}</b>
      <span class="course-card-meta">${esc(c.className)}</span>
      <div class="course-card-stats">
        <span><b>${pending}</b> 待完成</span>
        <span><b>${done}</b> 已完成</span>
      </div>
    </button>`;
  }).join('');

  const tab = ui.learnTab === 'ppt' ? 'ppt' : (ui.learnTab === 'check' ? 'check' : 'map');
  const pointPages = coursewarePages();

  return `
  <div class="course-section">
    <div class="course-section-head">
      <div><h2>我的课程</h2><div class="sub">本班共开设 ${courses.length} 门课程 · 点击卡片切换当前学习课程</div></div>
      <button class="btn btn-sm btn-ghost" data-act="open-scan">＋ 加入班级</button>
    </div>
    <div class="course-grid">
      ${courseCards || '<div class="empty"><b>还没有加入班级</b>用班级号或扫码加入行政班，即可自动获得该班全部课程</div>'}
    </div>
  </div>

  ${courses.length > 1 ? `
  <div class="mm-course-bar">
    <span class="mm-course-label">切换课程导图</span>
    <div class="mm-course-tabs">
      ${courses.map(c => `<button class="mm-course-tab ${c.courseId === db.courseId ? 'active' : ''}" data-act="switch-student-course" data-id="${c.courseId}">${esc(c.name)}</button>`).join('')}
    </div>
  </div>` : ''}

  <div class="card">
    <div class="card-head">
      <div>
        <h2>${esc(db.course.name)} · ${tab === 'ppt' ? '课件 PPT' : (tab === 'check' ? '自我检测' : '知识导图')}</h2>
        <div class="sub">${tab === 'ppt'
          ? `${esc(db.courseware.fileName)} · 共 ${db.courseware.pages} 页 · 已标注 ${pointPages.length} 页知识点`
          : tab === 'check'
            ? '对照整门课的知识框架，逐个标记掌握情况，看清自己哪里还薄弱'
            : `课件来源：${esc(db.courseware.fileName)} · 教师已核对`}</div>
      </div>
      <div class="tabs learn-tabs">
        <button class="tab ${tab === 'map' ? 'active' : ''}" data-act="learn-tab" data-tab="map">知识导图</button>
        <button class="tab ${tab === 'check' ? 'active' : ''}" data-act="learn-tab" data-tab="check">自我检测</button>
        <button class="tab ${tab === 'ppt' ? 'active' : ''}" data-act="learn-tab" data-tab="ppt">课件 PPT</button>
      </div>
    </div>
    ${tab === 'map'
      ? `<div class="card-body" style="padding:0">${mindmapView()}</div>`
      : tab === 'check'
        ? selfCheckView()
        : coursewareView()}
  </div>

  <div class="notice" style="margin-top:16px">
    <span>${tab === 'ppt' ? '📽️' : (tab === 'check' ? '✅' : '🧭')}</span>
    <div>${tab === 'ppt'
      ? '课件按页码展示，右侧或下方可切换页面；从知识点详情点「查看课件第 X 页」可直接跳到对应页，方便对照原文。'
      : tab === 'check'
        ? '这是<b>你自己的掌握清单</b>：逐个知识点判断「已掌握 / 待复习」，标记只保存在本地，帮你看清复习重点。'
        : '点击「章节 → 小节 → 知识点」逐层展开，点击具体知识点可查看<b>公式、参数含义、示例与课件页码</b>。有疑问可以直接向老师提问。'}</div>
  </div>

  <div class="grid-3">
    <div class="metric"><div class="label">课程知识点</div><div class="value">${db.points.length}</div><div class="delta">共 ${db.mindMap.length} 个章节</div></div>
    <div class="metric"><div class="label">已配套练习</div><div class="value">${testedPoints.size}</div><div class="delta">其余知识点可自主阅读</div></div>
    <div class="metric"><div class="label">已掌握</div><div class="value">${mastered.size}<small>/ ${testedPoints.size}</small></div><div class="delta">客观题全部答对的知识点</div></div>
  </div>`;
}

/* ---------------- 学生 · 知识点自我检测 ---------------- */

/** 对照整门课的知识框架，学生逐个标记「已掌握 / 待复习」并查看进度 */
function selfCheckView() {
  const map = selfCheckOf(db.courseId);
  const filter = ui.selfCheckFilter || 'all';

  /* 展开知识框架：章节 → 小节 → 知识点（过滤掉空章节） */
  const chapters = (db.mindMap || []).map(ch => ({
    title: ch.title,
    sections: (ch.sections || []).map(sec => ({
      title: sec.title,
      points: (sec.points || []).map(P).filter(Boolean)
    })).filter(sec => sec.points.length)
  })).filter(ch => ch.sections.length);

  let total = 0, mastered = 0, review = 0;
  chapters.forEach(ch => ch.sections.forEach(sec => sec.points.forEach(p => {
    total++;
    if (map[p.id] === 'mastered') mastered++;
    else if (map[p.id] === 'review') review++;
  })));
  const unmarked = total - mastered - review;
  const pct = total ? Math.round(mastered * 100 / total) : 0;

  const passFilter = (p) => {
    const cur = map[p.id] || '';
    if (filter === 'mastered') return cur === 'mastered';
    if (filter === 'review') return cur === 'review';
    if (filter === 'unmarked') return !cur;
    return true;
  };

  const chip = (f, label, count) =>
    `<button class="chip-btn ${filter === f ? 'active' : ''}" data-act="self-check-filter" data-filter="${f}">${label} <b>${count}</b></button>`;

  const body = chapters.map(ch => {
    const chPts = ch.sections.reduce((arr, s) => arr.concat(s.points), []);
    const chTotal = chPts.length;
    const chMastered = chPts.filter(p => map[p.id] === 'mastered').length;
    const chPct = chTotal ? Math.round(chMastered * 100 / chTotal) : 0;

    const secHtml = ch.sections.map(sec => {
      const pts = sec.points.filter(passFilter);
      if (!pts.length) return '';
      const rows = pts.map(p => {
        const cur = map[p.id] || '';
        return `
        <div class="sc-row">
          <div class="sc-point">
            <span class="sc-dot ${cur || 'none'}"></span>
            <span class="sc-title">${esc(p.title)}</span>
            ${p.page ? `<span class="badge">教材 P${p.page}</span>` : ''}
          </div>
          <div class="sc-actions">
            <button class="sc-btn ${cur === 'mastered' ? 'on mastered' : ''}" data-act="self-check-set" data-point="${p.id}" data-status="mastered">已掌握</button>
            <button class="sc-btn ${cur === 'review' ? 'on review' : ''}" data-act="self-check-set" data-point="${p.id}" data-status="review">待复习</button>
            <button class="btn btn-sm btn-ghost" data-act="open-point" data-id="${p.id}">查看</button>
          </div>
        </div>`;
      }).join('');
      return `
      <div class="sc-section">
        <div class="sc-section-title">${esc(sec.title)}</div>
        ${rows}
      </div>`;
    }).filter(Boolean).join('');

    if (!secHtml) return '';
    return `
    <div class="sc-chapter">
      <div class="sc-chapter-head">
        <span class="sc-chapter-title">${esc(ch.title)}</span>
        <div class="sc-progress"><div class="sc-progress-bar" style="width:${chPct}%"></div></div>
        <span class="sc-chapter-meta">${chMastered}/${chTotal}</span>
      </div>
      ${secHtml}
    </div>`;
  }).filter(Boolean).join('');

  return `
  <div class="sc-wrap">
    <div class="sc-summary">
      <div class="sc-summary-main">
        <div class="sc-pct">${pct}<small>%</small></div>
        <div>
          <div class="sc-summary-title">自我检测进度</div>
          <div class="sub">${esc(db.course.name)} · 共 ${total} 个知识点</div>
        </div>
      </div>
      <div class="sc-stats">
        <span class="sc-stat"><i class="dot mastered"></i><b>${mastered}</b> 已掌握</span>
        <span class="sc-stat"><i class="dot review"></i><b>${review}</b> 待复习</span>
        <span class="sc-stat"><i class="dot none"></i><b>${unmarked}</b> 未标记</span>
      </div>
    </div>

    <div class="sc-toolbar">
      <div class="sc-filters">
        ${chip('all', '全部', total)}
        ${chip('mastered', '已掌握', mastered)}
        ${chip('review', '待复习', review)}
        ${chip('unmarked', '未标记', unmarked)}
      </div>
      <button class="btn btn-sm btn-ghost" data-act="self-check-reset">清空记录</button>
    </div>

    ${body || '<div class="empty">当前筛选下没有知识点</div>'}
  </div>`;
}

/* ---------------- 课件 PPT 预览 ---------------- */

/** 课件中有知识点标注的页码，按页码升序 */
function coursewarePages() {
  const map = {};
  db.points.forEach(point => {
    if (!point.page) return;
    (map[point.page] = map[point.page] || []).push(point);
  });
  return Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .map(page => ({ page, points: map[page] }));
}

/** 按章节/小节聚合有知识点标注的页码 */
function sectionsWithPages() {
  return db.mindMap.map(chapter => ({
    chapter,
    sections: chapter.sections.map(section => {
      const points = section.points.map(P).filter(Boolean).sort((a, b) => a.page - b.page);
      const pages = [...new Set(points.map(point => point.page))];
      return { section, points, pages };
    }).filter(item => item.points.length)
  })).filter(item => item.sections.length);
}

/** 单页幻灯片，学生端与教师预览共用 */
function pptSlideHtml(pageData, total) {
  const main = pageData.points[0];
  const more = pageData.points.slice(1);
  return `
  <div class="ppt-slide">
    <div class="ppt-slide-top">
      <span>${esc(db.course.name)} · ${esc(db.course.code)}</span>
      <span>第 ${pageData.page} 页 / 共 ${total} 页</span>
    </div>
    <h2>${esc(main.title)}</h2>
    <p class="ppt-summary">${esc(main.summary || '')}</p>
    ${main.formulas && main.formulas.length ? `
      <div class="ppt-formulas">${main.formulas.map(f => `<div>${esc(f)}</div>`).join('')}</div>` : ''}
    ${more.length ? `
      <div class="ppt-more">
        <div class="ppt-more-title">本页还包含</div>
        ${more.map(point => `<button class="chip-btn" data-act="open-point" data-id="${point.id}">${esc(point.title)}</button>`).join('')}
      </div>` : ''}
    <div class="ppt-slide-foot">
      <span>${esc(main.excerpt || '')}</span>
      <button class="btn btn-sm btn-ghost" data-act="open-point" data-id="${main.id}">在导图中查看 →</button>
    </div>
  </div>`;
}

function coursewareView() {
  const pages = coursewarePages();
  if (!pages.length) {
    return '<div class="card-body"><div class="empty"><b>暂无可查看的课件页</b>教师标注知识点后会显示在这里</div></div>';
  }
  const total = db.courseware.pages || pages[pages.length - 1].page;
  const current = pages.find(item => item.page === Number(ui.pptPage)) || pages[0];
  const index = pages.indexOf(current);
  const prev = pages[index - 1];
  const next = pages[index + 1];

  return `
  <div class="card-body ppt-layout">
    <div class="ppt-pages">
      <div class="ppt-pages-head">课件页 · 已标注 ${pages.length} 页</div>
      ${pages.map(item => `
        <button class="ppt-page-chip ${item.page === current.page ? 'active' : ''}" data-act="ppt-page" data-page="${item.page}">
          <b>${item.page}</b>
          <span>${esc(item.points[0].title)}</span>
        </button>`).join('')}
    </div>

    <div class="ppt-main">
      <div class="ppt-stage">${pptSlideHtml(current, total)}</div>
      <div class="ppt-nav">
        <button class="btn btn-sm" data-act="ppt-page" data-page="${prev ? prev.page : ''}" ${prev ? '' : 'disabled'}>← 上一页</button>
        <span class="ppt-nav-hint">当前第 ${current.page} 页 · 已标注页 ${index + 1}/${pages.length}</span>
        <button class="btn btn-sm" data-act="ppt-page" data-page="${next ? next.page : ''}" ${next ? '' : 'disabled'}>下一页 →</button>
      </div>
    </div>
  </div>`;
}

function aiChatView() {
  const mode = ui.aiHomeMode === 'question' ? 'question' : 'textbook';
  const tabs = `
  <div class="ai-mode-tabs">
    <button class="ai-mode-tab ${mode === 'textbook' ? 'active' : ''}" data-act="ai-home-mode" data-mode="textbook">📖 按教材问答</button>
    <button class="ai-mode-tab ${mode === 'question' ? 'active' : ''}" data-act="ai-home-mode" data-mode="question">✍️ 按作业题问答</button>
  </div>`;
  if (mode === 'question') return renderAiHomeQuestion(tabs);

  const history = ui.aiHomeChat || [];
  const suggestions = [
    ...db.points.slice(0, 2).map(p => `「${p.title}」怎么理解？`),
    '给我一道练习题'
  ];

  const pages = coursewarePages();
  const aiPage = aiCurrentPage();
  const pageTitles = {};
  pages.forEach(item => { pageTitles[item.page] = item.points[0].title; });
  const chapterGroups = sectionsWithPages();
  const flatSections = chapterGroups.flatMap(group => group.sections.map(item => ({ chapter: group.chapter, ...item })));
  const activeSection = flatSections.find(item => item.section.id === ui.aiSection)
    || flatSections.find(item => item.pages.includes(aiPage))
    || flatSections[0];
  const sectionPages = activeSection ? activeSection.pages : [];
  const activePage = sectionPages.includes(aiPage) ? aiPage : (sectionPages[0] || aiPage);

  const bubbles = history.map(msg => {
    if (msg.role === 'user') {
      return `<div class="chat-msg user"><div class="chat-bubble">${esc(msg.text)}</div></div>`;
    }
    const point = msg.pointId ? P(msg.pointId) : null;
    const page = msg.page || (point ? point.page : null);
    return `
    <div class="chat-msg bot">
      <span class="chat-avatar">AI</span>
      <div class="chat-bubble">
        ${esc(msg.text)}
        ${page ? `<button class="cite-chip" data-act="open-courseware" data-page="${page}">查看教材第 ${page} 页 →</button>` : ''}
        ${msg.grounded === false ? '<span class="badge warning">教材未覆盖</span>' : ''}
        ${msg.source ? `
          <div class="cite-source">
            <b>教材原文 · 第 ${msg.source.page} 页</b>
            <span>${esc(msg.source.section || '')}${msg.source.title ? ' · ' + esc(msg.source.title) : ''}</span>
            <p>${esc(msg.source.excerpt)}</p>
          </div>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="page-head">
    <div>
      <h1>AI 问答</h1>
      <p>回答严格依据教材第一章第四、五节（P13—24），每条回答附教材原文与页码，教材未覆盖会明确说明</p>
    </div>
    <span class="badge ai">课件依据</span>
  </div>
  ${tabs}

  ${flatSections.length ? `
  <div class="ai-context">
    <div class="ai-context-main">
      <span class="badge ai">关联教材</span>
      <div><b>${esc(activeSection.section.title)} · 第 ${activePage} 页</b><span>按章节、小节或页码选择，提问优先依据所选教材页</span></div>
    </div>
    <div class="ai-context-controls">
      <div class="ai-chapter-row">
        ${chapterGroups.map(group => `
          <button class="chip-btn ${activeSection.chapter.id === group.chapter.id ? 'active' : ''}"
            data-act="ai-chapter" data-id="${group.chapter.id}">${esc(group.chapter.title)}</button>`).join('')}
      </div>
      <div class="ai-section-tabs">
        ${flatSections.map(item => `
          <button class="chip-btn ${item.section.id === activeSection.section.id ? 'active' : ''}"
            data-act="ai-section" data-id="${item.section.id}">${esc(item.section.title)}</button>`).join('')}
      </div>
      <select class="input ai-context-select" id="ai-page-select">
        ${sectionPages.map(page => `<option value="${page}" ${page === activePage ? 'selected' : ''}>第 ${page} 页 · ${esc(pageTitles[page] || '')}</option>`).join('')}
      </select>
    </div>
  </div>` : ''}

  <div class="card chat-card">
    <div class="chat-body">
      ${history.length ? bubbles : `
      <div class="chat-welcome">
        <span class="chat-avatar big">AI</span>
        <b>我是这门课的 AI 助教</b>
        <p>我只依据教材第 13—24 页回答，每条结论都会附教材原文和页码；如果教材没有相关内容，我会直接说明，不凭空补充。你可以从当前关联的课件页开始提问。</p>
      </div>`}
    </div>
    <div class="chat-input">
      <input class="input" id="ai-home-input" placeholder="例如：洛必达法则什么时候不能用？" autocomplete="off">
      <button class="btn btn-primary" data-act="ai-home-send">发送</button>
    </div>
    <div class="chat-suggest">
      ${suggestions.map(text => `<button class="chip-btn" data-act="ai-suggest" data-text="${esc(text)}">${esc(text)}</button>`).join('')}
    </div>
  </div>

  <div class="privacy-note" style="margin-top:12px">
    <span>🔎</span>
    <div>你的提问会汇总到教师端「AI 提问」用作课堂讲评；不会在同学之间公开展示姓名。</div>
  </div>`;
}

/* AI 问答 · 按作业题问答模式 */
function renderAiHomeQuestion(tabs) {
  const questions = db.questions || [];
  const selId = ui.aiHomeQuestionId && Q(ui.aiHomeQuestionId) ? ui.aiHomeQuestionId : (questions[0]?.id || null);
  if (!ui.aiHomeQuestionId && selId) ui.aiHomeQuestionId = selId;
  const q = selId ? Q(selId) : null;
  const point = q ? P(q.knowledgeId) : null;
  const chats = q ? (ui.aiChats[q.id] || []) : [];
  const submitted = db.session.role === 'teacher' || !!mySubmission(assignmentOfQuestion(q?.id || '')?.id || '');

  const qOptions = questions.map(item => {
    const a = assignmentOfQuestion(item.id);
    const prefix = a ? a.title + ' · ' : '';
    const stem = (item.stem || '').replace(/\s+/g, ' ');
    const label = (prefix + stem).slice(0, 34);
    return `<option value="${item.id}" ${item.id === selId ? 'selected' : ''}>${esc(label)}${(prefix + stem).length > 34 ? '…' : ''}</option>`;
  }).join('');

  const bubbles = chats.map(c => {
    const text = esc(c.text).replace(/\n/g, '<br>');
    if (c.role === 'me') {
      return `<div class="chat-msg user"><div class="chat-bubble">${text}</div></div>`;
    }
    return `
    <div class="chat-msg bot">
      <span class="chat-avatar">AI</span>
      <div class="chat-bubble">
        ${text}
        ${point ? `<button class="cite-chip" data-act="open-courseware" data-page="${point.page}">查看教材第 ${point.page} 页 →</button>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="page-head">
    <div>
      <h1>AI 问答</h1>
      <p>选择一道作业题，AI 助教只依据本课程课件给提示与讲解；提交后可查看完整解析</p>
    </div>
    <span class="badge ai">作业题答疑</span>
  </div>
  ${tabs}

  ${q ? `
  <div class="ai-context">
    <div class="ai-context-main">
      <span class="badge ai">当前题目</span>
      <div><b>${esc(assignmentOfQuestion(q.id)?.title || '作业题')}</b><span>关联「${esc(point?.title || '')}」· 教材第 ${point?.page} 页</span></div>
    </div>
    <div class="ai-context-controls">
      <select class="input ai-context-select" id="ai-home-question-select">
        ${qOptions || '<option value="">（暂无题目）</option>'}
      </select>
    </div>
  </div>

  <div class="card q-stem-card">
    <div class="q-stem">${esc(q.stem)}</div>
    ${point ? `<div class="source-box" style="margin-top:10px"><b>📖 ${esc(db.courseware.fileName)} · 第 ${point.page} 页</b>${esc(point.excerpt || '')}</div>` : ''}
  </div>

  <div class="card chat-card">
    <div class="chat-q-actions">
      <button class="btn btn-sm" data-act="ai-home-hint" data-level="0">给我一点提示</button>
      <button class="btn btn-sm" data-act="ai-home-hint" data-level="1">再提示一步</button>
      <button class="btn btn-sm ${submitted ? '' : 'btn-ghost'}" data-act="ai-home-hint" data-level="2" ${submitted ? '' : 'disabled title="提交后可查看完整解析"'}>查看完整解析</button>
      <button class="btn btn-sm btn-ghost" data-act="open-point-from-tutor" data-id="${q.knowledgeId}">查看知识点</button>
    </div>
    <div class="divider"></div>
    <div class="chat-body">
      ${chats.length ? bubbles : `
      <div class="chat-welcome">
        <span class="chat-avatar big">AI</span>
        <b>针对这道题问答</b>
        <p>我只依据本课程课件作答。提交前只给思路提示，不直接给答案；可以点上方按钮要提示，或在下方描述你卡在哪一步。</p>
      </div>`}
    </div>
    <div class="chat-input">
      <input class="input" id="ai-home-tutor-input" placeholder="描述你卡在哪一步…" autocomplete="off">
      <button class="btn btn-primary" data-act="ai-home-tutor-send">发送</button>
    </div>
  </div>
  ` : `
  <div class="card"><div class="empty">当前课程暂无作业题</div></div>
  `}
  `;
}

function practiceView() {
  /* 学生端只保留「课堂问答」和「课后作业」，课后习题并入课后作业 */
  const mode = ui.practiceTab === 'quiz' ? 'quiz' : 'homework';
  const now = Date.now();
  const courses = studentCourses();

  /* 聚合学生已加入的所有课程 */
  const items = [];
  courses.forEach(c => {
    const data = db.courses[c.courseId];
    if (!data) return;
    data.assignments.filter(a => a.mode === mode).forEach(a => {
      const sub = db.submissions.find(s => s.assignmentId === a.id && s.studentId === 's1');
      const max = a.questionIds.reduce((sum, qid) => sum + ((data.questions.find(q => q.id === qid) || {}).score || 0), 0);
      items.push({
        kind: 'assignment', id: a.id, title: a.title, course: c, sub,
        expired: !sub && isExpired(a),
        meta: `${a.questionIds.length} 题 · ${max} 分${a.note ? ` · ${a.note}` : ''}`,
        dueAt: a.mode === 'homework' ? a.dueAt : null
      });
    });
    if (mode === 'homework') {
      (data.distributed || []).filter(d => d.classId === c.classId).forEach(d => {
        const sub = (db.exerciseSubmissions || []).find(s => s.distId === d.id && s.studentId === 's1');
        items.push({
          kind: 'exercise', id: d.id, title: d.title, course: c, sub,
          expired: !sub && d.dueAt <= now,
          meta: `${d.exerciseIds.length} 题 · ${esc(d.distributedAt)} 下发`,
          dueAt: d.dueAt
        });
      });
    }
  });

  const pending = items.filter(i => !i.sub && !i.expired);
  const expiredItems = items.filter(i => !i.sub && i.expired);
  const done = items.filter(i => !!i.sub);

  const pendingCard = item => `
  <div class="practice-item">
    <div class="practice-item-head">
      <span class="practice-course">${esc(item.course.name)}</span>
      <span class="badge warning">待完成</span>
    </div>
    <div class="practice-item-title">${esc(item.title)}</div>
    <div class="practice-item-meta">${item.meta}</div>
    ${item.dueAt ? `
      <div class="deadline">
        <span>⏰ 截止 ${formatDue(item.dueAt)}</span>
        <span>${remainingText({ dueAt: item.dueAt })}</span>
      </div>` : ''}
    <div class="practice-item-foot">
      <button class="btn btn-sm btn-primary" data-act="start-practice-item" data-kind="${item.kind}" data-id="${item.id}" data-course="${item.course.courseId}">开始作答</button>
      <span class="form-hint" style="margin:0">${esc(item.course.teacher)} · ${esc(item.course.className)}</span>
    </div>
  </div>`;

  const doneCard = item => {
    const active = ui.practiceItem && ui.practiceItem.kind === item.kind && ui.practiceItem.id === item.id;
    const badge = item.kind === 'exercise'
      ? '<span class="badge success">已提交</span>'
      : item.sub.status === 'reviewed'
        ? '<span class="badge success">教师已复核</span>'
        : item.sub.status === 'auto'
          ? '<span class="badge success">自动判分</span>'
          : '<span class="badge ai">AI 已批改</span>';
    return `
    <button class="practice-item is-done ${active ? 'active' : ''}" data-act="open-practice-item" data-kind="${item.kind}" data-id="${item.id}" data-course="${item.course.courseId}">
      <div class="practice-item-head">
        <span class="practice-course">${esc(item.course.name)}</span>
        ${badge}
      </div>
      <div class="practice-item-title">${esc(item.title)}</div>
      <div class="practice-item-meta">${item.meta}</div>
      <div class="practice-score-row">
        ${item.kind === 'assignment'
          ? `<span class="practice-score">${item.sub.total}<small>/${item.sub.max}</small></span>`
          : '<span class="practice-score">已提交<small>待批阅</small></span>'}
        <span class="practice-open">在右侧查看 →</span>
      </div>
    </button>`;
  };

  const expiredCard = item => `
  <div class="practice-item is-expired">
    <div class="practice-item-head">
      <span class="practice-course">${esc(item.course.name)}</span>
      <span class="badge danger">已截止</span>
    </div>
    <div class="practice-item-title">${esc(item.title)}</div>
    <div class="practice-item-meta">${item.meta}</div>
    <div class="practice-item-foot">
      <span class="btn btn-sm" style="opacity:.55;cursor:not-allowed">已截止，无法作答</span>
      <span class="form-hint" style="margin:0">${esc(item.course.teacher)} · ${esc(item.course.className)}</span>
    </div>
  </div>`;

  const listHtml = (pending.length || expiredItems.length || done.length)
    ? `
    <div class="practice-group">
      <div class="practice-group-head"><b>待完成</b><span class="badge warning">${pending.length}</span></div>
      ${pending.length ? pending.map(pendingCard).join('') : '<div class="practice-group-empty">待完成任务已清空</div>'}
      ${expiredItems.length ? `
        <div class="practice-group-head sub"><b>已截止</b><span class="badge danger">${expiredItems.length}</span></div>
        ${expiredItems.map(expiredCard).join('')}` : ''}
    </div>
    <div class="practice-group">
      <div class="practice-group-head"><b>已完成</b><span class="badge success">${done.length}</span><span class="practice-group-hint">写完的自动排到下面</span></div>
      ${done.length ? done.map(doneCard).join('') : '<div class="practice-group-empty">提交后作业会出现在这里，批改结果可在右侧查看</div>'}
    </div>`
    : '<div class="empty"><b>暂无任务</b>老师布置后会按课程聚合显示在这里</div>';

  return `
  <div style="max-width:460px;margin-bottom:16px">
    <div class="tabs">
      <button class="tab ${mode === 'quiz' ? 'active' : ''}" data-act="practice-tab" data-tab="quiz">课堂问答</button>
      <button class="tab ${mode === 'homework' ? 'active' : ''}" data-act="practice-tab" data-tab="homework">课后作业</button>
    </div>
  </div>
  <div class="practice-summary">
    <span class="badge warning">待完成 ${pending.length}</span>
    <span class="badge success">已完成 ${done.length}</span>
    ${expiredItems.length ? `<span class="badge danger">已截止 ${expiredItems.length}</span>` : ''}
    <span class="practice-summary-hint">共 ${items.length} 项 · 覆盖 ${courses.length} 门课程</span>
  </div>

  <div class="practice-board">
    <div class="practice-list">${listHtml}</div>
    ${practiceDetailPanel(done)}
  </div>

  ${mode === 'homework' ? `
  <div class="privacy-note" style="margin-top:12px">
    <span>📘</span>
    <div>作业统一展示，不区分来源；老师会根据教学进度，从教材例题、教材课后习题、AI 出题或自拟题中选择后发放。</div>
  </div>` : ''}`;
}

/* 右侧批改详情：不跳页查看已完成作业 */
function practiceDetailPanel(doneItems) {
  const placeholder = text => `<aside class="practice-detail"><div class="card"><div class="card-body">
    <div class="empty"><b>选择一份已完成的作业</b>${esc(text)}</div>
  </div></div></aside>`;

  if (!doneItems.length) {
    return placeholder('完成并提交作业后，点击左侧「已完成」的作业，批改详情会显示在这里');
  }
  const current = ui.practiceItem
    ? doneItems.find(i => i.kind === ui.practiceItem.kind && i.id === ui.practiceItem.id)
    : null;
  if (!current) {
    return placeholder('点击左侧「已完成」中的任意一项，即可在这里查看得分、标准答案与教师批改，无需跳转页面');
  }

  /* 详情所属课程与当前课程不同时，静默切换，保证题目与批改数据对应 */
  if (current.course.courseId !== db.courseId) {
    const cls = classOfCourseForStudent(current.course.courseId);
    if (cls) {
      useCourse(db, current.course.courseId);
      db.studentClassId = cls.id;
    }
  }

  let body;
  if (current.kind === 'assignment') {
    const assignment = A(current.id);
    const sub = mySubmission(current.id);
    body = assignment && sub ? resultView(assignment, sub) : '<div class="empty">批改结果不存在</div>';
  } else {
    const dist = distributedOf(current.id);
    const sub = myExerciseSubmission(current.id);
    body = dist && sub ? `
      ${dist.exerciseIds.map((eid, index) => {
        const ex = EX(eid);
        if (!ex) return '';
        return `
        <div class="review-card" style="background:var(--surface-2)">
          <div class="review-head"><b>Q${index + 1} · ${esc(ex.title)}</b><span class="badge">教材第 ${ex.page} 页</span></div>
          <div class="review-text">${esc(sub.answers[eid] || '未作答')}</div>
        </div>`;
      }).join('')}
      <div class="privacy-note" style="margin-top:12px">
        <span>⏳</span><div>已于 ${esc(sub.submittedAt)} 提交，等待老师批阅，批改后这里会同步更新。</div>
      </div>` : '<div class="empty">提交记录不存在</div>';
  }

  return `<aside class="practice-detail">
    <div class="card">
      <div class="card-head">
        <div><h2>${esc(current.title)}</h2><div class="sub">${esc(current.course.name)} · ${esc(current.course.teacher)} · ${esc(current.course.className)}</div></div>
        <span class="badge brand">批改详情</span>
      </div>
      <div class="card-body practice-detail-body">${body}</div>
    </div>
  </aside>`;
}

/* ---------------- 错题本 ---------------- */

function wrongBookView() {
  const courses = studentCourses();
  const courseId = currentWrongCourseId();
  const course = courses.find(c => c.courseId === courseId) || null;
  const wrongs = courseId ? studentWrongQuestions(courseId) : [];
  const selected = (ui.wrongSelected || []).filter(qid => wrongs.some(w => w.qid === qid));
  const clearedCount = wrongs.filter(w => redoCleared(courseId, w.qid)).length;
  const pointCount = new Set(wrongs.filter(w => w.point).map(w => w.point.id)).size;
  const pointFilter = ui.wrongPointFilter || '';
  const pointMap = {};
  wrongs.forEach(w => {
    if (w.point) pointMap[w.point.id] = (pointMap[w.point.id] || 0) + 1;
  });
  const pointOptions = Object.entries(pointMap).map(([id, count]) => ({ id, count, title: P(id)?.title || '未关联知识点' }));
  const filteredWrongs = pointFilter ? wrongs.filter(w => w.point && w.point.id === pointFilter) : wrongs;

  const answerText = (q, ans) => {
    if (ans === undefined || ans === null || ans === '') return '未作答';
    if (q.type === 'single') {
      const idx = Number(ans);
      return `${String.fromCharCode(65 + idx)} ${q.options[idx] || ''}`;
    }
    return String(ans);
  };

  const tabs = courses.map(c => `
    <button class="wrong-course ${c.courseId === courseId ? 'active' : ''}" data-act="wrong-course" data-id="${c.courseId}">
      ${esc(c.name)}<span>${wrongCountOfCourse(c.courseId)}</span>
    </button>`).join('');

  const items = filteredWrongs.map(w => {
    const isSel = selected.includes(w.qid);
    const cleared = redoCleared(courseId, w.qid);
    const right = w.question.type === 'single'
      ? `${String.fromCharCode(65 + w.question.answer)} ${w.question.options[w.question.answer]}`
      : (w.question.keywords || []).join('、') || '见课件原文';
    return `
    <div class="wrong-item ${isSel ? 'selected' : ''} ${cleared ? 'cleared' : ''}" data-act="toggle-wrong" data-id="${w.qid}">
      <span class="wrong-tick ${isSel ? 'on' : ''}">${isSel ? '✓' : ''}</span>
      <div class="wrong-item-main">
        <div class="wrong-item-title">${esc(w.question.stem)}</div>
        <div class="wrong-item-meta">
          <span class="badge">${esc(course ? course.name : '')}</span>
          <span>${esc(w.point ? w.point.title : '未关联知识点')}</span><span>·</span>
          <span>课件第 ${w.point ? w.point.page : '-'} 页</span><span>·</span>
          <span>得分 ${w.score} / ${w.max}</span>
        </div>
        <div class="wrong-answer-line">
          <span class="mine">我的答案：${esc(answerText(w.question, w.answer))}</span>
          <span class="right">正确答案：${esc(right)}</span>
        </div>
        <div class="wrong-diag">错因：${esc((w.question.diagnosis && w.question.diagnosis.reason) || '需要回到课件重新梳理该知识点。')}</div>
      </div>
      <div class="wrong-item-side">
        ${cleared ? '<span class="badge success">已订正</span>' : '<span class="badge warning">待订正</span>'}
        ${w.point ? `<button class="btn btn-sm btn-ghost" data-act="open-point" data-id="${w.point.id}">查看知识点</button>` : ''}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="card" style="margin-bottom:16px">
    <div class="card-head">
      <div><h2>错题本</h2><div class="sub">做错或失分的题目会自动收录，可勾选同一科目的错题重新做一遍</div></div>
      <span class="badge danger">${wrongs.length} 道待巩固</span>
    </div>
    <div class="card-body">
      <div class="wrong-course-tabs">${tabs || '<span class="form-hint">还没有加入课程</span>'}</div>
      ${wrongs.length ? `<div class="wrong-point-filter">
        <button class="chip-btn ${pointFilter ? '' : 'on'}" data-act="wrong-point-filter" data-id="">全部 ${wrongs.length}</button>
        ${pointOptions.map(opt => `<button class="chip-btn ${pointFilter === opt.id ? 'on' : ''}" data-act="wrong-point-filter" data-id="${opt.id}">${esc(opt.title)} · ${opt.count}</button>`).join('')}
      </div>` : ''}
      <div class="grid-3" style="margin-top:12px">
        <div class="metric"><div class="label">本课程错题</div><div class="value">${wrongs.length}</div><div class="delta">${esc(course ? course.name : '')}</div></div>
        <div class="metric"><div class="label">涉及知识点</div><div class="value">${pointCount}</div><div class="delta">按知识点聚合</div></div>
        <div class="metric"><div class="label">已订正</div><div class="value">${clearedCount}<small>/ ${wrongs.length}</small></div><div class="delta">重做拿满分后标记</div></div>
      </div>
      <div class="wrong-toolbar">
        <span>已选 <b>${selected.length}</b> 题</span>
        <div class="q-actions" style="margin:0">
          <button class="btn btn-sm btn-ghost" data-act="select-all-wrong">全选本课程</button>
          <button class="btn btn-sm btn-ghost" data-act="clear-wrong">清空</button>
          <button class="btn btn-sm btn-primary" data-act="start-redo" ${selected.length ? '' : 'disabled'}>开始重做所选错题</button>
        </div>
      </div>
    </div>
  </div>

  ${filteredWrongs.length ? `<div class="wrong-list">${items}</div>` : wrongs.length ? `
  <div class="empty">
    <b>该知识点暂无错题</b>
    <div class="q-actions" style="justify-content:center;margin-top:12px">
      <button class="btn btn-sm" data-act="wrong-point-filter" data-id="">显示全部错题</button>
    </div>
  </div>` : `
  <div class="empty">
    <b>本课程暂无错题</b>
    完成课后作业后，答错或失分的题目会自动收录；也可以先去看看知识导图。
    <div class="q-actions" style="justify-content:center;margin-top:12px">
      <a class="btn btn-sm" href="#/student/practice">去完成作业</a>
      <a class="btn btn-sm btn-ghost" href="#/student/learn">查看知识导图</a>
    </div>
  </div>`}

  <div class="privacy-note" style="margin-top:12px">
    <span>🧾</span>
    <div>错题按课程整理；勾选同一门课程的题目后点击「开始重做」，重做只用于订正巩固，不会覆盖原来的作业成绩。</div>
  </div>`;
}

function redoView() {
  const redo = ui.redo;
  const courses = studentCourses();
  const course = redo ? courses.find(c => c.courseId === redo.courseId) : null;
  if (!redo || !course || !db.courses[redo.courseId]) {
    return `<div class="empty"><b>没有进行中的错题重做</b>回到错题本勾选题目后开始重做
      <div class="q-actions" style="justify-content:center;margin-top:12px"><a class="btn btn-sm" href="#/student/wrong">返回错题本</a></div>
    </div>`;
  }
  const questions = redo.qids.map(id => Q(id)).filter(Boolean);

  const head = `
  <div class="page-head">
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <a class="btn btn-sm btn-ghost" href="#/student/wrong" data-act="exit-redo">← 返回错题本</a>
        <span class="badge ai">错题重做</span>
      </div>
      <h1>${esc(course.name)} · 错题重做</h1>
      <p>共 ${questions.length} 题 · 重做不会覆盖原成绩，答对后错题本会标记「已订正」</p>
    </div>
    ${redo.result ? '<span class="badge success">已提交</span>' : ''}
  </div>`;

  if (redo.result) {
    const percent = Math.round((redo.result.total / redo.result.max) * 100);
    const detail = questions.map((q, index) => {
      const item = redo.result.items.find(i => i.qid === q.id);
      const full = item && item.score >= item.max;
      return `
      <div class="q-card">
        <div class="q-head">
          <div>
            <div class="q-stem"><span class="q-no">Q${index + 1}</span> ${esc(q.stem)}</div>
            <div class="q-meta"><span>得分 ${item ? item.score : 0} / ${q.score}</span></div>
          </div>
          <span class="badge ${full ? 'success' : 'danger'}">${full ? '已订正' : '仍需巩固'}</span>
        </div>
        ${q.type === 'short' ? `<div class="review-card" style="background:var(--surface-2)"><div class="review-head"><b>我的重做答案</b></div><div class="review-text">${answerDisplayHtml(item ? item.answer : '')}</div></div>` : ''}
        ${answerAndStepsHtml(q)}
      </div>`;
    }).join('');

    return head + `
    <div class="result-hero">
      <div class="score-ring" style="--p:${percent}">
        <span><b>${redo.result.total}</b><small>/ ${redo.result.max}</small></span>
      </div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:600;margin-bottom:4px">错题重做完成</div>
        <div class="review-text">答对 ${redo.result.items.filter(i => i.score >= i.max).length} / ${redo.result.items.length} 题。答对的错题会标记为「已订正」，不覆盖原来的作业成绩。</div>
      </div>
      <div class="q-actions" style="margin:0">
        <a class="btn btn-sm btn-primary" href="#/student/wrong" data-act="exit-redo">返回错题本</a>
        <a class="btn btn-sm btn-ghost" href="#/student/learn">回到知识导图</a>
      </div>
    </div>
    <div style="margin-top:16px">${detail}</div>`;
  }

  const answeredCount = questions.filter(q => {
    const value = redo.answers[q.id];
    return value !== undefined && value !== null && value !== '';
  }).length;

  const cards = questions.map((q, index) => {
    const value = redo.answers[q.id];
    return `
    <div class="q-card" id="q-${q.id}">
      <div class="q-head">
        <div>
          <div class="q-stem"><span class="q-no">Q${index + 1}</span> ${esc(q.stem)}</div>
          <div class="q-meta"><span>${q.type === 'single' ? '单选题' : '简答题'}</span><span>·</span><span>${q.score} 分</span><span>·</span><span>${esc(P(q.knowledgeId)?.title || '')}</span></div>
        </div>
      </div>
      ${q.type === 'single'
        ? q.options.map((opt, i) => `
          <div class="option ${value === i ? 'selected' : ''}" data-act="redo-option" data-id="${q.id}" data-index="${i}">
            <span class="key">${String.fromCharCode(65 + i)}</span>
            <span>${esc(opt)}</span>
          </div>`).join('')
        : `<textarea class="textarea" data-act="redo-short" data-id="${q.id}" placeholder="重新写下你的答案与步骤…">${esc(value || '')}</textarea>
          ${answerImageBarHtml('redo', q.id, redo.answers[q.id])}`}
    </div>`;
  }).join('');

  return head + `
  <div class="practice-layout">
    <div>${cards}</div>
    <div class="card practice-side">
      <div class="card-head"><h2>重做进度</h2><span class="badge">${answeredCount} / ${questions.length}</span></div>
      <div class="card-body">
        <div class="privacy-note"><span>📌</span><div>重做只用于订正与巩固，不会修改原来的作业成绩。</div></div>
        <button class="btn btn-primary btn-block" style="margin-top:14px" data-act="submit-redo">提交重做</button>
        <button class="btn btn-ghost btn-block" style="margin-top:8px" data-act="exit-redo">退出重做</button>
      </div>
    </div>
  </div>`;
}

/* 照片作答上传条（作答阶段专用）：缩略图可删除/预览，label 触发相机或文件选择 */
function answerImageBarHtml(kind, qid, value) {
  const u = unwrapAnswer(value);
  const thumbs = u.images.map((src, i) => `
    <span class="ans-thumb-wrap">
      <img class="ans-thumb" src="${src}" alt="作答图片" data-act="preview-image" data-src="${src}">
      <button class="ans-thumb-del" data-act="remove-answer-image" data-kind="${kind}" data-id="${qid}" data-idx="${i}" title="删除">×</button>
    </span>`).join('');
  const canAdd = u.images.length < MAX_ANSWER_IMAGES;
  return `<div class="ans-img-bar">
    ${thumbs}
    <label class="ans-img-add ${canAdd ? '' : 'disabled'}" title="${canAdd ? '拍照或从相册选择（移动端可直接调用相机）' : `最多 ${MAX_ANSWER_IMAGES} 张`}">
      <input type="file" accept="image/*" capture="environment" multiple data-act="answer-file" data-kind="${kind}" data-id="${qid}" ${canAdd ? '' : 'disabled'}>
      📷 拍照 / 上传图片
    </label>
    <span class="form-hint">可上传手写过程照片 · 文字与照片任选其一即可提交 · 最多 ${MAX_ANSWER_IMAGES} 张</span>
  </div>`;
}

function exercisePlayerView(distId) {
  const dist = distributedOf(distId);
  if (!dist) return '<div class="empty">课后习题不存在</div>';
  const sub = myExerciseSubmission(distId);
  if (!ui.exerciseDraft) ui.exerciseDraft = {};

  const head = `
    <div class="page-head">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a class="btn btn-sm btn-ghost" href="#/student/practice">← 返回</a>
          <span class="badge ai">课后作业</span>
        </div>
        <h1>${esc(dist.title)}</h1>
        <p>${dist.exerciseIds.length} 题 · 截止 ${formatDue(dist.dueAt)}</p>
      </div>
      ${sub ? '<span class="badge success">已提交</span>' : ''}
    </div>`;

  const items = dist.exerciseIds.map((id, index) => {
    const exercise = EX(id);
    if (!exercise) return '';
    return `
    <div class="q-card">
      <div class="q-head">
        <div>
          <div class="q-stem"><span class="q-no">Q${index + 1}</span> ${esc(exercise.stem)}</div>
          <div class="q-meta"><span>${esc(exercise.difficulty)}</span><span>·</span><span>教材第 ${exercise.page} 页</span></div>
        </div>
      </div>
      ${sub
        ? `<div class="review-card" style="background:var(--surface-2)">
             <div class="review-head"><b>我的作答</b></div>
             <div class="review-text">${answerDisplayHtml(sub.answers[id])}</div>
           </div>`
        : `<textarea class="textarea" data-act="ex-short-input" data-id="${id}" placeholder="写出核心公式、符号含义与适用条件…" style="min-height:96px">${esc((ui.exerciseDraft[id] || {}).text || '')}</textarea>
          ${answerImageBarHtml('exercise', id, ui.exerciseDraft[id])}`}
    </div>`;
  }).join('');

  if (sub) {
    return head + items + `
    <div class="privacy-note" style="margin-top:12px">
      <span>✅</span>
      <div>已于 ${esc(sub.submittedAt)} 提交，等待老师批阅。习题不附教材例题与参考解析，请保持独立完成。</div>
    </div>`;
  }

  return head + items + `
  <div class="q-actions">
    <button class="btn btn-primary" data-act="submit-exercise" data-id="${dist.id}">提交习题</button>
  </div>`;
}

function playerView(assignmentId) {
  const assignment = A(assignmentId);
  if (!assignment) return '<div class="empty">任务不存在</div>';
  const sub = mySubmission(assignmentId);

  const head = `
    <div class="page-head">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a class="btn btn-sm btn-ghost" href="#/student/practice">← 返回</a>
          <span class="badge ${assignment.mode === 'quiz' ? 'brand' : 'ai'}">${assignment.mode === 'quiz' ? '课堂问答' : '课后作业'}</span>
        </div>
        <h1>${esc(assignment.title)}</h1>
        <p>${assignment.questionIds.length} 题 · 满分 ${totalScore(assignment.questionIds)} 分 · ${esc(assignment.note || '')}</p>
      </div>
      ${sub ? `<span class="badge ${sub.status === 'reviewed' || sub.status === 'auto' ? 'success' : 'ai'}">${sub.status === 'reviewed' ? '教师已复核' : sub.status === 'auto' ? '已完成 · 自动判分' : '已完成 · AI 初评'}</span>` : ''}
    </div>`;

  if (sub) return head + resultView(assignment, sub);

  if (isExpired(assignment)) {
    return head + `
    <div class="empty">
      <b>本次作业已截止</b>
      截止时间为 ${formatDue(assignment.dueAt)}，已无法再提交。可以先复习知识点，等待教师重新开放。
      <div class="q-actions" style="justify-content:center;margin-top:12px">
        <a class="btn btn-sm" href="#/student/practice">返回任务列表</a>
        <a class="btn btn-sm btn-ghost" href="#/student/learn">去看知识导图</a>
      </div>
    </div>`;
  }

  const questionsHtml = assignment.questionIds.map((qid, index) => {
    const q = Q(qid);
    const value = ui.draft[qid];
    return `
    <div class="q-card" id="q-${qid}">
      <div class="q-head">
        <div>
          <div class="q-stem"><span class="q-no">Q${index + 1}</span> ${esc(q.stem)}</div>
          <div class="q-meta">
            <span>${q.type === 'single' ? '单选题' : '简答题'}</span><span>·</span>
            <span>${q.score} 分</span><span>·</span>
            <span>${esc(P(q.knowledgeId)?.title || '')}</span>
          </div>
        </div>
      </div>
      ${q.type === 'single'
        ? q.options.map((opt, i) => `
          <div class="option ${value === i ? 'selected' : ''}" data-act="select-option" data-id="${q.id}" data-index="${i}">
            <span class="key">${String.fromCharCode(65 + i)}</span>
            <span>${esc(opt)}</span>
          </div>`).join('')
        : `<textarea class="textarea" data-act="short-input" data-id="${q.id}" placeholder="写下你的理解和计算步骤…">${esc(value || '')}</textarea>
          ${answerImageBarHtml('draft', q.id, ui.draft[q.id])}`}
      <div class="q-actions">
        <button class="btn btn-sm btn-ai" data-act="open-tutor" data-id="${q.id}">🤖 问 AI 助教</button>
        <span class="form-hint" style="margin:0;align-self:center">提交前 AI 只给提示，不直接给答案</span>
      </div>
    </div>`;
  }).join('');

  const navDots = assignment.questionIds.map((qid, index) => `
    <div class="ans-dot ${answered(qid) ? 'done' : ''}" data-act="jump" data-id="${qid}">${index + 1}</div>`).join('');

  const answeredCount = assignment.questionIds.filter(answered).length;

  return `
  ${head}
  <div class="practice-layout">
    <div>${questionsHtml}</div>
    <div class="card practice-side">
      <div class="card-head"><h2>答题卡</h2><span class="badge">${answeredCount} / ${assignment.questionIds.length}</span></div>
      <div class="card-body">
        <div class="answer-card">${navDots}</div>
        <div class="divider"></div>
        <div class="privacy-note">
          <span>📌</span>
          <div>提交后客观题立即判分，简答题由 AI 按评分要点给出建议分数，教师确认后为最终成绩。</div>
        </div>
        <button class="btn btn-primary btn-block" style="margin-top:14px" data-act="submit-assignment" data-id="${assignment.id}">提交作业</button>
      </div>
    </div>
  </div>`;
}

function answered(qid) {
  return answerHasContent(ui.draft[qid]);
}

function resultView(assignment, sub) {
  const percent = Math.round((sub.total / sub.max) * 100);
  const questionsHtml = assignment.questionIds.map((qid, index) => {
    const q = Q(qid);
    const score = sub.scores[qid] || 0;
    const correct = score === q.score;
    const wrong = q.type === 'single' && !correct;
    const review = sub.aiReviews?.[qid];
    const teacherReview = sub.teacherReview && q.type === 'short' ? sub.teacherReview : null;

    return `
    <div class="q-card">
      <div class="q-head">
        <div>
          <div class="q-stem"><span class="q-no">Q${index + 1}</span> ${esc(q.stem)}</div>
          <div class="q-meta"><span>${q.type === 'single' ? '单选题' : '简答题'}</span><span>·</span><span>得分 ${score} / ${q.score}</span></div>
        </div>
        <span class="badge ${correct ? 'success' : score > 0 ? 'warning' : 'danger'}">${correct ? '正确' : score > 0 ? '部分得分' : '需订正'}</span>
      </div>

      ${q.type === 'single' ? q.options.map((opt, i) => {
        let cls = '';
        if (i === q.answer) cls = 'correct';
        else if (i === sub.answers[qid]) cls = 'wrong';
        return `<div class="option ${cls}"><span class="key">${String.fromCharCode(65 + i)}</span><span>${esc(opt)}</span></div>`;
      }).join('') : `
        <div class="review-card" style="background:var(--surface-2)">
          <div class="review-head"><b>我的答案</b></div>
          <div class="review-text">${answerDisplayHtml(sub.answers[qid])}</div>
        </div>`}

      ${answerAndStepsHtml(q)}

      ${review ? `
        <div class="review-card ai">
          <div class="review-head"><b>🤖 AI 初评</b><span class="badge ai">${review.score} 分</span></div>
          <div class="review-text">${esc(review.comment).replace(/\n/g, '<br>')}</div>
          <button class="btn btn-sm btn-ghost" style="margin-top:8px" data-act="open-point" data-id="${q.knowledgeId}">📖 查看课件第 ${P(q.knowledgeId)?.page} 页原文</button>
        </div>` : ''}

      ${teacherReview ? `
        <div class="review-card teacher">
          <div class="review-head"><b>✅ 教师复核</b><span class="badge success">${teacherReview.score} 分</span></div>
          <div class="review-text">${esc(teacherReview.comment)}</div>
        </div>` : (q.type === 'short' ? `
        <div class="review-card">
          <div class="review-head"><b>等待教师复核</b><span class="badge warning">待确认</span></div>
          <div class="review-text">AI 评分仅供参考，教师确认后成绩为最终结果。</div>
        </div>` : '')}

      ${wrong || (q.type === 'short' && score < q.score * 0.6) ? diagnosisHtml(q) : ''}

      <div class="q-actions">
        <button class="btn btn-sm btn-ai" data-act="open-tutor" data-id="${q.id}">🤖 继续追问 AI</button>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="result-hero">
    <div class="score-ring" style="--p:${percent}">
      <span><b>${sub.total}</b><small>/ ${sub.max}</small></span>
    </div>
    <div style="flex:1">
      <div style="font-size:15px;font-weight:600;margin-bottom:4px">本次任务已完成</div>
      <div class="review-text">客观题已即时判分。${sub.status === 'reviewed' ? '教师已完成复核，成绩为最终结果。' : sub.status === 'auto' ? '本任务全部为客观题，无需教师复核。' : '简答题由 AI 给出建议分数，教师复核后成绩会更新。'}</div>
    </div>
    <div style="text-align:right">
      <div class="badge ${sub.status === 'reviewed' || sub.status === 'auto' ? 'success' : 'ai'}">${sub.status === 'reviewed' ? '教师已复核' : sub.status === 'auto' ? '自动判分' : 'AI 初评待复核'}</div>
      <div class="form-hint">提交于 ${esc(sub.submittedAt)}</div>
    </div>
  </div>

  <div style="margin-top:16px">${questionsHtml}</div>

  <div class="card" style="margin-top:16px">
    <div class="card-head"><h2>这次作业说明了什么</h2><span class="badge ai">AI 诊断</span></div>
    <div class="card-body">
      <div class="review-text">
        本次共 ${assignment.questionIds.length} 题，答对 ${assignment.questionIds.filter(qid => sub.scores[qid] === Q(qid).score).length} 题。
        建议优先复习${weakestPointTitle(sub)}；错题已自动收录到错题本，建议在 24 小时内重做一次。
      </div>
      <div class="q-actions">
        <a class="btn btn-sm btn-primary" href="#/student/wrong">去错题本重做</a>
        <a class="btn btn-sm" href="#/student/learn">回到知识导图</a>
        <a class="btn btn-sm" href="#/student/messages">把问题匿名分享给全班</a>
      </div>
    </div>
  </div>`;
}

function answerAndStepsHtml(q) {
  const point = P(q.knowledgeId);
  const solution = mockAi.solutionSteps(q);
  const letter = String.fromCharCode(65 + q.answer);
  const standard = q.type === 'single'
    ? `<div class="std-answer"><span class="std-key">${letter}</span><span>${esc(q.options[q.answer])}</span></div>`
    : `<div class="std-answer"><span class="std-key">要点</span><span>${esc((q.keywords || []).join('、'))}</span></div>`;

  return `
  <div class="review-card">
    <div class="review-head"><b>✅ 标准答案</b><span class="badge outline">课件第 ${point.page} 页</span></div>
    <div class="review-text">${standard}</div>
  </div>
  <div class="review-card ai">
    <div class="review-head"><b>🧭 AI 讲题步骤</b><span class="badge ai">${solution.steps.length} 步</span></div>
    <ol class="step-list">
      ${solution.steps.map(step => `<li>${esc(step)}</li>`).join('')}
    </ol>
    <div class="form-hint">${esc(solution.cite)}</div>
  </div>`;
}

function weakestPointTitle(sub) {
  let worst = null;
  Object.entries(sub.scores).forEach(([qid, score]) => {
    const q = Q(qid);
    if (!q) return;
    const rate = score / q.score;
    if (!worst || rate < worst.rate) worst = { rate, title: P(q.knowledgeId)?.title || '' };
  });
  return worst ? `「${worst.title}」` : '基础知识点';
}

function diagnosisHtml(q) {
  const d = mockAi.diagnose(q);
  return `
  <div class="diagnosis">
    <h4>🔍 错题诊断 · ${esc(d.pointTitle)}</h4>
    <div class="diag-row"><b>课件原文：</b>${esc(d.excerpt || '')}（第 ${d.page} 页）</div>
    <div class="diag-row"><b>错因：</b>${esc(d.reason)}</div>
    <div class="diag-row"><b>复习建议：</b>${esc(d.advice)}</div>
    <div class="diag-row"><b>相似练习：</b>${esc(d.similar)}</div>
    <div class="q-actions">
      <button class="btn btn-sm" data-act="open-point" data-id="${q.knowledgeId}">查看对应知识点（第 ${d.page} 页）</button>
    </div>
  </div>`;
}

function messagesView() {
  const courseMessages = db.messages.filter(m => m.courseId === db.courseId && m.classId === db.studentClassId);
  const myMessages = courseMessages.filter(m => m.authorId === 's1');
  const publicMessages = courseMessages.filter(m => m.visibility === 'public');
  const questionOptions = db.questions.map((q, i) =>
    `<option value="${q.id}">Q${i + 1} · ${esc(q.stem.slice(0, 22))}…</option>`).join('');
  const courseTeachers = teachersOfCourse(db.courseId);
  const teacherOptions = courseTeachers.map((t, i) =>
    `<option value="${t.id}">${esc(t.name)}${i === 0 ? '（主讲）' : ''}</option>`).join('');

  const myHtml = myMessages.map(m => messageCard(m, false)).join('');
  const publicHtml = publicMessages.map(m => messageCard(m, true)).join('');

  return `
  <div class="notice">
    <span>🔒</span>
    <div><b>匿名说明：</b>勾选「匿名公开」后，问题会出现在课程问答广场，其他同学只能看到「匿名同学」；不勾选则只有你和任课老师可见。可在下方选择请教哪位老师，该课程的任课老师都能看到并回答。</div>
  </div>

  <div class="grid-2" style="grid-template-columns:1fr 1fr;align-items:start">
    <div class="card">
      <div class="card-head"><h2>向任课老师提问</h2><span class="badge brand">私信</span></div>
      <div class="card-body">
        <div class="field">
          <label>请教哪位老师</label>
          <select class="select" id="msg-teacher">
            ${teacherOptions || '<option value="">（暂无老师）</option>'}
          </select>
        </div>
        <div class="field">
          <label>问题内容</label>
          <textarea class="textarea" id="msg-body" placeholder="例如：老师，MSE 里为什么一定要平方，取绝对值不行吗？">${esc(ui.prefillMessage || '')}</textarea>
        </div>
        <div class="field">
          <label>关联题目（选填）</label>
          <select class="select" id="msg-question">
            <option value="">不关联题目</option>
            ${questionOptions}
          </select>
        </div>
        <label class="check" style="margin-bottom:14px">
          <input type="checkbox" id="msg-anon">
          <span>匿名公开到课程问答广场<br><span class="form-hint" style="margin:0">公开后全班可见问题与老师回答，但不显示你的姓名、头像和学号</span></span>
        </label>
        <button class="btn btn-primary btn-block" data-act="send-message">发送问题</button>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>我的提问</h2><span class="badge">${myMessages.length} 条</span></div>
      <div class="card-body">
        ${myHtml ? `<div class="msg-list">${myHtml}</div>` : '<div class="empty"><b>还没有提问</b>左侧输入问题即可发送给老师</div>'}
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head">
      <div><h2>课程问答广场</h2><div class="sub">本课程同学匿名公开的问题，老师回答后全班可见</div></div>
      <span class="badge ai">${publicMessages.length} 个问题</span>
    </div>
    <div class="card-body">
      ${publicHtml ? `<div class="msg-list">${publicHtml}</div>` : '<div class="empty"><b>暂无公开问答</b>你可以把典型问题匿名分享到这里</div>'}
    </div>
  </div>`;
}

function messageCard(m, asPublic) {
  const pending = !m.answer;
  const author = asPublic ? '匿名同学' : (m.authorName === '李同学' ? '我' : m.authorName);
  const teacherName = m.answeredBy || m.addressedToName || db.course.teacher;
  return `
  <div class="msg">
    <div class="msg-head">
      <span class="avatar ${asPublic ? 'anon' : ''}">${asPublic ? '匿' : esc(author.slice(0, 1))}</span>
      <span class="msg-author">${esc(author)}</span>
      ${asPublic ? '<span class="badge">匿名公开</span>' : `<span class="badge ${m.anonymous ? 'ai' : 'brand'}">${m.anonymous ? '已匿名公开' : '仅双方可见'}</span>`}
      ${m.addressedToName ? `<span class="badge">请教 ${esc(m.addressedToName)}</span>` : ''}
      <span class="badge ${pending ? 'warning' : 'success'}">${pending ? '待回答' : '老师已回答'}</span>
      <span class="msg-time">${esc(m.createdAt)}</span>
    </div>
    <div class="msg-body">${esc(m.body)}</div>
    ${m.questionId ? `<div class="msg-link">关联题目 · Q${db.questions.findIndex(q => q.id === m.questionId) + 1}</div>` : ''}
    ${m.answer
      ? `<div class="answer"><b>${esc(teacherName)}的回答</b>${esc(m.answer)}</div>`
      : '<div class="answer pending"><b>等待老师回答</b>老师回复后这里会同步显示</div>'}
  </div>`;
}
