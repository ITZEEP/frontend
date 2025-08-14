<template>
  <div class="flex gap-4 items-center bg-white px-4 py-2 rounded-lg">
    <!-- 임대인 -->
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full transition-colors" :class="ownerDotClass"></span>
      <img src="@/assets/images/character/panda_face.svg" alt="임대인" class="w-5 h-5" />
      <span class="text-sm font-medium" :class="ownerTextClass">임대인</span>
      <span class="text-xs text-gray-500">
        {{ ownerIn ? '입장' : '미입장' }}
      </span>
    </div>

    <!-- 임차인 -->
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full transition-colors" :class="buyerDotClass"></span>
      <img src="@/assets/images/character/lion_face.svg" alt="임차인" class="w-5 h-5" />
      <span class="text-sm font-medium" :class="buyerTextClass">임차인</span>
      <span class="text-xs text-gray-500">
        {{ buyerIn ? '입장' : '미입장' }}
      </span>
    </div>

    <!-- AI -->
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-blue-500 ai-glow"></span>
      <img src="@/assets/images/character/ai_face.svg" alt="AI 어시스턴트" class="w-5 h-5" />
      <span class="text-sm font-medium text-blue-600">AI 어시스턴트 뀨</span>
      <span class="text-xs text-gray-500">활성</span>
    </div>

    <!-- (선택) 둘 다 접속/채팅 가능 -->
    <div class="ml-auto text-xs" v-if="!loading && !error">
      <span
        class="px-2 py-1 rounded-md"
        :class="bothIn ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
      >
        {{ bothIn ? '둘 다 접속 중' : '대기 중' }}
      </span>
      <span
        class="ml-2 px-2 py-1 rounded-md"
        :class="canChat ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'"
      >
        {{ canChat ? '대화 가능' : '대화 불가' }}
      </span>
    </div>

    <!-- (선택) 로딩/에러 -->
    <div class="ml-auto text-xs text-gray-500" v-if="loading">상태 확인 중...</div>
    <div class="ml-auto text-xs text-red-500" v-else-if="error">상태 조회 실패</div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getContractChatOnlineStatus } from '@/apis/contractChatApi'

const props = defineProps({
  contractChatId: { type: [String, Number], required: true },
  pollIntervalMs: { type: Number, default: 10000 }, // 0이면 폴링 끔
  refreshDebounceMs: { type: Number, default: 400 }, // 이벤트 디바운스
  useBroadcast: { type: Boolean, default: true }, // 탭 간 동기화
})

const ownerIn = ref(false)
const buyerIn = ref(false)
const bothIn = ref(false)
const canChat = ref(false)
const loading = ref(false)
const error = ref(false)

const ownerDotClass = computed(() => (ownerIn.value ? 'bg-green-500 shadow' : 'bg-gray-300'))
const buyerDotClass = computed(() => (buyerIn.value ? 'bg-green-500 shadow' : 'bg-gray-300'))
const ownerTextClass = computed(() => (ownerIn.value ? 'text-green-700' : 'text-gray-600'))
const buyerTextClass = computed(() => (buyerIn.value ? 'text-green-700' : 'text-gray-600'))

let pollTimer = null
let debounceTimer = null
let bc = null

const refreshEventName = computed(() => `contract:presence-refresh:${props.contractChatId}`)

async function fetchPresence() {
  if (!props.contractChatId) return
  loading.value = true
  error.value = false
  try {
    const res = await getContractChatOnlineStatus(props.contractChatId)
    // ✅ 너가 말한대로, wrapper가 res.data를 반환하므로 여기서 내부 data를 바로 꺼냄
    const d = res?.data
    ownerIn.value = !!d?.ownerInContractRoom
    buyerIn.value = !!d?.buyerInContractRoom
    bothIn.value = !!d?.bothInRoom
    canChat.value = !!d?.canChat
  } catch (e) {
    error.value = true
    console.log(e)
  } finally {
    loading.value = false
  }
}

function startPolling() {
  stopPolling()
  if (props.pollIntervalMs > 0) {
    pollTimer = setInterval(fetchPresence, props.pollIntervalMs)
  }
}
function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
}

function debouncedRefresh() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchPresence, props.refreshDebounceMs)
}

function onCustomRefresh() {
  debouncedRefresh()
}
function onVisibility() {
  if (document.visibilityState === 'visible') debouncedRefresh()
}
function onFocus() {
  debouncedRefresh()
}

watch(
  () => props.contractChatId,
  () => {
    fetchPresence()
    startPolling()
  },
  { immediate: true },
)

onMounted(() => {
  fetchPresence()
  startPolling()

  // 1) 커스텀 이벤트로 즉시 리프레시
  window.addEventListener(refreshEventName.value, onCustomRefresh)

  // 2) 탭이 다시 보일 때/포커스 올 때 리프레시
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('focus', onFocus)

  // 3) (선택) 탭 간 동기화: BroadcastChannel
  if (props.useBroadcast && 'BroadcastChannel' in window) {
    bc = new BroadcastChannel(`contract-room-${props.contractChatId}`)
    bc.onmessage = (ev) => {
      if (ev?.data === 'presence-refresh') debouncedRefresh()
    }
  }
})

onUnmounted(() => {
  stopPolling()
  window.removeEventListener(refreshEventName.value, onCustomRefresh)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('focus', onFocus)
  if (bc) bc.close()
})
</script>
