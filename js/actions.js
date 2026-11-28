/* ============================================================
 * 业务动作：登录、课件生成、发布、作答、批改、问答
 * ============================================================ */

function doLogin(username, password) {
  const user = String(username || '').trim().toLowerCase();
  const pass = String(password || '');
  const teacher = TEACHERS.find(t => t.username === user);

  if (teacher) {
    if (pass !== teacher.password) {
      showLoginError('密码错误，请重新输入');
      return;
    }
    showLoginError('');
    loginAs('teacher', teacher.id);
    return;
  }

  if (user === STUDENT_ACCOUNT.username) {
    if (pass !== STUDENT_ACCOUNT.password) {
      showLoginError('密码错误，请重新输入');
      return;
    }
    showLoginError('');
    loginAs('student');
    return;
  }

  showLoginError('账号不存在，请检查输入或联系管理员');
}

function showLoginError(message) {
  const el = document.getElementById('login-error');
  if (!el) return;
  el.textContent = message;
  if (message) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }
}

/* ---------------- 思维导图订正 ---------------- */

function saveMindmapNode() {
  const form = document.getElementById('mm-form');
  const node = ui.editingNode;
  if (!form || !node) return;
  const read = name => {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : '';
  };
  const title = read('title');

  if (!title) {
    toast('请填写标题');
    return;
  }

  if (node.type === 'chapter') {
    const chapter = chapterOf(node.id);
    if (!chapter) return;
    chapter.title = title;
  } else if (node.type === 'section') {
    if (node.id) {
      const section = sectionOf(node.id);
      if (!section) return;
      section.title = title;
    } else {
      const chapter = chapterOf(node.parentId);
      if (!chapter) return;
      chapter.sections.push({
        id: `sec-${db.courseId}-${Date.now()}`,
        title,
        points: []
      });
    }
  } else if (node.type === 'point') {
    const formulas = read('formulas').split('\n').map(line => line.trim()).filter(Boolean);
    const page = Number(read('page')) || 1;
    const summary = read('summary');
    const excerpt = read('excerpt');

    if (node.id) {
      const point = P(node.id);
      if (!point) return;
      point.title = title;
      point.page = page;
      if (formulas.length) point.formulas = formulas;
      if (summary) point.summary = summary;
      if (excerpt) point.excerpt = excerpt;
    } else {
      const section = sectionOf(node.parentId);
      if (!section) return;
      const id = `p-${db.courseId}-${Date.now()}`;
      db.points.push({
        id,
        sectionId: section.id,
        title,
        page,
        formulas: formulas.length ? formulas : ['见教材原文'],
        params: [],
        summary: summary || '教师补充的知识点，请结合教材原文阅读。',
        excerpt: excerpt || '教师补充内容，暂无教材原文摘录。'
      });
      section.points.push(id);
    }
  }

  ui.editingNode = null;
  saveDb();
  render();
  toast('已保存，学生端知识导图同步更新');
}

function loginAs(role, teacherId) {
  db.session.role = role;
  if (role === 'teacher') {
    const teacher = TEACHERS.find(t => t.id === teacherId) || TEACHERS[0];
    db.session.teacherId = teacher.id;
    db.session.userId = teacher.id;
    /* 优先回到上次使用的本人课程（含自建课程） */
    const owned = coursesOfTeacher(teacher.id);
    const last = owned.some(c => c.id === db.courseId) ? db.courseId : teacher.courseId;
    useCourse(db, last);
    const first = classesOfCourse()[0];
    db.session.classId = first ? first.id : null;
  } else {
    db.session.userId = 's1';
    const lastCourseId = db.courseId;
    useCourse(db, 'math');
    ui.learnTab = 'map';
    ui.pptPage = null;
    const pending = ui.pendingJoin;
    ui.pendingJoin = '';
    if (pending && joinClass(pending)) {
      /* 扫码进入：登录后自动加入对应班级 */
    } else if (myClass()) {
      const joined = studentCourses();
      if (joined.length) {
        const active = joined.find(c => c.courseId === lastCourseId) || joined[0];
        useCourse(db, active.courseId);
      }
    } else {
      db.studentClassId = null;
    }
  }
  ui.chapterId = db.mindMap[0]?.id || null;
  ui.sectionId = db.mindMap[0]?.sections[0]?.id || null;
  ui.mmCollapsed = {};
  ui.mmEdit = false;
  ui.editingNode = null;
  saveDb();
  const fallback = role === 'teacher' ? '#/teacher/studio' : (studentClassIds().length ? '#/student/learn' : '#/student/join');
  location.hash = fallback;
  render();
  const cls = role === 'teacher' ? currentClass() : myClass();
  if (cls && role === 'student') toast(`已进入 ${cls.name}`, 2200);
}

function logout() {
  stopScan();
  ui.scanOpen = false;
  ui.courseModalOpen = false;
  ui.courseDraftCode = '';
  db.session.role = null;
  db.session.userId = null;
  saveDb();
  location.hash = '#/login';
  render();
}

/* ---------------- 班级创建、切换与加入 ---------------- */

function switchClass(id) {
  const cls = (db.classes || []).find(c => c.id === id);
  if (!cls || !courseClassIds().includes(id)) return;
  db.session.classId = cls.id;
  ui.activeSubmissionId = null;
  ui.reviewDraft = null;
  ui.activeExamId = null;
  ui.activeMessageId = null;
  ui.reviewPointId = null;
  ui.exTargets = null;
  saveDb();
  render();
  toast(`已切换到 ${cls.name}`);
}

function createClass() {
  const input = document.getElementById('class-name');
  const majorInput = document.getElementById('class-major');
  const name = input ? input.value.trim() : '';
  const major = (majorInput ? majorInput.value.trim() : '') || '未分专业';
  if (!name) {
    toast('请填写班级名称');
    return;
  }
  let code;
  do {
    code = `CLS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  } while ((db.classes || []).some(c => c.code === code));

  const id = `cls-${Date.now()}`;
  db.classes.push({
    id,
    name,
    major,
    code,
    studentCount: 0,
    createdAt: '今天'
  });
  /* 行政班创建后自动开设到当前课程 */
  const data = db.courses[db.courseId];
  if (data) {
    data.classIds = Array.isArray(data.classIds) ? data.classIds : [];
    if (!data.classIds.includes(id)) data.classIds.push(id);
  }
  db.session.classId = id;
  saveDb();
  render();
  toast(`已创建 ${name}，班级号 ${code}`, 3600);
}

/* ---------------- 创建课程与切换课程 ---------------- */

function suggestCourseCode() {
  const prefix = (db.course.code || 'NEW-101').split('-')[0].toUpperCase();
  const used = new Set(Object.values(db.courses || {}).map(c => (c.course.code || '').toUpperCase()));
  let number = 101;
  while (used.has(`${prefix}-${number}`) && number < 999) number++;
  return `${prefix}-${number}`;
}

function openCreateCourse() {
  if (db.session.role !== 'teacher') return;
  ui.courseModalOpen = true;
  ui.courseDraftCode = suggestCourseCode();
  render();
}

function closeCreateCourse() {
  ui.courseModalOpen = false;
  ui.courseDraftCode = '';
  render();
}

function createCourse() {
  if (db.session.role !== 'teacher') return;
  const name = (document.getElementById('course-name')?.value || '').trim();
  const code = (document.getElementById('course-code')?.value || '').trim().toUpperCase();
  const classInput = (document.getElementById('course-class')?.value || '').trim();
  const majorInput = (document.getElementById('course-major')?.value || '').trim();
  const templateId = document.querySelector('input[name="course-template"]:checked')?.value || 'math';
  const template = (db.courses || {})[templateId];

  if (!name) { toast('请填写课程名称'); return; }
  if (!/^[A-Z]{2,8}-\d{2,4}$/.test(code)) { toast('课程代码格式如 MATH-102'); return; }
  if (!template) { toast('请选择内容模板'); return; }
  if (Object.values(db.courses || {}).some(c => (c.course.code || '').toUpperCase() === code)) {
    toast('课程代码已存在，请换一个');
    return;
  }

  const targetIds = [...document.querySelectorAll('input[name="course-classes"]:checked')]
    .map(el => el.value)
    .filter(id => (db.classes || []).some(c => c.id === id));
  if (!targetIds.length && !classInput) {
    toast('请至少选择一个班级');
    return;
  }

  const newId = `course-${Date.now().toString(36)}`;

  /* 可选：同时新建行政班并开设本课程 */
  if (classInput) {
    let newCode;
    do {
      newCode = `CLS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    } while ((db.classes || []).some(c => c.code === newCode));
    const newClassId = `cls-${Date.now()}`;
    db.classes.push({
      id: newClassId,
      name: classInput,
      major: majorInput || '未分专业',
      code: newCode,
      studentCount: 0,
      createdAt: '今天'
    });
    targetIds.push(newClassId);
  }

  const firstClass = (db.classes || []).find(c => c.id === targetIds[0]);

  db.courses[newId] = {
    course: {
      name,
      code,
      className: firstClass ? firstClass.name : `${name} 2401 班`,
      teacher: currentTeacher().name,
      teacherId: db.session.teacherId,
      studentCount: firstClass ? firstClass.studentCount : 30
    },
    classIds: targetIds,
    courseware: { ...clone(template.courseware), fileName: `${name}课件.pptx` },
    mindMap: clone(template.mindMap),
    points: clone(template.points),
    questions: clone(template.questions),
    assignments: clone(template.assignments).map(a => (
      a.mode === 'homework'
        ? { ...a, dueAt: Date.now() + 3 * 24 * 3600 * 1000 }
        : a
    )),
    examPapers: [],
    textbook: clone(template.textbook),
    distributed: []
  };

  useCourse(db, newId);
  db.session.classId = targetIds[0];
  ui.chapterId = db.mindMap[0]?.id || null;
  ui.sectionId = db.mindMap[0]?.sections[0]?.id || null;
  ui.mmCollapsed = {};
  ui.mmEdit = false;
  ui.editingNode = null;
  ui.drawerPointId = null;
  ui.activeSubmissionId = null;
  ui.reviewDraft = null;
  ui.activeExamId = null;
  ui.activeMessageId = null;
  ui.activeAiQuestionId = null;
  ui.courseModalOpen = false;
  ui.courseDraftCode = '';
  saveDb();

  if (!location.hash.startsWith('#/teacher/')) location.hash = '#/teacher/studio';
  render();
  toast(`课程「${name}」已创建，开设到 ${targetIds.length} 个班级`, 3600);
}

function switchCourse(id) {
  if (db.session.role !== 'teacher' || !id || id === db.courseId) return;
  if (!coursesOfTeacher().some(c => c.id === id)) return;
  useCourse(db, id);
  const first = classesOfCourse()[0];
  db.session.classId = first ? first.id : null;
  ui.chapterId = db.mindMap[0]?.id || null;
  ui.sectionId = db.mindMap[0]?.sections[0]?.id || null;
  ui.mmCollapsed = {};
  ui.mmEdit = false;
  ui.editingNode = null;
  ui.drawerPointId = null;
  ui.activeSubmissionId = null;
  ui.reviewDraft = null;
  ui.activeExamId = null;
  ui.activeMessageId = null;
  ui.activeAiQuestionId = null;
  ui.reviewPointId = null;
  ui.exTargets = null;
  saveDb();
  render();
  toast(`已切换到「${db.course.name}」`);
}

function joinClass(code) {
  const value = String(code || '').trim().toUpperCase();
  const cls = (db.classes || []).find(c => c.code.toUpperCase() === value);
  if (!cls) return false;
  /* 一个班级号对应一个行政班，入班后自动获得该班开设的全部课程 */
  db.studentClassId = cls.id;
  const offered = studentCourses();
  const active = offered.find(c => c.courseId === db.courseId) || offered[0];
  if (active) useCourse(db, active.courseId);
  saveDb();
  return true;
}

