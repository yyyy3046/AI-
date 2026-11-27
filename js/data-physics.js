window.SUBJECTS = window.SUBJECTS || {};

window.SUBJECTS.physics = {
  id: 'physics',
  course: {
    name: '大学物理', code: 'PHYS-101', teacher: '刘老师',
    className: '人工智能 2401 班', studentCount: 24
  },
  courseware: {
    fileName: '大学物理·力学与波动.pptx', size: '5.1 MB', pages: 44,
    uploadedAt: '11-28 09:05', status: 'done'
  },
  mindMap: [
    {
      id: 'p-c1', title: '质点力学', meta: '第 1—2 章',
      sections: [
        { id: 'p-s1', title: '牛顿运动定律', points: ['p-k1'] },
        { id: 'p-s2', title: '动量守恒', points: ['p-k2'] }
      ]
    },
    {
      id: 'p-c2', title: '振动与波动', meta: '第 3—4 章',
      sections: [
        { id: 'p-s3', title: '简谐振动', points: ['p-k3'] },
        { id: 'p-s4', title: '机械波', points: ['p-k4'] }
      ]
    },
    {
      id: 'p-c3', title: '功与能', meta: '第 5 章',
      sections: [
        { id: 'p-s5', title: '动能定理', points: ['p-k5'] },
        { id: 'p-s6', title: '机械能守恒', points: ['p-k6'] }
      ]
    }
  ],
  points: [
    {
      id: 'p-k1', chapterId: 'p-c1', sectionId: 'p-s1', title: '牛顿第二定律',
      summary: '物体所受合外力等于质量与加速度的乘积，是质点动力学最基本的定量关系。',
      formulas: ['F合 = m · a'],
      params: [
        { sym: 'F合', name: '合外力', desc: '作用在物体上的所有外力的矢量和，单位 N' },
        { sym: 'm', name: '质量', desc: '物体惯性大小的量度，单位 kg' },
        { sym: 'a', name: '加速度', desc: '速度的变化率，方向与合外力一致，单位 m/s²' }
      ],
      example: '质量 2 kg 的物体受到 6 N 的合力，加速度 a = F/m = 3 m/s²。',
      page: 9,
      excerpt: '牛顿第二定律是瞬时关系：合外力与加速度同时产生、同时变化、同时消失，方向始终一致。'
    },
    {
      id: 'p-k2', chapterId: 'p-c1', sectionId: 'p-s2', title: '动量守恒定律',
      summary: '系统不受外力或所受合外力为零时，系统的总动量保持不变。',
      formulas: ['m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′'],
      params: [
        { sym: 'm₁, m₂', name: '两物体质量', desc: '参与相互作用的两物体质量' },
        { sym: 'v', name: '碰撞前速度', desc: '相互作用之前的瞬时速度' },
        { sym: 'v′', name: '碰撞后速度', desc: '相互作用之后的瞬时速度' }
      ],
      example: '两个小球在光滑水平面上碰撞，碰撞前后总动量相等，可用于求碰后速度。',
      page: 17,
      excerpt: '动量守恒的适用条件是系统合外力为零或内力远大于外力，例如碰撞、爆炸等过程可近似使用。'
    },
    {
      id: 'p-k3', chapterId: 'p-c2', sectionId: 'p-s3', title: '简谐振动',
      summary: '物体在回复力作用下围绕平衡位置做周期性运动，位移随时间按余弦规律变化。',
      formulas: ['x = A cos(ωt + φ)'],
      params: [
        { sym: 'A', name: '振幅', desc: '偏离平衡位置的最大距离' },
        { sym: 'ω', name: '角频率', desc: '与周期关系为 ω = 2π/T' },
        { sym: 'φ', name: '初相位', desc: '决定 t = 0 时的位移与运动方向' }
      ],
      example: '弹簧振子振幅 5 cm、周期 2 s，则 ω = π rad/s，位移可写成 x = 0.05cos(πt + φ)。',
      page: 23,
      excerpt: '简谐振动的回复力与位移成正比且方向相反，即 F = −kx，这是它成立的根本原因。'
    },
    {
      id: 'p-k4', chapterId: 'p-c2', sectionId: 'p-s4', title: '机械波的波速关系',
      summary: '波速由介质决定，等于波长与频率的乘积，三者构成波动学最基本的定量关系。',
      formulas: ['v = λ / T = λ f'],
      params: [
        { sym: 'v', name: '波速', desc: '振动状态在介质中传播的速度' },
        { sym: 'λ', name: '波长', desc: '相邻同相位点之间的距离' },
        { sym: 'f', name: '频率', desc: '单位时间内完整波的个数，由波源决定' }
      ],
      example: '声波在空气中波速约 340 m/s，频率 340 Hz 时波长 λ = 1 m。',
      page: 29,
      excerpt: '频率由波源决定，波速由介质决定，因此换介质时频率不变而波长改变。'
    },
    {
      id: 'p-k5', chapterId: 'p-c3', sectionId: 'p-s5', title: '动能定理',
      summary: '合外力对物体做的功等于物体动能的变化量，把力与运动状态变化联系起来。',
      formulas: ['W合 = ½mv₂² − ½mv₁²'],
      params: [
        { sym: 'W合', name: '合外力做的功', desc: '所有力做功的代数和，单位 J' },
        { sym: 'v₁, v₂', name: '初末速度', desc: '过程开始与结束时的速率' }
      ],
      example: '物体从静止被合力做功 50 J，若质量 4 kg，则末速度满足 50 = ½·4·v₂²，得 v₂ = 5 m/s。',
      page: 35,
      excerpt: '动能定理只关心初末状态，无需分析中间过程的细节，因此处理变力做功时特别方便。'
    },
    {
      id: 'p-k6', chapterId: 'p-c3', sectionId: 'p-s6', title: '机械能守恒',
      summary: '只有重力或弹力做功时，系统的动能与势能相互转化，但机械能总量保持不变。',
      formulas: ['Ek₁ + Ep₁ = Ek₂ + Ep₂'],
      params: [
        { sym: 'Ek', name: '动能', desc: '½mv²，与速度大小有关' },
        { sym: 'Ep', name: '势能', desc: '重力势能 mgh 或弹性势能 ½kx²' }
      ],
      example: '小球从 5 m 高处自由下落，不计空气阻力，落地速度 v = √(2gh) ≈ 9.9 m/s。',
      page: 39,
      excerpt: '机械能守恒的条件是只有保守力做功，若存在摩擦力等非保守力，机械能会转化为内能。'
    }
  ],
  questions: [
    {
      id: 'p-q1', type: 'single', stem: '质量 2 kg 的物体受到 6 N 的合外力，其加速度为？',
      options: ['2 m/s²', '3 m/s²', '6 m/s²', '12 m/s²'], answer: 1, score: 10, knowledgeId: 'p-k1',
      hints: [
        '先回忆合外力、质量与加速度之间的定量关系。',
        '牛顿第二定律 F = ma，把已知量代入并解出 a。',
        '完整解析：a = F/m = 6/2 = 3 m/s²，方向与合外力方向一致。'
      ],
      diagnosis: {
        reason: '把公式记成了 a = F·m，导致结果偏大。',
        advice: '回到课件第 9 页，重新推导 F = ma 的量纲与变形。',
        similar: '若合力变为 9 N，物体质量不变，加速度变为多少？'
      }
    },
    {
      id: 'p-q2', type: 'single', stem: '简谐振动表达式 x = A cos(ωt + φ) 中，A 表示？',
      options: ['周期', '振幅', '初相位', '频率'], answer: 1, score: 10, knowledgeId: 'p-k3',
      hints: [
        '先看余弦函数前的系数代表什么物理量。',
        '余弦的取值在 −1 到 1 之间，乘以 A 后位移的最大值就是 A。',
        '完整解析：A 是振幅，表示偏离平衡位置的最大距离；ω 与周期有关，φ 是初相位。'
      ],
      diagnosis: {
        reason: '把振幅与周期、初相位的符号含义混在一起记忆。',
        advice: '用一张表整理 x = Acos(ωt+φ) 中每个符号的物理意义和单位。',
        similar: '若振幅加倍、周期不变，振动图像会怎样变化？'
      }
    },
    {
      id: 'p-q3', type: 'single', stem: '波速 v、波长 λ 与频率 f 之间的关系是？',
      options: ['v = λ / f', 'v = λ f', 'v = f / λ', 'v = λ + f'], answer: 1, score: 10, knowledgeId: 'p-k4',
      hints: [
        '从“一个周期内波传播多远”入手思考。',
        '一个周期 T 内波前进一个波长 λ，而 f = 1/T。',
        '完整解析：v = λ/T = λf，波速由介质决定，频率由波源决定，换介质时频率不变。'
      ],
      diagnosis: {
        reason: '把波长、频率与波速的乘除关系记反。',
        advice: '用单位检验：λ(m) × f(1/s) = m/s，正好是速度单位。',
        similar: '同一列波从空气进入水中，波速变大，波长和频率分别如何变化？'
      }
    },
    {
      id: 'p-q4', type: 'short', stem: '说明动量守恒定律的内容及其适用条件，并举一个可近似应用的情境。',
      options: [], answer: null, score: 20, knowledgeId: 'p-k2',
      hints: [
        '先写出守恒的表达式，再说明它对系统施加了什么条件。',
        '关键词是“合外力为零”和“内力远大于外力”。',
        '完整解析：系统不受外力或合外力为零时总动量守恒，表达式为 m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′；碰撞、爆炸等内力远大于外力的过程可近似应用。'
      ],
      reference: '动量守恒定律指系统不受外力或所受合外力为零时，系统总动量保持不变，即 m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′。适用条件是合外力为零，或内力远大于外力，例如碰撞、爆炸等短时间强相互作用过程可近似使用。',
      keywords: ['合外力', '为零', '碰撞'],
      diagnosis: {
        reason: '只记住了公式，没有说清适用条件为什么重要，也缺少具体情境。',
        advice: '按“内容—表达式—条件—实例”四步组织答案。',
        similar: '在粗糙水平面上两球碰撞，动量还守恒吗？为什么？'
      }
    }
  ],
  assignments: [
    {
      id: 'p-a1', mode: 'quiz', title: '第 1 次课堂问答 · 牛顿定律与简谐振动',
      questionIds: ['p-q1', 'p-q2'], publishedAt: '11-28 09:20', note: '课堂内 10 分钟完成'
    },
    {
      id: 'p-a2', mode: 'homework', title: '课后作业 · 波动与动量守恒',
      questionIds: ['p-q3', 'p-q4'], publishedAt: '11-28 16:40', note: '11-29 12:30 前提交'
    }
  ],
  shortAnswers: {
    high: '动量守恒定律指系统不受外力或合外力为零时总动量保持不变，表达式为 m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′。适用条件是合外力为零，或内力远大于外力，例如两球碰撞、爆炸等过程可以近似应用。',
    mid: '系统合外力为零时总动量不变，公式是 m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′，碰撞过程可以用。',
    low: '就是碰撞前后动量加起来一样。'
  },
  seedMessages: [
    {
      id: 'p-seed-1', authorId: 'p03', authorName: '刘洋', anonymous: true, visibility: 'public',
      body: '老师，简谐振动里的初相位 φ 到底怎么确定？画图的时候总是搞不清。',
      questionId: 'p-q2',
      answer: 'φ 由 t = 0 时的位移和速度方向共同决定：先看初始位移在平衡位置的哪一侧，再看初始速度方向，两者结合就能唯一确定 φ，通常取 −π 到 π 之间的值。',
      answeredBy: '刘老师', createdAt: '11-28 19:05', answeredAt: '11-28 19:40'
    }
  ]
};
