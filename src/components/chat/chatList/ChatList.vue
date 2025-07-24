<template>
  <div>
    <div class="flex border-b mb-2">
      <button
        class="flex-1 py-2 text-center font-semibold"
        :class="
          selectedTab === 'owner' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
        "
        @click="changeTab('owner')"
      >
        임대인
      </button>
      <button
        class="flex-1 py-2 text-center font-semibold"
        :class="
          selectedTab === 'buyer' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
        "
        @click="changeTab('buyer')"
      >
        임차인
      </button>
    </div>

    <div v-if="loading" class="p-4 text-center text-gray-500">
      <div
        class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto"
      ></div>
      <p class="mt-2">로딩 중...</p>
    </div>

    <div v-else-if="error" class="p-4 text-center text-red-500">
      <p>{{ error }}</p>
      <button
        @click="retryLoad"
        class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        다시 시도
      </button>
    </div>

    <div v-else-if="filteredRooms.length === 0" class="p-8 text-center text-gray-400">
      <p class="text-lg">채팅방이 없습니다</p>
      <p class="text-sm mt-1">새로운 대화를 시작해보세요!</p>
    </div>

    <div v-else class="divide-y divide-gray-100">
      <ChatItem
        v-for="(room, index) in filteredRooms"
        :key="`room-${room.chatRoomId}-${index}-${updateTrigger}-${room.lastMessage ? JSON.stringify(room.lastMessage).slice(0, 10) : 'none'}`"
        :room="room"
        @click="selectRoom(room)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import ChatItem from './ChatItem.vue'
import { getOwnerChatRooms, getBuyerChatRooms } from '@/components/chat/apis/chatApi'

const emit = defineEmits(['selectRoom'])

const ownerRooms = ref([])
const buyerRooms = ref([])
const selectedTab = ref('owner')
const loading = ref(false)
const error = ref(null)
const currentUserId = ref(null)
const updateTrigger = ref(0)

// 중복 메시지 처리 방지
const processedMessages = new Set()

const filteredRooms = computed(() => {
  // updateTrigger를 참조하여 강제 반응성 보장
  updateTrigger.value

  const rooms = selectedTab.value === 'owner' ? ownerRooms.value : buyerRooms.value
  const filtered = rooms.filter((room) => room && room.chatRoomId)

  console.log('🔍 filteredRooms 재계산:', {
    tab: selectedTab.value,
    totalRooms: rooms.length,
    filteredRooms: filtered.length,
    trigger: updateTrigger.value,
  })

  return filtered
})

// 강제 업데이트 트리거 (더 강력한 버전)
function triggerUpdate() {
  updateTrigger.value = Date.now()
  console.log('🔄 업데이트 트리거:', updateTrigger.value)

  // Vue.js의 다음 틱에서 한 번 더 트리거
  nextTick(() => {
    updateTrigger.value = Date.now() + 1
  })
}

// 탭 변경
function changeTab(tab) {
  selectedTab.value = tab
  if (tab === 'owner' && ownerRooms.value.length === 0) {
    loadOwnerRooms()
  } else if (tab === 'buyer' && buyerRooms.value.length === 0) {
    loadBuyerRooms()
  }
}

// 개별 API 호출 함수들
async function loadOwnerRooms() {
  try {
    const response = await getOwnerChatRooms()
    ownerRooms.value = sortRoomsByTime(response.data || [])
    console.log('임대인 채팅방 로드:', ownerRooms.value.length, '개')
  } catch (err) {
    console.error('임대인 채팅방 로드 오류:', err)
  }
}

async function loadBuyerRooms() {
  try {
    const response = await getBuyerChatRooms()
    buyerRooms.value = sortRoomsByTime(response.data || [])
    console.log('임차인 채팅방 로드:', buyerRooms.value.length, '개')
  } catch (err) {
    console.error('임차인 채팅방 로드 오류:', err)
  }
}

// 전체 채팅방 로드
async function loadChatRooms() {
  try {
    loading.value = true
    error.value = null

    await Promise.all([loadOwnerRooms(), loadBuyerRooms()])
    triggerUpdate()
  } catch (err) {
    error.value = '채팅방 목록을 불러올 수 없습니다.'
    console.error('채팅방 로드 오류:', err)
  } finally {
    loading.value = false
  }
}

// 시간순 정렬 헬퍼 함수
function sortRoomsByTime(rooms) {
  return rooms
    .filter((room) => room && room.chatRoomId)
    .sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.createdAt || 0)
      const timeB = new Date(b.lastMessageAt || b.createdAt || 0)
      return timeB - timeA
    })
}

// 방 선택 (중복 읽음 처리 제거)
function selectRoom(room) {
  if (!room || !room.chatRoomId) {
    console.error('유효하지 않은 채팅방:', room)
    return
  }

  // ❌ 자동 읽음 처리 제거 - ChatRoom에서 사용자가 실제로 메시지를 확인했을 때만 처리
  console.log('🏠 채팅방 선택:', room.chatRoomId)
  emit('selectRoom', room)
}

// 재시도
function retryLoad() {
  loadChatRooms()
}

