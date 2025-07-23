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
        <!-- 메시지들 렌더링 -->
        <div
          v-for="message in messages"
          :key="message.id"
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
            <!-- 텍스트 메시지 -->
            <div v-if="message.type === 'TEXT'">
              {{ message.content }}
            </div>

            <!-- 파일 메시지 -->
            <div v-else-if="message.type === 'FILE'">
              <a :href="message.fileUrl" target="_blank" class="underline"> 📎 파일 보기 </a>
            </div>

            <!-- 시간 표시 -->
            <div class="text-xs mt-1 opacity-70">
              {{ formatMessageTime(message.sendTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <ChatInput @sendMessage="sendMessage" />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
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

const messages = ref([])
const loadingMessages = ref(false)
const messagesError = ref(null)
const messagesContainer = ref(null)
const currentUserId = ref(null) // 현재 사용자 ID (로그인 정보에서 가져와야 함)

// 메시지 로드
async function loadMessages() {
  if (!props.room) return

  try {
    loadingMessages.value = true
    messagesError.value = null

    const response = await getChatMessages(props.room.chatRoomId)
    messages.value = response.data || []

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
  // currentUserId를 실제 로그인한 사용자 ID로 설정해야 함
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

// 메시지 전송 (WebSocket 구현 필요)
function sendMessage(content) {
  // TODO: WebSocket으로 메시지 전송
  console.log('메시지 전송:', content)
}

// 방이 변경될 때마다 메시지 로드
watch(() => props.room, loadMessages, { immediate: true })
</script>
