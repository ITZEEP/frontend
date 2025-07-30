<template>
  <!-- 🔧 사용자 정보가 로드될 때까지 로딩 표시 -->
  <div v-if="!userLoaded || !currentUserId" class="h-full flex items-center justify-center">
    <div class="text-center">
      <div
        class="animate-spin w-8 h-8 border-2 border-gray-300 border-t-yellow-primary rounded-full mx-auto mb-2"
      ></div>
      <p class="text-gray-500">사용자 정보 로딩 중...</p>
    </div>
  </div>

  <!-- 🔧 사용자 정보가 로드된 후에만 채팅방 컴포넌트 렌더링 -->
  <div v-else class="h-full flex flex-col">
    <!-- 상단 헤더 -->
    <RoomNav :room="room" :current-user-id="currentUserId" />

    <!-- 채팅 메시지 영역 -->
    <div class="flex-1 p-4 bg-gray-50 chat-messages-container" ref="messagesContainer">
      <div v-if="loadingMessages" class="text-center text-gray-500">메시지 로딩 중...</div>

      <div v-else-if="messagesError" class="text-center text-red-500">
        {{ messagesError }}
      </div>

      <div v-else>
        <!-- 기존 메시지들 (API에서 로드된 메시지) -->
        <div
          v-for="message in apiMessages"
          :key="'api-' + message.id"
          class="mb-4 message-item"
          :class="{ 'text-right': isMyMessage(message) }"
        >
          <div
            class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words"
            :class="{
              'bg-yellow-primary text-white': isMyMessage(message),
              'bg-white text-gray-800 border': !isMyMessage(message),
            }"
          >
            <!-- 텍스트 메시지 -->
            <div v-if="message.type === 'TEXT'" class="break-words">
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
                  @load="handleImageLoad"
                />
                <div class="text-xs opacity-75">{{ message.content }}</div>
              </div>

              <!-- 동영상 파일 -->
              <div v-else-if="isVideoFile(message.fileUrl)" class="space-y-2">
                <video controls class="max-w-60 max-h-60 rounded-lg" @loadeddata="handleVideoLoad">
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

            <div v-else-if="message.type === 'CONTRACT_REQUEST'">
              <BaseButton @click="handleAcceptContract">계약 요청 수락하기</BaseButton>
              <BaseButton>거절</BaseButton>
            </div>

            <div class="text-xs mt-1 opacity-70 flex justify-between items-center">
              <span>{{ formatMessageTime(message.sendTime) }}</span>
              <span v-if="isMyMessage(message) && message.isRead" class="text-white ml-2"
                >읽음</span
              >
            </div>

            <BaseButton v-if="isSuccessBuildContract" @click="handleGoToContractRoom"
              >계약서 작성하러 가기</BaseButton
            >
          </div>
        </div>

        <!-- 실시간 메시지들 (WebSocket으로 받은 메시지) -->
        <div
          v-for="(message, index) in webSocketMessages"
          :key="'ws-' + (message.id || message.sendTime || index)"
          class="mb-4 message-item"
          :class="{ 'text-right': isMyMessage(message) }"
        >
          <div
            class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words"
            :class="{
              'bg-yellow-primary text-white': isMyMessage(message),
              'bg-white text-gray-800 border': !isMyMessage(message),
            }"
          >
            <!-- 텍스트 메시지 -->
            <div v-if="message.type === 'TEXT'" class="break-words">
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
                  @load="handleImageLoad"
                />
                <div class="text-xs opacity-75">{{ message.content }}</div>
              </div>

              <!-- 동영상 파일 -->
              <div v-else-if="isVideoFile(message.fileUrl)" class="space-y-2">
                <video controls class="max-w-60 max-h-60 rounded-lg" @loadeddata="handleVideoLoad">
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
    <ChatInput @sendMessage="sendMessage" :chatRoomId="chatRoomId" :receiverId="getOtherUserId()" />

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
import { acceptContract, getChatMessages, getCurrentUser, markChatRoomAsRead } from '@/apis/chatApi'
import websocketService from '../../../apis/websocket'
import BaseButton from '@/components/common/BaseButton.vue'
import router from '@/router'

