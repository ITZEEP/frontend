<template>
  <div class="white-box hover:bg-yellow-50 cursor-pointer p-4 border-b" @click="$emit('click')">
    <div class="flex items-center space-x-3">
      <!-- 상대방 프로필 이미지 -->
      <div class="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
        <img
          v-if="room?.otherUserProfileUrl"
          :src="room.otherUserProfileUrl"
          :alt="room.otherUserNickname || '사용자'"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
        <div
          v-else
          class="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm"
        >
          {{ getInitial(room?.otherUserNickname) }}
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <!-- 상대방 닉네임 -->
        <h3 class="text-base font-semibold text-gray-800 truncate">
          {{ room?.otherUserNickname || '알 수 없는 사용자' }}
        </h3>

        <!-- 마지막 메시지 -->
        <p class="text-sm text-gray-500 truncate">
          {{ lastMessageDisplay }}
        </p>

        <!-- 시간 및 읽지 않은 메시지 수 -->
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs text-gray-400">
            {{ timeDisplay }}
          </span>
          <!-- ✅ 핵심 수정: getDisplayUnreadCount 함수 사용 -->
          <span
            v-if="getDisplayUnreadCount() > 0"
            class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse"
          >
            {{ getDisplayUnreadCount() > 99 ? '99+' : getDisplayUnreadCount() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, inject } from 'vue'

const props = defineProps({
  room: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// 부모 컴포넌트에서 현재 채팅방 ID 주입받기
const currentChatRoomId = inject('currentChatRoomId', { value: null })

watch(
  () => props.room?.lastMessage,
  (newVal, oldVal) => {
    console.log('lastMessage 변경 감지:', { oldVal, newVal })
  },
  { immediate: true },
)

defineEmits(['click'])

// 읽지 않은 수 표시 함수 추가
const getDisplayUnreadCount = () => {
  // 현재 열려있는 채팅방이면 0으로 표시
  if (props.room?.chatRoomId === currentChatRoomId.value) {
    return 0
  }
  return props.room?.unreadMessageCount || 0
}

// 닉네임 첫 글자 가져오기 (프로필 이미지 대체)
function getInitial(nickname) {
  if (!nickname) return '?'
  return nickname.charAt(0).toUpperCase()
}

// 마지막 메시지 표시 (computed로 직접 처리)
const lastMessageDisplay = computed(() => {
  const lastMessage = props.room?.lastMessage

  if (!lastMessage) {
    return '메시지가 없습니다.'
  }

  // 메시지가 객체인 경우 (내용, 타입 등을 포함)
  if (typeof lastMessage === 'object' && lastMessage !== null) {
    // 메시지 타입에 따른 처리
    if (lastMessage.type === 'image' || lastMessage.type === 'IMAGE') {
      return '📷 사진'
    } else if (lastMessage.type === 'file' || lastMessage.type === 'FILE') {
      return '📎 파일'
    } else if (lastMessage.type === 'voice' || lastMessage.type === 'VOICE') {
      return '🎤 음성메시지'
    } else if (lastMessage.type === 'video' || lastMessage.type === 'VIDEO') {
      return '🎥 동영상'
    } else if (lastMessage.type === 'location' || lastMessage.type === 'LOCATION') {
      return '📍 위치'
    } else {
      return lastMessage.content || lastMessage.text || lastMessage.message || '메시지가 없습니다.'
    }
  }

  // 메시지가 문자열인 경우
  const messageText = String(lastMessage).trim()

  // 너무 긴 메시지는 줄임표 처리
  if (messageText.length > 30) {
    return messageText.substring(0, 30) + '...'
  }

  return messageText || '메시지가 없습니다.'
})

// 시간 표시 (computed로 직접 처리)
const timeDisplay = computed(() => {
  const dateString = props.room?.lastMessageAt

  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const now = new Date()

    // 유효하지 않은 날짜 체크
    if (isNaN(date.getTime())) return ''

    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    // 일주일 이상 지난 경우
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.error('시간 포맷팅 오류:', error)
    return ''
  }
})

// 이미지 로드 에러 처리
function onImageError(event) {
  console.warn('프로필 이미지 로드 실패:', props.room?.otherUserProfileUrl)
  // 이미지 로드 실패 시 숨기고 이니셜 표시
  event.target.style.display = 'none'
}
</script>

<style scoped>
.white-box {
  transition: background-color 0.2s ease;
}

/* 호버 효과 개선 */
.white-box:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 읽지 않은 메시지 배지 애니메이션 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
