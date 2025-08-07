<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StepProgressIndicator from '@/components/homes/homecreate/StepProgressIndicator.vue'
import Step1BasicInfo from '@/components/homes/homecreate/Step1BasicInfo.vue'
import Step2PriceInfo from '@/components/homes/homecreate/Step2PriceInfo.vue'
import Step3DetailInfo from '@/components/homes/homecreate/Step3DetailInfo.vue'
import Step4ImageUpload from '@/components/homes/homecreate/Step4ImageUpload.vue'
import BaseButton from '@/components/common/BaseButton.vue'

import { createListing } from '@/apis/listing.js'

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

const form = reactive({
  residenceType: '',
  leaseType: '',
  addr1: '',
  addr2: '',
  depositPrice: '',
  monthlyRent: '',
  maintenanceFee: '',
  supplyArea: 0,
  exclusiveArea: 0,
  roomCnt: 0,
  bathroomCount: 0,
  homeFloor: 0,
  buildingTotalFloors: 0,
  buildDate: '', // string "yyyy-MM-dd"
  homeDirection: '',
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
  images: [],
})

const stepComponent = computed(() => stepComponents[currentStep.value - 1])

const updateForm = (updatedFields) => {
  Object.assign(form, updatedFields)
}

const goToStep = (step) => {
  router.push({ query: { step: step.toString() } })
}

const utilityIdMap = {
  electricity: 1,
  gas: 2,
  water: 3,
  internet: 4,
  cableTV: 5,
  heating: 6,
}

const handleSubmit = async () => {
  try {
    const maintenanceFees = Object.keys(form.utilities)
      .filter((key) => form.utilities[key])
      .map((key) => ({
        maintenanceId: utilityIdMap[key],
        fee: 0,
      }))

    const payload = {
      ...form,
      options: Array.isArray(form.options) ? form.options.join(',') : '',
      images: form.images.map((img) => img.url),
      maintenanceFees: maintenanceFees,
    }

    console.log('최종 제출 데이터:', payload)
    await createListing(payload)
    alert('매물 등록 완료')
    router.push('/')
  } catch (e) {
    console.error('등록 실패', e)
    alert('매물 등록 실패')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <StepProgressIndicator :currentStep="currentStep" />
    <component :is="stepComponent" :form="form" @update:form="updateForm" />
    <div class="flex justify-between mt-10">
      <BaseButton v-if="currentStep > 1" @click="goToStep(currentStep - 1)">이전</BaseButton>
      <div class="ml-auto">
        <BaseButton v-if="currentStep < stepComponents.length" @click="goToStep(currentStep + 1)">
          다음
        </BaseButton>
        <BaseButton v-else @click="handleSubmit" class="ml-2">저장</BaseButton>
      </div>
    </div>
  </div>
</template>
