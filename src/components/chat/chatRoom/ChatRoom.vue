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
              'bg-yellow-primary text-white': isMyMessage(message),
              'bg-white text-gray-800 border': !isMyMessage(message),
            }"
          >
            <!-- 텍스트 메시지 -->
            <div v-if="message.type === 'TEXT'">
              {{ message.content }}
            </div>

            <!-- 파일 메시지 -->
            <div v-else-if="message.type === 'FILE'" class="space-y-2">
              <!-- 이미지 파일 -->
              <div v-if="isImageFile(message.fileUrl)" class="space-y-2">
                <img
                  :src="message.fileUrl"
                  :alt="message.content"
                  class="max-w-60 max-h-60 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(message.fileUrl, message.content)"
                  @error="handleImageError"
                />
                <div class="text-xs opacity-75">{{ message.content }}</div>
              </div>

              <!-- 동영상 파일 -->
              <div v-else-if="isVideoFile(message.fileUrl)" class="space-y-2">
                <video controls class="max-w-60 max-h-60 rounded-lg">
                  <source :src="message.fileUrl" type="video/mp4" />
                  <source :src="message.fileUrl" type="video/webm" />
                  <source :src="message.fileUrl" type="video/ogg" />
                  동영상을 재생할 수 없습니다.
                </video>
                <div class="text-xs opacity-75">{{ message.content }}</div>
              </div>

              <!-- 일반 파일 -->
              <div v-else class="flex items-center space-x-2 py-1">
                <span class="text-lg">{{ getFileIcon(message.content) }}</span>
                <a
                  :href="message.fileUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline hover:text-blue-300 transition-colors break-all"
                >
                  {{ message.content }}
                </a>
              </div>
            </div>

            <div class="text-xs mt-1 opacity-70 flex justify-between items-center">
              <span>{{ formatMessageTime(message.sendTime) }}</span>
              <span v-if="isMyMessage(message) && message.isRead" class="text-white ml-2"
                >읽음</span
              >
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
              'bg-yellow-primary text-white': isMyMessage(message),
              'bg-white text-gray-800 border': !isMyMessage(message),
            }"
          >
            <!-- 텍스트 메시지 -->
            <div v-if="message.type === 'TEXT'">
              {{ message.content }}
            </div>

            <!-- 파일 메시지 -->
            <div v-else-if="message.type === 'FILE'" class="space-y-2">
              <!-- 이미지 파일 -->
              <div v-if="isImageFile(message.fileUrl)" class="space-y-2">
                <img
                  :src="message.fileUrl"
                  :alt="message.content"
                  class="max-w-60 max-h-60 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  @click="openImageModal(message.fileUrl, message.content)"
                  @error="handleImageError"
                />
                <div class="text-xs opacity-75">{{ message.content }}</div>
              </div>

              <!-- 동영상 파일 -->
              <div v-else-if="isVideoFile(message.fileUrl)" class="space-y-2">
                <video controls class="max-w-60 max-h-60 rounded-lg">
                  <source :src="message.fileUrl" type="video/mp4" />
                  <source :src="message.fileUrl" type="video/webm" />
                  <source :src="message.fileUrl" type="video/ogg" />
                  동영상을 재생할 수 없습니다.
                </video>
                <div class="text-xs opacity-75">{{ message.content }}</div>
              </div>

              <!-- 일반 파일 -->
              <div v-else class="flex items-center space-x-2 py-1">
                <span class="text-lg">{{ getFileIcon(message.content) }}</span>
                <a
                  :href="message.fileUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline hover:text-blue-300 transition-colors break-all"
                >
                  {{ message.content }}
                </a>
              </div>
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
    <ChatInput
      @sendMessage="sendMessage"
      @typing="handleTyping"
      :chatRoomId="chatRoomId"
      :receiverId="getOtherUserId()"
    />

    <!-- 이미지 확대 모달 -->
    <div
      v-if="imageModal.show"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl max-h-4xl p-4">
        <img
          :src="imageModal.src"
          :alt="imageModal.alt"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        <button
          @click="closeImageModal"
          class="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70"
        >
          ✕
        </button>
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {{ imageModal.alt }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import RoomNav from './RoomNav.vue'
import ChatInput from './ChatInput.vue'
import { getChatMessages, getCurrentUser, markChatRoomAsRead } from '@/apis/chatApi'
import websocketService from '../../../apis/websocket'

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

// 이미지 모달 상태
const imageModal = ref({
  show: false,
  src: '',
  alt: '',
})

// 파일 타입 확인 함수들
function isImageFile(url) {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  const urlLower = url.toLowerCase()
  return imageExtensions.some((ext) => urlLower.includes(ext))
}

function isVideoFile(url) {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv']
  const urlLower = url.toLowerCase()
  return videoExtensions.some((ext) => urlLower.includes(ext))
}

function getFileIcon(fileName) {
  if (!fileName) return '📄'

  const extension = fileName.toLowerCase().split('.').pop()

  const iconMap = {
    // 문서 파일
    pdf: '📕',
    doc: '📄',
    docx: '📄',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    txt: '📝',

    // 압축 파일
    zip: '🗜️',
    rar: '🗜️',
    '7z': '🗜️',

    // 코드 파일
    js: '📜',
    html: '📜',
    css: '📜',
    java: '☕',
    py: '🐍',
    cpp: '⚙️',

    // 음악 파일
    mp3: '🎵',
    wav: '🎵',
    flac: '🎵',

    // 기타
    exe: '⚙️',
    dmg: '💿',
    iso: '💿',
  }

  return iconMap[extension] || '📄'
}

function openImageModal(src, alt) {
  imageModal.value = {
    show: true,
    src: src,
    alt: alt,
  }
}

function closeImageModal() {
  imageModal.value = {
    show: false,
    src: '',
    alt: '',
  }
}

function handleImageError(event) {
  console.error('이미지 로드 실패:', event.target.src)
}

// 사용자 정보 로드
async function loadUserInfo() {
  try {
    const userInfo = await getCurrentUser()

    if (userInfo.success && userInfo.data.userId) {
      currentUserId.value = userInfo.data.userId
      userLoaded.value = true
    } else {
      throw new Error('사용자 정보가 유효하지 않습니다.')
    }
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error)
  }
}

