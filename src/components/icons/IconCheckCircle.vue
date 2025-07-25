<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 16 16"
    fill="none"
  >
    <circle cx="8" cy="8" r="8" fill="currentColor" />
    <path
      d="M11.5 6L7 10.5L4.5 8"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
defineProps({
  width: {
    type: [String, Number],
    default: 16,
  },
  height: {
    type: [String, Number],
    default: 16,
  },
})
</script>
