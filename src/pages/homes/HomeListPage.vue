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
        <span class="text-yellow-primary">{{ totalItems }}</span
        >개 매물
      </div>

      <div v-if="listings.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListingCard
          v-for="listing in listings"
          :key="listing.homeId"
          :listing="listing"
          @click="goDetailPage(listing.homeId)"
          class="cursor-pointer"
        />
      </div>
      <div v-else class="text-gray-500 col-span-full text-center py-10">
        조건에 맞는 매물이 없습니다.
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
        <button
          :disabled="page === 1"
          @click="changePage(page - 1)"
          class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          이전
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          @click="changePage(p)"
          :class="{
            'bg-yellow-primary text-white': p === page,
            'bg-gray-200': p !== page,
          }"
          class="px-4 py-2 rounded-md"
        >
          {{ p }}
        </button>
        <button
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
          class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          다음
        </button>
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

const listings = ref([])
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
const size = ref(21) // 초기 로딩 시 모든 매물을 가져오기 위해 충분히 큰 값으로 설정
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / size.value))

const selectedGu = computed(() => {
  return filters.value.district !== '전체' && filters.value.district !== undefined
    ? filters.value.district
    : filters.value.city
})

const otherCount = computed(() => {
  if (!Array.isArray(listings.value) || listings.value.length <= 1) {
    return 0
  }
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

    if (filters.value.dealType === '월세' && filters.value.depositRange > 0) {
      params.maxDepositPrice = filters.value.depositRange * 10000
    }
    if (filters.value.dealType === '월세' && filters.value.monthlyRange > 0) {
      params.maxMonthlyRent = filters.value.monthlyRange * 10000
    }
    if (filters.value.dealType === '전세' && filters.value.leaseRange > 0) {
      params.maxDepositPrice = filters.value.leaseRange * 10000
    }

    const response = await fetchListings(params)

    if (response && response.content) {
      listings.value = response.content
      totalItems.value = response.totalElements || response.data.length
    } else {
      listings.value = []
      totalItems.value = 0
    }

    console.log('✅ API 응답으로 받아온 매물 목록:', listings.value)
  } catch (err) {
    console.error('목록 조회 실패:', err)
    listings.value = []
    totalItems.value = 0
  }
}

onMounted(() => {
  loadListings()
})
</script>
