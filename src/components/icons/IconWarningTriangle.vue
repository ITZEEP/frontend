<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M7.14625 2.48913C7.52747 1.78571 8.47253 1.78571 8.85375 2.48913L14.8038 13.2891C15.185 13.9926 14.7125 14.85 13.95 14.85H2.05C1.28747 14.85 0.814969 13.9926 1.19625 13.2891L7.14625 2.48913Z"
      fill="currentColor"
    />
    <path d="M8 6V9" stroke="white" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="8" cy="11.5" r="0.5" fill="white" />
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
