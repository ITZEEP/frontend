<template>
  <div class="w-full min-h-screen max-h-96 bg-white rounded-lg flex flex-col">
    <!-- 헤더 -->
    <div class="px-2 py-3 border-b-2">
      <p class="font-bold text-lg">실시간 협의</p>
    </div>

    <!-- 채팅 메시지 영역 -->
    <div class="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-2">
      <ChatUserMessage
        v-for="(msg, idx) in messages"
        :key="idx"
        :name="msg.name"
        :message="msg.message"
        :time="msg.time"
        :userId="msg.userId"
        :myUserId="myUserId"
      />
    </div>

    <!-- 입력창 -->
    <ContractChatInput :chatRoomId="1" :receiverId="2" @sendMessage="handleMessageSend" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ContractChatInput from './ContractChatInput.vue'
import ChatUserMessage from './UserChatMessage.vue'

// 현재 로그인한 사용자 ID
const myUserId = 123

// 채팅 메시지 상태
const messages = ref([
  {
    userId: 456,
    name: '김임대',
    message:
      '최근 주변 단지들도 전세가가 조금씩 오르고 있어서요. 처음엔 3억 2천 제시했지만, 지금은 3억 4천 정도가 적정선이라고 생각합니다.',
    time: '14:31',
  },
])

// 메시지 전송 시 호출
function handleMessageSend(content) {
  const now = new Date()
  const time = now.toTimeString().slice(0, 5)

  messages.value.push({
    userId: myUserId,
    name: '이임차',
    message: content,
    time,
  })
}
</script>
