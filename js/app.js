/* ============================================================
 * 路由、渲染、事件绑定
 * ============================================================ */

const root = document.getElementById('app');
let liveTimer = null;
let practiceTimer = null;

function parseHash() {
  const raw = (location.hash || '#/login').replace(/^#\/?/, '');
  return raw.split('/').filter(Boolean);
}

function render() {
  const parts = parseHash();
  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
  }

  if (!parts.length || parts[0] === 'login') {
    root.innerHTML = loginView();
    return;
  }

  const role = parts[0];
  const page = parts[1] || (role === 'teacher' ? 'studio' : 'learn');
  const param = parts[2] || '';

  if (!db.session.role || db.session.role !== role) {
    location.hash = db.session.role ? `#/${db.session.role}/${db.session.role === 'teacher' ? 'studio' : 'learn'}` : '#/login';
    return;
  }

  if (role === 'student' && !studentClassIds().length && page !== 'join') {
    location.hash = '#/student/join';
    return;
  }

  let content = '';
  let pageKey = `${role}/${page}`;

  if (role === 'teacher') {
    if (page === 'studio') content = studioView();
    else if (page === 'live') content = liveView();
    else if (page === 'review') content = reviewView();
    else if (page === 'exam') content = examView();
    else if (page === 'textbook') content = textbookView();
    else if (page === 'classes') content = classesView();
    else if (page === 'qa') content = qaView();
    else if (page === 'analytics') content = analyticsView();
    else { location.hash = '#/teacher/studio'; return; }
  } else {
    if (page === 'learn') content = learnView();
    else if (page === 'practice') content = param ? playerView(param) : practiceView();
    else if (page === 'exercise') content = param ? exercisePlayerView(param) : practiceView();
    else if (page === 'messages') content = messagesView();
    else if (page === 'ai') content = aiChatView();
    else if (page === 'wrong') content = wrongBookView();
    else if (page === 'redo') content = redoView();
    else if (page === 'join') content = joinView();
    else { location.hash = '#/student/learn'; return; }
  }

  if (page === 'practice' && param) {
    pageKey = 'student/practice';
  }
  if (page === 'exercise') {
    pageKey = 'student/exercise';
  }
  if (page === 'redo') {
    pageKey = 'student/wrong';
  }

  root.innerHTML = shellView(pageKey, content);

  if (ui.gen) {
    const input = document.getElementById('ppt-input');
    if (input) input.value = '';
  }
  if (ui.examGen) {
    const input = document.getElementById('exam-input');
    if (input) input.value = '';
  }

  /* 学生作业页：每分钟刷新一次，保证倒计时与提交状态及时更新 */
  if (db.session.role === 'student' && page === 'practice') {
    if (practiceTimer) clearInterval(practiceTimer);
    practiceTimer = setInterval(() => {
      if (location.hash !== '#/student/practice') return;
      const top = window.scrollY;
      render();
      window.scrollTo(0, top);
    }, 60000);
  }

  /* 课上问答页：定时从本地存储刷新，保证正答率及时更新 */
  if (db.session.role === 'teacher' && page === 'live') {
    liveTimer = setInterval(() => {
      if (!location.hash.startsWith('#/teacher/live')) return;
      const top = window.scrollY;
      db = loadDb();
      render();
      window.scrollTo(0, top);
    }, 4000);
  }
}

/* ---------------- 事件委托 ---------------- */

/* 思维导图缩放：直接改 DOM，避免 render 重建丢失滚动位置 */
function applyMindmapZoom(newScale) {
  ui.mmScale = Math.max(0.4, Math.min(3, Number(newScale) || 1));
  const scroll = document.querySelector('.mindmap-scroll');
  if (!scroll) return;
  const stage = scroll.querySelector('.mm-stage');
  const canvas = scroll.querySelector('.mindmap-canvas');
  if (!canvas) return;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.style.transform = `scale(${ui.mmScale})`;
  if (stage) {
    stage.style.width = Math.ceil(w * ui.mmScale) + 'px';
    stage.style.height = Math.ceil(h * ui.mmScale) + 'px';
  }
  const label = document.querySelector('.mm-zoom-label');
  if (label) label.textContent = Math.round(ui.mmScale * 100) + '%';
}

