/* ============================================================
 * 公共视图：登录、应用骨架、思维导图、抽屉、弹窗
 * ============================================================ */

function loginView() {
  const steps = [
    ['上传课件', '教师上传 PPT，解析章节结构'],
    ['生成导图与题目', '知识点可点击，标注页码'],
    ['课堂作答', '实时正答率，课后看讲解'],
    ['批改与学情', 'AI 初评，教师一键复核']
  ];

  return `
  <div class="landing">
    <header class="landing-top">
      <div class="landing-brand">
        <div class="logo-mark">知</div>
        <div><b>知课 AI</b><span>基于课件的教 · 学 · 练 · 评一体化平台</span></div>
      </div>
      <div class="landing-top-right">
        <span class="landing-pill">AI + 教育</span>
        <span class="landing-tag">「创熠」AI 聚变黑客松</span>
      </div>
    </header>

    <main class="landing-hero">
      <section class="hero-copy">
        <span class="hero-eyebrow">课件即课堂 · 全流程 AI 助教</span>
        <h1>把一份课件变成<br><em>教、学、练、评</em>的完整闭环</h1>
        <p class="hero-sub">上传课件，自动生成可点击的知识导图与课堂题目；学生作答、AI 批改、教师复核，每一步都能追溯到课件原文页码。</p>

        <div class="hero-flow">
          ${steps.map(([title, desc], i) => `
            <div class="hero-step">
              <i>${i + 1}</i>
              <b>${esc(title)}</b>
              <span>${esc(desc)}</span>
            </div>`).join('')}
        </div>

        <div class="hero-points">
          <div><b>可溯源</b><span>导图、答案均标课件页码</span></div>
          <div><b>双端协同</b><span>教师复核 · 学生自学</span></div>
        </div>

        <div class="hero-courses">
          <span>高等数学</span><span>大学物理</span>
        </div>
      </section>

      <aside class="hero-login">
        <div class="login-panel">
          <div class="login-panel-head">
            <b>登录工作台</b>
            <span>教师与学生使用同一入口，登录后直接进入本人课程</span>
          </div>
          <form id="login-form">
            <div class="field">
              <label for="login-user">账号</label>
              <input class="input" id="login-user" name="username" placeholder="请输入账号" autocomplete="username">
            </div>
            <div class="field">
              <label for="login-pass">密码</label>
              <input class="input" id="login-pass" name="password" type="password" placeholder="请输入密码" autocomplete="current-password">
            </div>
            <div class="login-error" id="login-error"></div>
            <button class="btn btn-primary btn-block" type="submit">登录</button>
          </form>
          <div class="login-accounts">
            <span>演示账号请参阅路演讲义 · 登录后仅可见本人课程与班级数据</span>
          </div>
        </div>
        <p class="login-foot">登录后只显示本人课程与班级的数据<br>AI 内容均标注课件来源页码，可回溯课本原文</p>
      </aside>
    </main>

    <footer class="landing-foot">知课 AI · 数据保存在本机浏览器</footer>
  </div>`;
}

function joinView() {
  return `
  <div class="join-wrap">
    <div class="card join-card">
      <div class="card-head">
        <div><h2>加入班级</h2><div class="sub">输入行政班班级号或扫码，入班后自动获得该班开设的全部课程</div></div>
      </div>
      <div class="card-body">
        <form id="join-form">
          <div class="field">
            <label for="join-code">班级号</label>
            <input class="input" id="join-code" placeholder="例如 AI-2401" autocomplete="off">
          </div>
          <button class="btn btn-primary btn-block" type="submit">加入班级</button>
        </form>
        <div class="form-hint">示例班级号：AI-2401 · AI-2402 · EI-2401</div>
        <div class="divider"></div>
        <button class="btn btn-block scan-open-btn" data-act="open-scan">📷 扫一扫加入班级</button>
        <div class="form-hint" style="text-align:center">扫描老师投屏或群里的班级二维码，自动进入对应班级</div>
        <div class="privacy-note" style="margin-top:12px">
          <span>📷</span>
          <div>摄像头画面仅在本机用于识别二维码，不会上传或保存；也可以继续使用上面的班级号手动加入。</div>
        </div>
      </div>
    </div>
  </div>`;
}

function scanModal() {
  if (!ui.scanOpen) return '';
  return `
  <div class="modal scan-modal">
    <div class="card-head">
      <div><h2>扫一扫加入班级</h2><div class="sub">对准老师提供的班级二维码</div></div>
      <button class="close-btn" data-act="close-scan">×</button>
    </div>
    <div class="modal-body">
      <div class="scan-stage">
        <video id="scan-video" class="scan-video" autoplay playsinline muted></video>
        <div class="scan-frame"><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="scan-hint" id="scan-hint">正在打开摄像头…</div>
      <ul class="scan-tips">
        <li>保持二维码完整入框，约 1 秒即可识别</li>
        <li>识别成功后会加入对应行政班，并自动进入该班的第一门课程</li>
      </ul>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" data-act="close-scan">取消</button>
      <button class="btn" data-act="scan-manual">改用班级号</button>
    </div>
  </div>`;
}

const NAV_TEACHER = [
  { key: 'studio', icon: '📚', label: '课件工坊' },
  { key: 'live', icon: '📡', label: '课上问答' },
  { key: 'review', icon: '📝', label: '批改复核' },
  { key: 'exam', icon: '🗂', label: '试卷批注' },
  { key: 'textbook', icon: '📖', label: '例题习题' },
  { key: 'classes', icon: '🏫', label: '班级管理' },
  { key: 'qa', icon: '💬', label: '私信与广场' },
  { key: 'analytics', icon: '📊', label: '学情看板' }
];

const NAV_STUDENT = [
  { key: 'practice', icon: '✍️', label: '课堂与作业' },
  { key: 'practice-self', icon: '🎯', label: '自主练习' },
  { key: 'learn', icon: '🧭', label: '知识导图' },
  { key: 'wrong', icon: '🧾', label: '错题本' },
  { key: 'ai', icon: '🤖', label: 'AI 问答' },
  { key: 'messages', icon: '💬', label: '私信与问答' }
];

