<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- 이미지 갤러리 -->
    <ImageGallery :images="images" />

    <div v-if="listing" class="mt-6 space-y-10">
      <ListingBasicInfo :listing="listing" />
      <RoomDetails :listing="listing" />

      <!-- TravelMap 컴포넌트 추가 -->
      <TravelMap
        :title="listing.type + ' 매물 위치'"
        :address="listing.gu + ' ' + listing.dong"
        class="rounded-md shadow-md"
      />

      <div class="w-full flex gap-4">
        <BaseButton class="w-full" variant="primary" size="lg" @click="goChat">
          연락하기
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

const route = useRoute()
const router = useRouter()
const id = Number(route.params.no)

const listing = ref(null)
const images = ref([])

const listings = [
  {
    id: 1,
    type: '원룸',
    deposit: 500,
    monthly: 40,
    gu: '중구',
    dong: '명동',
    area: 15,
    floor: 3,
    likes: 12,
    views: 80,
    chats: 5,
    verified: true,
    maintenance: 5,
    image: 'https://source.unsplash.com/random/400x300?room1',
  },
  {
    id: 2,
    type: '투룸',
    deposit: 1000,
    monthly: 60,
    gu: '강남구',
    dong: '역삼동',
    area: 25,
    floor: 10,
    likes: 20,
    views: 150,
    chats: 10,
    verified: false,
    maintenance: 8,
    image: 'https://source.unsplash.com/random/400x300?room2',
  },
]

onMounted(() => {
  listing.value = listings.find((item) => item.id === id)
  if (listing.value) {
    const baseUrl = listing.value.image
    if (baseUrl.includes('?')) {
      images.value = [baseUrl, baseUrl + '&2', baseUrl + '&3']
    } else {
      images.value = [baseUrl, baseUrl + '?2', baseUrl + '?3']
    }
  } else {
    images.value = []
  }
})

function goChat() {
  router.push('/chat')
}
</script>
