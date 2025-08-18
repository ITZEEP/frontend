<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <StepProgressIndicator :currentStep="currentStep" />
    <component :is="stepComponent" :form="form" @update:form="updateForm" />

    <div class="flex justify-between mt-8">
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
import { computed, reactive, ref, toRaw, watch } from 'vue'
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
  bathroomCnt: 0,
  homeFloor: 0,
  buildingTotalFloors: 0,
  buildDate: '',
  homeDirection: '',
  facilityItemIds: [],
  maintenanceFees: [],
  description: '',
  images: [],
  isPet: false,
  isParking: false,
  area: 0,
  landCategory: '',
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

    const rawForm = toRaw(form)

    // ⭐ 필수 필드에 대한 유효성 검사 로직
    if (!rawForm.residenceType) {
      alert('매물 종류를 선택해주세요.')
      goToStep(1)
      return
    }
    if (!rawForm.leaseType) {
      alert('거래 유형을 선택해주세요.')
      goToStep(1)
      return
    }
    if (!rawForm.addr1) {
      alert('주소를 입력해주세요.')
      goToStep(1)
      return
    }
    if (safeNumber(rawForm.exclusiveArea) <= 0) {
      alert('전용 면적을 0보다 크게 입력해주세요.')
      goToStep(3)
      return
    }
    // 다른 필수 필드들에 대한 유효성 검사를 여기에 추가할 수 있습니다.

    const payload = {
      addr1: rawForm.addr1,
      addr2: rawForm.addr2,
      residenceType: rawForm.residenceType,
      leaseType: rawForm.leaseType,
      depositPrice: safeNumber(rawForm.depositPrice),
      monthlyRent: safeNumber(rawForm.monthlyRent),
      maintenanceFee: safeNumber(rawForm.maintenanceFee),
      supplyArea: safeNumber(rawForm.supplyArea),
      exclusiveArea: safeNumber(rawForm.exclusiveArea),
      roomCnt: safeNumber(rawForm.roomCnt),
      bathroomCnt: safeNumber(rawForm.bathroomCnt),
      homeFloor: safeNumber(rawForm.homeFloor),
      buildingTotalFloors: safeNumber(rawForm.buildingTotalFloors),
      buildDate: rawForm.buildDate,
      homeDirection: rawForm.homeDirection,
      isPet: rawForm.isPet,
      isParking: rawForm.isParking,
      area: safeNumber(rawForm.area),
      landCategory: rawForm.landCategory,
      facilityItemIds: rawForm.facilityItemIds,
      maintenanceFees: rawForm.maintenanceFees,
      description: rawForm.description,
    }

    console.log('📦 최종 제출 데이터 (payload):', payload)
    console.log('🖼️ 업로드할 이미지 파일:', rawForm.images)

    // createListing 함수에 DTO 객체와 이미지 배열을 분리해서 전달
    const response = await createListing(payload, rawForm.images)

    const homeId = response
    console.log('✅ API 응답으로 받은 homeId:', homeId)

    alert('본인 인증 완료 후 등록이 완료됩니다.')
    router.push(`/homes/create/${homeId}/verification`)
  } catch (e) {
    console.error('❌ 등록 실패:', e)
    alert('매물 등록 실패')
  }
}
</script>
