<template>
  <div class="h-full flex flex-col">
    <!-- 헤더 -->
    <div class="px-4 py-3 border-b-2 bg-white shrink-0">
      <p class="font-bold text-lg">실시간 협의</p>
      <div class="text-sm text-gray-600">
        계약 채팅방 ID: {{ actualContractChatId || 'Loading...' }}
      </div>
      <div class="text-xs text-gray-500">step={{ stepNum }} | round={{ store.currentRound }}</div>
    </div>

    <!-- 메시지 영역 -->
    <div class="w-full flex-1 min-h-0 p-4 bg-gray-50 overflow-y-auto" ref="messagesContainer">
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
          <!-- 법령 카드 (senderId: 9996) -->
          <LawTipMessage
            v-if="String(m.senderId) === '9996'"
            :raw="m.content"
            :sentAt="m.sendTime"
          />

          <AiChatMessage
            v-else-if="isAi(m)"
            :message="m.content"
            :buttons="visibleButtons(m)"
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
            :hideIcon="String(m.senderId) === '9996'"
          />
        </template>

        <div v-if="!mergedMessages.length" class="text-center text-gray-400 py-8">
          아직 메시지가 없습니다. 첫 메시지를 보내보세요!
        </div>
      </template>
    </div>

    <!-- 스텝 별 시나리오 메시지 -->
    <StepContainer class="shrink-0" @owner-edit-request="onOwnerEditRequest" />

    <!-- 입력 -->
    <ContractChatInput
      v-if="isInputReady"
      :chatRoomId="actualContractChatId"
      :receiverId="contractReceiverId"
      :isOwner="isOwner"
      :canSendMessage="canSendMessage"
      :rentContext="rentContext"
      @sendMessage="sendMessageUi"
      @typing="() => {}"
      @setStartPoint="handleSetStartPoint"
      @exportMessages="handleExportMessages"
      @owner-edit-request="onOwnerEditRequest"
      @owner-edit-failed="onOwnerEditFailed"
      class="shrink-0"
    />

    <div v-else class="border-t bg-gray-50 p-4 text-center text-gray-500">
      <div class="mb-2">{{ getLoadingMessage() }}</div>
    </div>

    <LoadingOverlay
      :loading="amOwner && isLoadingOverlayVisible"
      message="임대인 및 AI 응답 대기중 ..."
      sub-message="임대인이 수락하면 AI 분석 요청됩니다. 잠시만 기다려주세요"
    />
    <LoadingOverlay
      :loading="!amOwner && isLoadingOverlayVisible"
      message="AI가 특약 수정 중..."
      sub-message="잠시만 기다려주세요"
    />

    <div
      v-if="signingCountdown > 0"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
    >
      <div class="bg-white rounded-xl p-6 shadow-xl text-center w-[320px]">
        <p class="text-lg font-semibold mb-2">임차인이 최종 확정했어요</p>
        <p class="text-sm text-gray-600 mb-4">서명 페이지로 이동합니다…</p>
        <div class="text-4xl font-bold text-yellow-primary">{{ signingCountdown }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
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
import LawTipMessage from './messages/LawTipMessage.vue'
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

const stepFromUrl = computed(() => Number(route.query.step ?? props.currentStep ?? 3))

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
const { stepNum, isAi, aiButtons } = useChatAiButtons(stepFromUrl, () => isOwner.value)

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
  if (String(m.senderId) === '9996') return '법령 정보'
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

    if (accepted) {
      alert(
        amOwner.value
          ? '임대인이 2단계 진행을 수락했습니다.'
          : '임차인이 2단계 진행을 수락했습니다.',
      )
    } else {
      alert(
        amOwner.value
          ? '임대인이 2단계 진행을 거절했습니다.'
          : '임차인이 2단계 진행을 거절했습니다.',
      )
    }

    await loadMessages(id)
    nextTick(forceScrollToBottom)
  } catch (e) {
    console.error('postGoToStep2 에러:', e)
  } finally {
    step2Inflight.value = false
  }
}

// 2단계 정보 확인
const STEP2_TRIGGER = `다음은 2단계 '금액 조율' 단계입니다.`

const priceFetched = ref(false)
const needGetPrice = ref(false)

const triggerGetPrice = async () => {
  if (!amOwner.value) {
    console.log('[step2] 임대인이 아님 → postGetPrice 스킵(나중에 재시도 가능)')
    return
  }

  const id = String(actualContractChatId.value || '')
  if (!id || priceFetched.value) return
  priceFetched.value = true
  try {
    await contractApi.postGetPrice(id)
    console.log('[step2] postGetPrice 호출 완료')
  } catch (e) {
    console.error('postGetPrice 실패:', e)
    priceFetched.value = false
  }
}