/** 学生切换到已加入的另一门课程 */
function switchStudentCourse(courseId, silent) {
  const cls = classOfCourseForStudent(courseId);
  if (!cls) {
    toast('还没有加入这门课程，请先用班级号加入');
    return;
  }
  if (db.courseId === courseId && db.studentClassId === cls.id) return;
  useCourse(db, courseId);
  db.studentClassId = cls.id;
  ui.chapterId = db.mindMap[0]?.id || null;
  ui.sectionId = db.mindMap[0]?.sections[0]?.id || null;
  ui.mmCollapsed = {};
  ui.mmEdit = false;
  ui.mmScale = 1;
  ui.editingNode = null;
  ui.drawerPointId = null;
  ui.practiceItem = null;
  ui.prefillMessage = '';
  ui.aiHomeChat = [];
  ui.aiHomeMode = 'textbook';
  ui.aiHomeQuestionId = null;
  ui.aiPage = null;
  ui.aiSection = null;
  ui.aiPagePicked = false;
  ui.redo = null;
  ui.wrongSelected = [];
  ui.wrongPointFilter = '';
  ui.wrongCourseId = courseId;
  ui.pptPage = null;
  ui.selfCheckFilter = 'all';
  saveDb();
  render();
  if (!silent) toast(`已切换到「${db.course.name}」`);
}

/* ---------------- 学生课件 PPT ---------------- */

function switchLearnTab(tab) {
  ui.learnTab = tab === 'ppt' ? 'ppt' : (tab === 'check' ? 'check' : 'map');
  render();
}

/** 思维导图学习概览：回到导图、练习或自我检测 */
function openLearnStat(kind) {
  const scrollToLearnCard = () => {
    const tabs = document.querySelector('.learn-tabs');
    const card = tabs && tabs.closest('.card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (kind === 'points') {
    scrollToLearnCard();
    return;
  }
  if (kind === 'practice') {
    ui.practiceTab = 'homework';
    ui.practiceItem = null;
    location.hash = '#/student/practice';
    return;
  }
  if (kind === 'mastered') {
    ui.selfCheckFilter = 'all';
    switchLearnTab('check');
    requestAnimationFrame(scrollToLearnCard);
  }
}

function setSelfCheckFilter(f) {
  ui.selfCheckFilter = f;
  render();
}

/** 标记某个知识点的自我检测状态（mastered/review）；再次点同一状态则取消标记 */
function setSelfCheck(pointId, status) {
  const map = selfCheckOf(db.courseId);
  if (map[pointId] === status) delete map[pointId];
  else map[pointId] = status;
  saveDb();
  render();
}

function resetSelfCheck() {
  db.selfCheck[db.courseId] = {};
  saveDb();
  render();
  toast('已清空本课程的自我检测记录');
}

function gotoPptPage(page) {
  const target = Number(page);
  if (!target) return;
  if (!coursewarePages().some(item => item.page === target)) return;
  ui.learnTab = 'ppt';
  ui.pptPage = target;
  render();
}

/** 从知识点抽屉跳到课件对应页 */
function openCoursewareAt(page) {
  ui.drawerPointId = null;
  ui.learnTab = 'ppt';
  ui.pptPage = Number(page) || null;
  if (location.hash !== '#/student/learn') location.hash = '#/student/learn';
  render();
}

/* ---------------- 教师课件管理 ---------------- */

function openTeacherPpt(page) {
  const pages = coursewarePages();
  ui.pptPreviewPage = Number(page) || (pages[0] ? pages[0].page : 1);
  render();
}

function gotoTeacherPptPage(page) {
  const target = Number(page);
  if (!target) return;
  ui.pptPreviewPage = target;
  render();
}

function closeTeacherPpt() {
  ui.pptPreviewPage = null;
  render();
}

/** 保存教师标注的知识点课件页码 */
function savePointPages() {
  let changed = 0;
  document.querySelectorAll('[data-point-page]').forEach(input => {
    const point = P(input.dataset.pointPage);
    const value = Number(input.value);
    if (!point || !value || value === point.page) return;
    point.page = value;
    changed++;
  });
  if (!changed) {
    toast('页码没有变化');
    return;
  }
  saveDb();
  render();
  toast(`已更新 ${changed} 个知识点的课件页码，学生端同步`);
}

/** 在学生作业页右侧查看某次已完成的作业/习题 */
function openPracticeItem(kind, id, courseId) {
  if (courseId && courseId !== db.courseId) {
    const cls = classOfCourseForStudent(courseId);
    if (cls) {
      useCourse(db, courseId);
      db.studentClassId = cls.id;
    }
  }
  ui.practiceItem = { kind, id };
  saveDb();
  render();
}

/** 学生作业页：开始作答某项（自动切到对应课程） */
function startPracticeItem(kind, id, courseId) {
  if (courseId && courseId !== db.courseId) {
    const cls = classOfCourseForStudent(courseId);
    if (cls) {
      useCourse(db, courseId);
      db.studentClassId = cls.id;
      ui.practiceItem = null;
      saveDb();
    }
  }
  if (kind === 'exercise') {
    location.hash = `#/student/exercise/${id}`;
    render();
  } else {
    startAssignment(id);
  }
}

/* ---------------- 错题本与错题重做 ---------------- */

/** 错题本当前查看的课程 */
function currentWrongCourseId() {
  const courses = studentCourses();
  if (courses.some(c => c.courseId === ui.wrongCourseId)) return ui.wrongCourseId;
  if (courses.some(c => c.courseId === db.courseId)) return db.courseId;
  return courses[0] ? courses[0].courseId : '';
}

function switchWrongCourse(courseId) {
  if (!classOfCourseForStudent(courseId)) return;
  ui.wrongCourseId = courseId;
  ui.wrongSelected = [];
  ui.wrongPointFilter = '';
  render();
}

/** 勾选/取消勾选一道错题（只允许同一门课程） */
function toggleWrongSelection(qid) {
  const list = ui.wrongSelected || [];
  if (list.includes(qid)) {
    ui.wrongSelected = list.filter(x => x !== qid);
  } else {
    ui.wrongSelected = [...list, qid];
  }
  render();
}

function selectAllWrongQuestions() {
  const courseId = currentWrongCourseId();
  ui.wrongSelected = courseId ? studentWrongQuestions(courseId).map(w => w.qid) : [];
  render();
}

function clearWrongSelection() {
  ui.wrongSelected = [];
  render();
}

/** 为一道原题生成 n 道同知识点的 AI 变式题（举一反三） */
async function generateVariantsFor(courseId, originalQ, n) {
  const pointId = originalQ.knowledgeId || '';
  const difficulty = originalQ.difficulty || '基础';
  let res;
  try {
    res = await generateAiQuestions(courseId, pointId, difficulty, n);
  } catch (e) {
    return [];
  }
  if (!res || !res.ok || !Array.isArray(res.questions)) return [];
  return res.questions.map(vq => ({ ...vq, variantOf: originalQ.id, isOriginal: false }));
}

/** 勾选同一门课程的错题后开始变式重做：每道原题 + AI 生成的同知识点变式题 */
async function startWrongRedo() {
  const ids = (ui.wrongSelected || []).slice();
  if (!ids.length) {
    toast('请先选择要重做的错题');
    return;
  }
  const courseId = currentWrongCourseId();
  const cls = classOfCourseForStudent(courseId);
  if (!cls) {
    toast('请先加入对应课程');
    return;
  }
  useCourse(db, courseId);
  db.studentClassId = cls.id;
  const originals = (db.questions || [])
    .filter(q => ids.includes(q.id))
    .map(q => ({ ...q, variantOf: null, isOriginal: true }));
  if (!originals.length) {
    toast('未找到选中的题目');
    return;
  }
  const answers = {};
  originals.forEach(q => { answers[q.id] = { text: '', images: [] }; });
  ui.redo = { courseId, questions: originals.slice(), answers, result: null, generating: true };
  ui.wrongSelected = [];
  ui.drawerPointId = null;
  saveDb();
  location.hash = '#/student/redo';
  render();

  /* 异步生成变式题：未配置模型或生成失败时优雅降级为只做原题 */
  let variants = [];
  if (llmReady()) {
    toast(`正在为 ${originals.length} 道错题生成 AI 变式题…`);
    const results = await Promise.all(originals.map(q => generateVariantsFor(courseId, q, 2)));
    variants = results.flat();
  } else {
    toast('未配置大模型，本次仅重做原题（在右上角「模型」配置后可获得举一反三变式题）');
  }
  variants.forEach(vq => { answers[vq.id] = { text: '', images: [] }; });
  ui.redo.questions = originals.concat(variants);
  ui.redo.answers = answers;
  ui.redo.generating = false;
  if (llmReady() && !variants.length) toast('AI 变式题生成失败，已仅保留原题');
  saveDb();
  render();
}

function setRedoOption(qid, index) {
  if (!ui.redo || ui.redo.result) return;
  const cur = ui.redo.answers[qid];
  ui.redo.answers[qid] = (cur && typeof cur === 'object')
    ? { text: String(index), images: cur.images || [] }
    : { text: String(index), images: [] };
  render();
}

function setRedoShort(qid, value) {
  if (!ui.redo || ui.redo.result) return;
  const cur = ui.redo.answers[qid];
  ui.redo.answers[qid] = (cur && typeof cur === 'object') ? { text: value, images: cur.images || [] } : { text: value, images: [] };
}

function exitRedo() {
  ui.redo = null;
  location.hash = '#/student/wrong';
  render();
}

async function submitRedo() {
  const redo = ui.redo;
  if (!redo || redo.result || redo.generating) return;
  const questions = Array.isArray(redo.questions) ? redo.questions.filter(Boolean) : [];
  if (!questions.length) return;
  const missing = questions.filter(q => !answerHasContent(redo.answers[q.id]));
  if (missing.length) {
    toast(`还有 ${missing.length} 道题未作答`);
    return;
  }

  const items = [];
  for (const q of questions) {
    if (!Number.isFinite(q.score)) q.score = q.type === 'single' ? 5 : 10;
    const value = redo.answers[q.id];
    let score, review = null;
    if (q.type === 'single') {
      const t = answerText(value).trim();
      score = (t !== '' && Number(t) === q.answer) ? q.score : 0;
    } else {
      review = await gradeShortAnswerLLM(q, answerText(value), answerImages(value));
      score = review.score;
    }
    items.push({ qid: q.id, score, max: q.score, answer: value, review });
  }
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const max = items.reduce((sum, item) => sum + item.max, 0);

  redo.result = { total, max, items };
  if (!Array.isArray(db.redoRecords)) db.redoRecords = [];
  db.redoRecords.unshift({
    id: `redo-${Date.now()}`,
    courseId: redo.courseId,
    at: nowStamp(),
    items
  });
  saveDb();
  render();
  toast(`重做完成，得分 ${total} / ${max}`);
}

function submitJoinForm() {
  const input = document.getElementById('join-code');
  const code = input ? input.value : '';
  if (!joinClass(code)) {
    toast('班级号不存在，请检查后重试');
    return;
  }
  location.hash = '#/student/learn';
  render();
  toast(`已加入 ${myClass() ? myClass().name : '班级'}`, 2600);
}

/* ---------------- 扫码加入班级 ---------------- */

let scanStream = null;
let scanTimer = null;
let scanRaf = null;
let scanHintTimer = null;
let jsQrPromise = null;

function openScan() {
  if (db.session.role !== 'student') return;
  ui.scanOpen = true;
  render();
  startScan();
}

function closeScan() {
  ui.scanOpen = false;
  stopScan();
  render();
}

function scanToManual() {
  ui.scanOpen = false;
  stopScan();
  location.hash = '#/student/join';
  render();
}

function stopScan() {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  if (scanHintTimer) {
    clearTimeout(scanHintTimer);
    scanHintTimer = null;
  }
  if (scanRaf) {
    cancelAnimationFrame(scanRaf);
    scanRaf = null;
  }
  if (scanStream) {
    scanStream.getTracks().forEach(track => track.stop());
    scanStream = null;
  }
}

/** 只更新提示文字，不重绘，避免摄像头反复重启 */
function setScanHint(text, isError, halt) {
  const hint = document.getElementById('scan-hint');
  if (hint) {
    hint.textContent = text;
    hint.classList.toggle('danger', !!isError);
  }
  if (halt) stopScan();
}

function startScan() {
  const video = document.getElementById('scan-video');
  if (!video) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setScanHint('当前浏览器不支持摄像头扫码，请改用班级号加入', true, true);
    return;
  }
  /* 摄像头授权长时间无响应时给出兜底提示 */
  scanHintTimer = setTimeout(() => {
    if (ui.scanOpen && !scanStream) {
      setScanHint('摄像头没有画面，请检查浏览器权限，或改用班级号加入', true, false);
    }
  }, 8000);
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then(stream => {
      if (scanHintTimer) {
        clearTimeout(scanHintTimer);
        scanHintTimer = null;
      }
      if (!ui.scanOpen) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      scanStream = stream;
      video.srcObject = stream;
      video.play().catch(() => {});
      setScanHint('正在识别二维码…');
      startDecode(video);
    })
    .catch(() => {
      if (scanHintTimer) {
        clearTimeout(scanHintTimer);
        scanHintTimer = null;
      }
      setScanHint('无法打开摄像头，请检查浏览器权限，或改用班级号加入', true, true);
    });
}

