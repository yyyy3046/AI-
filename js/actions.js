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

  showLoginError('账号不存在，请使用下方演示账号');
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
  ui.redo = null;
  ui.wrongSelected = [];
  ui.wrongPointFilter = '';
  ui.wrongCourseId = courseId;
  ui.pptPage = null;
  saveDb();
  render();
  if (!silent) toast(`已切换到「${db.course.name}」`);
}

/* ---------------- 学生课件 PPT ---------------- */

function switchLearnTab(tab) {
  ui.learnTab = tab === 'ppt' ? 'ppt' : 'map';
  render();
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

/** 勾选同一门课程的错题后开始重做 */
function startWrongRedo() {
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
  ui.redo = { courseId, qids: ids, answers: {}, result: null };
  ui.wrongSelected = [];
  ui.drawerPointId = null;
  saveDb();
  location.hash = '#/student/redo';
  render();
}

function setRedoOption(qid, index) {
  if (!ui.redo || ui.redo.result) return;
  ui.redo.answers[qid] = index;
  render();
}

function setRedoShort(qid, value) {
  if (!ui.redo || ui.redo.result) return;
  ui.redo.answers[qid] = value;
}

function exitRedo() {
  ui.redo = null;
  location.hash = '#/student/wrong';
  render();
}

function submitRedo() {
  const redo = ui.redo;
  if (!redo || redo.result) return;
  const data = db.courses[redo.courseId];
  if (!data) return;
  const questions = redo.qids
    .map(id => data.questions.find(q => q.id === id))
    .filter(Boolean);
  const missing = questions.filter(q => {
    const value = redo.answers[q.id];
    return value === undefined || value === null || value === '';
  });
  if (missing.length) {
    toast(`还有 ${missing.length} 道题未作答`);
    return;
  }

  const items = questions.map(q => {
    const value = redo.answers[q.id];
    let score;
    if (q.type === 'single') score = Number(value) === q.answer ? q.score : 0;
    else score = mockAi.gradeShortAnswer(q, value).score;
    return { qid: q.id, score, max: q.score, answer: value };
  });
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const max = items.reduce((sum, item) => sum + item.max, 0);

  redo.result = { total, max, items };
  if (!Array.isArray(db.redoRecords)) db.redoRecords = [];
  db.redoRecords.unshift({
    id: `redo-${Date.now()}`,
    courseId: redo.courseId,
    at: '今天',
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
  toast('演示数据已重置');
}

/* ---------------- 课件生成（模拟） ---------------- */

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

  const answers = {};
  let missing = 0;
  dist.exerciseIds.forEach(id => {
    const el = document.querySelector(`[data-ex-answer="${id}"]`);
    const text = el ? el.value.trim() : '';
    if (!text) missing++;
    answers[id] = text;
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

function matchPointByText(text) {
  let best = null;
  let bestLength = 0;
  db.points.forEach(point => {
    const words = [point.title, ...point.title.split(/[·、，,（）()\s]/)].filter(w => w && w.length >= 2);
    words.forEach(word => {
      if (text.includes(word) && word.length > bestLength) {
        best = point;
        bestLength = word.length;
      }
    });
  });
  return best;
}

function aiHomeReply(text, page) {
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
      source: {
        page: point.page,
        title: point.title,
        section: sectionTitleOfPoint(point).section,
        excerpt: point.excerpt
      },
      answer: `可以试试这道题：\n${question.stem}\n\n先自己判断，再点「给我一点提示」，不要直接看答案。\n\n${citePoint(point, true)}`
    };
  }

  const matched = matchPointByText(text);
  const point = matched || pagePoints[0];
  if (!point) {
    return {
      pointId: null,
      page: null,
      grounded: false,
      source: null,
      answer: `教材（第一章第四、五节，P13—24）中没有检索到与「${text}」直接对应的定义或例题。\n为避免给出超出教材的说法，我不做额外发挥；建议换用教材中的术语提问，或直接向老师确认。`
    };
  }
  return {
    pointId: point.id,
    page: point.page,
    grounded: true,
    source: {
      page: point.page,
      title: point.title,
      section: sectionTitleOfPoint(point).section,
      excerpt: point.excerpt
    },
    answer: `${matched ? '' : `教材中没有直接出现你这句话的表述，我先按当前页「${point.title}」回答：\n\n`}${point.summary}\n\n核心结论：${point.formulas[0]}\n\n${citePoint(point, true)}`
  };
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
  const section = aiSectionChoices().find(item => item.pages.includes(value));
  if (section) ui.aiSection = section.section.id;
  render();
}

function setAiSection(sectionId) {
  const section = aiSectionChoices().find(item => item.section.id === sectionId);
  if (!section) return;
  ui.aiSection = sectionId;
  ui.aiPage = section.pages[0] || null;
  render();
}

function setAiChapter(chapterId) {
  const group = sectionsWithPages().find(item => item.chapter.id === chapterId);
  if (!group || !group.sections.length) return;
  setAiSection(group.sections[0].section.id);
}

function askAiHome(text) {
  const question = String(text || '').trim();
  if (!question) {
    toast('先输入你的问题');
    return false;
  }
  const page = aiCurrentPage();
  const reply = aiHomeReply(question, page);
  ui.aiHomeChat.push({ role: 'user', text: question });
  ui.aiHomeChat.push({
    role: 'ai',
    text: reply.answer,
    pointId: reply.pointId,
    page: reply.page,
    grounded: reply.grounded,
    source: reply.source
  });

  db.aiQuestions.unshift({
    id: `aiq-${Date.now()}`,
    courseId: db.courseId,
    classId: db.studentClassId,
    studentId: 's1',
    studentName: '李同学',
    question,
    answer: reply.answer,
    knowledgeId: reply.pointId,
    createdAt: '今天 10:5' + (new Date().getMinutes() % 10),
    reviewed: false
  });
  saveDb();
  render();
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

function selectOption(qid, index) {
  ui.draft[qid] = index;
  render();
}

function setShortAnswer(qid, value) {
  ui.draft[qid] = value;
}

function startAssignment(id) {
  const assignment = A(id);
  if (!assignment) return;
  if (isExpired(assignment) && !mySubmission(id)) {
    toast('本次作业已截止，无法开始作答');
    return;
  }
  ui.draft = {};
  assignment.questionIds.forEach(qid => {
    const q = Q(qid);
    if (q && q.type === 'short') ui.draft[qid] = '';
  });
  ui.activeQuestionId = assignment.questionIds[0];
  location.hash = `#/student/practice/${id}`;
  render();
}

function submitAssignment(assignmentId) {
  const assignment = A(assignmentId);
  if (!assignment) return;

  if (isExpired(assignment)) {
    toast('本次作业已截止，无法提交');
    return;
  }

  const missing = assignment.questionIds.filter(qid => {
    const value = ui.draft[qid];
    return value === undefined || value === '' || value === null;
  });
  if (missing.length) {
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

  assignment.questionIds.forEach(qid => {
    const q = Q(qid);
    const value = ui.draft[qid];
    answers[qid] = value;
    if (q.type === 'single') {
      const got = Number(value) === q.answer ? q.score : 0;
      scores[qid] = got;
      total += got;
    } else {
      const review = mockAi.gradeShortAnswer(q, value);
      scores[qid] = review.score;
      aiReviews[qid] = review;
      total += review.score;
    }
  });

  const hasShort = assignment.questionIds.some(qid => Q(qid).type === 'short');

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
    submittedAt: '11-29 09:40'
  });

  saveDb();
  render();
  toast('已提交，AI 已完成初评');
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
    answer: null,
    answeredBy: null,
    createdAt: '11-29 09:52',
    answeredAt: null
  });
  ui.prefillMessage = '';
  saveDb();
  render();
  toast(form.anonymous ? '已匿名公开到课程问答广场' : `已发送给${db.course.teacher}`);
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
  message.answeredBy = db.course.teacher;
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

function askTutor(text, qid) {
  qid = qid || ui.tutorQuestionId;
  if (!qid) return;
  const q = Q(qid);
  const chats = ui.aiChats[qid] || (ui.aiChats[qid] = []);
  chats.push({ role: 'me', text });
  chats.push({ role: 'ai', text: mockAi.reply(q, text) });
  render();
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
