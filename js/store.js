/* ============================================================
 * 状态管理、本地持久化、模拟 AI 服务
 * ============================================================ */

let db = loadDb();

/* 仅存在于内存的界面状态，不写入 localStorage */
const ui = {
  chapterId: db.mindMap[0].id,
  sectionId: db.mindMap[0].sections[0].id,
  pointId: null,
  drawerPointId: null,
  editQuestionId: null,
  mmCollapsed: {},
  mmEdit: false,
  editingNode: null,
  activeQuestionId: 'q1',
  qaTab: 'private',
  practiceTab: 'quiz',
  activeMessageId: null,
  activeSubmissionId: null,
  reviewDraft: null,
  reviewFilter: 'pending',
  draft: {},
  aiChats: {},
  tutorQuestionId: null,
  prefillMessage: '',
  gen: null,
  activeExamId: null,
  examGen: null,
  tbTab: 'examples',
  exSelected: [],
  pendingJoin: '',
  learnTab: 'map',
  pptPage: null,
  aiHomeChat: [],
  activeAiQuestionId: null,
  scanOpen: false,
  courseModalOpen: false,
  courseDraftCode: '',
  exRecommendReason: '',
  practiceItem: null,
  wrongCourseId: '',
  wrongSelected: [],
  wrongPointFilter: '',
  redo: null,
  exTargets: null,
  reviewPointId: null
};

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 3 && parsed.courses) {
        if (!Array.isArray(parsed.redoRecords)) parsed.redoRecords = [];
        if (!Array.isArray(parsed.reviewList)) parsed.reviewList = [];
        /* 学生端不再出现「课后习题」字样，旧数据统一改为中性名称 */
        Object.values(parsed.courses).forEach(data => {
          (data.distributed || []).forEach(d => {
            if (typeof d.title === 'string' && d.title.indexOf('课后习题') === 0) {
              d.title = d.title.replace(/^课后习题\s*·\s*/, '');
            }
          });
        });
        useCourse(parsed, parsed.courseId || 'math');
        return parsed;
      }
    }
  } catch (err) {
    console.warn('读取本地演示数据失败，已重新初始化', err);
  }
  return buildSeed();
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('保存演示数据失败', err);
  }
}

function resetDb() {
  db = buildSeed();
  ui.chapterId = db.mindMap[0].id;
  ui.sectionId = db.mindMap[0].sections[0].id;
  ui.drawerPointId = null;
  ui.editQuestionId = null;
  ui.mmCollapsed = {};
  ui.activeQuestionId = 'q1';
  ui.qaTab = 'private';
  ui.practiceTab = 'quiz';
  ui.activeMessageId = null;
  ui.activeSubmissionId = null;
  ui.reviewDraft = null;
  ui.reviewFilter = 'pending';
  ui.draft = {};
  ui.aiChats = {};
  ui.gen = null;
  ui.activeExamId = null;
  ui.examGen = null;
  ui.tbTab = 'examples';
  ui.exSelected = [];
  ui.aiHomeChat = [];
  ui.activeAiQuestionId = null;
  ui.scanOpen = false;
  ui.courseModalOpen = false;
  ui.courseDraftCode = '';
  ui.exRecommendReason = '';
  ui.practiceItem = null;
  ui.learnTab = 'map';
  ui.pptPage = null;
  ui.wrongCourseId = '';
  ui.wrongSelected = [];
  ui.wrongPointFilter = '';
  ui.redo = null;
  ui.exTargets = null;
  ui.reviewPointId = null;
  saveDb();
}

/* ---------------- 查询辅助 ---------------- */

const Q = id => db.questions.find(q => q.id === id);
const P = id => db.points.find(p => p.id === id);
const A = id => db.assignments.find(a => a.id === id);

function chapterOf(chapterId) {
  return db.mindMap.find(c => c.id === chapterId) || db.mindMap[0];
}

function pointsOfSection(sectionId) {
  return db.points.filter(p => p.sectionId === sectionId);
}

function sectionOf(sectionId) {
  for (const chapter of db.mindMap) {
    const section = chapter.sections.find(s => s.id === sectionId);
    if (section) return section;
  }
  return null;
}

function mySubmission(assignmentId) {
  return db.submissions.find(s => s.assignmentId === assignmentId && s.studentId === 's1');
}

function assignmentOfQuestion(qid) {
  return db.assignments.find(a => a.questionIds.includes(qid));
}

function totalScore(ids) {
  return ids.reduce((sum, id) => sum + (Q(id)?.score || 0), 0);
}

/* ---------------- 截止时间 ---------------- */

function isExpired(assignment) {
  return assignment.mode === 'homework' && !!assignment.dueAt && Date.now() > assignment.dueAt;
}

