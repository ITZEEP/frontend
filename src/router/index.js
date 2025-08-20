import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

// 기능별 라우터 import
import authRoutes from './auth'
import contractRoutes from './contract'
import homesRoutes from './homes'
import riskCheckRoutes from './risk-check'
import chat from './chat'
import mypageRoutes from './mypage'

// Test pages
import TestPdfViewer from '../pages/TestPdfViewer.vue'
import TestPdfDebug from '../pages/TestPdfDebug.vue'

// Error pages
import NotFoundPage from '../pages/error/NotFoundPage.vue'
import UnauthorizedPage from '../pages/error/UnauthorizedPage.vue'
import ServerErrorPage from '../pages/error/ServerErrorPage.vue'

// Guards
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/test/pdf-viewer', name: 'test-pdf-viewer', component: TestPdfViewer },
    { path: '/test/pdf-debug', name: 'test-pdf-debug', component: TestPdfDebug },
    ...authRoutes,
    ...contractRoutes,
    ...homesRoutes, // ← /home/create 포함됨
    ...riskCheckRoutes,
    ...chat,
    ...mypageRoutes,
    
    // Error pages
    { path: '/401', name: 'unauthorized', component: UnauthorizedPage },
    { path: '/500', name: 'server-error', component: ServerErrorPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
})

// 전역 네비게이션 가드
router.beforeEach(authGuard)

// 계약서 내보내기 특별 라우트 접근 제어
router.beforeEach(async (to, from, next) => {
  if (to.name === 'ContractExportTest') {
    try {
      // 토큰 확인
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
      if (!token) {
        console.warn('Access denied: No authentication token')
        next('/auth/signin')
        return
      }

      // 계약 참여자 확인 (API 호출)
      const contractChatId = to.params.contractChatId
      if (!contractChatId) {
        console.warn('Access denied: No contract ID provided')
        next('/contract')
        return
      }

      // 임시로 모든 인증된 사용자에게 허용 (실제로는 getUserRole API를 사용)
      console.log(`Contract export access granted for contractChatId: ${contractChatId}`)
      next()
    } catch (error) {
      console.error('Access control error:', error)
      next('/contract')
    }
  } else {
    next()
  }
})

export default router
