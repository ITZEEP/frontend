<template>
  <ChatLayout v-slot="{ selectedRoom }" :initial-room-id="initialRoomId">
    <ChatRoom v-if="selectedRoom" :room="selectedRoom" />
    <ChatPlaceholder v-else />
  </ChatLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ChatLayout from '@/components/chat/layout/ChatLayout.vue'
import ChatRoom from '@/components/chat/chatRoom/ChatRoom.vue'
import ChatPlaceholder from '@/components/chat/chatRoom/ChatPlaceholder.vue'
import axios from 'axios'

const route = useRoute()
const initialRoomId = ref(null)

const createChatRoom = async () => {
  try {
    const response = await axios.post('/api/chat/rooms')
    if (response.data.success && response.data.data) {
      initialRoomId.value = response.data.data.toString()
      console.log('Chat room created with ID:', initialRoomId.value)
    }
  } catch (error) {
    console.error('Failed to create chat room:', error)
  }
}

onMounted(async () => {
  // query parameter에서 roomId 가져오기
  if (route.query.roomId) {
    initialRoomId.value = route.query.roomId
  } else {
    // roomId가 없으면 새 채팅방 생성
    await createChatRoom()
  }
})
</script>
