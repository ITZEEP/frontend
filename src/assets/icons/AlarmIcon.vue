<template>
  <svg
    :width="props.width"
    :height="props.height"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M20 36C22.21 36 24 37.79 24 40C24 42.21 22.21 44 20 44C17.79 44 16 42.21 16 40C16 37.79 17.79 36 20 36ZM32 14C32 10.8174 30.7357 7.76516 28.4853 5.51472C26.2348 3.26428 23.1826 2 20 2C16.8174 2 13.7652 3.26428 11.5147 5.51472C9.26428 7.76516 8 10.8174 8 14C8 28 2 32 2 32H38C38 32 32 28 32 14Z"
    />
  </svg>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  width: {
    type: [String, Number],
    default: '12',
  },
  height: {
    type: [String, Number],
    default: '12',
  },
})
</script>