const props = defineProps({
  room: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['room-closed'])

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

// 계약 수락 시 채팅방 성공
const isSuccessBuildContract = ref(false)
const contractRoomId = ref('')

// 🔧 MutationObserver 참조
let mutationObserver = null

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

// 🔧 이미지/비디오 로드 완료 시 스크롤
function handleImageLoad() {
  forceScrollToBottom()
}

function handleVideoLoad() {
  forceScrollToBottom()
}

// 사용자 정보 로드
async function loadUserInfo() {
  if (userLoaded.value && currentUserId.value) {
    return // 이미 로드됨
  }

  try {
    console.log('🔄 사용자 정보 로딩 시작...')

    const userInfo = await getCurrentUser()

    if (userInfo.success && userInfo.data.userId) {
      currentUserId.value = userInfo.data.userId
      userLoaded.value = true

      console.log('✅ 사용자 정보 로드 완료:', currentUserId.value)
    } else {
      throw new Error('사용자 정보가 유효하지 않습니다.')
    }
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error)
    // 🔧 오류 발생 시에도 userLoaded를 true로 설정하여 무한 로딩 방지
    userLoaded.value = true
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

// 🔧 스크롤 기반 읽음 처리 - 항상 아래로 스크롤
function checkIfUserAtBottom() {
  if (!messagesContainer.value) return true

  // 🔧 항상 맨 아래로 스크롤하도록 강제
  // forceScrollToBottom()

  // 읽음 처리
  if (props.room?.unreadMessageCount > 0 && !hasMarkedAsRead.value && chatRoomId.value) {
    markChat(chatRoomId.value)
  }

  return true // 항상 맨 아래에 있다고 가정
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

// 🔧 스크롤을 항상 맨 아래로 유지하는 강화된 함수
function forceScrollToBottom() {
  if (!messagesContainer.value) return

  const container = messagesContainer.value

  // 즉시 스크롤
  container.scrollTop = container.scrollHeight

  // Vue의 반응성 업데이트 후 스크롤
  nextTick(() => {
    container.scrollTop = container.scrollHeight

    // 🔧 추가: 더 확실한 스크롤 처리
    setTimeout(() => {
      container.scrollTop = container.scrollHeight
    }, 10)

    setTimeout(() => {
      container.scrollTop = container.scrollHeight
    }, 50)

    setTimeout(() => {
      container.scrollTop = container.scrollHeight
    }, 100)
  })

  // 애니메이션 프레임 사용으로 렌더링 완료 후 스크롤
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight

    // 🔧 한 번 더 확실하게
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight
    })
  })
}

// 🔧 WebSocket 메시지 핸들러 - 스크롤 강화
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

  // 🔧 새 메시지 추가 시 여러 타이밍으로 스크롤 보장
  forceScrollToBottom()

  nextTick(() => {
    forceScrollToBottom()
  })

  // 🔧 약간의 지연 후에도 한 번 더 스크롤 (이미지 로딩 등을 고려)
  setTimeout(() => {
    forceScrollToBottom()
  }, 200)

  // 새 메시지가 오면 무조건 부모 컴포넌트에 알림
  if (window.updateChatRoomList) {
    window.updateChatRoomList(
      message.chatRoomId,
      message.content,
      message.sendTime,
      message.senderId,
      undefined,
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
      await markChatRoomAsRead(message.chatRoomId)
      message.isRead = true
    } catch (error) {
      console.error('실시간 메시지 읽음 처리 실패:', error)
      message.isRead = true
    }
  }
}

// 🔧 메시지 전송 - 스크롤 강화
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
      // 🔧 메시지 전송 후 즉시 여러 번 스크롤 시도
      forceScrollToBottom()

      nextTick(() => {
        forceScrollToBottom()
      })

      // 🔧 약간의 지연 후에도 스크롤 (서버 응답 시간 고려)
      setTimeout(() => {
        forceScrollToBottom()
      }, 100)

      setTimeout(() => {
        forceScrollToBottom()
      }, 300)
    }
  } catch (error) {
    console.error('메시지 전송 중 오류:', error)
  } finally {
    setTimeout(() => {
      isSendingMessage.value = false
    }, 1000)
  }
}

// 🔧 API에서 기존 메시지 로드 - 스크롤 강화
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

    // 🔧 메시지 로드 후 여러 타이밍으로 스크롤
    await nextTick()
    forceScrollToBottom()

    setTimeout(() => {
      forceScrollToBottom()
    }, 100)

    setTimeout(() => {
      forceScrollToBottom()
    }, 300)

    setTimeout(() => {
      forceScrollToBottom()
    }, 500)
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