// 새 메시지로 채팅방 업데이트 (중복 방지 강화)
function updateRoomLastMessage(chatRoomId, message, timestamp, senderId, unreadCountFromBackend) {
  const roomIdStr = String(chatRoomId)

  // 중복 메시지 체크 (메시지 내용 + 시간 + 보낸이로 중복 판별)
  const messageKey = `${roomIdStr}-${message}-${timestamp}-${senderId}`
  if (processedMessages.has(messageKey)) {
    console.log('⚠️ 중복 메시지 무시:', messageKey)
    return
  }

  // 중복 방지를 위해 키 저장 (최근 100개만 유지)
  processedMessages.add(messageKey)
  if (processedMessages.size > 100) {
    const firstKey = processedMessages.values().next().value
    processedMessages.delete(firstKey)
  }

  let wasUpdated = false

  const updateRoomList = (roomListRef) => {
    const index = roomListRef.value.findIndex((room) => String(room.chatRoomId) === roomIdStr)
    if (index === -1) return false

    const currentRoom = roomListRef.value[index]

    // 같은 메시지인지 체크 (타임스탬프와 내용 비교)
    if (currentRoom.lastMessage === message && currentRoom.lastMessageAt === timestamp) {
      console.log('⚠️ 동일한 메시지, 업데이트 건너뜀')
      return false
    }

    const updatedRoom = {
      ...currentRoom,
      lastMessage: message,
      lastMessageAt: timestamp || new Date().toISOString(),
      unreadMessageCount:
        unreadCountFromBackend !== undefined
          ? unreadCountFromBackend
          : currentRoom.unreadMessageCount || 0,
      _lastUpdated: Date.now(),
    }

    const newList = roomListRef.value.filter((room) => String(room.chatRoomId) !== roomIdStr)
    newList.unshift(updatedRoom)
    roomListRef.value = newList
    return true
  }

  if (updateRoomList(ownerRooms)) {
    wasUpdated = true
    console.log('✅ 임대인 방 업데이트 완료:', message)
  }

  if (updateRoomList(buyerRooms)) {
    wasUpdated = true
    console.log('✅ 임차인 방 업데이트 완료:', message)
  }

  if (wasUpdated) {
    triggerUpdate()
    nextTick(() => {
      console.log('🎯 DOM 업데이트 완료, filteredRooms:', filteredRooms.value.length)
    })
  } else {
    console.warn('⚠️ 해당 채팅방 없음 또는 중복 메시지')
  }
}

// 읽지 않은 메시지 수 초기화 (외부에서 명시적 호출시에만)
function markRoomAsRead(chatRoomId) {
  console.log('📖 명시적 읽음 처리:', chatRoomId)

  let wasMarked = false

  // 임대인 방에서 찾기
  const ownerRoomIndex = ownerRooms.value.findIndex((room) => room.chatRoomId === chatRoomId)
  if (ownerRoomIndex !== -1 && ownerRooms.value[ownerRoomIndex].unreadMessageCount > 0) {
    const newOwnerRooms = [...ownerRooms.value]
    newOwnerRooms[ownerRoomIndex] = {
      ...newOwnerRooms[ownerRoomIndex],
      unreadMessageCount: 0,
      _lastUpdated: Date.now(),
    }
    ownerRooms.value = newOwnerRooms
    wasMarked = true
  }

  // 임차인 방에서 찾기
  const buyerRoomIndex = buyerRooms.value.findIndex((room) => room.chatRoomId === chatRoomId)
  if (buyerRoomIndex !== -1 && buyerRooms.value[buyerRoomIndex].unreadMessageCount > 0) {
    const newBuyerRooms = [...buyerRooms.value]
    newBuyerRooms[buyerRoomIndex] = {
      ...newBuyerRooms[buyerRoomIndex],
      unreadMessageCount: 0,
      _lastUpdated: Date.now(),
    }
    buyerRooms.value = newBuyerRooms
    wasMarked = true
  }

  if (wasMarked) {
    triggerUpdate()
    console.log('✅ 읽음 처리 완료')
  }

  return wasMarked
}

// 웹소켓 메시지 핸들러 (STOMP 메시지 처리용) - 개선된 버전
function handleWebSocketMessage(message) {
  console.log('🌐 STOMP 메시지 수신:', message)

  try {
    let data

    // STOMP 메시지 처리
    if (message && message.body) {
      data = JSON.parse(message.body)
      console.log('📨 STOMP body 파싱:', data)
    } else if (typeof message === 'string') {
      data = JSON.parse(message)
      console.log('📨 문자열 파싱:', data)
    } else if (typeof message.data === 'string') {
      data = JSON.parse(message.data)
      console.log('📨 이벤트 데이터 파싱:', data)
    } else if (typeof message === 'object') {
      data = message
      console.log('📨 객체 직접 사용:', data)
    } else {
      console.warn('❌ 알 수 없는 메시지 형태:', message)
      return
    }

    console.log('📨 최종 파싱된 메시지:', data)

    // 메시지 타입별 처리
    if (data.type === 'CHAT_MESSAGE' && data.chatRoomId && data.content) {
      console.log('💬 채팅 메시지로 인식, 목록 업데이트 시작')

      updateRoomLastMessage(
        data.chatRoomId,
        data.content,
        data.sendTime,
        data.senderId,
        data.unreadMessageCount,
      )
    } else if (data.type === 'READ_STATUS' && data.chatRoomId) {
      // 읽음 상태 업데이트 메시지
      console.log('📖 읽음 상태 업데이트:', data)
      markRoomAsRead(data.chatRoomId)
    } else if (data.chatRoomId && data.content) {
      // 타입이 없어도 기본 채팅 메시지로 처리
      console.log('💬 기본 채팅 메시지로 처리')
      updateRoomLastMessage(
        data.chatRoomId,
        data.content,
        data.sendTime,
        data.senderId,
        data.unreadMessageCount,
      )
    } else {
      console.log('ℹ️ 기타 메시지 타입 또는 불완전한 데이터:', data)
    }
  } catch (err) {
    console.error('❌ 메시지 파싱 오류:', err)
    console.error('❌ 원본 메시지:', message)
  }
}

