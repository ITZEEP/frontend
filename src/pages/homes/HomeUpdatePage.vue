<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="flex items-center space-x-2">
      <router-link to="/homes" class="text-gray-600 hover:text-black">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <h1 class="text-xl font-semibold">매물 정보 수정</h1>
    </div>

    <div v-if="isLoading && !listing.homeId" class="text-center text-gray-500">
      매물 정보를 불러오는 중입니다...
    </div>

    <div v-else-if="listing.homeId" class="space-y-6">
      <section class="bg-white rounded-xl shadow-md p-6">
        <BasicInfoForm v-model:form="listing" />
      </section>

      <section class="bg-white rounded-xl shadow-md p-6">
        <PriceInfoForm v-model:form="listing" />
      </section>

      <section class="bg-white rounded-xl shadow-md p-6">
        <RoomInfoForm v-model:form="listing" />
      </section>

      <section class="bg-white rounded-xl shadow-md p-6">
        <FacilityInfoForm v-model:form="listing" />
      </section>

      <section class="bg-white rounded-xl shadow-md p-6">
        <ImageUploader
          v-model:images="listing.imageUrls"
          v-model:newImages="newImages"
          @image-deleted="handleImageDelete"
        />
        <p class="text-sm text-gray-500 mt-2">※ 최대 10장까지 업로드 가능합니다.</p>
      </section>

      <section class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-lg font-semibold mb-2">상세 설명</h2>
        <textarea
          v-model="listing.description"
          :maxlength="1000"
          placeholder="구조, 특징, 주변 환경 등을 자유롭게 작성해주세요. 1000자 이내 권장"
          class="w-full border rounded p-3 resize-none min-h-[100px] focus:outline-yellow-500"
        ></textarea>
        <div class="text-right text-xs text-gray-500 mt-1">
          {{ listing.description?.length ?? 0 }}/1000
        </div>
      </section>

      <div v-if="error" class="text-red-500 font-semibold">{{ error }}</div>

      <div class="grid grid-cols-2 gap-4 h-12">
        <BaseButton variant="outline" @click="cancelUpdate" :disabled="isSaving">취소</BaseButton>
        <BaseButton variant="primary" @click="updateListingData" :disabled="isSaving">
          {{ isSaving ? '저장 중...' : '저장하기' }}
        </BaseButton>
      </div>
    </div>

    <div v-else class="text-center text-red-500">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import BasicInfoForm from '@/components/homes/homeupdate/BasicInfoForm.vue'
import PriceInfoForm from '@/components/homes/homeupdate/PriceInfoForm.vue'
import RoomInfoForm from '@/components/homes/homeupdate/RoomInfoForm.vue'
import FacilityInfoForm from '@/components/homes/homeupdate/FacilityInfoForm.vue'
import ImageUploader from '@/components/homes/homeupdate/ImageUploader.vue'
import { fetchListingById, updateListing } from '@/apis/listing.js'

const route = useRoute()
const router = useRouter()
const listingId = route.params.id

const listing = ref({})
const originalListing = ref({})
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref(null)

const newImages = ref([])
const deletedImageIds = ref([])

onMounted(async () => {
  try {
    isLoading.value = true
    const response = await fetchListingById(listingId)
    listing.value = response
    originalListing.value = JSON.parse(JSON.stringify(response))
  } catch (err) {
    error.value = '데이터를 불러오는 데 실패했습니다.'
    console.error('조회 실패:', err)
  } finally {
    isLoading.value = false
  }
})

const handleImageDelete = (imageId) => {
  const numericId = parseInt(imageId, 10)
  if (!isNaN(numericId) && !deletedImageIds.value.includes(numericId)) {
    deletedImageIds.value.push(numericId)
  }
}

const updateListingData = async () => {
  try {
    isSaving.value = true
    error.value = null

    const formData = new FormData()

    // 백엔드 DTO에 존재하는 필드만 FormData에 개별적으로 추가
    const fieldsToAppend = {
      addr1: listing.value.addr1,
      addr2: listing.value.addr2,
      residenceType: listing.value.residenceType,
      leaseType: listing.value.leaseType,
      depositPrice: listing.value.depositPrice ?? 0,
      monthlyRent: listing.value.monthlyRent ?? 0,
      maintenanceFee: listing.value.maintenanceFee ?? 0,
      roomCnt: listing.value.roomCnt ?? 0,
      supplyArea: listing.value.supplyArea ?? 0.0,
      exclusiveArea: listing.value.exclusiveArea ?? 0.0,
      buildDate: listing.value.buildDate,
      homeFloor: listing.value.homeFloor ?? 0,
      buildingTotalFloors: listing.value.buildingTotalFloors ?? 0,
      homeDirection: listing.value.homeDirection,
      bathroomCnt: listing.value.bathroomCnt ?? 0,
      isPet: listing.value.isPet,
      isParking: listing.value.isParking,
    }

    // 모든 필드를 FormData에 직접 추가
    for (const key in fieldsToAppend) {
      if (Object.prototype.hasOwnProperty.call(fieldsToAppend, key)) {
        const value = fieldsToAppend[key]
        if (value !== null && typeof value !== 'undefined') {
          formData.append(key, value)
        }
      }
    }

    // 배열 필드들을 명시적으로 FormData에 추가
    ;(listing.value.facilityItemIds || []).forEach((id) => {
      formData.append('facilityItemIds', id)
    })
    ;(listing.value.maintenanceFees || []).forEach((feeItem, index) => {
      formData.append(`maintenanceFees[${index}].maintenanceId`, feeItem.maintenanceId)
      formData.append(`maintenanceFees[${index}].fee`, feeItem.fee ?? 0)
    })
    ;(deletedImageIds.value || []).forEach((id) => {
      formData.append('deleteImageIds', id)
    })

    // 파일 필드 추가
    if (newImages.value && newImages.value.length > 0) {
      newImages.value.forEach((img) => {
        formData.append('newImages', img.file)
      })
    }

    await updateListing(listingId, formData)
    router.push('/homes')
  } catch (err) {
    const errorMessage = err.response?.data?.message || '저장 중 오류가 발생했습니다.'
    error.value = errorMessage
    console.error('저장 실패:', err)
  } finally {
    isSaving.value = false
  }
}

const cancelUpdate = () => {
  const hasChanges = JSON.stringify(listing.value) !== JSON.stringify(originalListing.value)
  if (hasChanges) {
    const confirmed = confirm('작업 중인 내용이 있습니다. 정말 취소하시겠습니까?')
    if (!confirmed) return
  }
  router.push('/homes')
}
</script>
