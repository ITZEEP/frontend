import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

// 기능별 라우터 import
import authRoutes from './auth'
import contractRoutes from './contract'
import homesRoutes from './homes'
import riskCheckRoutes from './risk-check'
import chat from './chat'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    ...authRoutes,
    ...contractRoutes,
    ...homesRoutes, // ← /home/create 포함됨
    ...riskCheckRoutes,
    ...chat,
  ],
})

export default router
