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

import { fetchListingById } from '@/apis/listing.js'

onMounted(async () => {
  try {
    listing.value = await fetchListingById(id)
    images.value = listing.value.images || []
  } catch (err) {
    console.error('매물 조회 실패:', err)
  }
})

const route = useRoute()
const router = useRouter()
const id = Number(route.params.no)

const listing = ref(null)
const images = ref([])

const listings = [
  {
    id: 1,
    type: '아파트',
    userName: '홍길동',
    addr1: '서울특별시 강남구 테헤란로 123',
    addr2: '301호',
    gu: '강남구',
    dong: '역삼동',
    depositPrice: 500000000,
    monthlyRent: 0,
    leaseType: '전세',
    maintenanceFee: 100000,
    roomCnt: 3,
    bathroomCount: 1,
    residenceType: '아파트',
    supplyArea: 84,
    area: 84, // convertToPyeong 함수 사용을 위해 추가
    homefloor: 3,
    floor: 3,
    buildingTotalFloors: 20,
    buildDate: '2020-01-01',
    moveInDate: '2025-09-01',
    isParkingAvailable: true,
    isPet: false,
    facilityItemIds: [1, 2, 3],
    options: ['에어컨', '냉장고'],
    homeDirection: 'S',
    imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    image: 'https://example.com/image1.jpg', // 리스트 카드에서 사용
    likes: 12,
    views: 80,
    chats: 5,
    verified: true,
  },
  {
    id: 2,
    type: '투룸',
    userName: '김철수',
    addr1: '서울특별시 중구 퇴계로 456',
    addr2: '902호',
    gu: '중구',
    dong: '명동',
    depositPrice: 100000000,
    monthlyRent: 600000,
    leaseType: '월세',
    maintenanceFee: 80000,
    roomCnt: 2,
    bathroomCount: 1,
    residenceType: '오피스텔',
    supplyArea: 50,
    area: 50,
    homefloor: 10,
    floor: 10,
    buildingTotalFloors: 15,
    buildDate: '2018-06-01',
    moveInDate: '2025-10-01',
    isParkingAvailable: false,
    isPet: true,
    facilityItemIds: [2, 4],
    options: ['세탁기', '전자레인지'],
    homeDirection: 'E',
    imageUrls: [
      'https://source.unsplash.com/random/400x300?room2',
      'https://source.unsplash.com/random/400x300?room2b',
    ],
    image: 'https://source.unsplash.com/random/400x300?room2',
    likes: 20,
    views: 150,
    chats: 10,
    verified: false,
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
