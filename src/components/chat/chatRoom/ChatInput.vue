<template>
  <div class="p-4 border-t bg-white">
    <div class="flex space-x-2">
      <input
        v-model="messageInput"
        @keyup.enter="sendMessage"
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="메시지를 입력하세요"
      />
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim()"
        class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        전송
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['sendMessage'])

const messageInput = ref('')

function sendMessage() {
  const content = messageInput.value.trim()
  if (!content) return

  emit('sendMessage', content)
  messageInput.value = ''
}
</script>
