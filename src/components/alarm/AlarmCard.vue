<template>
  <div
    class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 active:bg-gray-100"
    :class="{
      'bg-blue-50 border-l-4 border-l-blue-500': !notification.isRead,
    }"
    @click="handleClick"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <!-- 알림 제목 -->
        <p class="text-sm font-medium text-gray-800 truncate">
          {{ notification.title }}
        </p>

        <!-- 알림 내용 -->
        <p class="text-sm text-gray-600 mt-1 line-clamp-2">
          {{ notification.content }}
        </p>

        <!-- 알림 메타 정보 -->
        <div class="flex items-center mt-2 text-xs text-gray-500 space-x-2">
          <span>{{ notification.timeAgo || formatTime(notification.createAt) }}</span>

          <!-- 알림 타입 표시 -->
          <span class="px-2 py-1 rounded-full text-xs" :class="getTypeStyle(notification.type)">
            {{ getTypeLabel(notification.type) }}
          </span>

          <!-- 관련 정보 -->
          <span v-if="notification.relatedInfo" class="text-gray-400">
            {{ notification.relatedInfo }}
          </span>
        </div>
      </div>

      <!-- 읽지 않음 표시 및 액션 버튼 -->
      <div class="flex items-center ml-2">
        <!-- 채팅방 이동 아이콘 (채팅 알림인 경우) -->
        <div v-if="notification.type === 'CHAT'" class="mr-2 text-gray-400" title="채팅방으로 이동">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
        </div>

        <!-- 계약 이동 아이콘 (계약 알림인 경우) -->
        <div
          v-else-if="notification.type.includes('CONTRACT')"
          class="mr-2 text-gray-400"
          title="계약으로 이동"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>

        <!-- 읽지 않음 표시 -->
        <div
          v-if="!notification.isRead"
          class="w-2 h-2 bg-blue-500 rounded-full mr-2"
          title="읽지 않음"
        ></div>

        <!-- 읽음 처리 버튼 -->
        <button
          v-if="!notification.isRead"
          @click.stop="markAsRead"
          class="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded hover:bg-gray-200"
          title="읽음 처리"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { computed } from 'vue'

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click', 'mark-read'])

// 알림 클릭 처리
const handleClick = () => {
  emit('click', props.notification)
}

// 읽음 처리
const markAsRead = () => {
  emit('mark-read', props.notification.notiId)
}

// 시간 포맷팅
const formatTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString()
}

// 알림 타입별 라벨
const getTypeLabel = (type) => {
  const typeLabels = {
    CHAT: '채팅',
    CONTRACT_REQUEST: '계약 요청',
    CONTRACT_ACCEPT: '계약 수락',
    CONTRACT_REJECT: '계약 거절',
    SYSTEM: '시스템',
  }
  return typeLabels[type] || '알림'
}

// 알림 타입별 스타일
const getTypeStyle = (type) => {
  const typeStyles = {
    CHAT: 'bg-green-100 text-green-800',
    CONTRACT_REQUEST: 'bg-orange-100 text-orange-800',
    CONTRACT_ACCEPT: 'bg-blue-100 text-blue-800',
    CONTRACT_REJECT: 'bg-red-100 text-red-800',
    SYSTEM: 'bg-gray-100 text-gray-800',
  }
  return typeStyles[type] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
