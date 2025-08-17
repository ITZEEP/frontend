<template>
  <div class="flex gap-2 items-center">
    <!-- 로그인 했을 때-->
    <template v-if="authStore.isLoggedIn">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-warm-600 transition-all duration-300 alarm-toggle-button relative shadow-lg hover:shadow-xl"
            :class="{ shake: isShaking }"
            @click="toggleDropdown"
          >
            <!-- FontAwesome 종 아이콘 -->
            <i class="fas fa-bell text-white text-lg"></i>

            <!-- 빨간 점 배지 -->
            <div
              v-if="hasNewNotifications"
              class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full pulse-dot"
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

    <!-- 새 알림 토스트 (간단 버전) -->
    <div v-if="showNotificationToast" class="notification-toast" :class="{ show: isToastVisible }">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-primary rounded-full flex items-center justify-center">
              <i class="fas fa-bell text-white text-sm"></i>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">
              {{ latestNotification?.title || '새 알림' }}
            </p>
            <p class="mt-1 text-sm text-gray-500">
              {{ latestNotification?.content || '새로운 알림이 도착했습니다.' }}
            </p>
            <p class="mt-1 text-xs text-gray-400">
              {{ getNotificationTypeLabel(latestNotification?.type) }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button @click="closeToast" class="text-gray-400 hover:text-gray-500">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- 간단한 진행 바 -->
      <div class="progress-container">
        <div class="progress-bar" :class="{ active: showProgressBar }"></div>
      </div>
    </div>
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

// 상태 관리
const showDropdown = ref(false)
const hasNewNotifications = ref(false)
const isShaking = ref(false)

// 토스트 알림 관련 상태 (간단하게)
const showNotificationToast = ref(false)
const isToastVisible = ref(false)
const latestNotification = ref(null)
const showProgressBar = ref(false)
let toastTimeout = null

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value

  if (showDropdown.value && hasNewNotifications.value) {
    hasNewNotifications.value = false
    markNotificationsAsRead()
  }
}

const handleNotificationClick = (data) => {
  showDropdown.value = false
  if (data.targetUrl) {
    router.push(data.targetUrl)
  }
}

// 종 흔들기
const shakeNotification = () => {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 600)
}

// 토스트 표시 (간단 버전)
const showToast = () => {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }

  console.log('토스트 표시 시작')

  // 1. 토스트 DOM에 추가
  showNotificationToast.value = true

  // 2. 0.1초 후 슬라이드 인
  setTimeout(() => {
    isToastVisible.value = true
  }, 100)

  // 3. 0.5초 후 프로그레스 바 시작
  setTimeout(() => {
    showProgressBar.value = true
  }, 500)

  // 4. 3.5초 후 닫기 (0.5초 애니메이션 + 3초 표시)
  toastTimeout = setTimeout(() => {
    closeToast()
  }, 3500)
}

// 토스트 닫기 (간단 버전)
const closeToast = () => {
  console.log('토스트 닫기')

  if (toastTimeout) {
    clearTimeout(toastTimeout)
    toastTimeout = null
  }

  // 슬라이드 아웃
  isToastVisible.value = false
  showProgressBar.value = false

  // 0.3초 후 DOM에서 제거
  setTimeout(() => {
    showNotificationToast.value = false
  }, 300)
}

const getNotificationTypeLabel = (type) => {
  const typeLabels = {
    CHAT: '채팅',
    CONTRACT_REQUEST: '계약 요청',
    CONTRACT_ACCEPT: '계약 수락',
    CONTRACT_REJECT: '계약 거절',
    SYSTEM: '시스템',
  }
  return typeLabels[type] || '알림'
}

const updateNotificationBadge = (hasNew) => {
  hasNewNotifications.value = hasNew
  if (hasNew) {
    shakeNotification()
  }
}

const handleNewNotification = (event) => {
  console.log('새 알림 수신:', event.detail)

  hasNewNotifications.value = true

  const { payload } = event.detail
  if (payload && payload.notification) {
    latestNotification.value = {
      title: payload.notification.title,
      content: payload.notification.body,
      type: payload.data?.type || 'SYSTEM',
    }
  } else {
    latestNotification.value = {
      title: '새 알림',
      content: '새로운 알림이 도착했습니다.',
      type: 'SYSTEM',
    }
  }

  showToast()
  shakeNotification()
}

const handleNotificationCountUpdate = (event) => {
  const { unreadCount: newCount } = event.detail
  if (newCount <= 0) {
    hasNewNotifications.value = false
  }
}

const handleNotificationsRead = () => {
  hasNewNotifications.value = false
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    hasNewNotifications.value = getHasNewNotifications()
    setNotificationBadgeCallback(updateNotificationBadge)

    window.addEventListener('new-notification', handleNewNotification)
    window.addEventListener('notification-count-updated', handleNotificationCountUpdate)
    window.addEventListener('notifications-read', handleNotificationsRead)
    window.addEventListener('fcm-message', handleNewNotification)
  }
})

onUnmounted(() => {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }

  window.removeEventListener('new-notification', handleNewNotification)
  window.removeEventListener('notification-count-updated', handleNotificationCountUpdate)
  window.removeEventListener('notifications-read', handleNotificationsRead)
  window.removeEventListener('fcm-message', handleNewNotification)

  setNotificationBadgeCallback(null)
})
</script>

<style scoped>
/* 종 버튼 스타일 */
.alarm-toggle-button {
  background: #60584c;
}

.alarm-toggle-button:hover {
  background: #78716c;
}

/* 간단한 종 흔들기 */
.shake {
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

/* 간단한 펄스 점 */
.pulse-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* 토스트 스타일 (간단하게) */
.notification-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  max-width: 24rem;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.notification-toast.show {
  transform: translateX(0);
  opacity: 1;
}

/* 간단한 진행 바 */
.progress-container {
  height: 4px;
  background: #f3f4f6;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #ffbc00;
  width: 100%;
  transition: width 3s linear;
}

.progress-bar.active {
  width: 0;
}
</style>
