window.SUBJECTS = window.SUBJECTS || {};

/* 高等数学：内容按用户提供的教材扫描件（第一章 第13—24页）整理 */
window.SUBJECTS.math = {
  id: 'math',
  course: {
    name: '高等数学', code: 'MATH-101', teacher: '张老师',
    className: '人工智能 2401 班', studentCount: 24
  },
  courseware: {
    fileName: '高等数学·第一章 第四、五节 + 第二章 导数与微分（P13-40）.pdf', size: '7.2 MB', pages: 40,
    uploadedAt: '11-27 20:40', status: 'done'
  },
  mindMap: [
    {
      id: 'm-c1', title: '第一章 函数、极限与连续', meta: '第四、五节 · 教材 P13—24',
      sections: [
        { id: 'm-s1', title: '第四节 函数的极限', points: ['m-k1', 'm-k2', 'm-k3', 'm-k4', 'm-k5'] },
        { id: 'm-s2', title: '第五节 极限的运算法则', points: ['m-k6', 'm-k7', 'm-k8', 'm-k9', 'm-k10'] }
      ]
    },
    {
      id: 'm-c2', title: '第二章 导数与微分', meta: '导数概念 · 求导法则 · 高阶导数 · 隐函数与参数方程求导 · 微分 · 教材 P25—40',
      sections: [
        { id: 'm-s3', title: '第一节 导数的概念', points: ['m-k11', 'm-k12', 'm-k13'] },
        { id: 'm-s4', title: '第二节 函数的求导法则', points: ['m-k14', 'm-k15', 'm-k16', 'm-k17'] },
        { id: 'm-s5', title: '第三节 高阶导数', points: ['m-k18', 'm-k19'] },
        { id: 'm-s6', title: '第四节 隐函数与参数方程求导', points: ['m-k20', 'm-k21'] },
        { id: 'm-s7', title: '第五节 函数的微分', points: ['m-k22', 'm-k23'] }
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
    },
    {
      id: 'm-k11', chapterId: 'm-c2', sectionId: 'm-s3', title: '导数的定义',
      summary: '函数 y=f(x) 在点 x₀ 的某邻域内有定义，当自变量增量 Δx→0 时，比值 [f(x₀+Δx)−f(x₀)]/Δx 的极限存在，就称该极限为 f 在 x₀ 处的导数，记作 f′(x₀) 或 dy/dx|_{x=x₀}。',
      formulas: ['f′(x₀)=lim(Δx→0) [f(x₀+Δx)−f(x₀)]/Δx', 'f′(x₀)=lim(x→x₀) [f(x)−f(x₀)]/(x−x₀)', 'f′(x₀)=lim(h→0) [f(x₀+h)−f(x₀)]/h'],
      params: [
        { sym: 'Δx', name: '自变量增量', desc: '自变量在 x₀ 处的改变量，可正可负' },
        { sym: 'f′(x₀)', name: '导数', desc: '函数在 x₀ 处的瞬时变化率' },
        { sym: '极限存在', name: '可导', desc: '极限存在则称 f 在 x₀ 处可导，否则不可导' }
      ],
      example: '教材第 25 页：用定义求 f(x)=x² 在 x₀=1 处的导数。f′(1)=lim(Δx→0)[(1+Δx)²−1²]/Δx=lim(Δx→0)(2+Δx)=2。',
      page: 25,
      excerpt: '教材第 25 页：定义 1 给出导数的三种等价极限形式；导数刻画函数在一点处的瞬时变化率，几何上是切线斜率。'
    },
    {
      id: 'm-k12', chapterId: 'm-c2', sectionId: 'm-s3', title: '导数的几何意义',
      summary: '函数 y=f(x) 在点 x₀ 处的导数 f′(x₀) 在几何上表示曲线 y=f(x) 在点 M(x₀, f(x₀)) 处切线的斜率；切线方程为 y−f(x₀)=f′(x₀)(x−x₀)，法线方程为 y−f(x₀)=−(x−x₀)/f′(x₀)（f′(x₀)≠0）。',
      formulas: ['切线斜率 k=f′(x₀)=tan α', '切线：y−f(x₀)=f′(x₀)(x−x₀)', '法线：y−f(x₀)=−(x−x₀)/f′(x₀)（f′(x₀)≠0）'],
      params: [
        { sym: 'α', name: '切线倾角', desc: '切线与 x 轴正方向的夹角' },
        { sym: 'k', name: '切线斜率', desc: '等于该点处的导数值' },
        { sym: '法线', name: '切线垂线', desc: '过切点且与切线垂直的直线' }
      ],
      example: '教材第 26 页：求曲线 y=x² 在点 (1,1) 处的切线与法线方程。f′(1)=2，切线 y−1=2(x−1) 即 y=2x−1；法线 y−1=−(x−1)/2。',
      page: 26,
      excerpt: '教材第 26 页：导数的几何意义是切线斜率；据此可写出曲线在任一点的切线与法线方程。'
    },
    {
      id: 'm-k13', chapterId: 'm-c2', sectionId: 'm-s3', title: '可导与连续的关系',
      summary: '若函数 f 在点 x₀ 处可导，则 f 在 x₀ 处必连续；反之不一定，连续是可导的必要不充分条件。典型反例 y=|x| 在 x=0 处连续但不可导。',
      formulas: ['f 在 x₀ 可导 ⇒ f 在 x₀ 连续', 'f 在 x₀ 连续 ⇏ f 在 x₀ 可导', 'y=|x| 在 x=0 连续但不可导'],
      params: [
        { sym: '可导⇒连续', name: '必要条件', desc: '可导一定连续，连续未必可导' },
        { sym: '尖点', name: '不可导点', desc: '图像出现尖点、角点时左右导数不等，不可导' }
      ],
      example: '教材第 27 页：f(x)=|x| 在 x=0 处连续，但左导数为 −1、右导数为 +1，故 f′(0) 不存在。',
      page: 27,
      excerpt: '教材第 27 页：定理——可导必连续；并通过 y=|x| 说明连续不一定可导，尖点处导数不存在。'
    },
    {
      id: 'm-k14', chapterId: 'm-c2', sectionId: 'm-s4', title: '导数的四则运算法则',
      summary: '若 u=u(x)、v=v(x) 在点 x 处可导，则它们的和、差、积、商（分母不为 0）也在 x 处可导，且 (u±v)′=u′±v′，(uv)′=u′v+uv′，(u/v)′=(u′v−uv′)/v²。',
      formulas: ['(u±v)′=u′±v′', '(Cu)′=Cu′（C 为常数）', '(uv)′=u′v+uv′', '(u/v)′=(u′v−uv′)/v²（v≠0）'],
      params: [
        { sym: 'u, v', name: '可导函数', desc: '参与运算的两个函数都必须在该点可导' },
        { sym: 'v≠0', name: '分母非零', desc: '商的求导法则要求分母函数值不为 0' }
      ],
      example: '教材第 29 页：求 y=x³−2x²+sin x 的导数。y′=3x²−4x+cos x。',
      page: 29,
      excerpt: '教材第 29 页：定理 1—3 给出和差、积、商的求导法则，是求初等函数导数的基础。'
    },
    {
      id: 'm-k15', chapterId: 'm-c2', sectionId: 'm-s4', title: '反函数的导数',
      summary: '若函数 x=φ(y) 在区间内单调、可导且 φ′(y)≠0，则其反函数 y=f(x) 在对应区间内也可导，且 f′(x)=1/φ′(y)，即反函数的导数等于直接函数导数的倒数。',
      formulas: ['f′(x)=1/φ′(y)', 'dy/dx=1/(dx/dy)', '例：(arcsin x)′=1/√(1−x²)'],
      params: [
        { sym: 'φ′(y)≠0', name: '前提条件', desc: '直接函数导数不为 0 且单调' },
        { sym: '倒数关系', name: '反函数导数', desc: '反函数导数是直接函数导数的倒数' }
      ],
      example: '教材第 30 页：求 y=arcsin x 的导数。x=sin y，dx/dy=cos y，故 y′=1/cos y=1/√(1−sin²y)=1/√(1−x²)。',
      page: 30,
      excerpt: '教材第 30 页：定理——反函数的导数等于直接函数导数的倒数；由此推出反三角函数的导数公式。'
    },
    {
      id: 'm-k16', chapterId: 'm-c2', sectionId: 'm-s4', title: '复合函数的求导法则（链式法则）',
      summary: '若 u=g(x) 在点 x 可导，y=f(u) 在对应点 u 可导，则复合函数 y=f(g(x)) 在点 x 可导，且 dy/dx=dy/du·du/dx，即 y′_x=y′_u·u′_x。',
      formulas: ['dy/dx = dy/du · du/dx', 'y′_x = f′(u)·g′(x)', '例：(sin 2x)′=cos 2x·2=2cos 2x'],
      params: [
        { sym: 'u', name: '中间变量', desc: '内层函数 g(x) 作为外层函数的自变量' },
        { sym: '链式', name: '逐层求导', desc: '从外层到内层逐层求导再相乘' }
      ],
      example: '教材第 31 页：求 y=(x²+1)³ 的导数。令 u=x²+1，y=u³，y′=3u²·2x=6x(x²+1)²。',
      page: 31,
      excerpt: '教材第 31 页：定理——复合函数对自变量的导数，等于函数对中间变量的导数乘以中间变量对自变量的导数（链式法则）。'
    },
    {
      id: 'm-k17', chapterId: 'm-c2', sectionId: 'm-s4', title: '基本初等函数的导数公式',
      summary: '常数、幂函数、指数函数、对数函数、三角函数与反三角函数的导数公式，是求导运算的基本工具，须熟记。',
      formulas: ['(C)′=0，(x^μ)′=μx^(μ−1)', '(sin x)′=cos x，(cos x)′=−sin x', '(tan x)′=sec²x，(cot x)′=−csc²x', '(eˣ)′=eˣ，(aˣ)′=aˣln a', '(ln x)′=1/x，(log_a x)′=1/(x ln a)'],
      params: [
        { sym: 'μ', name: '幂指数', desc: '任意实数，幂函数求导公式对任意 μ 成立' },
        { sym: 'a', name: '底数', desc: '对数与指数函数公式中 a>0 且 a≠1' }
      ],
      example: '教材第 32 页：求 y=x√x+ln 2 的导数。y=x^(3/2)+ln2，y′=(3/2)x^(1/2)+0=(3/2)√x。',
      page: 32,
      excerpt: '教材第 32 页：基本导数公式表，涵盖常数、幂、指、对、三角及反三角函数，是所有求导运算的基础。'
    },
    {
      id: 'm-k18', chapterId: 'm-c2', sectionId: 'm-s5', title: '高阶导数的定义与计算',
      summary: '函数 f(x) 的导数 f′(x) 仍是 x 的函数，若 f′(x) 仍可导，其导数称为 f 的二阶导数，记作 f″(x) 或 d²y/dx²；一般地，n 阶导数是 n−1 阶导数的导数。',
      formulas: ['f″(x)=(f′(x))′', 'y⁽ⁿ⁾=(y⁽ⁿ⁻¹⁾)′', 'dⁿy/dxⁿ：n 阶导数', '加速度 a=s″(t)'],
      params: [
        { sym: 'f⁽ⁿ⁾', name: 'n 阶导数', desc: '对 f 连续求 n 次导数' },
        { sym: 's″(t)', name: '加速度', desc: '位移对时间的二阶导数即加速度' }
      ],
      example: '教材第 33 页：求 y=x³ 的各阶导数。y′=3x²，y″=6x，y″′=6，y⁽⁴⁾=0。',
      page: 33,
      excerpt: '教材第 33 页：高阶导数的定义与记号；二阶导数的物理意义是加速度。'
    },
    {
      id: 'm-k19', chapterId: 'm-c2', sectionId: 'm-s5', title: '几个常见函数的高阶导数公式',
      summary: '指数函数 eˣ 的各阶导数都是它本身；正弦、余弦函数的 n 阶导数呈周期性；幂函数 x^μ 的 n 阶导数有明确的阶乘公式。',
      formulas: ['(eˣ)⁽ⁿ⁾=eˣ', '(sin x)⁽ⁿ⁾=sin(x+nπ/2)', '(cos x)⁽ⁿ⁾=cos(x+nπ/2)', '(x^μ)⁽ⁿ⁾=μ(μ−1)…(μ−n+1)x^(μ−n)'],
      params: [
        { sym: 'nπ/2', name: '相位平移', desc: '正余弦每求一阶导数相位增加 π/2' },
        { sym: 'μ', name: '幂指数', desc: '幂函数高阶导数随阶数递推，n>μ 时为 0（μ 为正整数）' }
      ],
      example: '教材第 34 页：求 y=sin x 的 n 阶导数。归纳得 (sin x)⁽ⁿ⁾=sin(x+nπ/2)。',
      page: 34,
      excerpt: '教材第 34 页：常用高阶导数公式，eˣ、sin x、cos x、x^μ 的 n 阶导数可直接套用。'
    },
    {
      id: 'm-k20', chapterId: 'm-c2', sectionId: 'm-s6', title: '隐函数的导数',
      summary: '若变量 x、y 之间的函数关系由方程 F(x,y)=0 所确定，这种函数称为隐函数。求导时将方程两边对 x 求导，把 y 看作 x 的函数，遇到 y 的项用链式法则，再解出 y′。',
      formulas: ['方程两边对 x 求导', '遇到 y 的项乘以 y′（链式法则）', '整理解出 y′=dy/dx'],
      params: [
        { sym: 'y=y(x)', name: '隐函数', desc: 'y 是 x 的函数，求导时须用复合函数求导法则' },
        { sym: '解出 y′', name: '整理', desc: '求导后把含 y′ 的项合并解出' }
      ],
      example: '教材第 35 页：求由方程 eʸ+xy−e=0 确定的隐函数的导数。两边对 x 求导：eʸ·y′+y+x·y′=0，解得 y′=−y/(x+eʸ)。',
      page: 35,
      excerpt: '教材第 35 页：隐函数求导法——方程两边对 x 求导，把 y 视为 x 的函数用链式法则，再解出 y′。'
    },
    {
      id: 'm-k21', chapterId: 'm-c2', sectionId: 'm-s6', title: '由参数方程确定的函数的导数',
      summary: '若函数 y=y(x) 由参数方程 x=φ(t)、y=ψ(t) 确定，且 φ′(t)≠0，则 dy/dx=(dy/dt)/(dx/dt)=ψ′(t)/φ′(t)，即 y 对 x 的导数等于 y 对参数 t 的导数除以 x 对 t 的导数。',
      formulas: ['dy/dx = (dy/dt)/(dx/dt) = ψ′(t)/φ′(t)', 'φ′(t)≠0 为前提', '二阶导数 d²y/dx²=(d/dt)(dy/dx)·(dt/dx)'],
      params: [
        { sym: 't', name: '参数', desc: '参数方程中的中间变量' },
        { sym: 'φ′(t)≠0', name: '可导前提', desc: 'x 对 t 的导数不为 0 时才能用公式' }
      ],
      example: '教材第 36 页：求摆线 x=a(t−sin t)、y=a(1−cos t) 的 dy/dx。dy/dx=[a sin t]/[a(1−cos t)]=cot(t/2)。',
      page: 36,
      excerpt: '教材第 36 页：参数方程求导公式 dy/dx=ψ′(t)/φ′(t)，以及二阶导数的链式求法。'
    },
    {
      id: 'm-k22', chapterId: 'm-c2', sectionId: 'm-s7', title: '微分的定义与几何意义',
      summary: '设函数 y=f(x) 在点 x₀ 的某邻域内有定义，若增量 Δy=f(x₀+Δx)−f(x₀) 可表示为 Δy=AΔx+o(Δx)（A 与 Δx 无关），则称 f 在 x₀ 可微，AΔx 称为微分，记作 dy=AΔx；可微 ⇔ 可导，且 A=f′(x₀)，故 dy=f′(x₀)Δx。',
      formulas: ['Δy=AΔx+o(Δx) ⇒ 可微', 'dy=f′(x₀)Δx=f′(x₀)dx', '可微 ⇔ 可导', 'Δy≈dy（切线增量近似曲线增量）'],
      params: [
        { sym: 'dy', name: '微分', desc: '函数增量的线性主部' },
        { sym: 'o(Δx)', name: '高阶无穷小', desc: '当 Δx→0 时比 Δx 趋于 0 更快' },
        { sym: 'dx', name: '自变量微分', desc: '规定 dx=Δx，即自变量的微分等于其增量' }
      ],
      example: '教材第 38 页：求 y=x² 在 x=1、Δx=0.01 时的微分与增量。dy=2x·Δx=0.02，Δy=(1.01)²−1=0.0201。',
      page: 38,
      excerpt: '教材第 38 页：微分定义与可微可导等价定理；几何上 dy 是切线纵坐标的增量，是曲线增量 Δy 的线性近似。'
    },
    {
      id: 'm-k23', chapterId: 'm-c2', sectionId: 'm-s7', title: '基本微分公式与微分运算法则',
      summary: '由基本导数公式可直接得到基本微分公式 d(x^μ)=μx^(μ−1)dx 等；微分满足 d(u±v)=du±dv、d(uv)=vdu+udv、d(u/v)=(vdu−udv)/v²，且微分形式具有不变性：无论 u 是自变量还是中间变量，dy=f′(u)du 形式不变。',
      formulas: ['d(x^μ)=μx^(μ−1)dx，d(sin x)=cos x dx', 'd(u±v)=du±dv，d(uv)=vdu+udv', 'd(u/v)=(vdu−udv)/v²（v≠0）', '微分形式不变性：dy=f′(u)du'],
      params: [
        { sym: 'du, dv', name: '函数微分', desc: '对应函数的微分' },
        { sym: '形式不变性', name: '一阶微分不变', desc: '无论 u 是自变量还是中间变量，微分形式 dy=f′(u)du 不变' }
      ],
      example: '教材第 39 页：求 y=sin(2x+1) 的微分。由形式不变性，dy=cos(2x+1)·d(2x+1)=2cos(2x+1)dx。',
      page: 39,
      excerpt: '教材第 39 页：基本微分公式表与微分四则运算法则；一阶微分形式不变性是微分的重要性质。'
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
    },
    {
      id: 'm-q5', type: 'single', stem: '函数 f(x)=x² 在 x=1 处的导数 f′(1) 等于？',
      options: ['2', '1', '0', '不存在'], answer: 0, score: 10, knowledgeId: 'm-k11',
      hints: [
        '用导数定义 f′(1)=lim(Δx→0)[f(1+Δx)−f(1)]/Δx。',
        '代入 f(1+Δx)=(1+Δx)²=1+2Δx+(Δx)²，f(1)=1。',
        '完整解析：f′(1)=lim(Δx→0)[2Δx+(Δx)²]/Δx=lim(2+Δx)=2。'
      ],
      diagnosis: {
        reason: '把导数值算成函数值 f(1)=1，或忘记展开平方。',
        advice: '回到教材第 25 页定义 1，先写出增量比再取极限。',
        similar: '用定义求 f(x)=x³ 在 x=1 处的导数。'
      }
    },
    {
      id: 'm-q6', type: 'single', stem: '函数 y=(x²+1)³ 的导数 y′ 等于？',
      options: ['6x(x²+1)²', '3(x²+1)²', '6x(x²+1)', '2x(x²+1)²'], answer: 0, score: 10, knowledgeId: 'm-k16',
      hints: [
        '这是复合函数，令 u=x²+1，则 y=u³，用链式法则。',
        'dy/dx = dy/du · du/dx = 3u² · 2x。',
        '完整解析：代回 u=x²+1，得 y′=6x(x²+1)²。'
      ],
      diagnosis: {
        reason: '只对最外层求导忘记乘以内层导数，或内层导数算错。',
        advice: '链式法则要从外到内逐层求导再相乘，回到教材第 31 页。',
        similar: '求 y=sin(2x) 的导数。'
      }
    },
    {
      id: 'm-q7', type: 'single', stem: '由方程 eʸ+xy−e=0 确定的隐函数 y=y(x) 的导数 y′ 等于？',
      options: ['−y/(x+eʸ)', 'y/(x+eʸ)', '−y/x', '−(x+eʸ)/y'], answer: 0, score: 10, knowledgeId: 'm-k20',
      hints: [
        '方程两边对 x 求导，把 y 看作 x 的函数，eʸ 是复合函数。',
        '求导得 eʸ·y′ + (y + x·y′) = 0。',
        '完整解析：合并 y′ 项得 (eʸ+x)y′=−y，故 y′=−y/(x+eʸ)。'
      ],
      diagnosis: {
        reason: '对 eʸ 求导时漏乘 y′，或对 xy 求导只用了乘积的一项。',
        advice: '隐函数求导要把 y 视为 x 的函数，遇到 y 必须用链式法则，回到教材第 35 页。',
        similar: '求由 x²+y²=1 确定的隐函数的导数。'
      }
    },
    {
      id: 'm-q8', type: 'short', stem: '举例说明"函数在某点连续但不一定可导"，并解释原因。',
      options: [], answer: null, score: 20, knowledgeId: 'm-k13',
      hints: [
        '先回忆可导与连续的关系：可导必连续，连续未必可导。',
        '举一个图像有"尖点"的函数，例如 y=|x| 在 x=0 处。',
        '完整解析：y=|x| 在 x=0 连续，但左导数为 −1、右导数为 +1，左右导数不等，故 f′(0) 不存在。'
      ],
      reference: '可导一定连续，但连续不一定可导。反例：f(x)=|x| 在 x=0 处连续，但左导数 lim(Δx→0⁻)(|Δx|/Δx)=−1，右导数 lim(Δx→0⁺)(|Δx|/Δx)=+1，左右导数不相等，所以 f′(0) 不存在。几何上曲线在原点出现尖点，没有唯一切线。',
      keywords: ['连续', '可导', '左导数', '右导数', '|x|'],
      diagnosis: {
        reason: '只写结论没有举例，或举例时没有计算左右导数说明不可导。',
        advice: '按"结论—反例—左右导数计算—几何解释"四层作答，回到教材第 27 页。',
        similar: '讨论 f(x)=x^(2/3) 在 x=0 处的可导性。'
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
    },
    {
      id: 'm-a3', mode: 'quiz', title: '第 2 次课堂问答 · 导数的概念',
      questionIds: ['m-q5', 'm-q8'], publishedAt: '11-28 09:20', note: '讲完导数定义与可导性后课堂检测', duration: 10
    },
    {
      id: 'm-a4', mode: 'homework', title: '课后作业 · 求导法则',
      questionIds: ['m-q6', 'm-q7'], publishedAt: '11-28 16:40', note: '教材 P29—36 例题后完成'
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
    },
    {
      id: 'm-eq9', type: 'single', source: '真题', difficulty: '基础', score: 5, knowledgeId: 'm-k11',
      stem: '函数 f(x)=2x+1 在 x=1 处的导数 f′(1) 为？',
      options: ['2', '1', '0', '不存在'], answer: 0,
      hints: ['用定义写出增量比 [f(1+Δx)−f(1)]/Δx。', '分子 = 2(1+Δx)+1−3 = 2Δx。', '完整解析：增量比 = 2Δx/Δx = 2，极限为 2。'],
      diagnosis: { reason: '把导数当成函数值，或没先化简增量比。', advice: '用定义求导要先算增量比再取极限，回到第 25 页。', similar: '用定义求 f(x)=3x−2 在 x=2 处的导数。' }
    },
    {
      id: 'm-eq10', type: 'single', source: '真题', difficulty: '基础', score: 5, knowledgeId: 'm-k12',
      stem: '曲线 y=x² 在点 (1,1) 处的切线斜率为？',
      options: ['2', '1', '0', '−1'], answer: 0,
      hints: ['切线斜率等于该点处的导数。', 'y′=2x，代入 x=1。', '完整解析：k=f′(1)=2。'],
      diagnosis: { reason: '忘记斜率即导数，或代入错误。', advice: '导数的几何意义是切线斜率，回到第 26 页。', similar: '求曲线 y=x³ 在点 (1,1) 处的切线方程。' }
    },
    {
      id: 'm-eq11', type: 'single', source: '真题', difficulty: '提高', score: 5, knowledgeId: 'm-k16',
      stem: '函数 y=e^(x²) 的导数 y′ 为？',
      options: ['2x·e^(x²)', 'e^(x²)', 'x²·e^(x²)', '2·e^(x²)'], answer: 0,
      hints: ['令 u=x²，y=e^u，用链式法则。', 'dy/dx = e^u · u′ = e^(x²) · 2x。', '完整解析：y′=2x·e^(x²)。'],
      diagnosis: { reason: '漏乘内层导数 x² 的导数 2x。', advice: '复合函数求导必须从外到内逐层相乘，回到第 31 页。', similar: '求 y=sin(x³) 的导数。' }
    },
    {
      id: 'm-eq12', type: 'single', source: '真题', difficulty: '提高', score: 5, knowledgeId: 'm-k19',
      stem: '函数 y=sin x 的二阶导数 y″ 为？',
      options: ['−sin x', 'sin x', 'cos x', '−cos x'], answer: 0,
      hints: ['一阶导数 (sin x)′=cos x。', '再求导 (cos x)′=−sin x。', '完整解析：y″=−sin x。'],
      diagnosis: { reason: '符号记错，或只求了一阶导数。', advice: '记住 sin x 每求导一次相位加 π/2，回到第 34 页。', similar: '求 y=cos x 的二阶导数。' }
    },
    {
      id: 'm-eq13', type: 'single', source: '真题', difficulty: '提高', score: 5, knowledgeId: 'm-k21',
      stem: '参数方程 x=t², y=t³ 确定的函数在 t=1 处的 dy/dx 为？',
      options: ['3/2', '2/3', '3', '2'], answer: 0,
      hints: ['用公式 dy/dx=(dy/dt)/(dx/dt)。', 'dy/dt=3t²，dx/dt=2t。', '完整解析：dy/dx=3t²/(2t)=3t/2，t=1 时为 3/2。'],
      diagnosis: { reason: '公式分子分母写反，或代入 t 求值算错。', advice: '参数方程求导 dy/dx=ψ′(t)/φ′(t)，回到第 36 页。', similar: '求 x=t+1, y=t² 在 t=0 处的 dy/dx。' }
    },
    {
      id: 'm-eq14', type: 'short', source: '真题', difficulty: '基础', score: 10, knowledgeId: 'm-k22',
      stem: '微分 dy 的几何意义是什么？它与函数增量 Δy 有何关系？',
      options: [], answer: null,
      keywords: ['切线', '增量', '线性主部', '近似'],
      reference: '几何上，微分 dy 是曲线 y=f(x) 在点 (x₀,f(x₀)) 处切线纵坐标的增量；而 Δy 是曲线纵坐标的增量。当 Δx→0 时，Δy−dy 是比 Δx 高阶的无穷小，故可用 dy 近似代替 Δy，即 Δy≈dy=f′(x₀)Δx。',
      hints: ['先说出 dy 对应哪条线的增量。', '说明 Δy 与 dy 的差是高阶无穷小。', '完整解析：见 reference。'],
      diagnosis: { reason: '只说 dy 近似 Δy，没说几何意义是切线增量。', advice: '从几何意义（切线增量）和近似关系两层作答，回到第 38 页。', similar: '说明为什么 |Δx| 很小时可以用 dy 近似 Δy。' }
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
      },
      {
        id: 'm-exm-13', title: '例 1 · 用定义求导数', page: 25, knowledgeId: 'm-k11',
        stem: '用导数定义求 f(x)=x² 在 x=1 处的导数。',
        solution: 'f′(1)=lim(Δx→0)[f(1+Δx)−f(1)]/Δx=lim(Δx→0)[(1+Δx)²−1]/Δx=lim(Δx→0)(2+Δx)=2。',
        source: '教材第 25 页'
      },
      {
        id: 'm-exm-14', title: '例 2 · 切线与法线方程', page: 26, knowledgeId: 'm-k12',
        stem: '求曲线 y=x² 在点 (1,1) 处的切线与法线方程。',
        solution: 'y′=2x，f′(1)=2。切线：y−1=2(x−1)，即 y=2x−1；法线：y−1=−(x−1)/2，即 y=−x/2+3/2。',
        source: '教材第 26 页'
      },
      {
        id: 'm-exm-15', title: '例 3 · 四则运算求导', page: 29, knowledgeId: 'm-k14',
        stem: '求 y=x³−2x²+sin x 的导数。',
        solution: '由和差与基本公式，y′=3x²−4x+cos x。',
        source: '教材第 29 页'
      },
      {
        id: 'm-exm-16', title: '例 4 · 复合函数求导（链式法则）', page: 31, knowledgeId: 'm-k16',
        stem: '求 y=(x²+1)³ 的导数。',
        solution: '令 u=x²+1，则 y=u³。y′=3u²·u′=3(x²+1)²·2x=6x(x²+1)²。',
        source: '教材第 31 页'
      },
      {
        id: 'm-exm-17', title: '例 5 · 隐函数求导', page: 35, knowledgeId: 'm-k20',
        stem: '求由方程 eʸ+xy−e=0 确定的隐函数 y=y(x) 的导数。',
        solution: '方程两边对 x 求导：eʸ·y′+y+x·y′=0，合并得 (eʸ+x)y′=−y，故 y′=−y/(x+eʸ)。',
        source: '教材第 35 页'
      },
      {
        id: 'm-exm-18', title: '例 6 · 参数方程求导', page: 36, knowledgeId: 'm-k21',
        stem: '求摆线 x=a(t−sin t)、y=a(1−cos t) 的 dy/dx。',
        solution: 'dy/dx=(dy/dt)/(dx/dt)=[a sin t]/[a(1−cos t)]=sin t/(1−cos t)=cot(t/2)。',
        source: '教材第 36 页'
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
      },
      {
        id: 'm-exr-9', title: '习题 2-1 · 用定义求导', page: 28, knowledgeId: 'm-k11', difficulty: '基础',
        stem: '用导数定义求 f(x)=x³ 在 x=1 处的导数。',
        reference: 'f′(1)=lim(Δx→0)[(1+Δx)³−1]/Δx=lim(Δx→0)[3Δx+3(Δx)²+(Δx)³]/Δx=lim(3+3Δx+(Δx)²)=3。'
      },
      {
        id: 'm-exr-10', title: '习题 2-2 · 求下列函数的导数', page: 32, knowledgeId: 'm-k17', difficulty: '基础',
        stem: '求 y=x⁴+3x²−ln x+5 的导数。',
        reference: 'y′=4x³+6x−1/x。'
      },
      {
        id: 'm-exr-11', title: '习题 2-3 · 高阶导数', page: 34, knowledgeId: 'm-k18', difficulty: '提高',
        stem: '求 y=eˣ·sin x 的二阶导数 y″。',
        reference: 'y′=eˣ(sin x+cos x)，y″=eˣ(sin x+cos x)+eˣ(cos x−sin x)=2eˣcos x。'
      },
      {
        id: 'm-exr-12', title: '习题 2-4 · 隐函数求导', page: 37, knowledgeId: 'm-k20', difficulty: '提高',
        stem: '求由方程 x²+y²=1 确定的隐函数 y=y(x) 的导数。',
        reference: '两边对 x 求导：2x+2y·y′=0，解得 y′=−x/y（y≠0）。'
      },
      {
        id: 'm-exr-13', title: '习题 2-5 · 微分近似计算', page: 40, knowledgeId: 'm-k22', difficulty: '综合',
        stem: '利用微分近似计算 √(9.02) 的近似值。',
        reference: '取 f(x)=√x，x₀=9，Δx=0.02。f′(x)=1/(2√x)，f′(9)=1/6。√(9.02)≈f(9)+f′(9)·Δx=3+0.02/6≈3.0033。'
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
