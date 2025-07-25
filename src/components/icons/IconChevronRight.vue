<script setup>
defineProps({
  width: {
    type: [Number, String],
    default: 8
  },
  height: {
    type: [Number, String],
    default: 14
  }
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 8 14"
    fill="none"
    :width="width"
    :height="height"
  >
    <path
      d="M1 1L7 7L1 13"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>