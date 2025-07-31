<template>
  <ChatLayout v-slot="{ selectedRoom }">
    <ChatRoom v-if="selectedRoom" :room="selectedRoom" />
    <ChatPlaceholder v-else />
  </ChatLayout>
</template>

<script setup>
import ChatLayout from '@/components/chat/layout/ChatLayout.vue'
import ChatRoom from '@/components/chat/chatRoom/ChatRoom.vue'
import ChatPlaceholder from '@/components/chat/chatRoom/ChatPlaceholder.vue'
</script>
