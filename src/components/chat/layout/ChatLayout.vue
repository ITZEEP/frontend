<template>
  <div class="flex h-full">
    <div class="w-1/3 border-r">
      <ChatList @selectRoom="handleRoomSelection" ref="chatListRef" />
    </div>
    <div class="flex-1">
      <!-- 🔧 선택된 채팅방이 있을 때만 렌더링 -->
      <ChatRoom
        v-if="selectedRoom"
        :room="selectedRoom"
        :key="`room-${selectedRoom.chatRoomId}`"
        @room-closed="handleRoomClosed"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <div class="text-6xl mb-4">💬</div>
          <p class="text-lg">채팅방을 선택해주세요</p>
          <p class="text-sm text-gray-400 mt-2">채팅방을 클릭하여 대화를 시작하거나</p>
          <p class="text-sm text-gray-400">현재 채팅방을 다시 클릭하여 나가기</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatList from '@/components/chat/chatList/ChatList.vue'
import ChatRoom from '@/components/chat/chatRoom/ChatRoom.vue'

const selectedRoom = ref(null) // 🔧 초기값을 null로 설정
const chatListRef = ref(null)

// 🔧 채팅방 선택 핸들러
function handleRoomSelection(room) {
  console.log('채팅방 선택 변경:', {
    이전: selectedRoom.value?.chatRoomId,
    현재: room?.chatRoomId,
  })

  selectedRoom.value = room // null일 수도 있음
}

// 🔧 채팅방 닫힘 핸들러 (ChatRoom 컴포넌트에서 발생)
function handleRoomClosed() {
  console.log('채팅방이 닫혔습니다')
  selectedRoom.value = null

  // ChatList의 현재 채팅방 ID도 초기화
  if (chatListRef.value && chatListRef.value.setCurrentChatRoom) {
    chatListRef.value.setCurrentChatRoom(null)
  }
}
</script>
