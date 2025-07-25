<template>
  <div class="flex">
    <!-- 필터 컴포넌트 -->
    <FilterSidebar @filter-change="onFilterChange" />

    <main class="flex-1 p-6 relative">
      <!-- 매물 등록 버튼 -->
      <button
        class="absolute top-4 right-4 bg-yellow-primary hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded z-10"
        type="button"
        @click="goCreatePage"
      >
        매물 등록
      </button>

      <h1 class="text-2xl font-bold mb-4">전체 매물</h1>

      <div class="mb-4 text-lg font-bold">
        {{ selectedGu }} 외 {{ otherCount }} 지역
        <span class="text-yellow-primary">{{ filteredListings.length }}</span
        >개 매물
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 클릭 시 상세 페이지로 이동하도록 @click 처리 -->
        <ListingCard
          v-for="listing in filteredListings"
          :key="listing.id"
          :listing="listing"
          @click="goDetailPage(listing.id)"
          class="cursor-pointer"
        />
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

function goDetailPage(id) {
  router.push(`/homes/${id}`)
}

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
    deposit: 500,
    monthly: 50,
    area: 15,
    floor: 3,
    gu: '강남구',
    dong: '역삼동',
    likes: 18,
    views: 220,
    chats: 8,
    verified: false,
    type: '전세',
    direction: '서향',
    floorRange: '1~3층',
    conditions: ['엘리베이터'],
  },
  // ... 추가 매물 ...
])

const filters = ref({
  city: '전체',
  district: '전체',
  dealType: '전체',
  depositRange: 10000,
  monthlyRange: 10000,
  sizeRange: 100,
  directions: [],
  floors: [],
  conditions: [],
})

const filteredListings = computed(() => {
  return listings.value.filter((listing) => {
    if (filters.value.city !== '전체' && listing.gu !== filters.value.city) return false
    if (filters.value.district !== '전체' && listing.dong !== filters.value.district) return false
    if (filters.value.dealType !== '전체' && listing.type !== filters.value.dealType) return false

    if (filters.value.dealType === '월세') {
      if (listing.deposit > filters.value.depositRange) return false
      if (listing.monthly > filters.value.monthlyRange) return false
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

const selectedGu = computed(() => {
  return filters.value.district !== '전체' ? filters.value.district : filters.value.city
})

const otherCount = computed(() => {
  const uniqueGus = new Set(filteredListings.value.map((listing) => listing.gu))
  return uniqueGus.size > 1 ? uniqueGus.size - 1 : 0
})

function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
}
</script>
