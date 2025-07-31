<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <!-- 불리언 기반 조건 분기 -->
    <Step2RiskResult v-if="isRisk" />
    <Step2RiskCheck v-else />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePreContractStore } from '@/stores/preContract'

import Step2RiskCheck from './Step2RiskCheck.vue'
import Step2RiskResult from './Step2RiskResult.vue'

// Pinia store
const store = usePreContractStore()

// ✅ 로컬스토리지에서 값 불러와 store에 반영
onMounted(() => {
  const raw = localStorage.getItem('riskCheck')
  const parsed = raw === 'true' ? true : raw === 'false' ? false : undefined
  if (typeof parsed === 'boolean') {
    store.setRiskCheck(parsed)
  }
})

// ✅ computed 값으로 UI 조건 분기
const isRisk = computed(() => store.riskCheck)
</script>
