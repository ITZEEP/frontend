<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <StepProgressIndicator :currentStep="currentStep" />

    <section class="bg-white rounded-xl shadow-md p-6 space-y-4">
      <component :is="currentStepComponent" v-model:form="form" />
    </section>

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
import axios from 'axios'

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
  residenceType: '',
  leaseType: '',
  addr1: '',
  addr2: '',

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
  options: [],
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
  images: [], // File[]
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
    submitForm()
  }
}

function goToPreviousStep() {
  if (currentStep.value > 1) {
    router.push({ query: { step: currentStep.value - 1 } })
  }
}

function validateCurrentStep() {
  const f = form.value
  switch (currentStep.value) {
    case 1:
      return f.residenceType !== '' && f.leaseType !== ''
    case 2:
      return Number(f.deposit) > 0 || Number(f.monthly) > 0
    default:
      return true
  }
}

async function submitForm() {
  const f = form.value

  const selectedUtilities = Object.entries(f.utilities)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const payload = new FormData()
  payload.append('houseType', f.residenceType)
  payload.append('dealType', f.leaseType)
  payload.append('address', `${f.addr1} ${f.addr2}`)
  payload.append('deposit', f.deposit)
  payload.append('monthly', f.monthly)
  payload.append('maintenanceFee', f.maintenanceFee)
  payload.append('exclusiveArea', f.exclusiveArea)
  payload.append('roomCount', f.roomCount)
  payload.append('bathroomCount', f.bathroomCount)
  payload.append('floor', f.floor)
  payload.append('totalFloors', f.totalFloors)
  payload.append('approvalDate', f.approvalDate)
  payload.append('direction', f.direction)
  f.options.forEach((option) => payload.append('options', option))
  selectedUtilities.forEach((util) => payload.append('utilities', util))
  payload.append('description', f.description)
  f.images.forEach((file) => payload.append('images', file))

  try {
    await axios.post('/api/homes', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    alert('등록이 완료되었습니다.')
    router.push('/homes')
  } catch (error) {
    console.error('등록 실패:', error)
    alert('등록 중 오류가 발생했습니다.')
  }
}
</script>
