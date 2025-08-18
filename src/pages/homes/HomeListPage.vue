<template>
  <div class="flex flex-col md:flex-row">
    <FilterSidebar class="hidden md:block" @filter-change="onFilterChange" />

    <main class="flex-1 p-4 md:p-6 relative">
      <div class="flex justify-between items-center mb-4 md:hidden">
        <button
          @click="toggleFilter"
          class="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md"
        >
          필터
        </button>
        <button
          class="bg-yellow-primary hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
          type="button"
          @click="goCreatePage"
        >
          매물 등록
        </button>
      </div>

      <button
        class="hidden md:block absolute top-4 right-4 bg-yellow-primary hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded z-10"
        type="button"
        @click="goCreatePage"
      >
        매물 등록
      </button>

      <h1 class="text-2xl font-bold mb-4">전체 매물</h1>

      <div class="mb-4 text-lg font-bold">
        {{ selectedGu }}
        <span v-if="otherCount > 0">외 {{ otherCount }} 지역</span>
        <span class="text-yellow-primary">{{ totalItems }}</span
        >개 매물
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="animate-pulse rounded-xl border border-gray-200 p-4">
          <div class="h-40 bg-gray-200 rounded-md mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 데이터 있음 -->
      <div
        v-else-if="listings.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ListingCard
          v-for="listing in listings"
          :key="listing.homeId"
          :listing="listing"
          @click="goDetailPage(listing.homeId)"
          class="cursor-pointer"
        />
      </div>

      <!-- ✅ 데이터 없음 -->
      <div v-else class="text-gray-500 col-span-full text-center py-10">
        조건에 맞는 매물이 없습니다.
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
        <button
          :disabled="page === 1 || isLoading"
          @click="changePage(page - 1)"
          class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          이전
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          @click="changePage(p)"
          :disabled="isLoading"
          :class="{
            'bg-yellow-primary text-white': p === page,
            'bg-gray-200': p !== page,
          }"
          class="px-4 py-2 rounded-md disabled:opacity-50"
        >
          {{ p }}
        </button>
        <button
          :disabled="page === totalPages || isLoading"
          @click="changePage(page + 1)"
          class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </main>

    <div v-if="showFilter" class="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div class="p-4 flex justify-between items-center border-b">
        <h2 class="text-xl font-bold">필터</h2>
        <button @click="toggleFilter" class="text-gray-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <FilterSidebar @filter-change="handleFilterChangeAndClose" @close="showFilter = false" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FilterSidebar from '@/components/homes/homelist/FilterSidebar.vue'
import ListingCard from '@/components/homes/homelist/ListingCard.vue'
import { fetchListings } from '@/apis/listing.js'

const router = useRouter()

const listings = ref([])
const isLoading = ref(false) // ✅ 로딩 상태

const filters = ref({
  city: '전체',
  district: '전체',
  houseType: '전체',
  dealType: '전체',
  depositRange: 0,
  monthlyRange: 0,
  leaseRange: 0,
  area: 0,
  direction: null,
  floor: null,
  conditions: [],
})

const page = ref(1)
const size = ref(21)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / size.value))

// 모바일 필터 관련 상태
const showFilter = ref(false)

function toggleFilter() {
  showFilter.value = !showFilter.value
}

function handleFilterChangeAndClose(newFilters) {
  onFilterChange(newFilters)
  showFilter.value = false
}

const selectedGu = computed(() => {
  return filters.value.district !== '전체' && filters.value.district !== undefined
    ? filters.value.district
    : filters.value.city
})

const otherCount = computed(() => {
  if (!Array.isArray(listings.value) || listings.value.length <= 1) return 0
  const uniqueGus = new Set(listings.value.map((listing) => listing.addr1))
  return uniqueGus.size > 1 ? uniqueGus.size - 1 : 0
})

function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
  page.value = 1
  size.value = 21
  loadListings()
}

function changePage(newPage) {
  if (newPage > 0 && newPage <= totalPages.value) {
    page.value = newPage
    loadListings()
  }
}

function goCreatePage() {
  router.push('/homes/create')
}

function goDetailPage(id) {
  router.push(`/homes/${id}`)
}

async function loadListings() {
  isLoading.value = true // ✅ 시작
  try {
    const params = {
      page: page.value,
      size: size.value,
      residenceType: filters.value.houseType !== '전체' ? filters.value.houseType : undefined,
      leaseType: filters.value.dealType !== '전체' ? filters.value.dealType : undefined,
      maxSupplyArea: filters.value.area > 0 ? filters.value.area * 3.30578 : undefined,
      addr1:
        filters.value.city !== '전체'
          ? filters.value.district !== '전체'
            ? filters.value.district
            : filters.value.city
          : undefined,
    }

    if (filters.value.dealType === 'WOLSE' && filters.value.depositRange > 0) {
      params.maxDepositPrice = filters.value.depositRange * 10000
    }
    if (filters.value.dealType === 'WOLSE' && filters.value.monthlyRange > 0) {
      params.maxMonthlyRent = filters.value.monthlyRange * 10000
    }
    if (filters.value.dealType === 'JEONSE' && filters.value.leaseRange > 0) {
      params.maxDepositPrice = filters.value.leaseRange * 10000
      delete params.maxMonthlyRent
    }

    if (filters.value.direction) params.homeDirection = filters.value.direction

    if (filters.value.floor) {
      if (filters.value.floor === '반지하') {
        params.minFloor = -1
        params.maxFloor = -1
      } else if (filters.value.floor === '1층') {
        params.minFloor = 1
        params.maxFloor = 1
      } else if (filters.value.floor === '2~5층') {
        params.minFloor = 2
        params.maxFloor = 5
      } else if (filters.value.floor === '6~9층') {
        params.minFloor = 6
        params.maxFloor = 9
      } else if (filters.value.floor === '10층 이상') {
        params.minFloor = 10
        params.maxFloor = 9999
      }
    }

    if (Array.isArray(filters.value.conditions)) {
      if (filters.value.conditions.includes('반려동물 가능')) params.isPet = true
      if (filters.value.conditions.includes('주차 가능')) params.isParking = true
    }

    const response = await fetchListings(params)

    if (response && response.content) {
      listings.value = response.content
      totalItems.value = response.totalElements || response.data?.length || 0
    } else {
      listings.value = []
      totalItems.value = 0
    }

    console.log('✅ API 응답으로 받아온 매물 목록:', listings.value)
  } catch (err) {
    console.error('목록 조회 실패:', err)
    listings.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false // ✅ 종료
  }
}

onMounted(() => {
  loadListings()
})
</script>
