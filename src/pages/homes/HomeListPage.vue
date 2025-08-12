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

const listings = ref([])
const filters = ref({
  city: '전체',
  district: '전체',
  houseType: '전체',
  dealType: '월세',
  depositRange: 500,
  monthlyRange: 50,
  leaseRange: 10000,
  area: 30, // 평 단위
  direction: null,
  floor: null,
  conditions: [],
})

const selectedGu = computed(() => {
  return filters.value.district !== '전체' && filters.value.district !== undefined
    ? filters.value.district
    : filters.value.city
})

const otherCount = computed(() => {
  const uniqueGus = new Set(listings.value.map((listing) => listing.addr1))
  return uniqueGus.size > 1 ? uniqueGus.size - 1 : 0
})

function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
  loadListings()
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
      residenceType: filters.value.houseType !== '전체' ? filters.value.houseType : undefined,
      leaseType: filters.value.dealType !== '전체' ? filters.value.dealType : undefined,
      maxDepositPrice:
        filters.value.dealType === '월세'
          ? filters.value.depositRange * 10000
          : filters.value.dealType === '전세'
            ? filters.value.leaseRange * 10000
            : undefined,
      maxMonthlyRent:
        filters.value.dealType === '월세' ? filters.value.monthlyRange * 10000 : undefined,
      maxSupplyArea: filters.value.area * 3.30578,
      addr1:
        filters.value.city !== '전체'
          ? filters.value.district !== '전체'
            ? filters.value.district
            : filters.value.city
          : undefined,
    }

    const result = await fetchListings(params)
    listings.value = result

    // ✨ 여기에 콘솔 로그를 추가하면 됩니다.
    console.log('✅ API 응답으로 받아온 매물 목록:', listings.value)
  } catch (err) {
    console.error('목록 조회 실패:', err)
  }
}

onMounted(() => {
  loadListings()
})
</script>