function startDecode(video) {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  if (scanRaf) {
    cancelAnimationFrame(scanRaf);
    scanRaf = null;
  }

  let detector = null;
  if ('BarcodeDetector' in window) {
    try {
      detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    } catch (err) {
      detector = null;
    }
  }

  if (detector) {
    scanTimer = setInterval(() => {
      if (!ui.scanOpen) return;
      detector.detect(video)
        .then(codes => {
          if (codes && codes.length) onScanResult(codes[0].rawValue);
        })
        .catch(() => {});
    }, 400);
    return;
  }

  loadJsQr().then(ok => {
    if (!ok) {
      setScanHint('扫码组件加载失败，请改用班级号加入', true, true);
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tick = () => {
      if (!ui.scanOpen) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const found = window.jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' });
        if (found && found.data) {
          onScanResult(found.data);
          return;
        }
      }
      scanRaf = requestAnimationFrame(tick);
    };
    scanRaf = requestAnimationFrame(tick);
  });
}

function loadJsQr() {
  if (window.jsQR) return Promise.resolve(true);
  if (jsQrPromise) return jsQrPromise;
  const sources = [
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
    'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js'
  ];
  jsQrPromise = new Promise(resolve => {
    let index = 0;
    const tryNext = () => {
      if (index >= sources.length) {
        jsQrPromise = null;
        resolve(false);
        return;
      }
      const script = document.createElement('script');
      script.src = sources[index++];
      script.onload = () => resolve(true);
      script.onerror = () => {
        script.remove();
        tryNext();
      };
      document.head.appendChild(script);
    };
    tryNext();
  });
  return jsQrPromise;
}

