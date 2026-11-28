window.SUBJECTS = window.SUBJECTS || {};

/* 高等数学：内容按用户提供的教材扫描件（第一章 第13—24页）整理 */
window.SUBJECTS.math = {
  id: 'math',
  course: {
    name: '高等数学', code: 'MATH-101', teacher: '张老师',
    className: '人工智能 2401 班', studentCount: 24
  },
  courseware: {
    fileName: '高等数学·第一章 第四、五节（P13-24）.pdf', size: '5.7 MB', pages: 24,
    uploadedAt: '11-27 20:40', status: 'done'
  },
  mindMap: [
    {
      id: 'm-c1', title: '第一章 函数、极限与连续', meta: '第四、五节 · 教材 P13—24',
      sections: [
        { id: 'm-s1', title: '第四节 函数的极限', points: ['m-k1', 'm-k2', 'm-k3', 'm-k4', 'm-k5'] },
        { id: 'm-s2', title: '第五节 极限的运算法则', points: ['m-k6', 'm-k7', 'm-k8', 'm-k9', 'm-k10'] }
      ]
    }
  ],
  points: [
    {
      id: 'm-k1', chapterId: 'm-c1', sectionId: 'm-s1', title: 'x→∞ 时函数的极限',
      summary: '当 |x| 无限增大时，函数值与常数 A 的距离可以任意小，就称 A 是 x→∞ 时 f(x) 的极限。',
      formulas: ['∀ε>0，∃X>0，当 |x|>X 时，|f(x)−A|<ε', 'lim(x→∞) f(x)=A ⇔ lim(x→+∞) f(x)=lim(x→−∞) f(x)=A'],
      params: [
        { sym: 'ε', name: '任意小的正数', desc: '刻画函数值与 A 的接近程度' },
        { sym: 'X', name: '正数阈值', desc: '与 ε 有关，保证 |x|>X 后不等式成立' },
        { sym: 'A', name: '极限值', desc: 'x 无限增大时函数趋近的常数' }
      ],
      example: '教材第 14 页 例 1：证明 lim(x→∞) 1/x = 0。任给 ε>0，取 X=1/ε，当 |x|>X 时，|1/x−0|<ε。',
      page: 14,
      excerpt: '教材第 13—14 页：定义 1 给出 x→∞ 时极限的 ε-X 定义，图 1.12 是几何解释；性质 1 说明双侧极限等于左右两侧极限且相等。'
    },
    {
      id: 'm-k2', chapterId: 'm-c1', sectionId: 'm-s1', title: 'x→x₀ 时函数的极限',
      summary: '当 x 无限接近 x₀（但不等于 x₀）时，f(x) 无限接近 A，就称 A 是 x→x₀ 时的极限；与 f 在 x₀ 是否有定义无关。',
      formulas: ['∀ε>0，∃δ>0，当 0<|x−x₀|<δ 时，|f(x)−A|<ε', 'lim(x→x₀) f(x)=A'],
      params: [
        { sym: 'δ', name: '去心邻域半径', desc: '与 ε 有关，控制 x 与 x₀ 的距离' },
        { sym: '0<|x−x₀|', name: '去心条件', desc: 'x 可以无限接近 x₀，但取不到 x₀' },
        { sym: 'A', name: '极限值', desc: 'x 趋近 x₀ 时函数趋近的常数' }
      ],
      example: '教材第 15 页 例 2：用定义证明 lim(x→x₀) √x = √x₀（x₀>0）。取 δ=ε√x₀，当 0<|x−x₀|<δ 时即可证得。',
      page: 15,
      excerpt: '教材第 15 页：定义 2 与图 1.14 的几何解释。f₁(x)=x+1 与 f₂(x)=(x²−1)/(x−1) 在 x→1 时都趋于 2，说明极限与 x₀ 处是否有定义无关。'
    },
    {
      id: 'm-k3', chapterId: 'm-c1', sectionId: 'm-s1', title: '左极限与右极限',
      summary: '从 x₀ 左侧或右侧趋近得到的极限称为单侧极限；双侧极限存在的充要条件是左右极限都存在且相等。',
      formulas: ['lim(x→x₀⁻) f(x)=A（左极限）', 'lim(x→x₀⁺) f(x)=A（右极限）', 'lim(x→x₀) f(x)=A ⇔ lim(x→x₀⁻) f(x)=lim(x→x₀⁺) f(x)=A'],
      params: [
        { sym: 'x→x₀⁻', name: '左侧趋近', desc: 'x 从小于 x₀ 的一侧趋近 x₀' },
        { sym: 'x→x₀⁺', name: '右侧趋近', desc: 'x 从大于 x₀ 的一侧趋近 x₀' }
      ],
      example: '教材第 16 页 例 3：f(x)={1, x<0; x, x≥0}。左极限为 1，右极限为 0，二者不等，所以 lim(x→0) f(x) 不存在。',
      page: 16,
      excerpt: '教材第 16 页：单侧极限记号与性质 2。考察分段函数在分界点处的极限时，通常先分别求左右极限。'
    },
    {
      id: 'm-k4', chapterId: 'm-c1', sectionId: 'm-s1', title: '函数极限的基本性质',
      summary: '极限若存在则唯一；函数在极限点附近局部有界；极限值大于 0（或小于 0）时，函数在去心邻域内保持同号。',
      formulas: ['若 lim f(x) 存在，则极限唯一', '若 lim f(x)=A，则 f 在 x₀ 的某去心邻域内有界', '若 lim f(x)=A 且 A>0（或 A<0），则邻域内 f(x)>0（或 f(x)<0）'],
      params: [
        { sym: '唯一性', name: '极限唯一', desc: '一个函数在同一过程中不可能有两个不同的极限' },
        { sym: '局部有界', name: '邻域内有界', desc: '只保证在极限点附近有界，不保证在整个定义域有界' },
        { sym: '局部保号', name: '邻域内保号', desc: '由 f(x)>0 只能推出 A≥0，不能推出 A>0' }
      ],
      example: '教材第 17 页 性质 3—5：用于判断函数在极限点附近的符号与有界性，是证明不等式和判断方程根的基础。',
      page: 17,
      excerpt: '教材第 17 页：性质 3 唯一性、性质 4 局部有界性、性质 5 局部保号性。注意保号性只能单向使用。'
    },
    {
      id: 'm-k5', chapterId: 'm-c1', sectionId: 'm-s1', title: '无穷小与无穷大',
      summary: '极限为 0 的变量称为无穷小；绝对值无限增大的变量称为无穷大。无穷大的倒数是无穷小，非零无穷小的倒数是无穷大。',
      formulas: ['lim f(x)=0 ⇔ f(x) 为无穷小', 'lim f(x)=∞ ⇔ |f(x)| 无限增大', 'f 为无穷大且 f≠0 ⇒ 1/f 为无穷小', 'f 为无穷小且 f≠0 ⇒ 1/f 为无穷大'],
      params: [
        { sym: '无穷小', name: '极限为 0', desc: '是一个变量，不是很小的常数' },
        { sym: '无穷大', name: '绝对值无限增大', desc: '表示极限不存在的一种趋势，不是数' },
        { sym: '同一过程', name: '变化过程', desc: '讨论无穷小、无穷大必须指明 x→x₀ 或 x→∞' }
      ],
      example: '教材第 18 页：x→0 时 x 为无穷小，1/x 为无穷大；x→∞ 时 1/x、1/x² 为无穷小。',
      page: 18,
      excerpt: '教材第 17—18 页：定义 3、定义 4、定义 5 与性质 6。无穷大与无界变量是两个不同概念。'
    },
    {
      id: 'm-k6', chapterId: 'm-c1', sectionId: 'm-s2', title: '无穷小的运算性质',
      summary: '有限个无穷小之和仍为无穷小；有界函数与无穷小之积仍为无穷小；常数与无穷小之积、有限个无穷小之积仍为无穷小。',
      formulas: ['lim α=0，lim β=0 ⇒ lim(α+β)=0', '|g(x)|≤M 且 lim α(x)=0 ⇒ lim g(x)α(x)=0', 'lim Cα(x)=0（C 为常数）', '有限个无穷小之积仍为无穷小'],
      params: [
        { sym: 'α, β', name: '无穷小', desc: '指同一变化过程中极限为 0 的变量' },
        { sym: 'M', name: '有界函数的界', desc: '只要 g(x) 在邻域内有界即可' }
      ],
      example: '教材第 20 页：x→0 时 x 为无穷小，sin x 有界，所以 x sin x、x·sin(1/x) 都是无穷小。',
      page: 20,
      excerpt: '教材第 19—20 页：性质 1 及推论 1、推论 2。无穷大没有类似的运算法则，两个无穷大之和未必是无穷大。'
    },
    {
      id: 'm-k7', chapterId: 'm-c1', sectionId: 'm-s2', title: '极限的四则运算法则',
      summary: '若两个函数的极限都存在，则和、差、积的极限等于极限的和、差、积；分母极限不为 0 时，商的极限等于极限之商。',
      formulas: ['lim[f(x)±g(x)]=lim f(x) ± lim g(x)', 'lim[f(x)·g(x)]=lim f(x) · lim g(x)', 'lim f(x)/g(x)=lim f(x)/lim g(x)（lim g(x)≠0）', 'lim[Cf(x)]=C·lim f(x)，lim[f(x)]ᵏ=[lim f(x)]ᵏ'],
      params: [
        { sym: '前提', name: '极限都存在', desc: '参与运算的两个极限都必须存在' },
        { sym: '分母', name: '极限不为 0', desc: '商的法则要求分母的极限不等于 0' }
      ],
      example: '教材第 21 页 例 1：lim(x→2)(x²−3x+4)=2²−3×2+4=2。',
      page: 21,
      excerpt: '教材第 20—21 页：定理 1 及推论 3、推论 4；法则对 x→∞ 与单侧极限同样适用。'
    },
    {
      id: 'm-k8', chapterId: 'm-c1', sectionId: 'm-s2', title: '复合函数的极限',
      summary: '内层函数的极限为 u₀，外层函数在 u₀ 处极限为 A，且内层函数在去心邻域内不等于 u₀，则复合函数的极限为 A。',
      formulas: ['lim(x→x₀) φ(x)=u₀', 'lim(u→u₀) f(u)=A', 'φ(x)≠u₀ ⇒ lim(x→x₀) f(φ(x))=A'],
      params: [
        { sym: 'φ(x)', name: '内层函数', desc: '其极限 u₀ 是外层函数的自变量趋近点' },
        { sym: 'f(u)', name: '外层函数', desc: '在 u₀ 处的极限必须存在' },
        { sym: 'φ(x)≠u₀', name: '去心条件', desc: '保证外层函数确实是在 u₀ 的极限过程中取值' }
      ],
      example: '教材第 21 页 定理 2：例如 lim(x→0) √(1+x)=1，可看作内层 1+x→1、外层 √u 在 u=1 处连续。',
      page: 21,
      excerpt: '教材第 21 页：定理 2 及使用条件，特别要求 φ(x) 在 x₀ 的去心邻域内不等于 u₀。'
    },
    {
      id: 'm-k9', chapterId: 'm-c1', sectionId: 'm-s2', title: '有理式极限：因式分解与同除最高次幂',
      summary: '0/0 型先因式分解约去零因子；x→∞ 型将分子分母同除以最高次幂；再按分子分母次数比较得出结果。',
      formulas: ['0/0 型：约去公因子后求极限', 'x→∞ 型：分子分母同除最高次幂', 'n=m 时极限为 aₙ/bₘ；n<m 时为 0；n>m 时为 ∞'],
      params: [
        { sym: 'n, m', name: '分子分母次数', desc: '比较最高次幂判断 x→∞ 时的极限类型' },
        { sym: '零因子', name: '导致 0/0 的因式', desc: '因式分解后约去，避免直接代入' }
      ],
      example: '教材第 22 页 例 3：lim(x→1)(x²+x−2)/(x²−3x+2)=lim(x→1)(x+2)/(x−2)=−3；例 5：lim(x→∞)(x²−x+1)/(2x²+x+2)=1/2。',
      page: 22,
      excerpt: '教材第 22—23 页：例 3—例 7，分别演示因式分解、同除最高次幂与次数比较法则。'
    },
    {
      id: 'm-k10', chapterId: 'm-c1', sectionId: 'm-s2', title: '根式与差式极限的变形',
      summary: '含根号或两个无穷小之差时，先有理化或通分变形，再求极限。',
      formulas: ['√A−√B = (A−B)/(√A+√B)', '例 8：lim(x→2)[x²/(x²−4) − 1/(x−2)] = 3/4', '例 9：lim(x→0)(√(1+x²)−1)/x² = 1/2'],
      params: [
        { sym: '有理化', name: '分子或分母有理化', desc: '乘以共轭表达式消去根号差' },
        { sym: '通分', name: '合并分式', desc: '把差式化为一个分式后再约分' }
      ],
      example: '教材第 23 页 例 9：lim(x→0)(√(1+x²)−1)/x²，分子有理化后约去 x²，得 1/2。',
      page: 23,
      excerpt: '教材第 23 页：例 8（通分）、例 9（分子有理化）。这类变形是处理根式与差式极限的常用方法。'
    }
  ],
  questions: [
    {
      id: 'm-q1', type: 'single', stem: '极限 lim(x→1) (x²+x−2)/(x²−3x+2) 的值是？',
      options: ['−3', '3', '0', '不存在'], answer: 0, score: 10, knowledgeId: 'm-k9',
      hints: [
        '先代入 x=1，看看分子分母是否同时为 0。',
        '分子 x²+x−2=(x−1)(x+2)，分母 x²−3x+2=(x−1)(x−2)，约去公因子 x−1。',
        '完整解析：原式 = lim(x→1)(x+2)/(x−2) = 3/(−1) = −3。'
      ],
      diagnosis: {
        reason: '直接代入得到 0/0 后没有继续变形，或因式分解时符号出错。',
        advice: '回到教材第 22 页例 3，练习“先分解、再约分”的 0/0 型处理流程。',
        similar: '求 lim(x→2)(x²−4)/(x²−3x+2)。'
      }
    },
    {
      id: 'm-q2', type: 'single', stem: '当 x→0 时，下列变量中是无穷小的是？',
      options: ['1/x', 'x', 'sin x / x', 'x²+1'], answer: 1, score: 10, knowledgeId: 'm-k5',
      hints: [
        '无穷小是极限为 0 的变量，先分别求四个选项在 x→0 时的极限。',
        '1/x 趋于无穷大，sin x/x 趋于 1，x²+1 趋于 1。',
        '完整解析：只有 x 在 x→0 时极限为 0，因此 x 是无穷小。'
      ],
      diagnosis: {
        reason: '把“很小的数”与“无穷小”混淆，或没有逐个计算极限。',
        advice: '回到教材第 17 页定义 3：无穷小是极限为 0 的变量，必须指明变化过程。',
        similar: '判断 x→0 时 x sin(1/x)、1/x²、sin x 是否为无穷小。'
      }
    },
    {
      id: 'm-q3', type: 'single', stem: '极限 lim(x→∞) (x²−x+1)/(2x²+x+2) 的值是？',
      options: ['1/2', '2', '0', '∞'], answer: 0, score: 10, knowledgeId: 'm-k9',
      hints: [
        '分子分母都是二次多项式，先比较最高次幂。',
        '分子分母同除以 x²，再让 x→∞。',
        '完整解析：原式 = lim (1−1/x+1/x²)/(2+1/x+2/x²) = 1/2。'
      ],
      diagnosis: {
        reason: '只比较最高次项系数时看反了分子分母，或忘记同除最高次幂。',
        advice: '记住结论：分子分母同次时，极限等于最高次项系数之比。',
        similar: '求 lim(x→∞)(3x²+2x−1)/(x²−5)。'
      }
    },
    {
      id: 'm-q4', type: 'short', stem: '叙述极限与无穷小的关系（极限基本定理），并说明它为什么能把求极限问题转化为无穷小问题。',
      options: [], answer: null, score: 20, knowledgeId: 'm-k7',
      hints: [
        '先写出 lim f(x)=A 与 f(x)=A+α(x) 的等价关系。',
        '说明 α(x) 是同一变化过程中的无穷小，即 lim α(x)=0。',
        '完整解析：lim f(x)=A ⇔ f(x)=A+α(x)，其中 lim α(x)=0。于是只需证明 f(x)−A 为无穷小，简化了 ε-δ 论证。'
      ],
      reference: '极限基本定理：lim f(x)=A 的充要条件是 f(x)=A+α(x)，其中 α(x) 为同一变化过程中的无穷小（lim α(x)=0）。因此证明极限时只需证明 f(x)−A 为无穷小，把极限问题转化为无穷小分析。',
      keywords: ['A+α(x)', '无穷小', 'lim α(x)=0'],
      diagnosis: {
        reason: '只写出等价式，没有说明 α(x) 是无穷小，也没有说明转化的作用。',
        advice: '按“等价关系—无穷小条件—论证作用”三层作答。',
        similar: '用该定理解释为什么 lim(x→2)(2x+1)=5 可以转化为证明 2x−4 为无穷小。'
      }
    }
  ],
  assignments: [
    {
      id: 'm-a1', mode: 'quiz', title: '第 1 次课堂问答 · 函数的极限',
      questionIds: ['m-q1', 'm-q2'], publishedAt: '11-27 09:20', note: '课堂内 10 分钟完成', duration: 10
    },
    {
      id: 'm-a2', mode: 'homework', title: '课后作业 · 极限的运算法则',
      questionIds: ['m-q3', 'm-q4'], publishedAt: '11-27 16:40', note: '教材 P22—23 例题后可完成'
    }
  ],
  /* 自主练习真题库：基于课件知识点编制的考试风格题，供学生课下自主练习 */
  examQuestions: [
    {
      id: 'm-eq1', type: 'single', source: '真题', difficulty: '基础', score: 5, knowledgeId: 'm-k9',
      stem: '极限 lim(x→2) (x²−4)/(x−2) 的值是？',
      options: ['4', '2', '0', '不存在'], answer: 0,
      hints: ['分子是平方差，先因式分解。', 'x²−4=(x−2)(x+2)，约去 x−2。', '完整解析：原式 = lim(x→2)(x+2) = 4。'],
      diagnosis: { reason: '看到 0/0 直接填 0，没有先因式分解约分。', advice: '0/0 型要先变形再代入。', similar: '求 lim(x→3)(x²−9)/(x−3)。' }
    },
    {
      id: 'm-eq2', type: 'single', source: '真题', difficulty: '基础', score: 5, knowledgeId: 'm-k5',
      stem: '当 x→0 时，下列变量中是无穷小的是？',
      options: ['x²', '1/x', 'sin x / x', '2'], answer: 0,
      hints: ['无穷小是极限为 0 的变量。', '逐个算 x→0 时的极限。', '完整解析：x²→0，是无穷小；其余分别为 ∞、1、2。'],
      diagnosis: { reason: '把“很小的数”当成无穷小，或没算极限。', advice: '回到第 17 页定义 3，必须指明变化过程。', similar: '判断 x→0 时 x sin(1/x) 是否为无穷小。' }
    },
    {
      id: 'm-eq3', type: 'single', source: '真题', difficulty: '提高', score: 5, knowledgeId: 'm-k7',
      stem: '极限 lim(x→1) (x²−1)/(x²+x−2) 的值是？',
      options: ['2/3', '1', '0', '3/2'], answer: 0,
      hints: ['分子分母都含因子 (x−1)。', '分解：分子 (x−1)(x+1)，分母 (x−1)(x+2)。', '完整解析：约分得 (x+1)/(x+2) → 2/3。'],
      diagnosis: { reason: '分母因式分解错误或约分时漏项。', advice: '先验证 x=1 使分子分母同 0，再分解。', similar: '求 lim(x→1)(x³−1)/(x²−1)。' }
    },
    {
      id: 'm-eq4', type: 'single', source: '真题', difficulty: '提高', score: 5, knowledgeId: 'm-k3',
      stem: '设 f(x)={ x², x≤0; x+1, x>0 }，则 lim(x→0) f(x) 为？',
      options: ['不存在', '0', '1', '2'], answer: 0,
      hints: ['分段点处要分别算左右极限。', '左极限 x→0⁻ 用 x²，右极限 x→0⁺ 用 x+1。', '完整解析：左极限 0，右极限 1，不相等，故极限不存在。'],
      diagnosis: { reason: '只算了单侧极限，或忽略分段。', advice: '分段函数在分段点必须讨论左右极限。', similar: '讨论 f(x)={x, x<1; 2x−1, x≥1} 在 x=1 的极限。' }
    },
    {
      id: 'm-eq5', type: 'single', source: '真题', difficulty: '基础', score: 5, knowledgeId: 'm-k1',
      stem: '极限 lim(x→∞) (2x+3)/(x−1) 的值是？',
      options: ['2', '∞', '0', '1'], answer: 0,
      hints: ['分子分母同除以最高次幂 x。', '看最高次项系数之比。', '完整解析：(2+3/x)/(1−1/x) → 2。'],
      diagnosis: { reason: '误以为分子分母都趋于无穷所以极限为 ∞。', advice: '同次多项式比的极限 = 最高次系数之比。', similar: '求 lim(x→∞)(3x²−1)/(x²+2)。' }
    },
    {
      id: 'm-eq6', type: 'single', source: '真题', difficulty: '提高', score: 5, knowledgeId: 'm-k8',
      stem: '极限 lim(x→0) sin(3x)/x 的值是？',
      options: ['3', '1', '0', '不存在'], answer: 0,
      hints: ['用重要极限 lim(u→0) sin u / u = 1。', '把 3x 看作一个整体。', '完整解析：原式 = 3·lim(x→0) sin(3x)/(3x) = 3。'],
      diagnosis: { reason: '直接认为 sin(3x)/x → 1，漏了系数。', advice: '凑出 sin u / u 的形式，注意系数。', similar: '求 lim(x→0) tan(2x)/x。' }
    },
    {
      id: 'm-eq7', type: 'short', source: '真题', difficulty: '基础', score: 10, knowledgeId: 'm-k10',
      stem: '求极限 lim(x→+∞) (√(x²+x) − x)，写出关键步骤。',
      options: [], answer: null,
      keywords: ['分子有理化', '1/2'],
      reference: '对根式差作分子有理化：√(x²+x)−x = x/(√(x²+x)+x)，分子分母同除以 x 得 1/(√(1+1/x)+1) → 1/2。',
      hints: ['根式差想办法有理化。', '分子分母同乘共轭式 √(x²+x)+x。', '完整解析：有理化后 = x/(√(x²+x)+x) → 1/2。'],
      diagnosis: { reason: '没有有理化，或同除 x 时漏除分子。', advice: '根式差极限优先分子有理化。', similar: '求 lim(x→+∞)(√(x²−x)−x)。' }
    },
    {
      id: 'm-eq8', type: 'short', source: '真题', difficulty: '提高', score: 10, knowledgeId: 'm-k7',
      stem: '叙述极限四则运算法则的条件，并举例说明为什么只有当 lim f(x) 与 lim g(x) 都存在时才能使用这些法则。',
      options: [], answer: null,
      keywords: ['lim f', 'lim g', '存在', '条件'],
      reference: '若 lim f=A、lim g=B 都存在，则 lim(f±g)=A±B、lim(fg)=AB、lim(f/g)=A/B(B≠0)。条件是两个极限都存在；反例：x→∞ 时 f=x、g=−x，lim f、lim g 都不存在，但 lim(f+g)=0 存在，说明法则条件不满足时结论不能反推。',
      hints: ['先写出法则成立的前提。', '举一个两个极限都不存在但和存在的反例。', '完整解析：见 reference。'],
      diagnosis: { reason: '只背结论没写条件，或反例不对。', advice: '法则是充分条件，要会举反例说明必要性。', similar: '举例说明 lim f 存在、lim g 不存在时 lim(f+g) 一定不存在。' }
    }
  ],
  textbook: {
    examples: [
      {
        id: 'm-exm-1', title: '例 1 · lim(x→∞) 1/x = 0', page: 14, knowledgeId: 'm-k1',
        stem: '证明 lim(x→∞) 1/x = 0。',
        solution: '任给 ε>0，要使 |1/x−0|=1/|x|<ε，只需 |x|>1/ε。取 X=1/ε，当 |x|>X 时，|1/x|<ε，故 lim(x→∞)1/x=0。',
        source: '教材第 14 页'
      },
      {
        id: 'm-exm-2', title: '例 2 · lim(x→x₀) √x = √x₀', page: 15, knowledgeId: 'm-k2',
        stem: '用极限定义证明 lim(x→x₀) √x = √x₀（x₀>0）。',
        solution: '任给 ε>0，取 δ=ε√x₀。当 0<|x−x₀|<δ 时，|√x−√x₀|=|x−x₀|/(√x+√x₀)≤|x−x₀|/√x₀<ε。',
        source: '教材第 15 页'
      },
      {
        id: 'm-exm-3', title: '例 3 · 分段函数的极限', page: 16, knowledgeId: 'm-k3',
        stem: '设 f(x)={1, x<0; x, x≥0}，求 lim(x→0⁻)f(x)、lim(x→0⁺)f(x) 与 lim(x→0)f(x)。',
        solution: '左极限 lim(x→0⁻)f(x)=1；右极限 lim(x→0⁺)f(x)=0。左右极限不等，所以 lim(x→0)f(x) 不存在。',
        source: '教材第 16 页'
      },
      {
        id: 'm-exm-4', title: '例 1 · 多项式极限', page: 21, knowledgeId: 'm-k7',
        stem: '求 lim(x→2)(x²−3x+4)。',
        solution: '由四则运算法则，原式 = lim x² −3lim x + lim 4 = 4−6+4=2。',
        source: '教材第 21 页'
      },
      {
        id: 'm-exm-5', title: '例 2 · 有理式直接代入', page: 21, knowledgeId: 'm-k7',
        stem: '求 lim(x→1)(x+1)/(2x²−x+2)。',
        solution: '分母极限 2−1+2=3≠0，直接代入得 (1+1)/3=2/3。',
        source: '教材第 21 页'
      },
      {
        id: 'm-exm-6', title: '例 3 · 0/0 型因式分解', page: 22, knowledgeId: 'm-k9',
        stem: '求 lim(x→1)(x²+x−2)/(x²−3x+2)。',
        solution: '分子=(x−1)(x+2)，分母=(x−1)(x−2)，约去 x−1，得 lim(x+2)/(x−2)=−3。',
        source: '教材第 22 页'
      },
      {
        id: 'm-exm-7', title: '例 4 · 分母趋于 0 的极限', page: 22, knowledgeId: 'm-k9',
        stem: '求 lim(x→0)(x−1)/(x²+x)。',
        solution: 'x→0 时分母趋于 0，分子趋于 −1≠0，故原极限为 ∞。',
        source: '教材第 22 页'
      },
      {
        id: 'm-exm-8', title: '例 5 · x→∞ 同除最高次幂', page: 22, knowledgeId: 'm-k9',
        stem: '求 lim(x→∞)(x²−x+1)/(2x²+x+2)。',
        solution: '分子分母同除 x²，得 (1−1/x+1/x²)/(2+1/x+2/x²)→1/2。',
        source: '教材第 22 页'
      },
      {
        id: 'm-exm-9', title: '例 6 · 分母次数更高', page: 22, knowledgeId: 'm-k9',
        stem: '求 lim(x→∞)(x+3)/(x²−3x+1)。',
        solution: '分子分母同除 x²，得 (1/x+3/x²)/(1−3/x+1/x²)→0。',
        source: '教材第 22 页'
      },
      {
        id: 'm-exm-10', title: '例 7 · 分子次数更高', page: 22, knowledgeId: 'm-k9',
        stem: '求 lim(x→∞)(x²−x+2)/(x²+1)。',
        solution: '同除 x² 得 (1−1/x+2/x²)/(1+1/x²)→1；结合例 7 的变形可得更高次情形为 ∞。',
        source: '教材第 22—23 页'
      },
      {
        id: 'm-exm-11', title: '例 8 · 通分处理差式', page: 23, knowledgeId: 'm-k10',
        stem: '求 lim(x→2)[x²/(x²−4) − 1/(x−2)]。',
        solution: '通分得 [x²−(x+2)]/[(x−2)(x+2)] = (x−2)(x+1)/[(x−2)(x+2)]，约分后为 (x+1)/(x+2)→3/4。',
        source: '教材第 23 页'
      },
      {
        id: 'm-exm-12', title: '例 9 · 分子有理化', page: 23, knowledgeId: 'm-k10',
        stem: '求 lim(x→0)(√(1+x²)−1)/x²。',
        solution: '分子有理化：[(1+x²)−1]/[x²(√(1+x²)+1)] = 1/(√(1+x²)+1)→1/2。',
        source: '教材第 23 页'
      }
    ],
    exercises: [
      {
        id: 'm-exr-1', title: '习题 1-4 · 无穷小与无穷大', page: 19, knowledgeId: 'm-k5', difficulty: '基础',
        stem: '讨论 y=x² 在什么变化过程中为无穷小、在什么过程中为无穷大。',
        reference: '当 x→0 时 y=x²→0，为无穷小；当 x→∞ 时 |x²|→∞，为无穷大。'
      },
      {
        id: 'm-exr-2', title: '习题 1-4 · 证明极限不存在', page: 19, knowledgeId: 'm-k5', difficulty: '提高',
        stem: '证明极限 lim(x→∞) cos x 不存在。',
        reference: '取 xₙ=2nπ→+∞，cos xₙ=1；取 yₙ=2nπ+π→+∞，cos yₙ=−1。两个子列极限不同，故原极限不存在。'
      },
      {
        id: 'm-exr-3', title: '习题 1-4 · 用定义证明', page: 19, knowledgeId: 'm-k2', difficulty: '提高',
        stem: '用极限定义证明 lim(x→2)(2x+1)=5。',
        reference: '任给 ε>0，取 δ=ε/2。当 0<|x−2|<δ 时，|(2x+1)−5|=2|x−2|<ε。'
      },
      {
        id: 'm-exr-4', title: '习题 1-5 · 分式极限', page: 24, knowledgeId: 'm-k9', difficulty: '基础',
        stem: '求 lim(x→1)(x²−1)/(2x²−x−1)。',
        reference: '分子=(x−1)(x+1)，分母=(2x+1)(x−1)，约去 x−1 得 (x+1)/(2x+1)→2/3。'
      },
      {
        id: 'm-exr-5', title: '习题 1-5 · 根式差极限', page: 24, knowledgeId: 'm-k10', difficulty: '提高',
        stem: '求 lim(x→∞)(√(x²+2x)−√(x²−1))。',
        reference: '分子有理化得 (2x+1)/(√(x²+2x)+√(x²−1))，分子分母同除 x 后极限为 1。'
      },
      {
        id: 'm-exr-6', title: '习题 1-5 · 差式通分', page: 24, knowledgeId: 'm-k10', difficulty: '提高',
        stem: '求 lim(x→∞)[x²/(x+1) − x²/(x−1)]。',
        reference: '通分得 x²[(x−1)−(x+1)]/[(x+1)(x−1)] = −2x²/(x²−1)→−2。'
      },
      {
        id: 'm-exr-7', title: '习题 1-5 · 分段函数极限', page: 24, knowledgeId: 'm-k3', difficulty: '综合',
        stem: '设 f(x)={2x²−x, −2≤x≤0; x³, 0<x≤1; 3x+2, 1<x≤3}，求 lim(x→0)f(x) 与 lim(x→1)f(x)。',
        reference: 'x→0：左极限 0、右极限 0，故极限为 0；x→1：左极限 1、右极限 5，左右不等，故 lim(x→1)f(x) 不存在。'
      },
      {
        id: 'm-exr-8', title: '习题 1-5 · 含参数极限', page: 24, knowledgeId: 'm-k9', difficulty: '综合',
        stem: '讨论 lim(x→∞) aˣ/(1+aˣ)（a>0）的取值。',
        reference: 'a>1 时分子分母同除 aˣ，极限为 1；a=1 时为 1/2；0<a<1 时 aˣ→0，极限为 0。'
      }
    ]
  },
  shortAnswers: {
    high: '极限基本定理：lim f(x)=A 的充要条件是 f(x)=A+α(x)，其中 α(x) 为同一变化过程中的无穷小，即 lim α(x)=0。证明极限时只需证明 f(x)−A 为无穷小，从而把极限问题转化为无穷小分析，简化了 ε-δ 论证。',
    mid: 'lim f(x)=A 等价于 f(x)=A+α(x)，其中 α 是无穷小。这样求极限可以转化为证明 f(x)−A 趋于 0。',
    low: '函数值等于极限值加上一个无穷小。'
  },
  seedMessages: [
    {
      id: 'm-seed-1', authorId: 'p02', authorName: '陈晨', anonymous: true, visibility: 'public',
      body: '老师，x→x₀ 的极限为什么和 f(x₀) 有没有定义无关？教材第 15 页的 f₂(x) 在 x=1 处没有定义，但极限还是 2。',
      questionId: 'm-q1',
      answer: '极限只关心 x 无限接近 x₀ 时的函数值变化趋势，不要求 x 取到 x₀。所以 f 在 x₀ 处是否有定义不影响极限；只要去心邻域内有定义即可。',
      answeredBy: '张老师', createdAt: '11-27 18:30', answeredAt: '11-27 19:02'
    }
  ]
};
