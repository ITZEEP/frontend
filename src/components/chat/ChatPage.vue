<template>
  <div class="flex h-screen">
    <ChatSidebar @selectRoom="selectRoom" />
    <div class="flex-1">
      <ChatRoom v-if="selectedRoom" :room="selectedRoom" />
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        채팅방을 선택해주세요.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatRoom from '@/components/chat/ChatRoom.vue'

const selectedRoom = ref(null)

function selectRoom(room) {
  selectedRoom.value = room
}
</script>
