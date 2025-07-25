<template>
  <div class="flex">
    <!-- 필터 컴포넌트에 이벤트 핸들러 연결 -->
    <FilterSidebar @filter-change="onFilterChange" />

    <main class="flex-1 p-6 relative">
      <!-- 우측 상단 매물 등록 버튼 -->
      <button
        class="absolute top-4 right-4 bg-yellow-primary hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded z-10"
        type="button"
        @click="goCreatePage"
      >
        매물 등록
      </button>

      <h1 class="text-2xl font-bold mb-4">전체 매물</h1>

      <div class="mb-4 text-lg font-bold">
        {{ selectedGu }} 외 {{ otherCount }}지역
        <span class="text-yellow-primary">{{ filteredListings.length }}</span
        >개 매물
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListingCard v-for="listing in filteredListings" :key="listing.id" :listing="listing" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterSidebar from '@/components/homes/homecreate/FilterSidebar.vue'
import ListingCard from '@/components/homes/homecreate/ListingCard.vue'

const router = useRouter()

function goCreatePage() {
  router.push('/homes/create')
}

const selectedGu = ref('송파구')
const otherCount = 5 // 예시로 늘림

const listings = ref([
  {
    id: 1,
    image: 'https://placehold.co/300x200',
    deposit: 1000,
    monthly: 80,
    area: 25,
    floor: 2,
    gu: '송파구',
    dong: '잠실동',
    likes: 24,
    views: 300,
    chats: 12,
    verified: true,
    type: '월세',
    direction: '남향',
    floorRange: '2~5층',
    conditions: ['주차 가능', '엘리베이터'],
  },
  {
    id: 2,
    image: 'https://placehold.co/300x200',
    deposit: 3000,
    monthly: 70,
    area: 30,
    floor: 3,
    gu: '송파구',
    dong: '방이동',
    likes: 12,
    views: 200,
    chats: 6,
    verified: false,
    type: '월세',
    direction: '동향',
    floorRange: '2~5층',
    conditions: ['반려동물 가능'],
  },
  {
    id: 3,
    image: 'https://placehold.co/300x200',
    deposit: 1500,
    monthly: 50,
    area: 20,
    floor: 1,
    gu: '강남구',
    dong: '역삼동',
    likes: 10,
    views: 120,
    chats: 3,
    verified: true,
    type: '월세',
    direction: '남서향',
    floorRange: '1층',
    conditions: ['대출 가능'],
  },
  {
    id: 4,
    image: 'https://placehold.co/300x200',
    deposit: 5000,
    monthly: 0,
    area: 40,
    floor: 5,
    gu: '서초구',
    dong: '서초동',
    likes: 5,
    views: 60,
    chats: 1,
    verified: false,
    type: '전세',
    direction: '남향',
    floorRange: '6~9층',
    conditions: ['신축'],
  },
  {
    id: 5,
    image: 'https://placehold.co/300x200',
    deposit: 0,
    monthly: 0,
    area: 50,
    floor: 10,
    gu: '마포구',
    dong: '망원동',
    likes: 20,
    views: 220,
    chats: 10,
    verified: true,
    type: '매매',
    direction: '북향',
    floorRange: '10층 이상',
    conditions: ['주차 가능', '옥탑'],
  },
  {
    id: 6,
    image: 'https://placehold.co/300x200',
    deposit: 700,
    monthly: 30,
    area: 15,
    floor: 2,
    gu: '송파구',
    dong: '문정동',
    likes: 8,
    views: 90,
    chats: 2,
    verified: true,
    type: '월세',
    direction: '남동향',
    floorRange: '2~5층',
    conditions: ['반려동물 가능'],
  },
  {
    id: 7,
    image: 'https://placehold.co/300x200',
    deposit: 1200,
    monthly: 60,
    area: 22,
    floor: 4,
    gu: '강서구',
    dong: '화곡동',
    likes: 14,
    views: 150,
    chats: 7,
    verified: false,
    type: '월세',
    direction: '서향',
    floorRange: '2~5층',
    conditions: ['대출 가능'],
  },
  {
    id: 8,
    image: 'https://placehold.co/300x200',
    deposit: 0,
    monthly: 0,
    area: 35,
    floor: 7,
    gu: '중구',
    dong: '명동',
    likes: 6,
    views: 80,
    chats: 4,
    verified: true,
    type: '매매',
    direction: '동향',
    floorRange: '6~9층',
    conditions: ['엘리베이터', '옥탑'],
  },
  {
    id: 9,
    image: 'https://placehold.co/300x200',
    deposit: 2500,
    monthly: 0,
    area: 28,
    floor: 3,
    gu: '성동구',
    dong: '성수동',
    likes: 9,
    views: 110,
    chats: 5,
    verified: false,
    type: '전세',
    direction: '북동향',
    floorRange: '2~5층',
    conditions: ['신축', '복층'],
  },
  {
    id: 10,
    image: 'https://placehold.co/300x200',
    deposit: 900,
    monthly: 40,
    area: 18,
    floor: 2,
    gu: '동대문구',
    dong: '장안동',
    likes: 7,
    views: 100,
    chats: 3,
    verified: true,
    type: '월세',
    direction: '남향',
    floorRange: '2~5층',
    conditions: ['주차 가능', '엘리베이터'],
  },
  {
    id: 11,
    image: 'https://placehold.co/300x200',
    deposit: 1100,
    monthly: 55,
    area: 24,
    floor: 1,
    gu: '강남구',
    dong: '논현동',
    likes: 15,
    views: 160,
    chats: 5,
    verified: true,
    type: '월세',
    direction: '남서향',
    floorRange: '1층',
    conditions: ['대출 가능', '신축'],
  },
  {
    id: 12,
    image: 'https://placehold.co/300x200',
    deposit: 4000,
    monthly: 0,
    area: 38,
    floor: 8,
    gu: '서초구',
    dong: '반포동',
    likes: 18,
    views: 190,
    chats: 8,
    verified: true,
    type: '전세',
    direction: '서향',
    floorRange: '6~9층',
    conditions: ['옥탑'],
  },
  {
    id: 13,
    image: 'https://placehold.co/300x200',
    deposit: 0,
    monthly: 0,
    area: 45,
    floor: 12,
    gu: '마포구',
    dong: '서교동',
    likes: 22,
    views: 210,
    chats: 9,
    verified: false,
    type: '매매',
    direction: '북서향',
    floorRange: '10층 이상',
    conditions: ['주차 가능', '복층'],
  },
  {
    id: 14,
    image: 'https://placehold.co/300x200',
    deposit: 850,
    monthly: 45,
    area: 20,
    floor: 3,
    gu: '송파구',
    dong: '가락동',
    likes: 13,
    views: 140,
    chats: 4,
    verified: true,
    type: '월세',
    direction: '남향',
    floorRange: '2~5층',
    conditions: ['엘리베이터'],
  },
  {
    id: 15,
    image: 'https://placehold.co/300x200',
    deposit: 2700,
    monthly: 0,
    area: 33,
    floor: 7,
    gu: '중구',
    dong: '충무로',
    likes: 8,
    views: 90,
    chats: 2,
    verified: false,
    type: '전세',
    direction: '동향',
    floorRange: '6~9층',
    conditions: ['신축', '옥탑'],
  },
  {
    id: 16,
    image: 'https://placehold.co/300x200',
    deposit: 0,
    monthly: 0,
    area: 28,
    floor: 4,
    gu: '강서구',
    dong: '방화동',
    likes: 9,
    views: 100,
    chats: 3,
    verified: true,
    type: '매매',
    direction: '서향',
    floorRange: '2~5층',
    conditions: ['주차 가능'],
  },
  {
    id: 17,
    image: 'https://placehold.co/300x200',
    deposit: 1200,
    monthly: 65,
    area: 23,
    floor: 2,
    gu: '송파구',
    dong: '문정동',
    likes: 11,
    views: 130,
    chats: 5,
    verified: false,
    type: '월세',
    direction: '남동향',
    floorRange: '2~5층',
    conditions: ['반려동물 가능', '엘리베이터'],
  },
  {
    id: 18,
    image: 'https://placehold.co/300x200',
    deposit: 5000,
    monthly: 0,
    area: 42,
    floor: 9,
    gu: '서초구',
    dong: '서초동',
    likes: 20,
    views: 250,
    chats: 11,
    verified: true,
    type: '전세',
    direction: '남향',
    floorRange: '6~9층',
    conditions: ['신축', '주차 가능'],
  },
  {
    id: 19,
    image: 'https://placehold.co/300x200',
    deposit: 0,
    monthly: 0,
    area: 55,
    floor: 11,
    gu: '마포구',
    dong: '합정동',
    likes: 25,
    views: 280,
    chats: 14,
    verified: false,
    type: '매매',
    direction: '북향',
    floorRange: '10층 이상',
    conditions: ['복층'],
  },
  {
    id: 20,
    image: 'https://placehold.co/300x200',
    deposit: 900,
    monthly: 35,
    area: 17,
    floor: 2,
    gu: '동대문구',
    dong: '답십리동',
    likes: 7,
    views: 100,
    chats: 3,
    verified: true,
    type: '월세',
    direction: '남향',
    floorRange: '2~5층',
    conditions: ['엘리베이터'],
  },
])

