<template>
  <div class="flex gap-2 items-center">
    <!-- 로그인 했을 때-->
    <template v-if="authStore.isLoggedIn">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div
            class="w-8 h-8 rounded-full bg-gray-warm-700 flex items-center justify-center cursor-pointer hover:bg-gray-warm-500 alarm-toggle-button"
            @click="toggleDropdown"
          >
            <AlarmIcon class="w-5 h-5 text-white" />
          </div>

          <AlarmDropdown :is-visible="showDropdown" @close="showDropdown = false" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'
import config from '@/config'
import AlarmIcon from '@/assets/icons/AlarmIcon.vue'
import AlarmDropdown from '@/components/alarm/AlarmDropdown.vue'

const router = useRouter()
const accountMenus = config.accountMenus
const authStore = useAuthStore()

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}
</script>