/** 从二维码内容里取出班级号：支持入班链接与纯班级号 */
function parseJoinCode(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const matched = raw.match(/[?&]join=([^&#]+)/i);
  if (matched) return decodeURIComponent(matched[1]).trim().toUpperCase();
  if (/^[A-Za-z]{2,8}-[A-Za-z0-9]{3,10}$/.test(raw)) return raw.toUpperCase();
  return '';
}

function onScanResult(text) {
  const code = parseJoinCode(text);
  if (!code) {
    setScanHint('没有识别到班级信息，请扫描老师提供的班级二维码', true);
    return;
  }
  if (!joinClass(code)) {
    setScanHint(`未找到班级号 ${code}，请确认二维码是否来自本课程老师`, true);
    return;
  }
  const clsName = myClass() ? myClass().name : '班级';
  stopScan();
  ui.scanOpen = false;
  location.hash = '#/student/learn';
  render();
  toast(`已加入 ${clsName}`, 2600);
}

function resetDemo() {
  resetDb();
  ui.mmScale = 1;
  location.hash = '#/login';
  render();
  toast('数据已重置');
}

/* ---------------- 课件生成 ---------------- */

const GEN_STEPS = [
  '正在读取课件文件',
  '提取章节与知识点',
  '构建知识思维导图',
  '生成课堂题目'
];

function runGeneration(fileName) {
  ui.gen = { step: 0, fileName };
  render();

  GEN_STEPS.forEach((_, index) => {
    setTimeout(() => {
      if (!ui.gen) return;
      ui.gen.step = index + 1;
      render();
    }, 650 * (index + 1));
  });

  setTimeout(() => {
    if (!ui.gen) return;
    db.courseware.fileName = fileName;
    db.courseware.uploadedAt = '11-29 09:12';
    db.courseware.status = 'done';
    ui.gen = null;
    saveDb();
    toast('AI 已根据课件生成思维导图与题目', 4000);
    render();
  }, 650 * GEN_STEPS.length + 300);
}

/* ---------------- 题目编辑与发布 ---------------- */

function openQuestionEditor(qid) {
  ui.editQuestionId = qid;
  render();
}

function closeQuestionEditor() {
  ui.editQuestionId = null;
  render();
}

function saveQuestionEditor(form) {
  const q = Q(form.qid);
  if (!q) return;
  q.stem = form.stem;
  if (q.type === 'single') {
    q.options = form.options;
    q.answer = Number(form.answer);
  }
  q.score = Number(form.score) || q.score;
  saveDb();
  ui.editQuestionId = null;
  render();
  toast('题目已保存');
}

function publishQuestion(qid, mode) {
  const existing = db.assignments.find(a => a.mode === mode);
  if (existing && existing.questionIds.includes(qid)) {
    toast(`该题已在${mode === 'quiz' ? '课堂问答' : '课后作业'}中`);
    return;
  }
  if (existing) {
    existing.questionIds.push(qid);
  } else {
    db.assignments.push({
      id: `${db.courseId}-a${db.assignments.length + 1}`,
      mode,
      title: mode === 'quiz' ? '课堂问答 · 新增题目' : '课后作业 · 新增题目',
      questionIds: [qid],
      publishedAt: '11-29 09:20',
      note: mode === 'quiz' ? '课堂内完成' : '72 小时内提交',
      dueAt: mode === 'homework' ? Date.now() + 72 * 3600 * 1000 : null
    });
  }
  saveDb();
  render();
  toast(`已发布为${mode === 'quiz' ? '课堂问答' : '课后作业'}`);
}

/* ---------------- 整卷上传与 AI 批注 ---------------- */

const EXAM_STEPS = [
  '识别试卷版面与题号',
  '切分题目并定位知识点',
  '生成逐题批注'
];

function runExamAnnotation(fileName) {
  ui.examGen = { step: 0, fileName };
  render();

  EXAM_STEPS.forEach((_, index) => {
    setTimeout(() => {
      if (!ui.examGen) return;
      ui.examGen.step = index + 1;
      render();
    }, 700 * (index + 1));
  });

  setTimeout(() => {
    if (!ui.examGen) return;
    const paper = buildUploadedExam(fileName);
    db.examPapers.unshift(paper);
    ui.examGen = null;
    ui.activeExamId = paper.id;
    saveDb();
    render();
    toast('AI 已完成整卷批注，请老师核对后发布', 3200);
  }, 700 * EXAM_STEPS.length + 300);
}

function buildUploadedExam(fileName) {
  const base = db.examPapers[0];
  const items = base.items.map((item, index) => ({
    ...clone(item),
    score: index === 0 ? item.max : Math.max(0, Math.round(item.score * 0.8))
  }));
  return {
    id: `${db.courseId}-exam-${Date.now()}`,
    classId: teacherClassId(),
    title: `${db.course.name} · 随堂测验（新上传）`,
    fileName,
    studentName: '王一',
    uploadedAt: '今天 10:26',
    status: 'pending',
    items
  };
}

function openExam(id) {
  ui.activeExamId = id;
  render();
}

/* 批量处理试卷中的客观题（选择题 + 填空题） */
function activeExam() {
  return (db.examPapers || []).find(p => p.id === ui.activeExamId) || null;
}

function batchObjective(action) {
  const paper = activeExam();
  if (!paper) return;
  if (paper.status === 'confirmed') {
    toast('该卷已确认，不能再批量批改');
    return;
  }
  const items = paper.items.filter(item => item.type !== 'short');

  if (action === 'adopt') {
    items.forEach(item => { item.score = item.aiScore !== undefined ? item.aiScore : item.score; });
    toast('已采纳 AI 对客观题的判分');
  } else if (action === 'full') {
    items.forEach(item => { item.score = item.max; });
    toast('客观题已全部设为满分');
  } else if (action === 'add') {
    const input = document.getElementById('batch-delta');
    const delta = Number(input ? input.value : 0);
    if (!delta || Number.isNaN(delta)) {
      toast('请输入要调整的分值');
      return;
    }
    items.forEach(item => {
      item.score = Math.max(0, Math.min(item.max, item.score + delta));
    });
    toast(`客观题已统一${delta > 0 ? '+' : ''}${delta} 分`);
  }

  saveDb();
  render();
}

function confirmExam() {  const paper = db.examPapers.find(p => p.id === ui.activeExamId);
  if (!paper) return;

  document.querySelectorAll('[data-exam-score]').forEach(input => {
    const item = paper.items.find(i => String(i.no) === input.dataset.examScore);
    if (!item) return;
    const value = Number(input.value);
    item.score = Math.max(0, Math.min(item.max, Number.isNaN(value) ? item.score : value));
  });
  document.querySelectorAll('[data-exam-comment]').forEach(input => {
    const item = paper.items.find(i => String(i.no) === input.dataset.examComment);
    if (!item) return;
    if (input.value.trim()) item.teacherComment = input.value.trim();
  });

  paper.status = 'confirmed';
  paper.confirmedAt = '今天 10:32';
  saveDb();
  render();
  toast('批注已确认，可投屏讲评');
}

/* ---------------- 教材例题与课后习题 ---------------- */

function toggleExerciseSelect(id) {
  const list = ui.exSelected || (ui.exSelected = []);
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
  ui.exRecommendReason = '';
  render();
}

function toggleExerciseGroup(knowledgeId) {
  const ids = db.textbook.exercises.filter(e => e.knowledgeId === knowledgeId).map(e => e.id);
  const selected = new Set(ui.exSelected || []);
  const allIn = ids.every(id => selected.has(id));
  ids.forEach(id => (allIn ? selected.delete(id) : selected.add(id)));
  ui.exSelected = [...selected];
  ui.exRecommendReason = '';
  render();
}

function toggleExerciseDifficulty(level) {
  const ids = db.textbook.exercises.filter(e => e.difficulty === level).map(e => e.id);
  const selected = new Set(ui.exSelected || []);
  const allIn = ids.every(id => selected.has(id));
  ids.forEach(id => (allIn ? selected.delete(id) : selected.add(id)));
  ui.exSelected = [...selected];
  ui.exRecommendReason = '';
  render();
}

function clearExerciseSelection() {
  ui.exSelected = [];
  ui.exRecommendReason = '';
  render();
}

/** 按本班错题分布推荐习题：优先薄弱知识点，无数据时每个知识点推荐一道基础题 */
function recommendExercises() {
  const subs = db.submissions.filter(s => s.courseId === db.courseId && s.classId === teacherClassId());
  const wrong = {};
  subs.forEach(sub => {
    Object.entries(sub.scores || {}).forEach(([qid, score]) => {
      const q = Q(qid);
      if (!q || q.type !== 'single' || score === q.score) return;
      wrong[q.knowledgeId] = (wrong[q.knowledgeId] || 0) + 1;
    });
  });

  const weakIds = Object.entries(wrong).sort((a, b) => b[1] - a[1]).map(([kid]) => kid);
  const pool = [];
  weakIds.slice(0, 3).forEach(kid => {
    db.textbook.exercises.filter(e => e.knowledgeId === kid).forEach(e => pool.push(e.id));
  });

  if (pool.length) {
    const names = weakIds.slice(0, 3).map(kid => P(kid)?.title).filter(Boolean);
    return { ids: [...new Set(pool)].slice(0, 5), reason: `本班错题集中在：${names.join('、')}` };
  }

  const seen = new Set();
  db.textbook.exercises.forEach(e => {
    if (e.difficulty !== '基础' || seen.has(e.knowledgeId)) return;
    seen.add(e.knowledgeId);
    pool.push(e.id);
  });
  return { ids: [...new Set(pool)].slice(0, 5), reason: '本班暂无错题数据，先按知识点各推荐一道基础题' };
}

function applyRecommendedExercises() {
  const result = recommendExercises();
  if (!result.ids.length) {
    toast('暂无可推荐的习题');
    return;
  }
  ui.exSelected = result.ids;
  ui.exRecommendReason = result.reason;
  render();
  toast(`${result.reason}，已勾选 ${result.ids.length} 道`, 3600);
}

function selectAllExercises() {
  const all = db.textbook.exercises.map(e => e.id);
  ui.exSelected = (ui.exSelected || []).length === all.length ? [] : all;
  ui.exRecommendReason = '';
  render();
}

function distributeExercises() {
  const ids = ui.exSelected || [];
  if (!ids.length) {
    toast('请先选择要下发的习题');
    return;
  }
  const classIds = (ui.exTargets === null
    ? [teacherClassId()]
    : ui.exTargets.filter(id => courseClassIds().includes(id)));
  if (!classIds.length) {
    toast('请选择发放班级');
    return;
  }
  classIds.forEach(classId => {
    const count = db.distributed.filter(d => d.classId === classId).length;
    db.distributed.unshift({
      id: `${db.courseId}-dist-${classId}-${Date.now()}-${count}`,
      classId,
      title: `第 ${count + 1} 组练习`,
      exerciseIds: [...ids],
      distributedAt: '今天 10:40',
      dueAt: Date.now() + 2 * 24 * 3600 * 1000
    });
  });
  ui.exSelected = [];
  ui.exRecommendReason = '';
  saveDb();
  render();
  toast(`已下发 ${ids.length} 道习题到 ${classIds.length} 个班级`);
}

/** 选择性发放：切换目标班级 */
function toggleExTarget(classId) {
  if (!courseClassIds().includes(classId)) return;
  const list = ui.exTargets === null ? [teacherClassId()] : ui.exTargets.slice();
  ui.exTargets = list.includes(classId) ? list.filter(id => id !== classId) : [...list, classId];
  render();
}

/* ---------------- 错题讲评清单 ---------------- */

function inReviewList(pointId) {
  return currentReviewList().some(item => item.pointId === pointId);
}

function currentReviewList() {
  return (db.reviewList || []).filter(item => item.courseId === db.courseId && item.classId === teacherClassId());
}

function toggleReviewPoint(pointId) {
  if (!Array.isArray(db.reviewList)) db.reviewList = [];
  const courseId = db.courseId;
  const classId = teacherClassId();
  const index = db.reviewList.findIndex(item => item.courseId === courseId && item.classId === classId && item.pointId === pointId);
  if (index >= 0) {
    db.reviewList.splice(index, 1);
    ui.reviewPointId = null;
    saveDb();
    render();
    toast('已移出讲评清单');
    return;
  }
  const row = (analyticsData().wrongPoints || []).find(item => item.id === pointId);
  if (!row) {
    toast('该知识点暂无可讲评的错题');
    return;
  }
  db.reviewList.unshift({
    courseId,
    classId,
    pointId,
    title: row.title,
    page: row.page,
    wrong: row.wrong,
    students: row.students,
    rate: row.rate,
    stems: row.stems
  });
  saveDb();
  render();
  toast('已加入下节课讲评清单', 2600);
}

function removeReviewPoint(pointId) {
  if (!Array.isArray(db.reviewList)) return;
  db.reviewList = db.reviewList.filter(item => !(item.courseId === db.courseId && item.classId === teacherClassId() && item.pointId === pointId));
  if (ui.reviewPointId === pointId) ui.reviewPointId = null;
  saveDb();
  render();
  toast('已移出讲评清单');
}

function clearReviewList() {
  db.reviewList = (db.reviewList || []).filter(item => !(item.courseId === db.courseId && item.classId === teacherClassId()));
  ui.reviewPointId = null;
  saveDb();
  render();
  toast('讲评清单已清空');
}

function openReviewPoint(pointId) {
  ui.reviewPointId = pointId;
  render();
}

function closeReviewPoint() {
  ui.reviewPointId = null;
  render();
}

function submitExercise(distId) {
  const dist = distributedOf(distId);
  if (!dist) return;
  if (myExerciseSubmission(distId)) {
    toast('本次习题已提交');
    return;
  }

  if (!ui.exerciseDraft) ui.exerciseDraft = {};
  const answers = {};
  let missing = 0;
  dist.exerciseIds.forEach(id => {
    const d = ui.exerciseDraft[id] || { text: '', images: [] };
    if (!answerHasContent(d)) missing++;
    answers[id] = { text: d.text || '', images: Array.isArray(d.images) ? d.images : [] };
  });
  if (missing) {
    toast(`还有 ${missing} 道题未作答`);
    return;
  }

  db.exerciseSubmissions.unshift({
    id: `exsub-${distId}`,
    courseId: db.courseId,
    classId: db.studentClassId,
    distId,
    studentId: 's1',
    studentName: '李同学',
    answers,
    submittedAt: '今天 10:45',
    status: 'submitted'
  });
  saveDb();
  render();
  toast('已提交，等待老师批阅');
}

/* ---------------- 学生 AI 问答（汇总给教师端） ---------------- */

/* ---------------- 学生 AI 问答：知识点匹配（打分制） ---------------- */

// 主命中阈值：达到该分数才视为"教材覆盖"；低于则诚实返回未覆盖，不再硬塞无关知识点
const AI_MATCH_THRESHOLD = 2;

// 提问中常见的无意义词，提取关键词时忽略
const AI_STOPWORDS = new Set([
  '什么', '怎么', '怎样', '如何', '为什么', '为何', '请问', '一下', '讲讲', '解释', '说明', '介绍',
  '定义', '概念', '内容', '意思', '含义', '相关', '有关', '关于', '这个', '那个', '这些', '哪些', '哪个',
  '我', '你', '他', '她', '它', '的', '了', '和', '与', '或', '吗', '呢', '啊', '吧', '呀', '求', '证明', '判断'
]);

// 把知识点标题拆成有意义的词块（≥2字）
function splitAiTitle(t) {
  return String(t || '').split(/[·、，,（）()\s\/:：]+/).filter(w => w && w.length >= 2);
}

// 从问题文本提取关键词：中文 2~8 字连续片段 + 英文单词，去停用词去重；
// 中文片段额外生成 2/3-gram 滑动窗口，避免整句（≤8字）被当成一个长词而无法命中知识点
function extractAiKeywords(text) {
  const raw = String(text || '').toLowerCase();
  const segs = raw.match(/[\u4e00-\u9fa5]{2,8}|[a-zA-Z][a-zA-Z0-9]*/g) || [];
  const out = [], seen = new Set();
  const add = s => {
    if (!s || s.length < 2 || AI_STOPWORDS.has(s) || seen.has(s)) return;
    seen.add(s); out.push(s);
  };
  for (const s of segs) {
    add(s);
    if (/[\u4e00-\u9fa5]/.test(s)) {
      for (let n = 2; n <= 3 && n < s.length; n++) {
        for (let i = 0; i + n <= s.length; i++) add(s.slice(i, i + n));
      }
    }
  }
  return out;
}

// 汇总一个知识点的可匹配内容，分域以区分权重
function pointMatchFields(point) {
  const where = sectionTitleOfPoint(point);
  return {
    title:   [point.title, ...splitAiTitle(point.title)].join(' '),
    chapter: where.chapter || '',
    section: where.section || '',
    body:    [point.summary, point.excerpt, point.example].filter(Boolean).join(' '),
    formula: (point.formulas || []).join(' '),
    param:   (point.params || []).map(p => [p.sym, p.name, p.desc].join(' ')).join(' '),
    syms:    (point.params || []).map(p => p.sym).filter(Boolean)
  };
}

/**
 * 打分匹配：返回 [{ point, score }]，按分数降序。
 * 命中维度（权重）：标题(3) > 章节/小节、摘要/原文/例题(2) > 公式/参数(1)；
 * 另加反向命中（知识点标题词出现在问题里，2）与单符号命中（如 ε、δ、∞，1）。
 */
function matchPointsByText(text) {
  const kws = extractAiKeywords(text);
  const low = String(text || '').toLowerCase();
  const rows = [];
  for (const point of db.points) {
    const f = pointMatchFields(point);
    const title = point.title || '';
    const tl = title.toLowerCase();
    const fTitle = f.title.toLowerCase();
    const fChap = f.chapter.toLowerCase();
    const fSec = f.section.toLowerCase();
    const fBody = f.body.toLowerCase();
    const fForm = f.formula.toLowerCase();
    const fParam = f.param.toLowerCase();
    let score = 0;
    for (const kw of kws) {
      if (!kw) continue;
      // 标题开头命中：最强信号 —— 知识点的核心主题就是该术语
      if (tl.startsWith(kw)) score += 6;
      if (fTitle.includes(kw)) score += 3;
      if (fSec.includes(kw)) score += 2;
      if (fBody.includes(kw)) score += 2;
      // 章节匹配较泛化，降权避免同章所有知识点得分被拉平
      if (fChap.includes(kw)) score += 1;
      if (fForm.includes(kw)) score += 1;
      if (fParam.includes(kw)) score += 1;
    }
    // 反向命中：把标题切成 2~3 字片段，出现在问题中的加分（增强"导数的定义"命中"导数"）
    for (let n = 2; n <= 3 && n <= title.length; n++) {
      for (let i = 0; i + n <= title.length; i++) {
        const w = title.slice(i, i + n).toLowerCase();
        if (AI_STOPWORDS.has(w)) continue;
        if (low.includes(w)) score += 2;
      }
    }
    for (const sym of f.syms) {
      if (sym && (text || '').includes(sym)) score += 1;
    }
    if (score > 0) rows.push({ point, score });
  }
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

// 兼容旧调用：取最高分知识点（无命中返回 null）
function matchPointByText(text) {
  const rows = matchPointsByText(text);
  return rows.length ? rows[0].point : null;
}

function aiHomeReply(text, page, pagePicked) {
  const pagePoints = page ? db.points.filter(point => point.page === Number(page)) : [];
  if (/练习题|来一道|出题|考考我/.test(text)) {
    const question = db.questions.find(q => q.type === 'single' && pagePoints.some(point => point.id === q.knowledgeId))
      || db.questions.find(q => q.type === 'single')
      || db.questions[0];
    const point = P(question.knowledgeId);
    return {
      pointId: point.id,
      page: point.page,
      grounded: true,
      skipLLM: true,
      source: {
        page: point.page,
        title: point.title,
        section: sectionTitleOfPoint(point).section,
        excerpt: point.excerpt
      },
      answer: `可以试试这道题：\n${question.stem}\n\n先自己判断，再点「给我一点提示」，不要直接看答案。\n\n${citePoint(point, true)}`
    };
  }

  const rows = matchPointsByText(text);
  const hit = rows.find(r => r.score >= AI_MATCH_THRESHOLD);
  const related = rows
    .filter(r => r.score >= AI_MATCH_THRESHOLD && (!hit || r.point.id !== hit.point.id))
    .slice(0, 2);

  // 主命中用最高分知识点；未命中时仅在「用户主动选了页」且满足弱相关/指示词条件下退化到当前页，否则诚实返回未覆盖
  const matched = !!hit;
  let point = hit ? hit.point : null;
  if (!point && pagePicked && pagePoints.length) {
    const pageBest = pagePoints
      .map(p => ({ p, s: (rows.find(r => r.point.id === p.id) || { score: 0 }).score }))
      .sort((a, b) => b.s - a.s)[0];
    const hintsThisPage = /这页|本节|本页|当前页|这一节|这一章|讲什么|讲了什么|说什么|什么内容/.test(text);
    if ((pageBest && pageBest.s > 0) || hintsThisPage) point = pageBest ? pageBest.p : pagePoints[0];
  }

  if (!point) {
    return {
      pointId: null,
      page: null,
      grounded: false,
      source: null,
      relatedPointIds: [],
      answer: `教材（${db.course.name} 当前收录章节）中没有检索到与「${text}」直接对应的知识点。\n为避免给出超出教材的说法，我不做额外发挥；建议换用教材中的术语提问，或直接向老师确认。`
    };
  }
  return {
    pointId: point.id,
    page: point.page,
    grounded: true,
    relatedPointIds: related.map(r => r.point.id),
    source: {
      page: point.page,
      title: point.title,
      section: sectionTitleOfPoint(point).section,
      excerpt: point.excerpt
    },
    answer: `${matched ? '' : `教材中没有直接出现你这句话的表述，我先按当前页「${point.title}」回答：\n\n`}${point.summary}\n\n核心结论：${point.formulas[0]}\n\n${citePoint(point, true)}`
  };
}

/* ---------------- 大模型提示词 ---------------- */

/**
 * 教材问答：把匹配到的知识点内容作为【教材片段】喂给模型，
 * 约束其严格依据教材、标注页码；history 已包含当前用户提问（含多轮上下文）。
 */
function buildTextbookMessages(history, point, page, relatedPoints) {
  const messages = [];
  if (point) {
    const where = sectionTitleOfPoint(point);
    const extras = (relatedPoints || [])
      .filter(p => p && p.id !== point.id)
      .slice(0, 2)
      .map(p => {
        const w = sectionTitleOfPoint(p);
        return `- 第 ${p.page} 页「${p.title}」（${w.section || ''}）：${p.summary || ''}`;
      });
    const extrasBlock = extras.length
      ? [`【相关补充知识点】`, ...extras, `（仅在与学生问题相关时参考，主回答以上方主知识点为准）`]
      : [];
    messages.push({
      role: 'system',
      content: [
        `你是「${db.course.name}」课程的 AI 助教，正在回答学生关于教材的提问。`,
        `你必须严格依据下面给出的【教材片段】作答，禁止引入教材之外的内容。`,
        ``,
        `【教材片段】`,
        `课程：${db.course.name}`,
        `章节：${where.chapter || ''} / 小节：${where.section || ''}`,
        `页码：第 ${point.page} 页`,
        `知识点：${point.title}`,
        point.summary ? `内容摘要：${point.summary}` : '',
        point.formulas && point.formulas.length ? `核心公式：${point.formulas.join('；')}` : '',
        point.params && point.params.length ? `符号说明：${point.params.map(p => `${p.sym} 表示${p.name}`).join('；')}` : '',
        point.excerpt ? `教材原文：${point.excerpt}` : '',
        ``,
        ...extrasBlock,
        `回答要求：`,
        `1. 用中文，先给结论再展开，分点清晰。`,
        `2. 只能依据上述教材片段（含相关补充）；如果学生的问题在这些内容中没有依据，直接说明“教材未覆盖该内容”，不要猜测或发挥。`,
        `3. 在回答中自然提及“第 ${point.page} 页「${point.title}」”，方便学生回到原文核对。`,
        `4. 不要整段复述教材原文，页面会单独展示原文卡片。`
      ].filter(Boolean).join('\n')
    });
  } else {
    messages.push({
      role: 'system',
      content: `你是「${db.course.name}」课程的 AI 助教。当前选中的教材页（第 ${page || '?'} 页）没有匹配到相关知识点。如果学生的问题不在教材范围内，请直接说明“教材未覆盖该内容”，不要额外发挥。用中文简洁回答。`
    });
  }
  (history || []).forEach(m => {
    if (!m || m.pending) return;
    if (m.role === 'user') messages.push({ role: 'user', content: m.text });
    else if (m.role === 'ai') messages.push({ role: 'assistant', content: m.text });
  });
  return messages;
}

/**
 * 作业题追问：把题目 + 关联教材内容喂给模型，引导思路、不直接给答案；
 * history 已包含当前追问（含多轮上下文）。
 */
function buildTutorMessages(history, q) {
  const point = q ? P(q.knowledgeId) : null;
  const messages = [];
  if (q && point) {
    const where = sectionTitleOfPoint(point);
    const opts = q.options ? q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n') : '';
    messages.push({
      role: 'system',
      content: [
        `你是「${db.course.name}」课程的 AI 助教，正在辅导学生解一道作业题。`,
        ``,
        `【题目】`,
        q.stem,
        opts ? `选项：\n${opts}` : '',
        q.type === 'single' ? `（这是单选题，正确选项是 ${String.fromCharCode(65 + q.answer)}；学生未提交前不要直接透露答案）` : '',
        ``,
        `【关联教材】`,
        `知识点：${point.title}（第 ${point.page} 页，${where.section || ''}）`,
        point.summary ? `摘要：${point.summary}` : '',
        point.formulas && point.formulas.length ? `公式：${point.formulas.join('；')}` : '',
        point.excerpt ? `教材原文：${point.excerpt}` : '',
        ``,
        `回答要求：`,
        `1. 用中文，像老师一样引导思路，不要直接给出最终答案（除非学生明确表示已提交、想看解析）。`,
        `2. 严格依据题目和上述教材内容，不超纲发挥。`,
        `3. 在回答中提及“第 ${point.page} 页”，帮助学生回看原文。`,
        `4. 简洁，每次回复聚焦一步。`
      ].filter(Boolean).join('\n')
    });
  } else {
    messages.push({ role: 'system', content: '你是课程 AI 助教，辅导学生解题，引导思路、不直接给答案，依据课件内容作答，用中文简洁回复。' });
  }
  (history || []).forEach(c => {
    if (!c || c.pending) return;
    if (c.role === 'me' || c.role === 'user') messages.push({ role: 'user', content: c.text });
    else if (c.role === 'ai') messages.push({ role: 'assistant', content: c.text });
  });
  return messages;
}

/** 滚动聊天区域到底部（兼容 AI 问答页与答疑抽屉） */
function scrollChatBottom() {
  document.querySelectorAll('.chat-body, .drawer .chat').forEach(el => { el.scrollTop = el.scrollHeight; });
}

/** 当前提问关联的教材页：优先所选小节，其次手动选择，最后第一页 */
function aiSectionChoices() {
  return sectionsWithPages().flatMap(group => group.sections.map(item => ({ chapter: group.chapter, ...item })));
}

function aiCurrentPage() {
  const flat = aiSectionChoices();
  if (!flat.length) return null;
  if (ui.aiSection) {
    const section = flat.find(item => item.section.id === ui.aiSection);
    if (section && section.pages.length) {
      const wanted = Number(ui.aiPage);
      return section.pages.includes(wanted) ? wanted : section.pages[0];
    }
  }
  const pages = coursewarePages();
  const wanted = Number(ui.aiPage || ui.pptPage);
  return pages.some(item => item.page === wanted) ? wanted : pages[0].page;
}

function setAiPage(page) {
  const value = Number(page) || null;
  ui.aiPage = value;
  ui.aiPagePicked = true;
  const section = aiSectionChoices().find(item => item.pages.includes(value));
  if (section) ui.aiSection = section.section.id;
  render();
}

function setAiSection(sectionId) {
  const section = aiSectionChoices().find(item => item.section.id === sectionId);
  if (!section) return;
  ui.aiSection = sectionId;
  ui.aiPage = section.pages[0] || null;
  ui.aiPagePicked = true;
  render();
}

function setAiChapter(chapterId) {
  const group = sectionsWithPages().find(item => item.chapter.id === chapterId);
  if (!group || !group.sections.length) return;
  setAiSection(group.sections[0].section.id);
}

async function askAiHome(text) {
  const question = String(text || '').trim();
  if (!question) {
    toast('先输入你的问题');
    return false;
  }
  const page = aiCurrentPage();
  const reply = aiHomeReply(question, page, !!ui.aiPagePicked); // 复用现有匹配逻辑：拿到知识点/页码/原文/兜底回答

  ui.aiHomeChat.push({ role: 'user', text: question });
  const pendingMsg = {
    role: 'ai', text: '', pending: true,
    pointId: reply.pointId, page: reply.page,
    grounded: reply.grounded, source: reply.source
  };
  ui.aiHomeChat.push(pendingMsg);
  render();
  scrollChatBottom();

  /* 默认用本地回答兜底；配置了大模型且非固定出题意图时，调用真实模型 */
  let answerText = reply.answer;
  let usedLLM = false;
  if (llmReady() && !reply.skipLLM) {
    const point = reply.pointId ? P(reply.pointId) : null;
    const relatedPoints = (reply.relatedPointIds || []).map(P).filter(Boolean);
    const messages = buildTextbookMessages(ui.aiHomeChat, point, page, relatedPoints);
    const res = await callLLM({ messages, temperature: 0.5, maxTokens: 900 });
    if (res.ok && res.text.trim()) {
      answerText = res.text.trim();
      usedLLM = true;
    }
  }

  pendingMsg.text = answerText;
  pendingMsg.pending = false;
  pendingMsg.usedLLM = usedLLM;

  db.aiQuestions.unshift({
    id: `aiq-${Date.now()}`,
    courseId: db.courseId,
    classId: db.studentClassId,
    studentId: 's1',
    studentName: '李同学',
    question,
    answer: answerText,
    knowledgeId: reply.pointId,
    createdAt: '今天 10:5' + (new Date().getMinutes() % 10),
    reviewed: false
  });
  saveDb();
  render();
  scrollChatBottom();
  return true;
}

function sendAiHome() {
  const input = document.getElementById('ai-home-input');
  if (!input) return;
  if (askAiHome(input.value)) input.value = '';
}

function openAiQuestion(id) {
  ui.activeAiQuestionId = id;
  render();
}

function toggleAiReviewed(id) {
  const item = (db.aiQuestions || []).find(q => q.id === id);
  if (!item) return;
  item.reviewed = !item.reviewed;
  saveDb();
  render();
  toast(item.reviewed ? '已标记为已讲评' : '已改回待讲评');
}

/* ---------------- 学生作答 ---------------- */

/** 课堂问答草稿：持久化到 db，刷新/切页不丢，到点自动判分才有意义 */
let quizDraftTimer = null;

function persistQuizDraftNow() {
  if (quizDraftTimer) { clearTimeout(quizDraftTimer); quizDraftTimer = null; }
  const aid = ui.draftAssignmentId;
  if (!aid) return;
  const a = A(aid);
  if (!a || a.mode !== 'quiz' || mySubmission(aid)) return;
  if (!db.quizDrafts) db.quizDrafts = {};
  db.quizDrafts[aid] = JSON.parse(JSON.stringify(ui.draft || {}));
  saveDb();
}

function schedulePersistQuizDraft() {
  const aid = ui.draftAssignmentId;
  if (!aid) return;
  if (quizDraftTimer) clearTimeout(quizDraftTimer);
  quizDraftTimer = setTimeout(persistQuizDraftNow, 400);
}

/** 当前作业的作答草稿：优先内存，其次已持久化的课堂草稿 */
function draftFor(assignmentId) {
  if (ui.draftAssignmentId === assignmentId) return ui.draft || {};
  const saved = db.quizDrafts && db.quizDrafts[assignmentId];
  return saved || ui.draft || {};
}

/** 进入某份作业页时恢复草稿；课堂问答首次进入即开始计时（刷新不重置） */
function ensureAssignmentDraft(assignmentId) {
  if (ui.draftAssignmentId === assignmentId) return;
  const a = A(assignmentId);
  if (!a) return;
  const saved = a.mode === 'quiz' ? (db.quizDrafts && db.quizDrafts[assignmentId]) : null;
  ui.draft = saved ? JSON.parse(JSON.stringify(saved)) : {};
  a.questionIds.forEach(qid => {
    const q = Q(qid);
    if (q && q.type === 'short' && ui.draft[qid] === undefined) ui.draft[qid] = '';
  });
  ui.draftAssignmentId = assignmentId;
  if (a.mode === 'quiz' && a.duration && !mySubmission(assignmentId)) {
    if (!db.quizStart) db.quizStart = {};
    if (!db.quizStart[assignmentId]) { db.quizStart[assignmentId] = Date.now(); saveDb(); }
  }
}

function selectOption(qid, index) {
  const cur = ui.draft[qid];
  ui.draft[qid] = (cur && typeof cur === 'object')
    ? { text: String(index), images: cur.images || [] }
    : { text: String(index), images: [] };
  schedulePersistQuizDraft();
  render();
}

function setShortAnswer(qid, value) {
  const cur = ui.draft[qid];
  ui.draft[qid] = (cur && typeof cur === 'object') ? { text: value, images: cur.images || [] } : { text: value, images: [] };
  schedulePersistQuizDraft();
}

/* ---------------- 照片作答 ---------------- */

/** 压缩图片为 dataURL：最长边 1000px、JPEG 0.72，避免撑爆本地存储 */
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        let width = img.width, height = img.height;
        if (width > max || height > max) {
          if (width >= height) { height = Math.round(height * max / width); width = max; }
          else { width = Math.round(width * max / height); height = max; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try { resolve(canvas.toDataURL('image/jpeg', 0.72)); }
        catch (e) { reject(e); }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 取某题作答状态引用（统一升级为 { text, images } 对象） */
function answerStateRef(kind, qid) {
  if (kind === 'draft') {
    const cur = ui.draft[qid];
    if (!cur || typeof cur !== 'object') ui.draft[qid] = { text: cur == null ? '' : String(cur), images: [] };
    return ui.draft[qid];
  }
  if (kind === 'redo') {
    if (!ui.redo) return null;
    const cur = ui.redo.answers[qid];
    if (!cur || typeof cur !== 'object') ui.redo.answers[qid] = { text: cur == null ? '' : String(cur), images: [] };
    return ui.redo.answers[qid];
  }
  if (kind === 'exercise') {
    if (!ui.exerciseDraft) ui.exerciseDraft = {};
    const cur = ui.exerciseDraft[qid];
    if (!cur || typeof cur !== 'object') ui.exerciseDraft[qid] = { text: cur == null ? '' : String(cur), images: [] };
    return ui.exerciseDraft[qid];
  }
  if (kind === 'practice') {
    if (!ui.practice) return null;
    if (!ui.practice.answers) ui.practice.answers = {};
    const cur = ui.practice.answers[qid];
    if (!cur || typeof cur !== 'object') ui.practice.answers[qid] = { text: cur == null ? '' : String(cur), images: [] };
    return ui.practice.answers[qid];
  }
  return null;
}

async function handleAnswerFiles(fileList, kind, qid) {
  const ref = answerStateRef(kind, qid);
  if (!ref) return;
  const files = Array.from(fileList || []).filter(f => f && f.type && f.type.startsWith('image/'));
  if (!files.length) return;
  if (ref.images.length >= MAX_ANSWER_IMAGES) { toast(`每题最多上传 ${MAX_ANSWER_IMAGES} 张图片`); return; }
  for (const f of files) {
    if (ref.images.length >= MAX_ANSWER_IMAGES) { toast(`每题最多上传 ${MAX_ANSWER_IMAGES} 张图片`); break; }
    try { ref.images.push(await compressImageFile(f)); }
    catch (e) { toast('图片读取失败，请重试'); }
  }
  if (kind === 'draft') persistQuizDraftNow();
  render();
}

function removeAnswerImage(kind, qid, idx) {
  const ref = answerStateRef(kind, qid);
  if (!ref || !Array.isArray(ref.images)) return;
  ref.images.splice(Number(idx), 1);
  if (kind === 'draft') persistQuizDraftNow();
  render();
}

function openPreviewImage(src) { ui.previewImage = src || null; render(); }
function closePreviewImage() { ui.previewImage = null; render(); }

/* ---------------- 大模型判分 ---------------- */

function nowStamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 从模型返回文本中提取第一个 JSON 对象 */
function extractJsonObject(s) {
  if (typeof s !== 'string') return null;
  const i = s.indexOf('{');
  const j = s.lastIndexOf('}');
  if (i < 0 || j < i) return null;
  try { return JSON.parse(s.slice(i, j + 1)); } catch (e) { return null; }
}

/** 本地回退评分：无模型 / 模型失败时使用，保持与原逻辑一致 */
function localGradeShort(q, text, images) {
  const point = P(q.knowledgeId);
  const hasImg = Array.isArray(images) && images.length;
  let review;
  if (!String(text || '').trim() && hasImg) {
    review = {
      score: Math.round(q.score * 0.4),
      comment: `已提交 ${images.length} 张作答图片，AI 暂不评阅图片内容，请教师查阅图片后给出最终评分。${citePoint(point)}`
    };
  } else {
    review = mockAi.gradeShortAnswer(q, text || '');
    if (hasImg) review = { ...review, comment: `${review.comment}\n（另附 ${images.length} 张作答图片，教师可查阅）` };
  }
  return { score: review.score, comment: review.comment, steps: review.steps || [], usedLLM: false, usedVision: false };
}

/* ---------------- 手写公式识别（LaTeX）+ 逐步比对 ---------------- */

/**
 * 第一步：视觉模型把手写作答逐行转录为 LaTeX，只识别、不判分。
 * @returns {Promise<{ok:boolean, latex?:{steps:Array<{latex:string,note:string}>, finalAnswer:string, confidence:number}, reason?:string}>}
 */
async function recognizeLatexFromImages(images, q) {
  const hasImg = Array.isArray(images) && images.length;
  if (!hasImg || !llmVisionReady()) return { ok: false, reason: 'no-vision' };
  const systemPrompt = `你是数学与物理手写公式识别引擎。请把图片中的学生手写解答逐行转录为 LaTeX。
【题目】${q ? q.stem : ''}
【要求】
1. 只做识别与转录，严禁计算、评判，也不要补全学生没有写的内容。
2. 按书写顺序逐行输出，每行一个公式或推导步骤。
3. 上标 ^、下标 _、分式 \\frac{}{}、根号 \\sqrt{}、积分 \\int、极限 \\lim_{...}、求和 \\sum、希腊字母 \\alpha 等。
4. 无法辨认的符号用 \\square 占位，不要臆造。
5. note 用不超过 12 个字说明这一行在做什么（如“代入求导公式”）。
【输出】只返回严格 JSON，不要任何多余文字：
{"steps":[{"latex":"...","note":"..."}],"finalAnswer":"学生最终答案的 LaTeX，未写则留空","confidence":0到1之间的小数}`;
  const content = [{ type: 'text', text: '请逐行转录图片中的手写解答为 LaTeX，并按约定返回 JSON。' }];
  images.forEach(img => content.push({ type: 'image_url', image_url: { url: img } }));

  let res;
  try {
    res = await callLLM({
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content }],
      useVision: true, temperature: 0.1, maxTokens: 900
    });
  } catch (e) { return { ok: false, reason: 'network' }; }
  if (!res.ok) return { ok: false, reason: res.reason, error: res.error };

  const obj = extractJsonObject(res.text);
  if (!obj || !Array.isArray(obj.steps)) return { ok: false, reason: 'bad-format' };
  const steps = obj.steps
    .map(s => ({ latex: String((s && s.latex) || '').trim(), note: String((s && s.note) || '').trim() }))
    .filter(s => s.latex)
    .slice(0, 12);
  if (!steps.length) return { ok: false, reason: 'empty' };
  return {
    ok: true,
    latex: {
      steps,
      finalAnswer: String(obj.finalAnswer || '').trim(),
      confidence: Math.max(0, Math.min(1, Number(obj.confidence) || 0))
    }
  };
}

/**
 * 第二步：文本模型把识别出的 LaTeX 步骤与标准答案逐步比对并给出分数。
 * @returns {Promise<{ok:boolean, score?:number, comment?:string, steps?:Array<{student:string,expected:string,verdict:string,note:string}>, reason?:string}>}
 */
async function compareStepsWithReference(q, latex, text) {
  if (!llmReady()) return { ok: false, reason: 'not-configured' };
  const refText = q.reference || '';
  const kwText = Array.isArray(q.keywords) && q.keywords.length ? `关键词：${q.keywords.join('、')}` : '';
  const studentSteps = ((latex && latex.steps) || [])
    .map((s, i) => `${i + 1}. ${s.latex}${s.note ? `（${s.note}）` : ''}`).join('\n') || '（无）';
  const systemPrompt = `你是严谨的数学/物理阅卷助教，擅长逐步比对解题过程。
【满分】${q.score} 分
【题目】${q.stem}
【标准答案/要点】${refText}${kwText ? '\n' + kwText : ''}
【学生手写步骤（已识别为 LaTeX）】
${studentSteps}
【学生文字补充】${String(text || '').trim() || '（空）'}
【任务】
1. 逐步比对：学生第 i 步对应标准解法的哪一步，判定为 match（数学等价）、partial（部分正确/写法不完整）、wrong（错误）、missing（缺失关键步骤）。
2. 依据步骤完成度与最终结果给分，满分 ${q.score} 分，给整数。
3. 评语具体指出错在哪一步、缺了哪一步，不超过 120 字。
【输出】只返回严格 JSON：
{"score":0到${q.score}的整数,"comment":"...","steps":[{"student":"学生该步（LaTeX 或简述）","expected":"对应标准步骤","verdict":"match|partial|wrong|missing","note":"差异说明，≤20字"}]}`;

  let res;
  try {
    res = await callLLM({
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: '请按要求逐步比对并返回 JSON。' }],
      temperature: 0.2, maxTokens: 900
    });
  } catch (e) { return { ok: false, reason: 'network' }; }
  if (!res.ok) return { ok: false, reason: res.reason, error: res.error };

  const obj = extractJsonObject(res.text);
  if (!obj) return { ok: false, reason: 'bad-format' };
  let score = Number(obj.score);
  if (!Number.isFinite(score)) return { ok: false, reason: 'bad-score' };
  score = Math.max(0, Math.min(q.score, Math.round(score)));
  const verdicts = ['match', 'partial', 'wrong', 'missing'];
  const steps = Array.isArray(obj.steps) ? obj.steps.map(s => ({
    student: String((s && s.student) || '').trim(),
    expected: String((s && s.expected) || '').trim(),
    verdict: verdicts.includes(s && s.verdict) ? s.verdict : 'partial',
    note: String((s && s.note) || '').trim()
  })).slice(0, 12) : [];
  return { ok: true, score, comment: String(obj.comment || '').trim().slice(0, 300), steps };
}

/**
 * 真实大模型主观题判分；有照片且配置了视觉模型时走「LaTeX 识别 + 逐步比对」两阶段，
 * 任一阶段失败则回退到通用视觉判分或本地评分。
 * 始终返回 { score, comment, steps, usedLLM, usedVision, latex?, stepCompare? }。
 */
async function gradeShortAnswerLLM(q, text, images) {
  if (!Number.isFinite(q.score)) q.score = q.type === 'single' ? 5 : 10;
  const point = P(q.knowledgeId);
  const hasImg = Array.isArray(images) && images.length;
  const local = () => localGradeShort(q, text, images);

  if (!llmReady() && !(hasImg && llmVisionReady())) return local();

  /* 数理简答题杀手锏：照片 → LaTeX 识别 → 与标准解答逐步比对 */
  if (hasImg && llmVisionReady()) {
    const rec = await recognizeLatexFromImages(images, q);
    if (rec.ok) {
      const cmp = await compareStepsWithReference(q, rec.latex, text);
      if (cmp.ok) {
        return {
          score: cmp.score,
          comment: cmp.comment || '',
          steps: [],
          usedLLM: true,
          usedVision: true,
          latex: rec.latex,
          stepCompare: cmp.steps
        };
      }
      /* 第二步失败：把识别出的 LaTeX 并入文本，走通用视觉判分兜底 */
      const recognized = rec.latex.steps.map(s => s.latex).join('\n');
      const base = String(text || '').trim();
      text = `${base}${base ? '\n' : ''}[手写识别 LaTeX]\n${recognized}`;
    }
  }

  const refText = q.reference || '';
  const kwText = Array.isArray(q.keywords) && q.keywords.length ? `关键词：${q.keywords.join('、')}` : '';
  const systemPrompt = `你是严谨的课程助教。请对学生的主观题作答评分并给出简短评语。
【满分】${q.score} 分
【题目】${q.stem}
【标准答案/要点】${refText}${kwText ? '\n' + kwText : ''}
【关联教材】${citePoint(point)}
【任务】先阅读学生作答（若提供了图片，请先识别图片中的手写内容，再结合文本框内容综合判断），再依据标准答案要点给分。
【输出】只返回严格 JSON，不要任何多余文字：{"score":0到${q.score}的整数,"comment":"不超过120字的评语","steps":["分步解析要点"]}`;

  const userText = `学生文本框作答：${String(text || '').trim() || '（空）'}`;
  let messages, useVision = false;
  if (hasImg && llmVisionReady()) {
    useVision = true;
    const content = [{ type: 'text', text: userText + '\n以下是学生上传的作答图片，请识别其中的手写内容并结合文本评分：' }];
    images.forEach(img => content.push({ type: 'image_url', image_url: { url: img } }));
    messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content }];
  } else if (llmReady()) {
    const tail = hasImg ? `\n（学生另附 ${images.length} 张作答图片，但当前未配置视觉模型，无法识别图片，请基于文本评分并提醒教师查阅图片。）` : '';
    messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: userText + tail }];
  } else {
    return local();
  }

  let res;
  try {
    res = await callLLM({ messages, useVision, temperature: 0.3, maxTokens: 700 });
  } catch (e) {
    toast('AI 判分失败，已用本地评分');
    return local();
  }
  if (!res.ok) {
    if (res.reason !== 'not-configured') toast('AI 判分暂不可用，已用本地评分');
    return local();
  }
  const obj = extractJsonObject(res.text);
  if (!obj) { toast('AI 返回格式异常，已用本地评分'); return local(); }
  let score = Number(obj.score);
  if (!Number.isFinite(score)) { toast('AI 分数异常，已用本地评分'); return local(); }
  score = Math.max(0, Math.min(q.score, Math.round(score)));
  const comment = String(obj.comment || '').trim().slice(0, 300) || local().comment;
  const steps = Array.isArray(obj.steps) ? obj.steps.map(String).slice(0, 8) : [];
  return { score, comment, steps, usedLLM: true, usedVision: useVision };
}

