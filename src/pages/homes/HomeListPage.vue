<template>
  <div class="flex">
    <FilterSidebar @filter-change="onFilterChange" />

    <main class="flex-1 p-6 relative">
      <button
        class="absolute top-4 right-4 bg-yellow-primary hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded z-10"
        type="button"
        @click="goCreatePage"
      >
        매물 등록
      </button>

      <h1 class="text-2xl font-bold mb-4">전체 매물</h1>

      <div class="mb-4 text-lg font-bold">
        {{ selectedGu }}
        <span v-if="otherCount > 0">외 {{ otherCount }} 지역</span>
        <span class="text-yellow-primary">{{ listings.length }}</span
        >개 매물
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListingCard
          v-for="listing in listings"
          :key="listing.homeId"
          :listing="listing"
          @click="goDetailPage(listing.homeId)"
          class="cursor-pointer"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterSidebar from '@/components/homes/homelist/FilterSidebar.vue'
import ListingCard from '@/components/homes/homelist/ListingCard.vue'
import { fetchListings } from '@/apis/listing.js'

const router = useRouter()

// API에서 받아온 매물 리스트 저장
const listings = ref([])

// 필터 상태 초기값 (기존과 동일)
const filters = ref({
  city: '전체',
  district: '전체',
  houseType: '전체',
  dealType: '월세',
  depositRange: 500,
  monthlyRange: 50,
  leaseRange: 10000,
  area: 30,
  direction: null,
  floor: null,
  conditions: [],
})

// 선택된 지역 텍스트
const selectedGu = computed(() => {
  return filters.value.district !== '전체' && filters.value.district !== undefined
    ? filters.value.district
    : filters.value.city
})

// 나머지 지역 개수
const otherCount = computed(() => {
  const uniqueGus = new Set(listings.value.map((listing) => listing.addr1))
  return uniqueGus.size > 1 ? uniqueGus.size - 1 : 0
})

// 필터 변경 이벤트 핸들러
function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
  loadListings() // 필터가 변경될 때마다 API를 다시 호출
}

// 매물 등록 페이지 이동
function goCreatePage() {
  router.push('/homes/create')
}

// 매물 상세 페이지 이동
function goDetailPage(id) {
  router.push(`/homes/${id}`)
}

// 실제 API 호출, 필터 조건을 API 전송
async function loadListings() {
  try {
    const params = {
      // 필터 조건을 API가 받도록 수정
      city: filters.value.city !== '전체' ? filters.value.city : undefined,
      district: filters.value.district !== '전체' ? filters.value.district : undefined,
      houseType: filters.value.houseType !== '전체' ? filters.value.houseType : undefined,
      dealType: filters.value.dealType,
      depositRange: filters.value.dealType === '월세' ? filters.value.depositRange : undefined,
      monthlyRange: filters.value.dealType === '월세' ? filters.value.monthlyRange : undefined,
      leaseRange: filters.value.dealType === '전세' ? filters.value.leaseRange : undefined,
      area: Math.round(filters.value.area * 3.30578),
      direction: filters.value.direction,
      floor: filters.value.floor,
      conditions:
        filters.value.conditions.length > 0 ? filters.value.conditions.join(',') : undefined,
    }
    // API 호출 시 필터 파라미터 전달
    const result = await fetchListings(params)
    listings.value = result // API 응답으로 받은 데이터로 listings 업데이트
  } catch (err) {
    console.error('목록 조회 실패:', err)
  }
}

// 컴포넌트 마운트 시 최초 API 호출
onMounted(() => {
  loadListings()
})
</script>
