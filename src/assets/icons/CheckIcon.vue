<template>
  <svg
    :width="props.width"
    :height="props.height"
    viewBox="0 0  24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.2891 4.71875C10.4297 4.875 10.5 5.05469 10.5 5.25781C10.5 5.46094 10.4297 5.64062 10.2891 5.79688L4.28906 11.7969C4.13281 11.9375 3.95312 12.0078 3.75 12.0078C3.54688 12.0078 3.36719 11.9375 3.21094 11.7969L0.210938 8.79688C0.0703125 8.64062 0 8.46094 0 8.25781C0 8.05469 0.0703125 7.875 0.210938 7.71875C0.367188 7.57812 0.546875 7.50781 0.75 7.50781C0.953125 7.50781 1.13281 7.57812 1.28906 7.71875L3.75 10.2031L9.21094 4.71875C9.36719 4.57812 9.54688 4.50781 9.75 4.50781C9.95312 4.50781 10.1328 4.57812 10.2891 4.71875Z"
      fill="currentColor"
    />
  </svg>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  width: {
    type: [String, Number],
    default: '24',
  },
  height: {
    type: [String, Number],
    default: '24',
  },
})
</script>