/* ---------------- 自主练习（真题库抽题 + AI 现场出题） ---------------- */

function firstPracticePoint(courseId) {
  const eq = db.courses[courseId] && db.courses[courseId].examQuestions;
  return (eq && eq[0] && eq[0].knowledgeId) || (db.points[0] && db.points[0].id) || '';
}

/** 从模型返回中提取题目 JSON 数组（兼容 [...] 与 {"questions":[...]}） */
function parseQuestionArray(text) {
  if (typeof text !== 'string') return [];
  const obj = extractJsonObject(text);
  if (obj && Array.isArray(obj.questions)) return obj.questions;
  const i = text.indexOf('[');
  const j = text.lastIndexOf(']');
  if (i >= 0 && j > i) {
    try { const a = JSON.parse(text.slice(i, j + 1)); return Array.isArray(a) ? a : []; } catch (e) { /* ignore */ }
  }
  return [];
}

function normalizeAiQuestion(raw, idx, courseId, pointId, difficulty) {
  if (!raw || typeof raw !== 'object') return null;
  const type = raw.type === 'short' ? 'short' : 'single';
  const stem = String(raw.stem || '').trim();
  if (!stem) return null;
  const q = {
    id: `ai-${Date.now()}-${idx}`,
    type, stem,
    source: 'AI生成',
    difficulty: difficulty || raw.difficulty || '基础',
    knowledgeId: pointId || firstPracticePoint(courseId)
  };
  if (type === 'single') {
    const options = Array.isArray(raw.options) ? raw.options.map(o => String(o).trim()).filter(Boolean) : [];
    if (options.length < 2) return null;
    let ans = Number(raw.answer);
    if (!Number.isInteger(ans) || ans < 0 || ans >= options.length) return null;
    q.options = options.slice(0, 6);
    q.answer = ans;
    q.score = Math.max(1, Math.min(30, Math.round(Number(raw.score) || 5)));
    q.reference = '';
    q.keywords = [];
  } else {
    const ref = String(raw.reference != null ? raw.reference : raw.answer).trim();
    if (!ref) return null;
    q.options = [];
    q.answer = null;
    q.reference = ref;
    q.keywords = Array.isArray(raw.keywords) ? raw.keywords.map(k => String(k).trim()).filter(Boolean).slice(0, 8) : [];
    q.score = Math.max(1, Math.min(30, Math.round(Number(raw.score) || 10)));
  }
  return q;
}

