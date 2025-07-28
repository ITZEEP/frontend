<template>
  <div class="flex h-screen">
    <!-- 사이드바 -->
    <SideBar @selectRoom="selectRoom" />

    <!-- 메인 채팅 영역 -->
    <div class="flex-1">
      <slot :selectedRoom="selectedRoom" />
    </div>
  </div>
</template>

<script setup>
import SideBar from './SideBar.vue'
import { ref } from 'vue'

const selectedRoom = ref(null)

function selectRoom(room) {
  if (selectedRoom.value?.chatRoomId === room.chatRoomId) {
    selectedRoom.value = null // 같은 방을 클릭하면 해제
  } else {
    selectedRoom.value = room
  }
}
</script>
