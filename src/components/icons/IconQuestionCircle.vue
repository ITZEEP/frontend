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
      d="M5.5 6.5C5.5 5.11929 6.61929 4 8 4C9.38071 4 10.5 5.11929 10.5 6.5C10.5 7.62132 9.79147 8.58079 8.8 8.90514C8.32539 9.06076 8 9.49608 8 10M8 12.5V12"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
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
