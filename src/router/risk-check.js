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
    path: '/risk-check/result',
    component: () => import('@/pages/risk-check/RiskCheckResult.vue'),
  },
  {
    path: '/risk-check/insurance',
    component: () => import('@/pages/risk-check/RiskCheckInsurance.vue'),
  },
]