// 🔧 MutationObserver를 사용한 DOM 변경 감지 및 자동 스크롤
const setupAutoScroll = () => {
  if (!messagesContainer.value) return

  mutationObserver = new MutationObserver(() => {
    // DOM 변경이 있을 때마다 스크롤
    forceScrollToBottom()
  })

  mutationObserver.observe(messagesContainer.value, {
    childList: true, // 자식 노드 추가/제거 감지
    subtree: true, // 하위 트리 변경도 감지
    attributes: true, // 속성 변경도 감지
  })

  console.log('✅ MutationObserver 설정 완료')
}

// 계약 수락 버튼
const handleAcceptContract = async () => {
  if (!props.room?.chatRoomId) {
    console.error('채팅방 ID가 없습니다.')
    return
  }

  try {
    const response = await acceptContract(props.room.chatRoomId)

    console.log('전체 응답:', response)
    console.log('계약 채팅방 ID:', response.data)
    console.log('성공 여부:', response.success)
    console.log('메시지:', response.message)

    if (response.success && response.data) {
      isSuccessBuildContract.value = true
      contractRoomId.value = response.data

      console.log('계약 생성 성공:', isSuccessBuildContract.value)
      console.log('계약 채팅방 ID:', contractRoomId.value)

      alert(response.message || '계약이 성공적으로 수락되었습니다.')
    } else {
      console.error('계약 수락 실패:', response.message)
      alert('계약 수락에 실패했습니다.')
    }
  } catch (error) {
    console.error('계약 수락 중 오류 발생:', error)
    alert('계약 수락 중 오류가 발생했습니다.')
  }
}

const handleGoToContractRoom = () => {
  if (contractRoomId.value) {
    router.push(`/contract/${contractRoomId.value}`)
  } else {
    console.error('계약 채팅방 ID가 설정되지 않았습니다.')
    alert('계약 채팅방 정보가 없습니다.')
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

    // 🔧 이전 채팅방 정리 (퇴장 알림은 ChatList에서 처리하므로 구독 해제만)
    if (oldRoom?.chatRoomId && currentUserId.value) {
      console.log('이전 채팅방 구독 해제:', oldRoom.chatRoomId)
      websocketService.offMessage(`/topic/chatroom/${oldRoom.chatRoomId}`)

      // 🔧 읽음 처리 상태 초기화
      hasMarkedAsRead.value = false
    }

    // 🔧 새 채팅방이 null인 경우 (채팅방 나가기)
    if (!newRoom) {
      console.log('채팅방 완전 나가기 - 상태 초기화만')

      // 상태 초기화
      webSocketMessages.value = []
      hasInitiallyScrolled.value = false
      shouldScrollToBottom.value = true
      hasMarkedAsRead.value = false

      // 🔧 부모 컴포넌트에 채팅방 닫힘 알림
      emit('room-closed')

      return
    }

    // 상태 초기화
    webSocketMessages.value = []
    hasInitiallyScrolled.value = false
    shouldScrollToBottom.value = true
    hasMarkedAsRead.value = false

    // 새 채팅방 설정
    if (newRoom.chatRoomId && chatReady.value) {
      try {
        if (!websocketService.getConnectionStatus()) {
          await websocketService.connect()
        }

        const topic = `/topic/chatroom/${newRoom.chatRoomId}`
        websocketService.onMessage(topic, directMessageHandler)

        // 🔧 새 채팅방 입장 알림 (약간의 지연 후)
        setTimeout(() => {
          notifyEnterChatRoom()
        }, 150)

        // 읽음 처리
        setTimeout(async () => {
          await markChat(newRoom.chatRoomId)
        }, 500)
      } catch (error) {
        console.error('새 채팅방 구독 실패:', error)
      }
    }

    loadMessages()
  },
  { immediate: true },
)

// 🔧 WebSocket 메시지 변경 감지 - 스크롤 강화
watch(
  webSocketMessages,
  (newMessages, oldMessages) => {
    console.log('webSocketMessages 변경 감지!')
    console.log('이전 메시지 수:', oldMessages?.length || 0)
    console.log('현재 메시지 수:', newMessages?.length || 0)

    if (newMessages.length > (oldMessages?.length || 0)) {
      // 🔧 새 메시지가 추가되면 여러 타이밍으로 스크롤
      forceScrollToBottom()

      nextTick(() => {
        forceScrollToBottom()
      })

      // 이미지나 파일 로딩을 고려한 추가 스크롤
      setTimeout(() => {
        forceScrollToBottom()
      }, 100)

      setTimeout(() => {
        forceScrollToBottom()
      }, 300)
    }
  },
  { immediate: true, deep: true },
)

