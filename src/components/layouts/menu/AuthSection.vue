<template>
  <div class="flex gap-2 items-center">
    <!-- 로그인 했을 때-->
    <template v-if="authStore.isLoggedIn">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
        </div>
        <BaseButton @click="router.push('/auth/mypage')" variant="primary" class="rounded-md">
          마이페이지
        </BaseButton>
      </div>
    </template>

    <!-- 로그아웃 했을 때 -->
    <template v-else>
      <BaseButton @click="router.push(accountMenus.signin.url)" class="w-fit" variant="outline">
        {{ accountMenus.signin.title }}
      </BaseButton>
      <BaseButton @click="router.push(accountMenus.signup.url)" class="w-fit" variant="primary">
        {{ accountMenus.signup.title }}
      </BaseButton>
    </template>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'
import config from '@/config'

const router = useRouter()
const accountMenus = config.accountMenus
const authStore = useAuthStore()
</script>
