<template>
  <div class="h-full flex flex-col">
    <!-- 헤더 -->
    <div class="px-4 py-3 border-b-2 bg-white">
      <p class="font-bold text-lg">실시간 협의</p>
      <div class="text-sm text-gray-600">
        계약 채팅방 ID: {{ actualContractChatId || 'Loading...' }}
      </div>
      <div class="text-xs text-gray-500">step={{ stepNum }} | round={{ store.currentRound }}</div>
    </div>

    <!-- 메시지 영역 -->
    <div class="w-full flex-1 p-4 bg-gray-50 max-h-[420px] overflow-y-auto" ref="messagesContainer">
      <div v-if="loadingMessages" class="text-center text-gray-500">메시지 로딩 중...</div>

      <div v-else-if="messagesError" class="text-center text-red-500 py-4">
        <div class="mb-2">{{ messagesError }}</div>
      </div>

      <template v-else>
        <!-- API 로드 메시지 -->
        <template v-for="m in apiMessages" :key="'api-' + m.id">
          <AiChatMessage
            v-if="isAi(m)"
            :message="m.content"
            :buttons="aiButtons(m)"
            :sentAt="m.sendTime"
            @action="handleAiAction"
          />
          <UserChatMessage
            v-else
            :name="getMessageSenderName(m)"
            :message="m.content"
            :time="formatMessageTime(m.sendTime)"
            :userId="m.senderId"
            :myUserId="currentUserId"
            :isRead="m.isRead"
            :sendStatus="'sent'"
          />
        </template>

        <!-- 실시간 메시지 -->
        <template v-for="(m, i) in hookMessages" :key="'live-' + (m.id || m.sendTime || i)">
          <AiChatMessage
            v-if="isAi(m)"
            :message="m.content"
            :buttons="aiButtons(m)"
            @action="handleAiAction"
          />
          <UserChatMessage
            v-else
            :name="getMessageSenderName(m)"
            :message="m.content"
            :time="formatMessageTime(m.sendTime)"
            :userId="m.senderId"
            :myUserId="currentUserId"
            :isRead="m.isRead"
            :sendStatus="getMessageStatus(m)"
          />
        </template>

        <div
          v-if="!apiMessages.length && !hookMessages.length"
          class="text-center text-gray-400 py-8"
        >
          아직 메시지가 없습니다. 첫 메시지를 보내보세요!
        </div>
      </template>
    </div>

    <!-- 스텝 별 시나리오 메시지 -->
    <StepContainer />

    <!-- 입력 -->
    <ContractChatInput
      v-if="isInputReady"
      :chatRoomId="actualContractChatId"
      :receiverId="contractReceiverId"
      :isOwner="isOwner"
      :canSendMessage="canSendMessage"
      @sendMessage="sendMessageUi"
      @typing="() => {}"
      @setStartPoint="handleSetStartPoint"
      @exportMessages="handleExportMessages"
    />

    <div v-else class="border-t bg-gray-50 p-4 text-center text-gray-500">
      <div class="mb-2">{{ getLoadingMessage() }}</div>
    </div>

    <LoadingOverlay
      :loading="isLoadingOverlayVisible"
      message="AI가 특약 수정 중..."
      sub-message="잠시만 기다려주세요"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoundQuerySync } from '@/composables/chat/useRoundQuerySync'
import { useChatBasics } from '@/composables/chat/useChatBasics'
import { useChatMessages } from '@/composables/chat/useChatMessages'
import { useChatAiButtons } from '@/composables/chat/useChatAiButtons'
import { useContractChat } from '@/hooks/chat/useContractChat'
import { useSpecialContractStore } from '@/stores/useContractTermStore'
import { AI_SENDER } from '@/config/chat/aiUiRegistry'
import StepContainer from './StepContainer.vue'

import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import AiChatMessage from './messages/AiChatMessage.vue'
import UserChatMessage from './messages/UserChatMessage.vue'
import ContractChatInput from './ContractChatInput.vue'

