<template>
  <div class="flex gap-2 items-center">
    <!-- 로그인 했을 때-->
    <template v-if="authStore.isLoggedIn">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div
            class="w-10 h-10 rounded-full bg-gray-warm-700 flex items-center justify-center cursor-pointer hover:bg-gray-warm-600 transition-all duration-300 alarm-toggle-button relative shadow-lg hover:shadow-xl"
            :class="{ 'animate-shake': isShaking }"
            @click="toggleDropdown"
          >
            <!-- FontAwesome 종 아이콘 -->
            <i class="fas fa-bell text-white text-lg"></i>

            <!-- 빨간 점 배지 -->
            <div
              v-if="hasNewNotifications"
              class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm"
              title="새 알림이 있습니다"
            ></div>
          </div>

          <AlarmDropdown
            :is-visible="showDropdown"
            @close="showDropdown = false"
            @notification-click="handleNotificationClick"
          />
        </div>
        <BaseButton @click="router.push('/mypage')" variant="primary" class="rounded-md">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'
import config from '@/config'

import AlarmDropdown from '@/components/alarm/AlarmDropdown.vue'
import {
  getHasNewNotifications,
  setNotificationBadgeCallback,
  markNotificationsAsRead,
} from '@/fcm/fcmService'

const router = useRouter()
const accountMenus = config.accountMenus
const authStore = useAuthStore()

const showDropdown = ref(false)
const hasNewNotifications = ref(false)
const isShaking = ref(false)

const toggleDropdown = async () => {
  console.log('알림 드롭다운 토글')
  showDropdown.value = !showDropdown.value

  if (showDropdown.value && hasNewNotifications.value) {
    hasNewNotifications.value = false
    markNotificationsAsRead()

    console.log('드롭다운 열림 - 빨간 점 제거')
  }
}

const handleNotificationClick = (data) => {
  console.log('알림 클릭:', data)
  showDropdown.value = false

  if (data.targetUrl) {
    router.push(data.targetUrl)
  }
}

const shakeNotification = () => {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 1000)
}

const updateNotificationBadge = (hasNew) => {
  hasNewNotifications.value = hasNew

  console.log('AuthSection 배지 상태 업데이트:', hasNew)

  if (hasNew) {
    shakeNotification()
  }
}

const handleNewNotification = (event) => {
  console.log('AuthSection에서 새 알림 이벤트 수신:', event.detail)

  hasNewNotifications.value = true

  shakeNotification()
}

const handleNotificationCountUpdate = (event) => {
  const { unreadCount: newCount } = event.detail
  console.log('AuthSection에서 알림 개수 업데이트:', newCount)

  if (newCount <= 0) {
    hasNewNotifications.value = false
  }
}

const handleNotificationsRead = () => {
  console.log('AuthSection에서 알림 읽음 처리')
  hasNewNotifications.value = false
}

onMounted(async () => {
  if (authStore.isLoggedIn) {
    console.log('AuthSection 알림 기능 활성화')

    hasNewNotifications.value = getHasNewNotifications()

    console.log('AuthSection 초기 상태:', {
      hasNew: hasNewNotifications.value,
    })

    setNotificationBadgeCallback(updateNotificationBadge)

    window.addEventListener('new-notification', handleNewNotification)
    window.addEventListener('notification-count-updated', handleNotificationCountUpdate)
    window.addEventListener('notifications-read', handleNotificationsRead)
    window.addEventListener('fcm-message', handleNewNotification)
  }
})

onUnmounted(() => {
  console.log('AuthSection 언마운트됨')

  window.removeEventListener('new-notification', handleNewNotification)
  window.removeEventListener('notification-count-updated', handleNotificationCountUpdate)
  window.removeEventListener('notifications-read', handleNotificationsRead)
  window.removeEventListener('fcm-message', handleNewNotification)

  setNotificationBadgeCallback(null)
})
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: rotate(-8deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: rotate(8deg);
  }
}

.animate-shake {
  animation: shake 0.6s ease-in-out both;
}

.alarm-toggle-button:hover i {
  transform: scale(1.1);
  transition: transform 0.2s ease-in-out;
}

.alarm-toggle-button:hover .animate-pulse {
  animation-duration: 1s;
}

.alarm-toggle-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.alarm-toggle-button {
  background: #60584c;
}

.alarm-toggle-button:hover {
  background: #78716c;
}

.animate-pulse {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
</style>
