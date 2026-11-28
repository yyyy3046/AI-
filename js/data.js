/* ============================================================
 * 知课 AI · 课程与知识库数据核心
 * 支持两门课程：高等数学 / 大学物理
 * ============================================================ */

const STORAGE_KEY = 'zhike-ai-demo:v13';
const SUBJECT_ORDER = ['math', 'physics'];
const SUBJECTS = window.SUBJECTS;

/* 教师账号；每门课配一位主讲 + 一位助教，共同答疑 */
const TEACHERS = [
  { id: 't-math', name: '张老师', username: 'gaoshu', password: '123456', courseId: 'math', courseName: '高等数学' },
  { id: 't-math2', name: '陈老师', username: 'gaoshu2', password: '123456', courseId: 'math', courseName: '高等数学' },
  { id: 't-physics', name: '刘老师', username: 'wuli', password: '123456', courseId: 'physics', courseName: '大学物理' },
  { id: 't-physics2', name: '赵老师', username: 'wuli2', password: '123456', courseId: 'physics', courseName: '大学物理' }
];

const STUDENT_ACCOUNT = { id: 's1', name: '李同学', username: 'student', password: '123456' };

function currentTeacher() {
  return TEACHERS.find(t => t.id === db.session.teacherId) || TEACHERS[0];
}

