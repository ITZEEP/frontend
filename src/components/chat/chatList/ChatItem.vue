<template>
  <div class="white-box hover:bg-yellow-50 cursor-pointer p-4 border-b">
    <h3 class="text-base font-semibold text-gray-800">
      {{ room.title }}
    </h3>
    <p class="text-sm text-gray-500 truncate">
      {{ room.latest }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
})

const room = props.room
</script>

<style scoped></style>
