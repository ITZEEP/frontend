// 위험도 레벨 상수
export const RISK_LEVELS = {
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
}

// 위험도별 색상 매핑
export const RISK_COLORS = {
  background: {
    [RISK_LEVELS.SAFE]: 'bg-green-50',
    [RISK_LEVELS.WARNING]: 'bg-yellow-50',
    [RISK_LEVELS.DANGER]: 'bg-red-50',
  },
  text: {
    [RISK_LEVELS.SAFE]: 'text-green-500',
    [RISK_LEVELS.WARNING]: 'text-yellow-500',
    [RISK_LEVELS.DANGER]: 'text-red-500',
  },
}

// 위험도별 텍스트 (i18n 준비)
export const RISK_LABELS = {
  [RISK_LEVELS.SAFE]: '안전',
  [RISK_LEVELS.WARNING]: '주의',
  [RISK_LEVELS.DANGER]: '위험',
}

export const RISK_MESSAGES = {
  [RISK_LEVELS.SAFE]: '이 매물은 현재 안전한 상태입니다',
  [RISK_LEVELS.WARNING]: '이 매물은 주의가 필요한 상태입니다',
  [RISK_LEVELS.DANGER]: '이 매물은 위험한 상태입니다',
}

export const RISK_DESCRIPTIONS = {
  [RISK_LEVELS.SAFE]: '안전한 것으로 판단됩니다.',
  [RISK_LEVELS.WARNING]: '일부 주의사항이 있는 것으로 판단됩니다.',
  [RISK_LEVELS.DANGER]: '위험 요소가 있는 것으로 판단됩니다.',
}