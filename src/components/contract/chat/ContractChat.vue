<!-- src/components/contract/ContractChat.vue -->
<template>
  <div class="h-full flex flex-col">
    <!-- 상단 헤더 -->
    <div class="px-4 py-3 border-b-2 bg-white">
      <p class="font-bold text-lg">실시간 협의</p>
      <div class="text-sm text-gray-600">
        계약 채팅방 ID: {{ actualContractChatId || 'Loading...' }}
      </div>
      <div class="text-xs text-gray-500">
        Props ID: {{ props.contractChatId }} | URL ID: {{ urlContractChatId }}
      </div>
    </div>

    <!-- 채팅 메시지 영역 -->
    <div class="flex-1 p-4 bg-gray-50 max-h-[420px] overflow-y-auto" ref="messagesContainer">
      <!-- 로딩 상태 -->
      <div v-if="loadingMessages" class="text-center text-gray-500">메시지 로딩 중...</div>

      <!-- 에러 상태 -->
      <div v-else-if="messagesError" class="text-center text-red-500 py-4">
        <div class="mb-2">{{ messagesError }}</div>
        <div class="text-xs text-gray-500">
          Contract ID: {{ actualContractChatId }}<br />
          API URL: {{ `/api/chat/contract/messages/${actualContractChatId}` }}
        </div>
        <button
          @click="loadMessages"
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>

      <div v-else>
        <!-- API에서 로드된 기존 메시지들 -->
        <template v-for="message in apiMessages" :key="'api-' + message.id">
          <template v-if="isAi(message)">
            <AiChatMessage
              :message="message.content"
              :buttons="aiButtons(message)"
              :sentAt="message.sendTime"
              @action="handleAiAction"
            />
          </template>

          <!-- 사용자/상대방 메시지 -->
          <template v-else>
            <UserChatMessage
              :name="getMessageSenderName(message)"
              :message="message.content"
              :time="formatMessageTime(message.sendTime)"
              :userId="message.senderId"
              :myUserId="currentUserId"
              :isRead="message.isRead"
              :sendStatus="'sent'"
              @reply="handleReply"
              @copy="handleCopy"
            />
          </template>
        </template>

        <!-- 실시간 메시지들 (useContractChat 훅에서 가져옴) -->
        <template
          v-for="(message, index) in hookMessages"
          :key="'hook-' + (message.id || message.sendTime || index)"
        >
          <!-- ✅ AI 메시지는 규칙 기반 버튼으로 처리 -->
          <template v-if="isAi(message)">
            <AiChatMessage
              :message="message.content"
              :buttons="aiButtons(message)"
              @action="handleAiAction"
            />
          </template>

          <!-- 사용자/상대방 메시지 -->
          <template v-else>
            <UserChatMessage
              :name="getMessageSenderName(message)"
              :message="message.content"
              :time="formatMessageTime(message.sendTime)"
              :userId="message.senderId"
              :myUserId="currentUserId"
              :isRead="message.isRead"
              :sendStatus="getMessageStatus(message)"
              @reply="handleReply"
              @copy="handleCopy"
            />
          </template>
        </template>

        <!-- 타이핑 상태 표시 -->
        <div v-if="isTyping" class="mb-4">
          <div class="inline-block bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
            <span class="typing-indicator">상대방이 입력 중...</span>
          </div>
        </div>

        <!-- 메시지가 없을 때 -->
        <div
          v-if="!apiMessages.length && !hookMessages.length && !loadingMessages"
          class="text-center text-gray-400 py-8"
        >
          아직 메시지가 없습니다. 첫 메시지를 보내보세요!
        </div>
      </div>

      <!-- 스텝 별 시나리오 메시지 -->
      <StepContainer />
    </div>

    <!-- 입력창 -->
    <ContractChatInput
      v-if="isInputReady"
      :chatRoomId="actualContractChatId"
      :receiverId="contractReceiverId"
      @sendMessage="sendMessage"
      @typing="handleTyping"
      @setStartPoint="handleSetStartPoint"
      @exportMessages="handleExportMessages"
    />

    <!-- 입력창 비활성화 상태 -->
    <div v-else class="border-t bg-gray-50 p-4 text-center text-gray-500">
      <div class="mb-2">{{ getLoadingMessage() }}</div>
      <div class="text-xs mt-2 text-gray-400 space-y-1">
        <div>✅ 사용자 ID: {{ currentUserId || 'Loading...' }}</div>
        <div>✅ 계약 ID: {{ actualContractChatId || 'Loading...' }}</div>
        <div :class="contractReceiverId ? 'text-green-600' : 'text-red-500'">
          {{ contractReceiverId ? '✅' : '❌' }} 상대방 ID: {{ contractReceiverId || 'Loading...' }}
        </div>
        <div :class="hookIsReady ? 'text-green-600' : 'text-orange-500'">
          {{ hookIsReady ? '✅' : '🔄' }} 훅 준비상태: {{ hookIsReady ? '준비됨' : '준비중' }}
        </div>
        <div :class="isInputReady ? 'text-green-600' : 'text-red-500'">
          {{ isInputReady ? '✅' : '❌' }} 입력 준비: {{ isInputReady ? '완료' : '대기중' }}
        </div>
      </div>

      <!-- 디버깅용 강제 설정 버튼 -->
      <button
        v-if="!contractReceiverId && currentUserId && actualContractChatId"
        @click="loadContractInfo"
        class="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
      >
        계약 정보 다시 로드
      </button>
    </div>

    <LoadingOverlay
      :loading="isLoadingOverlayVisible"
      message="AI가 특약 수정 중..."
      sub-message="잠시만 기다려주세요"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getContractMessages,
  setStartPoint,
  setEndPointAndExport,
  getContractInfo,
} from '@/apis/contractChatApi'
import { getCurrentUser } from '@/apis/chatApi'
import { useContractChat } from '@/hooks/chat/useContractChat'
import ContractChatInput from './ContractChatInput.vue'
import UserChatMessage from './messages/UserChatMessage.vue'
import StepContainer from './StepContainer.vue'
import { useSpecialContractStore } from '@/stores/useContractTermStore'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import AiChatMessage from './messages/AiChatMessage.vue'
import TermsReviewModal from '@/components/contract/modals/step3/TermsReviewModal.vue'
import { useModalStore } from '@/stores/modal'
import FinalClauseSelectModal from '@/components/contract/modals/step3/FinalClauseSelectModal.vue'

