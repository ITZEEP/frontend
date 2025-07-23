<template>
  <div class="h-full flex flex-col">
    <!-- 상단 헤더 -->
    <RoomNav :room="room" />

    <!-- 채팅 메시지 영역 -->
    <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
      <!-- 메시지들 렌더링 -->
    </div>

    <!-- 입력창 -->
    <ChatInput />
  </div>
</template>

<script setup>
import RoomNav from './RoomNav.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps({ room: Object })
const room = props.room
</script>