/* Ctrl/⌘ + 滚轮以指针为中心缩放导图；普通滚轮仍用于滚动 */
document.addEventListener('wheel', event => {
  if (!event.ctrlKey && !event.metaKey) return;
  const scroll = event.target.closest('.mindmap-scroll');
  if (!scroll) return;
  const canvas = scroll.querySelector('.mindmap-canvas');
  if (!canvas) return;
  event.preventDefault();
  const rect = scroll.getBoundingClientRect();
  const stage = scroll.querySelector('.mm-stage');
  const oldScale = Number(ui.mmScale) || 1;
  const mx = event.clientX - rect.left + scroll.scrollLeft;
  const my = event.clientY - rect.top + scroll.scrollTop;
  const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
  const newScale = Math.max(0.4, Math.min(3, +(oldScale * factor).toFixed(3)));
  if (newScale === oldScale) return;
  ui.mmScale = newScale;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.style.transform = `scale(${newScale})`;
  if (stage) {
    stage.style.width = Math.ceil(w * newScale) + 'px';
    stage.style.height = Math.ceil(h * newScale) + 'px';
  }
  const ratio = newScale / oldScale;
  scroll.scrollLeft = mx * ratio - (event.clientX - rect.left);
  scroll.scrollTop = my * ratio - (event.clientY - rect.top);
  const label = document.querySelector('.mm-zoom-label');
  if (label) label.textContent = Math.round(newScale * 100) + '%';
}, { passive: false });

