<template>
  <div class="space-y-6">
    <!-- 월세 자금 대출 -->
    <ToggleRadio
      v-model="loanPlan"
      label="월세 자금 대출을 계획하고 계신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 월세 보증 보험 가입 -->
    <ToggleRadio
      v-model="insurancePlan"
      label="월세 연체에 대비한 보증 보험 가입을 계획하고 계신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 입주 예정일 -->
    <div>
      <BaseInput
        v-model="moveInDate"
        type="date"
        label="입주 예정일을 선택해주세요"
        class="w-full"
      />
    </div>

    <!-- 계약 기간 -->
    <div class="space-y-2">
      <ToggleRadio
        v-model="contractDuration"
        label="계약 기간을 선택해주세요"
        :options="[
          { label: '1년', value: 1 },
          { label: '2년', value: 2 },
          { label: '2년 이상', value: 3 },
        ]"
      />
    </div>

    <!-- 재계약 의사 -->
    <ToggleRadio
      v-model="renewalIntent"
      label="재계약(갱신) 의사가 있으신가요?"
      :options="[
        { label: '있음', value: '있음' },
        { label: '없음', value: '없음' },
        { label: '미정', value: '미정' },
      ]"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()

const loanPlan = ref(null)
const insurancePlan = ref(null)
const moveInDate = ref('')
const contractDuration = ref('')
const renewalIntent = ref('')

watch(
  [loanPlan, insurancePlan, moveInDate, contractDuration, renewalIntent],
  ([loan, insurance, moveIn, contract, renewal]) => {
    const allFilled =
      loan !== null && insurance !== null && moveIn !== '' && contract !== '' && renewal !== ''
    store.setCanProceed(allFilled)
  },
)

onMounted(() => {
  store.canProceed = false
})
</script>