function parseKoreanAmount(raw = '') {
  const s = String(raw).replace(/\s+/g, '').replace(/,/g, '')
  if (!s) return null
  const UNIT = { 억: 100_000_000, 만: 10_000, 천: 1_000, 백: 100, 십: 10 }
  const t = s.replace(/원$/, '')
  if (/^\d+$/.test(t)) return Number(t)
  let total = 0
  let rest = t
  for (const big of ['억', '만']) {
    const m = rest.match(new RegExp(`(\\d+)?${big}`))
    if (m) {
      total += (m[1] ? Number(m[1]) : 1) * UNIT[big]
      rest = rest.replace(m[0], '')
    }
  }
  for (const small of ['천', '백', '십']) {
    const m = rest.match(new RegExp(`(\\d+)?${small}`))
    if (m) {
      total += (m[1] ? Number(m[1]) : 1) * UNIT[small]
      rest = rest.replace(m[0], '')
    }
  }
  if (/^\d+$/.test(rest)) total += Number(rest)
  return Number.isFinite(total) ? total : null
}

const rentContext = computed(() => {
  const msgs = mergedMessages.value || []
  if (!msgs.length) return { type: null, deposit: null, monthly: null }
  const cand = msgs.at(-2) || msgs.at(-1)
  const content = String(cand?.content || '')

  let type = null
  if (/전세\s*계약/.test(content)) type = 'JEONSE'
  else if (/월세\s*계약/.test(content)) type = 'WOLSE'

  const depositMatch = content.match(/보증금[은는]?\s*([^\n,]+?원)/)
  const deposit = depositMatch ? parseKoreanAmount(depositMatch[1]) : null

  const monthlyMatch =
    content.match(/월세[는\s:]*([^\n,]+?원)/) || content.match(/임대료[는\s:]*([^\n,]+?원)/)
  const monthly = monthlyMatch ? parseKoreanAmount(monthlyMatch[1]) : null

  return { type, deposit, monthly }
})

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

const onOwnerEditRequest = () => {
  if (amOwner.value) isLoadingOverlayVisible.value = true
}
const onOwnerEditFailed = () => {
  if (amOwner.value) isLoadingOverlayVisible.value = false
}

const RE_ROUND_DONE = /(\d+)\s*차\s*수정이\s*완료되었습니다!.*\s*협상\s*라운드가\s*시작됩니다\./

const RE_TENANT_ACCEPT_MOD =
  /임차인이\s*특약\s*(\d+)\s*번\s*수정\s*요청을\s*수락했습니다\.\s*특약이\s*변경되었습니다\./
const RE_TENANT_ACCEPT_DEL =
  /임차인이\s*특약\s*(\d+)\s*번\s*삭제\s*요청을\s*수락했습니다\.\s*특약이\s*삭제되었습니다\./

const RE_MORE_REQUEST = /(임차인|임대인).?이?\s*특약\s*대화를\s*더\s*요청했습니다\.?/
const RE_START_CLAUSE_TALK = /(\d+)\s*번\s*특약에\s*대한\s*대화를\s*시작합니다!?/

// 4단계 적법성 검토
const responseFinal = async (accepted) => {
  const id = String(actualContractChatId.value)
  if (!id) return

  try {
    const res = await contractApi.postResponseFinalAccept(id, { accepted })
    if (res?.success) {
      store.bumpFinalContractVersion()
      alert(accepted ? '최종 확정을 수락했습니다.' : '최종 확정을 거절했습니다.')
    } else {
      alert(res?.message || '최종 확정 응답 실패')
    }
  } catch (e) {
    console.error('[ContractChat] 최종 확정 응답 실패:', e)
    alert('최종 확정 응답 중 오류가 발생했습니다.')
  }
}

const signingCountdown = ref(0)
let signingTimer = null

// 이 부분 계약서\s*서명하러\s*갈께요!?/ 만 남도록 수정할 예정
const RE_TENANT_FINAL_ACCEPT =
  /임차인이\s*최종\s*계약서를\s*수락했습니다!\s*계약서\s*서명하러\s*갈께요!?/