function formatDue(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function remainingText(assignment) {
  if (!assignment.dueAt) return '';
  const diff = assignment.dueAt - Date.now();
  if (diff <= 0) return '已截止';
  const hours = Math.floor(diff / 3600000);
  if (hours >= 24) return `剩余 ${Math.floor(hours / 24)} 天 ${hours % 24} 小时`;
  return `剩余 ${hours} 小时 ${Math.floor((diff % 3600000) / 60000)} 分`;
}

function submissionOf(subId) {
  return db.submissions.find(s => s.id === subId);
}

const EX = id => (db.textbook ? db.textbook.exercises.find(e => e.id === id) : null);

/** 某门课程面向的行政班 id 列表 */
function courseClassIds(courseId) {
  const data = db.courses && db.courses[courseId || db.courseId];
  return data && Array.isArray(data.classIds) ? data.classIds : [];
}

/** 某门课程面向的行政班（默认当前课程） */
function classesOfCourse(courseId) {
  return courseClassIds(courseId)
    .map(id => (db.classes || []).find(c => c.id === id))
    .filter(Boolean);
}

/** 课程归属的教师：优先取课程数据里的 teacherId，兼容旧数据 */
function teacherIdOfCourse(courseId) {
  const data = db.courses && db.courses[courseId];
  if (data && data.course && data.course.teacherId) return data.course.teacherId;
  const builtin = TEACHERS.find(t => t.courseId === courseId);
  return builtin ? builtin.id : null;
}

/** 某位教师名下的全部课程（含自建课程） */
function coursesOfTeacher(teacherId) {
  const tid = teacherId || db.session.teacherId;
  return Object.keys(db.courses || {})
    .filter(id => teacherIdOfCourse(id) === tid)
    .map(id => ({ id, name: db.courses[id].course.name, code: db.courses[id].course.code }));
}

function teacherClassId() {
  const ids = courseClassIds();
  const match = (db.classes || []).find(c => c.id === db.session.classId && ids.includes(c.id));
  return (match || classesOfCourse()[0] || {}).id || null;
}

function currentClass() {
  return (db.classes || []).find(c => c.id === teacherClassId()) || null;
}

function myClass() {
  return (db.classes || []).find(c => c.id === db.studentClassId) || null;
}

/* ---------------- 学生班级与课程 ---------------- */

/** 学生所属行政班 id 列表（固定一个班，保留数组形式兼容调用方） */
function studentClassIds() {
  return db.studentClassId ? [db.studentClassId] : [];
}

/** 学生所属的行政班 */
function myClasses() {
  return studentClassIds()
    .map(id => (db.classes || []).find(c => c.id === id))
    .filter(Boolean);
}

/** 学生所在班级开设的全部课程 */
function studentCourses() {
  const cls = myClass();
  if (!cls) return [];
  return Object.keys(db.courses || {})
    .filter(id => courseClassIds(id).includes(cls.id))
    .map(id => {
      const data = db.courses[id];
      return {
        courseId: id,
        classId: cls.id,
        name: data.course.name,
        code: data.course.code,
        teacher: data.course.teacher,
        className: cls.name,
        major: cls.major || ''
      };
    });
}

/** 指定课程是否面向学生所在班级 */
function classOfCourseForStudent(courseId) {
  const cls = myClass();
  if (!cls) return null;
  return courseClassIds(courseId).includes(cls.id) ? cls : null;
}

/* ---------------- 学生错题本 ---------------- */

/** 某门课程里学生做错的题（按题目去重，保留最低得分） */
function studentWrongQuestions(courseId) {
  const data = db.courses ? db.courses[courseId] : null;
  if (!data) return [];
  const subs = db.submissions.filter(s => s.studentId === 's1' && s.courseId === courseId);
  const map = {};
  subs.forEach(sub => {
    Object.entries(sub.scores || {}).forEach(([qid, score]) => {
      const question = data.questions.find(q => q.id === qid);
      if (!question || score >= question.score) return;
      const point = data.points.find(p => p.id === question.knowledgeId) || null;
      const prev = map[qid];
      if (prev && prev.score <= score) return;
      map[qid] = {
        qid,
        courseId,
        question,
        point,
        score,
        max: question.score,
        answer: sub.answers ? sub.answers[qid] : '',
        submittedAt: sub.submittedAt
      };
    });
  });
  return Object.values(map);
}

/** 该错题是否在重做中已订正（拿满分） */
function redoCleared(courseId, qid) {
  return (db.redoRecords || []).some(record => record.courseId === courseId
    && record.items.some(item => item.qid === qid && item.score >= item.max));
}

/** 学生各门课程的错题数量 */
function wrongCountOfCourse(courseId) {
  return studentWrongQuestions(courseId).length;
}

function distributedOf(id) {
  return (db.distributed || []).find(d => d.id === id);
}

function myExerciseSubmission(distId) {
  return (db.exerciseSubmissions || []).find(s => s.distId === distId && s.studentId === 's1');
}

/* ---------------- 模拟 AI ---------------- */

/** 统一生成课件引用，保证每段 AI 输出都能回溯课本 */
function citePoint(point, withExcerpt) {
  if (!point) return '';
  const head = `课件依据：《${db.courseware.fileName}》第 ${point.page} 页 · ${point.title}`;
  return withExcerpt ? `${head}\n原文：“${point.excerpt}”` : `（${head}）`;
}

const mockAi = {
  /** 根据主观题答案给出确定性评分 */
  gradeShortAnswer(question, answer) {
    const point = P(question.knowledgeId);
    const text = (answer || '').trim();
    if (!text) {
      return { score: 0, comment: `未作答。建议翻开第 ${point.page} 页，先写出「${point.title}」的定义与公式，再分步骤作答。${citePoint(point)}` };
    }
    const hit = (question.keywords || []).filter(k => text.includes(k));
    let score = 4 + hit.length * 4;
    if (text.length >= 60) score += 4;
    score = Math.min(question.score, score);

    const missing = (question.keywords || []).filter(k => !text.includes(k));
    let comment;
    if (score >= question.score * 0.85) {
      comment = `要点覆盖完整，与课件第 ${point.page} 页的表述一致，可以再补充一个具体情境让答案更扎实。`;
    } else if (score >= question.score * 0.5) {
      comment = `答案提到了${hit.join('、') || '部分要点'}，但${missing.length ? `缺少对“${missing.join('、')}”的说明，` : ''}建议对照第 ${point.page} 页的原文，按“定义—公式—条件”重新组织。`;
    } else {
      comment = `要点覆盖不足。请回到第 ${point.page} 页「${point.title}」，先抄写核心公式，再用自己的话解释每个符号的含义。`;
    }
    return { score, comment: `${comment}\n${citePoint(point)}` };
  },

  /** 分级提示，每一级都标注课件页码 */
  hint(question, level) {
    const point = P(question.knowledgeId);
    const base = question.hints[Math.min(level, question.hints.length - 1)];
    return `${base}\n${citePoint(point)}`;
  },

  /** 开放式追问的模板化回答 */
  reply(question, text) {
    const point = P(question.knowledgeId);
    const cite = citePoint(point, true);
    const t = (text || '').trim();
    if (!t) return `可以再具体一点描述卡住的地方，我会结合课件第 ${point.page} 页帮你拆解。`;
    if (/答案|选什么|选哪个|结果/.test(t)) {
      return `直接给答案会削弱判断力。先看这一步：${question.hints[1]}\n对照课件第 ${point.page} 页自己推一遍，再回来看结果。\n${cite}`;
    }
    if (/为什么|原因|原理/.test(t)) {
      return `这个问题对应「${point.title}」。${point.summary}\n${cite}`;
    }
    if (/公式|符号|参数|怎么算/.test(t)) {
      return `「${point.title}」的核心公式是 ${point.formulas[0]}。其中 ${point.params.map(p => `${p.sym} 表示${p.name}`).join('，')}。\n${cite}`;
    }
    return `我按课件内容理解为：${point.summary}\n如果你问的是解题步骤，建议先完成这一步——${question.hints[0]}\n${cite}`;
  },

  /** 课后讲题步骤：提交后展示，逐步对齐课件 */
  solutionSteps(question) {
    const point = P(question.knowledgeId);
    const formula = point && point.formulas[0] ? point.formulas[0] : '见课件原文';
    const params = point && point.params.length
      ? point.params.map(p => `${p.sym} 表示${p.name}`).join('，')
      : '';
    const steps = [`定位考点：本题考「${point.title}」，对应课件第 ${point.page} 页。`];

    if (question.type === 'single') {
      steps.push(`写出依据：${formula}${params ? `，其中 ${params}` : ''}。`);
      steps.push(`逐项判断：${question.hints[0]}`);
      steps.push(`得出结论：正确选项是 ${String.fromCharCode(65 + question.answer)}（${question.options[question.answer]}）。`);
    } else {
      steps.push(`写出定义与公式：${formula}。`);
      steps.push(`组织答案要点：${(question.keywords || []).join('、') || '按课件原文分点作答'}。`);
      steps.push(`对照原文自检：${point.excerpt}`);
    }
    return { steps, page: point.page, cite: citePoint(point) };
  },

  /** 错题诊断，附带课件原文 */
  diagnose(question) {
    const point = P(question.knowledgeId);
    return {
      pointTitle: point ? point.title : '相关知识点',
      page: point ? point.page : null,
      excerpt: point ? point.excerpt : '',
      ...question.diagnosis
    };
  }
};

/* ---------------- 提示 ---------------- */

let toastTimer = null;
function toast(message, duration) {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    document.body.appendChild(host);
  }
  host.innerHTML = `<div class="toast">${esc(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { host.innerHTML = ''; }, duration || 2400);
}

function esc(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
