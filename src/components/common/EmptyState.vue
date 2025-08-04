<template>
  <div class="flex flex-col items-center justify-center py-8">
    <div class="text-gray-400 mb-4">
      <slot name="icon">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </slot>
    </div>
    <p class="text-gray-600 mb-2">{{ title }}</p>
    <p v-if="message" class="text-gray-500 text-sm">{{ message }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  }
})
</script>