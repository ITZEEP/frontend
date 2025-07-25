<script setup>
import { computed, h, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// 레이아웃 공통
import PreContractLayout from '@/components/pre-contract/layout/PreContractLayout.vue'

// buyer 컴포넌트
import BuyerStep1 from '@/components/pre-contract/buyer/Step1SelectHome.vue'
import BuyerStep2 from '@/components/pre-contract/buyer/Step2RiskCheck.vue'
import BuyerStep3 from '@/components/pre-contract/buyer/Step03Verification.vue'
import BuyerStep4 from '@/components/pre-contract/buyer/Step4ContractTerms.vue'
import BuyerStep5 from '@/components/pre-contract/buyer/Step5Environment.vue'
import BuyerStep6 from '@/components/pre-contract/buyer/Step06Confirm.vue'

// owner 컴포넌트
import OwnerStep1 from '@/components/pre-contract/owner/step1/Step1BasicInfo.vue'
import OwnerStep2 from '@/components/pre-contract/owner/step2/Step2Verification.vue'
import OwnerStep3 from '@/components/pre-contract/owner/step3/Step3ContractTerms.vue'
import OwnerStep4 from '@/components/pre-contract/owner/step4/Step4LivingConditions.vue'
import OwnerStep5 from '@/components/pre-contract/owner/step5/Step5UploadTerms.vue'
import OwnerStep6 from '@/components/pre-contract/owner/step6/Step6Confirm.vue'
import { usePreContractStore } from '@/stores/ownerPreContractStore'

// 스토어 불러오기
const store = usePreContractStore()

// 라우터 정보
const route = useRoute()
const role = computed(() => route.params.role)
const step = computed(() => Number(route.query.step) || 1)
const contractId = computed(() => route.params.id)

onMounted(() => {
  if (store.lastInitializedContractId !== contractId.value) {
    store.resetAll()
    store.lastInitializedContractId = contractId.value
  }
})

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
    4: OwnerStep4,
    5: OwnerStep5,
    6: OwnerStep6,
  },
}

// 서브스텝이 있는 step 목록
const stepsWithSubStep = {
  3: OwnerStep3, // step 3만 예시로
}

// 현재 렌더링할 컴포넌트 계산
const currentStepComponent = (subStep) => {
  const roleSteps = stepComponentsMap[role.value]
  const subStepComp = stepsWithSubStep[step.value]

  if (role.value === 'owner' && subStepComp) {
    return () => h(subStepComp, { subStep })
  }

  const comp = roleSteps?.[step.value]
  return typeof comp === 'function' ? comp() : comp
}
</script>

<template>
  <section class="pre-contract-page">
    <PreContractLayout :currentStep="step" :role="role">
      <template #default="{ subStep }">
        <component :is="currentStepComponent(subStep)" />
      </template>
    </PreContractLayout>
  </section>
</template>
