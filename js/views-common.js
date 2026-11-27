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
          <span>高等数学</span><span>大学物理</span><span>电磁场</span>
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
            <span><b>教师账号</b>gaoshu · wuli · dianci</span>
            <span><b>学生账号</b>student</span>
            <span><b>初始密码</b>均为 123456</span>
          </div>
        </div>
        <p class="login-foot">登录后只显示本人课程与班级的数据<br>AI 内容为模拟生成，均标注课件来源页码</p>
      </aside>
    </main>

    <footer class="landing-foot">知课 AI · 演示版本 · 数据保存在本机浏览器</footer>
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
        <div class="form-hint">演示班级号：AI-2401 · AI-2402 · EI-2401</div>
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
  { key: 'learn', icon: '🧭', label: '知识导图' },
  { key: 'practice', icon: '✍️', label: '课堂与作业' },
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
  'student/wrong': ['错题本', '按科目汇总错题，勾选后可重新做一遍'],
  'student/ai': ['AI 问答', '基于课件的 AI 答疑，提问会汇总给老师讲评'],
  'student/messages': ['私信与问答', '向老师提问，或匿名分享给全班']
};

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
        <b>模拟 AI · 演示数据</b><br>
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
          <button class="btn btn-sm btn-ghost" data-act="logout">退出登录</button>
          <button class="btn btn-sm btn-ghost" data-act="reset-demo">重置演示</button>
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
    ${courseModal()}
    ${drawerPoint()}
    ${questionModal()}
    ${mindmapModal()}
    ${tutorDrawer()}
  </div>`;
}

function courseModal() {
  if (!ui.courseModalOpen || db.session.role !== 'teacher') return '';
  const templates = ['math', 'physics', 'em'].filter(id => db.courses[id]);
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
    <span class="mm-hint">点击章节或小节可折叠，点击知识点查看公式与课件页码</span>
    ${db.session.role === 'teacher' ? `<button class="btn btn-sm ${ui.mmEdit ? 'btn-primary' : ''}" data-act="toggle-mm-edit">${ui.mmEdit ? '完成编辑' : '✏️ 编辑导图'}</button>` : ''}
  </div>
  <div class="mindmap-scroll">
    <div class="mindmap-canvas" style="width:${width}px;height:${height}px">
      <svg class="mm-lines" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paths}</svg>
      ${nodeHtml}
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

  return `
  <div class="backdrop" data-act="close-drawer"></div>
  <aside class="drawer">
    <div class="drawer-head">
      <div>
        <h3>${esc(p.title)}</h3>
        <div class="sub">${esc(sectionName)} · 来源 ${esc(db.courseware.fileName)} 第 ${p.page} 页</div>
      </div>
      <button class="close-btn" data-act="close-drawer">×</button>
    </div>
    <div class="drawer-body">
      <div class="kp-summary">${esc(p.summary)}</div>

      <div class="section-title">核心公式</div>
      <div class="formula">${p.formulas.map(f => `<div>${esc(f)}</div>`).join('')}</div>

      <div class="section-title">公式参数</div>
      <table class="kv">
        <tbody>
          ${p.params.map(x => `<tr><th><code>${esc(x.sym)}</code> ${esc(x.name)}</th><td>${esc(x.desc)}</td></tr>`).join('')}
        </tbody>
      </table>

      <div class="section-title">生活化示例</div>
      <div class="kp-summary">${esc(p.example)}</div>

      <div class="section-title">课件溯源</div>
      <div class="source-box">
        <b>${esc(db.courseware.fileName)} · 第 ${p.page} 页</b>
        ${esc(p.excerpt)}
      </div>
    </div>
    <div class="drawer-foot">
      ${db.session.role === 'student'
        ? `<div style="display:flex;flex-direction:column;gap:8px;width:100%">
             <button class="btn btn-block" data-act="open-courseware" data-page="${p.page}">查看课件第 ${p.page} 页</button>
             <button class="btn btn-primary btn-block" data-act="ask-from-point" data-id="${p.id}">就这个知识点向老师提问</button>
           </div>`
        : `<button class="btn btn-block" data-act="close-drawer">关闭</button>`}
    </div>
  </aside>`;
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
            <span class="who">${c.role === 'ai' ? 'AI 助教' : '我'}</span>${esc(c.text).replace(/\n/g, '<br>')}
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
