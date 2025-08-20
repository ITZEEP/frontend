<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 모바일 뷰포트 높이 대응 -->
    <div class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8" style="min-height: 100vh; min-height: 100dvh;">
      <div class="w-full max-w-md mx-auto">
        <div class="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <!-- 로고/브랜드 영역 -->
          <div class="text-center mb-8">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">잇집 회원가입</h1>
            <p class="text-sm text-gray-600">안전한 부동산 거래를 시작하세요</p>
          </div>
        
          <div class="space-y-4">
            <!-- 카카오로 시작하기 버튼 -->
            <button
              @click="handleKakaoSignup"
              :disabled="isLoading"
              class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FEE500] hover:bg-[#FDD835] active:bg-[#F9E547] text-[#191919] font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.54 1.74 4.756 4.349 6.039l-.649 2.369c-.065.235.165.442.385.343l2.899-1.312c.635.095 1.307.161 2.016.161 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
              </svg>
              <span class="text-base">카카오로 시작하기</span>
            </button>

            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-gray-500">간편하게 회원가입</span>
              </div>
            </div>

            <!-- 이메일 회원가입 버튼 (추후 구현) -->
            <button
              disabled
              class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 text-gray-400 font-medium rounded-xl cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span class="text-base">이메일로 회원가입 (준비중)</span>
            </button>

            <!-- 안내 메시지 -->
            <div class="text-center text-xs sm:text-sm text-gray-600 space-y-2 pt-4">
              <p>카카오 계정으로 간편하게 가입하세요</p>
              <p class="text-xs">
                가입 시 
                <a href="#" class="text-yellow-primary hover:text-yellow-600 underline">이용약관</a> 및 
                <a href="#" class="text-yellow-primary hover:text-yellow-600 underline">개인정보처리방침</a>에 동의하게 됩니다.
              </p>
            </div>

            <!-- 로그인 링크 -->
            <div class="text-center pt-4 border-t border-gray-100">
              <p class="text-sm text-gray-600 pt-4">
                이미 계정이 있으신가요?
                <router-link to="/auth/signin" class="text-yellow-primary hover:text-yellow-600 font-medium underline">
                  로그인
                </router-link>
              </p>
            </div>
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
                <span class="text-gray-700">회원가입 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const error = ref('')

async function handleKakaoSignup() {
  try {
    isLoading.value = true
    error.value = ''
    
    // 백엔드 OAuth 엔드포인트로 리다이렉트
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const kakaoAuthUrl = `${baseUrl}/oauth2/authorization/kakao`
    
    // 카카오 로그인 페이지로 리다이렉트
    window.location.href = kakaoAuthUrl
  } catch (err) {
    console.error('Kakao signup error:', err)
    error.value = '카카오 회원가입 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
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

/* 카카오 버튼 호버 효과 */
button:hover svg {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>