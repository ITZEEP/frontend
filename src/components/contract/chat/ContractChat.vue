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
      <div v-if="loadingMessages && !hasLoadedOnce" class="text-center text-gray-500">
        메시지 로딩 중...
      </div>

      <div v-else-if="messagesError" class="text-center text-red-500 py-4">
        <div class="mb-2">{{ messagesError }}</div>
      </div>

      <template v-else>
        <template
          v-for="(m, i) in mergedMessages"
          :key="m.id || m._localId || m.tempId || m.sendTime || i"
        >
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
            :sendStatus="getMessageStatus(m)"
          />
        </template>

        <div v-if="!mergedMessages.length" class="text-center text-gray-400 py-8">
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
import { useStep1Auto } from '@/composables/contract/useStep1Auto'
import { contractApi } from '@/apis/contractApi'
import LegalTermsModal from '../modals/common/LegalTermsModal.vue'
import LegalTipsModal from '../modals/common/LegalTipsModal.vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  contractChatId: { type: [String, Number], required: false },
  currentStep: { type: [Number, String], required: false, default: 3 },
  currentRound: { type: [Number, String], required: false, default: 0 },
})

const modalStore = useModalStore()
const store = useSpecialContractStore()
const route = useRoute()
const router = useRouter()

const inflightSync = ref(false)
let syncTimer = null

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
  hasLoadedOnce,
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

// ======== 단계별 버튼 액션 =======

// 0단계 임대인 입장 전
const openLegalTerms = () => modalStore.open(LegalTermsModal, { onClose: () => modalStore.close() })
const openLegalTips = () => modalStore.open(LegalTipsModal, { onClose: () => modalStore.close() })

const amOwner = computed(() => {
  const me = String(currentUserId.value ?? '')
  const owner = String(contractData.value?.ownerId ?? '')
  return !!me && !!owner && me === owner
})

const mkStep2Body = (accepted) => (amOwner.value ? { owner: !!accepted } : { buyer: !!accepted })

const step2Inflight = ref(false)
// 1단계 정보 확인
const respondGoToStep2 = async (accepted) => {
  const id = String(actualContractChatId.value)
  if (!id || step2Inflight.value) return

  step2Inflight.value = true
  try {
    const body = mkStep2Body(accepted)
    const res = await contractApi.postGoToStep2(id, body)
    if (!res?.success) {
      console.warn('postGoToStep2 실패:', res?.message)
      return
    }
    await loadMessages(id)
    nextTick(forceScrollToBottom)
  } catch (e) {
    console.error('postGoToStep2 에러:', e)
  } finally {
    step2Inflight.value = false
  }
}

// 3단계 모달/액션
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
  step1: {
    respondGoToStep2,
    openLegalTerms,
    openLegalTips,
  },
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

const throttledLoadMessages = async (id) => {
  if (!id) return
  if (loadingMessages.value || inflightSync.value) return
  inflightSync.value = true
  try {
    await loadMessages(id)
  } finally {
    inflightSync.value = false
  }
}

// 정보 확인
useStep1Auto({
  chatId: actualContractChatId,
  apiMessages,
  hookMessages,
  isOwner,
  runApiBy: 'tenant',
  hookIsReady,
  loadMessagesFn: throttledLoadMessages,
})

const mergedMessages = computed(() => {
  const a = Array.isArray(apiMessages.value) ? apiMessages.value : []
  const b = Array.isArray(hookMessages.value) ? hookMessages.value : []

  const keyOf = (m, i) => String(m?.id ?? m?.sendTime ?? m?._localId ?? m?.tempId ?? `tmp-${i}`)

  const tsOf = (m, i) => {
    const t =
      new Date(m?.sendTime || m?.createdAt || 0).getTime() ||
      Number(m?.id) ||
      Number(m?.tempId) ||
      (typeof m?._localId === 'number' ? m._localId : 0) ||
      0
    return t || i
  }

  const map = new Map()
  a.forEach((m, i) => map.set(keyOf(m, i), m))
  b.forEach((m, i) => map.set(keyOf(m, i + 10000), m))

  const arr = [...map.values()]
  arr.sort((x, y) => tsOf(x, 0) - tsOf(y, 0))
  return arr
})

