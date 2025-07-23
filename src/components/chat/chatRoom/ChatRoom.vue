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
            <div class="text-xs mt-1 opacity-70">
              {{ formatMessageTime(message.sendTime) }}
            </div>
          </div>
        </div>

        <!-- 실시간 메시지들 (WebSocket으로 받은 메시지) -->
        <div
          v-for="message in webSocketMessages"
          :key="'ws-' + message.timestamp"
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
            <div class="text-xs mt-1 opacity-70">
              {{ formatMessageTime(message.sendTime) }}
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
import { ref, computed, watch, nextTick } from 'vue'
import { useChatRoom } from '@/components/chat/composables/useChatRoom'
import RoomNav from './RoomNav.vue'
import ChatInput from './ChatInput.vue'
import { getChatMessages } from '@/components/chat/apis/chatApi'

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

// 현재 사용자 ID (실제로는 로그인 정보에서 가져와야 함)
const currentUserId = ref(() => {
  // localStorage에서 사용자 정보 가져오기
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
  return userInfo.userId || null
})

// 채팅방 정보
const chatRoomId = computed(() => props.room?.chatRoomId)
const roomData = computed(() => props.room)

// WebSocket 채팅방 관리
const {
  messages: webSocketMessages,
  isTyping,
  sendMessage: sendWebSocketMessage,
  sendTypingStatus,
} = useChatRoom(chatRoomId, currentUserId, roomData)

// API에서 기존 메시지 로드
async function loadMessages() {
  if (!props.room) return

  try {
    loadingMessages.value = true
    messagesError.value = null

    const response = await getChatMessages(props.room.chatRoomId)
    apiMessages.value = response.data || []

    // 스크롤을 맨 아래로
    await nextTick()
    scrollToBottom()
  } catch (err) {
    messagesError.value = '메시지를 불러올 수 없습니다.'
    console.error('메시지 로드 오류:', err)
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

// 스크롤을 맨 아래로
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 메시지 전송
function sendMessage(content) {
  const success = sendWebSocketMessage(content)
  if (success) {
    // 전송 성공 시 스크롤 이동
    nextTick(() => scrollToBottom())
  }
}

// 타이핑 상태 처리
function handleTyping(isTyping) {
  sendTypingStatus(isTyping)
}

// 새 WebSocket 메시지가 추가될 때 스크롤 이동
watch(
  webSocketMessages,
  () => {
    nextTick(() => scrollToBottom())
  },
  { deep: true },
)

// 방이 변경될 때마다 기존 메시지 로드
watch(() => props.room, loadMessages, { immediate: true })
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
</style>
