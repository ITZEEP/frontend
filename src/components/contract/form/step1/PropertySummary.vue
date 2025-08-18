<template>
  <section>
    <div class="flex items-center gap-2 mb-4">
      <i class="fa-solid fa-house text-yellow-primary"></i>
      <h2 class="text-lg font-semibold">제2조 (임대물건의 표시)</h2>
    </div>

    <div class="rounded-xl bg-gray-50 p-5">
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-sm">
        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">소재지:</dt>
          <dd class="font-medium">{{ fullAddress }}</dd>
        </div>

        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">건물유형:</dt>
          <dd class="font-medium">{{ residenceTypeLabel }}</dd>
        </div>

        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">전용면적:</dt>
          <dd class="font-medium">{{ formatArea(basic?.exclusiveArea) }}</dd>
        </div>

        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">층수:</dt>
          <dd class="font-medium">{{ basic?.homeFloor != null ? basic.homeFloor + '층' : '-' }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ basic: { type: Object, default: null } })
const basic = computed(() => props.basic)

const fullAddress = computed(() => {
  const a1 = basic.value?.homeAddr1 ?? ''
  const a2 = basic.value?.homeAddr2 ?? ''
  return (a1 + ' ' + a2).trim() || '-'
})

const residenceTypeLabel = computed(() => {
  const map = {
    APARTMENT: '아파트',
    OFFICETEL: '오피스텔',
    HOUSE: '단독/다가구',
    VILLA: '빌라/연립',
    ETC: '기타',
  }
  return map[basic.value?.residenceType] ?? basic.value?.residenceType ?? '-'
})

function formatArea(n) {
  if (n == null) return '-'
  return `${Number(n)}㎡`
}
</script>
