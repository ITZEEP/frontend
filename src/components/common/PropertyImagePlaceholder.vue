<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: '매물'
  },
  size: {
    type: String,
    default: 'large' // 'small', 'medium', 'large'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-24 h-24'
    case 'medium':
      return 'w-32 h-32'
    case 'large':
      return 'w-48 h-48'
    default:
      return 'w-48 h-48'
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-8 h-8'
    case 'medium':
      return 'w-12 h-12'
    case 'large':
      return 'w-16 h-16'
    default:
      return 'w-16 h-16'
  }
})
</script>

<template>
  <div 
    :class="[
      sizeClasses,
      'bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-dashed border-blue-200',
      'flex flex-col items-center justify-center text-blue-400 transition-colors hover:border-blue-300 hover:text-blue-500'
    ]"
  >
    <!-- 건물 아이콘 -->
    <svg 
      :class="iconSize" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="1.5" 
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
    
    <!-- 텍스트 -->
    <span class="text-sm font-medium mt-2 text-center px-2 leading-tight">
      {{ type }}<br />이미지
    </span>
  </div>
</template>