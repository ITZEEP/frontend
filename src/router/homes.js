export default [
  {
    path: '/homes',
    name: 'homes/list',
    component: () => import('../pages/homes/HomeListPage.vue'),
  },
  {
    path: '/homes/:no',
    name: 'homes/detail',
    component: () => import('../pages/homes/HomeDetailsPage.vue'),
  },
  {
    path: '/homes/create',
    name: 'homes/create',
    component: () => import('../pages/homes/HomeCreatePage.vue'),
  },
  {
    path: '/homes/create/:homeId/verification',
    name: 'homes/create/verification',
    component: () => import('../pages/homes/HomeUserVerification.vue'),
  },
  {
    path: '/homes/update/:no',
    name: 'homes/update',
    component: () => import('../pages/homes/HomeUpdatePage.vue'),
  },
]
