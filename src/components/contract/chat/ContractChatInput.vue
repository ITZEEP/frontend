<template>
  <div class="border-t bg-white">
    <!-- 상단 버튼 영역 -->
    <div
      class="w-full p-2 border-b flex flex-wrap gap-2 md:gap-4 md:flex-nowrap sm:gap-4 sm:flex-nowrap"
    >
      <!-- ===== 2단계 버튼 ===== -->
      <template v-if="stepNum === 2">
        <!-- 임대인: 금액 요청하기 (폼 토글) -->
        <BaseButton
          v-if="props.isOwner"
          @click="handlePriceRequest"
          :disabled="isProcessing || !canSendMessage"
        >
          {{ showPriceForm ? '닫기' : '금액 요청하기' }}
        </BaseButton>

        <!-- 임차인: 거절/수락 -->
        <BaseButton
          v-if="!props.isOwner"
          @click="handlePriceReject"
          :disabled="isProcessing || !canSendMessage"
        >
          {{ isProcessing ? '처리 중...' : '거절하기' }}
        </BaseButton>
        <BaseButton
          v-if="!props.isOwner"
          @click="handlePriceAccept"
          :disabled="isProcessing || !canSendMessage"
        >
          {{ isProcessing ? '처리 중...' : '수락하기' }}
        </BaseButton>
      </template>

      <!-- ===== 3단계 버튼 (기존) ===== -->
      <template v-if="stepNum === 3">
        <BaseButton
          v-if="props.isOwner"
          @click="handleExportRequest"
          :disabled="isProcessing || !canSendMessage"
        >
          {{ isProcessing ? '처리 중...' : 'AI 수정 요청하기' }}
        </BaseButton>
        <BaseButton
          v-if="!props.isOwner"
          @click="handleExportReject"
          :disabled="isProcessing || !canSendMessage"
        >
          {{ isProcessing ? '처리 중...' : 'AI 수정 거절' }}
        </BaseButton>
        <BaseButton
          v-if="!props.isOwner"
          @click="handleExportMessages"
          :disabled="isProcessing || !canSendMessage"
        >
          {{ isProcessing ? '내보내는 중...' : 'AI 수정 수락' }}
        </BaseButton>
      </template>
    </div>

    <!-- ===== 2단계: 금액 입력 폼 ===== -->
    <div
      v-if="stepNum === 2 && showPriceForm && props.isOwner"
      class="px-4 py-3 border-b bg-gray-50"
    >
      <!-- 전/월세 선택 -->
      <div class="mb-3 flex gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="JEONSE" v-model="priceType" />
          <span>전세</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" value="WOLSE" v-model="priceType" />
          <span>월세</span>
        </label>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- 보증금 -->
        <div>
          <label class="block text-sm text-gray-600 mb-1">보증금(원)</label>
          <input
            :value="depositInput"
            @input="onDepositInput"
            inputmode="numeric"
            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 83,000,000"
          />
          <p v-if="priceErrors.deposit" class="text-xs text-red-500 mt-1">
            {{ priceErrors.deposit }}
          </p>
        </div>

        <!-- 월세 (월세일 때만 노출) -->
        <div v-if="priceType === 'WOLSE'">
          <label class="block text-sm text-gray-600 mb-1">월세(원)</label>
          <input
            :value="monthlyInput"
            @input="onMonthlyInput"
            inputmode="numeric"
            class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 700,000"
          />
          <p v-if="priceErrors.monthly" class="text-xs text-red-500 mt-1">
            {{ priceErrors.monthly }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <BaseButton
          variant="outline"
          :disabled="isProcessing || !canSendMessage"
          @click="submitPriceRequest"
        >
          {{ isProcessing ? '요청 중...' : '확인하여 요청' }}
        </BaseButton>
        <BaseButton
          class="bg-gray-200 hover:bg-gray-300 text-gray-800"
          :disabled="isProcessing"
          @click="showPriceForm = false"
        >
          취소
        </BaseButton>
      </div>
    </div>

    <!-- 메시지 입력 영역 -->
    <div class="flex px-4 pt-2 pb-4 gap-2 items-center flex-nowrap">
      <input
        ref="messageInputRef"
        v-model="messageInput"
        @keyup.enter="sendMessage"
        @input="handleTyping"
        @focus="handleFocus"
        @blur="handleBlur"
        class="flex-1 min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        :class="[
          canSendMessage
            ? 'border-gray-300 focus:border-blue-500'
            : 'border-gray-200 bg-gray-100 cursor-not-allowed',
        ]"
        :placeholder="canSendMessage ? '메시지를 입력하세요' : '상대방이 오프라인 상태입니다'"
        :disabled="isSending || !canSendMessage"
      />
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim() || isSending || !canSendMessage"
        class="flex-none px-4 py-2 rounded-lg transition-all duration-200"
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
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { requestEndPointExport, rejectEndPointExport } from '@/apis/contractChatApi'
import { useRoute } from 'vue-router'
import { contractApi } from '@/apis/contractApi'

const emit = defineEmits([
  'sendMessage',
  'typing',
  'setStartPoint',
  'exportMessages',
  'exportRequest',
  'exportReject',
  'owner-edit-request',
  'owner-edit-failed',
])

const props = defineProps({
  chatRoomId: [String, Number],
  receiverId: [String, Number],
  canSendMessage: { type: Boolean, default: true },
  showDebugInfo: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
  rentContext: { type: Object, default: () => ({ type: null, deposit: null, monthly: null }) },
})

const route = useRoute()
const stepNum = computed(() => {
  const s = Number(route.query.step)
  return Number.isFinite(s) ? s : 3
})

// 상태
const messageInput = ref('')
const messageInputRef = ref(null)
const isSending = ref(false)
const isProcessing = ref(false)
const typingTimer = ref(null)
const isTypingActive = ref(false)

// ===== 금액 입력 상태 =====
const showPriceForm = ref(false)
const priceType = ref('WOLSE')
const depositInput = ref('')
const monthlyInput = ref('')
const priceErrors = ref({ deposit: '', monthly: '' })

// 감지값 반영
watch(
  () => props.rentContext,
  (ctx) => {
    if (!ctx) return
    if (ctx.type) priceType.value = ctx.type
    if (Number.isFinite(ctx.deposit)) depositInput.value = formatNumber(ctx.deposit)
    if (Number.isFinite(ctx.monthly)) monthlyInput.value = formatNumber(ctx.monthly)
  },
  { immediate: true, deep: true },
)

function onlyDigits(s = '') {
  return String(s).replace(/[^\d]/g, '')
}
function toNumber(s = '') {
  const n = Number(onlyDigits(s))
  return Number.isFinite(n) ? n : 0
}
function formatNumber(n) {
  return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
}

const onDepositInput = (e) => {
  depositInput.value = formatNumber(onlyDigits(e.target.value))
}
const onMonthlyInput = (e) => {
  monthlyInput.value = formatNumber(onlyDigits(e.target.value))
}

function validatePrice() {
  priceErrors.value = { deposit: '', monthly: '' }
  const dep = toNumber(depositInput.value)
  if (dep <= 0) priceErrors.value.deposit = '보증금을 입력하세요.'
  if (priceType.value === 'WOLSE') {
    const mon = toNumber(monthlyInput.value)
    if (mon <= 0) priceErrors.value.monthly = '월세를 입력하세요.'
  }
  return !priceErrors.value.deposit && !priceErrors.value.monthly
}

const handlePriceRequest = () => {
  if (props.isOwner) showPriceForm.value = !showPriceForm.value
}

const submitPriceRequest = async () => {
  if (isProcessing.value || !props.canSendMessage) return
  if (!validatePrice()) return
  try {
    isProcessing.value = true
    const body =
      priceType.value === 'JEONSE'
        ? { depositPrice: toNumber(depositInput.value) }
        : { depositPrice: toNumber(depositInput.value), monthlyRent: toNumber(monthlyInput.value) }
    const res = await contractApi.postRequestPrice(props.chatRoomId, body)
    if (!res?.success) {
      alert(res?.message || '금액 요청 실패')
      return
    }
    showPriceForm.value = false
  } catch (e) {
    console.error(e)
    alert('금액 요청 중 오류')
  } finally {
    setTimeout(() => (isProcessing.value = false), 600)
  }
}

// 임차인: 거절
const handlePriceReject = async () => {
  if (isProcessing.value || !props.canSendMessage) return
  try {
    isProcessing.value = true
    const res = await contractApi.postRejectPrice(props.chatRoomId)
    if (!res?.success) {
      alert(res?.message || '거절 실패')
      return
    }
    // 필요 시 UI 갱신/알림
    // alert('금액 확정 요청을 거절했습니다.')
  } catch (e) {
    console.error('금액 거절 실패:', e)
    alert('거절 중 오류가 발생했습니다.')
  } finally {
    setTimeout(() => (isProcessing.value = false), 600)
  }
}

// 임차인: 수락
const handlePriceAccept = async () => {
  if (isProcessing.value || !props.canSendMessage) return
  try {
    isProcessing.value = true
    const res = await contractApi.postAcceptPrice(props.chatRoomId) // ✅ PATCH /price/accept
    if (!res?.success) {
      alert(res?.message || '수락 실패')
      return
    }
    // 필요 시 UI 갱신/알림
    // alert('금액을 수락했습니다.')
  } catch (e) {
    console.error('금액 수락 실패:', e)
    alert('수락 중 오류가 발생했습니다.')
  } finally {
    setTimeout(() => (isProcessing.value = false), 600)
  }
}

// ===== 기존 메시지 전송 =====
const sendMessage = async () => {
  const content = messageInput.value.trim()
  if (!content || isSending.value || !props.canSendMessage) return
  try {
    isSending.value = true
    if (isTypingActive.value) {
      emit('typing', false)
      isTypingActive.value = false
    }
    const result = await new Promise((resolve) => emit('sendMessage', content, resolve))
    if (!result || result.success !== false) messageInput.value = ''
  } finally {
    setTimeout(() => (isSending.value = false), 500)
  }
}

const handleTyping = () => {
  if (!props.canSendMessage) return
  const cur = messageInput.value.trim()
  if (cur.length > 0 && !isTypingActive.value) {
    isTypingActive.value = true
    emit('typing', true)
  }
  if (typingTimer.value) clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(() => {
    if (isTypingActive.value) {
      isTypingActive.value = false
      emit('typing', false)
    }
  }, 1500)
  if (cur.length === 0 && isTypingActive.value) {
    isTypingActive.value = false
    emit('typing', false)
  }
}

const handleFocus = () => {
  if (!props.canSendMessage && messageInputRef.value) messageInputRef.value.blur()
}
const handleBlur = () => {
  if (isTypingActive.value) {
    isTypingActive.value = false
    emit('typing', false)
  }
  if (typingTimer.value) clearTimeout(typingTimer.value)
}

// ===== 3단계 관련 기존 함수들 =====
const handleExportRequest = async () => {
  if (!isProcessing.value) {
    isProcessing.value = true
    // 부모에 즉시 알려서 오버레이 ON
    emit('owner-edit-request')
    try {
      const res = await requestEndPointExport(props.chatRoomId)
      if (!res?.success) {
        // 실패면 부모에 OFF 알림(안 끄면 stuck 될 수 있음)
        emit('owner-edit-failed', res?.message || '요청 실패')
      }
    } catch (e) {
      emit('owner-edit-failed', e?.message || '요청 실패')
    } finally {
      isProcessing.value = false
    }
  }
}
const handleExportReject = async () => {
  if (!isProcessing.value) {
    isProcessing.value = true
    await rejectEndPointExport(props.chatRoomId)
    isProcessing.value = false
  }
}
const handleExportMessages = () => emit('exportMessages')

onMounted(() => {
  if (messageInputRef.value && props.canSendMessage) messageInputRef.value.focus()
})
onUnmounted(() => {
  if (typingTimer.value) clearTimeout(typingTimer.value)
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
