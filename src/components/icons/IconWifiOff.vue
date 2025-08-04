<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    :width="width"
    :height="height"
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    class="inline-block"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c0 1.657-.895 3.1-2.238 4.1M12 21a9 9 0 01-9-9m9 9v-9m-9 0a9 9 0 019-9m-9 9c0-1.657.895-3.1 2.238-4.1" />
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