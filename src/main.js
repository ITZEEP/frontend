import './assets/index.css'
import 'vue-awesome-paginate/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

import App from './App.vue'
import router from './router'
import { useKakao } from 'vue3-kakao-maps/@utils'
import { initializeFCM } from '@/fcm/fcmService'
import '@/utils/notificationTest' // 알림 테스트 도구

window.global = window

const app = createApp(App)
const kakao_map_key = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
useKakao(kakao_map_key, ['services'])

app.use(VueAwesomePaginate)
app.use(createPinia())
app.use(router)

// 전역 라우터 인스턴스 설정 (axios 인터셉터에서 사용)
window.$router = router

app.mount('#app')

setTimeout(async () => {
  try {
    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')

    if (token) {
      console.log('🔔 FCM 초기화 시작...')
      const success = await initializeFCM()

      if (success) {
        console.log('✅ FCM 초기화 성공 - 푸시 알림 준비 완료')
        
        // 디버깅용 테스트 함수를 전역에 노출
        if (import.meta.env.DEV) {
          // @ts-ignore
          window.testNotification = async (type = 'CHAT') => {
            const { triggerTestNotification } = await import('@/fcm/fcmService')
            triggerTestNotification(type)
          }
          
          // @ts-ignore
          window.sendTestNotification = async () => {
            const { sendTestNotification } = await import('@/utils/testNotification')
            return await sendTestNotification()
          }
          
          // @ts-ignore
          window.diagnoseNotifications = async () => {
            const { diagnoseNotificationSystem } = await import('@/utils/testNotification')
            return await diagnoseNotificationSystem()
          }
          
          // @ts-ignore
          window.websocketService = await import('@/apis/websocket').then(m => m.default)
          
          console.log('💡 디버깅 명령어:')
          console.log('  - window.testNotification() : FCM 테스트 알림')
          console.log('  - window.sendTestNotification() : 백엔드 테스트 알림')
          console.log('  - window.diagnoseNotifications() : 알림 시스템 진단')
          console.log('  - window.websocketService : WebSocket 서비스 접근')
        }
      } else {
        console.warn('⚠️ FCM 초기화 실패 - 알림 권한 확인 필요')
      }
    } else {
      console.log('ℹ️ 비로그인 상태 - FCM 초기화 건너뜀')
    }
  } catch (error) {
    console.error('❌ FCM 초기화 중 오류:', error)
  }
}, 2000) // 2초 후 실행 (로그인 완료 대기)
