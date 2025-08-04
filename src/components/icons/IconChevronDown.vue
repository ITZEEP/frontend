<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    :class="animationClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 9l6 6 6-6"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rotate: {
    type: Boolean,
    default: false
  }
})

const animationClass = computed(() => {
  return props.rotate ? 'rotate-180 transition-transform duration-300' : 'transition-transform duration-300'
})
</script>