import {
  setStartPoint,
  setEndPointAndExport,
  postFinalModificationResponse,
  postFinalDeletionResponse,
  postFinalConfirmResponse,
} from '@/apis/contractChatApi'

import TermsReviewModal from '@/components/contract/modals/step3/TermsReviewModal.vue'
import FinalClauseSelectModal from '@/components/contract/modals/step3/FinalClauseSelectModal.vue'
import { useModalStore } from '@/stores/modal'
import { createActionDispatchers } from '@/config/chat/aiActionHandlers'

const props = defineProps({
  contractChatId: { type: [String, Number], required: false },
  currentStep: { type: [Number, String], required: false, default: 3 },
  currentRound: { type: [Number, String], required: false, default: 0 },
})

const modalStore = useModalStore()
const store = useSpecialContractStore()

// 1) 기본 정보
const {
  actualContractChatId,
  currentUserId,
  contractData,
  isOwner,
  contractReceiverId,
  loadUserInfo,
  loadContractInfo,
} = useChatBasics(props.contractChatId)

// 2) 메시지 로딩/스크롤
const {
  apiMessages,
  loadingMessages,
  messagesError,
  messagesContainer,
  loadMessages,
  forceScrollToBottom,
} = useChatMessages()

// 3) round ↔ URL 동기화(step=3 전용), step4 전환
const { gotoStep4 } = useRoundQuerySync(props.currentStep)

// 4) 실시간(WebSocket)
const {
  messages: hookMessages,
  isReady: hookIsReady,
  sendContractMessage,
  canSendMessage,
} = useContractChat(actualContractChatId, currentUserId, contractData)

// 5) AI 버튼 규칙
const { stepNum, isAi, aiButtons } = useChatAiButtons(props.currentStep, () => isOwner.value)

// UI 상태
const isLoadingOverlayVisible = ref(false)

const isInputReady = computed(() => {
  return !!(
    currentUserId.value &&
    actualContractChatId.value &&
    contractReceiverId.value &&
    hookIsReady.value
  )
})

const getLoadingMessage = () => {
  if (!actualContractChatId.value) return '계약 채팅방 ID를 찾는 중...'
  if (!currentUserId.value) return '사용자 정보 로딩 중...'
  if (!contractReceiverId.value) return '계약 상대방 정보 로딩 중...'
  if (!hookIsReady.value) return '계약 채팅방 연결 중...'
  return '로딩 중...'
}

const getMessageSenderName = (m) => {
  if (String(m.senderId) === String(currentUserId.value)) return '나'
  const { ownerId, buyerId } = contractData.value || {}
  if (String(m.senderId) === String(ownerId)) return '소유자'
  if (String(m.senderId) === String(buyerId)) return '구매자'
  return '사용자'
}

const getMessageStatus = (m) => {
  if (String(m.senderId) !== String(currentUserId.value)) return 'sent'
  return m.id && m.sendTime ? 'sent' : 'sending'
}

