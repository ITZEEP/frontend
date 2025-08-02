<template>
  <div class="space-y-6">
    <!-- 전세 자금 대출 -->
    <ToggleRadio
      v-model="loanPlan"
      label="전세 자금 대출을 계획하고 계신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 보증 보험 가입 -->
    <ToggleRadio
      v-model="insurancePlan"
      label="전세 보증금 반환 보증 보험 가입을 계획하고 계신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 입주 예정일 -->
    <div>
      <BaseInput
        v-model="expectedMoveInDate"
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
          { label: '1년', value: 'YEAR_1' },
          { label: '2년', value: 'YEAR_2' },
          { label: '2년 이상', value: 'YEAR_OVER_2' },
        ]"
      />
    </div>

    <!-- 재계약 의사 -->
    <ToggleRadio
      v-model="renewalIntent"
      label="재계약(갱신) 의사가 있으신가요?"
      :options="[
        { label: '있음', value: 'YES' },
        { label: '없음', value: 'NO' },
        { label: '미정', value: 'UNDECIDED' },
      ]"
    />
  </div>
  <BaseButton @click="updateTenantStep1"> 테스트 버튼 </BaseButton>
</template>

<script setup>
// 버튼을 눌렀을때 axios가 실행되게 하는걸 어디서 해야하나?
// 라우터 쪽 확인해보기

import { ref, onMounted, watch } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { usePreContractStore } from '@/stores/preContract'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const store = usePreContractStore()

const route = useRoute()
const contractChatId = route.params.id

onMounted(async () => {
  store.canProceed = false
  try {
    const { data } = await buyerApi.selectTenantStep1(contractChatId)
    console.log(data)

    loanPlan.value = data.loanPlan
    console.log(loanPlan.value)
    insurancePlan.value = data.insurancePlan
    console.log(insurancePlan.value)
    expectedMoveInDate.value = data.expectedMoveInDate
    console.log(expectedMoveInDate.value)
    contractDuration.value = data.contractDuration
    console.log(contractDuration.value)
    renewalIntent.value = data.renewalIntent
    console.log(renewalIntent.value)
  } catch (error) {
    console.error('step1 조회 실패 ❌', error)
  }
})

const loanPlan = ref(null)
const insurancePlan = ref(null)
const expectedMoveInDate = ref('')
const contractDuration = ref('')
const renewalIntent = ref('')

watch(
  [loanPlan, insurancePlan, expectedMoveInDate, contractDuration, renewalIntent],
  ([loan, insurance, moveIn, contract, renewal]) => {
    const allFilled =
      loan !== null && insurance !== null && moveIn !== '' && contract !== '' && renewal !== ''
    store.setCanProceed(allFilled)
  },
)

const updateTenantStep1 = async () => {
  alert(55255)
  console.log('contractDuration.value:', contractDuration.value)
  console.log('typeof contractDuration.value:', typeof contractDuration.value)
  const step1DTO = {
    loanPlan: loanPlan.value,
    insurancePlan: insurancePlan.value,
    expectedMoveInDate: expectedMoveInDate.value,
    contractDuration: contractDuration.value,
    renewalIntent: renewalIntent.value,
  }

  try {
    await buyerApi.updateTenantStep1(contractChatId, step1DTO)
    alert('Step1 전세 정보가 저장되었습니다! ✅')
  } catch (error) {
    // API 파일에서 에러를 받아서 사용자에게 알리거나 UI 반응을 주는 게 목적 👉 사용자에게 UI 반응(알림, 메시지 등)을 주기 위한 처리
    console.error('step1 전세 저장 실패 ❌', error)
  }
}
</script>
