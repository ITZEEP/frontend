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
  facilityItemIds: [], // 백엔드 DTO에 맞게 직접 사용
  maintenanceFeeItems: [], // 백엔드 DTO에 맞게 직접 사용
  description: '',
  images: [], // 파일 객체 배열
  isPet: false,
  isParking: false,
  area: 0,
  landCategory: '',
  // ... HomeCreateRequestDto의 다른 필드들도 여기에 포함
})

const stepComponent = computed(() => stepComponents[currentStep.value - 1])

const updateForm = (updatedFields) => {
  Object.assign(form, updatedFields)
}

const goToStep = (step) => {
  router.push({ query: { step: step.toString() } })
}

const handleSubmit = async () => {
  try {
    const safeNumber = (val) => {
      const num = Number(val)
      return isNaN(num) ? 0 : num
    }

    const payload = {
      addr1: form.addr1,
      addr2: form.addr2,
      residenceType: form.residenceType,
      leaseType: form.leaseType,
      depositPrice: safeNumber(form.depositPrice),
      monthlyRent: safeNumber(form.monthlyRent),
      maintenanceFee: safeNumber(form.maintenanceFee),
      supplyArea: safeNumber(form.supplyArea),
      exclusiveArea: safeNumber(form.exclusiveArea),
      roomCnt: safeNumber(form.roomCnt),
      bathroomCount: safeNumber(form.bathroomCount),
      homeFloor: safeNumber(form.homeFloor),
      buildingTotalFloors: safeNumber(form.buildingTotalFloors),
      buildDate: form.buildDate,
      homeDirection: form.homeDirection,
      isPet: form.isPet,
      isParkingAvailable: form.isParking,
      area: safeNumber(form.area),
      landCategory: form.landCategory,
      facilityItemIds: form.facilityItemIds,
      maintenanceFeeItems: form.maintenanceFeeItems,
    }

    console.log('📦 최종 제출 데이터 (payload):', payload)
    console.log('🖼️ 업로드할 이미지 파일:', form.images)

    const response = await createListing(payload, form.images)

    const homeId = response
    console.log('✅ API 응답으로 받은 homeId:', homeId)

    alert('매물 등록 완료')
    router.push(`/homes/create/${homeId}/verification`)
  } catch (e) {
    console.error('❌ 등록 실패:', e)
    alert('매물 등록 실패')
  }
}
</script>
