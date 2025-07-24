<template>
  <div class="h-full flex flex-col">
    <!-- 상단 헤더 -->
    <RoomNav :room="room" />

    <!-- 채팅 메시지 영역 -->
    <div class="flex-1 overflow-y-auto p-4 bg-gray-50" ref="messagesContainer">
      <div v-if="loadingMessages" class="text-center text-gray-500">메시지 로딩 중...</div>

      <div v-else-if="messagesError" class="text-center text-red-500">
        {{ messagesError }}
      </div>

      <div v-else>
        <!-- 기존 메시지들 (API에서 로드된 메시지) -->
        <div
          v-for="message in apiMessages"
          :key="'api-' + message.id"
          class="mb-4"
          :class="{ 'text-right': isMyMessage(message) }"
        >
          <div
            class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
            :class="{
              'bg-blue-500 text-white': isMyMessage(message),
              'bg-white text-gray-800 border': !isMyMessage(message),
            }"
          >
            <div v-if="message.type === 'TEXT'">
              {{ message.content }}
            </div>
            <div v-else-if="message.type === 'FILE'">
              <a :href="message.fileUrl" target="_blank" class="underline"> 📎 파일 보기 </a>
            </div>
            <div class="text-xs mt-1 opacity-70 flex justify-between items-center">
              <span>{{ formatMessageTime(message.sendTime) }}</span>
              <span v-if="isMyMessage(message) && message.isRead" class="text-blue-300">읽음</span>
            </div>
          </div>
        </div>

        <!-- 실시간 메시지들 (WebSocket으로 받은 메시지) -->
        <div
          v-for="(message, index) in webSocketMessages"
          :key="'ws-' + (message.id || message.sendTime || index)"
          class="mb-4"
          :class="{ 'text-right': isMyMessage(message) }"
        >
          <div
            class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
            :class="{
              'bg-blue-500 text-white': isMyMessage(message),
              'bg-white text-gray-800 border': !isMyMessage(message),
            }"
          >
            <div v-if="message.type === 'TEXT'">
              {{ message.content }}
            </div>
            <div v-else-if="message.type === 'FILE'">
              <a :href="message.fileUrl" target="_blank" class="underline"> 📎 파일 보기 </a>
            </div>
            <div class="text-xs mt-1 opacity-70 flex justify-between items-center">
              <span>{{ formatMessageTime(message.sendTime) }}</span>
              <span v-if="isMyMessage(message) && message.isRead" class="text-blue-300">읽음</span>
            </div>
          </div>
        </div>

        <!-- 타이핑 상태 표시 -->
        <div v-if="isTyping" class="mb-4">
          <div class="inline-block bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
            <span class="typing-indicator">상대방이 입력 중...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <ChatInput @sendMessage="sendMessage" @typing="handleTyping" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import RoomNav from './RoomNav.vue'
import ChatInput from './ChatInput.vue'
import { getChatMessages, getCurrentUser } from '@/components/chat/apis/chatApi'
import websocketService from '../apis/websocket'

const props = defineProps({
  room: {
    type: Object,
    required: false,
    default: null,
  },
})

// API에서 로드된 기존 메시지들
const apiMessages = ref([])
const loadingMessages = ref(false)
const messagesError = ref(null)
const messagesContainer = ref(null)

// 사용자 상태 관리
const currentUserId = ref(null)
const userLoaded = ref(false)

// WebSocket 상태를 위한 반응형 변수
const webSocketMessages = ref([])
const isTyping = ref(false)
const isSendingMessage = ref(false)

// 스크롤 관련 상태
const hasInitiallyScrolled = ref(false)
const shouldScrollToBottom = ref(true)

// 읽음 처리 상태 관리
const hasMarkedAsRead = ref(false)
const readDebounceTimer = ref(null)

