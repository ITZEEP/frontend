<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 상단 탭 메뉴 - 채팅 목록 영역 내부에만 표시 -->
    <div class="bg-white border-b sticky top-0 z-10">
      <div class="flex">
        <button
          class="flex-1 py-3 px-4 text-center relative transition-all text-sm md:text-base"
          :class="{
            'text-gray-900 font-semibold': selectedTab === 'owner',
            'text-gray-500': selectedTab !== 'owner'
          }"
          @click="changeTab('owner')"
        >
          내가 파는 매물
          <div 
            v-if="selectedTab === 'owner'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-primary"
          ></div>
        </button>
        <button
          class="flex-1 py-3 px-4 text-center relative transition-all text-sm md:text-base"
          :class="{
            'text-gray-900 font-semibold': selectedTab === 'buyer',
            'text-gray-500': selectedTab !== 'buyer'
          }"
          @click="changeTab('buyer')"
        >
          내가 사는 매물
          <div 
            v-if="selectedTab === 'buyer'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-primary"
          ></div>
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-4 text-center text-gray-500">
      <div
        class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-yellow-primary rounded-full mx-auto"
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

    <div v-else-if="filteredRooms.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <p class="text-lg font-medium mb-1">채팅방이 없습니다</p>
        <p class="text-sm">새로운 대화를 시작해보세요!</p>
      </div>
    </div>

    <!-- 카카오톡 스타일 채팅 목록 -->
    <div v-else class="flex-1 overflow-y-auto">
      <ChatItem
        v-for="room in filteredRooms"
        :key="`room-${room.chatRoomId}-${room._lastUpdated || 0}`"
        :room="room"
        @click="selectRoom(room)"
        class="kakao-chat-item"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, provide } from 'vue'
import ChatItem from './ChatItem.vue'
import { getOwnerChatRooms, getBuyerChatRooms } from '@/apis/chatApi'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  initialRoomId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['selectRoom'])

const ownerRooms = ref([])
const buyerRooms = ref([])
const selectedTab = ref('owner')
const loading = ref(false)
const error = ref(null)
const currentUserId = ref(null)
const updateTrigger = ref(0)
const router = useRouter()
const route = useRoute()

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

// 탭 변경 함수
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

function sortRoomsByTime(rooms) {
  return rooms
    .filter((room) => room && room.chatRoomId)
    .sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.createdAt || 0)
      const timeB = new Date(b.lastMessageAt || b.createdAt || 0)
      return timeB - timeA
    })
}

function selectRoom(room) {
  if (!room || !room.chatRoomId) {
    console.error('유효하지 않은 채팅방:', room)
    return
  }

  if (currentChatRoomId.value === room.chatRoomId) {
    console.log('현재 채팅방 재클릭 - 채팅방 나가기')

    emit('selectRoom', null)

    router.push({
      path: route.path,
      query: { ...route.query, roomId: undefined },
    })

    setTimeout(() => {
      handleLeaveChatRoom(room.chatRoomId)
      cleanupChatRoomSubscriptions(room.chatRoomId)
      currentChatRoomId.value = null
    }, 100)

    return
  }

  console.log('새 채팅방 선택:', room.chatRoomId)

  if (currentChatRoomId.value) {
    const previousRoomId = currentChatRoomId.value
    emit('selectRoom', null)

    setTimeout(() => {
      handleLeaveChatRoom(previousRoomId)
      cleanupChatRoomSubscriptions(previousRoomId)

      // 새 채팅방 선택
      currentChatRoomId.value = room.chatRoomId
      markRoomAsRead(room.chatRoomId)
      emit('selectRoom', room)

      router.push({
        path: route.path,
        query: { ...route.query, roomId: room.chatRoomId },
      })
    }, 100)
  } else {
    currentChatRoomId.value = room.chatRoomId
    markRoomAsRead(room.chatRoomId)
    emit('selectRoom', room)

    router.push({
      path: route.path,
      query: { ...route.query, roomId: room.chatRoomId },
    })
  }
}

async function cleanupChatRoomSubscriptions(chatRoomId) {
  try {
    const { default: websocketService } = await import('@/apis/websocket')

    const topicsToCleanup = [
      `/topic/chatroom/${chatRoomId}`,
      `/topic/chatroom/${chatRoomId}/typing`,
      `/topic/chatroom/${chatRoomId}/status`,
    ]

    topicsToCleanup.forEach((topic) => {
      websocketService.offMessage(topic)
      console.log('🧹 토픽 구독 정리:', topic)
    })
  } catch (error) {
    console.error('채팅방 구독 정리 실패:', error)
  }
}

async function handleLeaveChatRoom(chatRoomId) {
  if (!currentUserId.value || !chatRoomId) return

  try {
    console.log('ChatList에서 명확한 채팅방 퇴장 처리:', {
      userId: currentUserId.value,
      chatRoomId: chatRoomId,
    })

    const { default: websocketService } = await import('@/apis/websocket')

    websocketService.sendMessage('/app/user/online', {
      userId: currentUserId.value,
      isOnline: false,
      chatRoomId: chatRoomId,
    })

    websocketService.sendMessage('/app/chat/leave', {
      userId: currentUserId.value,
      chatRoomId: chatRoomId,
    })
  } catch (error) {
    console.error('채팅방 퇴장 알림 실패:', error)
  }
}

