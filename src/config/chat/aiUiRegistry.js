export const AI_SENDER = {
  PLAIN: '9999',
  BUTTON: '9998',
  COMPLETE: '9997',
}

// 콘텐츠 기반 규칙
export const contentRulesByStep = {
  1: [],
  2: [],
  3: [
    {
      when: (message) =>
        typeof message?.content === 'string' && message.content.includes('초안이 완성되었습니다'),
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
        return t.includes('임대인이 특약') && t.includes('최종 확정')
      },
      buttons: [
        { label: '거절', action: 'step3.finalConfirm.reject' },
        { label: '수락', action: 'step3.finalConfirm.accept' },
      ],
    },
  ],
  4: [],
}

// senderId 기반 기본 매핑
export const buttonsByStep = {
  1: {},
  2: {},
  3: {
    [AI_SENDER.PLAIN]: [],
    [AI_SENDER.BUTTON]: [{ label: '특약 검토', action: 'step3.openTermsReview' }],
    [AI_SENDER.COMPLETE]: [{ label: '특약 수정 과정 확인하기', action: 'step3.openFinalClause' }],
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
