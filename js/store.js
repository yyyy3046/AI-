/* ============================================================
 * 状态管理、本地持久化、AI 服务
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
  mmScale: 1,
  editingNode: null,
  activeQuestionId: 'q1',
  qaTab: 'private',
  practiceTab: 'quiz',
  activeMessageId: null,
  activeSubmissionId: null,
  reviewDraft: null,
  reviewFilter: 'pending',
  draft: {},
  exerciseDraft: {},
  previewImage: null,
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
  selfCheckFilter: 'all',
  pptPage: null,
  aiPage: null,
  aiSection: null,
  pptPreviewPage: null,
  aiHomeChat: [],
  aiHomeMode: 'textbook',
  aiHomeQuestionId: null,
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
  reviewPointId: null,
  llmSettingsOpen: false,
  llmPending: false
};

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 5 && parsed.courses) {
        if (!Array.isArray(parsed.redoRecords)) parsed.redoRecords = [];
        if (!Array.isArray(parsed.reviewList)) parsed.reviewList = [];
        if (!Array.isArray(parsed.practiceRecords)) parsed.practiceRecords = [];
        if (!parsed.quizStart || typeof parsed.quizStart !== 'object') parsed.quizStart = {};
        if (!parsed.selfCheck || typeof parsed.selfCheck !== 'object') parsed.selfCheck = {};
        /* 学生端不再出现「课后习题」字样，旧数据统一改为中性名称 */
        Object.values(parsed.courses).forEach(data => {
          (data.distributed || []).forEach(d => {
            if (typeof d.title === 'string' && d.title.indexOf('课后习题') === 0) {
              d.title = d.title.replace(/^课后习题\s*·\s*/, '');
            }
          });
          /* 兼容旧数据：缺少真题库或限时字段时补默认值 */
          if (!Array.isArray(data.examQuestions)) data.examQuestions = [];
          (data.assignments || []).forEach(a => {
            if (a.mode === 'quiz' && !a.duration) a.duration = 10;
          });
        });
        useCourse(parsed, parsed.courseId || 'math');
        return parsed;
      }
    }
  } catch (err) {
    console.warn('读取本地数据失败，已重新初始化', err);
  }
  return buildSeed();
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('保存本地数据失败', err);
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
  ui.exerciseDraft = {};
  ui.practice = null;
  ui.practiceCourse = 'math';
  ui.practicePoint = '';
  ui.practiceDifficulty = '';
  ui.practiceCount = 5;
  ui.practiceGenLoading = false;
  ui.previewImage = null;
  ui.aiChats = {};
  ui.gen = null;
  ui.activeExamId = null;
  ui.examGen = null;
  ui.tbTab = 'examples';
  ui.exSelected = [];
  ui.aiHomeChat = [];
  ui.aiHomeMode = 'textbook';
  ui.aiHomeQuestionId = null;
  ui.activeAiQuestionId = null;
  ui.scanOpen = false;
  ui.courseModalOpen = false;
  ui.courseDraftCode = '';
  ui.exRecommendReason = '';
  ui.practiceItem = null;
  ui.learnTab = 'map';
  ui.selfCheckFilter = 'all';
  ui.pptPage = null;
  ui.aiPage = null;
  ui.aiSection = null;
  ui.pptPreviewPage = null;
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

/* ---------------- 课堂问答倒计时 ---------------- */

