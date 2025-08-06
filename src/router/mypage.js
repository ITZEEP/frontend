import MyPageLayout from '../pages/mypage/MyPageLayout.vue'
import MyPageHome from '../pages/mypage/MyPageHome.vue'
import MyPageEdit from '../pages/mypage/MyPageEdit.vue'
import MyPageContracts from '../pages/mypage/MyPageContracts.vue'
import MyPageProperties from '../pages/mypage/MyPageProperties.vue'
import MyPageFraudAnalysis from '../pages/mypage/MyPageFraudAnalysis.vue'

export default [
  {
    path: '/mypage',
    component: MyPageLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'mypage',
        component: MyPageHome,
      },
      {
        path: 'edit',
        name: 'mypage-edit',
        component: MyPageEdit,
      },
      {
        path: 'contracts',
        name: 'mypage-contracts',
        component: MyPageContracts,
      },
      {
        path: 'properties',
        name: 'mypage-properties',
        component: MyPageProperties,
      },
      {
        path: 'fraud-analysis',
        name: 'mypage-fraud-analysis',
        component: MyPageFraudAnalysis,
      },
    ],
  },
]