/* ✅ 추가: 규칙 기반 버튼/액션 연결 */
import { getAiButtonsForMessage, AI_SENDER } from '@/config/chat/aiUiRegistry'
import { createActionDispatchers } from '@/config/chat/aiActionHandlers'

const modalStore = useModalStore()

const route = useRoute()
const store = useSpecialContractStore()
const isLoadingOverlayVisible = ref(false)

const props = defineProps({
  contractChatId: {
    type: [String, Number],
    required: false,
  },
  // 필요 시 외부에서 단계 주입 가능. 없으면 3으로 사용 (기존 로직 영향 X)
  currentStep: {
    type: [Number, String],
    required: false,
    default: 3,
  },
})

// URL에서 contractChatId 추출
const urlContractChatId = computed(() => {
  return route.params.contractChatId || route.params.id || null
})

// 실제 사용할 contractChatId 결정
const actualContractChatId = computed(() => {
  if (props.contractChatId) return String(props.contractChatId)
  if (urlContractChatId.value) return String(urlContractChatId.value)
  const pathParts = window.location.pathname.split('/')
  const contractIndex = pathParts.findIndex((part) => part === 'contract')
  if (contractIndex !== -1 && pathParts[contractIndex + 1])
    return String(pathParts[contractIndex + 1])
  return null
})

// 상태 관리
const apiMessages = ref([])
const loadingMessages = ref(false)
const messagesError = ref(null)
const currentUserId = ref('')
const messagesContainer = ref(null)
const showExportModal = ref(false)
const exportedMessages = ref([])
const userLoaded = ref(false)
const contractData = ref({})

// 계약 상대방 ID
const contractReceiverId = computed(() => {
  if (!contractData.value || !currentUserId.value) return null
  const { ownerId, buyerId } = contractData.value
  const currentId = String(currentUserId.value)
  if (currentId === String(ownerId)) return String(buyerId)
  if (currentId === String(buyerId)) return String(ownerId)
  return null
})

// useContractChat 훅 사용
const {
  messages: hookMessages,
  isReady: hookIsReady,
  sendContractMessage,
  isTyping,
} = useContractChat(actualContractChatId, currentUserId, contractData)

// 입력창 준비 상태
const isInputReady = computed(() => {
  return (
    currentUserId.value &&
    actualContractChatId.value &&
    contractReceiverId.value &&
    hookIsReady.value
  )
})