const formatMessageTime = (ds) => {
  if (!ds) return ''
  const d = new Date(ds)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// 모달/액션
const openTermsReview = () =>
  modalStore.open(TermsReviewModal, { onClose: () => modalStore.close() })
const openFinalClause = () =>
  modalStore.open(FinalClauseSelectModal, { onClose: () => modalStore.close() })
const openExportResult = () => {}

const respondModification = async (accepted) => {
  const res = await postFinalModificationResponse(Number(actualContractChatId.value), { accepted })
  if (res?.success) store.bumpFinalContractVersion()
}
const responseDeletion = async (accepted) => {
  const res = await postFinalDeletionResponse(Number(actualContractChatId.value), { accepted })
  if (res?.success) store.bumpFinalContractVersion()
}
const responseFinalConfirm = async (accepted) => {
  const res = await postFinalConfirmResponse(Number(actualContractChatId.value), { accepted })
  if (res?.success) store.bumpFinalContractVersion()
}

const dispatchAction = createActionDispatchers({
  modalStore,
  step3: {
    openTermsReview,
    openFinalClause,
    openExportResult,
    respondModification,
    responseDeletion,
    responseFinalConfirm,
  },
})
const handleAiAction = (payload) => {
  const action = typeof payload === 'string' ? payload : payload?.action
  console.log('[AI action]', payload, '->', action)
  if (!action) return
  dispatchAction(action, payload?.data)
}

// 전송
const sendMessageUi = async (content, callback) => {
  console.log('📨 ContractChat: 메시지 전송 요청:', content)

  if (!isInputReady.value) {
    const result = { success: false, error: '채팅방이 준비되지 않았습니다.' }
    if (callback) callback(result)
    return result
  }

  try {
    // useContractChat의 sendContractMessage 호출
    const result = sendContractMessage(content, 'TEXT')

    console.log('📤 ContractChat: 전송 결과:', result)

    // 🔧 전송 성공한 경우에만 화면에 메시지 추가
    if (result) {
      hookMessages.value.push({
        id: Date.now(),
        senderId: currentUserId.value,
        receiverId: contractReceiverId.value,
        content,
        sendTime: new Date().toISOString(),
        type: 'TEXT',
        isRead: false,
      })
      nextTick(forceScrollToBottom)
    } else {
      console.warn('메시지 전송 실패:', result?.error || '알 수 없는 오류')
    }

    // 🔧 콜백으로 결과 전달
    if (callback) callback(result)
    return result
  } catch (error) {
    console.error('계약 메시지 전송 중 오류:', error)
    const errorResult = {
      success: false,
      error: error.message || '메시지 전송 중 오류가 발생했습니다.',
    }
    if (callback) callback(errorResult)
    return errorResult
  }
}

// 시작점/내보내기
const handleSetStartPoint = async () => {
  const res = await setStartPoint(String(actualContractChatId.value))
  if (!res?.success) alert(res?.message || '시작점 설정 실패')
}
const handleExportMessages = async () => {
  isLoadingOverlayVisible.value = true
  try {
    const order = store.currentOrder
    const res = await setEndPointAndExport(String(actualContractChatId.value), order)
    if (!res?.success) return alert(res?.message || '내보내기 실패')
    store.markOrderSuccess(order)
    await store.moveToNextOrder(String(actualContractChatId.value))
  } finally {
    isLoadingOverlayVisible.value = false
  }
}

// watch들
watch(
  hookMessages,
  (list, old) => {
    if (list.length > (old?.length || 0)) nextTick(forceScrollToBottom)
    const latest = list[list.length - 1]
    if (!latest) return
    if (String(latest.senderId) === '9999') store.markAiMessageReceived()
    if (String(latest.senderId) === AI_SENDER.COMPLETE) {
      store.markAllCompleted()
      // 문구 매칭: 적법성 검토 단계 진입 알림
      const t = String(latest.content || '')
      if (t.includes('적법성 검토')) {
        // step=4로 URL 쿼리 변경 (round는 제거/무시)
        gotoStep4()
      }
    }
  },
  { deep: true },
)

watch(
  actualContractChatId,
  async (id) => {
    if (!id) return
    await loadMessages(id)
    if (currentUserId.value) await loadContractInfo()
  },
  { immediate: true },
)

onMounted(async () => {
  await loadUserInfo()
  if (actualContractChatId.value) {
    await loadMessages(actualContractChatId.value)
    if (currentUserId.value) await loadContractInfo()

    // 히스토리에도 9997 적법성 문구가 있으면 step=4로 보정
    const all = [...apiMessages.value, ...hookMessages.value]
    const lastComplete = [...all]
      .reverse()
      .find(
        (m) =>
          String(m?.senderId) === AI_SENDER.COMPLETE &&
          String(m?.content || '').includes('적법성 검토'),
      )
    if (lastComplete) gotoStep4()
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
