<template>
  <div class="white-box">
    <div class="flex items-center gap-2 mb-3">
      <CalculatorIcon class="text-yellow-primary" />
      <h3 class="font-semibold">관리비 정보</h3>
    </div>
    <div class="text-sm mb-2">
      월 관리비: <strong>{{ home.maintenance_fee }}만원</strong>
    </div>
    <div class="grid grid-cols-3 gap-1 text-sm text-gray-700">
      <div v-for="item in items" :key="item.item_name" class="flex items-center gap-1">
        <CheckIcon class="text-yellow-primary w-4 h-4" /> {{ item.item_name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import CalculatorIcon from '@/assets/icons/CalculatorIcon.vue'
import CheckIcon from '@/assets/icons/CheckIcon.vue'

const props = defineProps({
  home: Object,
  items: Array,
})

const home = props.home
const items = props.items
</script>
