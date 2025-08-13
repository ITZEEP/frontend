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
        :address="processedAddress"
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

import { fetchListingById } from '@/apis/listing.js'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.no)

const listing = ref(null)
const images = ref([])
const isFavorite = ref(false)
const processedAddress = ref('')

onMounted(async () => {
  try {
    const data = await fetchListingById(id)
    console.log('✅ 매물 상세 API 응답:', data)

    if (data) {
      listing.value = data
      images.value = data.imageUrls || []

      if (data.addr1) {
        processedAddress.value = data.addr1
      } else {
        processedAddress.value = data.addr2 || '주소정보 없음'
      }

      console.log('최종 가공된 주소:', processedAddress.value)
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
