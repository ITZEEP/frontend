export const AI_SENDER = {
  PLAIN: '9999',
  BUTTON: '9998',
  COMPLETE: '9997',
}

// 콘텐츠 기반 규칙
export const contentRulesByStep = {
  1: [
    {
      when: (message) => {
        const t = String(message?.content || '')
        return t.includes('작성한 사전 조사를 토대로') && t.includes('다음 단계로 넘어갈까요')
      },
      buttons: [
        { label: '거절', action: 'step1.gotoStep2.reject' },
        { label: '수락', action: 'step1.gotoStep2.accept' },
      ],
    },
  ],
  2: [],
  3: [
    {
      when: (message) =>
        typeof message?.content === 'string' && message.content.includes('초안이 생성되었습니다'),
      buttons: [{ label: '특약 검토', action: 'step3.openTermsReview' }],
    },
    {
      when: (message) =>
        typeof message?.content === 'string' &&
        message.content.includes('수정이 완료되었습니다!') &&
        message.content.includes('라운드가 시작'),
      buttons: [{ label: '특약 검토', action: 'step3.openTermsReview' }],
    },
    {
      when: (message) =>
        typeof message?.content === 'string' &&
        message.content.includes('임대인이 특약') &&
        message.content.includes('수정을 요청'),
      buttons: [
        { label: '거절', action: 'step3.modification.reject' },
        { label: '수락', action: 'step3.modification.accept' },
      ],
    },
    {
      when: (message) =>
        typeof message?.content === 'string' &&
        message.content.includes('임대인이 특약') &&
        message.content.includes('삭제를 요청'),
      buttons: [
        { label: '거절', action: 'step3.deletion.reject' },
        { label: '수락', action: 'step3.deletion.accept' },
      ],
    },
    {
      when: (message) => {
        const t = String(message?.content || '')
        return t.includes('임대인이 최종 특약')
      },
      buttons: [
        { label: '거절', action: 'step3.finalConfirm.reject' },
        { label: '수락', action: 'step3.finalConfirm.accept' },
      ],
    },
    {
      when: (message) => {
        const t = String(message?.content || '')
        return t.includes('최종 특약서가 생성')
      },
      buttons: [{ label: '특약 수정 과정 확인하기', action: 'step3.openFinalClause' }],
    },
  ],
  4: [
    {
      when: (message) =>
        typeof message?.content === 'string' &&
        message.content.includes('임대인이 특약') &&
        message.content.includes('수정을 요청'),
      buttons: [
        { label: '거절', action: 'step4.modification.reject' },
        { label: '수락', action: 'step4.modification.accept' },
      ],
    },
    {
      when: (message) =>
        typeof message?.content === 'string' &&
        message.content.includes('임대인이 특약') &&
        message.content.includes('삭제를 요청'),
      buttons: [
        { label: '거절', action: 'step4.deletion.reject' },
        { label: '수락', action: 'step4.deletion.accept' },
      ],
    },
    {
      when: (message) =>
        typeof message?.content === 'string' &&
        message.content.includes('임대인이 최종 계약서') &&
        message.content.includes('확인을 요청'),
      buttons: [
        { label: '거절', action: 'step4.final.reject' },
        { label: '수락', action: 'step4.final.accept' },
      ],
    },
  ],
}

// senderId 기반 기본 매핑
export const buttonsByStep = {
  1: {},
  2: {},
  3: {
    [AI_SENDER.PLAIN]: [],
    [AI_SENDER.BUTTON]: [],
  },
  4: {},
}

// meta.action 우선 규칙
export const metaActionButtons = {
  'terms.review': [{ label: '특약 검토', action: 'step3.openTermsReview' }],
  'terms.final': [{ label: '특약 수정 과정 확인하기', action: 'step3.openFinalClause' }],
}

export function getAiButtonsForMessage(step, message) {
  const stepNum = Number(step)
  const sid = String(message?.senderId ?? '')

  if (sid === AI_SENDER.BUTTON) {
    const t = String(message?.content || '')
    if (
      t.includes('기다리는 동안') &&
      t.includes('어려운 법률 용어') &&
      t.includes('법률 팁을 알아볼까요')
    ) {
      return [
        { label: '법률 용어 알아보기', action: 'legal.terms' },
        { label: '법률 팁 알아보기', action: 'legal.tips' },
      ]
    }
  }

  // meta.action 우선
  const metaKey = message?.meta?.action
  if (metaKey && metaActionButtons[metaKey]) return metaActionButtons[metaKey]

  // 콘텐츠 규칙 적용
  const contentRules = contentRulesByStep[stepNum] || []
  for (const rule of contentRules) {
    if (rule.when(message)) return rule.buttons || []
  }

  // senderId 기본 매핑
  const perStep = buttonsByStep[stepNum] || {}
  return perStep[sid] || []
}
