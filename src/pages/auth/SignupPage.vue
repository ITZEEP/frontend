<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-lg rounded-lg p-8">
        <h1 class="text-2xl font-bold text-center mb-8">회원가입</h1>
        
        <div class="space-y-4">
          <!-- 카카오로 시작하기 버튼 -->
          <button
            @click="handleKakaoSignup"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.54 1.74 4.756 4.349 6.039l-.649 2.369c-.065.235.165.442.385.343l2.899-1.312c.635.095 1.307.161 2.016.161 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            <span>카카오로 시작하기</span>
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">간편하게 회원가입</span>
            </div>
          </div>

          <!-- 안내 메시지 -->
          <div class="text-center text-sm text-gray-600 space-y-2">
            <p>카카오 계정으로 간편하게 가입하세요</p>
            <p class="text-xs">
              가입 시 
              <a href="#" class="text-blue-600 hover:underline">이용약관</a> 및 
              <a href="#" class="text-blue-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.
            </p>
          </div>

          <div class="text-center text-sm text-gray-600 mt-6">
            <p>이미 계정이 있으신가요?</p>
            <router-link to="/auth/signin" class="text-blue-600 hover:text-blue-800 font-medium">
              로그인
            </router-link>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')

async function handleKakaoSignup() {
  try {
    isLoading.value = true
    error.value = ''
    
    // 카카오 로그인 URL 직접 생성 (회원가입도 동일한 플로우)
    // 백엔드 OAuth 엔드포인트로 리다이렉트
    const kakaoAuthUrl = 'http://localhost:8080/oauth2/authorization/kakao'
    
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
/* 카카오 버튼 호버 효과 */
button:hover svg {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>