const startSigningCountdown = (sec = 3) => {
  if (signingTimer) clearInterval(signingTimer)
  signingCountdown.value = sec
  signingTimer = setInterval(() => {
    signingCountdown.value -= 1
    if (signingCountdown.value <= 0) {
      clearInterval(signingTimer)
      signingTimer = null
      router.push(`/contract/complete/${String(actualContractChatId.value)}`)
    }
  }, 1000)
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
  step4: {
    respondModification,
    responseDeletion,
    responseFinal,
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
  if (!isInputReady.value) {
    const result = { success: false, error: '채팅방이 준비되지 않았습니다.' }
    callback?.(result)
    return result
  }

  try {
    // 서버 전송 (실패 시 throw)
    await sendContractMessage(content, 'TEXT')

    // ✅ 낙관적 업데이트: 즉시 로컬에 메시지 추가
    hookMessages.value.push({
      id: Date.now(), // 임시 키
      _localId: (crypto?.randomUUID && crypto.randomUUID()) || `local-${Date.now()}`,
      senderId: currentUserId.value,
      receiverId: contractReceiverId.value,
      content,
      sendTime: new Date().toISOString(),
      type: 'TEXT',
      isRead: false,
    })

    nextTick(forceScrollToBottom)

    const ok = { success: true }
    callback?.(ok)
    return ok
  } catch (error) {
    const err = {
      success: false,
      error: error?.message || '메시지 전송 중 오류가 발생했습니다.',
    }
    callback?.(err)
    return err
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
  b.forEach((m, i) => map.set(keyOf(m, i, 10000), m))

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

// 단일 디바운스 중복 방지
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

const TENANT_ONLY_ACTIONS = new Set([
  // step3
  'step3.modification.reject',
  'step3.modification.accept',
  'step3.deletion.reject',
  'step3.deletion.accept',
  'step3.finalConfirm.reject',
  'step3.finalConfirm.accept',

  // step4
  'step4.modification.reject',
  'step4.modification.accept',
  'step4.deletion.reject',
  'step4.deletion.accept',
  'step4.final.reject',
  'step4.final.accept',
])

const visibleButtons = (message) => {
  const btns = aiButtons(message) || []
  // amOwner = true → 임대인
  if (amOwner.value) {
    return btns.filter((b) => !TENANT_ONLY_ACTIONS.has(b.action))
  }
  // 임차인 → 그대로 노출
  return btns
}

onMounted(() => {
  // 혹시 남아있던 타이머 정리
  if (signingTimer) clearInterval(signingTimer)
})
onUnmounted(() => {
  if (signingTimer) clearInterval(signingTimer)
})

watch(
  latestMsg,
  (m) => {
    if (!m) return
    const sid = String(m.senderId)
    const t = normalizeText(m.content)

    // ✅ 발신자와 무관하게 로딩 해제 트리거 우선 처리
    if (RE_MORE_REQUEST.test(t) || RE_START_CLAUSE_TALK.test(t)) {
      isLoadingOverlayVisible.value = false
    }

    // ⬇️ 아래부터는 AI 메시지에만 적용되는 기존 단계 전환/동기화 로직 유지
    if (sid !== '9998' && sid !== '9999') return

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

      if (t === STEP2_TRIGGER) {
        needGetPrice.value = true
        triggerGetPrice()
      }
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

    // 2) 임차인이 수락 → AI(9998)가 라운드 시작 알림을 보냄
    if (amOwner.value && sid === '9998' && RE_ROUND_DONE.test(t)) {
      isLoadingOverlayVisible.value = false
    }

    if (RE_TENANT_ACCEPT_MOD.test(t) || RE_TENANT_ACCEPT_DEL.test(t)) {
      store.bumpFinalContractVersion()
    }

    // --- 특약 수정 요청 허용 트리거 감지 ---
    if (t.includes('위 문제점들을 검토하시고 필요시 임대인께서 수정 요청을 해주세요')) {
      try {
        localStorage.setItem('specialContract_allowOwnerOngoingEdit', 'true')
      } catch (e) {
        console.log(e)
      }
      if (store && 'allowOwnerOngoingEdit' in store) {
        store.allowOwnerOngoingEdit = true
      }
    }

    // --- 4단계 감지 ---
    if (RE_TENANT_FINAL_ACCEPT.test(t)) {
      // 중복 실행 방지
      if (signingCountdown.value <= 0) {
        startSigningCountdown(3)
      }
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

watch(
  [amOwner, actualContractChatId],
  () => {
    if (needGetPrice.value && !priceFetched.value && amOwner.value && actualContractChatId.value) {
      console.log('[step2] 지연 로딩 후 postGetPrice 재시도')
      triggerGetPrice()
    }
  },
  { immediate: false },
)

watch(
  () => store.currentRound,
  () => {
    isLoadingOverlayVisible.value = false
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
