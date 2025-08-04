<template>
  <div class="flex flex-col items-center justify-center py-8">
    <div class="text-red-500 mb-4">
      <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <p class="text-gray-600 mb-2">{{ title || '서버와 연결할 수 없습니다.' }}</p>
    <p v-if="message" class="text-gray-500 text-sm">{{ message || '네트워크 연결을 확인하고 다시 시도해주세요.' }}</p>
    <button 
      v-if="showRetry"
      @click="$emit('retry')" 
      class="mt-4 px-4 py-2 bg-yellow-primary text-white rounded-md hover:bg-yellow-450 transition-colors"
    >
      {{ retryText || '다시 시도' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '서버와 연결할 수 없습니다.'
  },
  message: {
    type: String,
    default: '네트워크 연결을 확인하고 다시 시도해주세요.'
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  retryText: {
    type: String,
    default: '다시 시도'
  }
})

defineEmits(['retry'])
</script>