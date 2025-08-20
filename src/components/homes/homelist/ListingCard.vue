<template>
  <router-link :to="`/homes/${listing.homeId}`" class="block group">
    <div
      class="relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100"
      role="article"
      aria-label="매물 카드"
    >
      <!-- 이미지 컨테이너 -->
      <div class="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          v-if="listing.imageUrls && listing.imageUrls.length > 0"
          :src="listing.imageUrls[0]"
          alt="매물 사진"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <!-- 매물 유형 배지 -->
        <div class="absolute top-3 left-3 z-10">
          <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-lg bg-white/90 backdrop-blur-sm text-gray-700">
            {{ listing.residenceType || '기타' }}
          </span>
        </div>
        
        <!-- 즐겨찾기 버튼 -->
        <button 
          @click.prevent.stop="toggleFavorite"
          class="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white hover:scale-110 shadow-lg"
        >
          <svg :class="[isFavorite ? 'text-red-500' : 'text-gray-400']" class="w-5 h-5 transition-colors" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div class="p-5">
        <!-- 가격 정보 -->
        <div class="mb-3">
          <div class="flex items-center gap-2">
            <div class="text-yellow-500 font-semibold">
              {{ listing.leaseType }}
            </div>
            <div class="text-lg font-bold">
              <template v-if="listing.leaseType === '전세'">
                {{ formatNumber(listing.depositPrice) }}원
              </template>
              <template v-else-if="listing.leaseType === '월세'">
                {{ formatNumber(listing.depositPrice) }}원 / {{ formatNumber(listing.monthlyRent) }}원
              </template>
              <template v-else>
                {{ formatNumber(listing.depositPrice) }}원 / {{ formatNumber(listing.monthlyRent) }}원
              </template>
            </div>
          </div>
        </div>

        <!-- 위치 정보 -->
        <div class="flex items-start gap-1.5 mb-3">
          <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-sm text-gray-700 font-medium">{{ listing.addr1 }}</span>
        </div>

        <!-- 면적 및 층수 정보 -->
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span class="text-sm text-gray-600">{{ convertToPyeong(listing.exclusiveArea) }}평</span>
          </div>
          <div class="w-px h-4 bg-gray-300"></div>
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="text-sm text-gray-600">{{ listing.homeFloor }}층</span>
          </div>
        </div>

        <!-- 하단 정보 -->
        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="text-xs font-medium">{{ listing.likeCnt ?? 0 }}</span>
            </div>
            <div class="flex items-center gap-1 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="text-xs font-medium">{{ listing.viewCnt ?? 0 }}</span>
            </div>
            <div class="flex items-center gap-1 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span class="text-xs font-medium">{{ listing.chatCnt ?? 0 }}</span>
            </div>
          </div>
          
          <!-- 실명인증 배지 -->
          <div class="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
            <svg class="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-semibold text-green-700">인증완료</span>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref } from 'vue'
import { toggleHomeLike } from '@/apis/listing.js'
import { useLoginModal } from '@/composables/useLoginModal'

const props = defineProps({
  listing: {
    type: Object,
    required: true,
  },
})

const { openLoginModal } = useLoginModal()
const isFavorite = ref(props.listing.isLiked || false)

const toggleFavorite = async () => {
  // 로그인 체크
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
  if (!token) {
    // 로그인 모달 표시
    openLoginModal()
    return
  }
  
  try {
    await toggleHomeLike(props.listing.homeId)
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('찜하기 상태 변경 실패:', error)
  }
}

function formatNumber(value) {
  if (typeof value === 'number' && value > 0) {
    if (value >= 100000000) {
      const billion = Math.floor(value / 100000000)
      const remainder = value % 100000000
      return remainder > 0 ? `${billion}억 ${formatNumber(remainder)}` : `${billion}억`
    }

    if (value >= 10000) {
      const tenThousand = Math.floor(value / 10000)
      const remainder = value % 10000
      return remainder > 0 ? `${tenThousand}만 ${formatNumber(remainder)}` : `${tenThousand}만`
    }

    if (value >= 1000) {
      const thousand = Math.floor(value / 1000)
      const remainder = value % 1000
      return remainder > 0 ? `${thousand}천 ${remainder.toLocaleString()}` : `${thousand}천`
    }

    return value.toLocaleString()
  }
  return value ?? '0'
}

function convertToPyeong(area) {
  if (!area) return 0
  // 제곱미터(m²)를 평으로 변환 (1평 ≈ 3.30578m²)
  return Math.round(area / 3.3058)
}
</script>
