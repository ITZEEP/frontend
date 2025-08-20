<template>
  <div class="flex flex-col md:flex-row">
    <FilterSidebar class="hidden md:block" @filter-change="onFilterChange" />

    <main class="flex-1 px-0 py-4 md:p-6 relative">
      <!-- 모바일 상단 통합바 -->
      <div class="md:hidden bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900">전체 매물</h1>
          <div class="flex items-center space-x-2">
            <button
              @click="toggleFilter"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md transition-colors flex items-center"
            >
              <i class="fa-solid fa-filter text-sm"></i>
            </button>
            <button
              class="bg-yellow-primary hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded-md transition-colors flex items-center"
              type="button"
              @click="goCreatePage"
            >
              <i class="fa-solid fa-plus text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 데스크톱 -->
      <button
        class="hidden md:block absolute top-4 right-4 bg-yellow-primary hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded z-10"
        type="button"
        @click="goCreatePage"
      >
        매물 등록
      </button>

      <h1 class="hidden md:block text-2xl font-bold mb-4 px-4 md:px-0">전체 매물</h1>

      <div class="mb-4 text-lg font-bold px-4 md:px-0">
        {{ selectedGu }}
        <span v-if="otherCount > 0">외 {{ otherCount }} 지역</span>
        <span class="text-yellow-primary">{{ totalItems }}</span
        >개 매물
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
        <div v-for="n in 6" :key="n" class="animate-pulse rounded-xl border border-gray-200 p-4">
          <div class="h-40 bg-gray-200 rounded-md mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 데이터 있음 -->
      <div
        v-else-if="listings.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0"
      >
        <ListingCard
          v-for="listing in listings"
          :key="listing.homeId"
          :listing="listing"
          @click="goDetailPage(listing.homeId)"
          class="cursor-pointer listing-card-item"
        />
      </div>

      <!-- ✅ 데이터 없음 -->
      <div v-else class="text-gray-500 col-span-full text-center py-10 px-4 md:px-0">
        조건에 맞는 매물이 없습니다.
      </div>

      <!-- 모바일 무한스크롤 로딩 인디케이터 -->
      <div v-if="isMobile && isLoadingMore" class="flex justify-center py-8">
        <div class="flex items-center gap-2">
          <svg class="animate-spin h-5 w-5 text-yellow-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-600">더 불러오는 중...</span>
        </div>
      </div>

      <!-- 모바일에서 더 이상 데이터 없음 표시 -->
      <div v-if="isMobile && !hasMore && listings.length > 0" class="text-center py-8 text-gray-500">
        더 이상 매물이 없습니다.
      </div>

      <!-- 데스크톱 페이지네이션 (모바일에서는 숨김) -->
      <div v-if="!isMobile && totalPages > 1" class="flex justify-center mt-8 space-x-2">
        <button
          :disabled="page === 1 || isLoading"
          @click="changePage(page - 1)"
          class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
        >
          이전
        </button>
        <button
          v-for="p in displayPages"
          :key="p"
          @click="changePage(p)"
          :disabled="isLoading"
          :class="{
            'bg-yellow-primary text-white': p === page,
            'bg-gray-200 hover:bg-gray-300': p !== page,
          }"
          class="px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
        >
          {{ p }}
        </button>
        <button
          :disabled="page === totalPages || isLoading"
          @click="changePage(page + 1)"
          class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
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
import { computed, onMounted, ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import FilterSidebar from '@/components/homes/homelist/FilterSidebar.vue'
import ListingCard from '@/components/homes/homelist/ListingCard.vue'
import { fetchListings } from '@/apis/listing.js'

const router = useRouter()

const listings = ref([])
const isLoading = ref(false) // ✅ 로딩 상태
const isLoadingMore = ref(false) // 추가 로딩 상태 (무한스크롤용)
const hasMore = ref(true) // 더 불러올 데이터가 있는지

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
const size = ref(10) // 모바일에서는 10개씩
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / size.value))

// 모바일 체크
const isMobile = ref(false)
let prevIsMobile = false

