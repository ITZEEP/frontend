<template>
  <div class="border-t bg-white">
    <!-- 특약 관련 버튼들 -->
    <div
      class="w-full p-2 border-b flex flex-wrap gap-2 md:gap-4 md:flex-nowrap sm:gap-4 sm:flex-nowrap"
    >
      <BaseButton @click="handleExportRequest" :disabled="isProcessing || !canSendMessage">{{
        isProcessing ? '처리 중...' : '요청하기'
      }}</BaseButton>
      <BaseButton @click="handleExportReject" :disabled="isProcessing || !canSendMessage">{{
        isProcessing ? '처리 중...' : '거절'
      }}</BaseButton>

      <BaseButton @click="handleExportMessages" :disabled="isProcessing || !canSendMessage">
        {{ isProcessing ? '내보내는 중...' : '수락 후 AI 수정 요청' }}
      </BaseButton>
    </div>

    <!-- 오프라인 상태 알림 -->
    <div v-if="!canSendMessage" class="w-full p-3 bg-yellow-50 border-b border-yellow-200">
      <div class="flex items-center justify-center gap-2 text-yellow-800">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="text-sm font-medium">
          상대방이 오프라인 상태입니다. 메시지 전송이 제한됩니다.
        </span>
      </div>
    </div>

    <!-- 메시지 입력 영역 -->
    <div class="flex px-4 pt-2 pb-4 gap-2">
      <!-- 메시지 입력창 -->
      <input
        ref="messageInputRef"
        v-model="messageInput"
        @keyup.enter="sendMessage"
        @input="handleTyping"
        @focus="handleFocus"
        @blur="handleBlur"
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        :class="[
          canSendMessage
            ? 'border-gray-300 focus:border-blue-500'
            : 'border-gray-200 bg-gray-100 cursor-not-allowed',
        ]"
        :placeholder="canSendMessage ? '메시지를 입력하세요' : '상대방이 오프라인 상태입니다'"
        :disabled="isSending || !canSendMessage"
      />

      <!-- 전송 버튼 -->
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim() || isSending || !canSendMessage"
        class="px-4 py-2 rounded-lg transition-all duration-200"
        :class="[
          canSendMessage && messageInput.trim() && !isSending
            ? 'bg-yellow-primary text-white hover:bg-yellow-600 hover:shadow-md'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed',
        ]"
      >
        <span v-if="isSending" class="flex items-center gap-2">
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          전송 중...
        </span>
        <span v-else>전송</span>
      </button>
    </div>

    <!-- 오프라인 상태 상세 정보 (개발/디버깅용) -->
    <div v-if="showDebugInfo && !canSendMessage" class="px-4 pb-2">
      <div class="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <div>🔍 디버그 정보:</div>
        <div>• 메시지 전송 가능: {{ canSendMessage ? 'Yes' : 'No' }}</div>
        <div>• 처리 중: {{ isProcessing ? 'Yes' : 'No' }}</div>
        <div>• 전송 중: {{ isSending ? 'Yes' : 'No' }}</div>
        <div>• 입력값 있음: {{ messageInput.trim() ? 'Yes' : 'No' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { requestEndPointExport, rejectEndPointExport } from '@/apis/contractChatApi'

const emit = defineEmits([
  'sendMessage',
  'typing',
  'setStartPoint',
  'exportMessages',
  'exportRequest',
  'exportReject',
])
const props = defineProps({
  chatRoomId: {
    type: [String, Number],
    required: true,
  },
  receiverId: {
    type: [String, Number],
    required: true,
  },
  canSendMessage: {
    type: Boolean,
    default: true,
  },
  showDebugInfo: {
    type: Boolean,
    default: false, // 개발 시에만 true로 설정
  },
})

// 상태 관리
const messageInput = ref('')
const messageInputRef = ref(null)
const isSending = ref(false)
const isProcessing = ref(false)
const typingTimer = ref(null)
const isTypingActive = ref(false)

// canSendMessage 변경 감지
watch(
  () => props.canSendMessage,
  (newValue, oldValue) => {
    console.log('📱 ContractChatInput: canSendMessage 변경:', oldValue, '->', newValue)

    if (!newValue) {
      // 메시지 전송이 불가능해지면 입력창 비우기
      messageInput.value = ''

      // 타이핑 상태 종료
      if (isTypingActive.value) {
        isTypingActive.value = false
        emit('typing', false)
      }

      if (typingTimer.value) {
        clearTimeout(typingTimer.value)
      }
    }
  },
)

const sendMessage = async () => {
  const content = messageInput.value.trim()

  if (!content || isSending.value || !props.canSendMessage) {
    console.warn('메시지 전송 조건 미충족:', {
      hasContent: !!content,
      isSending: isSending.value,
      canSendMessage: props.canSendMessage,
    })
    return
  }

  try {
    isSending.value = true

    // 타이핑 상태 종료
    if (isTypingActive.value) {
      emit('typing', false)
      isTypingActive.value = false
    }

    // 메시지 전송
    emit('sendMessage', content)

    // 입력창 초기화
    messageInput.value = ''

    // 포커스 유지
    if (messageInputRef.value && props.canSendMessage) {
      messageInputRef.value.focus()
    }
  } catch (error) {
    console.error('❌ ContractChatInput: 메시지 전송 실패:', error)
  } finally {
    setTimeout(() => {
      isSending.value = false
    }, 500)
  }
}

// 타이핑 상태 처리
const handleTyping = () => {
  if (!props.canSendMessage) {
    return
  }

  const currentText = messageInput.value.trim()

  // 타이핑 시작
  if (currentText.length > 0 && !isTypingActive.value) {
    isTypingActive.value = true
    emit('typing', true)
  }

  // 기존 타이머 제거
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  // 1.5초 후 타이핑 상태 종료
  typingTimer.value = setTimeout(() => {
    if (isTypingActive.value) {
      isTypingActive.value = false
      emit('typing', false)
    }
  }, 1500)

  // 입력창이 비어있으면 즉시 타이핑 상태 종료
  if (currentText.length === 0 && isTypingActive.value) {
    isTypingActive.value = false
    emit('typing', false)
    if (typingTimer.value) {
      clearTimeout(typingTimer.value)
    }
  }
}

// 입력창 포커스 시
const handleFocus = () => {
  if (!props.canSendMessage && messageInputRef.value) {
    messageInputRef.value.blur()
  }
}

// 입력창 블러 시
const handleBlur = () => {
  if (isTypingActive.value) {
    isTypingActive.value = false
    emit('typing', false)
  }

  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
}

const handleExportRequest = async () => {
  if (isProcessing.value || !props.canSendMessage) {
    console.warn('요청 불가:', {
      isProcessing: isProcessing.value,
      canSendMessage: props.canSendMessage,
    })
    return
  }

  try {
    isProcessing.value = true

    const result = await requestEndPointExport(props.chatRoomId)
    if (result.success) {
      emit('exportRequest') // 부모에 알림
    } else {
      alert('요청 실패: ' + result.message)
    }
  } catch (error) {
    console.error('종료 요청 에러:', error)
    alert('요청 중 에러 발생')
  } finally {
    setTimeout(() => {
      isProcessing.value = false
    }, 1000)
  }
}

// 종료 요청 거절 (거절 버튼)
const handleExportReject = async () => {
  if (isProcessing.value || !props.canSendMessage) {
    console.warn('거절 불가:', {
      isProcessing: isProcessing.value,
      canSendMessage: props.canSendMessage,
    })
    return
  }

  try {
    isProcessing.value = true
    const result = await rejectEndPointExport(props.chatRoomId)
    if (result.success) {
      emit('exportReject') // 부모에 알림
    } else {
      alert('거절 실패: ' + result.message)
    }
  } catch (error) {
    console.error('거절 에러:', error)
    alert('거절 중 에러 발생')
  } finally {
    setTimeout(() => {
      isProcessing.value = false
    }, 1000)
  }
}

// 특약 내보내기
const handleExportMessages = async () => {
  if (isProcessing.value || !props.canSendMessage) {
    console.warn('내보내기 불가:', {
      isProcessing: isProcessing.value,
      canSendMessage: props.canSendMessage,
    })
    return
  }

  try {
    isProcessing.value = true
    emit('exportMessages')
  } catch (error) {
    console.error('ContractChatInput: 내보내기 실패:', error)
  } finally {
    setTimeout(() => {
      isProcessing.value = false
    }, 1000)
  }
}

// 컴포넌트 마운트 시
onMounted(() => {
  // 입력창에 포커스 (온라인 상태일 때만)
  if (messageInputRef.value && props.canSendMessage) {
    messageInputRef.value.focus()
  }
})

// 컴포넌트 언마운트 시
onUnmounted(() => {
  // 타이머 정리
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }

  // 타이핑 상태 종료
  if (isTypingActive.value) {
    emit('typing', false)
  }
})
</script>

<style scoped>
/* 입력창 애니메이션 */
input {
  transition: all 0.2s ease-in-out;
}

input:focus:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

/* 비활성화된 입력창 스타일 */
input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

/* 버튼 호버 효과 */
button {
  transition: all 0.2s ease-in-out;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 비활성화된 버튼 스타일 */
button:disabled {
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 로딩 스피너 애니메이션 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 경고 알림 스타일 */
.bg-yellow-50 {
  background-color: #fffbeb;
}

.border-yellow-200 {
  border-color: #fde68a;
}

.text-yellow-800 {
  color: #92400e;
}

/* 상태별 테두리 색상 */
.border-gray-200 {
  border-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}
</style>
