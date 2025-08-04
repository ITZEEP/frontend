export const step3MessageScenario = [
  {
    id: 'msg1',
    type: 'text',
    delay: 0,
    content: '안녕하세요, 계약 내용을 바탕으로 특약을 확인하고 있습니다.',
  },
  {
    id: 'msg2',
    type: 'text',
    delay: 2000,
    content: '지금까지 수집한 정보를 바탕으로 특약 초안을 생성하겠습니다. 잠시만 기다려주세요.',
  },
  {
    id: 'apiTrigger',
    type: 'api',
    delay: 1000,
    apiKey: 'generateSpecialTerms',
    waitForSuccess: true,
  },
  {
    id: 'msg3',
    type: 'button',
    delay: 1000,
    content: '초안이 완성되었습니다. 검토해보시겠어요?',
    buttons: [{ label: '네, 볼게요', action: 'openSpecialTerm' }],
  },
]