// 로딩 메시지
const getLoadingMessage = () => {
  if (!actualContractChatId.value) return '계약 채팅방 ID를 찾는 중...'
  if (!currentUserId.value) return '사용자 정보 로딩 중...'
  if (!contractReceiverId.value) return '계약 상대방 정보 로딩 중...'
  if (!hookIsReady.value) return '계약 채팅방 연결 중...'
  return '로딩 중...'
}

// 상수: 문자열 통일
const AI_SENDER_ID = AI_SENDER.PLAIN // '9999'
const AI_SENDER_BUTTON = AI_SENDER.BUTTON // '9998'
const AI_SENDER_COMPLETE = AI_SENDER.COMPLETE // '9997'

// 헬퍼
const isAi = (message) =>
  [AI_SENDER_ID, AI_SENDER_BUTTON, AI_SENDER_COMPLETE].includes(String(message?.senderId))

const getMessageSenderName = (message) => {
  if (String(message.senderId) === String(currentUserId.value)) return '나'
  const { ownerId, buyerId } = contractData.value || {}
  if (String(message.senderId) === String(ownerId)) return '소유자'
  if (String(message.senderId) === String(buyerId)) return '구매자'
  return '사용자'
}

const getMessageStatus = (message) => {
  if (String(message.senderId) !== String(currentUserId.value)) return 'sent'
  if (message.id && message.sendTime) return 'sent'
  return 'sending'
}

// 답장/복사
const handleReply = (replyData) => console.log('답장:', replyData)
const handleCopy = (message) => console.log('메시지 복사됨:', message)

// 사용자 정보 로드
const loadUserInfo = async () => {
  try {
    const userInfo = await getCurrentUser()
    if (userInfo.success && userInfo.data.userId) {
      currentUserId.value = String(userInfo.data.userId)
      userLoaded.value = true
    } else {
      console.error('사용자 정보 조회 실패:', userInfo)
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
  }
}

// 계약 정보 로드
const loadContractInfo = async () => {
  if (!actualContractChatId.value) {
    console.warn('계약 정보 로드 건너뜀: contractChatId가 없음')
    return
  }
  try {
    const response = await getContractInfo(actualContractChatId.value)
    if (response.success && response.data) {
      contractData.value = response.data
    } else {
      console.error('계약 정보 API 호출 실패:', response.message)
    }
  } catch (error) {
    console.error('계약 정보 로드 실패:', error)
  }
}

// 메시지 로드
const loadMessages = async () => {
  if (!actualContractChatId.value) {
    console.warn('메시지 로드 건너뜀: contractChatId가 없음')
    return
  }
  try {
    loadingMessages.value = true
    messagesError.value = null
    const response = await getContractMessages(actualContractChatId.value)
    if (response && response.success) {
      apiMessages.value = response.data || []
      if (apiMessages.value.length === 0) {
        console.log('메시지가 없습니다. 첫 메시지를 보내보세요!')
      }
    } else {
      const errorMsg = response?.message || '메시지 로드에 실패했습니다.'
      messagesError.value = errorMsg
      console.error('메시지 로드 실패:', response)
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        messagesError.value = '계약 채팅방을 찾을 수 없습니다. 계약이 생성되지 않았을 수 있습니다.'
      }
    }
    await nextTick()
    forceScrollToBottom()
  } catch (error) {
    console.error('메시지 로드 실패:', error)
    if (error.message?.includes?.('404')) {
      messagesError.value = '계약 채팅방이 존재하지 않습니다. 먼저 계약을 생성해주세요.'
    } else if (error.message?.includes?.('403')) {
      messagesError.value = '계약 채팅방에 접근할 권한이 없습니다.'
    } else {
      messagesError.value = '메시지를 불러올 수 없습니다: ' + (error.message || '알 수 없는 오류')
    }
  } finally {
    loadingMessages.value = false
  }
}

// 스크롤
const forceScrollToBottom = () => {
  if (!messagesContainer.value) return
  const container = messagesContainer.value
  container.scrollTop = container.scrollHeight
  nextTick(() => {
    container.scrollTop = container.scrollHeight
  })
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight
  })
}

// 메시지 전송
const sendMessage = async (content) => {
  if (!isInputReady.value) {
    console.warn('메시지 전송 불가: 입력 준비되지 않음')
    return
  }
  try {
    const success = sendContractMessage(content, 'TEXT')
    if (success) {
      const newMessage = {
        id: Date.now(),
        senderId: currentUserId.value,
        receiverId: contractReceiverId.value,
        content,
        sendTime: new Date().toISOString(),
        type: 'TEXT',
        isRead: false,
      }
      hookMessages.value.push(newMessage)
      nextTick(() => {
        forceScrollToBottom()
      })
    } else {
      console.error('메시지 전송 실패')
    }
  } catch (error) {
    console.error('계약 메시지 전송 중 오류:', error)
  }
}