const TITLES = {
  'teacher/studio': ['课件工坊', '上传课件，生成知识导图与课堂题目'],
  'teacher/live': ['课上问答', '课堂题目实时正答率与选项分布'],
  'teacher/review': ['批改复核', '复核 AI 评分，发布最终成绩'],
  'teacher/exam': ['试卷批注', '上传整套试卷，AI 逐题批注并核对分数'],
  'teacher/textbook': ['教材例题与习题', '下发课后习题，教材例题仅在教师端展示'],
  'teacher/classes': ['班级管理', '创建行政班，同一门课可开设到多个班级'],
  'student/join': ['加入班级', '输入行政班班级号或扫码，入班后自动获得该班全部课程'],
  'student/exercise': ['课后习题', '完成老师下发的习题，页面不展示教材例题'],
  'teacher/qa': ['私信与广场', '处理学生私信与匿名公开问题'],
  'teacher/analytics': ['学情看板', '班级提交、正确率与知识点掌握情况'],
  'student/learn': ['知识导图', '点击章节与知识点，查看公式与课件来源'],
  'student/practice': ['课堂与作业', '完成课堂问答与课后作业'],
  'student/practice-self': ['自主练习', '从真题库抽题或让 AI 现场出题，即时判分并记录练习历史'],
  'student/wrong': ['错题本', '按科目汇总错题，勾选后可重新做一遍'],
  'student/ai': ['AI 问答', '基于课件的 AI 答疑，提问会汇总给老师讲评'],
  'student/messages': ['私信与问答', '向老师提问，或匿名分享给全班']
};

/* 幻灯片原图浏览模态层（学生/教师共用），图集见 js/slide-decks.js */
function slideDeckModal() {
  if (!ui || !ui.slideDeck) return '';
  const deck = SLIDE_DECKS[ui.slideDeck.id];
  if (!deck) return '';
  const total = deck.count;
  const page = Math.max(1, Math.min(total, Number(ui.slideDeck.page) || 1));
  const thumbs = [];
  for (let n = 1; n <= total; n++) {
    thumbs.push(`<button class="sd-thumb ${n === page ? 'active' : ''}" data-act="slide-deck-page" data-page="${n}" title="第 ${n} 页">
      <img src="${esc(slideImgSrc(deck, n))}" alt="第 ${n} 页" loading="lazy"><span>${n}</span>
    </button>`);
  }
  return `
  <div class="modal-mask sd-mask" data-act="close-slide-deck">
    <div class="sd-modal" onclick="event.stopPropagation()">
      <div class="sd-head">
        <div class="sd-title">
          <h3>${esc(deck.title)}</h3>
          <div class="sub">${esc(deck.sub || '')} · 共 ${total} 页</div>
        </div>
        <div class="sd-actions">
          <a class="btn btn-sm" href="${esc(deck.file)}" download>⬇ 下载 PPT</a>
          <button class="btn btn-sm" data-act="slide-deck-fullscreen">⛶ 全屏</button>
          <button class="close-btn" data-act="close-slide-deck" aria-label="关闭">×</button>
        </div>
      </div>
      <div class="sd-stage" id="sd-stage">
        <img class="sd-slide" src="${esc(slideImgSrc(deck, page))}" alt="第 ${page} 页">
        <button class="sd-nav prev" data-act="slide-deck-prev" aria-label="上一页">‹</button>
        <button class="sd-nav next" data-act="slide-deck-next" aria-label="下一页">›</button>
        <div class="sd-counter"><b>${page}</b> / ${total}</div>
      </div>
      <div class="sd-thumbs">${thumbs.join('')}</div>
      <div class="sd-hint">← → 翻页 · 点击缩略图跳转 · 空格下一页 · Esc 关闭</div>
    </div>
  </div>`;
}

