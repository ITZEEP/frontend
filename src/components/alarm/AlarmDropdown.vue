<template>
  <div
    class="absolute right-0 mt-2 w-80 white-box shadow-lg z-50"
    v-show="isVisible"
    ref="dropdownRef"
  >
    <div class="pb-2 border-b border-gray-200 font-semibold flex justify-between items-center">
      <span>알림</span>
      <div class="flex items-center gap-2">
        <span v-if="unreadCount > 0" class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {{ unreadCount }}개 안 읽음
        </span>
        <button
          v-if="notifications.length > 0"
          @click="markAllAsRead"
          class="text-xs text-gray-500 hover:text-gray-700"
          :disabled="loading"
        >
          모두 읽음
        </button>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="min-h-24 flex items-center justify-center">
      <div class="text-sm text-gray-500">로딩 중...</div>
    </div>

    <!-- 알림 목록 -->
    <div v-else-if="notifications.length" class="min-h-24 max-h-80 overflow-y-auto flex flex-col">
      <AlarmCard
        v-for="notification in notifications"
        :key="notification.notiId"
        :notification="notification"
        @click="handleNotificationClick(notification)"
        @mark-read="markNotificationAsRead"
      />

      <!-- 더 보기 버튼 -->
      <div v-if="hasMore" class="p-3 text-center border-t border-gray-100">
        <button
          @click="loadMore"
          class="text-sm text-blue-600 hover:text-blue-800"
          :disabled="loading"
        >
          더 보기
        </button>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="min-h-24 flex items-center justify-center text-sm text-gray-400">
      새로운 알림이 없습니다.
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="p-3 text-sm text-red-600 bg-red-50 border-t border-red-100">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { onClickOutside } from '@vueuse/core'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import AlarmCard from './AlarmCard.vue'
import { useRouter } from 'vue-router'

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead,
} from '@/apis/chatApi'

const props = defineProps({
  isVisible: Boolean,
})

const emit = defineEmits(['close', 'notification-click'])
const dropdownRef = ref(null)
const router = useRouter()

// 상태 관리
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const error = ref('')
const currentPage = ref(0)
const hasMore = ref(false)

onClickOutside(dropdownRef, (event) => {
  if (event.target.closest('.alarm-toggle-button')) return
  emit('close')
})

// 알림 목록 로드
const loadNotifications = async (page = 0, append = false) => {
  try {
    loading.value = true
    error.value = ''

    const response = await getNotifications(page, 10) // 페이지당 10개씩

    if (response.success) {
      const newNotifications = response.data.notifications || []

      if (append) {
        notifications.value = [...notifications.value, ...newNotifications]
      } else {
        notifications.value = newNotifications
      }

      unreadCount.value = response.data.unreadCount || 0
      hasMore.value = response.data.hasNext || false
      currentPage.value = page
    } else {
      error.value = response.message || '알림을 불러올 수 없습니다.'
    }
  } catch (err) {
    console.error('알림 로드 실패:', err)
    error.value = '알림을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 더 보기
const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  await loadNotifications(currentPage.value + 1, true)
}

// 읽지 않은 알림 개수 로드
const loadUnreadCount = async () => {
  try {
    const response = await getUnreadNotificationCount()
    if (response.success) {
      unreadCount.value = response.data || 0
    }
  } catch (err) {
    console.error('읽지 않은 알림 개수 로드 실패:', err)
  }
}

// 특정 알림 읽음 처리
const markNotificationAsRead = async (notiId) => {
  try {
    const response = await apiMarkAsRead(notiId)
    if (response.success) {
      // 로컬 상태 업데이트
      const notification = notifications.value.find((n) => n.notiId === notiId)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  } catch (err) {
    console.error('알림 읽음 처리 실패:', err)
  }
}

// 모든 알림 읽음 처리
const markAllAsRead = async () => {
  try {
    const response = await markAllNotificationsAsRead()
    if (response.success) {
      // 로컬 상태 업데이트
      notifications.value.forEach((n) => (n.isRead = true))
      unreadCount.value = 0
    }
  } catch (err) {
    console.error('모든 알림 읽음 처리 실패:', err)
  }
}

// 알림 클릭 처리
const handleNotificationClick = async (notification) => {
  try {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      await markNotificationAsRead(notification.notiId)
    }

    // 알림 타입에 따라 페이지 이동
    let targetUrl = null

    if (notification.type === 'CHAT' && notification.relatedId) {
      // 채팅 알림 - 채팅방으로 이동
      targetUrl = `/chat?room=${notification.relatedId}`
    } else if (notification.type.includes('CONTRACT') && notification.relatedId) {
      // 계약 관련 알림 - 계약 페이지로 이동
      targetUrl = `/contract/${notification.relatedId}`
    } else if (notification.type === 'SYSTEM') {
      // 시스템 알림 - 알림 목록 페이지로 이동
      targetUrl = '/notifications'
    }

    console.log(`알림 클릭: ${notification.title} → ${targetUrl}`)

    // 라우터로 페이지 이동
    if (targetUrl) {
      await router.push(targetUrl)
    }

    // 부모 컴포넌트에 클릭 이벤트 전달 (필요한 경우)
    emit('notification-click', {
      notification,
      targetUrl,
    })

    // 드롭다운 닫기
    emit('close')
  } catch (error) {
    console.error('알림 클릭 처리 중 오류:', error)

    // 오류 발생 시 기본 알림 페이지로 이동
    try {
      await router.push('/notifications')
      emit('close')
    } catch (routerError) {
      console.error('라우터 이동 실패:', routerError)
    }
  }
}

// 드롭다운이 열릴 때 알림 로드
watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      loadNotifications(0, false)
      loadUnreadCount()
    }
  },
)

// FCM 알림 수신 시 업데이트
const handleFCMMessage = () => {
  loadUnreadCount()
  // 첫 페이지에 있다면 새 알림 로드
  if (currentPage.value === 0) {
    loadNotifications(0, false)
  }
}

// 알림 개수 업데이트 이벤트 리스너
const handleNotificationCountUpdate = (event) => {
  unreadCount.value = event.detail.unreadCount
}

// 이벤트 리스너 등록
onMounted(() => {
  window.addEventListener('fcm-message', handleFCMMessage)
  window.addEventListener('notification-count-updated', handleNotificationCountUpdate)
})

// 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('fcm-message', handleFCMMessage)
  window.removeEventListener('notification-count-updated', handleNotificationCountUpdate)
})
</script>
