<template>
  <div>
    <ChatItem v-for="room in chatRooms" :key="room.id" :room="room" @click="select(room)" />
  </div>
</template>

<script setup>
import ChatItem from './ChatItem.vue'
const emit = defineEmits(['selectRoom'])

const chatRooms = [
  { id: 1, title: '상담자 A', latest: '안녕하세요!' },
  { id: 2, title: '상담자 B', latest: '문의드립니다.' },
]

function select(room) {
  emit('selectRoom', room)
}
</script>
