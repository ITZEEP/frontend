<template>
  <section
    class="flex flex-col gap-4 transition-opacity duration-300"
    :class="{ 'opacity-50 pointer-events-none': currentStep !== 2 }"
  >
    <div class="flex items-center gap-2 mb-2">
      <i class="fa-solid fa-calendar-days text-yellow-primary"></i>
      <h2 class="text-lg font-semibold">제3조 (임대차 기간 및 임료)</h2>
    </div>

    <div class="rounded-xl bg-gray-50 p-5">
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm">
        <!-- 계약기간 -->
        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">계약기간:</dt>
          <dd class="font-medium">{{ periodText }}</dd>
        </div>

        <!-- 보증금 -->
        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">보증금:</dt>
          <dd class="font-medium">{{ formatManWon(basic?.depositPrice) }}</dd>
        </div>

        <!-- 월세 -->
        <div
          v-if="basic?.monthlyRent && basic.monthlyRent !== 0"
          class="grid grid-cols-[80px_1fr] gap-y-2"
        >
          <dt class="text-gray-500">월세:</dt>
          <dd class="font-medium">{{ formatManWon(basic?.monthlyRent) }}</dd>
        </div>

        <!-- 관리비 -->
        <div class="grid grid-cols-[80px_1fr] gap-y-2">
          <dt class="text-gray-500">관리비:</dt>
          <dd class="font-medium">{{ formatManWon(basic?.maintenanceFee) }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  basic: { type: Object, default: null },
})

const route = useRoute()
const currentStep = computed(() => Number(route.query.step))

function fmtDate(d) {
  if (!d) return '-'
  return String(d)
}

const periodText = computed(() => {
  const s = fmtDate(props.basic?.contractStartDate)
  const e = fmtDate(props.basic?.contractEndDate)
  if (s === '-' && e === '-') return '-'
  return `${s} ~ ${e}`
})

function formatManWon(v) {
  if (v == null) return '-'
  const man = Math.round(Number(v) / 10000)
  if (man >= 10000) {
    const eok = Math.floor(man / 10000)
    const remainMan = man % 10000
    if (remainMan === 0) {
      return `${eok.toLocaleString()}억`
    }
    return `${eok.toLocaleString()}억 ${remainMan.toLocaleString()}만원`
  }
  return `${man.toLocaleString()}만원`
}
</script>
