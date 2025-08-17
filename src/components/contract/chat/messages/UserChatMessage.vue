<template>
  <div
    :class="isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'"
    class="mb-3 animate-fade-in"
  >
    <!-- 메시지 버블 -->
    <div
      class="flex flex-col gap-1 p-3 rounded-xl w-fit max-w-xs lg:max-w-md relative group transition-all duration-200 hover:shadow-md"
      :class="messageStyle"
    >
      <!-- 사용자 정보 -->
      <div class="flex gap-1 items-center">
        <UserIcon
          class="shrink-0"
          :class="isMine ? 'text-white' : 'text-gray-700'"
          width="20px"
          height="20px"
        />
        <p class="text-sm font-medium" :class="isMine ? 'text-white' : 'text-gray-800'">
          {{ name }}
        </p>

        <!-- 읽음 표시 (내 메시지일 때) -->
        <div v-if="isMine && isRead" class="ml-1">
          <svg class="w-4 h-4 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            />
          </svg>
        </div>
      </div>

      <!-- 메시지 내용 -->
      <div class="relative">
        <p
          class="text-sm whitespace-pre-line break-words"
          :class="isMine ? 'text-white' : 'text-gray-700'"
        >
          {{ message }}
        </p>

        <!-- 메시지 길이 표시 (선택사항) -->
        <div v-if="showCharCount && message.length > 100" class="mt-1">
          <span class="text-xs opacity-60" :class="isMine ? 'text-white' : 'text-gray-500'">
            {{ message.length }}자
          </span>
        </div>
      </div>

      <!-- 메시지 액션 버튼들 (호버 시 표시) -->
      <div
        v-if="showActions"
        class="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1"
      >
        <button
          @click="copyMessage"
          class="bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors"
          title="메시지 복사"
        >
          <svg class="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path
              d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
            />
          </svg>
        </button>

        <button
          v-if="!isMine"
          @click="replyToMessage"
          class="bg-white shadow-md rounded-full p-1 hover:bg-gray-50 transition-colors"
          title="답장"
        >
          <svg class="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 시간 및 상태 -->
    <div class="flex items-center gap-2 mt-1">
      <p class="text-xs text-gray-400" :class="isMine ? 'text-right' : ''">
        {{ time }}
      </p>

      <!-- 전송 상태 (내 메시지일 때) -->
      <div v-if="isMine" class="flex items-center gap-1">
        <div v-if="sendStatus === 'sending'" class="flex gap-1">
          <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            class="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          ></div>
          <div
            class="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
        </div>

        <span v-else-if="sendStatus === 'failed'" class="text-xs text-red-500"> 전송 실패 </span>

        <span v-else-if="sendStatus === 'sent'" class="text-xs text-gray-400"> 전송됨 </span>
      </div>
    </div>

    <!-- 메시지 복사 성공 알림 -->
    <div
      v-if="showCopySuccess"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in"
    >
      메시지가 복사되었습니다
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import UserIcon from '@/assets/icons/UserIcon.vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  userId: {
    type: [String, Number],
    required: true,
  },
  myUserId: {
    type: [String, Number],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  sendStatus: {
    type: String,
    default: 'sent', // 'sending', 'sent', 'failed'
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showCharCount: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reply', 'copy'])

// 상태 관리
const showCopySuccess = ref(false)

// 내 메시지인지 확인 (타입 안전한 비교)
const isMine = computed(() => {
  return String(props.userId) === String(props.myUserId)
})

// 메시지 스타일
const messageStyle = computed(() => {
  if (isMine.value) {
    return 'bg-yellow-primary text-white ml-auto'
  } else {
    return 'bg-gray-100 text-gray-700 mr-auto'
  }
})

// 메시지 복사
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message)
    emit('copy', props.message)

    // 복사 성공 알림 표시
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('메시지 복사 실패:', error)
    // 폴백: 텍스트 선택
    fallbackCopyToClipboard(props.message)
  }
}

// 클립보드 API가 지원되지 않을 때의 폴백 함수
const fallbackCopyToClipboard = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('폴백 복사도 실패:', error)
  }

  document.body.removeChild(textArea)
}

// 답장하기
const replyToMessage = () => {
  emit('reply', {
    originalMessage: props.message,
    originalSender: props.name,
    originalUserId: props.userId,
  })
}
</script>

<style scoped>
/* 메시지 등장 애니메이션 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* 바운스 애니메이션 */
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

/* 메시지 버블 호버 효과 */
.group:hover {
  transform: translateY(-1px);
}

/* 긴 텍스트 줄바꿈 처리 */
.break-words {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* 말풍선 꼬리 효과 (선택사항) */
.group::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

/* 내 메시지 꼬리 (오른쪽) */
.ml-auto.group::before {
  bottom: 8px;
  right: -8px;
  border-width: 8px 0 0 8px;
  border-color: transparent transparent transparent rgb(251, 191, 36);
}

/* 상대방 메시지 꼬리 (왼쪽) */
.mr-auto.group::before {
  bottom: 8px;
  left: -8px;
  border-width: 8px 8px 0 0;
  border-color: transparent rgb(243, 244, 246) transparent transparent;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .max-w-xs {
    max-width: 16rem;
  }

  .lg\:max-w-md {
    max-width: 16rem;
  }
}
</style>