// 🔧 apiMessages 변경 감지 추가 (기존 메시지 로드 시에도 스크롤)
watch(
  apiMessages,
  (newMessages) => {
    if (newMessages && newMessages.length > 0) {
      console.log('API 메시지 로드 완료, 스크롤 이동')

      nextTick(() => {
        forceScrollToBottom()

        // 이미지 로딩 시간을 고려한 추가 스크롤
        setTimeout(() => {
          forceScrollToBottom()
        }, 200)

        setTimeout(() => {
          forceScrollToBottom()
        }, 500)
      })
    }
  },
  { immediate: true },
)

// 컴포넌트 마운트 시
onMounted(async () => {
  // 🔧 사용자 정보 로드 완료까지 대기
  await loadUserInfo()

  // 🔧 자동 스크롤 설정
  await nextTick()
  setupAutoScroll()

  // 스크롤 리스너 추가 (읽음 처리용)
  addScrollListener()

  // 읽음 처리는 사용자 정보 로드 후에 실행
  if (chatRoomId.value && currentUserId.value) {
    setTimeout(async () => {
      await markChat(chatRoomId.value)
    }, 500)
  }

  // 🔧 마운트 후 초기 스크롤
  setTimeout(() => {
    forceScrollToBottom()
  }, 100)
})

// 컴포넌트 언마운트 시
onUnmounted(() => {
  console.log('ChatRoom 언마운트 - 정리 작업')

  // 🔧 MutationObserver 정리
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
    console.log('✅ MutationObserver 정리 완료')
  }

  // 🔧 구독 해제만 수행 (퇴장 알림은 ChatList에서 처리)
  if (chatRoomId.value) {
    websocketService.offMessage(`/topic/chatroom/${chatRoomId.value}`)
  }

  // 상태 초기화
  webSocketMessages.value = []
  hasMarkedAsRead.value = false

  removeScrollListener()
})
</script>

<style scoped>
/* 🔧 채팅 메시지 영역 스크롤 개선 */
.chat-messages-container {
  /* 🔧 핵심: 채팅 영역에 독립적인 스크롤 설정 */
  height: 100%;
  max-height: calc(100vh - 200px); /* 헤더와 입력창 공간 제외 */
  overflow-y: auto !important;
  overflow-x: hidden;

  /* 스크롤 동작 부드럽게 */
  scroll-behavior: smooth;

  /* 자동 스크롤을 위한 추가 속성 */
  scroll-snap-type: y mandatory;

  /* 스크롤 성능 최적화 */
  will-change: scroll-position;
  -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */

  /* 🔧 스크롤바가 확실히 보이도록 */
  scrollbar-gutter: stable;
}

/* 🔧 채팅 메시지 컨테이너 내부 스크롤바 스타일 */
.chat-messages-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.chat-messages-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
  margin: 4px 0;
}

.chat-messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.chat-messages-container::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* 🔧 Firefox 스크롤바 스타일 */
.chat-messages-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* 🔧 마지막 메시지가 항상 보이도록 하는 속성 */
.chat-messages-container > div:last-child {
  scroll-snap-align: end;
}

/* 🔧 메시지들이 아래에서부터 쌓이도록 */
.message-item {
  flex-shrink: 0;
}

/* 🔧 새 메시지 추가 시 부드러운 애니메이션 */
.message-item {
  animation: slideInFromBottom 0.3s ease-out;
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 타이핑 인디케이터 애니메이션 */
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

/* 🔧 기존 overflow-y-auto 클래스는 제거하고 새로운 스타일 적용 */
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

/* 긴 텍스트 줄바꿈 처리 */
.break-words {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* 로딩 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 🔧 모바일에서 스크롤바 조정 */
@media (max-width: 768px) {
  .chat-messages-container::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages-container {
    /* 모바일에서 더 부드러운 스크롤 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    max-height: calc(100vh - 180px); /* 모바일에서 높이 조정 */
  }
}

/* 🔧 반응형 메시지 너비 조정 */
@media (max-width: 640px) {
  .max-w-xs {
    max-width: 280px;
  }

  .chat-messages-container {
    max-height: calc(100vh - 160px); /* 작은 화면에서 높이 조정 */
  }
}

/* 🔧 전체 채팅 컨테이너 높이 설정 */
.h-full.flex.flex-col {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden; /* 전체 페이지 스크롤 방지 */
}
</style>
