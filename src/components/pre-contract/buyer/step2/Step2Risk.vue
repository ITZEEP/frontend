<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <!-- 불리언 기반 조건 분기 -->
    <Step2RiskResult v-if="isRisk" />
    <Step2RiskCheck v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'

const route = useRoute()
const contractChatId = route.params.id

import Step2RiskCheck from './Step2RiskCheck.vue'
import Step2RiskResult from './Step2RiskResult.vue'

const isRisk = ref(null)

// ✅ 로컬스토리지에서 값 불러와 store에 반영
onMounted(async () => {
  try {
    // 1. API에서 risk 여부 받아오기
    const { data } = await buyerApi.getCheckRisk(contractChatId) // contractChatId 필요하면 전달

    // 2. 불린값인지 확인
    if (typeof data === 'boolean') {
      isRisk.value = data
    }
  } catch (error) {
    console.error('risk_check 가져오기 실패 ❌', error)
  }
})
</script>