async function generateAiQuestions(courseId, pointId, difficulty, count) {
  if (!llmReady()) return { ok: false, reason: 'not-configured' };
  const n = Math.max(1, Math.min(5, Number(count) || 3));
  const course = db.courses[courseId] && db.courses[courseId].course;
  const point = pointId ? P(pointId) : null;
  const diff = difficulty || '基础';
  const system = `你是高校「${course && course.name ? course.name : ''}」课程的命题专家。请严格只输出一个 JSON 数组，不要输出任何解释、代码块标记或多余文字。数组每个元素结构如下：
{"type":"single 或 short","stem":"题干文本","options":["选项A","选项B","选项C","选项D"],"answer":单选填正确选项的索引整数(从0开始)，简答填标准答案要点字符串,"score":单选5或简答10,"keywords":["得分关键词1","得分关键词2"],"reference":"简答题的标准答案与要点，单选填空字符串"}`;
  const user = `请生成 ${n} 道${diff}难度的练习题${point ? `，围绕知识点「${point.title}」（课件第 ${point.page} 页）` : '，覆盖本课程核心知识点'}。单选与简答均可，题干要清晰可判分。只返回 JSON 数组。`;
  let res;
  try {
    res = await callLLM({ messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.7, maxTokens: 1500 });
  } catch (e) {
    return { ok: false, reason: 'error', error: String(e) };
  }
  if (!res.ok) return { ok: false, reason: res.reason, error: res.error };
  const arr = parseQuestionArray(res.text);
  const questions = [];
  arr.forEach((raw, idx) => {
    const q = normalizeAiQuestion(raw, idx, courseId, pointId, diff);
    if (q) questions.push(q);
  });
  return { ok: true, questions };
}

