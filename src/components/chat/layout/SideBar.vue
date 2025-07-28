<template>
  <div class="w-[300px] border-r h-full overflow-y-auto">
    <ChatList @selectRoom="emitRoom" />
  </div>
</template>

<script setup>
import ChatList from '../chatList/ChatList.vue'
const emit = defineEmits(['selectRoom'])

function emitRoom(room) {
  emit('selectRoom', room)
}
</script>
