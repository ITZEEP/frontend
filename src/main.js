import './assets/index.css'
import 'vue-awesome-paginate/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

import App from './App.vue'
import router from './router'
import { useKakao } from 'vue3-kakao-maps/@utils'
import { initializeFCM } from '@/fcm/fcmService'

window.global = window

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