const PEER_ROWS = [
  ['p01', '王一', [10, 10, 10, 16]],
  ['p02', '陈晨', [10, 0, 10, 14]],
  ['p03', '刘洋', [10, 10, 0, 18]],
  ['p04', '赵敏', [0, 10, 10, 12]],
  ['p05', '孙悦', [10, 10, 10, 20]],
  ['p06', '周杰', [10, 0, 10, 16]],
  ['p07', '吴倩', [10, 10, 0, 14]],
  ['p08', '郑浩', [0, 0, 10, 12]],
  ['p09', '冯雪', [10, 10, 10, 18]],
  ['p10', '蒋涛', [10, 0, 10, 16]],
  ['p11', '韩雨', [10, 10, 10, 20]],
  ['p12', '曹阳', [0, 10, 0, 14]],
  ['p13', '沈佳', [10, 10, 10, 16]],
  ['p14', '谢婷', [10, 0, 10, 18]],
  ['p15', '卢俊', [10, 10, 10, 12]],
  ['p16', '邓超', [0, 10, 10, 16]],
  ['p17', '苏晴', [10, 10, 0, 18]]
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** 把顶层字段指向指定课程的数据（共享引用，修改即持久） */
function useCourse(target, courseId) {
  const course = target.courses[courseId];
  target.courseId = courseId;
  target.course = course.course;
  target.courseware = course.courseware;
  target.mindMap = course.mindMap;
  target.points = course.points;
  target.questions = course.questions;
  target.assignments = course.assignments;
  target.examPapers = course.examPapers;
  target.textbook = course.textbook;
  target.distributed = course.distributed;
}

/** 生成一份已由 AI 批注过的整卷 */
function buildExamPapers(subject) {
  const items = [];
  const letter = i => String.fromCharCode(65 + i);

  subject.questions.filter(q => q.type === 'single').slice(0, 3).forEach((q, index) => {
    const point = subject.points.find(p => p.id === q.knowledgeId);
    const wrong = index === 1;
    const picked = wrong ? (q.answer + 1) % q.options.length : q.answer;
    items.push({
      no: items.length + 1,
      type: 'single',
      stem: q.stem,
      options: q.options,
      studentAnswer: letter(picked),
      correctAnswer: letter(q.answer),
      score: wrong ? 0 : q.score,
      max: q.score,
      aiComment: wrong
        ? `作答错误。学生选择了 ${letter(picked)}（${q.options[picked]}），正确答案是 ${letter(q.answer)}（${q.options[q.answer]}）。错因是把相近结论混用，请对照课件第 ${point.page} 页「${point.title}」重看推导过程。`
        : `作答正确。该题考查「${point.title}」，结论与课件第 ${point.page} 页的表述一致。`,
      knowledgeId: q.knowledgeId,
      page: point.page
    });
  });

  /* 填空题：按采分点判分，标出漏写条件或空白 */
  subject.points.slice(1, 3).forEach((point, index) => {
    const formula = point.formulas[0];
    if (index === 0) {
      const hasCondition = /（[^）]*）/.test(formula);
      const studentAnswer = hasCondition
        ? formula.replace(/（[^）]*）/, '').trim()
        : formula.replace(/[=＝]/, '= ');
      items.push({
        no: items.length + 1,
        type: 'fill',
        stem: `填空题：写出「${point.title}」的核心公式：______。`,
        studentAnswer,
        correctAnswer: formula,
        score: 3,
        max: 6,
        aiComment: hasCondition
          ? `公式主体写对了，但漏写括号中的适用条件，按采分点扣 3 分。请对照课件第 ${point.page} 页补全条件后再检查一遍符号。`
          : `公式符号书写有误，按采分点扣 3 分。请对照课件第 ${point.page} 页逐个核对符号含义，尤其是等式两边的对应关系。`,
        knowledgeId: point.id,
        page: point.page
      });
    } else {
      items.push({
        no: items.length + 1,
        type: 'fill',
        stem: `填空题：写出「${point.title}」的关键结论：______。`,
        studentAnswer: '（未填写）',
        correctAnswer: formula,
        score: 0,
        max: 6,
        aiComment: `本题空白，未作答。建议先抄写课件第 ${point.page} 页的核心公式，再用自己的话说明每个符号的含义，下次遇到同类填空可直接套用。`,
        knowledgeId: point.id,
        page: point.page
      });
    }
  });

  const shortQ = subject.questions.find(q => q.type === 'short');  if (shortQ) {
    const point = subject.points.find(p => p.id === shortQ.knowledgeId);
    const answer = (subject.shortAnswers && subject.shortAnswers.mid) || '（作答略）';
    const score = Math.round(shortQ.score * 0.7);
    items.push({
      no: items.length + 1,
      type: 'short',
      stem: shortQ.stem,
      studentAnswer: answer,
      correctAnswer: `参考要点：${(shortQ.keywords || []).join('、') || '见课件原文'}`,
      score,
      max: shortQ.score,
      aiComment: `要点基本覆盖，但表述停留在结论层面，缺少适用条件与推导过程。建议对照第 ${point.page} 页原文，按「定义—公式—条件」重新组织，可补 3—5 分。`,
      knowledgeId: shortQ.knowledgeId,
      page: point.page
    });
  }

  const lastPoint = subject.points[subject.points.length - 1];
  items.push({
    no: items.length + 1,
    type: 'short',
    comprehensive: true,
    stem: `综合题：结合课件第 ${lastPoint.page} 页，说明「${lastPoint.title}」的核心思想，并写出它的核心公式。`,
    studentAnswer: `${lastPoint.summary.slice(0, 28)}……公式写成：${lastPoint.formulas[0]}`,
    correctAnswer: `参考要点：${lastPoint.summary} 核心公式：${lastPoint.formulas[0]}`,
    score: 8,
    max: 12,
    aiComment: `公式写对了，但说明部分缺少对符号含义的解释，也没有点明使用条件。请补充第 ${lastPoint.page} 页中对各符号的定义。`,
    knowledgeId: lastPoint.id,
    page: lastPoint.page
  });

  items.forEach(item => { item.aiScore = item.score; });

  return [{
    id: `${subject.id}-exam-1`,
    title: `${subject.course.name} · 期中模拟卷`,
    fileName: `${subject.course.name}期中模拟卷_李同学.pdf`,
    studentName: '李同学',
    uploadedAt: '11-28 16:20',
    status: 'pending',
    items
  }];
}

/** 教材例题（教师端可见，含解析）与课后习题（可下发，学生端只见题目） */
function buildTextbook(subject) {
  /* 已按真实教材整理例题与习题的课程，直接使用其教材数据 */
  if (subject.textbook && subject.textbook.examples && subject.textbook.exercises) {
    return clone(subject.textbook);
  }
  const levels = ['基础', '提高', '综合'];

  const examples = subject.points.map((point, index) => ({
    id: `${subject.id}-exm-${index + 1}`,
    title: `例题 ${index + 1} · ${point.title}`,
    page: point.page,
    knowledgeId: point.id,
    stem: point.example,
    solution: `${point.formulas.join('；')}。${point.summary}`,
    source: `教材第 ${point.page} 页`
  }));

  const exercises = subject.points.map((point, index) => {
    const level = levels[index % levels.length];
    return {
      id: `${subject.id}-exr-${index + 1}`,
      title: `${point.title} · 课后习题`,
      page: point.page,
      knowledgeId: point.id,
      difficulty: level,
      stem: `【${level}】请写出「${point.title}」的核心公式，并说明各符号的含义；再结合教材第 ${point.page} 页的例题，说明该结论的适用条件。`,
      reference: `${point.formulas.join('；')}。${point.summary}`
    };
  });

  return { examples, exercises };
}

function buildSeed() {  const seed = {
    version: 5,
  storageKey: STORAGE_KEY,
    session: { role: null, userId: null },
    courseId: 'math',
    courses: {},
    classes: [
      { id: 'c-ai-2401', name: '人工智能 2401 班', code: 'AI-2401', major: '人工智能', studentCount: 30, createdAt: '09-02' },
      { id: 'c-ai-2402', name: '人工智能 2402 班', code: 'AI-2402', major: '人工智能', studentCount: 30, createdAt: '09-02' },
      { id: 'c-ei-2401', name: '电子信息 2401 班', code: 'EI-2401', major: '电子信息', studentCount: 32, createdAt: '09-02' }
    ],
    studentClassId: null,
    redoRecords: [],
    reviewList: [],
    submissions: [],
    exerciseSubmissions: [],
    aiQuestions: [],
    messages: [],
    selfCheck: {},
    practiceRecords: [],
    quizStart: {}
  };

  /* 行政班与课程的开设关系：公共课跨专业，专业课面向本专业 */
  const COURSE_CLASSES = {
    math: ['c-ai-2401', 'c-ai-2402', 'c-ei-2401'],
    physics: ['c-ai-2401', 'c-ai-2402']
  };
  const DEFAULT_CLASS = 'c-ai-2401';

  SUBJECT_ORDER.forEach(id => {
    const subject = SUBJECTS[id];
    const textbook = buildTextbook(subject);
    seed.courses[id] = {
      course: { ...clone(subject.course), teacherId: (TEACHERS.find(t => t.courseId === id) || {}).id, teacherIds: TEACHERS.filter(t => t.courseId === id).map(t => t.id) },
      classIds: COURSE_CLASSES[id].slice(),
      courseware: clone(subject.courseware),
      mindMap: clone(subject.mindMap),
      points: clone(subject.points),
      questions: clone(subject.questions),
      examQuestions: clone(subject.examQuestions || []),
      assignments: clone(subject.assignments),
      examPapers: buildExamPapers(subject).map(paper => ({ ...paper, classId: DEFAULT_CLASS })),
      textbook,
      distributed: [{
        id: `${id}-dist-1`,
        classId: DEFAULT_CLASS,
        title: '第 1 组练习',
        exerciseIds: textbook.exercises.slice(0, 2).map(e => e.id),
        distributedAt: '11-28 17:10',
        dueAt: Date.now() + 2 * 24 * 3600 * 1000
      }]
    };
    /* 课后作业默认 3 天后截止；课堂问答默认限时 10 分钟 */
    seed.courses[id].assignments.forEach(a => {
      if (a.mode === 'homework') a.dueAt = Date.now() + 3 * 24 * 3600 * 1000;
      if (a.mode === 'quiz' && !a.duration) a.duration = 10;
    });
  });

  useCourse(seed, 'math');

  SUBJECT_ORDER.forEach(id => {
    const source = SUBJECTS[id];
    const subject = seed.courses[id];
    const questions = subject.questions;
    const [q1, q2, q3, q4] = questions;

    PEER_ROWS.forEach(([pid, name, scores], i) => {
      const time = `11-28 ${19 + Math.floor(i / 6)}:${String(10 + (i % 6) * 7).padStart(2, '0')}`;

      seed.submissions.push({
        id: `${id}-sub-a1-${pid}`, courseId: id, classId: DEFAULT_CLASS, assignmentId: subject.assignments[0].id,
        studentId: pid, studentName: name,
        answers: { [q1.id]: scores[0] === q1.score ? q1.answer : (q1.answer + 1) % q1.options.length,
                   [q2.id]: scores[1] === q2.score ? q2.answer : (q2.answer + 1) % q2.options.length },
        scores: { [q1.id]: scores[0], [q2.id]: scores[1] },
        total: scores[0] + scores[1], max: 20,
        status: 'auto', submittedAt: time
      });

      const level = scores[3] >= 16 ? 'high' : scores[3] >= 10 ? 'mid' : 'low';
      const shortText = (source.shortAnswers && source.shortAnswers[level]) || '（答案略）';
      seed.submissions.push({
        id: `${id}-sub-a2-${pid}`, courseId: id, classId: DEFAULT_CLASS, assignmentId: subject.assignments[1].id,
        studentId: pid, studentName: name,
        answers: { [q3.id]: scores[2] === q3.score ? q3.answer : (q3.answer + 1) % q3.options.length,
                   [q4.id]: shortText },
        scores: { [q3.id]: scores[2], [q4.id]: scores[3] },
        total: scores[2] + scores[3], max: 30,
        aiReviews: {
          [q4.id]: {
            score: scores[3],
            comment: level === 'high'
              ? '答案要点完整，术语使用准确，若能再补充一个具体情境会更有说服力。'
              : level === 'mid'
                ? '主要要点已经覆盖，但缺少对适用条件或理论意义的说明，建议对照课件补充。'
                : '只给出结论，缺少公式与推导过程，建议回到课件对应页码重新梳理。'
          }
        },
        status: 'ai_reviewed', submittedAt: time
      });
    });

    (source.seedMessages || []).forEach(msg => {
      seed.messages.push({ ...clone(msg), courseId: id, classId: DEFAULT_CLASS });
    });

    /* 李同学本人有一份已批改的课后作业，含错题，便于展示错题本与重做 */
    const homework = subject.assignments[1];
    const wrongQ = questions[2];
    const shortQ = questions[3];
    if (homework && wrongQ && shortQ) {
      const shortScore = Math.round(shortQ.score * 0.6);
      const shortText = (source.shortAnswers && source.shortAnswers.mid) || '公式基本写对，但缺少适用条件说明。';
      seed.submissions.push({
        id: `${id}-sub-own-a2`,
        courseId: id,
        classId: DEFAULT_CLASS,
        assignmentId: homework.id,
        studentId: 's1',
        studentName: '李同学',
        answers: {
          [wrongQ.id]: (wrongQ.answer + 1) % wrongQ.options.length,
          [shortQ.id]: shortText
        },
        scores: { [wrongQ.id]: 0, [shortQ.id]: shortScore },
        total: shortScore,
        max: wrongQ.score + shortQ.score,
        aiReviews: {
          [shortQ.id]: {
            score: shortScore,
            comment: '要点基本覆盖，但表述停留在结论层面，缺少适用条件与推导过程，建议对照课件原文重新组织。'
          }
        },
        status: 'ai_reviewed',
        submittedAt: '11-28 20:10'
      });
    }

    const aiSeeds = [
      { name: '王一', point: subject.points[0], q: `「${subject.points[0].title}」到底怎么理解？书上这一段没看懂。` },
      { name: '苏晴', point: subject.points[2], q: `能不能用一句话讲清「${subject.points[2].title}」的适用条件？` },
      { name: '邓超', point: subject.points[4], q: `考试里遇到「${subject.points[4].title}」一般先写哪一步？` }
    ];
    aiSeeds.forEach((item, index) => {
      const point = item.point;
      seed.aiQuestions.push({
        id: `${id}-aiq-${index + 1}`,
        courseId: id,
        classId: DEFAULT_CLASS,
        studentId: `ai-s${index + 1}`,
        studentName: item.name,
        question: item.q,
        answer: `${point.summary}\n核心公式：${point.formulas[0]}\n课件依据：《${subject.courseware.fileName}》第 ${point.page} 页。`,
        knowledgeId: point.id,
        createdAt: `11-28 1${index + 7}:2${index}`,
        reviewed: false
      });
    });
  });

  return seed;
}
