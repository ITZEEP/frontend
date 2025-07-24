// 라우트 파라미터 검증 함수
const validateNumericParam = (paramName) => {
  return (to, from, next) => {
    const paramValue = to.params[paramName]
    if (paramValue && (isNaN(Number(paramValue)) || Number(paramValue) <= 0)) {
      next('/risk-check')
    } else {
      next()
    }
  }
}

export default [
  {
    path: '/risk-check',
    component: () => import('@/pages/risk-check/RiskCheckHome.vue'),
  },
  {
    path: '/risk-check/confirm',
    component: () => import('@/pages/risk-check/RiskCheckConfirm.vue'),
  },
  {
    path: '/risk-check/confirm/:id',
    component: () => import('@/pages/risk-check/RiskCheckConfirm.vue'),
    beforeEnter: validateNumericParam('id'),
  },
  {
    path: '/risk-check/result/:analysisId',
    component: () => import('@/pages/risk-check/RiskCheckResult.vue'),
    beforeEnter: (to, from, next) => {
      const { analysisId } = to.params
      // analysisId는 문자열일 수 있으므로 타입만 검증
      if (analysisId && typeof analysisId !== 'string') {
        next('/risk-check')
      } else {
        next()
      }
    },
  },
  {
    path: '/risk-check/insurance',
    component: () => import('@/pages/risk-check/RiskCheckInsurance.vue'),
  },
]