// 재시도
function retryLoad() {
  loadChatRooms()
}

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

  const isCurrentRoom = String(currentChatRoomId.value) === roomIdStr

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

    if (message && message !== targetRoom.lastMessage) {
      targetRoom.lastMessage = message

      if (timestamp) {
        targetRoom.lastMessageAt = timestamp
      } else if (!targetRoom.lastMessageAt) {
        targetRoom.lastMessageAt = new Date().toISOString()
      }
    }

    if (isCurrentRoom) {
      targetRoom.unreadMessageCount = 0
      console.log(`현재 접속 중인 채팅방 ${roomIdStr} - 읽지 않은 메시지 수 0으로 유지`)
    } else {
      targetRoom.unreadMessageCount =
        unreadCountFromBackend !== undefined
          ? unreadCountFromBackend
          : (targetRoom.unreadMessageCount || 0) + 1
      console.log(
        `접속하지 않은 채팅방 ${roomIdStr} - 읽지 않은 메시지 수: ${targetRoom.unreadMessageCount}`,
      )
    }

    targetRoom._lastUpdated = currentTime

    // 새로운 메시지가 있을 때만 순서 변경 (단순 읽음 처리는 제외)
    if (message && message !== '' && roomIndex !== 0) {
      const updatedRoom = roomListRef.value.splice(roomIndex, 1)[0]
      roomListRef.value.unshift(updatedRoom)
    }

    console.log(`${listName} 업데이트 완료:`, targetRoom.lastMessage)
    return true
  }

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

function markRoomAsRead(chatRoomId) {
  let wasMarked = false

  // 직접 속성 변경으로 반응성 보장 - _lastUpdated는 변경하지 않음 (순서 유지)
  const ownerRoom = ownerRooms.value.find((room) => room.chatRoomId === chatRoomId)
  if (ownerRoom && ownerRoom.unreadMessageCount > 0) {
    ownerRoom.unreadMessageCount = 0
    wasMarked = true
  }

  const buyerRoom = buyerRooms.value.find((room) => room.chatRoomId === chatRoomId)
  if (buyerRoom && buyerRoom.unreadMessageCount > 0) {
    buyerRoom.unreadMessageCount = 0
    wasMarked = true
  }

  if (wasMarked) {
    triggerUpdate()
  }

  return wasMarked
}

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

    if (data.roomId !== undefined && data.lastMessage !== undefined) {
      updateRoomLastMessage(
        data.roomId,
        data.lastMessage,
        data.timestamp,
        data.senderId,
        data.unreadCount,
      )
    } else if (data.chatRoomId && data.content) {
      updateRoomLastMessage(
        data.chatRoomId,
        data.content,
        data.sendTime,
        data.senderId,
        data.unreadCount,
      )
    } else if (data.type === 'READ_STATUS' && data.chatRoomId) {
      markRoomAsRead(data.chatRoomId)
    } else {
      console.log('ℹ기타 메시지 타입:', data)
    }
  } catch (err) {
    console.error('메시지 파싱 오류:', err)
  }
}

async function setCurrentUserId() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (userInfo.userId || userInfo.id) {
      currentUserId.value = userInfo.userId || userInfo.id
      return
    }

    const { getCurrentUser } = await import('@/apis/chatApi')
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

watch(
  [ownerRooms, buyerRooms],
  () => {
    triggerUpdate()
  },
  { deep: true },
)

defineExpose({
  updateRoomLastMessage,
  markRoomAsRead,
  refreshRooms: loadChatRooms,
  setCurrentChatRoom: (roomId) => {
    currentChatRoomId.value = roomId
  },
})

async function setupWebSocketSubscriptions() {
  try {
    const { default: websocketService } = await import('@/apis/websocket')
    if (!websocketService.getConnectionStatus()) {
      await websocketService.connect()
    }

    const userTopic = `/topic/user/${currentUserId.value}/chatrooms`
    console.log('사용자 구독:', userTopic)

    websocketService.onMessage(userTopic, (message) => {
      console.log('사용자 토픽에서 메시지 수신:', message)

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

// 초기 채팅방 선택 함수
async function selectInitialRoom() {
  if (!props.initialRoomId) return

  // 모든 채팅방에서 initialRoomId와 일치하는 방 찾기
  const findAndSelectRoom = () => {
    const allRooms = [...ownerRooms.value, ...buyerRooms.value]
    const targetRoom = allRooms.find(
      (room) => String(room.chatRoomId) === String(props.initialRoomId),
    )

    if (targetRoom) {
      console.log('초기 채팅방 찾음:', targetRoom)
      selectRoom(targetRoom)

      // 해당 채팅방이 있는 탭으로 자동 전환 - 부모 컴포넌트에서 처리

      return true
    }
    return false
  }

  // 즉시 시도
  if (findAndSelectRoom()) return

  // 데이터 로드 후 재시도 (최대 3초 대기)
  let retryCount = 0
  const maxRetries = 6
  const retryInterval = setInterval(() => {
    if (findAndSelectRoom() || retryCount >= maxRetries) {
      clearInterval(retryInterval)
      if (retryCount >= maxRetries) {
        console.warn('초기 채팅방을 찾을 수 없습니다:', props.initialRoomId)
      }
    }
    retryCount++
  }, 500)
}

onMounted(async () => {
  await setCurrentUserId()
  await loadChatRooms()

  // 초기 채팅방 선택
  if (props.initialRoomId) {
    await selectInitialRoom()
  }

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
