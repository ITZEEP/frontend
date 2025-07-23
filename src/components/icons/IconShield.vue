<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    :width="width" 
    :height="height" 
    viewBox="0 0 24 24" 
    fill="none" 
  >
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
defineProps({
  width: {
    type: [String, Number],
    default: '24'
  },
  height: {
    type: [String, Number],
    default: '24'
  }
})
</script>