// 사용자 정보 로드
async function loadUserInfo() {
  try {
    console.log('👤 사용자 정보 로드 시작')
    const userInfo = await getCurrentUser()

    if (userInfo.success && userInfo.data.userId) {
      currentUserId.value = userInfo.data.userId
      userLoaded.value = true
      console.log('✅ 사용자 정보 로드 성공:', userInfo.data)
    } else {
      throw new Error('사용자 정보가 유효하지 않습니다.')
    }
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error)
  }
}

// 채팅방 정보
const chatRoomId = computed(() => props.room?.chatRoomId)
console.log('🥹🥹🥹🥹🥹🥹🥹chatRoomID', chatRoomId.value)

const roomData = computed(() => props.room)

// 채팅 준비 상태
const chatReady = computed(() => {
  const ready = userLoaded.value && currentUserId.value && chatRoomId.value && roomData.value
  console.log('🎯 Chat Ready:', {
    ready,
    userLoaded: userLoaded.value,
    currentUserId: currentUserId.value,
    chatRoomId: chatRoomId.value,
    roomData: !!roomData.value,
  })
  return ready
})

// 상대방 ID 계산
const getOtherUserId = () => {
  if (!roomData.value || !currentUserId.value) return null

  if (currentUserId.value === roomData.value.ownerId) {
    return roomData.value.buyerId
  } else if (currentUserId.value === roomData.value.buyerId) {
    return roomData.value.ownerId
  }

  return null
}

// 메시지 읽음 처리
const markMessageAsRead = async (message) => {
  try {
    console.log('📖 메시지 읽음 처리:', message.id)
    message.isRead = true
    console.log('✅ 메시지 읽음 처리 완료')
  } catch (error) {
    console.error('❌ 메시지 읽음 처리 실패:', error)
  }
}

// 채팅방 읽음 처리 (개선된 버전)
const markChatRoomAsRead = async (chatRoomId) => {
  // 이미 읽음 처리된 경우 중복 방지
  if (hasMarkedAsRead.value) {
    console.log('⚠️ 이미 읽음 처리됨, 건너뜀')
    return false
  }

  // 읽지 않은 메시지가 없으면 처리하지 않음
  if (!props.room?.unreadMessageCount || props.room.unreadMessageCount === 0) {
    console.log('⚠️ 읽지 않은 메시지 없음, 건너뜀')
    return false
  }

  try {
    console.log('📖 채팅방 읽음 처리:', chatRoomId)
    hasMarkedAsRead.value = true
  } catch (error) {
    console.error('❌ 채팅방 읽음 처리 실패:', error)
    hasMarkedAsRead.value = false // 실패시 상태 리셋
    return false
  }
}

