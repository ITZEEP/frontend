<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold mb-6">마이페이지</h1>
        
        <!-- 사용자 정보 -->
        <div v-if="authStore.user" class="mb-8">
          <h2 class="text-lg font-semibold mb-4">사용자 정보</h2>
          <div class="space-y-2">
            <p><span class="font-medium">이름:</span> {{ authStore.user.name || authStore.user.username }}</p>
            <p v-if="authStore.user.email"><span class="font-medium">이메일:</span> {{ authStore.user.email }}</p>
            <p><span class="font-medium">사용자 ID:</span> {{ authStore.user.id }}</p>
          </div>
        </div>

        <!-- 로그아웃 버튼 -->
        <div class="border-t pt-6">
          <BaseButton 
            variant="primary" 
            @click="handleLogout" 
            :disabled="isLoading"
            class="w-full sm:w-auto"
          >
            {{ isLoading ? '로그아웃 중...' : '로그아웃' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)

async function handleLogout() {
  try {
    isLoading.value = true
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    alert('로그아웃 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped></style>