function shellView(pageKey, content) {
  const isTeacher = db.session.role === 'teacher';
  const nav = isTeacher ? NAV_TEACHER : NAV_STUDENT;
  const base = isTeacher ? 'teacher' : 'student';
  const current = pageKey.split('/')[1];
  const [title, desc] = TITLES[pageKey] || ['知课 AI', ''];
  const studentJoined = isTeacher ? [] : studentCourses();
  const activeClass = isTeacher ? currentClass() : myClass();
  const classLine = activeClass
    ? `${isTeacher ? '' : (activeClass.major ? `${esc(activeClass.major)} · ` : '')}${esc(activeClass.name)}`
    : esc(db.course.className);

  const navHtml = nav.map(item => `
    <a class="nav-item ${current === item.key ? 'active' : ''}" href="#/${base}/${item.key}">
      <span class="ic">${item.icon}</span><span>${item.label}</span>
    </a>`).join('');

  const mobileNav = nav.map(item => `
    <a class="${current === item.key ? 'active' : ''}" href="#/${base}/${item.key}">
      <span class="ic">${item.icon}</span><span>${item.label}</span>
    </a>`).join('');

  return `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo-mark">知</div>
        <div><b>知课 AI</b><span>${esc(db.course.name)}</span></div>
      </div>
      <nav class="nav">
        <div class="nav-label">${isTeacher ? '教师工作台' : '我的学习'}</div>
        ${navHtml}
      </nav>
      <div class="sidebar-foot">
        <b>AI 生成 · 内容对齐课件</b><br>
        ${isTeacher ? esc(currentTeacher().name) + ' · ' : ''}${classLine} · ${activeClass ? activeClass.studentCount : db.course.studentCount} 人
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <span class="crumb">${isTeacher ? '教师端' : '学生端'} / <b>${esc(title)}</b></span>
          ${isTeacher
            ? (coursesOfTeacher().length > 1
              ? `<select class="class-select course-select" id="course-switch" title="切换课程">
                  ${coursesOfTeacher().map(c => `<option value="${c.id}" ${c.id === db.courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
                </select>`
              : `<span class="course-fixed" title="当前课程">${esc(db.course.name)}</span>`)
            : (studentJoined.length > 1
              ? `<select class="class-select course-select" id="student-course-switch" title="切换课程">
                  ${studentJoined.map(c => `<option value="${c.courseId}" ${c.courseId === db.courseId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
                </select>`
              : `<span class="course-fixed" title="当前课程">${esc(db.course.name)}</span>`)}
          ${isTeacher
            ? `<select class="class-select" id="class-switch" title="切换班级">
                ${classesOfCourse().map(c => `<option value="${c.id}" ${c.id === teacherClassId() ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
              </select>`
            : (myClass() ? `<span class="class-chip">${esc(myClass().name)}</span><button class="btn btn-sm btn-ghost" data-act="open-scan">扫码入班</button>` : '')}
        </div>
        <div class="topbar-right">
          <span class="role-chip ${isTeacher ? '' : 'student'}">
            <i>${isTeacher ? '师' : '学'}</i>${isTeacher ? esc(currentTeacher().name) : '李同学'}
          </span>
          <button class="btn btn-sm btn-ghost llm-entry" data-act="open-llm-settings" title="配置 AI 大模型">
            <span class="llm-dot ${llmReady() ? 'on' : ''}"></span>模型
          </button>
          <button class="btn btn-sm btn-ghost" data-act="logout">退出登录</button>
          <button class="btn btn-sm btn-ghost" data-act="reset-demo">重置数据</button>
        </div>
      </header>

      <div class="content">
        <div class="page-head">
          <div>
            <h1>${esc(title)}</h1>
            <p>${esc(desc)}</p>
          </div>
          ${pageActions(pageKey)}
        </div>
        ${content}
      </div>
    </div>

    <nav class="mobile-nav">${mobileNav}</nav>
    ${scanModal()}
    ${previewImageModal()}
    ${courseModal()}
    ${drawerPoint()}
    ${questionModal()}
    ${llmSettingsModal()}
    ${mindmapModal()}
    ${tutorDrawer()}
    ${slideDeckModal()}
  </div>`;
}

/* 作答内容展示（学生/教师共用）：兼容 string 与 {text, images}，图片可点击放大预览 */
function answerDisplayHtml(value, emptyText) {
  const u = unwrapAnswer(value);
  const textHtml = u.text.trim()
    ? esc(u.text).replace(/\n/g, '<br>')
    : `<span class="muted">${emptyText || '未作答'}</span>`;
  const imgsHtml = u.images.length
    ? `<div class="ans-imgs">${u.images.map((src, i) => `
        <span class="ans-thumb-wrap">
          <img class="ans-thumb" src="${src}" alt="作答图片" data-act="preview-image" data-src="${src}">
          <span class="ans-thumb-idx">${i + 1}</span>
        </span>`).join('')}</div>`
    : '';
  return `${textHtml}${imgsHtml}`;
}

/* 全局图片预览灯箱 */
function previewImageModal() {
  if (!ui.previewImage) return '';
  return `<div class="preview-overlay" data-act="close-preview">
    <div class="preview-body" onclick="event.stopPropagation()">
      <button class="preview-close" data-act="close-preview">×</button>
      <img src="${ui.previewImage}" alt="预览">
    </div>
  </div>`;
}

function courseModal() {
  if (!ui.courseModalOpen || db.session.role !== 'teacher') return '';
  const templates = SUBJECT_ORDER.filter(id => db.courses[id]);
  return `
  <div class="modal course-modal">
    <div class="card-head">
      <div><h2>新建课程</h2><div class="sub">课程可开设到多个行政班（可跨专业），学生入班后自动看到本班全部课程</div></div>
      <button class="close-btn" data-act="close-create-course">×</button>
    </div>
    <div class="modal-body">
      <div class="field">
        <label for="course-name">课程名称</label>
        <input class="input" id="course-name" placeholder="例如 线性代数" autocomplete="off">
      </div>
      <div class="grid-2" style="gap:12px">
        <div class="field">
          <label for="course-code">课程代码</label>
          <input class="input" id="course-code" value="${esc(ui.courseDraftCode || '')}" placeholder="例如 MATH-102" autocomplete="off">
        </div>
        <div class="field">
          <label for="course-class">同时新建行政班（可选）</label>
          <input class="input" id="course-class" placeholder="例如 人工智能 2403 班" autocomplete="off">
        </div>
      </div>
      <div class="field" style="margin-bottom:8px">
        <label>开设班级（可多选，可跨专业）</label>
        <div class="class-pick">
          ${(db.classes || []).map(c => `
            <label class="check">
              <input type="checkbox" name="course-classes" value="${c.id}" checked>
              <span>${esc(c.name)}<span class="form-hint" style="margin:0"> · ${esc(c.major || '未分专业')} · ${esc(c.code)}</span></span>
            </label>`).join('') || '<div class="form-hint" style="margin:0">还没有行政班，可在上方新建一个</div>'}
        </div>
      </div>
      <div class="field">
        <label for="course-major">新班级所属专业（可选）</label>
        <input class="input" id="course-major" placeholder="例如 人工智能" autocomplete="off">
      </div>
      <div class="field" style="margin-bottom:8px">
        <label>内容模板</label>
        <div class="tpl-grid">
          ${templates.map(id => `
            <label class="tpl-card">
              <input type="radio" name="course-template" value="${id}" ${id === 'math' ? 'checked' : ''}>
              <b>${esc(db.courses[id].course.name)}</b>
              <span>复制其课件、导图、题目与教材习题</span>
            </label>`).join('')}
        </div>
      </div>
      <div class="privacy-note">
        <span>ℹ️</span>
        <div>创建后会自动生成一个班级号，可在「班级管理」继续添加班级；学生用班级号或扫码入班后，看到的是这门课程的内容。</div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" data-act="close-create-course">取消</button>
      <button class="btn btn-primary" data-act="create-course">创建课程</button>
    </div>
  </div>`;
}

function pageActions(pageKey) {
  if (pageKey === 'teacher/studio') {
    return `<div class="page-actions">
      <button class="btn" data-act="open-create-course">＋ 新建课程</button>
      <button class="btn" data-act="open-upload">上传课件</button>
      <button class="btn btn-primary" data-act="demo-generate">重新生成导图与题目</button>
    </div>`;
  }
  if (pageKey === 'teacher/classes') {
    return `<div class="page-actions">
      <button class="btn btn-primary" data-act="open-create-course">＋ 新建课程</button>
    </div>`;
  }
  if (pageKey === 'student/practice') {
    return '';
  }
  return '';
}

/* ---------------- 思维导图 ---------------- */

function mindmapView() {
  const rowH = 78;
  const padTop = 28;
  const colX = [0, 148, 342, 518];
  const colW = [104, 150, 132, 200];
  const collapsed = ui.mmCollapsed || {};
  let cursor = 0;
  const nodes = [];
  const links = [];

  const rowCenter = () => padTop + cursor * rowH + rowH / 2;
  const avgY = list => Math.round(list.reduce((s, n) => s + n.y, 0) / list.length);

  function placeSection(sec) {
    const node = {
      id: sec.id, type: 'section', title: sec.title,
      meta: `${sec.points.length} 个知识点`, x: colX[2], w: colW[2], children: []
    };
    if (!collapsed[sec.id] && sec.points.length) {
      sec.points.forEach(pid => {
        const p = P(pid);
        if (!p) return;
        node.children.push({
          id: p.id, type: 'point', title: p.title, page: p.page,
          formula: p.formulas[0], x: colX[3], w: colW[3], y: rowCenter()
        });
        cursor++;
      });
      if (node.children.length) {
        node.y = avgY(node.children);
      } else {
        node.y = rowCenter();
        cursor++;
      }
    } else {
      node.y = rowCenter();
      cursor++;
    }
    nodes.push(node, ...node.children);
    links.push(...node.children.map(child => ({ from: node, to: child })));
    return node;
  }

  function placeChapter(ch) {
    const node = {
      id: ch.id, type: 'chapter', title: ch.title,
      meta: `${ch.sections.length} 个小节`, x: colX[1], w: colW[1], children: []
    };
    if (!collapsed[ch.id]) {
      node.children = ch.sections.map(placeSection);
      node.y = node.children.length ? avgY(node.children) : rowCenter();
    } else {
      node.y = rowCenter();
      cursor++;
    }
    nodes.push(node);
    links.push(...node.children.map(child => ({ from: node, to: child })));
    return node;
  }

  const chapters = db.mindMap.map(placeChapter);
  const root = {
    id: 'root', type: 'root', title: db.course.name,
    x: 0, w: colW[0], children: chapters,
    y: chapters.length ? avgY(chapters) : padTop + rowH / 2
  };
  links.push(...chapters.map(ch => ({ from: root, to: ch })));

  const height = Math.max(padTop * 2 + cursor * rowH, 220);
  const width = colX[3] + colW[3];
  const scale = Math.max(0.4, Math.min(3, Number(ui.mmScale) || 1));

  const paths = links.map(({ from, to }) => {
    const x1 = from.x + from.w;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;
    const c = Math.max(26, (x2 - x1) / 2);
    return `<path d="M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}" />
      <circle cx="${x2}" cy="${y2}" r="3" />`;
  }).join('');

  const nodeHtml = [root, ...nodes].map(node => {
    const style = `left:${node.x}px;top:${node.y}px;width:${node.w}px`;
    if (node.type === 'root') {
      return `<div class="tree-node root" style="${style}">
        <div class="tn-title">知课 AI</div>
        <div class="tn-meta" style="color:rgba(255,255,255,.62)">${esc(node.title)}</div>
      </div>`;
    }
    if (node.type === 'point') {
      return `<button class="tree-node point" style="${style}" data-act="open-point" data-id="${node.id}">
        <span class="tn-page">第 ${node.page} 页</span>
        <div class="tn-title">${esc(node.title)}</div>
        <div class="tn-formula">${esc(node.formula)}</div>
      </button>`;
    }
    const isCollapsed = !!collapsed[node.id];
    return `<button class="tree-node ${node.type}" style="${style}" data-act="toggle-node" data-id="${node.id}">
      <div class="tn-title">${esc(node.title)}<span class="tree-toggle">${isCollapsed ? '＋' : '－'}</span></div>
      <div class="tn-meta">${esc(node.meta)}</div>
    </button>`;
  }).join('');

  return `
  <div class="mindmap-toolbar">
    <span class="badge brand">章节</span>
    <span class="badge">小节</span>
    <span class="badge ai">知识点</span>
    <span class="mm-hint">点击章节或小节可折叠，点击知识点查看公式与课件页码 · Ctrl + 滚轮或右侧按钮可缩放</span>
    <div class="mm-zoom">
      <button type="button" class="mm-zoom-btn" data-act="mm-zoom" data-dir="out" title="缩小">－</button>
      <span class="mm-zoom-label">${Math.round(scale * 100)}%</span>
      <button type="button" class="mm-zoom-btn" data-act="mm-zoom" data-dir="in" title="放大">＋</button>
      <button type="button" class="mm-zoom-btn" data-act="mm-zoom" data-dir="reset" title="重置为 100%">⟲</button>
    </div>
    ${db.session.role === 'teacher' ? `<button class="btn btn-sm ${ui.mmEdit ? 'btn-primary' : ''}" data-act="toggle-mm-edit">${ui.mmEdit ? '完成编辑' : '✏️ 编辑导图'}</button>` : ''}
  </div>
  <div class="mindmap-scroll">
    <div class="mm-stage" style="width:${Math.ceil(width * scale)}px;height:${Math.ceil(height * scale)}px">
      <div class="mindmap-canvas" style="width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:0 0">
        <svg class="mm-lines" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paths}</svg>
        ${nodeHtml}
      </div>
    </div>
  </div>
  ${db.session.role === 'teacher' && ui.mmEdit ? mindmapEditor() : ''}`;
}

function mindmapEditor() {
  return `
  <div class="mm-editor">
    <div class="mm-editor-head">
      <div>
        <b>导图结构订正</b>
        <span>点击知识点直接修改 · ✎ 重命名 · ＋ 新增，保存后学生端立即同步</span>
      </div>
      <span class="badge outline">${db.mindMap.length} 章节 · ${db.points.length} 知识点</span>
    </div>
    <div class="mm-edit-list">
      ${db.mindMap.map(chapter => `
      <div class="mm-edit-chapter">
        <div class="mm-edit-row is-chapter">
          <span class="mm-edit-name">${esc(chapter.title)}</span>
          <span class="mm-edit-count">${chapter.sections.length} 小节</span>
          <span class="mm-edit-tools">
            <button class="icon-btn" title="重命名章节" data-act="edit-mm-node" data-type="chapter" data-id="${chapter.id}">✎</button>
            <button class="icon-btn add" title="新增小节" data-act="add-mm-node" data-type="section" data-parent="${chapter.id}">＋</button>
          </span>
        </div>
        ${chapter.sections.map(section => `
        <div class="mm-edit-section">
          <div class="mm-edit-row is-section">
            <span class="mm-edit-name">${esc(section.title)}</span>
            <span class="mm-edit-count">${section.points.length} 个知识点</span>
            <span class="mm-edit-tools">
              <button class="icon-btn" title="重命名小节" data-act="edit-mm-node" data-type="section" data-id="${section.id}">✎</button>
              <button class="icon-btn add" title="新增知识点" data-act="add-mm-node" data-type="point" data-parent="${section.id}">＋</button>
            </span>
          </div>
          <div class="mm-edit-points">
            ${section.points.map(pid => {
              const point = P(pid);
              if (!point) return '';
              return `<button class="mm-edit-point" data-act="edit-mm-node" data-type="point" data-id="${point.id}">
                <span class="mm-dot"></span>
                <span class="mm-edit-name">${esc(point.title)}</span>
                <span class="mm-edit-page">第 ${point.page} 页</span>
                <span class="mm-edit-pencil">✎</span>
              </button>`;
            }).join('') || '<div class="mm-edit-empty">还没有知识点，点右上角 ＋ 添加</div>'}
          </div>
        </div>`).join('')}
      </div>`).join('')}
    </div>
  </div>`;
}

function mindmapModal() {
  const node = ui.editingNode;
  if (!node) return '';

  const point = node.type === 'point' && node.id ? P(node.id) : null;
  const section = node.type === 'section' ? (node.id ? sectionOf(node.id) : sectionOf(node.parentId)) : null;
  const chapter = node.type === 'chapter' ? chapterOf(node.id) : null;

  const titles = {
    chapter: node.id ? '重命名章节' : '新增章节',
    section: node.id ? '重命名小节' : '新增小节',
    point: node.id ? '订正知识点' : '新增知识点'
  };

  let fields = `
    <div class="field">
      <label>标题</label>
      <input class="input" name="title" value="${esc(point?.title || section?.title || chapter?.title || '')}" placeholder="填写名称">
    </div>`;

  if (node.type === 'point') {
    fields += `
      <div class="field">
        <label>核心公式（每行一条）</label>
        <textarea class="textarea" name="formulas" style="min-height:72px">${esc((point?.formulas || []).join('\n'))}</textarea>
      </div>
      <div class="field">
        <label>教材页码</label>
        <input class="input" type="number" name="page" min="1" value="${point?.page || 1}" style="max-width:140px">
      </div>
      <div class="field">
        <label>讲解摘要</label>
        <textarea class="textarea" name="summary" style="min-height:70px">${esc(point?.summary || '')}</textarea>
      </div>
      <div class="field">
        <label>教材原文</label>
        <textarea class="textarea" name="excerpt" style="min-height:70px">${esc(point?.excerpt || '')}</textarea>
      </div>`;
  }

  return `
  <div class="backdrop" data-act="close-mm-modal"></div>
  <div class="modal">
    <div class="drawer-head">
      <div>
        <h3>${titles[node.type]}</h3>
        <div class="sub">${node.type === 'point' ? `所属小节「${esc(section?.title || '')}」` : node.type === 'section' ? `所属章节「${esc(chapter?.title || '')}」` : '调整章节名称'}</div>
      </div>
      <button class="close-btn" data-act="close-mm-modal">×</button>
    </div>
    <form class="modal-body" id="mm-form">
      ${fields}
      <div class="form-hint">保存后学生端知识导图同步更新。</div>
    </form>
    <div class="modal-foot">
      <button class="btn" data-act="close-mm-modal">取消</button>
      <button class="btn btn-primary" data-act="save-mm-node">保存</button>
    </div>
  </div>`;
}

/* ---------------- 知识点抽屉 ---------------- */

function drawerPoint() {
  if (!ui.drawerPointId) return '';
  const p = P(ui.drawerPointId);
  if (!p) return '';
  const sectionName = (() => {
    for (const c of db.mindMap) {
      const s = c.sections.find(x => x.id === p.sectionId);
      if (s) return `${c.title} / ${s.title}`;
    }
    return '';
  })();

  const hasFormulas = !!(p.formulas && p.formulas.length);
  const hasParams = !!(p.params && p.params.length);
  const hasExample = !!p.example;
  const hasExcerpt = !!p.excerpt;
  const block = (dot, title, content) => `
    <div class="kp-block">
      <div class="kp-block-title"><span class="kp-dot kp-dot-${dot}"></span>${title}</div>
      ${content}
    </div>`;
  const blocks = [
    hasFormulas ? block('formula', '核心公式',
      `<div class="formula">${p.formulas.map(f => `<div>${esc(f)}</div>`).join('')}</div>`) : '',
    hasParams ? block('param', '公式参数',
      `<table class="kv"><tbody>${p.params.map(x => `<tr><th><code>${esc(x.sym)}</code> ${esc(x.name)}</th><td>${esc(x.desc)}</td></tr>`).join('')}</tbody></table>`) : '',
    hasExample ? block('example', '生活化示例',
      `<div class="kp-example">${esc(p.example)}</div>`) : '',
    hasExcerpt ? block('source', '课件溯源',
      `<div class="source-box"><b>${esc(db.courseware.fileName)} · 第 ${p.page} 页</b>${esc(p.excerpt)}</div>`) : ''
  ].join('');

  return `
  <div class="backdrop" data-act="close-drawer"></div>
  <div class="modal point-modal">
    <div class="drawer-head">
      <div>
        <h3>${esc(p.title)}</h3>
        <div class="sub">
          ${sectionName ? `<span class="crumb-pill">${esc(sectionName)}</span>` : ''}
          <span class="page-pill">📖 第 ${p.page} 页</span>
        </div>
      </div>
      <button class="close-btn" data-act="close-drawer">×</button>
    </div>
    <div class="drawer-body point-detail">
      ${p.summary ? `<div class="kp-lead">${esc(p.summary)}</div>` : ''}
      ${blocks}
    </div>
    <div class="drawer-foot">
      ${db.session.role === 'student'
        ? `<div style="display:flex;flex-direction:column;gap:8px;width:100%">
             <button class="btn btn-block" data-act="open-courseware" data-page="${p.page}">查看课件第 ${p.page} 页</button>
             <button class="btn btn-primary btn-block" data-act="ask-from-point" data-id="${p.id}">就这个知识点向老师提问</button>
           </div>`
        : `<button class="btn btn-block" data-act="close-drawer">关闭</button>`}
    </div>
  </div>`;
}

/* ---------------- 题目编辑弹窗 ---------------- */

function questionModal() {
  if (!ui.editQuestionId) return '';
  const q = Q(ui.editQuestionId);
  if (!q) return '';

  const optionsHtml = q.type === 'single' ? `
    <div class="field">
      <label>选项（选择正确答案）</label>
      ${q.options.map((opt, i) => `
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <input type="radio" name="answer" value="${i}" ${q.answer === i ? 'checked' : ''} style="accent-color:#315EFB">
          <input class="input" name="option-${i}" value="${esc(opt)}" placeholder="选项 ${String.fromCharCode(65 + i)}">
        </div>`).join('')}
    </div>` : `<div class="form-hint">主观题由 AI 按评分要点给出建议分数，教师可复核调整。</div>`;

  return `
  <div class="backdrop" data-act="close-modal"></div>
  <div class="modal">
    <div class="drawer-head">
      <div>
        <h3>编辑题目</h3>
        <div class="sub">${q.type === 'single' ? '单选题' : '简答题'} · 关联知识点「${esc(P(q.knowledgeId)?.title || '')}」</div>
      </div>
      <button class="close-btn" data-act="close-modal">×</button>
    </div>
    <form class="modal-body" id="question-form" data-qid="${q.id}">
      <div class="field">
        <label>题干</label>
        <textarea class="textarea" name="stem" style="min-height:70px">${esc(q.stem)}</textarea>
      </div>
      ${optionsHtml}
      <div class="field">
        <label>分值</label>
        <input class="input" type="number" name="score" min="1" max="50" value="${q.score}" style="max-width:140px">
      </div>
    </form>
    <div class="modal-foot">
      <button class="btn" data-act="close-modal">取消</button>
      <button class="btn btn-primary" data-act="save-question">保存题目</button>
    </div>
  </div>`;
}

/* ---------------- AI 思考中动画 ---------------- */

function thinkingHtml(label) {
  return `<span class="ai-thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span><em>${esc(label || 'AI 正在思考')}</em></span>`;
}

/* ---------------- AI 模型设置弹窗 ---------------- */

function llmSettingsModal() {
  if (!ui.llmSettingsOpen) return '';
  const cfg = llmConfig;
  const ready = llmReady();
  const chips = Object.keys(LLM_PRESETS).map(k => {
    const p = LLM_PRESETS[k];
    return `<button type="button" class="chip-btn" data-act="llm-preset" data-key="${k}">${esc(p.label)}</button>`;
  }).join('');
  return `
  <div class="backdrop" data-act="close-llm-settings"></div>
  <div class="modal llm-modal">
    <div class="drawer-head">
      <div>
        <h3>AI 模型设置</h3>
        <div class="sub">接入真实大模型驱动 AI 问答 · Key 仅保存在本机浏览器（localStorage），不上传服务器</div>
      </div>
      <button class="close-btn" data-act="close-llm-settings">×</button>
    </div>
    <div class="modal-body">
      <form id="llm-settings-form">
        <div class="field">
          <div class="llm-row">
            <span>启用真实大模型</span>
            <label class="switch"><input type="checkbox" name="enabled" ${cfg.enabled ? 'checked' : ''}><span class="slider"></span></label>
            <span class="badge ${ready ? 'success' : 'warning'}" style="margin-left:auto">${ready ? '已配置 · 可用' : '未配置 Key · 将使用本地演示回答'}</span>
          </div>
        </div>
        <div class="field">
          <label>快捷预设（点一下自动填充地址与模型）</label>
          <div class="chip-row">${chips}</div>
        </div>
        <div class="field">
          <label>API Base URL</label>
          <input class="input" name="baseUrl" value="${esc(cfg.baseUrl)}" placeholder="https://api.agnes-ai.cn/v1">
        </div>
        <div class="field">
          <label>模型名称 Model</label>
          <input class="input" name="model" value="${esc(cfg.model)}" placeholder="agnes-3.0-flash">
        </div>
        <div class="field">
          <label>API Key</label>
          <div class="llm-key-row">
            <input class="input" type="password" name="apiKey" id="llm-key-input" value="${esc(cfg.apiKey)}" placeholder="粘贴 Key；Agnes 请到 platform.agnes-ai.cn 生成">
            <button type="button" class="btn btn-ghost" data-act="llm-toggle-key" id="llm-key-toggle">显示</button>
          </div>
        </div>
        <div class="divider"></div>
        <div class="field">
          <label>视觉模型（选填 · 用于识别手写照片）</label>
          <div class="llm-row" style="margin-bottom:8px">
            <span>手写照片识别状态</span>
            <span class="badge ${llmVisionReady() ? 'success' : 'warning'}" style="margin-left:auto">${llmVisionReady() ? '视觉可用 · 将识别手写照片' : '未单独配置 · 与文本模型共用'}</span>
          </div>
          <input class="input" name="visionBaseUrl" value="${esc(cfg.visionBaseUrl || '')}" placeholder="视觉 API Base URL，留空则使用上方地址">
          <div style="height:8px"></div>
          <input class="input" name="visionModel" value="${esc(cfg.visionModel || '')}" placeholder="视觉模型名，如 qwen-vl-plus、openai/gpt-4o-mini；留空则使用上方模型">
          <div class="form-hint" style="margin-top:6px">配置后，学生上传手写解题照片时，视觉模型会把手写公式识别为 LaTeX，再与标准解答逐步比对后判分；未配置时只评阅文本框内容（照片仍保存供教师查阅）。API Key 默认与上方共用。</div>
          <div style="margin-top:10px"><button type="button" class="btn btn-sm" data-act="llm-vision-test">测试视觉连接</button></div>
        </div>
      </form>
    </div>
    <div class="modal-foot">
      <button class="btn" data-act="llm-clear">清除配置</button>
      <button class="btn" data-act="close-llm-settings">取消</button>
      <button class="btn" data-act="llm-test">测试连接</button>
      <button class="btn btn-primary" data-act="llm-save">保存</button>
    </div>
  </div>`;
}

/* ---------------- AI 答疑抽屉 ---------------- */

function tutorDrawer() {
  if (!ui.tutorQuestionId) return '';
  const q = Q(ui.tutorQuestionId);
  if (!q) return '';
  const point = P(q.knowledgeId);
  const chats = ui.aiChats[q.id] || [];
  const submitted = db.session.role === 'teacher' || !!mySubmission(assignmentOfQuestion(q.id)?.id || '');

  return `
  <div class="backdrop" data-act="close-tutor"></div>
  <aside class="drawer">
    <div class="drawer-head">
      <div>
        <h3>AI 作业答疑</h3>
        <div class="sub">关联「${esc(point?.title || '')}」· 第 ${point?.page} 页</div>
      </div>
      <button class="close-btn" data-act="close-tutor">×</button>
    </div>
    <div class="drawer-body">
      <div class="q-stem" style="margin-bottom:12px">${esc(q.stem)}</div>

      <div class="source-box" style="margin-bottom:12px">
        <b>📖 ${esc(db.courseware.fileName)} · 第 ${point?.page} 页</b>
        ${esc(point?.excerpt || '')}
      </div>

      <div class="notice">
        <span>💡</span>
        <div><b>只依据本课程课件作答</b>：提交前只给思路提示，不直接给答案；每条回答都会标注课件页码，可随时回到原文核对。</div>
      </div>
      <div class="q-actions" style="margin-top:0">
        <button class="btn btn-sm" data-act="ai-hint" data-level="0">给我一点提示</button>
        <button class="btn btn-sm" data-act="ai-hint" data-level="1">再提示一步</button>
        <button class="btn btn-sm ${submitted ? '' : 'btn-ghost'}" data-act="ai-hint" data-level="2" ${submitted ? '' : 'disabled title="提交后可查看完整解析"'}>查看完整解析</button>
        <button class="btn btn-sm btn-ghost" data-act="open-point-from-tutor" data-id="${q.knowledgeId}">查看课件原文</button>
      </div>

      <div class="divider"></div>

      <div class="chat">
        ${chats.length ? chats.map(c => `
          <div class="bubble ${c.role}">
            <span class="who">${c.role === 'ai' ? 'AI 助教' : '我'}</span>${c.pending ? thinkingHtml() : esc(c.text).replace(/\n/g, '<br>')}
          </div>`).join('') : `
          <div class="bubble ai"><span class="who">AI 助教</span>我是基于本课程课件训练的助教，可以给你提示、讲解知识点，但不会直接替你写答案。你想先看哪一步？</div>`}
      </div>

      <div class="chat-input">
        <input class="input" id="tutor-input" placeholder="描述你卡在哪一步…">
        <button class="btn btn-ai" data-act="tutor-send">发送</button>
      </div>
    </div>
  </aside>`;
}

/* ---------------- 知识点掌握度雷达图（纯 SVG，零依赖） ---------------- */

/**
 * 纯 SVG 雷达图：呈现各知识点掌握度强弱，一眼看出薄弱环节。
 * @param {Array<{title:string, rate:number, tested?:boolean}>} items - rate 为 0-100 的掌握率；tested:false 表示暂无作答（落到中心，标签显示「未测」，不臆造掌握率）
 * @param {{size?:number}} [opts]
 * @returns {string} SVG 字符串；知识点不足 3 个时返回空串（调用方自行回退到条形列表）
 */
function radarChartSvg(items, opts) {
  opts = opts || {};
  const size = opts.size || 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 56; // 外圈留给标签
  const n = (items || []).length;
  if (n < 3) return '';

  const clamp = v => Math.max(0, Math.min(100, Number(v) || 0));
  const angle = i => (Math.PI * 2 * i) / n - Math.PI / 2; // 从正上方起顺时针
  const pt = (i, ratio) => {
    const a = angle(i);
    return [cx + Math.cos(a) * radius * ratio, cy + Math.sin(a) * radius * ratio];
  };
  const fmt = v => (Math.round(v * 10) / 10).toFixed(1);

  const rings = [20, 40, 60, 80, 100];
  const gridPolys = rings.map(r => {
    const pts = items.map((_, i) => {
      const [x, y] = pt(i, r / 100);
      return `${fmt(x)},${fmt(y)}`;
    }).join(' ');
    return `<polygon points="${pts}" class="radar-grid" />`;
  }).join('');

  const ringLabels = rings.map(r => {
    const y = cy - radius * (r / 100);
    return `<text x="${fmt(cx - 6)}" y="${fmt(y + 3)}" text-anchor="end" class="radar-ring-label">${r}</text>`;
  }).join('');

  const axes = items.map((_, i) => {
    const [x, y] = pt(i, 1);
    return `<line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(x)}" y2="${fmt(y)}" class="radar-axis" />`;
  }).join('');

  const dataPts = items.map((it, i) => {
    const [x, y] = pt(i, clamp(it.rate) / 100);
    return `${fmt(x)},${fmt(y)}`;
  }).join(' ');

  const dots = items.map((it, i) => {
    if (it.tested === false) return ''; // 未测点落在中心，不重复绘制顶点
    const [x, y] = pt(i, clamp(it.rate) / 100);
    const tone = it.rate < 50 ? 'weak' : (it.rate < 75 ? 'mid' : 'strong');
    return `<circle cx="${fmt(x)}" cy="${fmt(y)}" r="3.5" class="radar-dot ${tone}" />`;
  }).join('');

  const labels = items.map((it, i) => {
    const [x, y] = pt(i, 1.22);
    const anchor = Math.abs(x - cx) < 5 ? 'middle' : (x > cx ? 'start' : 'end');
    const untested = it.tested === false;
    const tone = untested ? 'untested' : (it.rate < 50 ? 'weak' : (it.rate < 75 ? 'mid' : 'strong'));
    const val = untested ? '未测' : `${clamp(it.rate)}%`;
    return `<text x="${fmt(x)}" y="${fmt(y)}" text-anchor="${anchor}" dominant-baseline="middle" class="radar-label ${tone}">${esc(it.title)} · ${val}</text>`;
  }).join('');

  return `<svg class="radar-chart" viewBox="0 0 ${size} ${size}" width="100%" height="${size}" role="img" aria-label="知识点掌握度雷达图">${gridPolys}${ringLabels}${axes}<polygon points="${dataPts}" class="radar-data" />${dots}${labels}</svg>`;
}

/* ---------------- 手写公式识别结果 + 逐步比对（学生/教师共用） ---------------- */

const STEP_VERDICT_META = {
  match: { label: '✓ 等价', cls: 'success' },
  partial: { label: '≈ 部分', cls: 'warning' },
  wrong: { label: '✗ 错误', cls: 'danger' },
  missing: { label: '— 缺失', cls: 'outline' }
};

/**
 * 渲染「手写识别 LaTeX + 逐步比对」两张卡片；无相关数据时返回空串。
 * @param {object} review - 判分结果（含 latex / stepCompare）
 */
function latexReviewHtml(review) {
  if (!review) return '';
  const latex = review.latex;
  const cmp = Array.isArray(review.stepCompare) ? review.stepCompare : [];
  if (!latex && !cmp.length) return '';

  let html = '';
  if (latex && Array.isArray(latex.steps) && latex.steps.length) {
    const conf = Number(latex.confidence) || 0;
    const confCls = conf >= 0.8 ? 'success' : conf >= 0.5 ? 'warning' : 'danger';
    const rows = latex.steps.map((s, i) => `
      <div class="latex-step">
        <span class="latex-idx">${i + 1}</span>
        <code class="latex-code">${esc(s.latex)}</code>
        ${s.note ? `<span class="latex-note">${esc(s.note)}</span>` : ''}
      </div>`).join('');
    html += `
    <div class="review-card ai">
      <div class="review-head">
        <b>🔍 手写公式识别 · LaTeX</b>
        ${conf ? `<span class="badge ${confCls}">置信度 ${Math.round(conf * 100)}%</span>` : ''}
      </div>
      <div class="latex-steps">${rows}</div>
      ${latex.finalAnswer ? `<div class="latex-final">最终答案：<code class="latex-code">${esc(latex.finalAnswer)}</code></div>` : ''}
    </div>`;
  }

  if (cmp.length) {
    const tally = { match: 0, partial: 0, wrong: 0, missing: 0 };
    cmp.forEach(r => { if (tally[r.verdict] !== undefined) tally[r.verdict]++; });
    const rows = cmp.map((r, i) => {
      const meta = STEP_VERDICT_META[r.verdict] || STEP_VERDICT_META.partial;
      return `
      <div class="sc-row">
        <span class="sc-idx">${i + 1}</span>
        <span class="sc-mine">${r.student ? `<code class="latex-code">${esc(r.student)}</code>` : '<span class="sc-empty">（未写）</span>'}</span>
        <span class="sc-expect">${esc(r.expected || '—')}</span>
        <span class="sc-verdict"><span class="badge ${meta.cls}">${meta.label}</span></span>
        <span class="sc-note">${esc(r.note || '')}</span>
      </div>`;
    }).join('');
    const tallyHtml = [
      `<span class="badge success">等价 ${tally.match}</span>`,
      `<span class="badge warning">部分 ${tally.partial}</span>`,
      `<span class="badge danger">错误 ${tally.wrong}</span>`,
      `<span class="badge outline">缺失 ${tally.missing}</span>`
    ].join(' ');
    html += `
    <div class="review-card">
      <div class="review-head"><b>🧮 逐步比对</b><span class="sc-tally">${tallyHtml}</span></div>
      <div class="step-compare">
        <div class="sc-row sc-head">
          <span class="sc-idx">#</span>
          <span class="sc-mine">我的步骤</span>
          <span class="sc-expect">标准步骤</span>
          <span class="sc-verdict">判定</span>
          <span class="sc-note">说明</span>
        </div>
        ${rows}
      </div>
    </div>`;
  }

  return html;
}
