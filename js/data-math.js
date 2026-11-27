window.SUBJECTS = window.SUBJECTS || {};

window.SUBJECTS.math = {
  id: 'math',
  course: {
    name: '高等数学', code: 'MATH-101', teacher: '张老师',
    className: '人工智能 2401 班', studentCount: 24
  },
  courseware: {
    fileName: '高等数学·极限与积分.pptx', size: '3.8 MB', pages: 42,
    uploadedAt: '11-28 09:05', status: 'done'
  },
  mindMap: [
    {
      id: 'm-c1', title: '极限与连续', meta: '第 1—2 章',
      sections: [
        { id: 'm-s1', title: '极限的概念', points: ['m-k1'] },
        { id: 'm-s2', title: '两个重要极限', points: ['m-k2'] }
      ]
    },
    {
      id: 'm-c2', title: '一元函数微分学', meta: '第 3—4 章',
      sections: [
        { id: 'm-s3', title: '导数与微分', points: ['m-k3'] },
        { id: 'm-s4', title: '洛必达法则', points: ['m-k4'] }
      ]
    },
    {
      id: 'm-c3', title: '一元函数积分学', meta: '第 5—6 章',
      sections: [
        { id: 'm-s5', title: '不定积分', points: ['m-k5'] },
        { id: 'm-s6', title: '定积分', points: ['m-k6'] }
      ]
    }
  ],
  points: [
    {
      id: 'm-k1', chapterId: 'm-c1', sectionId: 'm-s1', title: '数列极限的 ε-N 定义',
      summary: '当项数 n 足够大时，数列项与常数 A 的距离可以任意小，就称 A 是该数列的极限。',
      formulas: ['∀ε > 0, ∃N, 当 n > N 时,  |aₙ − A| < ε'],
      params: [
        { sym: 'ε', name: '任意小的正数', desc: '用来刻画“任意接近”的程度，可以取任意小' },
        { sym: 'N', name: '项数下标', desc: '与 ε 有关，保证 N 之后的项都满足不等式' },
        { sym: 'A', name: '极限值', desc: '数列最终趋近的常数' }
      ],
      example: '数列 aₙ = 1/n 的极限为 0：取 ε = 0.01，只要 n > 100，就有 |1/n| < 0.01。',
      page: 8,
      excerpt: '极限的 ε-N 定义把“无限接近”精确化为不等式语言，是连续性、导数与积分概念的共同基础。'
    },
    {
      id: 'm-k2', chapterId: 'm-c1', sectionId: 'm-s2', title: '两个重要极限',
      summary: '两个在极限计算中反复出现的基本结果，分别处理含三角函数的 0/0 型与幂指型极限。',
      formulas: ['lim(x→0) sin x / x = 1', 'lim(x→∞) (1 + 1/x)ˣ = e'],
      params: [
        { sym: 'x', name: '自变量', desc: '第一个极限中 x 趋于 0，第二个中 x 趋于无穷' },
        { sym: 'e', name: '自然常数', desc: '约等于 2.71828，是自然对数函数的底数' }
      ],
      example: '计算 lim(x→0) sin3x / x：变形为 3 · sin3x/(3x)，由重要极限得结果为 3。',
      page: 14,
      excerpt: '第一个重要极限常用于含 sin、tan 的 0/0 型极限，第二个重要极限是自然指数 e 的定义来源。'
    },
    {
      id: 'm-k3', chapterId: 'm-c2', sectionId: 'm-s3', title: '导数的定义',
      summary: '函数在某点的导数，就是自变量增量趋于 0 时平均变化率的极限，几何上表示切线斜率。',
      formulas: ["f′(x₀) = lim(Δx→0) [f(x₀ + Δx) − f(x₀)] / Δx"],
      params: [
        { sym: 'Δx', name: '自变量增量', desc: '趋于 0 的微小变化量' },
        { sym: 'f′(x₀)', name: '该点的导数', desc: '函数在该点的瞬时变化率，也就是切线斜率' }
      ],
      example: 'f(x) = x² 在 x = 2 处：f′(2) = lim[(2+Δx)² − 4]/Δx = lim(4 + Δx) = 4。',
      page: 21,
      excerpt: '导数是平均变化率的极限，因此它既能描述瞬时速度，也能描述曲线在某点的切线斜率。'
    },
    {
      id: 'm-k4', chapterId: 'm-c2', sectionId: 'm-s4', title: '洛必达法则',
      summary: '当极限为 0/0 或 ∞/∞ 型时，可以用分子分母分别求导后的极限来代替原极限。',
      formulas: ["lim f(x)/g(x) = lim f′(x)/g′(x)   （0/0 或 ∞/∞ 型）"],
      params: [
        { sym: 'f′, g′', name: '分子分母的导数', desc: '必须分别求导，不能对整个分式求导' },
        { sym: '0/0, ∞/∞', name: '未定式类型', desc: '只有满足这两种类型才能直接使用法则' }
      ],
      example: 'lim(x→0) sin x / x 属于 0/0 型，用洛必达法则得 lim cos x / 1 = 1。',
      page: 26,
      excerpt: '使用洛必达法则前必须验证未定式类型，且求导后极限存在或为无穷大，否则法则失效。'
    },
    {
      id: 'm-k5', chapterId: 'm-c3', sectionId: 'm-s5', title: '不定积分',
      summary: '求一个函数的全体原函数，结果要带上任意常数 C，因为常数求导后为 0。',
      formulas: ['∫ f(x) dx = F(x) + C,  其中 F′(x) = f(x)'],
      params: [
        { sym: 'F(x)', name: '原函数', desc: '求导后等于被积函数 f(x) 的函数' },
        { sym: 'C', name: '任意常数', desc: '表示原函数有无穷多个，不能省略' }
      ],
      example: '∫ 2x dx = x² + C，因为 (x² + C)′ = 2x。',
      page: 33,
      excerpt: '不定积分与求导互为逆运算，基本积分表可由基本求导公式反推得到。'
    },
    {
      id: 'm-k6', chapterId: 'm-c3', sectionId: 'm-s6', title: '牛顿-莱布尼茨公式',
      summary: '把定积分的计算转化为求原函数在两端点的函数值之差，是微积分的基本定理。',
      formulas: ['∫(a→b) f(x) dx = F(b) − F(a)'],
      params: [
        { sym: 'a, b', name: '积分下限与上限', desc: '定积分的积分区间端点' },
        { sym: 'F', name: 'f 的一个原函数', desc: '只需取任意一个原函数，常数 C 会相互抵消' }
      ],
      example: '∫(0→1) 2x dx = [x²](0→1) = 1² − 0² = 1。',
      page: 38,
      excerpt: '该公式揭示了微分与积分之间的互逆关系，使定积分不必再用分割求和的方式计算。'
    }
  ],
  questions: [
    {
      id: 'm-q1', type: 'single', stem: '极限 lim(x→0) sin x / x 的值是？',
      options: ['0', '1', '∞', '不存在'], answer: 1, score: 10, knowledgeId: 'm-k2',
      hints: [
        '这是课件里的第一个重要极限，先判断它属于什么类型的未定式。',
        '分子分母同时趋于 0，属于 0/0 型，可以直接套用重要极限的结果。',
        '完整解析：lim(x→0) sin x / x = 1，这是第一个重要极限，也是推导 sin x 导数的基础。'
      ],
      diagnosis: {
        reason: '把 0/0 型未定式直接代入得 0，忽略了极限存在且等于 1 这一重要结论。',
        advice: '回到课件第 14 页，重新记忆两个重要极限的形式与适用条件。',
        similar: '计算 lim(x→0) tan x / x，并说明它与第一个重要极限的关系。'
      }
    },
    {
      id: 'm-q2', type: 'single', stem: '设 f(x) = x²，则 f′(2) 等于？',
      options: ['2', '4', '8', '0'], answer: 1, score: 10, knowledgeId: 'm-k3',
      hints: [
        '导数描述的是瞬时变化率，可以用定义式或求导公式。',
        'x² 的导数是 2x，把 x = 2 代入即可。',
        '完整解析：f′(x) = 2x，因此 f′(2) = 4，与用定义式计算的结果一致。'
      ],
      diagnosis: {
        reason: '把函数值 f(2) = 4 与导数值混淆，或漏乘系数 2。',
        advice: '区分“函数值”和“导数值”：前者代入原函数，后者代入导函数。',
        similar: '用导数定义式计算 f(x) = x² 在 x = 3 处的导数，并与公式法对照。'
      }
    },
    {
      id: 'm-q3', type: 'single', stem: '不定积分 ∫ 2x dx 的结果是？',
      options: ['x² + C', '2x² + C', 'x²', '2 + C'], answer: 0, score: 10, knowledgeId: 'm-k5',
      hints: [
        '想一想哪个函数求导之后等于 2x。',
        'x² 求导得 2x，但不定积分还要补上任意常数。',
        '完整解析：∫ 2x dx = x² + C，常数 C 不能省略，它代表全体原函数。'
      ],
      diagnosis: {
        reason: '漏写积分常数 C，或把系数 2 直接保留在结果中。',
        advice: '牢记不定积分的结果是一个函数族，必须带 + C。',
        similar: '求 ∫ 3x² dx，并验证结果求导后是否等于 3x²。'
      }
    },
    {
      id: 'm-q4', type: 'short', stem: '叙述牛顿-莱布尼茨公式，并说明它为什么被称为微积分基本定理。',
      options: [], answer: null, score: 20, knowledgeId: 'm-k6',
      hints: [
        '先写出公式的完整形式，注意积分上下限与原函数的关系。',
        '公式把定积分转化为原函数在区间端点的差，因此需要先求原函数。',
        '完整解析：∫(a→b) f(x)dx = F(b) − F(a)，其中 F 是 f 的原函数。它把定积分的计算与求原函数联系起来，揭示了微分与积分互为逆运算。'
      ],
      reference: '牛顿-莱布尼茨公式为 ∫(a→b) f(x)dx = F(b) − F(a)，其中 F 是 f 在区间上的一个原函数。它把定积分转化为原函数在端点的差，说明微分与积分互为逆运算，因此被称为微积分基本定理。',
      keywords: ['原函数', 'F(b)', 'F(a)'],
      diagnosis: {
        reason: '只写出公式，没有说明原函数与端点差的关系，也没有指出互逆运算这一核心。',
        advice: '从“公式形式—计算作用—理论意义”三个层次组织答案。',
        similar: '用该公式计算 ∫(1→2) 3x² dx，并说明若换成另一个原函数结果是否改变。'
      }
    }
  ],
  assignments: [
    {
      id: 'm-a1', mode: 'quiz', title: '第 1 次课堂问答 · 重要极限与导数',
      questionIds: ['m-q1', 'm-q2'], publishedAt: '11-28 09:20', note: '课堂内 10 分钟完成'
    },
    {
      id: 'm-a2', mode: 'homework', title: '课后作业 · 不定积分与基本定理',
      questionIds: ['m-q3', 'm-q4'], publishedAt: '11-28 16:40', note: '11-29 12:30 前提交'
    }
  ],
  shortAnswers: {
    high: '牛顿-莱布尼茨公式为 ∫(a→b) f(x)dx = F(b) − F(a)，其中 F 是 f 的一个原函数。它把定积分转化为原函数在两端点的差，说明微分与积分互为逆运算，所以被称为微积分基本定理。',
    mid: '公式是 ∫(a→b) f(x)dx = F(b) − F(a)，F 是原函数，用它可以不用分割求和的方​法算定积分。',
    low: '就是定积分等于原函数代入上限减下限。'
  },
  seedMessages: [
    {
      id: 'm-seed-1', authorId: 'p02', authorName: '陈晨', anonymous: true, visibility: 'public',
      body: '老师，洛必达法则是不是所有极限都能用？我套用后结果和答案不一样。',
      questionId: 'm-q1',
      answer: '不是所有极限都能用。洛必达法则只适用于 0/0 或 ∞/∞ 型未定式，而且求导后的极限必须存在或为无穷大。建议你先判断类型，再决定是否使用。',
      answeredBy: '张老师', createdAt: '11-28 18:30', answeredAt: '11-28 19:02'
    }
  ]
};
