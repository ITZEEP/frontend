<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-lg rounded-lg p-8">
        <h1 class="text-2xl font-bold text-center mb-8">로그인</h1>
        
        <div v-if="!authStore.isLoggedIn" class="space-y-4">
          <!-- 카카오 로그인 버튼 -->
          <button
            @click="handleKakaoLogin"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.54 1.74 4.756 4.349 6.039l-.649 2.369c-.065.235.165.442.385.343l2.899-1.312c.635.095 1.307.161 2.016.161 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            <span>카카오 로그인</span>
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <!-- 일반 로그인 폼 (나중에 구현 가능) -->
          <div class="text-center text-sm text-gray-600">
            <p>아직 계정이 없으신가요?</p>
            <router-link to="/auth/signup" class="text-blue-600 hover:text-blue-800 font-medium">
              회원가입
            </router-link>
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
      </div>
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
    router.push('/')
  } catch (err) {
    console.error('Logout error:', err)
    error.value = '로그아웃 중 오류가 발생했습니다.'
  }
}
</script>
