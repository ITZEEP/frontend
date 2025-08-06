<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- 상단 타이틀 및 뒤로가기 -->
    <div class="flex items-center space-x-2">
      <router-link to="/homes" class="text-gray-600 hover:text-black">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </router-link>
      <h1 class="text-xl font-semibold">매물 정보 수정</h1>
    </div>

    <!-- 기본 정보 (읽기 전용) -->
    <section class="bg-white rounded-xl shadow-md p-6">
      <BasicInfoForm :listing="listing" readonly />
    </section>

    <!-- 가격 정보 -->
    <section class="bg-white rounded-xl shadow-md p-6">
      <PriceInfoForm v-model="listing" />
    </section>

    <!-- 방/세부 정보 -->
    <section class="bg-white rounded-xl shadow-md p-6">
      <RoomInfoForm v-model="listing" />
    </section>

    <!-- 시설 정보 -->
    <section class="bg-white rounded-xl shadow-md p-6">
      <FacilityInfoForm v-model="listing" />
    </section>

    <!-- 이미지 업로더 -->
    <section class="bg-white rounded-xl shadow-md p-6">
      <ImageUploader v-model="listing.images" />
      <p class="text-sm text-gray-500 mt-2">※ 최대 10장까지 업로드 가능합니다.</p>
    </section>

    <!-- 에러 메시지 -->
    <div v-if="error" class="text-red-500 font-semibold">{{ error }}</div>

    <!-- 저장 및 취소 버튼 -->
    <div class="grid grid-cols-2 gap-4 h-12">
      <BaseButton variant="outline" @click="cancelUpdate" :disabled="isLoading">취소</BaseButton>
      <BaseButton variant="primary" @click="updateListingData" :disabled="isLoading">
        {{ isLoading ? '저장 중...' : '저장하기' }}
      </BaseButton>
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

//  API 함수 가져오기
import { fetchListingById, updateListing } from '@/apis/listing.js'

const route = useRoute()
const router = useRouter()
const listingId = route.params.id

const listing = ref({})
const originalListing = ref({})
const isLoading = ref(false)
const error = ref(null)

//  데이터 조회 (mounted)
onMounted(async () => {
  try {
    isLoading.value = true
    listing.value = await fetchListingById(listingId)
    originalListing.value = JSON.parse(JSON.stringify(listing.value)) // 딥카피
  } catch (err) {
    error.value = '데이터를 불러오는 데 실패했습니다.'
    console.error('조회 실패:', err)
  } finally {
    isLoading.value = false
  }
})

//  저장 버튼 클릭 시 호출
const updateListingData = async () => {
  try {
    isLoading.value = true
    error.value = null
    await updateListing(listingId, listing.value)
    router.push('/homes')
  } catch (err) {
    error.value = '저장 중 오류가 발생했습니다.'
    console.error('저장 실패:', err)
  } finally {
    isLoading.value = false
  }
}

// ✅ 취소 버튼
const cancelUpdate = () => {
  const hasChanges = JSON.stringify(listing.value) !== JSON.stringify(originalListing.value)
  if (hasChanges) {
    const confirmed = confirm('작업 중인 내용이 있습니다. 정말 취소하시겠습니까?')
    if (!confirmed) return
  }
  router.push('/homes')
}
</script>
