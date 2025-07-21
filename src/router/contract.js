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
    path: '/pre-contract/:id/:role',
    name: 'PreContract',
    component: () => import('../pages/pre-contract/PreContractPage.vue'),
    props: true,
  },
]
