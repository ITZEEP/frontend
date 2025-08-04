<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <StepProgressIndicator :currentStep="currentStep" />

    <section class="bg-white rounded-xl shadow-md p-6 space-y-4">
      <component :is="currentStepComponent" v-model:form="form" />
    </section>

    <!-- 버튼 영역 -->
    <div :class="currentStep === 1 ? 'flex justify-end' : 'flex justify-between'">
      <BaseButton v-if="currentStep > 1" variant="outline" @click="goToPreviousStep">
        이전
      </BaseButton>

      <BaseButton variant="primary" @click="goToNextStep">
        {{ currentStep < stepComponents.length ? '다음' : '제출' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StepProgressIndicator from '@/components/homes/homecreate/StepProgressIndicator.vue'
import Step1BasicInfo from '@/components/homes/homecreate/Step1BasicInfo.vue'
import Step2PriceInfo from '@/components/homes/homecreate/Step2PriceInfo.vue'
import Step3DetailInfo from '@/components/homes/homecreate/Step3DetailInfo.vue'
import Step4ImageUpload from '@/components/homes/homecreate/Step4ImageUpload.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const stepComponents = [Step1BasicInfo, Step2PriceInfo, Step3DetailInfo, Step4ImageUpload]
const route = useRoute()
const router = useRouter()
const currentStep = ref(1)

watch(
  () => route.query.step,
  (newStep) => {
    const stepNum = parseInt(newStep)
    if (!stepNum || stepNum < 1) currentStep.value = 1
    else if (stepNum > stepComponents.length) currentStep.value = stepComponents.length
    else currentStep.value = stepNum
  },
  { immediate: true },
)

const form = ref({
  // Step 1
  houseType: '',
  dealType: '',
  address: '',

  // Step 2
  deposit: '',
  monthly: '',
  maintenanceFee: '',

  // Step 3
  exclusiveArea: '',
  roomCount: '',
  bathroomCount: '',
  floor: '',
  totalFloors: '',
  approvalDate: '',
  direction: '',
  options: [], // 여기에 OptionChecklist에서 선택된 값(예: appliances 등)을 연결해서 사용 가능
  utilities: {
    electricity: false,
    gas: false,
    water: false,
    internet: false,
    cableTV: false,
    heating: false,
  },
  description: '',

  // Step 4
  images: [],
})

const currentStepComponent = computed(() => stepComponents[currentStep.value - 1])

function goToNextStep() {
  if (!validateCurrentStep()) {
    alert('필수 항목을 입력해주세요.')
    return
  }

  if (currentStep.value < stepComponents.length) {
    router.push({ query: { step: currentStep.value + 1 } })
  } else {
    console.log('제출 데이터:', form.value)
    alert('등록이 완료되었습니다.')
    router.push('/homes')
  }
}

function goToPreviousStep() {
  if (currentStep.value > 1) {
    router.push({ query: { step: currentStep.value - 1 } })
  }
}

// 스텝별 필수 항목 검사 함수
function validateCurrentStep() {
  const f = form.value
  switch (currentStep.value) {
    case 1:
      return f.houseType !== '' && f.dealType !== ''
    case 2:
      return Number(f.deposit) > 0 || Number(f.monthly) > 0
    default:
      return true
  }
}
</script>
