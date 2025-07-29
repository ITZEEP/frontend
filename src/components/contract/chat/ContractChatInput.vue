<template>
  <div class="border-t bg-white">
    <div class="w-full p-2 border-b flex gap-4">
      <BaseButton variant="outline">조율 시작</BaseButton>
      <BaseButton>AI 수정 요청</BaseButton>
    </div>
    <div class="flex px-4 pt-2 pb-4 gap-2">
      <!-- 메시지 입력창 -->
      <input
        v-model="messageInput"
        @keyup.enter="sendMessage"
        @input="handleTyping"
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="메시지를 입력하세요"
      />

      <!-- 전송 버튼 -->
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim()"
        class="bg-yellow-primary text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        전송
      </button>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { ref } from 'vue'

const emit = defineEmits(['sendMessage', 'typing'])

const props = defineProps({
  chatRoomId: {
    type: [Number, String],
    required: true,
    validator: (value) => value !== null && value !== undefined,
  },
  receiverId: {
    type: [Number, String],
    required: true,
    validator: (value) => value !== null && value !== undefined,
  },
})

const messageInput = ref('')

// 타이핑 상태
let typingTimer = null

function sendMessage() {
  const content = messageInput.value.trim()
  if (!content) return

  emit('sendMessage', content)
  messageInput.value = ''
}

function handleTyping() {
  emit('typing', true)

  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    emit('typing', false)
  }, 1000)
}
</script>
