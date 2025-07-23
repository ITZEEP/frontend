<script setup>
import { defineProps } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '처리 중...'
  },
  subMessage: {
    type: String,
    default: '잠시만 기다려주세요'
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="loading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 text-center shadow-xl">
        <div class="w-16 h-16 border-4 border-yellow-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg font-semibold text-gray-warm-700">{{ message }}</p>
        <p class="text-sm text-gray-600 mt-2">{{ subMessage }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>