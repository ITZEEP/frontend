<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <LoadingOverlay v-if="isLoading" :show="true" message="로그인 처리 중..." />
      <div v-else-if="error" class="bg-red-50 p-6 rounded-lg">
        <IconError class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-red-800 mb-2">로그인 실패</h2>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <BaseButton variant="primary" @click="goToSignIn">
          다시 시도하기
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/utils/auth'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconError from '@/components/icons/IconError.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // URL에서 authorization code 가져오기
    const code = route.query.code
    const errorParam = route.query.error

    if (errorParam) {
      throw new Error(errorParam === 'no_code' ? '인증 코드를 받지 못했습니다.' : '카카오 로그인이 취소되었습니다.')
    }

    if (!code) {
      throw new Error('인증 코드가 없습니다.')
    }

    // authorization code를 사용해 로그인 완료 처리
    const redirectUri = 'http://localhost:5173/oauth/callback/kakao'
    const response = await authAPI.completeOAuth2Login(code, redirectUri)
    
    if (response.data.success) {
      const loginData = response.data.data
      const accessToken = loginData.access_token
      const user = {
        id: loginData.user_id,
        username: loginData.nickname || loginData.username,
        email: loginData.email,
        name: loginData.nickname || loginData.username,
        profileImage: loginData.profile_image,
        role: loginData.role
      }
      
      // 로그인 처리
      await authStore.loginWithToken(accessToken, user)
      
      // 이전 페이지로 리다이렉트 또는 홈으로 이동
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    } else {
      throw new Error(response.data.message || '로그인 처리에 실패했습니다.')
    }
  } catch (err) {
    console.error('OAuth2 callback error:', err)
    error.value = err.message || '로그인 처리 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
})

const goToSignIn = () => {
  router.push('/auth/signin')
}
</script>