function formatClock(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/* 距课堂问答结束的秒数；未开始 / 非问答 / 无时长返回 null（不显示倒计时） */
function quizRemaining(assignment) {
  if (!assignment || assignment.mode !== 'quiz' || !assignment.duration) return null;
  const startedAt = db.quizStart && db.quizStart[assignment.id];
  if (!startedAt) return null;
  return Math.round(assignment.duration * 60 - (Date.now() - startedAt) / 1000);
}

/* 从课程真题库按知识点 / 难度过滤并随机抽样 */
function sampleExamQuestions(courseId, opts) {
  const data = db.courses && db.courses[courseId];
  const pool = (data && Array.isArray(data.examQuestions)) ? data.examQuestions.slice() : [];
  const o = opts || {};
  let list = pool.filter(q => {
    if (o.pointId && q.knowledgeId !== o.pointId) return false;
    if (o.difficulty && q.difficulty !== o.difficulty) return false;
    return true;
  });
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const count = Math.max(1, Math.min(20, Number(o.count) || 5));
  return list.slice(0, count);
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

/** 课程的全部任课老师（含共同答疑的多位老师），兼容旧数据 */
function teachersOfCourse(courseId) {
  const data = db.courses && db.courses[courseId];
  let ids = (data && data.course && data.course.teacherIds) || null;
  if (!ids || !ids.length) {
    ids = TEACHERS.filter(t => t.courseId === courseId).map(t => t.id);
  }
  return ids
    .map(id => TEACHERS.find(t => t.id === id))
    .filter(Boolean);
}

/** 课程归属的主讲教师：取任课老师列表第一位，兼容旧数据 */
function teacherIdOfCourse(courseId) {
  return teachersOfCourse(courseId)[0]?.id || null;
}

/** 某位教师名下的全部课程（含自建课程）；共同答疑的老师都能看到同一门课 */
function coursesOfTeacher(teacherId) {
  const tid = teacherId || db.session.teacherId;
  return Object.keys(db.courses || {})
    .filter(id => teachersOfCourse(id).some(t => t.id === tid))
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

/** 某门课的学生自我检测结果：{ 知识点id: 'mastered' | 'review' }，未标记的不在其中 */
function selfCheckOf(courseId) {
  if (!db.selfCheck) db.selfCheck = {};
  if (!db.selfCheck[courseId] || typeof db.selfCheck[courseId] !== 'object') db.selfCheck[courseId] = {};
  return db.selfCheck[courseId];
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

/* ---------------- 作答答案统一解析（兼容 string | {text, images}） ---------------- */
const MAX_ANSWER_IMAGES = 3;

/** 把任意形态的答案统一成 { text, images }，兼容旧数据的纯字符串 */
function unwrapAnswer(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      text: value.text == null ? '' : String(value.text),
      images: Array.isArray(value.images) ? value.images.filter(Boolean) : []
    };
  }
  return { text: value == null ? '' : String(value), images: [] };
}
function answerText(value) { return unwrapAnswer(value).text; }
function answerImages(value) { return unwrapAnswer(value).images; }
/** 是否算“已作答”：有文字 或 有图片 均视为已作答 */
function answerHasContent(value) {
  const u = unwrapAnswer(value);
  return u.text.trim() !== '' || u.images.length > 0;
}

/* ---------------- AI 能力 ---------------- */

/** 定位知识点所属章节与小节 */
function sectionTitleOfPoint(point) {
  if (!point) return { chapter: '', section: '' };
  for (const chapter of db.mindMap) {
    const section = chapter.sections.find(s => s.id === point.sectionId);
    if (section) return { chapter: chapter.title, section: section.title };
  }
  return { chapter: '', section: '' };
}

/** 统一生成教材引用，保证每段 AI 输出都能回溯课本原文 */
function citePoint(point, withExcerpt) {
  if (!point) return '';
  const where = sectionTitleOfPoint(point);
  const place = [where.chapter, where.section].filter(Boolean).join(' · ');
  const head = `教材依据：${place ? place + '，' : ''}第 ${point.page} 页「${point.title}」`;
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

/* ============================================================
 * 大模型接入（OpenAI 兼容接口，前端直连，Key 仅存本机）
 * ============================================================ */

const LLM_STORAGE_KEY = 'zhike_llm_config';

/* 预设：均已验证支持浏览器 CORS 直连 */
const LLM_PRESETS = {
  agnes:       { label: 'Agnes AI（免费）', baseUrl: 'https://api.agnes-ai.cn/v1', model: 'agnes-3.0-flash' },
  deepseek:    { label: 'DeepSeek',          baseUrl: 'https://api.deepseek.com/v1',    model: 'deepseek-chat' },
  siliconflow: { label: '硅基流动',           baseUrl: 'https://api.siliconflow.cn/v1',  model: 'Qwen/Qwen2.5-7B-Instruct' },
  openrouter:  { label: 'OpenRouter',         baseUrl: 'https://openrouter.ai/api/v1',   model: 'openai/gpt-4o-mini' },
  dashscope:   { label: '通义千问',           baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  custom:      { label: '自定义',             baseUrl: '', model: '' }
};

let llmConfig = loadLlmConfig();

function loadLlmConfig() {
  const base = {
    enabled: true, baseUrl: LLM_PRESETS.agnes.baseUrl, model: LLM_PRESETS.agnes.model, apiKey: '',
    visionModel: '', visionBaseUrl: '', visionApiKey: ''
  };
  try {
    const raw = localStorage.getItem(LLM_STORAGE_KEY);
    if (raw) {
      const c = JSON.parse(raw);
      if (c && typeof c === 'object') {
        // 迁移：旧版误用了 apihub 域名，Agnes 官方正确域名为 api.agnes-ai.cn
        let url = (c.baseUrl || base.baseUrl).replace(/\/+$/, '');
        url = url.replace(/apihub\.agnes-ai\.(com|cn)/, 'api.agnes-ai.cn');
        return {
          enabled: c.enabled !== false,
          baseUrl: url,
          model: c.model || base.model,
          apiKey: c.apiKey || '',
          visionModel: c.visionModel || '',
          visionBaseUrl: (c.visionBaseUrl || '').replace(/\/+$/, ''),
          visionApiKey: c.visionApiKey || ''
        };
      }
    }
  } catch (e) { /* ignore */ }
  return base;
}

function saveLlmConfig(cfg) {
  llmConfig = {
    enabled: cfg.enabled !== false,
    baseUrl: String(cfg.baseUrl || '').trim().replace(/\/+$/, ''),
    model: String(cfg.model || '').trim(),
    apiKey: cfg.apiKey || '',
    visionModel: String(cfg.visionModel || '').trim(),
    visionBaseUrl: String(cfg.visionBaseUrl || '').trim().replace(/\/+$/, ''),
    visionApiKey: cfg.visionApiKey || ''
  };
  try { localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(llmConfig)); } catch (e) { /* ignore */ }
}

/** 视觉模型生效配置：未单独配置时回退到文本模型配置 */
function visionConfig() {
  return {
    baseUrl: (llmConfig.visionBaseUrl || llmConfig.baseUrl || '').replace(/\/+$/, ''),
    model: llmConfig.visionModel || llmConfig.model || '',
    apiKey: llmConfig.visionApiKey || llmConfig.apiKey || ''
  };
}

/** 视觉模型是否可用（启用 + 有 Key + 有地址和模型；视觉字段空时回退文本配置） */
function llmVisionReady() {
  if (llmConfig.enabled === false) return false;
  const v = visionConfig();
  return !!(v.baseUrl && v.model && v.apiKey);
}

function clearLlmConfig() {
  try { localStorage.removeItem(LLM_STORAGE_KEY); } catch (e) { /* ignore */ }
  llmConfig = loadLlmConfig();
}

/** 是否已配置可用（启用 + 有 Key + 有地址和模型） */
function llmReady() {
  return !!(llmConfig.enabled && llmConfig.apiKey && llmConfig.baseUrl && llmConfig.model);
}

/**
 * 调用大模型（OpenAI 兼容 /chat/completions）。
 * @returns {Promise<{ok:boolean,text?:string,reason?:string,error?:string}>}
 */
async function callLLM(opts) {
  const useVision = !!(opts && opts.useVision);
  const cfg = useVision ? visionConfig() : llmConfig;
  const ready = useVision ? llmVisionReady() : llmReady();
  if (!ready) return { ok: false, reason: 'not-configured' };
  const { messages, temperature = 0.5, maxTokens = 900, signal } = opts || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });
  try {
    const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!resp.ok) {
      let detail = '';
      try { detail = (await resp.text()).slice(0, 220); } catch (e) { /* ignore */ }
      return { ok: false, reason: `http-${resp.status}`, error: detail || resp.statusText };
    }
    const data = await resp.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (text == null) return { ok: false, reason: 'empty', error: JSON.stringify(data).slice(0, 220) };
    return { ok: true, text: String(text) };
  } catch (e) {
    clearTimeout(timer);
    const aborted = e && (e.name === 'AbortError' || (e.message && /abort/i.test(e.message)));
    return { ok: false, reason: aborted ? 'timeout' : 'network', error: String((e && e.message) || e) };
  }
}

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
