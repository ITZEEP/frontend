<template>
  <div class="max-w-4xl mx-auto p-6">
    <ImageGallery
      v-if="images.length > 0"
      :images="images"
      :homeId="id"
      :initialIsFavorite="isFavorite"
    />

    <div v-if="listing" class="mt-6 space-y-10">
      <ListingBasicInfo :listing="listing" />
      <RoomDetails :listing="listing" />

      <TravelMap
        :title="listing.residenceType + ' 매물 위치'"
        :address="listing.addr1 + ' ' + listing.addr2"
        class="rounded-md shadow-md"
      />

      <div class="w-full flex gap-4">
        <BaseButton class="w-full" variant="primary" size="lg" @click="goChat">
          연락하기
        </BaseButton>
        <BaseButton class="w-full" variant="secondary" size="lg" @click="goRiskCheck">
          <span class="w-full">사기위험도 분석</span>
        </BaseButton>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 mt-10">매물을 찾을 수 없습니다.</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ImageGallery from '@/components/homes/homedetails/ImageGallery.vue'
import ListingBasicInfo from '@/components/homes/homedetails/ListingBasicInfo.vue'
import RoomDetails from '@/components/homes/homedetails/RoomDetails.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import TravelMap from '@/components/travel/TravelMap.vue'

import { fetchListingById } from '@/apis/listing.js' // API 함수 import

const route = useRoute()
const router = useRouter()
const id = Number(route.params.no)

const listing = ref(null)
const images = ref([])
const isFavorite = ref(false) // 찜 상태를 서버에서 받아와 초기화

onMounted(async () => {
  try {
    const data = await fetchListingById(id)
    console.log('✅ 매물 상세 API 응답:', data)

    if (data) {
      listing.value = data
      images.value = data.imageUrls || []
      // 서버에서 찜 상태를 확인하는 API가 있다면 여기서 호출하여 isFavorite 초기화
      // 예를 들어, isFavorite.value = await fetchHomeLikeStatus(id)
    }
  } catch (err) {
    console.error('매물 조회 실패:', err)
  }
})

function goChat() {
  router.push('/chat')
}

function goRiskCheck() {
  router.push('/risk-check')
}
</script>
