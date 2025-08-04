<template>
  <div class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
    <p class="text-sm text-gray-800">{{ title }}</p>
    <p class="text-xs text-gray-500 mt-1">{{ time }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  time: String,
})
</script>