// 현재 사용자 ID 설정
function setCurrentUserId() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    currentUserId.value = userInfo.userId || userInfo.id
    console.log('👤 현재 사용자 ID 설정:', currentUserId.value)
  } catch (err) {
    console.error('❌ 사용자 정보 로드 실패:', err)
  }
}

// 주기적 새로고침 (백업용)
let refreshInterval = null

function stopPeriodicRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// 반응성 강화를 위한 watch
watch(
  [ownerRooms, buyerRooms],
  () => {
    triggerUpdate()
  },
  { deep: true },
)

// 컴포넌트 외부에서 접근 가능한 메서드들
defineExpose({
  updateRoomLastMessage,
  markRoomAsRead,
  refreshRooms: loadChatRooms,
})

onMounted(async () => {
  console.log('🚀 ChatRoomList 마운트됨')

  setCurrentUserId()
  loadChatRooms()

  // STOMP 웹소켓 구독을 위한 설정
  if (currentUserId.value) {
    await setupWebSocketSubscriptions()
  }
})

// 웹소켓 구독 설정
async function setupWebSocketSubscriptions() {
  try {
    // websocketService import 확인
    const { default: websocketService } = await import('@/components/chat/apis/websocket')

    console.log('🔌 websocketService를 사용한 구독 설정')

    // 연결 확인 및 대기
    if (!websocketService.getConnectionStatus()) {
      console.log('🔄 웹소켓 연결 대기 중...')
      await websocketService.connect()
    }

    // 사용자별 채팅방 목록 업데이트 토픽 구독
    const userTopic = `/topic/user/${currentUserId.value}/chatrooms`
    console.log('📡 사용자 토픽 구독:', userTopic)

    websocketService.onMessage(userTopic, (message) => {
      console.log('📨 사용자 토픽에서 메시지 수신:', message)
      handleWebSocketMessage({ body: JSON.stringify(message) })
    })

    // 전역 메시지 핸들러 등록 (모든 채팅방 메시지 수신)
    websocketService.onGlobalMessage((message) => {
      console.log('📨 전역 핸들러에서 메시지 수신:', message)
      // ChatMessageDocument 형태 확인
      if (message.chatRoomId && message.content && message.senderId) {
        console.log('💬 전역에서 채팅 메시지 감지, 목록 업데이트')
        updateRoomLastMessage(
          message.chatRoomId,
          message.content,
          message.sendTime,
          message.senderId,
        )
      }
    })

    console.log('✅ 웹소켓 구독 설정 완료')
  } catch (error) {
    console.error('❌ websocketService 로드 실패:', error)
    console.log('🔄 대체 방법 시도...')

    // 대체 방법: ChatRoom에서 메시지 전송 시 부모에게 알리기
    setupFallbackMethod()
  }
}

// 대체 방법: 부모 컴포넌트에서 직접 호출
function setupFallbackMethod() {
  console.log('🔄 대체 방법: 부모 컴포넌트 연동')

  // 부모 컴포넌트에서 직접 호출할 수 있도록 전역에 등록
  if (window) {
    // 채팅방 목록 업데이트
    window.updateChatRoomList = (chatRoomId, message, timestamp, senderId) => {
      console.log('🌍 전역 함수를 통한 채팅방 업데이트:', { chatRoomId, message, senderId })
      updateRoomLastMessage(chatRoomId, message, timestamp, senderId)
    }

    // 읽음 처리 (명시적 호출시에만)
    window.markChatRoomAsRead = (chatRoomId) => {
      console.log('🌍 전역 함수를 통한 읽음 처리:', chatRoomId)
      return markRoomAsRead(chatRoomId)
    }

    console.log('✅ 전역 업데이트 함수 등록 완료')
  }
}

onUnmounted(() => {
  console.log('🧹 ChatRoomList 언마운트됨')

  stopPeriodicRefresh()

  // 전역 함수 정리
  if (window) {
    if (window.updateChatRoomList) {
      delete window.updateChatRoomList
    }
    if (window.markChatRoomAsRead) {
      delete window.markChatRoomAsRead
    }
    console.log('🧹 전역 함수들 제거 완료')
  }
})
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}

.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