// 상위에서 받은 필터 상태
const filters = ref({
  city: '전체',
  district: '전체',
  propertyType: '전체',
  dealType: '월세',
  depositRange: 500,
  monthlyRange: 50,
  leaseRange: 10000,
  sizeRange: 70,
  directions: [],
  floors: [],
  conditions: [],
})

// 필터링 된 매물 목록 계산
const filteredListings = computed(() => {
  return listings.value.filter((listing) => {
    if (filters.value.city !== '전체' && listing.gu !== filters.value.city) return false
    if (filters.value.district !== '전체' && listing.dong !== filters.value.district) return false
    if (filters.value.propertyType !== '전체' && listing.type !== filters.value.propertyType)
      return false
    if (filters.value.dealType && listing.type !== filters.value.dealType) return false

    if (filters.value.dealType === '월세') {
      if (listing.deposit > filters.value.depositRange) return false
      if (listing.monthly > filters.value.monthlyRange) return false
    }
    if (filters.value.dealType === '전세') {
      if (listing.deposit > filters.value.leaseRange) return false
    }
    if (listing.area > filters.value.sizeRange) return false
    if (
      filters.value.directions.length > 0 &&
      !filters.value.directions.includes(listing.direction)
    )
      return false
    if (filters.value.floors.length > 0 && !filters.value.floors.includes(listing.floorRange))
      return false
    if (
      filters.value.conditions.length > 0 &&
      !filters.value.conditions.every((cond) => listing.conditions?.includes(cond))
    )
      return false

    return true
  })
})

// 필터 상태가 바뀌면 여기서 업데이트
function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
}
</script>