function startPracticePaper(questions, courseId) {
  const list = (questions || []).filter(Boolean);
  if (!list.length) { toast('没有可用的题目，请调整筛选条件'); return; }
  const answers = {};
  list.forEach(q => { answers[q.id] = { text: '', images: [] }; });
  ui.practice = { courseId, questions: list, answers, result: null, at: Date.now() };
  location.hash = '#/student/practice-play';
  render();
}

function buildPracticeExam() {
  const courseId = ui.practiceCourse || 'math';
  const qs = sampleExamQuestions(courseId, {
    pointId: ui.practicePoint || '',
    difficulty: ui.practiceDifficulty || '',
    count: ui.practiceCount || 5
  });
  startPracticePaper(qs, courseId);
}

async function buildPracticeAi() {
  if (!llmReady()) { toast('请先在右上角「模型」中配置可用的大模型'); render(); return; }
  const courseId = ui.practiceCourse || 'math';
  ui.practiceGenLoading = true;
  render();
  const res = await generateAiQuestions(courseId, ui.practicePoint || '', ui.practiceDifficulty || '', ui.practiceCount || 5);
  ui.practiceGenLoading = false;
  if (!res.ok) { toast('AI 出题失败，请稍后重试或检查模型配置'); render(); return; }
  if (!res.questions.length) { toast('AI 未返回有效题目，请重试'); render(); return; }
  startPracticePaper(res.questions, courseId);
}

function setPracticeOption(qid, index) {
  const ref = answerStateRef('practice', qid);
  if (!ref) return;
  ref.text = String(index);
  render();
}

function setPracticeShort(qid, value) {
  const ref = answerStateRef('practice', qid);
  if (!ref) return;
  ref.text = value;
}

async function submitPractice() {
  const paper = ui.practice;
  if (!paper || paper.result) return;
  const items = [];
  for (const q of paper.questions) {
    const value = paper.answers[q.id] || { text: '', images: [] };
    let score, review = null;
    if (q.type === 'single') {
      const t = answerText(value).trim();
      score = (t !== '' && Number(t) === q.answer) ? q.score : 0;
    } else {
      review = await gradeShortAnswerLLM(q, answerText(value), answerImages(value));
      score = review.score;
    }
    items.push({ qid: q.id, score, max: q.score, answer: value, review });
  }
  const total = items.reduce((s, it) => s + it.score, 0);
  const max = items.reduce((s, it) => s + it.max, 0);
  paper.result = { total, max, items };
  if (!Array.isArray(db.practiceRecords)) db.practiceRecords = [];
  db.practiceRecords.unshift({
    id: `pr-${Date.now()}`,
    courseId: paper.courseId,
    studentId: db.session.userId || 's1',
    studentName: STUDENT_ACCOUNT.name,
    at: nowStamp(),
    total, max,
    questions: JSON.parse(JSON.stringify(paper.questions)),
    items
  });
  saveDb();
  render();
  toast(`练习完成，得分 ${total} / ${max}`);
}

function openPracticeRecord(id) {
  const rec = (db.practiceRecords || []).find(r => r.id === id);
  if (!rec) return;
  const answers = {};
  (rec.items || []).forEach(it => { answers[it.qid] = it.answer || { text: '', images: [] }; });
  ui.practice = {
    courseId: rec.courseId,
    questions: JSON.parse(JSON.stringify(rec.questions || [])),
    answers,
    result: { total: rec.total, max: rec.max, items: rec.items },
    at: rec.at,
    historyId: rec.id
  };
  location.hash = '#/student/practice-play';
  render();
}

function exitPractice() {
  ui.practice = null;
  location.hash = '#/student/practice-self';
  render();
}

function startAssignment(id) {
  const assignment = A(id);
  if (!assignment) return;
  if (isExpired(assignment) && !mySubmission(id)) {
    toast('本次作业已截止，无法开始作答');
    return;
  }
  /* 课堂问答：首次开始时记录起始时刻，刷新不重置，到点自动交卷 */
  ensureAssignmentDraft(id);
  ui.activeQuestionId = assignment.questionIds[0];
  location.hash = `#/student/practice/${id}`;
  render();
}

/** 提交互斥：页面倒计时与全局看门狗可能同时到达归零点，避免重复交卷 */
const submitLocks = {};

async function submitAssignment(assignmentId, opts) {
  const assignment = A(assignmentId);
  if (!assignment) return;
  const auto = !!(opts && opts.auto);

  if (isExpired(assignment)) {
    toast('本次作业已截止，无法提交');
    return;
  }
  if (submitLocks[assignmentId]) return;
  submitLocks[assignmentId] = true;

  try {
    const draft = draftFor(assignmentId);
    const missing = assignment.questionIds.filter(qid => !answerHasContent(draft[qid]));
    if (!auto && missing.length) {
      toast(`还有 ${missing.length} 道题未作答`);
      return;
    }
    if (mySubmission(assignmentId)) {
      toast('本次任务已提交');
      return;
    }

    const answers = {};
    const scores = {};
    const aiReviews = {};
    let total = 0;

    for (const qid of assignment.questionIds) {
      const q = Q(qid);
      const value = draft[qid];
      answers[qid] = value;
      if (!q) { scores[qid] = 0; continue; }
      if (q.type === 'single') {
        const t = answerText(value).trim();
        const got = (t !== '' && Number(t) === q.answer) ? q.score : 0;
        scores[qid] = got;
        total += got;
        const imgs = answerImages(value);
        if (imgs.length) aiReviews[qid] = { score: got, comment: `附 ${imgs.length} 张解题过程照片，仅供教师参考，不影响客观题判分。`, usedLLM: false };
      } else {
        const review = await gradeShortAnswerLLM(q, answerText(value), answerImages(value));
        scores[qid] = review.score;
        aiReviews[qid] = review;
        total += review.score;
      }
    }

    if (mySubmission(assignmentId)) { saveDb(); render(); return; }

    const hasShort = assignment.questionIds.some(qid => { const q = Q(qid); return q && q.type === 'short'; });

    db.submissions.unshift({
      id: `sub-own-${assignmentId}`,
      courseId: db.courseId,
      classId: db.studentClassId,
      assignmentId,
      studentId: 's1',
      studentName: '李同学',
      answers,
      scores,
      aiReviews,
      total,
      max: totalScore(assignment.questionIds),
      status: hasShort ? 'ai_reviewed' : 'auto',
      submittedAt: nowStamp()
    });

    /* 提交后清除限时开始记录与草稿，停止倒计时 */
    if (db.quizStart && assignmentId in db.quizStart) delete db.quizStart[assignmentId];
    if (db.quizDrafts && assignmentId in db.quizDrafts) delete db.quizDrafts[assignmentId];
    if (ui.draftAssignmentId === assignmentId) { ui.draftAssignmentId = null; ui.draft = {}; }

    saveDb();
    render();
    toast(auto ? '⏱ 时间到，已自动交卷并判分' : '已提交，AI 已完成初评');
  } finally {
    delete submitLocks[assignmentId];
  }
}

