<template>
  <div class="p-8 flex flex-col gap-4">
    <h1 class="text-xl font-bold">로그인 페이지</h1>

    <BaseButton v-if="!authStore.isLoggedIn" variant="primary" class="w-fit" @click="handleLogin">
      로그인하기
    </BaseButton>

    <BaseButton v-else variant="primary" class="w-fit" @click="handleLogout">
      로그아웃하기
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function handleLogin() {
  authStore.login()
}

function handleLogout() {
  authStore.logout()
}
</script>