const isNewerThanApi = (live) => {
  if (!live || String(live.senderId) !== '9999') return false
  const liveTs = new Date(live?.sendTime || live?.createdAt || 0).getTime()
  const apiLast = apiMessages.value.at(-1)
  const apiTs = new Date(apiLast?.sendTime || apiLast?.createdAt || 0).getTime()
  return liveTs > apiTs
}

// 단일 디바운스 + 중복 방지
const scheduleSync = () => {
  const id = actualContractChatId.value
  if (!id) return
  if (loadingMessages.value || inflightSync.value) return

  const liveLast = hookMessages.value.at(-1)
  if (!isNewerThanApi(liveLast)) return

  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    if (loadingMessages.value || inflightSync.value) return
    inflightSync.value = true
    try {
      await loadMessages(id)
    } finally {
      inflightSync.value = false
    }
  }, 300)
}

const latestMsg = computed(() => mergedMessages.value.at(-1) || null)

// watch들
const safeReplaceQuery = (nextPartial = {}) => {
  const base = { ...(route.query || {}) }
  const next = { ...base, ...nextPartial }
  if (next.step != null) next.step = String(next.step)
  if (next.round != null) next.round = String(next.round)
  const same =
    JSON.stringify(base, Object.keys(base).sort()) ===
    JSON.stringify(next, Object.keys(next).sort())
  if (!same) {
    router.replace({ path: route.path, query: next })
  }
}

const normalizeText = (s) =>
  String(s || '')
    .replace(/[\u2018-\u201F]/g, "'") // ‘ ’ “ ” → '
    .replace(/\s+/g, ' ')
    .trim()

watch(
  latestMsg,
  (m) => {
    if (!m) return
    const sid = String(m.senderId)
    if (sid !== '9998' && sid !== '9999') return

    const t = normalizeText(m.content)

    // --- 1단계 감지 ---
    if (t.includes(`사전 조사를 토대로`)) {
      const next = { ...route.query, step: '1' }
      delete next.round
      safeReplaceQuery(next)
      return
    }

    // --- 2단계 감지 ---
    if (t.includes(`2단계 '금액 조율' 단계입니다.`) || /2단계.*금액\s*조율/.test(t)) {
      safeReplaceQuery({ step: '2' })
      return
    }

    // --- 3단계 감지 ---
    if (
      t.includes(`3단계: '특약 조율' 단계입니다.`) ||
      /3단계.*특약\s*조율/.test(t) ||
      t.includes('특약 초안이 생성되었습니다')
    ) {
      const round = String(store.currentRound ?? 0)
      safeReplaceQuery({ step: '3', round })
      return
    }
  },
  { immediate: true },
)

watch(
  () => hookMessages.value.at(-1),
  (m) => {
    if (!m) return
    if (String(m.senderId) === '9999') {
      scheduleSync()
    }
  },
)

watch(
  hookMessages,
  (list, old) => {
    if (list.length > (old?.length || 0)) nextTick(forceScrollToBottom)
    const latest = list[list.length - 1]
    if (!latest) return
    if (String(latest.senderId) === '9999') store.markAiMessageReceived()
    if (String(latest.senderId) === AI_SENDER.COMPLETE) {
      store.markAllCompleted()
      const t = String(latest.content || '')
      if (t.includes('적법성 검토')) {
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
    if (loadingMessages.value || inflightSync.value) return
    inflightSync.value = true
    try {
      await loadMessages(id)
    } finally {
      inflightSync.value = false
    }
    if (currentUserId.value) await loadContractInfo()
  },
  { immediate: true },
)

onMounted(async () => {
  await loadUserInfo()
  if (actualContractChatId.value) {
    if (currentUserId.value) await loadContractInfo()

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

watch(
  () => mergedMessages.value.length,
  (len, old) => {
    if (len > (old || 0)) nextTick(forceScrollToBottom)
  },
)
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
