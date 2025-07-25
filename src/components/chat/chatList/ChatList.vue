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
        v-for="room in filteredRooms"
        :key="`room-${room.chatRoomId}-${room._lastUpdated || 0}`"
        :room="room"
        @click="selectRoom(room)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, provide } from 'vue'
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

// 현재 선택된 채팅방 ID 추적
const currentChatRoomId = ref(null)

// 자식 컴포넌트(ChatItem)에 현재 채팅방 ID 제공
provide('currentChatRoomId', currentChatRoomId)

// 중복 메시지 처리 방지
const processedMessages = new Set()

const filteredRooms = computed(() => {
  // updateTrigger를 참조하여 강제 반응성 보장
  updateTrigger.value

  const rooms = selectedTab.value === 'owner' ? ownerRooms.value : buyerRooms.value
  const filtered = rooms.filter((room) => room && room.chatRoomId)
  return filtered
})

// 강제 업데이트 트리거
function triggerUpdate() {
  updateTrigger.value = Date.now()
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
  } catch (err) {
    console.error('임대인 채팅방 로드 오류:', err)
  }
}

async function loadBuyerRooms() {
  try {
    const response = await getBuyerChatRooms()
    buyerRooms.value = sortRoomsByTime(response.data || [])
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

// 방 선택 (현재 채팅방 ID 업데이트)
function selectRoom(room) {
  if (!room || !room.chatRoomId) {
    console.error('유효하지 않은 채팅방:', room)
    return
  }

  // 현재 선택된 채팅방 ID 업데이트
  currentChatRoomId.value = room.chatRoomId

  emit('selectRoom', room)
}

// 재시도
function retryLoad() {
  loadChatRooms()
}

// 핵심 수정: 직접 객체 속성 변경으로 반응성 보장
function updateRoomLastMessage(chatRoomId, message, timestamp, senderId, unreadCountFromBackend) {
  const roomIdStr = String(chatRoomId)

  // 중복 메시지 체크
  const messageKey = `${roomIdStr}-${message}-${timestamp}`
  if (processedMessages.has(messageKey)) {
    return
  }

  processedMessages.add(messageKey)
  if (processedMessages.size > 100) {
    const firstKey = processedMessages.values().next().value
    processedMessages.delete(firstKey)
  }

  let wasUpdated = false
  const currentTime = Date.now()

  // 핵심 수정: 직접 객체 속성 변경 + 정렬
  const updateRoomList = (roomListRef, listName) => {
    const roomIndex = roomListRef.value.findIndex((room) => String(room.chatRoomId) === roomIdStr)
    if (roomIndex === -1) {
      return false
    }

    const targetRoom = roomListRef.value[roomIndex]

    // 같은 메시지인지 체크
    if (targetRoom.lastMessage === message && targetRoom.lastMessageAt === timestamp) {
      return false
    }

    // 직접 속성 변경 (Vue 반응성 시스템이 감지)
    targetRoom.lastMessage = message
    targetRoom.lastMessageAt = timestamp || new Date().toISOString()
    targetRoom.unreadMessageCount =
      unreadCountFromBackend !== undefined
        ? unreadCountFromBackend
        : targetRoom.unreadMessageCount || 0
    targetRoom._lastUpdated = currentTime

    // 최신 메시지를 맨 위로 이동 (시간 순 정렬 유지)
    if (roomIndex !== 0) {
      const updatedRoom = roomListRef.value.splice(roomIndex, 1)[0]
      roomListRef.value.unshift(updatedRoom)
    }

    console.log(`${listName} 업데이트 완료:`, targetRoom.lastMessage)
    return true
  }

  // 두 목록 모두 업데이트 시도
  if (updateRoomList(ownerRooms, '임대인')) {
    wasUpdated = true
  }

  if (updateRoomList(buyerRooms, '임차인')) {
    wasUpdated = true
  }

  if (wasUpdated) {
    console.log('업데이트 완료, 반응성 트리거')
    triggerUpdate()
  } else {
    console.warn('해당 채팅방 없음 또는 중복 메시지')
  }
}

// 읽지 않은 메시지 수 초기화
function markRoomAsRead(chatRoomId) {
  let wasMarked = false
  const currentTime = Date.now()

  // 직접 속성 변경으로 반응성 보장
  const ownerRoom = ownerRooms.value.find((room) => room.chatRoomId === chatRoomId)
  if (ownerRoom && ownerRoom.unreadMessageCount > 0) {
    ownerRoom.unreadMessageCount = 0
    ownerRoom._lastUpdated = currentTime
    wasMarked = true
  }

  const buyerRoom = buyerRooms.value.find((room) => room.chatRoomId === chatRoomId)
  if (buyerRoom && buyerRoom.unreadMessageCount > 0) {
    buyerRoom.unreadMessageCount = 0
    buyerRoom._lastUpdated = currentTime
    wasMarked = true
  }

  if (wasMarked) {
    triggerUpdate()
  }

  return wasMarked
}

// 웹소켓 메시지 핸들러
function handleWebSocketMessage(message) {
  try {
    let data

    if (message && message.body) {
      data = JSON.parse(message.body)
    } else if (typeof message === 'string') {
      data = JSON.parse(message)
    } else if (typeof message.data === 'string') {
      data = JSON.parse(message.data)
    } else if (typeof message === 'object') {
      data = message
    } else {
      console.warn('알 수 없는 메시지 형태:', message)
      return
    }

    // ChatRoomUpdateDto 구조 확인
    if (data.roomId !== undefined && data.lastMessage !== undefined) {
      updateRoomLastMessage(
        data.roomId,
        data.lastMessage,
        data.timestamp,
        data.senderId,
        data.unreadCount,
      )
    }
    // 일반 채팅 메시지 처리
    else if (data.chatRoomId && data.content) {
      updateRoomLastMessage(
        data.chatRoomId,
        data.content,
        data.sendTime,
        data.senderId,
        data.unreadCount,
      )
    }
    // 읽음 상태 업데이트 처리
    else if (data.type === 'READ_STATUS' && data.chatRoomId) {
      markRoomAsRead(data.chatRoomId)
    } else {
      console.log('ℹ기타 메시지 타입:', data)
    }
  } catch (err) {
    console.error('메시지 파싱 오류:', err)
  }
}

// 현재 사용자 ID 설정 (API 호출로 변경)
async function setCurrentUserId() {
  try {
    // 먼저 localStorage에서 시도
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (userInfo.userId || userInfo.id) {
      currentUserId.value = userInfo.userId || userInfo.id
      return
    }

    // localStorage에 없으면 API 호출
    const { getCurrentUser } = await import('@/components/chat/apis/chatApi')
    const response = await getCurrentUser()

    if (response.success && response.data.userId) {
      currentUserId.value = response.data.userId
      console.log('API에서 사용자 ID 설정:', currentUserId.value)
    } else {
      console.error('API에서 사용자 정보 로드 실패')
    }
  } catch (err) {
    console.error('사용자 정보 로드 실패:', err)
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
  setCurrentChatRoom: (roomId) => {
    currentChatRoomId.value = roomId
  },
})

// 웹소켓 구독 설정
async function setupWebSocketSubscriptions() {
  try {
    const { default: websocketService } = await import('@/components/chat/apis/websocket')
    if (!websocketService.getConnectionStatus()) {
      await websocketService.connect()
    }

    // 사용자별 채팅방 목록 업데이트 토픽 구독
    const userTopic = `/topic/user/${currentUserId.value}/chatrooms`
    console.log('사용자 구독:', userTopic)

    websocketService.onMessage(userTopic, (message) => {
      console.log('사용자 토픽에서 메시지 수신:', message)

      // ChatRoomUpdateDto 구조에 맞게 직접 처리
      if (message.roomId !== undefined && message.lastMessage !== undefined) {
        updateRoomLastMessage(
          message.roomId,
          message.lastMessage,
          message.timestamp,
          message.senderId,
          message.unreadCount,
        )
      } else {
        handleWebSocketMessage({ body: JSON.stringify(message) })
      }
    })
  } catch (error) {
    console.error('websocketService 로드 실패:', error)
    setupFallbackMethod()
  }
}

// 대체 방법: 전역 함수 등록
function setupFallbackMethod() {
  if (window) {
    window.updateChatRoomList = (chatRoomId, message, timestamp, senderId, unreadCount) => {
      updateRoomLastMessage(chatRoomId, message, timestamp, senderId, unreadCount)
    }

    window.markChatRoomAsRead = (chatRoomId) => {
      return markRoomAsRead(chatRoomId)
    }
  }
}

onMounted(async () => {
  await setCurrentUserId() // await 추가
  await loadChatRooms() // await 추가

  if (currentUserId.value) {
    await setupWebSocketSubscriptions()
  } else {
    console.error('사용자 ID가 없어서 WebSocket 구독 불가')
  }
})

onUnmounted(() => {
  if (window) {
    if (window.updateChatRoomList) {
      delete window.updateChatRoomList
    }
    if (window.markChatRoomAsRead) {
      delete window.markChatRoomAsRead
    }
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
