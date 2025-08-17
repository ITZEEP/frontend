<template>
  <div class="flex items-center justify-center gap-2">
    <!-- 온라인 상태 표시 -->
    <span class="w-3 h-3 rounded-full transition-colors duration-300" :class="statusColor"></span>

    <!-- 사용자 정보 -->
    <div class="flex gap-1 justify-center items-center">
      <component :is="isAi ? AiIcon : UserIcon" class="w-6 h-6 pt-1 text-gray-700" />

      <span class="text-gray-800 font-medium">
        {{ displayName }}
      </span>
    </div>

    <!-- 상태 텍스트 -->
    <span class="text-sm font-medium transition-colors duration-300" :class="statusTextColor">
      {{ statusText }}
    </span>

    <!-- 타이핑 표시 -->
    <div v-if="isTyping && !isAi" class="flex items-center gap-1 ml-2">
      <span class="text-xs text-blue-500">입력 중</span>
      <div class="flex gap-1">
        <div class="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
        <div
          class="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style="animation-delay: 0.1s"
        ></div>
        <div
          class="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style="animation-delay: 0.2s"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AiIcon from '@/assets/icons/AiIcon.vue'
import UserIcon from '@/assets/icons/UserIcon.vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: '사용자',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  isAi: {
    type: Boolean,
    default: false,
  },
  isTyping: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: String,
    default: null,
  },
})

// 표시할 이름
const displayName = computed(() => {
  if (props.isAi) {
    return 'AI 어시스턴트'
  }
  return `${props.role} (${props.name})`
})

// 상태 색상
const statusColor = computed(() => {
  if (props.isAi) {
    return 'bg-blue-500'
  }
  return props.isOnline ? 'bg-green-500' : 'bg-gray-400'
})

// 상태 텍스트 색상
const statusTextColor = computed(() => {
  if (props.isAi) {
    return 'text-blue-500'
  }
  return props.isOnline ? 'text-green-600' : 'text-gray-500'
})

// 상태 텍스트
const statusText = computed(() => {
  if (props.isAi) {
    return '활성'
  }

  if (props.isOnline) {
    return '온라인'
  }

  if (props.lastSeen) {
    return `마지막 접속: ${formatLastSeen(props.lastSeen)}`
  }

  return '오프라인'
})

// 마지막 접속 시간 포맷팅
const formatLastSeen = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))

  if (diffMinutes < 1) {
    return '방금 전'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60)
    return `${hours}시간 전`
  } else {
    return date.toLocaleDateString('ko-KR')
  }
}
</script>

<style scoped>
/* 상태 표시 애니메이션 */
.w-3.h-3 {
  transition: all 0.3s ease-in-out;
}

.bg-green-500 {
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.bg-blue-500 {
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

/* 타이핑 애니메이션 */
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}
</style>