const checkMobile = () => {
  prevIsMobile = isMobile.value
  isMobile.value = window.innerWidth < 768 // md 브레이크포인트
  
  // 모바일 여부에 따라 페이지 사이즈 조정
  size.value = isMobile.value ? 10 : 21
  
  // 화면 크기 변경 시 목록 다시 로드
  if (prevIsMobile !== isMobile.value) {
    page.value = 1
    listings.value = []
    hasMore.value = true
    loadListings()
  }
}

// Intersection Observer 관련
const observerTarget = ref(null)
let observer = null

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
  if (filters.value.district !== '전체' && filters.value.district !== undefined) {
    return filters.value.district
  } else if (filters.value.city !== '전체' && filters.value.city !== undefined) {
    return filters.value.city
  } else {
    return '전체'
  }
})

const otherCount = computed(() => {
  // 필터가 "전체"로 설정되어 있으면 다른 지역 개수를 표시하지 않음
  if (filters.value.city === '전체' || selectedGu.value === '전체') {
    return 0
  }
  
  if (!Array.isArray(listings.value) || listings.value.length <= 1) return 0
  const uniqueGus = new Set(listings.value.map((listing) => listing.addr1))
  return uniqueGus.size > 1 ? uniqueGus.size - 1 : 0
})

// 페이지네이션 표시 범위
const displayPages = computed(() => {
  const maxDisplay = 5
  const pages = []
  let start = Math.max(1, page.value - Math.floor(maxDisplay / 2))
  let end = Math.min(totalPages.value, start + maxDisplay - 1)
  
  if (end - start < maxDisplay - 1) {
    start = Math.max(1, end - maxDisplay + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

function onFilterChange(newFilters) {
  filters.value = { ...newFilters }
  page.value = 1
  listings.value = [] // 필터 변경 시 목록 초기화
  hasMore.value = true
  loadListings()
}

function changePage(newPage) {
  if (newPage > 0 && newPage <= totalPages.value) {
    page.value = newPage
    listings.value = [] // 페이지 변경 시 목록 초기화
    loadListings()
  }
}

function goCreatePage() {
  router.push('/homes/create')
}

function goDetailPage(id) {
  router.push(`/homes/${id}`)
}

async function loadListings(append = false) {
  // 무한스크롤인 경우와 일반 로딩 구분
  if (append && !hasMore.value) return
  
  if (append) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
  }
  
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
      if (append && isMobile.value) {
        // 무한스크롤 모드: 기존 목록에 추가
        listings.value = [...listings.value, ...response.content]
      } else {
        // 일반 모드: 목록 교체
        listings.value = response.content
      }
      
      totalItems.value = response.totalElements || response.data?.length || 0
      
      // 더 불러올 데이터가 있는지 확인
      hasMore.value = page.value < Math.ceil(totalItems.value / size.value)
      
      // 무한스크롤 모드에서 Observer 재설정
      if (append && isMobile.value) {
        await nextTick()
        setupIntersectionObserver()
      }
    } else {
      if (!append) {
        listings.value = []
        totalItems.value = 0
      }
      hasMore.value = false
    }

    console.log('✅ API 응답으로 받아온 매물 목록:', listings.value)
  } catch (err) {
    console.error('목록 조회 실패:', err)
    if (!append) {
      listings.value = []
      totalItems.value = 0
    }
    hasMore.value = false
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// 다음 페이지 로드 (무한스크롤용)
async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return
  
  page.value++
  await loadListings(true)
}

// Intersection Observer 설정
function setupIntersectionObserver() {
  // 기존 observer 정리
  if (observer) {
    observer.disconnect()
  }
  
  // 모바일이 아니면 observer 설정 안함
  if (!isMobile.value) return
  
  // 7번째 아이템을 타겟으로 설정
  const items = document.querySelectorAll('.listing-card-item')
  const targetIndex = Math.max(0, items.length - 4) // 뒤에서 4번째 (7번째가 보이면 로드)
  
  if (items[targetIndex] && hasMore.value) {
    observerTarget.value = items[targetIndex]
    
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore.value && !isLoadingMore.value) {
            loadMore()
          }
        })
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    )
    
    observer.observe(observerTarget.value)
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  await loadListings()
  
  // 모바일에서 초기 Observer 설정
  if (isMobile.value) {
    await nextTick()
    setupIntersectionObserver()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (observer) {
    observer.disconnect()
  }
})
</script>
