<template>
  <div class="w-[300px] border-r h-full overflow-y-auto">
    <ChatList @selectRoom="emitRoom" :initial-room-id="initialRoomId" />
  </div>
</template>

<script setup>
import ChatList from '../chatList/ChatList.vue'

const props = defineProps({
  initialRoomId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['selectRoom'])

function emitRoom(room) {
  emit('selectRoom', room)
}
</script>
