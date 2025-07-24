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

    <!-- 기본 정보 -->
    <section class="bg-white rounded-xl shadow-md p-6">
      <BasicInfoForm :listing="listing" />
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

    <!-- 저장 및 취소 버튼 -->
    <div class="grid grid-cols-2 gap-4 h-12">
      <BaseButton variant="outline" @click="cancelUpdate">취소</BaseButton>
      <BaseButton variant="primary" @click="updateListing">저장하기</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 공통 버튼 컴포넌트
import BaseButton from '@/components/common/BaseButton.vue'

// 폼 컴포넌트들
import BasicInfoForm from '@/components/homes/homeupdate/BasicInfoForm.vue'
import PriceInfoForm from '@/components/homes/homeupdate/PriceInfoForm.vue'
import RoomInfoForm from '@/components/homes/homeupdate/RoomInfoForm.vue'
import FacilityInfoForm from '@/components/homes/homeupdate/FacilityInfoForm.vue'
import ImageUploader from '@/components/homes/homeupdate/ImageUploader.vue'

const route = useRoute()
const router = useRouter()
const listingId = route.params.id

// 매물 상태
const listing = ref({})

// 예시 데이터 로드
onMounted(() => {
  listing.value = {
    id: listingId,
    address: '서울시 강남구 테헤란로 123',
    type: '오피스텔',
    deposit: 1000,
    monthly: 45,
    maintenance: 5,
    netArea: 33.05,
    grossArea: 42.97,
    currentFloor: 10,
    totalFloors: 13,
    approvalDate: '2020-03-15',
    heating: '개별난방',
    parking: true,
    elevator: true,
    pet: false,
    images: [
      'https://source.unsplash.com/featured/?room',
      'https://source.unsplash.com/featured/?apartment',
    ],
  }
})

// 저장 버튼 클릭
const updateListing = () => {
  console.log('저장된 매물:', listing.value)
  // API 호출 후 이동 로직 작성 가능
}

// 취소 버튼 클릭
const cancelUpdate = () => {
  router.push('/homes')
}
</script>
