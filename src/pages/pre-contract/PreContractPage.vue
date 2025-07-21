<template>
  <section class="pre-contract-page">
    <PreContractLayout :currentStep="step" :role="role">
      <!-- 단계별 컴포넌트 동적 렌더링 -->
      <component :is="currentStepComponent" />
    </PreContractLayout>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 레이아웃 공통
import PreContractLayout from '@/components/pre-contract/owner/PreContractLayout.vue'

// buyer 컴포넌트
import BuyerStep1 from '@/components/pre-contract/buyer/Step1SelectHome.vue'
import BuyerStep2 from '@/components/pre-contract/buyer/Step2RiskCheck.vue'
import BuyerStep3 from '@/components/pre-contract/buyer/Step03Verification.vue'
import BuyerStep4 from '@/components/pre-contract/buyer/Step4ContractTerms.vue'
import BuyerStep5 from '@/components/pre-contract/buyer/Step5Environment.vue'
import BuyerStep6 from '@/components/pre-contract/buyer/Step06Confirm.vue'

// owner 컴포넌트
import OwnerStep1 from '@/components/pre-contract/owner/Step1BasicInfo.vue'
import OwnerStep2 from '@/components/pre-contract/owner/Step2Verification.vue'
import OwnerStep3 from '@/components/pre-contract/owner/Step3FacilityResponsibility.vue'
import OwnerStep4 from '@/components/pre-contract/owner/Step4ContractTerms.vue'
import OwnerStep5 from '@/components/pre-contract/owner/Step5Confirm.vue'
import OwnerStep6 from '@/components/pre-contract/owner/Step6UploadTerms.vue'

// 라우터 정보 가져오기
const route = useRoute()
const role = computed(() => route.params.role) // buyer or owner
const step = computed(() => Number(route.query.step) || 1)

// 각 role별 단계별 컴포넌트 매핑
const stepComponentsMap = {
  buyer: {
    1: BuyerStep1,
    2: BuyerStep2,
    3: BuyerStep3,
    4: BuyerStep4,
    5: BuyerStep5,
    6: BuyerStep6,
  },
  owner: {
    1: OwnerStep1,
    2: OwnerStep2,
    3: OwnerStep3,
    4: OwnerStep4,
    5: OwnerStep5,
    6: OwnerStep6,
  },
}

const currentStepComponent = computed(() => {
  const roleSteps = stepComponentsMap[role.value]
  return roleSteps ? roleSteps[step.value] : null
})
</script>

<style scoped></style>