const markChat = async (chatRoomId) => {
  // 백엔드 API 호출 - 올바른 경로로 수정
  try {
    const response = await fetch(`/api/chat/rooms/${chatRoomId}/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access-token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ 백엔드 읽음 처리 완료:', result)

      return true
    } else {
      const errorText = await response.text()
      console.warn('⚠️ 백엔드 읽음 처리 실패:', response.status, errorText)
      hasMarkedAsRead.value = false // 실패시 상태 리셋
      return false
    }
  } catch (apiError) {
    console.warn('⚠️ 백엔드 API 호출 실패:', apiError.message)
    hasMarkedAsRead.value = false // 실패시 상태 리셋
    return false
  }
}

// 디바운스된 읽음 처리 (스크롤시 너무 자주 호출되는 것 방지)
const debouncedMarkAsRead = () => {
  if (readDebounceTimer.value) {
    clearTimeout(readDebounceTimer.value)
  }

  readDebounceTimer.value = setTimeout(async () => {
    if (chatRoomId.value && props.room?.unreadMessageCount > 0) {
      await markChatRoomAsRead(chatRoomId.value)
    }
  }, 500) // 500ms 디바운스
}

// 온라인 상태 전송
const sendOnlineStatus = (isOnline) => {
  if (!currentUserId.value) return

  try {
    console.log('👤 온라인 상태 전송:', { userId: currentUserId.value, isOnline })

    websocketService.sendMessage('/app/user/online', {
      userId: currentUserId.value,
      isOnline: isOnline,
    })
  } catch (error) {
    console.error('❌ 온라인 상태 전송 실패:', error)
  }
}

// 스크롤을 맨 아래로 (개선된 버전)
function scrollToBottom(force = false) {
  if (!messagesContainer.value) return

  // 강제 스크롤이거나 아직 초기 스크롤을 하지 않은 경우
  if (force || !hasInitiallyScrolled.value || shouldScrollToBottom.value) {
    console.log('📜 스크롤을 맨 아래로 이동')

    const container = messagesContainer.value
    container.scrollTop = container.scrollHeight

    // 초기 스크롤 완료 표시
    if (!hasInitiallyScrolled.value) {
      hasInitiallyScrolled.value = true
      console.log('✅ 초기 스크롤 완료')
    }
  }
}

// 강제 스크롤 (즉시)
function forceScrollToBottom() {
  if (!messagesContainer.value) return

  const container = messagesContainer.value
  container.scrollTop = container.scrollHeight

  // 한 번 더 확실하게
  setTimeout(() => {
    container.scrollTop = container.scrollHeight
  }, 10)

  setTimeout(() => {
    container.scrollTop = container.scrollHeight
  }, 50)
}

// 사용자가 스크롤 위치에 있는지 확인 및 읽음 처리
function checkIfUserAtBottom() {
  if (!messagesContainer.value) return true

  const container = messagesContainer.value
  const threshold = 100 // 100px 임계값
  const isAtBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < threshold

  shouldScrollToBottom.value = isAtBottom

  // 사용자가 맨 아래로 스크롤했고, 읽지 않은 메시지가 있을 때만 읽음 처리
  if (isAtBottom && props.room?.unreadMessageCount > 0 && !hasMarkedAsRead.value) {
    console.log('📖 스크롤로 인한 읽음 처리 시도')
    debouncedMarkAsRead()
  }

  return isAtBottom
}

// WebSocket 메시지 핸들러
const directMessageHandler = (message) => {
  console.log('🔥🔥🔥 직접 메시지 핸들러 호출!')
  console.log('🔥 받은 메시지:', message)

  // 중복 메시지 체크
  const isDuplicate = webSocketMessages.value.some(
    (existingMsg) =>
      existingMsg.content === message.content &&
      existingMsg.sendTime === message.sendTime &&
      existingMsg.senderId === message.senderId,
  )

  if (isDuplicate) {
    console.log('⚠️ 중복 메시지 무시:', message)
    return
  }

  webSocketMessages.value.push(message)
  console.log('🔥 직접 추가 후 배열:', webSocketMessages.value)

  // 📖 내가 받은 메시지인 경우 즉시 읽음 처리
  if (
    message.receiverId === currentUserId.value &&
    !message.isRead &&
    message.chatRoomId === chatRoomId.value
  ) {
    markMessageAsRead(message)
  }

  // 새 메시지가 오면 스크롤
  nextTick(() => {
    if (shouldScrollToBottom.value) {
      scrollToBottom(true)
    }
  })
}

// 메시지 전송
async function sendMessage(content) {
  console.log('📤📤📤 ChatRoom 메시지 전송 시도:', {
    content,
    chatReady: chatReady.value,
    isSending: isSendingMessage.value,
  })

  // 중복 전송 방지
  if (isSendingMessage.value) {
    console.log('⚠️ 이미 전송 중입니다. 요청 무시.')
    return
  }

  if (!chatReady.value) {
    console.error('❌ 채팅방이 준비되지 않았습니다.')
    return
  }

  const receiverId = getOtherUserId()
  if (!receiverId) {
    console.error('❌ 상대방 ID를 찾을 수 없습니다')
    return
  }

  try {
    isSendingMessage.value = true // 전송 시작

    console.log('✅ 메시지 전송 조건 충족:', {
      chatRoomId: chatRoomId.value,
      senderId: currentUserId.value,
      receiverId,
      content,
    })

    const success = websocketService.sendChatMessage(
      chatRoomId.value,
      currentUserId.value,
      receiverId,
      content,
      'TEXT',
      null,
    )

    console.log('📤 메시지 전송 결과:', success)

    if (success) {
      // 내가 보낸 메시지이므로 무조건 스크롤
      shouldScrollToBottom.value = true
      nextTick(() => scrollToBottom(true))
    }
  } catch (error) {
    console.error('❌ 메시지 전송 중 오류:', error)
  } finally {
    // 전송 완료 후 상태 해제
    setTimeout(() => {
      isSendingMessage.value = false
    }, 1000)
  }
}

// 타이핑 상태 처리
function handleTyping(typing) {
  if (!chatRoomId.value || !currentUserId.value) return

  try {
    console.log('⌨️ 타이핑 상태 전송:', { chatRoomId: chatRoomId.value, typing })

    websocketService.sendMessage(`/app/chat/${chatRoomId.value}/typing`, {
      userId: currentUserId.value,
      isTyping: typing,
    })
  } catch (error) {
    console.error('❌ 타이핑 상태 전송 오류:', error)
  }
}

// API에서 기존 메시지 로드
async function loadMessages() {
  if (!props.room || !props.room.chatRoomId) {
    console.warn('⚠️ 채팅방 정보가 없습니다.')
    return
  }

  try {
    loadingMessages.value = true
    messagesError.value = null
    hasInitiallyScrolled.value = false // 초기 스크롤 상태 리셋

    console.log('📥 메시지 로드 시작:', props.room.chatRoomId)

    const response = await getChatMessages(props.room.chatRoomId)
    console.log('📥 API 응답:', response)

    apiMessages.value = response.data || []
    console.log('📥 로드된 메시지 수:', apiMessages.value.length)

    // 메시지 로드 후 스크롤을 맨 아래로 (여러 번 시도)
    await nextTick()

    // 즉시 스크롤
    forceScrollToBottom()

    // 좀 더 기다린 후 다시 스크롤 (DOM 완전 렌더링 대기)
    setTimeout(() => {
      forceScrollToBottom()
    }, 100)

    setTimeout(() => {
      forceScrollToBottom()
    }, 300)
  } catch (err) {
    console.error('❌ 메시지 로드 오류:', err)
    messagesError.value =
      '메시지를 불러올 수 없습니다: ' + (err.response?.data?.message || err.message)
  } finally {
    loadingMessages.value = false
  }
}

// 내 메시지인지 확인
function isMyMessage(message) {
  return message.senderId === currentUserId.value
}

// 메시지 시간 포맷팅
function formatMessageTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 스크롤 이벤트 리스너 추가
function addScrollListener() {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', checkIfUserAtBottom)
  }
}

// 스크롤 이벤트 리스너 제거
function removeScrollListener() {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', checkIfUserAtBottom)
  }
}

// chatReady 상태 변경 감지
watch(chatReady, async (ready, wasReady) => {
  console.log('🎯🎯🎯 chatReady 상태 변경:', { ready, wasReady })

  if (ready && !wasReady) {
    try {
      console.log('🔌 WebSocket 연결 시도...')
      await websocketService.connect()
      console.log('✅ WebSocket 연결 완료')

      // 온라인 상태 전송
      sendOnlineStatus(true)

      if (chatRoomId.value) {
        console.log('🔔 초기 채팅방 구독:', chatRoomId.value)
        const topic = `/topic/chatroom/${chatRoomId.value}`
        websocketService.onMessage(topic, directMessageHandler)
        console.log('✅ 초기 구독 완료')
      }
    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error)
    }
  }
})

// 채팅방 변경 감지
watch(
  () => props.room,
  async (newRoom, oldRoom) => {
    console.log('🔄🔄🔄 채팅방 변경:', {
      old: oldRoom?.chatRoomId,
      new: newRoom?.chatRoomId,
    })

    // 상태 초기화
    webSocketMessages.value = []
    hasInitiallyScrolled.value = false
    shouldScrollToBottom.value = true
    hasMarkedAsRead.value = false // 읽음 처리 상태 리셋

    // 디바운스 타이머 클리어
    if (readDebounceTimer.value) {
      clearTimeout(readDebounceTimer.value)
      readDebounceTimer.value = null
    }

    console.log('🧹 WebSocket 메시지 및 스크롤 상태 초기화 완료')

    // 이전 채팅방 구독 해제
    if (oldRoom?.chatRoomId) {
      console.log('🔕 이전 채팅방 구독 해제:', oldRoom.chatRoomId)
      websocketService.offMessage(`/topic/chatroom/${oldRoom.chatRoomId}`)
    }

    // 새 채팅방이 있고 채팅 준비가 완료되었을 때 구독
    if (newRoom?.chatRoomId && chatReady.value) {
      console.log('🔔🔔🔔 새 채팅방 즉시 구독 시도:', newRoom.chatRoomId)

      try {
        // WebSocket 연결 확인
        if (!websocketService.getConnectionStatus()) {
          console.log('🔌 WebSocket 재연결 시도...')
          await websocketService.connect()
        }

        const topic = `/topic/chatroom/${newRoom.chatRoomId}`
        console.log('📡 구독 등록:', topic)
        websocketService.onMessage(topic, directMessageHandler)
        console.log('✅ 새 채팅방 구독 완료!')

        // ❌ 자동 읽음 처리 제거 - 사용자가 실제로 스크롤해서 확인했을 때만
        // await markChatRoomAsRead(newRoom.chatRoomId)
      } catch (error) {
        console.error('❌ 새 채팅방 구독 실패:', error)
      }
    }

    loadMessages()
  },
  { immediate: true },
)

// WebSocket 메시지 변경 감지
watch(
  webSocketMessages,
  (newMessages, oldMessages) => {
    console.log('📺📺📺 webSocketMessages 변경 감지!')
    console.log('📺 이전 메시지 수:', oldMessages?.length || 0)
    console.log('📺 현재 메시지 수:', newMessages?.length || 0)

    if (newMessages.length > (oldMessages?.length || 0)) {
      console.log('📺🆕 새 메시지 감지됨 - DOM에 렌더링!')
      nextTick(() => {
        if (shouldScrollToBottom.value) {
          scrollToBottom(true)
        }
      })
    }
  },
  { immediate: true, deep: true },
)

// 컴포넌트 마운트 시
onMounted(async () => {
  console.log('🚀 ChatRoom 마운트됨')
  await loadUserInfo()
  addScrollListener()

  console.log('🎯 onMounted chatRoomId:', chatRoomId.value) // 이거 찍히는지 확인해봐!
  await markChat(chatRoomId.value) // <- `.value` 빠졌음!
})

// 컴포넌트 언마운트 시
onUnmounted(() => {
  console.log('🧹 ChatRoom 컴포넌트 정리 시작')

  removeScrollListener()

  // 디바운스 타이머 정리
  if (readDebounceTimer.value) {
    clearTimeout(readDebounceTimer.value)
  }

  // 오프라인 상태 전송
  if (currentUserId.value) {
    sendOnlineStatus(false)
  }

  if (chatRoomId.value) {
    console.log('🔕 언마운트 시 구독 해제:', chatRoomId.value)
    websocketService.offMessage(`/topic/chatroom/${chatRoomId.value}`)
  }

  webSocketMessages.value = []
  console.log('🧹 ChatRoom 컴포넌트 정리 완료')
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

/* 스크롤바 스타일링 */
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
</style>