// 타이핑 처리
const handleTyping = (isTypingValue) => {
  console.log('타이핑 상태:', isTypingValue)
}

// 시간 포맷
const formatMessageTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// 특약 시작점 설정
const handleSetStartPoint = async () => {
  try {
    const response = await setStartPoint(actualContractChatId.value)
    if (response.success) {
      alert('특약 시작점이 설정되었습니다.')
    } else {
      alert('시작점 설정에 실패했습니다: ' + response.message)
    }
  } catch (error) {
    console.error('시작점 설정 실패:', error)
    alert('시작점 설정에 실패했습니다.')
  }
}

// 특약 내보내기
const handleExportMessages = async () => {
  try {
    isLoadingOverlayVisible.value = true
    const order = store.currentOrder
    const response = await setEndPointAndExport(actualContractChatId.value, order)
    if (response.success) {
      exportedMessages.value = response.data
      showExportModal.value = true
      console.log('[ContractChat] export 전 currentOrder:', store.currentOrder)
      store.markOrderSuccess(store.currentOrder)
      await store.moveToNextOrder(actualContractChatId.value)
    } else {
      alert('특약 내보내기에 실패했습니다: ' + response.message)
    }
  } catch (error) {
    console.error('특약 내보내기 실패:', error)
    alert('특약 내보내기에 실패했습니다.')
  } finally {
    isLoadingOverlayVisible.value = false
  }
}

/* ✅ 규칙 기반 버튼 계산 */
const currentStepValue = computed(() => Number(props.currentStep) || 3)
const aiButtons = (message) => getAiButtonsForMessage(currentStepValue.value, message)

/* ✅ 액션 디스패처: 현재처럼 모달 열기 함수는 그대로 사용 */
const openTermsReview = () => {
  modalStore.open(TermsReviewModal, { onClose: () => modalStore.close() })
}
const openFinalClause = () => {
  modalStore.open(FinalClauseSelectModal, { onClose: () => modalStore.close() })
}

// 필요 시 추가 액션(내보내기 결과/서명 등)을 여기서 더 정의 가능
const openExportResult = () => {
  console.log('[ContractChat] openExportResult')
}

const dispatchAction = createActionDispatchers({
  step3: { openTermsReview, openFinalClause, openExportResult },
})

const handleAiAction = (payload) => {
  const action = typeof payload === 'string' ? payload : payload?.action
  if (!action) {
    console.warn('[ContractChat] 빈 액션 payload:', payload)
    return
  }
  dispatchAction(action)
}

// Watch들 (기존 로직 그대로)
watch(
  hookMessages,
  (newMessages, oldMessages) => {
    if (newMessages.length > (oldMessages?.length || 0)) {
      nextTick(() => {
        forceScrollToBottom()
      })
    }
    const latestMessage = newMessages[newMessages.length - 1]
    if (latestMessage && latestMessage.senderId === 9999) {
      console.log('[ContractChat] AI 메시지 감지됨 (senderId: 9999)')
      store.markAiMessageReceived()
    }
    if (latestMessage && String(latestMessage.senderId) === AI_SENDER_COMPLETE) {
      console.log('[ContractChat] 최종 알림 감지됨 (senderId: 9997) → allCompleted')
      store.markAllCompleted()
    }
  },
  { immediate: true, deep: true },
)

watch(hookIsReady, (ready) => {
  console.log('🔌 useContractChat 준비 상태:', ready)
})

watch(currentUserId, async (newUserId) => {
  if (newUserId && actualContractChatId.value) {
    console.log('👤 사용자 ID 설정됨, 계약 정보 로드:', newUserId)
    await loadContractInfo()
  }
})

watch(
  actualContractChatId,
  async (newId) => {
    if (newId && currentUserId.value) {
      console.log('🏠 계약 채팅방 ID 설정됨:', newId)
      await loadContractInfo()
      await loadMessages()
    }
  },
  { immediate: true },
)

// 초기화
onMounted(async () => {
  await loadUserInfo()
  if (actualContractChatId.value) {
    await loadMessages()
    if (currentUserId.value) {
      await loadContractInfo()
    }
  }
})
</script>

<style scoped>
.typing-indicator {
  animation: blink 1.5s infinite;
}
@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.5;
  }
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.break-words {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
</style>
