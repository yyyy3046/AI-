/* ============================================================
 * 教师端页面
 * ============================================================ */

function studioView() {
  const totalPoints = db.points.length;
  const publishedCount = db.assignments.reduce((sum, a) => sum + a.questionIds.length, 0);
  const gen = ui.gen;

  const stepsHtml = GEN_STEPS.map((label, i) => {
    let cls = '';
    let mark = '';
    if (gen) {
      if (i < gen.step) { cls = 'done'; mark = '✓'; }
      else if (i === gen.step) { cls = 'active'; mark = '·'; }
    } else {
      cls = 'done'; mark = '✓';
    }
    return `<div class="gen-step ${cls}"><span class="dot">${mark}</span>${esc(label)}</div>`;
  }).join('');

  const questionHtml = db.questions.map((q, index) => {
    const used = assignmentOfQuestion(q.id);
    const point = P(q.knowledgeId);
    return `
    <div class="q-card">
      <div class="q-head">
        <div style="min-width:0">
          <div class="q-stem"><span class="q-no">Q${index + 1}</span> ${esc(q.stem)}</div>
          <div class="q-meta">
            <span>${q.type === 'single' ? '单选题' : '简答题'}</span>
            <span>·</span><span>${q.score} 分</span>
            <span>·</span><span>${esc(point?.title || '')}</span>
            <span>·</span><span>第 ${point?.page} 页</span>
            ${used ? `<span class="badge brand">已用于${used.mode === 'quiz' ? '课堂问答' : '课后作业'}</span>` : '<span class="badge warning">未发布</span>'}
          </div>
        </div>
        <button class="btn btn-sm" data-act="edit-question" data-id="${q.id}">编辑</button>
      </div>
      ${q.type === 'single' ? `
        <div>
          ${q.options.map((opt, i) => `
            <div class="option ${q.answer === i ? 'correct' : ''}">
              <span class="key">${String.fromCharCode(65 + i)}</span>
              <span>${esc(opt)}</span>
            </div>`).join('')}
        </div>` : `<div class="privacy-note">简答题将由 AI 按评分要点给出建议分数与评语，教师可复核调整。</div>`}
      <div class="q-actions">
        <button class="btn btn-sm" data-act="publish" data-mode="quiz" data-id="${q.id}">发布为课堂问答</button>
        <button class="btn btn-sm" data-act="publish" data-mode="homework" data-id="${q.id}">发布为课后作业</button>
        <button class="btn btn-sm btn-ghost" data-act="preview-question" data-id="${q.id}">学生视角预览</button>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="grid-3" style="margin-bottom:16px">
    <div class="card">
      <div class="card-head"><h2>课件 · ${esc(db.course.name)}</h2>${gen ? '<span class="badge ai">AI 处理中</span>' : '<span class="badge success">已解析</span>'}</div>
      <div class="card-body">
        <div class="file-row">
          <div class="file-ico">PPT</div>
          <div style="min-width:0">
            <b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${esc(db.courseware.fileName)}</b>
            <span>${esc(db.courseware.size)} · ${db.courseware.pages} 页 · ${esc(db.courseware.uploadedAt)}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="gen-steps">${stepsHtml}</div>
        <input type="file" id="ppt-input" accept=".ppt,.pptx" style="display:none">
        <div class="q-actions" style="margin-top:10px">
          <button class="btn btn-sm" data-act="teacher-ppt-preview">预览课件</button>
          <span class="form-hint" style="margin:0">可在下方标注知识点页码</span>
        </div>
        <button class="btn btn-block" style="margin-top:10px" data-act="open-upload">${gen ? '正在处理…' : '选择新的课件文件'}</button>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>生成结果</h2><span class="badge">模拟 AI</span></div>
      <div class="card-body">
        <div class="grid-2" style="gap:10px">
          <div class="metric" style="box-shadow:none"><div class="label">章节</div><div class="value">${db.mindMap.length}</div></div>
          <div class="metric" style="box-shadow:none"><div class="label">知识点</div><div class="value">${totalPoints}</div></div>
          <div class="metric" style="box-shadow:none"><div class="label">已生成题目</div><div class="value">${db.questions.length}</div></div>
          <div class="metric" style="box-shadow:none"><div class="label">已发布题目</div><div class="value">${publishedCount}</div></div>
        </div>
        <div class="privacy-note" style="margin-top:12px">
          导图与题目均标注了课件页码，学生点击知识点可直接回溯原文，避免 AI 脱离课件自由发挥。
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>课程任务</h2><span class="badge">${db.assignments.length} 个</span></div>
      <div class="card-body">
        ${db.assignments.map(a => `
          <div style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
              <b style="font-size:13px">${esc(a.title)}</b>
              <span class="badge ${a.mode === 'quiz' ? 'brand' : 'ai'}">${a.mode === 'quiz' ? '课堂问答' : '课后作业'}</span>
            </div>
            <div class="q-meta"><span>${a.questionIds.length} 题</span><span>·</span><span>${totalScore(a.questionIds)} 分</span><span>·</span><span>${esc(a.publishedAt)}</span></div>
            ${a.mode === 'homework' && a.dueAt ? `
              <div class="deadline ${isExpired(a) ? 'danger' : ''}" style="margin-top:6px">
                <span>⏰ 截止 ${formatDue(a.dueAt)}</span>
                <span>${remainingText(a)}</span>
              </div>` : ''}
          </div>`).join('') || '<div class="empty">暂无任务</div>'}
        <a class="btn btn-block" style="margin-top:14px" href="#/teacher/analytics">查看学情看板</a>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <div>
        <h2>课件思维导图</h2>
        <div class="sub">点击章节 → 小节 → 知识点，查看公式、参数与课件原文</div>
      </div>
      <div class="tag-row">
        <span class="badge outline">${db.mindMap.length} 章节</span>
        <span class="badge outline">${db.points.length} 知识点</span>
      </div>
    </div>
    <div class="card-body" style="padding:0">${mindmapView()}</div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head">
      <div>
        <h2>课件页码标注</h2>
        <div class="sub">修改后学生端知识导图、课件 PPT 与 AI 回答引用同步更新</div>
      </div>
      <div class="tag-row">
        <button class="btn btn-sm" data-act="teacher-ppt-preview">预览课件</button>
        <button class="btn btn-sm btn-primary" data-act="save-point-pages">保存页码</button>
      </div>
    </div>
    <div class="card-body" style="padding:0 18px">
      <table class="table">
        <thead><tr><th>知识点</th><th>所属章节</th><th>课件页码</th></tr></thead>
        <tbody>
          ${db.mindMap.flatMap(chapter => chapter.sections.flatMap(section => section.points.map(id => ({ chapter, section, point: P(id) }))))
            .filter(row => row.point)
            .map(row => `
              <tr>
                <td>${esc(row.point.title)}</td>
                <td>${esc(row.chapter.title)} / ${esc(row.section.title)}</td>
                <td><input class="input" type="number" min="1" max="${db.courseware.pages}" value="${row.point.page}" data-point-page="${row.point.id}" style="width:90px"></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <div>
        <h2>AI 生成题目</h2>
        <div class="sub">题目均标注来源知识点与页码，可编辑后发布</div>
      </div>
      <span class="badge ai">AI 生成 · 可编辑</span>
    </div>
    <div class="card-body">${questionHtml}</div>
  </div>
  ${teacherPptModal(ui.pptPreviewPage)}`;
}

/** 教师课件预览弹窗：与学生端共用幻灯片渲染 */
function teacherPptModal(activePage) {
  if (!activePage) return '';
  const pages = coursewarePages();
  if (!pages.length) return '';
  const total = db.courseware.pages || pages[pages.length - 1].page;
  const current = pages.find(item => item.page === Number(activePage)) || pages[0];
  const index = pages.indexOf(current);
  const prev = pages[index - 1];
  const next = pages[index + 1];

  return `
  <div class="modal-mask">
    <div class="modal teacher-ppt-modal">
      <div class="drawer-head">
        <div>
          <h3>课件预览</h3>
          <div class="sub">${esc(db.courseware.fileName)} · 第 ${current.page} 页 / 共 ${total} 页 · 仅教师可见</div>
        </div>
        <button class="close-btn" data-act="close-teacher-ppt">×</button>
      </div>
      <div class="card-body">
        <div class="ppt-pages" style="flex-direction:row;overflow-x:auto;max-height:none;margin-bottom:12px">
          ${pages.map(item => `
            <button class="ppt-page-chip ${item.page === current.page ? 'active' : ''}" data-act="teacher-ppt-page" data-page="${item.page}">
              <b>${item.page}</b><span>${esc(item.points[0].title)}</span>
            </button>`).join('')}
        </div>
        <div class="ppt-stage">${pptSlideHtml(current, total)}</div>
        <div class="ppt-nav">
          <button class="btn btn-sm" data-act="teacher-ppt-page" data-page="${prev ? prev.page : ''}" ${prev ? '' : 'disabled'}>← 上一页</button>
          <span class="ppt-nav-hint">第 ${current.page} 页 · 已标注 ${index + 1}/${pages.length}</span>
          <button class="btn btn-sm" data-act="teacher-ppt-page" data-page="${next ? next.page : ''}" ${next ? '' : 'disabled'}>下一页 →</button>
        </div>
      </div>
    </div>
  </div>`;
}

function reviewView() {
  const homework = db.assignments.find(a => a.mode === 'homework');
  const submissions = homework ? db.submissions.filter(s => s.assignmentId === homework.id && s.classId === teacherClassId()) : [];
  const active = ui.activeSubmissionId ? submissionOf(ui.activeSubmissionId) : null;
  const shortQ = db.questions.find(q => q.type === 'short');
  const shortId = shortQ ? shortQ.id : null;

  const filter = ui.reviewFilter || 'pending';
  const pendingCount = submissions.filter(s => s.status !== 'reviewed').length;
  const reviewedCount = submissions.length - pendingCount;

  const visible = submissions
    .filter(s => filter === 'all' ? true : filter === 'pending' ? s.status !== 'reviewed' : s.status === 'reviewed')
    .sort((a, b) => {
      const p = (a.status !== 'reviewed' ? 0 : 1) - (b.status !== 'reviewed' ? 0 : 1);
      return p !== 0 ? p : (a.submittedAt < b.submittedAt ? 1 : -1);
    });

  const listHtml = visible.map(s => {
    const reviewed = s.status === 'reviewed';
    return `
    <div class="msg clickable ${active && active.id === s.id ? 'active' : ''}" data-act="open-review" data-id="${s.id}">
      <div class="msg-head">
        <span class="avatar">${esc(s.studentName.slice(0, 1))}</span>
        <span class="msg-author">${esc(s.studentName)}</span>
        <span class="badge ${reviewed ? 'success' : 'ai'}">${reviewed ? '已复核' : 'AI 初评'}</span>
        <span class="msg-time">${esc(s.submittedAt)}</span>
      </div>
      <div class="msg-body">得分 ${s.total} / ${s.max}</div>
    </div>`;
  }).join('');

  let detailHtml;
  if (!active) {
    detailHtml = `<div class="empty"><b>选择一名学生的提交</b>查看答案、AI 评分依据并进行复核</div>`;
  } else {
    const generated = shortId ? active.aiReviews?.[shortId] : null;
    const objId = homework.questionIds.find(id => Q(id).type === 'single');
    const objQ = objId ? Q(objId) : null;
    const objScore = objId ? active.scores[objId] : 0;

    detailHtml = `
      <div class="card-head">
        <div>
          <h2>${esc(active.studentName)} · 课后作业</h2>
          <div class="sub">提交于 ${esc(active.submittedAt)} · 总分 ${active.total} / ${active.max}</div>
        </div>
        <span class="badge ${active.status === 'reviewed' ? 'success' : 'ai'}">${active.status === 'reviewed' ? '教师已复核' : '待复核'}</span>
      </div>
      <div class="card-body">
        ${objQ ? `
        <div class="q-stem">客观题 · ${esc(objQ.stem)}</div>
        <div class="q-meta"><span>单选题 · ${objQ.score} 分</span><span>·</span><span>得分 ${objScore}</span></div>
        <div class="review-card">
          <div class="review-head"><b>客观题自动判分</b><span class="badge ${objScore === objQ.score ? 'success' : 'danger'}">${objScore === objQ.score ? '回答正确' : '回答错误'}</span></div>
          <div class="review-text">学生答案：${esc(objQ.options[active.answers[objQ.id]] || '未作答')}<br>正确答案：${esc(objQ.options[objQ.answer])}</div>
        </div>` : ''}

        ${shortQ ? `
        <div class="q-stem" style="margin-top:18px">简答题 · ${esc(shortQ.stem)}</div>
        <div class="q-meta"><span>简答题 · ${shortQ.score} 分</span><span>·</span><span>AI 建议 ${generated ? generated.score : 0} 分</span></div>
        <div class="review-card" style="background:var(--surface-2)">
          <div class="review-head"><b>学生作答</b></div>
          <div class="review-text">${esc(active.answers[shortQ.id] || '未作答')}</div>
        </div>
        ${generated ? `
        <div class="review-card ai">
          <div class="review-head">
            <b>🤖 AI 初评</b>
            <span class="badge ai">建议 ${generated.score} 分</span>
          </div>
          <div class="review-text">${esc(generated.comment).replace(/\n/g, '<br>')}</div>
        </div>` : ''}

        <div class="divider"></div>
        <div class="grid-2" style="gap:12px">
          <div class="field" style="margin-bottom:0">
            <label>教师最终得分（满分 ${shortQ.score}）</label>
            <input class="input" type="number" id="review-score" min="0" max="${shortQ.score}" value="${ui.reviewDraft ? ui.reviewDraft.score : (generated ? generated.score : 0)}">
          </div>
          <div class="field" style="margin-bottom:0">
            <label>复核状态</label>
            <input class="input" value="${active.teacherReview ? '已复核 · ' + esc(active.teacherReview.reviewedAt) : '尚未复核'}" disabled>
          </div>
        </div>
        <div class="field" style="margin-top:12px">
          <label>教师评语</label>
          <textarea class="textarea" id="review-comment" style="min-height:80px">${esc(ui.reviewDraft ? ui.reviewDraft.comment : (generated ? generated.comment : ''))}</textarea>
        </div>
        <div class="quick-row">
          <span class="quick-label">快捷评分</span>
          <button class="chip-btn" data-act="quick-score" data-score="ai">采纳 AI（${generated ? generated.score : 0}）</button>
          <button class="chip-btn" data-act="quick-score" data-score="max">满分（${shortQ.score}）</button>
          <button class="chip-btn" data-act="quick-score" data-score="zero">0 分</button>
        </div>
        <div class="quick-row">
          <span class="quick-label">常用评语</span>
          <button class="chip-btn" data-act="quick-comment" data-text="要点完整，术语准确，继续保持。">要点完整</button>
          <button class="chip-btn" data-act="quick-comment" data-text="缺少公式与推导过程，请对照课件补全。">缺少推导</button>
          <button class="chip-btn" data-act="quick-comment" data-text="适用条件说明不清，请回到课件对应页码复习。">条件不清</button>
        </div>
        <div class="q-actions">
          <button class="btn btn-primary" data-act="save-review">完成复核 · 自动下一位</button>
          ${pendingCount > 1 ? `<span class="quick-hint">还有 ${pendingCount - 1} 份待复核，保存后自动切换</span>` : ''}
        </div>` : ''}

        ${active.teacherReview ? `
        <div class="review-card teacher" style="margin-top:14px">
          <div class="review-head"><b>✅ 教师复核结果</b><span class="badge success">${active.teacherReview.score} 分</span></div>
          <div class="review-text">${esc(active.teacherReview.comment)}</div>
        </div>` : ''}
      </div>`;
  }

  const filterName = filter === 'pending' ? '待复核' : filter === 'reviewed' ? '已复核' : '全部';

  return `
  <div class="notice">
    <span>🤖</span>
    <div><b>AI 只给建议，教师保留最终决定权。</b>支持批量采纳与快捷评分，复核后立即同步学生端并计入班级平均分。</div>
  </div>

  <div class="review-top">
    <div class="tabs">
      <button class="tab ${filter === 'pending' ? 'active' : ''}" data-act="review-filter" data-tab="pending">待复核 ${pendingCount}</button>
      <button class="tab ${filter === 'reviewed' ? 'active' : ''}" data-act="review-filter" data-tab="reviewed">已复核 ${reviewedCount}</button>
      <button class="tab ${filter === 'all' ? 'active' : ''}" data-act="review-filter" data-tab="all">全部 ${submissions.length}</button>
    </div>
    ${pendingCount ? `<button class="btn btn-sm btn-primary" data-act="batch-adopt-reviews">一键采纳 AI 并复核 ${pendingCount} 份</button>` : ''}
  </div>

  <div class="master-detail">
    <div class="card">
      <div class="card-head"><h2>${filterName}作业</h2><span class="badge">${visible.length} 份</span></div>
      <div class="card-body">
        ${listHtml ? `<div class="msg-list">${listHtml}</div>` : `<div class="empty"><b>${filter === 'pending' ? '已全部复核完成' : '暂无记录'}</b>${filter === 'pending' ? '可切换到「已复核」或「全部」查看' : '学生提交作业后会出现在这里'}</div>`}
      </div>
    </div>
    <div class="card">${detailHtml}</div>
  </div>`;
}

function aiQuestionsView() {
  const list = (db.aiQuestions || []).filter(q => q.courseId === db.courseId && q.classId === teacherClassId());
  const active = ui.activeAiQuestionId ? list.find(q => q.id === ui.activeAiQuestionId) : null;
  const reviewedCount = list.filter(q => q.reviewed).length;
  const students = new Set(list.map(q => q.studentId)).size;

  const counts = {};
  list.forEach(q => {
    if (q.knowledgeId) counts[q.knowledgeId] = (counts[q.knowledgeId] || 0) + 1;
  });
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const listHtml = list.map(q => {
    const point = q.knowledgeId ? P(q.knowledgeId) : null;
    return `
    <div class="msg clickable ${active && active.id === q.id ? 'active' : ''}" data-act="open-ai-question" data-id="${q.id}">
      <div class="msg-head">
        <span class="avatar">${esc(q.studentName.slice(0, 1))}</span>
        <span class="msg-author">${esc(q.studentName)}</span>
        <span class="badge ${q.reviewed ? 'success' : 'ai'}">${q.reviewed ? '已讲评' : '待讲评'}</span>
        <span class="msg-time">${esc(q.createdAt)}</span>
      </div>
      <div class="msg-body">${esc(q.question)}</div>
      ${point ? `<div class="msg-link">知识点 · ${esc(point.title)} · 第 ${point.page} 页</div>` : ''}
    </div>`;
  }).join('');

  let detailHtml;
  if (!active) {
    detailHtml = `<div class="empty"><b>选择一条 AI 提问</b>查看学生问了什么、AI 如何依据课件回答</div>`;
  } else {
    const point = active.knowledgeId ? P(active.knowledgeId) : null;
    detailHtml = `
    <div class="card-head">
      <div>
        <h2>学生向 AI 的提问</h2>
        <div class="sub">${esc(active.studentName)} · ${esc(active.createdAt)}</div>
      </div>
      <span class="badge ${active.reviewed ? 'success' : 'ai'}">${active.reviewed ? '已讲评' : '待讲评'}</span>
    </div>
    <div class="card-body">
      <div class="review-text" style="font-weight:500">${esc(active.question)}</div>
      <div class="answer" style="margin-top:12px"><b>AI 回答</b>${esc(active.answer)}</div>
      ${point ? `
        <div class="q-actions">
          <button class="btn btn-sm" data-act="open-point" data-id="${active.knowledgeId}">查看课件第 ${point.page} 页</button>
        </div>` : ''}
      <div class="q-actions">
        <button class="btn btn-sm ${active.reviewed ? 'btn-ghost' : 'btn-primary'}" data-act="toggle-ai-reviewed" data-id="${active.id}">
          ${active.reviewed ? '标记为待讲评' : '标记为已讲评'}
        </button>
      </div>
    </div>`;
  }

  return `
  <div class="notice">
    <span>🤖</span>
    <div><b>这里汇总学生向 AI 助教提出的问题</b>，用于发现共性难点、安排课堂讲评。学生姓名仅教师可见，不会公开给其他同学。</div>
  </div>

  <div class="grid-4" style="margin-bottom:16px">
    <div class="metric"><div class="label">AI 提问总数</div><div class="value">${list.length}</div></div>
    <div class="metric"><div class="label">涉及学生</div><div class="value">${students}</div></div>
    <div class="metric"><div class="label">已讲评</div><div class="value">${reviewedCount}</div></div>
    <div class="metric"><div class="label">待讲评</div><div class="value">${list.length - reviewedCount}</div></div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card-head"><h2>高频提问知识点</h2><span class="badge">Top ${ranked.length}</span></div>
    <div class="card-body">
      ${ranked.length
        ? `<div class="tag-row">${ranked.map(([pid, count]) => P(pid)
            ? `<button class="chip-btn" data-act="open-point" data-id="${pid}">${esc(P(pid).title)} · ${count} 次</button>`
            : '').join('')}</div>`
        : '<div class="empty">还没有提问数据</div>'}
    </div>
  </div>

  <div class="master-detail">
    <div class="card">
      <div class="card-head"><h2>提问列表</h2><span class="badge">${list.length} 条</span></div>
      <div class="card-body">
        ${listHtml ? `<div class="msg-list">${listHtml}</div>` : '<div class="empty"><b>暂无提问</b>学生在 AI 问答页提问后会汇总到这里</div>'}
      </div>
    </div>
    <div class="card">${detailHtml}</div>
  </div>`;
}

function qaView() {
  if (ui.qaTab === 'ai') return aiQuestionsView();

  const isPrivate = ui.qaTab === 'private';
  const aiCount = (db.aiQuestions || []).filter(q => q.courseId === db.courseId && q.classId === teacherClassId()).length;
  const list = db.messages.filter(m => m.courseId === db.courseId && m.classId === teacherClassId() && (isPrivate ? m.visibility === 'private' : m.visibility === 'public'));
  const active = ui.activeMessageId ? db.messages.find(m => m.id === ui.activeMessageId) : null;

  const listHtml = list.map(m => {
    const pending = !m.answer;
    return `
    <div class="msg clickable ${active && active.id === m.id ? 'active' : ''}" data-act="open-message" data-id="${m.id}">      <div class="msg-head">
        <span class="avatar ${m.visibility === 'public' ? 'anon' : ''}">${m.visibility === 'public' ? '匿' : esc(m.authorName.slice(0, 1))}</span>
        <span class="msg-author">${m.visibility === 'public' ? '匿名同学' : esc(m.authorName)}</span>
        ${m.addressedToName ? `<span class="badge">请教 ${esc(m.addressedToName)}</span>` : ''}
        <span class="badge ${pending ? 'warning' : 'success'}">${pending ? '待回答' : '已回答'}</span>
        <span class="msg-time">${esc(m.createdAt)}</span>
      </div>
      <div class="msg-body">${esc(m.body)}</div>
      ${m.questionId ? `<div class="msg-link">关联题目 · Q${db.questions.findIndex(q => q.id === m.questionId) + 1}</div>` : ''}
    </div>`;
  }).join('');

  let detailHtml;
  if (!active) {
    detailHtml = `<div class="empty"><b>选择一条提问</b>查看详情并回复学生</div>`;
  } else {
    detailHtml = `
      <div class="card-head">
        <div>
          <h2>${active.visibility === 'public' ? '匿名公开提问' : '学生私信'}</h2>
          <div class="sub">${esc(active.createdAt)}${active.anonymous ? ' · 已获学生授权公开' : ' · 仅双方可见'}${active.addressedToName ? ` · 请教 ${esc(active.addressedToName)}` : ''}</div>
        </div>
        <span class="badge ${active.visibility === 'public' ? 'ai' : 'brand'}">${active.visibility === 'public' ? '问答广场' : '私信'}</span>
      </div>
      <div class="card-body">
        <div class="msg-body" style="font-size:13.5px">${esc(active.body)}</div>
        ${active.questionId ? `
          <div class="privacy-note" style="margin-top:10px">
            <span>🔗</span><div>关联题目：${esc(Q(active.questionId)?.stem || '')}</div>
          </div>` : ''}

        ${active.answer ? `
          <div class="answer" style="margin-top:14px">
            <b>${esc(active.answeredBy || currentTeacher().name)}的回答 · ${esc(active.answeredAt || '')}</b>
            ${esc(active.answer)}
          </div>` : `
          <div class="field" style="margin-top:16px">
            <label>回复学生</label>
            <textarea class="textarea" id="reply-input" placeholder="结合课件内容回答，回答后学生端会立即同步"></textarea>
            <div class="form-hint">${active.visibility === 'public' ? '该问题已匿名公开，回答将对全班可见，请避免提及学生身份信息。' : '私信内容仅学生本人可见，不会出现在问答广场。'}</div>
          </div>
          <button class="btn btn-primary" data-act="send-reply" data-id="${active.id}">发送回答</button>`}

        ${active.answer ? `<div class="q-actions"><button class="btn btn-sm" data-act="reopen-reply" data-id="${active.id}">修改回答</button></div>` : ''}
      </div>`;
  }

  return `
  <div class="notice">
    <span>🔒</span>
    <div><b>隐私规则：</b>学生可勾选「匿名公开」把问题分享到课程问答广场。公开后仅显示「匿名同学」，姓名、头像和学号都不会出现在公共视图中；是否公开由学生决定。</div>
  </div>
  <div style="max-width:480px;margin-bottom:16px">
    <div class="tabs">
      <button class="tab ${isPrivate ? 'active' : ''}" data-act="qa-tab" data-tab="private">学生私信</button>
      <button class="tab ${!isPrivate ? 'active' : ''}" data-act="qa-tab" data-tab="public">问答广场</button>
      <button class="tab" data-act="qa-tab" data-tab="ai">AI 提问 ${aiCount}</button>
    </div>
  </div>
  <div class="master-detail">
    <div class="card">
      <div class="card-head"><h2>${isPrivate ? '私信收件箱' : '公开问答'}</h2><span class="badge">${list.length} 条</span></div>
      <div class="card-body">
        ${listHtml ? `<div class="msg-list">${listHtml}</div>` : '<div class="empty"><b>暂无内容</b>学生提问后会显示在这里</div>'}
      </div>
    </div>
    <div class="card">${detailHtml}</div>
  </div>`;
}

function liveView() {
  const quizzes = db.assignments.filter(a => a.mode === 'quiz');
  const subsAll = db.submissions.filter(s => s.courseId === db.courseId && s.classId === teacherClassId());
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });

  const cards = quizzes.map(a => {
    const subs = subsAll.filter(s => s.assignmentId === a.id);
    const rows = a.questionIds.map((qid, index) => {
      const q = Q(qid);
      const values = subs.map(s => s.answers[qid]).filter(v => v !== undefined && v !== null && v !== '');
      const total = values.length;
      const letter = q.type === 'single' ? String.fromCharCode(65 + q.answer) : '—';
      const correct = q.type === 'single' ? values.filter(v => v === q.answer).length : 0;
      const rate = total ? Math.round((correct / total) * 100) : 0;
      const dist = q.type === 'single' ? q.options.map((opt, i) => {
        const n = values.filter(v => v === i).length;
        const pct = total ? Math.round((n / total) * 100) : 0;
        return `<div class="dist-row">
          <span class="dist-key ${i === q.answer ? 'ok' : ''}">${String.fromCharCode(65 + i)}</span>
          <div class="dist-bar"><i class="${i === q.answer ? 'ok' : ''}" style="width:${pct}%"></i></div>
          <span class="dist-val">${n} 人</span>
        </div>`;
      }).join('') : '';

      return `
      <div class="live-q">
        <div class="live-q-head">
          <div style="min-width:0">
            <div class="q-stem">Q${index + 1} ${esc(q.stem)}</div>
            <div class="q-meta">
              <span>${total} 人作答</span><span>·</span>
              <span>答对 ${correct} 人</span><span>·</span>
              <span>正确答案 ${letter}</span><span>·</span>
              <span>课件第 ${P(q.knowledgeId)?.page} 页</span>
            </div>
          </div>
          <div class="live-rate ${rate >= 60 ? 'ok' : 'low'}"><b>${rate}%</b><small>正答率</small></div>
        </div>
        ${dist ? `<div class="dist">${dist}</div>` : ''}
      </div>`;
    }).join('');

    return `
    <div class="card">
      <div class="card-head">
        <div><h2>${esc(a.title)}</h2><div class="sub">${a.questionIds.length} 题 · 满分 ${totalScore(a.questionIds)} 分</div></div>
        <span class="badge brand">${subs.length} 人已提交</span>
      </div>
      <div class="card-body">${rows}</div>
    </div>`;
  }).join('');

  return `
  <div class="page-head">
    <div>
      <h1>课上问答 · 实时正答率</h1>
      <p>学生在课堂提交后，正答率与选项分布会随页面刷新同步更新</p>
    </div>
    <span class="badge success">🔄 每 4 秒自动刷新</span>
  </div>
  ${cards || '<div class="empty"><b>还没有课堂题目</b>去课件工坊把题目发布为课堂问答</div>'}
  <div class="privacy-note" style="margin-top:12px"><span>⏱</span><div>页面更新于 ${time}，数据来自本课程学生提交记录。</div></div>`;
}

function analyticsView() {
  const data = analyticsData();

  const masteryHtml = data.mastery.map(row => {
    const cls = row.rate < 50 ? 'verylow' : row.rate < 75 ? 'low' : '';
    return `
      <div class="bar-row">
        <span>${esc(row.title)}</span>
        <span class="bar-track"><span class="bar-fill ${cls}" style="width:${row.rate}%"></span></span>
        <span class="val">${row.rate}%</span>
      </div>`;
  }).join('');

  const errorHtml = data.errors.map(e => `
    <div class="error-row">
      <div>
        <b>${esc(e.title)}</b>
        <span>${esc(e.pointTitle)} · 第 ${e.page} 页</span>
      </div>
      <span class="badge danger">${e.count} 人错</span>
    </div>`).join('');

  const wrongPointsHtml = data.wrongPoints.map((row, index) => `
    <div class="ws-row ${index < 3 ? 'priority' : ''}">
      <span class="ws-rank">${index + 1}</span>
      <div class="ws-main">
        <div class="ws-title">
          <b>${esc(row.title)}</b>
          <span>课件第 ${row.page} 页</span>
          <span class="badge danger">${row.students} 人 · ${row.wrong} 次错</span>
          <span class="badge">错误率 ${row.rate}%</span>
          ${index < 3 ? '<span class="badge warning">建议下节课先提</span>' : ''}
        </div>
        <div class="ws-stems">
          ${row.stems.map(stem => `<span>${esc(stem.length > 40 ? stem.slice(0, 40) + '…' : stem)}</span>`).join('')}
        </div>
      </div>
      <div class="ws-actions">
        <button class="btn btn-sm ${inReviewList(row.id) ? 'btn-primary' : 'btn-ghost'}" data-act="toggle-review-point" data-id="${row.id}">${inReviewList(row.id) ? '已加入讲评' : '加入讲评'}</button>
        <button class="btn btn-sm btn-ghost" data-act="open-point" data-id="${row.id}">查看知识点</button>
      </div>
    </div>`).join('');

  const reviewItems = currentReviewList();
  const reviewHtml = reviewItems.map((item, index) => `
    <div class="ws-row">
      <span class="ws-rank">${index + 1}</span>
      <div class="ws-main">
        <div class="ws-title">
          <b>${esc(item.title)}</b>
          <span>课件第 ${item.page} 页</span>
          <span class="badge danger">${item.students} 人 · ${item.wrong} 次错</span>
          <span class="badge">错误率 ${item.rate}%</span>
        </div>
        <div class="ws-stems">
          ${(item.stems || []).map(stem => `<span>${esc(stem.length > 40 ? stem.slice(0, 40) + '…' : stem)}</span>`).join('')}
        </div>
      </div>
      <div class="ws-actions">
        <button class="btn btn-sm btn-primary" data-act="open-review-point" data-id="${item.pointId}">课堂展示</button>
        <button class="btn btn-sm btn-ghost" data-act="remove-review-point" data-id="${item.pointId}">移出</button>
      </div>
    </div>`).join('');

  const activeReview = reviewItems.find(item => item.pointId === ui.reviewPointId);
  const reviewOverlay = activeReview ? `
    <div class="modal-mask">
      <div class="modal review-modal">
        <div class="card-head">
          <div>
            <h2>课堂讲评 · ${esc(activeReview.title)}</h2>
            <div class="sub">课件第 ${activeReview.page} 页 · ${activeReview.students} 人错 · ${activeReview.wrong} 次错 · 错误率 ${activeReview.rate}%</div>
          </div>
          <button class="btn btn-sm btn-ghost" data-act="close-review-point">关闭</button>
        </div>
        <div class="card-body">
          <div class="review-hint">建议：先带学生回到课件第 ${activeReview.page} 页回顾定义与适用条件，再请做错的同学上台重做下面这些题。</div>
          <div class="review-stems">
            ${(activeReview.stems || []).map((stem, index) => `<div class="review-stem"><span>Q${index + 1}</span><b>${esc(stem)}</b></div>`).join('')}
          </div>
          <div class="q-actions">
            <button class="btn btn-primary" data-act="open-point" data-id="${activeReview.pointId}">打开课件知识点</button>
            <button class="btn btn-ghost" data-act="remove-review-point" data-id="${activeReview.pointId}">移出讲评清单</button>
          </div>
        </div>
      </div>
    </div>` : '';

  const recentHtml = data.recent.map(s => `
    <tr>
      <td>${esc(s.studentName)}</td>
      <td>${esc(A(s.assignmentId)?.title || '')}</td>
      <td class="num">${s.total} / ${s.max}</td>
      <td>${s.status === 'reviewed' ? '<span class="badge success">已复核</span>' : s.status === 'ai_reviewed' ? '<span class="badge ai">AI 初评</span>' : '<span class="badge">自动判分</span>'}</td>
      <td class="num">${esc(s.submittedAt)}</td>
    </tr>`).join('');

  return `
  <div class="grid-4" style="margin-bottom:16px">
    <div class="metric">
      <div class="label">班级提交率</div>
      <div class="value">${data.submitRate}<small>%</small></div>
      <div class="delta">${data.submitted} / ${currentClass() ? currentClass().studentCount : db.course.studentCount} 人已提交</div>
    </div>
    <div class="metric">
      <div class="label">平均得分率</div>
      <div class="value">${data.avgRate}<small>%</small></div>
      <div class="delta">按已提交作业统计</div>
    </div>
    <div class="metric">
      <div class="label">客观题正确率</div>
      <div class="value">${data.correctRate}<small>%</small></div>
      <div class="delta">${data.correctCount} / ${data.objectiveCount} 次作答正确</div>
    </div>
    <div class="metric">
      <div class="label">待复核份数</div>
      <div class="value">${data.pendingReview}</div>
      <div class="delta">AI 已初评，等待教师确认</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-head">
        <div><h2>知识点掌握度</h2><div class="sub">按已作答的客观题统计</div></div>
        <span class="badge">${data.mastery.length} 个知识点</span>
      </div>
      <div class="card-body">${masteryHtml || '<div class="empty">暂无作答数据</div>'}</div>
    </div>

    <div class="card">
      <div class="card-head">
        <div><h2>共性问题</h2><div class="sub">错误人数最多的题目</div></div>
        <span class="badge warning">建议课堂讲评</span>
      </div>
      <div class="card-body">${errorHtml || '<div class="empty">暂无错题</div>'}</div>
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head">
      <div><h2>错题汇总 · 下节课讲评</h2><div class="sub">按知识点聚合本班客观题失分，错误人数最多的排在最前</div></div>
      <span class="badge ${data.wrongPoints.length ? 'danger' : 'success'}">${data.wrongPoints.length} 个知识点</span>
    </div>
    <div class="card-body">
      ${wrongPointsHtml || '<div class="empty">暂无错题数据，学生作答后这里会自动汇总</div>'}
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head">
      <div><h2>下节课讲评清单</h2><div class="sub">从错题汇总加入，课堂上一键展示题目与错误率</div></div>
      <div class="tag-row">
        <span class="badge ${reviewItems.length ? 'warning' : 'success'}">${reviewItems.length} 个知识点</span>
        ${reviewItems.length ? '<button class="btn btn-sm btn-ghost" data-act="clear-review-list">清空</button>' : ''}
      </div>
    </div>
    <div class="card-body">
      ${reviewHtml || '<div class="empty">还没有加入讲评清单，在下方错题汇总点「加入讲评」</div>'}
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head"><h2>最近提交</h2><span class="badge">${data.recent.length} 条</span></div>
    <div class="card-body" style="padding:0 18px">
      <table class="table">
        <thead><tr><th>学生</th><th>任务</th><th>得分</th><th>状态</th><th>提交时间</th></tr></thead>
        <tbody>${recentHtml}</tbody>
      </table>
    </div>
  </div>
  ${reviewOverlay}`;
}

/* ---------------- 试卷批注 ---------------- */

function examView() {
  const papers = (db.examPapers || []).filter(p => p.classId === teacherClassId());
  const active = ui.activeExamId ? papers.find(p => p.id === ui.activeExamId) : null;
  const gen = ui.examGen;

  const stepsHtml = EXAM_STEPS.map((label, i) => {
    let cls = '';
    let mark = '';
    if (gen) {
      if (i < gen.step) { cls = 'done'; mark = '✓'; }
      else if (i === gen.step) { cls = 'active'; mark = '·'; }
    } else {
      cls = 'done';
      mark = '✓';
    }
    return `<div class="gen-step ${cls}"><span class="dot">${mark}</span>${esc(label)}</div>`;
  }).join('');

  const cardsHtml = papers.map(paper => {
    const score = paper.items.reduce((sum, item) => sum + item.score, 0);
    const max = paper.items.reduce((sum, item) => sum + item.max, 0);
    const rate = max ? Math.round((score / max) * 100) : 0;
    return `
    <div class="card exam-paper ${active && active.id === paper.id ? 'active' : ''}" data-act="open-exam" data-id="${paper.id}">
      <div class="card-head">
        <div>
          <h2>${esc(paper.title)}</h2>
          <div class="sub">${esc(paper.fileName)} · ${esc(paper.uploadedAt)}</div>
        </div>
        <span class="badge ${paper.status === 'confirmed' ? 'success' : 'warning'}">${paper.status === 'confirmed' ? '已确认' : '待批注'}</span>
      </div>
      <div class="card-body">
        <div class="q-meta"><span>${esc(paper.studentName)}</span><span>·</span><span>${paper.items.length} 题</span><span>·</span><span>满分 ${max}</span></div>
        <div class="exam-score-line"><b>${score}</b><small>/ ${max}</small><span>得分率 ${rate}%</span></div>
        <div class="exam-hint">${paper.status === 'confirmed' ? '教师已确认批注，可投屏讲评' : 'AI 已逐题批注，等待教师核对'}</div>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="notice">
    <span>🗂</span>
    <div><b>老师可上传整份试卷，AI 自动切题并逐题批注。</b>批注保留课件页码与原文，教师核对确认后才发布讲评。</div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card-head">
      <div><h2>上传整套试卷</h2><div class="sub">支持 PDF、图片、Word，AI 自动识别题号与知识点</div></div>
      ${gen ? '<span class="badge ai">AI 批注中</span>' : '<span class="badge">模拟 AI</span>'}
    </div>
    <div class="card-body">
      <div class="upload-zone" data-act="open-exam-upload">
        <div class="upload-ico">PDF</div>
        <div class="upload-text">
          <b>点击上传整份试卷</b>
          <span>系统将自动识别版面、切分题目，并对照课件生成分数与批注</span>
        </div>
      </div>
      <input type="file" id="exam-input" accept=".pdf,.png,.jpg,.jpeg,.docx" style="display:none">
      <div class="gen-steps" style="margin-top:14px">${stepsHtml}</div>
    </div>
  </div>

  ${papers.length ? `<div class="grid-2" style="margin-bottom:16px">${cardsHtml}</div>` : '<div class="empty" style="margin-bottom:16px"><b>还没有上传试卷</b>上传后 AI 会给出一份逐题批注</div>'}

  ${examWrongSummary()}

  ${active ? examDetail(active) : `
  <div class="card">
    <div class="empty"><b>选择一份试卷</b>查看 AI 逐题批注，核对分数后发布讲评</div>
  </div>`}`;
}

function examDetail(paper) {
  const score = paper.items.reduce((sum, item) => sum + item.score, 0);
  const max = paper.items.reduce((sum, item) => sum + item.max, 0);
  const rate = max ? Math.round((score / max) * 100) : 0;
  const pending = paper.status !== 'confirmed';
  const wrongCount = paper.items.filter(item => item.score < item.max).length;

  const itemsHtml = paper.items.map(item => {
    const point = P(item.knowledgeId);
    const cls = item.score === item.max ? 'success' : item.score === 0 ? 'danger' : 'warning';
    const typeLabel = item.type === 'single' ? '选择题' : item.type === 'fill' ? '填空题' : (item.comprehensive ? '综合题' : '简答题');
    const autoLabel = item.type === 'single' ? '自动判分' : item.type === 'fill' ? '采分点判分' : 'AI 初评';
    const optionsHtml = item.type === 'single' && item.options
      ? `<div class="exam-options">${item.options.map((opt, i) => {
          const key = String.fromCharCode(65 + i);
          const ok = key === item.correctAnswer;
          const picked = key === item.studentAnswer;
          return `<span class="exam-opt ${ok ? 'ok' : ''} ${picked ? 'picked' : ''}">${key}. ${esc(opt)}</span>`;
        }).join('')}</div>`
      : '';

    return `
    <div class="exam-item">
      <div class="exam-item-head">
        <span class="q-no">第 ${item.no} 题</span>
        <span class="exam-type">${typeLabel}</span>
        <span class="badge ${cls}">${item.score} / ${item.max} 分</span>
        <span class="exam-auto">${autoLabel}</span>
        <span class="exam-point">「${esc(point?.title || '')}」· 第 ${item.page} 页</span>
      </div>
      <div class="exam-stem">${esc(item.stem)}</div>
      ${optionsHtml}
      <div class="exam-answers">
        <div class="exam-ans"><b>学生作答</b><span class="${item.score === item.max ? 'ok' : 'bad'} ${item.type === 'fill' ? 'fill' : ''}">${esc(item.studentAnswer)}</span></div>
        <div class="exam-ans"><b>参考答案</b><span class="${item.type === 'fill' ? 'fill ok' : ''}">${esc(item.correctAnswer)}</span></div>
      </div>
      <div class="review-card ai">
        <div class="review-head"><b>🤖 AI 批注</b><span class="badge ai">建议 ${item.score} 分</span></div>
        <div class="review-text">${esc(item.aiComment)}</div>
        <div class="exam-cite">课件原文 · 第 ${item.page} 页：“${esc(point?.excerpt || '')}”</div>
        ${item.type === 'fill' ? `<div class="exam-points">采分点：公式主体 3 分 · 适用条件与符号 3 分</div>` : ''}
      </div>
      ${pending ? `
        <div class="exam-edit">
          <div class="field" style="margin-bottom:0;max-width:150px">
            <label>教师核定分数</label>
            <input class="input" type="number" min="0" max="${item.max}" value="${item.score}" data-exam-score="${item.no}">
          </div>
          <div class="field" style="margin-bottom:0;flex:1">
            <label>教师补充批注</label>
            <input class="input" value="${esc(item.teacherComment || '')}" placeholder="可留空，沿用 AI 批注" data-exam-comment="${item.no}">
          </div>
        </div>` : (item.teacherComment ? `
        <div class="review-card teacher">
          <div class="review-head"><b>教师补充批注</b></div>
          <div class="review-text">${esc(item.teacherComment)}</div>
        </div>` : '')}
    </div>`;
  }).join('');

  return `
  <div class="card" id="exam-detail">
    <div class="card-head">
      <div>
        <h2>${esc(paper.title)} · 逐题批注</h2>
        <div class="sub">${esc(paper.studentName)} · ${paper.items.length} 题 · 上传于 ${esc(paper.uploadedAt)}</div>
      </div>
      <span class="badge ${pending ? 'warning' : 'success'}">${pending ? '待教师核对' : '已确认 · ' + esc(paper.confirmedAt || '')}</span>
    </div>
    <div class="card-body">
      <div class="exam-summary">
        <div class="metric"><div class="label">整卷得分</div><div class="value">${score}<small>/ ${max}</small></div><div class="delta">得分率 ${rate}%</div></div>
        <div class="metric"><div class="label">失分题数</div><div class="value">${wrongCount}</div><div class="delta">共 ${paper.items.length} 题</div></div>
        <div class="metric"><div class="label">AI 批注</div><div class="value">${paper.items.length}<small> 条</small></div><div class="delta">每条均带课件页码</div></div>
      </div>

      ${pending ? `
      <div class="batch-bar">
        <div class="batch-title">
          <b>批量批改客观题</b>
          <span>选择题 ${paper.items.filter(i => i.type === 'single').length} 题 · 填空题 ${paper.items.filter(i => i.type === 'fill').length} 题，可先统一处理再逐题微调</span>
        </div>
        <div class="batch-actions">
          <button class="btn btn-sm" data-act="batch-objective" data-mode="adopt">采纳 AI 判分</button>
          <span class="batch-add">
            <input class="input" id="batch-delta" type="number" value="1" step="1" style="width:72px">
            <button class="btn btn-sm" data-act="batch-objective" data-mode="add">统一加减分</button>
          </span>
          <button class="btn btn-sm" data-act="batch-objective" data-mode="full">客观题全部满分</button>
        </div>
      </div>` : ''}

      ${itemsHtml}

      ${pending ? `
      <div class="exam-foot">
        <span>核对后可修改分数与批注，确认后即为最终讲评稿。</span>
        <button class="btn btn-primary" data-act="confirm-exam">确认批注并发布讲评</button>
      </div>` : `
      <div class="exam-foot">
        <span>本卷批注已确认，可作为课堂讲评与个别辅导依据。</span>
        <span class="badge success">已确认</span>
      </div>`}
    </div>
  </div>`;
}

function examWrongSummary() {
  const papers = (db.examPapers || []).filter(p => p.classId === teacherClassId());
  const wrongs = [];
  papers.forEach(paper => {
    paper.items.forEach(item => {
      if (item.type === 'short' || item.score >= item.max) return;
      wrongs.push({ paper, item });
    });
  });

  if (!wrongs.length) {
    return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <div><h2>客观题错题汇总</h2><div class="sub">跨试卷汇总选择题与填空题的失分点</div></div>
        <span class="badge success">暂无失分</span>
      </div>
      <div class="card-body"><div class="empty">目前所有客观题均为满分</div></div>
    </div>`;
  }

  const groupMap = {};
  wrongs.forEach(({ paper, item }) => {
    if (!groupMap[item.knowledgeId]) {
      groupMap[item.knowledgeId] = {
        id: item.knowledgeId,
        title: P(item.knowledgeId)?.title || item.knowledgeId,
        page: item.page,
        count: 0,
        items: []
      };
    }
    groupMap[item.knowledgeId].count++;
    groupMap[item.knowledgeId].items.push({ paper, item });
  });
  const groups = Object.values(groupMap).sort((a, b) => b.count - a.count);
  const paperCount = new Set(wrongs.map(w => w.paper.id)).size;

  return `
  <div class="card" style="margin-bottom:16px">
    <div class="card-head">
      <div><h2>客观题错题汇总</h2><div class="sub">跨试卷汇总选择题与填空题的失分点，可直接跳回知识点</div></div>
      <span class="badge danger">${wrongs.length} 道错题</span>
    </div>
    <div class="card-body">
      <div class="grid-3" style="margin-bottom:14px">
        <div class="metric"><div class="label">错题总数</div><div class="value">${wrongs.length}</div><div class="delta">选择题与填空题</div></div>
        <div class="metric"><div class="label">涉及知识点</div><div class="value">${groups.length}</div><div class="delta">按知识点聚合</div></div>
        <div class="metric"><div class="label">涉及试卷</div><div class="value">${paperCount}</div><div class="delta">共 ${papers.length} 份</div></div>
      </div>
      <div class="wrong-groups">
        ${groups.map(group => `
          <div class="wrong-group">
            <div class="wrong-group-head">
              <b>${esc(group.title)}</b>
              <span>第 ${group.page} 页 · ${group.count} 次失分</span>
              <button class="btn btn-sm btn-ghost" data-act="open-point" data-id="${group.id}">查看知识点</button>
            </div>
            <div class="wrong-tags">
              ${group.items.map(({ paper, item }) => `<span class="wrong-tag">${esc(paper.studentName)} · 第 ${item.no} 题</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="wrong-detail-list">
        ${wrongs.map(({ paper, item }) => `
          <div class="wrong-item">
            <span class="wrong-no">第 ${item.no} 题</span>
            <span class="wrong-stem">${esc(item.stem)}</span>
            <span class="wrong-ans">学生 ${esc(item.studentAnswer)} <i>→</i> 正确 ${esc(item.correctAnswer)}</span>
            <span class="wrong-student">${esc(paper.studentName)}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------------- 教材例题与课后习题 ---------------- */

function textbookView() {
  const tab = ui.tbTab === 'exercises' ? 'exercises' : 'examples';
  const textbook = db.textbook;
  const examples = textbook.examples;
  const exercises = textbook.exercises;
  const selected = ui.exSelected || [];

  /* 习题按知识点分组，便于整组挑题 */
  const groups = [];
  const groupIndex = {};
  exercises.forEach(item => {
    if (!groupIndex[item.knowledgeId]) {
      groupIndex[item.knowledgeId] = { knowledgeId: item.knowledgeId, items: [] };
      groups.push(groupIndex[item.knowledgeId]);
    }
    groupIndex[item.knowledgeId].items.push(item);
  });
  const levels = ['基础', '提高', '综合'];
  const exTargets = ui.exTargets === null ? (teacherClassId() ? [teacherClassId()] : []) : ui.exTargets;
  const exClasses = classesOfCourse();

  const tabs = `
  <div class="tabs" style="max-width:320px;margin-bottom:16px">
    <button class="tab ${tab === 'examples' ? 'active' : ''}" data-act="tb-tab" data-tab="examples">教材例题</button>
    <button class="tab ${tab === 'exercises' ? 'active' : ''}" data-act="tb-tab" data-tab="exercises">课后习题</button>
  </div>`;

  if (tab === 'examples') {
    return tabs + `
    <div class="notice">
      <span>🔒</span>
      <div><b>教材例题只在教师端展示。</b>学生端不会出现例题与解析；你勾选下发的课后习题会与作业统一出现在学生端「课后作业」列表里，不标注来源。</div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><h2>教材例题 · 含完整解析</h2><div class="sub">可用于备课、课堂讲评与个别辅导</div></div>
        <span class="badge">${examples.length} 道</span>
      </div>
      <div class="card-body">
        ${examples.map(item => `
          <div class="tb-item">
            <div class="tb-item-head">
              <b>${esc(item.title)}</b>
              <span class="badge outline">${esc(item.source)}</span>
            </div>
            <div class="tb-stem">${esc(item.stem)}</div>
            <details class="tb-solution">
              <summary>查看解析（仅教师可见）</summary>
              <div class="tb-solution-body">${esc(item.solution)}</div>
            </details>
          </div>`).join('')}
      </div>
    </div>`;
  }

  const distHtml = (db.distributed || []).filter(d => d.classId === teacherClassId()).map(dist => {
    const count = (db.exerciseSubmissions || []).filter(s => s.distId === dist.id).length;
    return `
    <div class="tb-dist">
      <div>
        <b>${esc(dist.title)}</b>
        <div class="q-meta">
          <span>${dist.exerciseIds.length} 道题</span><span>·</span>
          <span>下发 ${esc(dist.distributedAt)}</span><span>·</span>
          <span>截止 ${formatDue(dist.dueAt)}</span>
        </div>
      </div>
      <span class="badge ${count ? 'success' : 'warning'}">已提交 ${count} 人</span>
    </div>`;
  }).join('');

  return tabs + `
  <div class="notice">
    <span>📮</span>
    <div><b>学生端只显示习题本身，不展示教材例题与参考解析。</b>习题下发后会并入学生端「课后作业」列表，与 AI 出题、自拟题统一展示，不区分来源。可以按薄弱知识点智能推荐、按知识点整组勾选，或按难度批量选择后下发。</div>
  </div>

  <div class="card">
    <div class="card-head">
      <div><h2>课后习题</h2><div class="sub">${exercises.length} 道 · 已选 ${selected.length} 道</div></div>
      <div class="tag-row">
        <button class="btn btn-sm" data-act="smart-recommend-ex">🤖 智能推荐</button>
        <button class="btn btn-sm btn-ghost" data-act="select-all-ex">${selected.length === exercises.length && exercises.length ? '取消全选' : '全选'}</button>
        <button class="btn btn-sm btn-primary" data-act="distribute-exercises">下发所选（${selected.length}）</button>
      </div>
    </div>
    <div class="card-body">
      <div class="tb-filter-row">
        <span class="quick-hint">按难度批量选择</span>
        ${levels.map(level => {
          const ids = exercises.filter(e => e.difficulty === level).map(e => e.id);
          const on = ids.length > 0 && ids.every(id => selected.includes(id));
          return `<button class="chip-btn ${on ? 'on' : ''}" data-act="ex-difficulty" data-level="${level}">${level} · ${ids.length}</button>`;
        }).join('')}
        <button class="chip-btn" data-act="clear-ex">清空已选</button>
        ${ui.exRecommendReason ? `<span class="tb-reason">🤖 ${esc(ui.exRecommendReason)}</span>` : ''}
      </div>
      <div class="tb-filter-row" style="margin-top:8px">
        <span class="quick-hint">选择性发放到</span>
        ${exClasses.map(cls => `<button class="chip-btn ${exTargets.includes(cls.id) ? 'on' : ''}" data-act="toggle-ex-target" data-id="${cls.id}">${esc(cls.name)}</button>`).join('')}
        <span class="tb-reason">已选 ${exTargets.length} 个班级</span>
      </div>

      ${groups.map(group => {
        const point = P(group.knowledgeId);
        const allIn = group.items.every(item => selected.includes(item.id));
        const inGroup = group.items.filter(item => selected.includes(item.id)).length;
        return `
        <div class="tb-group">
          <div class="tb-group-head">
            <div>
              <b>${esc(point?.title || '未关联知识点')}</b>
              <span>教材第 ${point?.page || '—'} 页 · ${group.items.length} 道 · 已选 ${inGroup}</span>
            </div>
            <button class="btn btn-sm btn-ghost" data-act="ex-group" data-id="${group.knowledgeId}">${allIn ? '取消本组' : '选本组'}</button>
          </div>
          ${group.items.map(item => `
            <div class="tb-hw ${selected.includes(item.id) ? 'selected' : ''}">
              <label class="tb-check">
                <input type="checkbox" ${selected.includes(item.id) ? 'checked' : ''} data-act="toggle-ex-select" data-id="${item.id}">
                <span class="tb-hw-body">
                  <span class="tb-hw-title">${esc(item.title)}</span>
                  <span class="tb-hw-meta">${esc(item.difficulty)} · 教材第 ${item.page} 页</span>
                  <span class="tb-hw-stem">${esc(item.stem)}</span>
                </span>
              </label>
              <details class="tb-solution">
                <summary>参考解答（不下发）</summary>
                <div class="tb-solution-body">${esc(item.reference)}</div>
              </details>
            </div>`).join('')}
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head"><h2>已下发的习题</h2><span class="badge">${(db.distributed || []).filter(d => d.classId === teacherClassId()).length} 组</span></div>
    <div class="card-body">${distHtml || '<div class="empty">还没有下发习题</div>'}</div>
  </div>`;
}

/* ---------------- 班级管理 ---------------- */

function classesView() {
  const classes = classesOfCourse();
  const joinBase = `${location.origin}${location.pathname}?join=`;

  return `
  <div class="notice">
    <span>🏫</span>
    <div><b>班级是行政班，一个班级号对应一个班。</b>学生入班后自动获得本班开设的全部课程；老师在本页创建行政班，并在「新建课程」里选择该课程要开设到哪些班，可跨专业。</div>
  </div>

  <div class="grid-2" style="margin-bottom:16px">
    <div class="card">
      <div class="card-head"><h2>创建行政班</h2><span class="badge">${classes.length} 个班级</span></div>
      <div class="card-body">
        <div class="field">
          <label for="class-name">班级名称</label>
          <input class="input" id="class-name" placeholder="例如 人工智能 2403 班">
        </div>
        <div class="field">
          <label for="class-major">所属专业</label>
          <input class="input" id="class-major" placeholder="例如 人工智能 / 电子信息">
        </div>
        <button class="btn btn-primary" data-act="create-class">创建班级</button>
        <div class="form-hint">创建后自动生成班级号与加入二维码，并开设到当前课程。</div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>学生如何入班</h2></div>
      <div class="card-body">
        <div class="step-list">
          <div><b>1</b><span>把班级号或二维码发给学生</span></div>
          <div><b>2</b><span>学生登录后输入班级号，或扫码自动跳转</span></div>
          <div><b>3</b><span>入班后自动获得本班所有课程，无需逐门加入</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="class-grid">
    ${classes.map(cls => {
      const courseTags = Object.keys(db.courses || {})
        .filter(id => courseClassIds(id).includes(cls.id))
        .map(id => `<span class="badge outline">${esc(db.courses[id].course.name)}</span>`)
        .join('');
      return `
      <div class="card class-card ${cls.id === teacherClassId() ? 'active' : ''}">
        <div class="card-head">
          <div>
            <h2>${esc(cls.name)}</h2>
            <div class="sub">${esc(cls.major || '未分专业')} · ${cls.studentCount} 人 · 创建于 ${esc(cls.createdAt)}</div>
          </div>
          ${cls.id === teacherClassId()
            ? '<span class="badge success">当前班级</span>'
            : `<button class="btn btn-sm" data-act="switch-class" data-id="${cls.id}">切换</button>`}
        </div>
        <div class="card-body">
          <div class="class-code">
            <div>
              <span>班级号</span>
              <b>${esc(cls.code)}</b>
            </div>
            <img class="qr-img"
              src="https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(joinBase + cls.code)}"
              alt="班级二维码 ${esc(cls.code)}"
              onerror="this.style.display='none'">
          </div>
          <div class="form-hint">扫码链接：${esc(joinBase + cls.code)}</div>
          <div class="wrong-tags" style="margin-top:8px">
            ${courseTags || '<span class="form-hint" style="margin:0">暂无课程开设到本班</span>'}
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function analyticsData() {
  const objectiveIds = db.questions.filter(q => q.type === 'single').map(q => q.id);
  const relevantObjectives = objectiveIds.filter(id => db.assignments.some(a => a.questionIds.includes(id)));
  const subs = db.submissions.filter(s => s.courseId === db.courseId && s.classId === teacherClassId());
  const students = new Set(subs.map(s => s.studentId));

  const classSize = Math.max(1, (currentClass() ? currentClass().studentCount : db.course.studentCount) || 0);
  const submitRate = Math.round((students.size / classSize) * 100);

  const rates = subs.map(s => s.total / s.max);
  const avgRate = rates.length ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) : 0;

  let correctCount = 0;
  let objectiveCount = 0;
  const masteryMap = {};
  const errorMap = {};

  subs.forEach(sub => {
    relevantObjectives.forEach(qid => {
      if (sub.scores[qid] === undefined) return;
      const q = Q(qid);
      const correct = sub.scores[qid] === q.score;
      objectiveCount++;
      if (correct) correctCount++;
      if (!masteryMap[q.knowledgeId]) masteryMap[q.knowledgeId] = { total: 0, correct: 0 };
      masteryMap[q.knowledgeId].total++;
      if (correct) masteryMap[q.knowledgeId].correct++;
      if (!correct) errorMap[qid] = (errorMap[qid] || 0) + 1;
    });
  });

  const mastery = Object.entries(masteryMap).map(([kid, v]) => ({
    title: P(kid)?.title || kid,
    rate: Math.round((v.correct / v.total) * 100)
  })).sort((a, b) => a.rate - b.rate);

  const errors = Object.entries(errorMap)
    .map(([qid, count]) => {
      const q = Q(qid);
      const point = P(q.knowledgeId);
      return {
        title: q.stem.length > 26 ? q.stem.slice(0, 26) + '…' : q.stem,
        pointTitle: point?.title || '',
        page: point?.page || 0,
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  /* 按知识点聚合本班错题，供下节课讲评 */
  const wrongPointMap = {};
  subs.forEach(sub => {
    relevantObjectives.forEach(qid => {
      if (sub.scores[qid] === undefined) return;
      const q = Q(qid);
      if (sub.scores[qid] === q.score) return;
      const pid = q.knowledgeId;
      if (!wrongPointMap[pid]) {
        wrongPointMap[pid] = {
          id: pid,
          title: P(pid)?.title || pid,
          page: P(pid)?.page || 0,
          wrong: 0,
          stems: [],
          students: {}
        };
      }
      const group = wrongPointMap[pid];
      group.wrong++;
      if (group.stems.length < 2 && !group.stems.includes(q.stem)) group.stems.push(q.stem);
      group.students[sub.studentId] = true;
    });
  });
  const wrongPoints = Object.values(wrongPointMap).map(group => {
    const answered = masteryMap[group.id] ? masteryMap[group.id].total : group.wrong;
    return {
      id: group.id,
      title: group.title,
      page: group.page,
      wrong: group.wrong,
      students: Object.keys(group.students).length,
      rate: answered ? Math.round((group.wrong / answered) * 100) : 0,
      stems: group.stems
    };
  }).sort((a, b) => b.wrong - a.wrong || b.rate - a.rate);

  const recent = [...subs]
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 6);

  const pendingReview = subs.filter(s => s.status === 'ai_reviewed').length;

  return {
    submitRate,
    submitted: students.size,
    avgRate,
    correctRate: objectiveCount ? Math.round((correctCount / objectiveCount) * 100) : 0,
    correctCount,
    objectiveCount,
    pendingReview,
    mastery,
    errors,
    wrongPoints,
    recent
  };
}