/* ---------------- 教师复核 ---------------- */

function prepareReviewDraft(sub) {
  const shortQ = db.questions.find(q => q.type === 'short');
  const shortId = shortQ ? shortQ.id : null;
  const pointScore = shortId && sub.scores[shortId] !== undefined ? sub.scores[shortId] : 0;
  ui.reviewDraft = {
    score: sub.teacherReview ? sub.teacherReview.score : pointScore,
    comment: sub.teacherReview ? sub.teacherReview.comment : (shortId && sub.aiReviews?.[shortId]?.comment) || ''
  };
}

function openReview(subId) {
  const sub = submissionOf(subId);
  if (!sub) return;
  ui.activeSubmissionId = subId;
  prepareReviewDraft(sub);
  render();
}

function quickScore(kind) {
  const sub = submissionOf(ui.activeSubmissionId);
  const shortQ = db.questions.find(q => q.type === 'short');
  if (!sub || !shortQ || !ui.reviewDraft) return;

  const scoreInput = document.getElementById('review-score');
  const commentInput = document.getElementById('review-comment');
  if (scoreInput) ui.reviewDraft.score = scoreInput.value;
  if (commentInput) ui.reviewDraft.comment = commentInput.value;

  const generated = sub.aiReviews?.[shortQ.id];
  if (kind === 'ai') ui.reviewDraft.score = generated ? generated.score : 0;
  else if (kind === 'max') ui.reviewDraft.score = shortQ.score;
  else ui.reviewDraft.score = 0;

  render();
}

function quickComment(text) {
  if (!ui.reviewDraft) return;
  const scoreInput = document.getElementById('review-score');
  const commentInput = document.getElementById('review-comment');
  if (scoreInput) ui.reviewDraft.score = scoreInput.value;

  const base = commentInput ? commentInput.value.trim() : (ui.reviewDraft.comment || '');
  ui.reviewDraft.comment = base ? `${base}\n${text}` : text;
  render();
}

function batchAdoptReviews() {
  const homework = db.assignments.find(a => a.mode === 'homework');
  if (!homework) return;
  const shortQ = db.questions.find(q => q.type === 'short');
  const pending = db.submissions.filter(s => s.assignmentId === homework.id && s.status !== 'reviewed');
  if (!pending.length) {
    toast('没有待复核的提交');
    return;
  }

  pending.forEach(sub => {
    const review = shortQ ? sub.aiReviews?.[shortQ.id] : null;
    if (shortQ && review) {
      sub.scores[shortQ.id] = review.score;
      sub.teacherReview = {
        score: review.score,
        comment: review.comment,
        reviewedAt: '今天 10:22',
        reviewedBy: db.course.teacher
      };
    } else {
      sub.teacherReview = {
        score: sub.total,
        comment: '已复核，无补充说明。',
        reviewedAt: '今天 10:22',
        reviewedBy: db.course.teacher
      };
    }
    sub.total = Object.values(sub.scores).reduce((a, b) => a + b, 0);
    sub.status = 'reviewed';
  });

  if (ui.activeSubmissionId) {
    const active = submissionOf(ui.activeSubmissionId);
    if (active) prepareReviewDraft(active);
  }
  saveDb();
  render();
  toast(`已复核 ${pending.length} 份，成绩已同步学生端`);
}

function saveReview() {
  const sub = submissionOf(ui.activeSubmissionId);
  if (!sub || !ui.reviewDraft) return;
  const shortQ = db.questions.find(q => q.type === 'short');
  if (!shortQ) return;
  const max = shortQ.score;
  let score = Number(ui.reviewDraft.score);
  if (Number.isNaN(score)) score = 0;
  score = Math.max(0, Math.min(max, score));

  sub.teacherReview = {
    score,
    comment: ui.reviewDraft.comment.trim() || '已复核，无补充说明。',
    reviewedAt: '11-29 10:15',
    reviewedBy: db.course.teacher
  };
  sub.scores[shortQ.id] = score;
  sub.total = Object.values(sub.scores).reduce((a, b) => a + b, 0);
  sub.status = 'reviewed';

  const nextPending = db.submissions
    .filter(s => s.assignmentId === sub.assignmentId && s.id !== sub.id && s.status !== 'reviewed')
    .sort((a, b) => (a.submittedAt < b.submittedAt ? -1 : 1))[0];

  if (nextPending) {
    ui.activeSubmissionId = nextPending.id;
    prepareReviewDraft(nextPending);
  } else {
    ui.reviewDraft = null;
  }
  saveDb();
  render();
  toast(nextPending ? '复核完成，已切换到下一位待复核' : '复核完成，学生端已同步成绩');
}

/* ---------------- 私信与问答 ---------------- */

function sendMessage(form) {
  const body = (form.body || '').trim();
  if (!body) {
    toast('请输入问题内容');
    return;
  }
  /* 学生手动选择请教哪位老师；未选时默认该课程主讲老师 */
  const teacher = TEACHERS.find(t => t.id === form.addressedTo) || teachersOfCourse(db.courseId)[0] || null;
  db.messages.unshift({
    id: 'm' + Date.now(),
    courseId: db.courseId,
    classId: db.studentClassId,
    authorId: 's1',
    authorName: '李同学',
    anonymous: form.anonymous,
    visibility: form.anonymous ? 'public' : 'private',
    body,
    questionId: form.questionId || null,
    addressedTo: teacher ? teacher.id : null,
    addressedToName: teacher ? teacher.name : db.course.teacher,
    answer: null,
    answeredBy: null,
    answeredById: null,
    createdAt: '11-29 09:52',
    answeredAt: null
  });
  ui.prefillMessage = '';
  saveDb();
  render();
  toast(form.anonymous ? '已匿名公开到课程问答广场' : `已发送给${teacher ? teacher.name : db.course.teacher}`);
}

function openMessage(id) {
  ui.activeMessageId = id;
  render();
}

function sendReply(id, text) {
  const message = db.messages.find(m => m.id === id);
  const body = (text || '').trim();
  if (!message) return;
  if (!body) {
    toast('请输入回答内容');
    return;
  }
  message.answer = body;
  message.answeredBy = currentTeacher().name;
  message.answeredById = currentTeacher().id;
  message.answeredAt = '11-29 10:05';
  saveDb();
  render();
  toast('已回答');
}

/* ---------------- AI 答疑 ---------------- */

function openTutor(qid) {
  ui.tutorQuestionId = qid;
  if (!ui.aiChats[qid]) ui.aiChats[qid] = [];
  render();
}

function closeTutor() {
  ui.tutorQuestionId = null;
  render();
}

function askHint(level, qid) {
  qid = qid || ui.tutorQuestionId;
  if (!qid) return;
  const q = Q(qid);
  const chats = ui.aiChats[qid] || (ui.aiChats[qid] = []);
  chats.push({ role: 'me', text: ['给我一点提示', '再提示一步', '查看完整解析'][level] });
  chats.push({ role: 'ai', text: mockAi.hint(q, level) });
  render();
}

async function askTutor(text, qid) {
  qid = qid || ui.tutorQuestionId || ui.aiHomeQuestionId;
  if (!qid) return;
  const q = Q(qid);
  if (!q) return;
  const chats = ui.aiChats[qid] || (ui.aiChats[qid] = []);
  chats.push({ role: 'me', text });
  const pending = { role: 'ai', text: '', pending: true };
  chats.push(pending);
  render();
  scrollChatBottom();

  /* 默认用本地模板回答兜底；配置了大模型时调用真实模型 */
  let answer = mockAi.reply(q, text);
  let usedLLM = false;
  if (llmReady()) {
    const messages = buildTutorMessages(chats, q);
    const res = await callLLM({ messages, temperature: 0.6, maxTokens: 700 });
    if (res.ok && res.text.trim()) {
      answer = res.text.trim();
      usedLLM = true;
    }
  }
  pending.text = answer;
  pending.pending = false;
  pending.usedLLM = usedLLM;
  render();
  scrollChatBottom();
}

function setAiHomeMode(mode) {
  ui.aiHomeMode = mode === 'question' ? 'question' : 'textbook';
  render();
}

function setAiHomeQuestion(qid) {
  if (!Q(qid)) return;
  ui.aiHomeQuestionId = qid;
  if (!ui.aiChats[qid]) ui.aiChats[qid] = [];
  render();
}

function sendAiHomeTutor() {
  const input = document.getElementById('ai-home-tutor-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  askTutor(text, ui.aiHomeQuestionId);
}

/* ---------------- AI 模型设置 ---------------- */

function openLlmSettings() {
  ui.llmSettingsOpen = true;
  render();
}

function closeLlmSettings() {
  ui.llmSettingsOpen = false;
  render();
}

function applyLlmPreset(key) {
  const p = LLM_PRESETS[key];
  if (!p) return;
  const f = document.getElementById('llm-settings-form');
  if (!f) return;
  if (p.baseUrl) f.baseUrl.value = p.baseUrl;
  if (p.model) f.model.value = p.model;
  toast(`已填入「${p.label}」预设，确认 Key 后点保存`);
}

function toggleLlmKeyVisibility() {
  const input = document.getElementById('llm-key-input');
  const btn = document.getElementById('llm-key-toggle');
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  if (btn) btn.textContent = show ? '隐藏' : '显示';
}

function saveLlmSettings() {
  const f = document.getElementById('llm-settings-form');
  if (!f) return;
  const data = {};
  new FormData(f).forEach((v, k) => { data[k] = v; });
  const baseUrl = String(data.baseUrl || '').trim();
  const model = String(data.model || '').trim();
  const visionBaseUrl = String(data.visionBaseUrl || '').trim();
  const visionModel = String(data.visionModel || '').trim();
  if (!/^https?:\/\//i.test(baseUrl)) { toast('Base URL 需以 http(s):// 开头'); return; }
  if (!model) { toast('模型名称不能为空'); return; }
  if (visionBaseUrl && !/^https?:\/\//i.test(visionBaseUrl)) { toast('视觉 Base URL 需以 http(s):// 开头'); return; }
  saveLlmConfig({
    enabled: data.enabled === 'on',
    baseUrl,
    model,
    apiKey: String(data.apiKey || ''),
    visionBaseUrl,
    visionModel
  });
  toast('已保存 AI 模型配置');
  ui.llmSettingsOpen = false;
  render();
}

async function testLlmVisionConnection() {
  if (!llmReady()) { toast('请先填写文本模型的 Base URL、模型名称和 API Key'); return; }
  toast('正在测试视觉连接…');
  const res = await callLLM({
    useVision: true,
    messages: [{ role: 'user', content: '只回复四个字：视觉就绪' }],
    temperature: 0,
    maxTokens: 20
  });
  if (res.ok) toast(`视觉连接成功：${(res.text || '').trim().slice(0, 30)}`);
  else toast(`视觉连接失败（${res.reason}）：${(res.error || '').slice(0, 60)}`);
}

function clearLlmSettingsAction() {
  clearLlmConfig();
  toast('已清除配置，恢复默认 Agnes 预设（需重新填写 Key）');
  render();
}

async function testLlmConnection() {
  if (!llmReady()) { toast('请先填写 Base URL、模型名称和 API Key'); return; }
  toast('正在测试连接…');
  const res = await callLLM({
    messages: [{ role: 'user', content: '只回复四个字：连接成功' }],
    temperature: 0,
    maxTokens: 20
  });
  if (res.ok) toast(`连接成功：${(res.text || '').trim().slice(0, 30)}`);
  else toast(`连接失败（${res.reason}）：${(res.error || '').slice(0, 60)}`);
}
