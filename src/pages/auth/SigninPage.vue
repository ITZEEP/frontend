<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 모바일 뷰포트 높이 대응 -->
    <div class="flex-1 flex flex-col justify-between" style="min-height: 100vh; min-height: 100dvh;">
      <!-- 메인 컨텐츠 -->
      <div class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div class="w-full max-w-md mx-auto">
          <div class="bg-white shadow-lg rounded-lg p-6 sm:p-8">
            <!-- 로고/브랜드 영역 -->
            <div class="text-center mb-10">
              <div class="mb-4">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-yellow-50 rounded-full mb-4">
                  <svg class="w-10 h-10 text-yellow-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                </div>
              </div>
              <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">잇집</h1>
              <p class="text-base text-gray-600">안전한 부동산 거래의 시작</p>
            </div>
          
            <div v-if="!authStore.isLoggedIn" class="space-y-4">
              <!-- 카카오 로그인 버튼 -->
              <button
                @click="handleKakaoLogin"
                :disabled="isLoading"
                class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FEE500] hover:bg-[#FDD835] active:bg-[#F9E547] text-[#191919] font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.54 1.74 4.756 4.349 6.039l-.649 2.369c-.065.235.165.442.385.343l2.899-1.312c.635.095 1.307.161 2.016.161 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                </svg>
                <span class="text-base font-semibold">카카오 로그인</span>
              </button>

              <!-- 회원가입 링크 -->
              <div class="text-center pt-4">
                <p class="text-sm text-gray-600">
                  아직 계정이 없으신가요?
                  <router-link to="/auth/signup" class="text-yellow-primary hover:text-yellow-600 font-medium underline">
                    회원가입
                  </router-link>
                </p>
              </div>
            </div>

        <div v-else class="text-center">
          <p class="mb-4">{{ authStore.username }}님, 환영합니다!</p>
          <BaseButton variant="primary" @click="handleLogout" :disabled="authStore.isLoading">
            로그아웃
          </BaseButton>
        </div>

          <!-- 에러 메시지 -->
          <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          
            <!-- 로딩 오버레이 -->
            <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg p-6 shadow-xl">
                <div class="flex items-center gap-3">
                  <svg class="animate-spin h-5 w-5 text-yellow-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-700">로그인 중...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 푸터 -->
      <footer class="py-6 px-4 border-t border-gray-200 bg-white">
        <div class="max-w-md mx-auto text-center">
          <div class="flex flex-wrap justify-center gap-4 mb-4 text-xs text-gray-500">
            <a href="#" class="hover:text-gray-700">이용약관</a>
            <span class="text-gray-300">|</span>
            <a href="#" class="hover:text-gray-700">개인정보처리방침</a>
            <span class="text-gray-300">|</span>
            <a href="#" class="hover:text-gray-700">고객센터</a>
          </div>
          <p class="text-xs text-gray-400">© 2024 잇집. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

async function handleKakaoLogin() {
  try {
    isLoading.value = true
    error.value = ''
    
    // 백엔드 OAuth 엔드포인트로 리다이렉트
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const kakaoAuthUrl = `${baseUrl}/oauth2/authorization/kakao`
    
    // 카카오 로그인 페이지로 리다이렉트
    window.location.href = kakaoAuthUrl
  } catch (err) {
    console.error('Kakao login error:', err)
    error.value = '카카오 로그인 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

async function handleLogout() {
  try {
    await authStore.logout()
    router.push({ name: 'home' })
  } catch (err) {
    console.error('Logout error:', err)
    error.value = '로그아웃 중 오류가 발생했습니다.'
  }
}
</script>

<style scoped>
/* 모바일 안전 영역 대응 */
@supports (padding: max(0px)) {
  .min-h-screen {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
}

/* 모바일 터치 반응 개선 */
@media (max-width: 640px) {
  button {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 모바일에서 버튼 클릭 영역 확대 */
  button {
    min-height: 52px;
  }
}
</style>
