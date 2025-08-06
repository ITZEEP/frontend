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

    <!-- 보증금 조정 여부 -->
    <div class="space-y-1">
      <ToggleRadio
        v-model="depositAdjustment"
        label="임대인에게 보증금/월세 조정을 제안하시겠습니까?"
        :options="[
          { label: '예', value: true },
          { label: '아니요', value: false },
        ]"
      />
      <p class="text-sm text-gray-500 text-left">
        '예' 선택시 계약서 작성 시 임대인에게 보증금/월세 조정을 제안합니다.
      </p>
    </div>

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
import { ref, onMounted, watch, watchEffect } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { usePreContractStore } from '@/stores/preContract'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'

const store = usePreContractStore()

const route = useRoute()
const contractChatId = route.params.id

// 페이지 조회
onMounted(async () => {
  store.canProceed = false
  try {
    const { data } = await buyerApi.selectTenantStep1(contractChatId)

    loanPlan.value = data.loanPlan
    insurancePlan.value = data.insurancePlan
    depositAdjustment.value = data.depositAdjustment
    expectedMoveInDate.value = data.expectedMoveInDate
    contractDuration.value = data.contractDuration
    renewalIntent.value = data.renewalIntent
  } catch (error) {
    console.error('step1 조회 실패 ❌', error)
  }
})

// 초기화
const loanPlan = ref(null)
const insurancePlan = ref(null)
const depositAdjustment = ref(null)
const expectedMoveInDate = ref('')
const contractDuration = ref('')
const renewalIntent = ref('')

// 빠진값이 없는지 확인
watch(
  [loanPlan, insurancePlan, depositAdjustment, expectedMoveInDate, contractDuration, renewalIntent],
  ([loan, insurance, deposit, moveIn, contract, renewal]) => {
    const allFilled =
      loan !== null &&
      insurance !== null &&
      deposit !== null &&
      moveIn !== '' &&
      contract !== '' &&
      renewal !== ''
    store.setCanProceed(allFilled)
  },
)

// 저장
const updateTenantStep1 = async () => {
  const step1DTO = {
    loanPlan: loanPlan.value,
    insurancePlan: insurancePlan.value,
    depositAdjustment: depositAdjustment.value,
    expectedMoveInDate: expectedMoveInDate.value,
    contractDuration: contractDuration.value,
    renewalIntent: renewalIntent.value,
  }

  try {
    await buyerApi.updateTenantStep1(contractChatId, step1DTO)
    alert('Step1 월세 정보가 저장되었습니다! ✅')
  } catch (error) {
    // API 파일에서 에러를 받아서 사용자에게 알리거나 UI 반응을 주는 게 목적 👉 사용자에게 UI 반응(알림, 메시지 등)을 주기 위한 처리
    console.error('step1 월세 저장 실패 ❌', error)
  }
}

watchEffect(() => {
  store.setTriggerSubmit(4, updateTenantStep1)
})
</script>
