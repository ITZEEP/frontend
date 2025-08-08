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
        <ListingCard
          v-for="listing in filteredListings"
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

// 필터 상태 초기값
const filters = ref({
  city: '전체',
  district: '전체',
  dealType: '전체',
  depositRange: 100000000, // 충분히 큰 기본값으로 변경
  monthlyRange: 1000000,
  sizeRange: 1000,
  directions: [],
  floors: [],
  conditions: [],
})

// 필터된 매물 리스트 계산 (프론트단 필터링)
const filteredListings = computed(() => {
  return listings.value.filter((listing) => {
    if (filters.value.city !== '전체' && listing.gu !== filters.value.city) return false
    if (filters.value.district !== '전체' && listing.dong !== filters.value.district) return false
    if (filters.value.dealType !== '전체' && listing.type !== filters.value.dealType) return false

    if (filters.value.dealType === '월세') {
      if ((listing.deposit ?? 0) > filters.value.depositRange) return false
      if ((listing.monthly ?? 0) > filters.value.monthlyRange) return false
    }

    if ((listing.area ?? 0) > filters.value.sizeRange) return false

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

// 선택된 지역 텍스트
const selectedGu = computed(() => {
  return filters.value.district !== '전체' ? filters.value.district : filters.value.city
})

// 나머지 지역 개수
const otherCount = computed(() => {
  const uniqueGus = new Set(filteredListings.value.map((listing) => listing.gu))
  return uniqueGus.size > 1 ? uniqueGus.size - 1 : 0
})

// 필터 변경 이벤트 핸들러
function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
  loadListings() // 필터 변경 시 API 다시 호출 (필터 서버반영 시 필요)
}

// 매물 등록 페이지 이동
function goCreatePage() {
  router.push('/homes/create')
}

// 매물 상세 페이지 이동
function goDetailPage(id) {
  router.push(`/homes/${id}`)
}

// 실제 API 호출, 필터 조건 API 전송 가능하도록 params 확장 가능
async function loadListings() {
  try {
    const params = {
      // 페이지, 사이즈 등 페이징 파라미터 추가 가능
      // page: 1,
      // size: 10,
      // 필터 조건을 API가 받도록 수정시 아래 주석 해제 후 사용
      // city: filters.value.city !== '전체' ? filters.value.city : undefined,
      // district: filters.value.district !== '전체' ? filters.value.district : undefined,
      // dealType: filters.value.dealType !== '전체' ? filters.value.dealType : undefined,
      // ...
    }
    listings.value = await fetchListings(params)
    console.log(listings.value)
  } catch (err) {
    console.error('목록 조회 실패:', err)
  }
}

// 컴포넌트 마운트 시 최초 API 호출
onMounted(() => {
  loadListings()
})
</script>
