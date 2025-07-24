<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-6 sm:p-8">
    <h2 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">{{ title }}</h2>

    <div class="space-y-6">
      <slot></slot>
    </div>
  </div>
</template>
