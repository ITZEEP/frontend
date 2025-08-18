export default [
  {
    path: '/contract',
    name: 'ContractGate',
    component: () => import('../pages/contract/ContractGatePage.vue'),
  },
  {
    path: '/contract/:id',
    name: 'Contract',
    component: () => import('../pages/contract/ContractPage.vue'),
  },
  {
    path: '/contract/:id/complete',
    name: 'ContractComplete',
    component: () => import('../pages/contract/ContractCompletePage.vue'),
  },
  {
    path: '/contract/test',
    name: 'ContractTest',
    component: () => import('../pages/contract/TestContractExport.vue'),
  },
  {
    path: '/contract/complete/:contractChatId',
    name: 'ContractCompleteById',
    component: () => import('../pages/contract/ContractCompletePage.vue'),
  },
  {
    path: '/contract/export/:contractChatId',
    name: 'ContractExportTest',
    component: () => import('../pages/contract/ContractCompletePage.vue'),
    meta: { requiresAuth: true, allowedRoles: ['owner', 'tenant', 'buyer'] }
  },
  {
    path: '/pre-contract/:id/:role',
    name: 'PreContract',
    component: () => import('../pages/pre-contract/PreContractPage.vue'),
    props: true,
  },
]
