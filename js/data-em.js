window.SUBJECTS = window.SUBJECTS || {};

window.SUBJECTS.em = {
  id: 'em',
  course: {
    name: '电磁场', code: 'EM-201', teacher: '王老师',
    className: '人工智能 2401 班', studentCount: 24
  },
  courseware: {
    fileName: '电磁场与电磁波·静电场与感应.pptx', size: '4.6 MB', pages: 40,
    uploadedAt: '11-28 09:05', status: 'done'
  },
  mindMap: [
    {
      id: 'e-c1', title: '静电场', meta: '第 1—2 章',
      sections: [
        { id: 'e-s1', title: '电场强度', points: ['e-k1'] },
        { id: 'e-s2', title: '高斯定理', points: ['e-k2'] }
      ]
    },
    {
      id: 'e-c2', title: '稳恒磁场', meta: '第 3—4 章',
      sections: [
        { id: 'e-s3', title: '安培环路定理', points: ['e-k3'] },
        { id: 'e-s4', title: '洛伦兹力', points: ['e-k4'] }
      ]
    },
    {
      id: 'e-c3', title: '电磁感应', meta: '第 5—6 章',
      sections: [
        { id: 'e-s5', title: '法拉第电磁感应定律', points: ['e-k5'] },
        { id: 'e-s6', title: '麦克斯韦方程组', points: ['e-k6'] }
      ]
    }
  ],
  points: [
    {
      id: 'e-k1', chapterId: 'e-c1', sectionId: 'e-s1', title: '电场强度',
      summary: '单位正电荷在该点受到的电场力，用来描述电场的强弱与方向。',
      formulas: ['E = F / q', 'E = kQ / r²  （点电荷）'],
      params: [
        { sym: 'F', name: '电场力', desc: '试探电荷在该点受到的力，单位 N' },
        { sym: 'q', name: '试探电荷电量', desc: '用于测量的微小正电荷，单位 C' },
        { sym: 'k', name: '静电力常量', desc: '约 9.0×10⁹ N·m²/C²' },
        { sym: 'r', name: '到点电荷的距离', desc: '场点到电荷的距离，单位 m' }
      ],
      example: '点电荷 Q 在距离 r 处产生的场强 E = kQ/r²，距离加倍时场强变为原来的四分之一。',
      page: 10,
      excerpt: '电场强度是矢量，方向规定为正电荷在该点的受力方向；多个场源时按矢量叠加。'
    },
    {
      id: 'e-k2', chapterId: 'e-c1', sectionId: 'e-s2', title: '高斯定理',
      summary: '通过任意闭合曲面的电通量，等于该曲面内包围的净电荷除以真空介电常数。',
      formulas: ['∮ E · dS = Σq / ε₀'],
      params: [
        { sym: '∮E·dS', name: '电通量', desc: '电场穿过闭合曲面的总量' },
        { sym: 'Σq', name: '闭合面内的净电荷', desc: '只计算闭合曲面内部的电荷代数和' },
        { sym: 'ε₀', name: '真空介电常数', desc: '约 8.85×10⁻¹² F/m' }
      ],
      example: '球面对称带电体，取同心球面作高斯面，可由 E·4πr² = Q/ε₀ 直接求出场强。',
      page: 16,
      excerpt: '高斯定理说明电通量只与闭合面内的净电荷有关，面外的电荷对总通量没有贡献。'
    },
    {
      id: 'e-k3', chapterId: 'e-c2', sectionId: 'e-s3', title: '安培环路定理',
      summary: '磁感应强度沿任意闭合回路的环流，等于穿过该回路所围曲面的电流代数和乘以真空磁导率。',
      formulas: ['∮ B · dl = μ₀ ΣI'],
      params: [
        { sym: '∮B·dl', name: '磁感应强度环流', desc: '沿闭合路径的线积分' },
        { sym: 'μ₀', name: '真空磁导率', desc: '4π×10⁻⁷ T·m/A' },
        { sym: 'ΣI', name: '穿过回路的电流代数和', desc: '按右手螺旋方向确定正负' }
      ],
      example: '长直载流导线外取同心圆为回路，得 B·2πr = μ₀I，因此 B = μ₀I/(2πr)。',
      page: 23,
      excerpt: '安培环路定理适用于稳恒电流产生的磁场，对称性强的场景可直接用它求磁感应强度。'
    },
    {
      id: 'e-k4', chapterId: 'e-c2', sectionId: 'e-s4', title: '洛伦兹力',
      summary: '运动电荷在磁场中受到的力，大小与电荷量、速度、磁感应强度及夹角的正弦成正比。',
      formulas: ['F = qv × B', '|F| = qvB sin θ'],
      params: [
        { sym: 'q', name: '电荷量', desc: '正负号决定受力方向相反' },
        { sym: 'v', name: '运动速度', desc: '方向沿电荷运动方向' },
        { sym: 'B', name: '磁感应强度', desc: '磁场强弱与方向，单位 T' },
        { sym: 'θ', name: '速度与磁场的夹角', desc: '两者平行时洛伦兹力为零' }
      ],
      example: '电子垂直于磁场射入，受洛伦兹力提供向心力，做匀速圆周运动，半径 r = mv/(qB)。',
      page: 28,
      excerpt: '洛伦兹力始终垂直于速度方向，因此它不做功，只改变电荷运动方向而不改变速率。'
    },
    {
      id: 'e-k5', chapterId: 'e-c3', sectionId: 'e-s5', title: '法拉第电磁感应定律',
      summary: '回路中感应电动势的大小与穿过回路的磁通量变化率成正比，负号体现楞次定律。',
      formulas: ['ε = − n · dΦ / dt'],
      params: [
        { sym: 'ε', name: '感应电动势', desc: '单位 V，驱动感应电流' },
        { sym: 'n', name: '线圈匝数', desc: '多匝线圈电动势按匝数倍增' },
        { sym: 'dΦ/dt', name: '磁通量变化率', desc: '反映磁场变化或面积变化的快慢' }
      ],
      example: '线圈匝数 100，磁通量在 0.1 s 内均匀减少 0.02 Wb，则感应电动势约为 20 V。',
      page: 33,
      excerpt: '感应电动势的方向由楞次定律判断：感应电流的磁场总是阻碍引起它的磁通量变化。'
    },
    {
      id: 'e-k6', chapterId: 'e-c3', sectionId: 'e-s6', title: '麦克斯韦方程组（积分形式）',
      summary: '描述电场与磁场相互联系、相互产生的四个基本方程，是经典电磁理论的核心。',
      formulas: ['∮ E · dl = − dΦB / dt', '∮ B · dl = μ₀I + μ₀ε₀ dΦE / dt'],
      params: [
        { sym: 'ΦB', name: '磁通量', desc: '穿过回路的磁通量，变化时产生电场' },
        { sym: 'ΦE', name: '电通量', desc: '变化时产生磁场，即位移电流' },
        { sym: 'μ₀, ε₀', name: '真空磁导率与介电常数', desc: '决定电磁波在真空中的传播速度' }
      ],
      example: '变化的磁场在空间激发涡旋电场，这正是电磁感应与电磁波传播的理论基础。',
      page: 37,
      excerpt: '麦克斯韦方程组统一了电与磁，并预言电磁波以光速传播，为无线电与光学奠定了理论基础。'
    }
  ],
  questions: [
    {
      id: 'e-q1', type: 'single', stem: '点电荷产生的电场强度 E 与距离 r 的关系是？',
      options: ['E ∝ 1/r', 'E ∝ 1/r²', 'E ∝ 1/r³', 'E ∝ r²'], answer: 1, score: 10, knowledgeId: 'e-k1',
      hints: [
        '回想库仑定律中电场力与距离的关系。',
        '库仑力 F ∝ 1/r²，而 E = F/q，所以场强也按同样规律变化。',
        '完整解析：点电荷场强 E = kQ/r²，与距离平方成反比，距离加倍场强变为四分之一。'
      ],
      diagnosis: {
        reason: '把场强与距离的关系误记成一次方反比，可能是与长直导线的磁场公式混淆了。',
        advice: '对比记忆：点电荷 E∝1/r²，长直导线 B∝1/r。',
        similar: '距离变为原来的 3 倍时，点电荷场强变为原来的几分之几？'
      }
    },
    {
      id: 'e-q2', type: 'single', stem: '高斯定理中，通过闭合曲面的电通量等于？',
      options: ['Σq / ε₀', 'μ₀ ΣI', 'Σq', '0'], answer: 0, score: 10, knowledgeId: 'e-k2',
      hints: [
        '高斯定理描述的是电通量与什么量之间的关系。',
        '只与闭合面内包围的净电荷有关，还要除以真空介电常数。',
        '完整解析：∮E·dS = Σq/ε₀，面外电荷对总电通量没有贡献。'
      ],
      diagnosis: {
        reason: '把高斯定理与安培环路定理的右端项混淆了。',
        advice: '并列对比：电通量对应电荷与 ε₀，磁场环流对应电流与 μ₀。',
        similar: '若闭合面内净电荷为零，面外的强电荷会不会让总电通量改变？'
      }
    },
    {
      id: 'e-q3', type: 'single', stem: '法拉第定律 ε = −n·dΦ/dt 中的负号体现了什么？',
      options: ['能量守恒定律', '楞次定律', '欧姆定律', '库仑定律'], answer: 1, score: 10, knowledgeId: 'e-k5',
      hints: [
        '这个负号描述的是感应电流的方向问题。',
        '感应电流产生的磁场总是阻碍原磁通量的变化。',
        '完整解析：负号对应楞次定律，说明感应电动势的方向总是反抗引起它的磁通量变化。'
      ],
      diagnosis: {
        reason: '只把负号当作数学符号，没有联系到感应电流的方向规律。',
        advice: '回到课件第 33 页，结合楞次定律做一次方向判断练习。',
        similar: '磁铁插入线圈时线圈中感应电流的磁场方向如何？抽出时呢？'
      }
    },
    {
      id: 'e-q4', type: 'short', stem: '说明洛伦兹力的大小计算方式与方向判定方法，并指出它为什么不做功。',
      options: [], answer: null, score: 20, knowledgeId: 'e-k4',
      hints: [
        '先写大小公式，注意其中角度 θ 的含义。',
        '方向用左手定则判断，注意正负电荷方向相反。',
        '完整解析：F = qvB sinθ，方向由左手定则判定；由于力始终垂直于速度，瞬时功率为零，所以洛伦兹力不做功。'
      ],
      reference: '洛伦兹力大小 F = qvB sinθ，其中 θ 是速度与磁场的夹角，当二者平行时力为零。方向用左手定则判定：让磁感线穿入手心，四指指向正电荷运动方向，拇指所指即为受力方向；负电荷则方向相反。由于洛伦兹力始终垂直于速度方向，不做功，只改变运动方向。',
      keywords: ['qvB', '左手', '不做功'],
      diagnosis: {
        reason: '只写出公式，没有说明方向判定方法，也没有解释不做功的原因。',
        advice: '按“大小—方向—做功”三段组织答案，并补充平行磁场时的特殊情况。',
        similar: '若电荷沿磁场方向运动，洛伦兹力为多少？说明理由。'
      }
    }
  ],
  assignments: [
    {
      id: 'e-a1', mode: 'quiz', title: '第 1 次课堂问答 · 电场强度与高斯定理',
      questionIds: ['e-q1', 'e-q2'], publishedAt: '11-28 09:20', note: '课堂内 10 分钟完成'
    },
    {
      id: 'e-a2', mode: 'homework', title: '课后作业 · 电磁感应与洛伦兹力',
      questionIds: ['e-q3', 'e-q4'], publishedAt: '11-28 16:40', note: '11-29 12:30 前提交'
    }
  ],
  shortAnswers: {
    high: '洛伦兹力大小 F = qvB sinθ，θ 是速度与磁场的夹角，平行时为零。方向用左手定则判断，正电荷四指指向运动方向，负电荷相反。由于力始终垂直于速度，所以不做功，只改变运动方向。',
    mid: '大小是 F = qvB sinθ，方向用左手定则判断，因为力垂直于速度所以不做功。',
    low: '洛伦兹力就是磁场对运动电荷的力，用左手定则判断方向。'
  },
  seedMessages: [
    {
      id: 'e-seed-1', authorId: 'p04', authorName: '赵敏', anonymous: true, visibility: 'public',
      body: '老师，高斯定理里的闭合曲面可以随便取吗？换一个曲面结果会变吗？',
      questionId: 'e-q2',
      answer: '闭合曲面可以任意取，只要它包围的净电荷不变，电通量就相同。实际计算时通常取与场对称性匹配的曲面，例如球面或圆柱面，这样场强可以从积分中提出来。',
      answeredBy: '王老师', createdAt: '11-28 20:10', answeredAt: '11-28 20:35'
    }
  ]
};