document.addEventListener('click', event => {
  const target = event.target.closest('[data-act]');
  if (!target) return;
  const act = target.dataset.act;
  const id = target.dataset.id;

  switch (act) {
    case 'logout':
      logout();
      break;
    case 'create-class':
      createClass();
      break;
    case 'switch-class':
      switchClass(id);
      break;
    case 'reset-demo':
      resetDemo();
      break;
    case 'open-scan':
      openScan();
      break;
    case 'close-scan':
      closeScan();
      break;
    case 'scan-manual':
      scanToManual();
      break;
    case 'open-create-course':
      openCreateCourse();
      break;
    case 'close-create-course':
      closeCreateCourse();
      break;
    case 'create-course':
      createCourse();
      break;

    case 'switch-student-course':
      switchStudentCourse(id);
      break;
    case 'open-practice-item':
      openPracticeItem(target.dataset.kind, id, target.dataset.course);
      break;
    case 'start-practice-item':
      startPracticeItem(target.dataset.kind, id, target.dataset.course);
      break;

    case 'wrong-course':
      switchWrongCourse(id);
      break;
    case 'toggle-wrong':
      toggleWrongSelection(id);
      break;
    case 'select-all-wrong':
      selectAllWrongQuestions();
      break;
    case 'clear-wrong':
      clearWrongSelection();
      break;
    case 'start-redo':
      startWrongRedo();
      break;
    case 'redo-option':
      setRedoOption(id, Number(target.dataset.index));
      break;
    case 'submit-redo':
      submitRedo();
      break;
    case 'exit-redo':
      exitRedo();
      break;

    case 'select-chapter': {
      const chapter = chapterOf(id);
      ui.chapterId = id;
      ui.sectionId = chapter.sections[0].id;
      render();
      break;
    }
    case 'select-section':
      ui.sectionId = id;
      render();
      break;
    case 'toggle-node': {
      ui.mmCollapsed = ui.mmCollapsed || {};
      if (ui.mmCollapsed[id]) delete ui.mmCollapsed[id];
      else ui.mmCollapsed[id] = true;
      render();
      break;
    }
    case 'toggle-mm-edit':
      ui.mmEdit = !ui.mmEdit;
      ui.editingNode = null;
      render();
      break;
    case 'mm-zoom': {
      const dir = target.dataset.dir;
      let s = Number(ui.mmScale) || 1;
      if (dir === 'in') s = Math.min(3, +(s * 1.2).toFixed(3));
      else if (dir === 'out') s = Math.max(0.4, +(s / 1.2).toFixed(3));
      else s = 1;
      applyMindmapZoom(s);
      if (dir === 'reset') {
        const sc = document.querySelector('.mindmap-scroll');
        if (sc) { sc.scrollLeft = 0; sc.scrollTop = 0; }
      }
      break;
    }
    case 'edit-mm-node':
      ui.editingNode = { type: target.dataset.type, id: target.dataset.id };
      render();
      break;
    case 'add-mm-node':
      ui.editingNode = { type: target.dataset.type, parentId: target.dataset.parent };
      render();
      break;
    case 'close-mm-modal':
      ui.editingNode = null;
      render();
      break;
    case 'save-mm-node':
      saveMindmapNode();
      break;
    case 'open-point':
      ui.drawerPointId = id;
      render();
      break;
    case 'close-drawer':
      ui.drawerPointId = null;
      render();
      break;

    case 'ask-from-point': {
      const point = P(id);
      ui.drawerPointId = null;
      ui.prefillMessage = point
        ? `老师，我对「${point.title}」这部分还不太理解，能再讲讲吗？（课件第 ${point.page} 页）`
        : '';
      location.hash = '#/student/messages';
      render();
      break;
    }

    case 'open-upload':
      document.getElementById('ppt-input')?.click();
      break;
    case 'open-exam-upload':
      document.getElementById('exam-input')?.click();
      break;
    case 'open-exam':
      openExam(id);
      break;
    case 'confirm-exam':
      confirmExam();
      break;
    case 'batch-objective':
      batchObjective(target.dataset.mode);
      break;
    case 'tb-tab':
      ui.tbTab = target.dataset.tab;
      render();
      break;
    case 'toggle-ex-select':
      toggleExerciseSelect(id);
      break;
    case 'ex-group':
      toggleExerciseGroup(id);
      break;
    case 'ex-difficulty':
      toggleExerciseDifficulty(target.dataset.level);
      break;
    case 'clear-ex':
      clearExerciseSelection();
      break;
    case 'smart-recommend-ex':
      applyRecommendedExercises();
      break;
    case 'select-all-ex':
      selectAllExercises();
      break;
    case 'distribute-exercises':
      distributeExercises();
      break;
    case 'toggle-ex-target':
      toggleExTarget(id);
      break;
    case 'toggle-review-point':
      toggleReviewPoint(id);
      break;
    case 'remove-review-point':
      removeReviewPoint(id);
      break;
    case 'clear-review-list':
      clearReviewList();
      break;
    case 'open-review-point':
      openReviewPoint(id);
      break;
    case 'close-review-point':
      closeReviewPoint();
      break;
    case 'wrong-point-filter':
      ui.wrongPointFilter = id || '';
      render();
      break;
    case 'submit-exercise':
      submitExercise(id);
      break;
    case 'demo-generate':
      runGeneration('机器学习基础（新）.pptx');
      break;

    case 'edit-question':
      openQuestionEditor(id);
      break;
    case 'save-question': {
      const form = document.getElementById('question-form');
      if (!form) break;
      const data = {
        qid: form.dataset.qid,
        stem: form.querySelector('[name="stem"]').value.trim(),
        score: form.querySelector('[name="score"]').value,
        answer: form.querySelector('[name="answer"]:checked')?.value
      };
      const q = Q(data.qid);
      if (q.type === 'single') {
        data.options = q.options.map((_, i) => form.querySelector(`[name="option-${i}"]`).value.trim());
        if (data.answer === undefined) {
          toast('请选择正确答案');
          break;
        }
      }
      if (!data.stem) {
        toast('题干不能为空');
        break;
      }
      saveQuestionEditor(data);
      break;
    }
    case 'close-modal':
      closeQuestionEditor();
      break;

    case 'publish':
      publishQuestion(id, target.dataset.mode);
      break;

    case 'preview-question':
      openTutor(id);
      break;

    case 'practice-tab':
      ui.practiceTab = target.dataset.tab;
      ui.practiceItem = null;
      render();
      break;
    case 'learn-tab':
      switchLearnTab(target.dataset.tab);
      break;
    case 'ppt-page':
      gotoPptPage(target.dataset.page);
      break;
    case 'ai-section':
      setAiSection(target.dataset.id);
      break;
    case 'ai-chapter':
      setAiChapter(target.dataset.id);
      break;
    case 'open-courseware':
      openCoursewareAt(target.dataset.page);
      break;
    case 'teacher-ppt-preview':
      openTeacherPpt();
      break;
    case 'teacher-ppt-page':
      gotoTeacherPptPage(target.dataset.page);
      break;
    case 'close-teacher-ppt':
      closeTeacherPpt();
      break;
    case 'save-point-pages':
      savePointPages();
      break;
    case 'qa-tab':
      ui.qaTab = target.dataset.tab;
      ui.activeMessageId = null;
      ui.activeAiQuestionId = null;
      render();
      break;

    case 'open-ai-question':
      openAiQuestion(id);
      break;
    case 'toggle-ai-reviewed':
      toggleAiReviewed(id);
      break;
    case 'ai-home-send':
      sendAiHome();
      break;
    case 'ai-suggest':
      askAiHome(target.dataset.text);
      break;
    case 'ai-home-mode':
      setAiHomeMode(target.dataset.mode);
      break;
    case 'ai-home-hint':
      askHint(Number(target.dataset.level), ui.aiHomeQuestionId);
      break;
    case 'ai-home-tutor-send':
      sendAiHomeTutor();
      break;

    case 'start-assignment':
      startAssignment(id);
      break;
    case 'ask-assignment': {
      const assignment = A(id);
      if (assignment && assignment.questionIds.length) openTutor(assignment.questionIds[0]);
      break;
    }

    case 'select-option': {
      const qid = id;
      const index = Number(target.dataset.index);
      selectOption(qid, index);
      break;
    }

    case 'jump': {
      const el = document.getElementById(`q-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }

    case 'submit-assignment':
      submitAssignment(id);
      break;

    case 'open-tutor':
      openTutor(id);
      break;
    case 'open-point-from-tutor':
      ui.tutorQuestionId = null;
      ui.drawerPointId = id;
      render();
      break;
    case 'close-tutor':
      closeTutor();
      break;
    case 'ai-hint':
      askHint(Number(target.dataset.level));
      break;
    case 'tutor-send': {
      const input = document.getElementById('tutor-input');
      if (!input) break;
      const text = input.value.trim();
      if (!text) break;
      askTutor(text);
      break;
    }

    case 'open-review':
      openReview(id);
      break;
    case 'review-filter':
      ui.reviewFilter = target.dataset.tab;
      render();
      break;
    case 'batch-adopt-reviews':
      batchAdoptReviews();
      break;
    case 'quick-score':
      quickScore(target.dataset.score);
      break;
    case 'quick-comment':
      quickComment(target.dataset.text);
      break;
    case 'save-review': {
      const scoreInput = document.getElementById('review-score');
      const commentInput = document.getElementById('review-comment');
      if (!scoreInput || !commentInput || !ui.reviewDraft) break;
      ui.reviewDraft.score = scoreInput.value;
      ui.reviewDraft.comment = commentInput.value;
      saveReview();
      break;
    }

    case 'open-message':
      openMessage(id);
      break;
    case 'send-reply': {
      const input = document.getElementById('reply-input');
      if (!input) break;
      sendReply(id, input.value);
      break;
    }
    case 'reopen-reply': {
      const message = db.messages.find(m => m.id === id);
      if (message) {
        message.answer = null;
        message.answeredBy = null;
        saveDb();
        render();
      }
      break;
    }
    case 'send-message': {
      const body = document.getElementById('msg-body');
      const question = document.getElementById('msg-question');
      const anon = document.getElementById('msg-anon');
      const teacher = document.getElementById('msg-teacher');
      if (!body) break;
      sendMessage({
        body: body.value,
        questionId: question ? question.value : '',
        anonymous: !!(anon && anon.checked),
        addressedTo: teacher ? teacher.value : ''
      });
      break;
    }

    default:
      break;
  }
});

/* 主观题输入：保存但不重绘，避免丢失焦点 */
document.addEventListener('input', event => {
  const el = event.target;
  if (el.dataset && el.dataset.act === 'redo-short' && el.dataset.id) {
    setRedoShort(el.dataset.id, el.value);
  }
  if (el.dataset && el.dataset.act === 'short-input' && el.dataset.id) {
    setShortAnswer(el.dataset.id, el.value);
    const assignmentId = parseHash()[2];
    const assignment = A(assignmentId);
    if (assignment) {
      const count = assignment.questionIds.filter(answered).length;
      const badge = document.querySelector('.card-head .badge');
      if (badge) badge.textContent = `${count} / ${assignment.questionIds.length}`;
      assignment.questionIds.forEach((qid, index) => {
        const dot = document.querySelectorAll('.ans-dot')[index];
        if (dot) dot.classList.toggle('done', answered(qid));
      });
    }
  }
});

/* 回车发送 AI 追问 */
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target.id === 'tutor-input') {
    event.preventDefault();
    const text = event.target.value.trim();
    if (text) askTutor(text);
  }
  if (event.key === 'Enter' && event.target.id === 'ai-home-input') {
    event.preventDefault();
    sendAiHome();
  }
  if (event.key === 'Enter' && event.target.id === 'ai-home-tutor-input') {
    event.preventDefault();
    sendAiHomeTutor();
  }
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && event.target.id === 'reply-input') {
    event.preventDefault();
    sendReply(ui.activeMessageId, event.target.value);
  }
});

/* 课件文件选择 */
document.addEventListener('change', event => {
  if (event.target.id === 'ai-page-select') {
    setAiPage(event.target.value);
    return;
  }
  if (event.target.id === 'ai-home-question-select') {
    setAiHomeQuestion(event.target.value);
    return;
  }
  if (event.target.id === 'ppt-input') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    runGeneration(file.name);
  }
  if (event.target.id === 'exam-input') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    runExamAnnotation(file.name);
  }
  if (event.target.id === 'class-switch') {
    switchClass(event.target.value);
  }
  if (event.target.id === 'course-switch') {
    switchCourse(event.target.value);
  }
  if (event.target.id === 'student-course-switch') {
    switchStudentCourse(event.target.value);
  }
});

/* 登录表单提交 */
document.addEventListener('submit', event => {
  if (event.target.id === 'join-form') {
    event.preventDefault();
    submitJoinForm();
    return;
  }
  if (event.target.id !== 'login-form') return;
  event.preventDefault();
  const user = document.getElementById('login-user');
  const pass = document.getElementById('login-pass');
  doLogin(user ? user.value : '', pass ? pass.value : '');
});

window.addEventListener('hashchange', render);

/* 其他标签页提交后，课上问答立即刷新 */
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  if (!location.hash.startsWith('#/teacher/live')) return;
  db = loadDb();
  render();
});

/* 每次打开或刷新页面都回到登录页，必须重新输入账号密码 */
db.session.role = null;
db.session.userId = null;
saveDb();
const joinQuery = new URLSearchParams(location.search).get('join');
if (joinQuery) ui.pendingJoin = joinQuery.trim();
history.replaceState(null, '', '#/login');
render();