// 채팅방 정보
const chatRoomId = computed(() => props.room?.chatRoomId)
const roomData = computed(() => props.room)

// 채팅 준비 상태
const chatReady = computed(() => {
  const ready = userLoaded.value && currentUserId.value && chatRoomId.value && roomData.value
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

// 채팅방 입장 WebSocket 알림 (핵심!)
const notifyEnterChatRoom = () => {
  if (!chatRoomId.value || !currentUserId.value) return

  try {
    console.log('🚪 채팅방 입장 알림 전송:', {
      userId: currentUserId.value,
      chatRoomId: chatRoomId.value,
    })

    websocketService.sendMessage('/app/chat/enter', {
      userId: currentUserId.value,
      chatRoomId: chatRoomId.value,
    })
  } catch (error) {
    console.error('채팅방 입장 알림 실패:', error)
  }
}

// 채팅방 퇴장 WebSocket 알림 (핵심!)
const notifyLeaveChatRoom = () => {
  if (!currentUserId.value) return

  try {
    console.log('🚪 채팅방 퇴장 알림 전송:', { userId: currentUserId.value })

    websocketService.sendMessage('/app/chat/leave', {
      userId: currentUserId.value,
    })
  } catch (error) {
    console.error('채팅방 퇴장 알림 실패:', error)
  }
}

// 백엔드 API 호출을 통한 읽음 처리
const markChat = async (chatRoomId) => {
  if (!chatRoomId || hasMarkedAsRead.value) {
    console.log('읽음 처리 건너뜀:', { chatRoomId, hasMarkedAsRead: hasMarkedAsRead.value })
    return false
  }

  if (!props.room?.unreadMessageCount || props.room.unreadMessageCount === 0) {
    return false
  }

  try {
    // API 파일의 함수 사용 (fetch 직접 호출 대신)
    await markChatRoomAsRead(chatRoomId)

    hasMarkedAsRead.value = true

    // 부모 컴포넌트(ChatRoomList)의 읽음 처리도 호출
    if (window.markChatRoomAsRead) {
      window.markChatRoomAsRead(chatRoomId)
    }

    return true
  } catch (error) {
    console.error('채팅방 읽음 처리 실패:', error)
    hasMarkedAsRead.value = false
    return false
  }
}

// 스크롤 기반 읽음 처리
function checkIfUserAtBottom() {
  if (!messagesContainer.value) return true

  const container = messagesContainer.value
  const threshold = 100
  const isAtBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < threshold

  shouldScrollToBottom.value = isAtBottom

  if (
    isAtBottom &&
    props.room?.unreadMessageCount > 0 &&
    !hasMarkedAsRead.value &&
    chatRoomId.value
  ) {
    markChat(chatRoomId.value)
  }

  return isAtBottom
}

// 온라인 상태 전송
const sendOnlineStatus = (isOnline) => {
  if (!currentUserId.value) return

  try {
    console.log('온라인 상태 전송:', { userId: currentUserId.value, isOnline })

    websocketService.sendMessage('/app/user/online', {
      userId: currentUserId.value,
      isOnline: isOnline,
    })
  } catch (error) {
    console.error('온라인 상태 전송 실패:', error)
  }
}

// 스크롤을 맨 아래로
function scrollToBottom(force = false) {
  if (!messagesContainer.value) return

  if (force || !hasInitiallyScrolled.value || shouldScrollToBottom.value) {
    const container = messagesContainer.value
    container.scrollTop = container.scrollHeight

    if (!hasInitiallyScrolled.value) {
      hasInitiallyScrolled.value = true
    }
  }
}

// 강제 스크롤
function forceScrollToBottom() {
  if (!messagesContainer.value) return

  const container = messagesContainer.value
  container.scrollTop = container.scrollHeight

  setTimeout(() => {
    container.scrollTop = container.scrollHeight
  }, 10)

  setTimeout(() => {
    container.scrollTop = container.scrollHeight
  }, 50)
}

// WebSocket 메시지 핸들러 개선 (자동 부모 업데이트 포함)
const directMessageHandler = async (message) => {
  // 중복 메시지 체크
  const isDuplicate = webSocketMessages.value.some(
    (existingMsg) =>
      existingMsg.content === message.content &&
      existingMsg.sendTime === message.sendTime &&
      existingMsg.senderId === message.senderId,
  )

  if (isDuplicate) {
    console.log('중복 메시지 무시:', message)
    return
  }

  webSocketMessages.value.push(message)
  console.log('직접 추가 후 배열:', webSocketMessages.value)

  // 새 메시지가 오면 무조건 부모 컴포넌트에 알림 (자동 업데이트 핵심!)
  if (window.updateChatRoomList) {
    window.updateChatRoomList(
      message.chatRoomId,
      message.content,
      message.sendTime,
      message.senderId,
      undefined, // unreadCount는 백엔드에서 계산
    )
  } else {
    console.warn('window.updateChatRoomList 함수가 없음!')
  }

  // 내가 받은 메시지인 경우 읽음 처리
  if (
    message.receiverId === currentUserId.value &&
    !message.isRead &&
    message.chatRoomId === chatRoomId.value
  ) {
    try {
      // 백엔드에 읽음 처리 요청 (가장 중요!)
      await markChatRoomAsRead(message.chatRoomId)

      // 프론트엔드에서도 읽음 상태 변경
      message.isRead = true
    } catch (error) {
      console.error('실시간 메시지 읽음 처리 실패:', error)
      // 백엔드 실패해도 프론트엔드에서는 읽음 처리
      message.isRead = true
    }
  }
}

// 메시지 전송
async function sendMessage(content) {
  if (isSendingMessage.value) {
    return
  }

  if (!chatReady.value) {
    return
  }

  const receiverId = getOtherUserId()
  if (!receiverId) {
    return
  }

  try {
    isSendingMessage.value = true
    const success = websocketService.sendChatMessage(
      chatRoomId.value,
      currentUserId.value,
      receiverId,
      content,
      'TEXT',
      null,
    )

    if (success) {
      shouldScrollToBottom.value = true
      nextTick(() => scrollToBottom(true))
    }
  } catch (error) {
    console.error('메시지 전송 중 오류:', error)
  } finally {
    setTimeout(() => {
      isSendingMessage.value = false
    }, 1000)
  }
}

// 타이핑 상태 처리
function handleTyping(typing) {
  if (!chatRoomId.value || !currentUserId.value) return

  try {
    websocketService.sendMessage(`/app/chat/${chatRoomId.value}/typing`, {
      userId: currentUserId.value,
      isTyping: typing,
    })
  } catch (error) {
    console.error('타이핑 상태 전송 오류:', error)
  }
}

// API에서 기존 메시지 로드
async function loadMessages() {
  if (!props.room || !props.room.chatRoomId) {
    console.warn('채팅방 정보가 없습니다.')
    return
  }

  try {
    loadingMessages.value = true
    messagesError.value = null
    hasInitiallyScrolled.value = false

    const response = await getChatMessages(props.room.chatRoomId)

    apiMessages.value = response.data || []

    await nextTick()
    forceScrollToBottom()

    setTimeout(() => {
      forceScrollToBottom()
    }, 100)

    setTimeout(() => {
      forceScrollToBottom()
    }, 300)
  } catch (err) {
    console.error('메시지 로드 오류:', err)
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
  if (ready && !wasReady) {
    try {
      await websocketService.connect()

      sendOnlineStatus(true)

      if (chatRoomId.value) {
        const topic = `/topic/chatroom/${chatRoomId.value}`
        websocketService.onMessage(topic, directMessageHandler)
        notifyEnterChatRoom()
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
    }
  }
})

// 채팅방 변경 감지
watch(
  () => props.room,
  async (newRoom, oldRoom) => {
    console.log('채팅방 변경:', {
      old: oldRoom?.chatRoomId,
      new: newRoom?.chatRoomId,
    })
    if (oldRoom?.chatRoomId && currentUserId.value) {
      notifyLeaveChatRoom()
    }

    // 상태 초기화
    webSocketMessages.value = []
    hasInitiallyScrolled.value = false
    shouldScrollToBottom.value = true
    hasMarkedAsRead.value = false

    // 이전 채팅방 구독 해제
    if (oldRoom?.chatRoomId) {
      websocketService.offMessage(`/topic/chatroom/${oldRoom.chatRoomId}`)
    }

    // 새 채팅방이 있고 채팅 준비가 완료되었을 때 구독
    if (newRoom?.chatRoomId && chatReady.value) {
      try {
        if (!websocketService.getConnectionStatus()) {
          await websocketService.connect()
        }

        const topic = `/topic/chatroom/${newRoom.chatRoomId}`
        websocketService.onMessage(topic, directMessageHandler)
        // 새 채팅방 입장 알림
        notifyEnterChatRoom()

        // 새 채팅방 진입 시 읽음 처리
        if (newRoom.chatRoomId) {
          setTimeout(async () => {
            await markChat(newRoom.chatRoomId)
          }, 500)
        }
      } catch (error) {
        console.error('새 채팅방 구독 실패:', error)
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
    console.log('webSocketMessages 변경 감지!')
    console.log('이전 메시지 수:', oldMessages?.length || 0)
    console.log('현재 메시지 수:', newMessages?.length || 0)

    if (newMessages.length > (oldMessages?.length || 0)) {
      nextTick(() => {
        if (shouldScrollToBottom.value) {
          // scrollToBottom(true)
          forceScrollToBottom()
        }
      })
    }
  },
  { immediate: true, deep: true },
)

// 컴포넌트 마운트 시
onMounted(async () => {
  await loadUserInfo()
  addScrollListener()

  if (chatRoomId.value) {
    setTimeout(async () => {
      await markChat(chatRoomId.value)
    }, 500)
  }
})

// 컴포넌트 언마운트 시
onUnmounted(() => {
  // 채팅방 퇴장 알림
  if (currentUserId.value) {
    notifyLeaveChatRoom()
    sendOnlineStatus(false)
  }

  removeScrollListener()

  if (chatRoomId.value) {
    websocketService.offMessage(`/topic/chatroom/${chatRoomId.value}`)
  }

  webSocketMessages.value = []
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
</style>
