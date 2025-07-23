<template>
  <div class="white-box">
    <div class="flex items-center gap-2 mb-3">
      <SofaIcon class="text-yellow-primary" />
      <h3 class="font-semibold">내부 시설</h3>
    </div>
    <ul class="grid grid-cols-3 gap-2 text-sm text-gray-700">
      <li v-for="item in items" :key="item" class="flex items-center gap-1">
        <CheckIcon class="text-yellow-primary w-4 h-4" /> {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import SofaIcon from '@/assets/icons/SofaIcon.vue'
import CheckIcon from '@/assets/icons/CheckIcon.vue'

const props = defineProps({
  items: Array,
})

const items = props.items
</script>
