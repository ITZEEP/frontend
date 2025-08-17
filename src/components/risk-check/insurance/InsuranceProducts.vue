<script setup>
import { ref, computed } from 'vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import IconStar from '@/components/icons/IconStar.vue'
import IconDocument from '@/components/icons/IconDocument.vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import { INSURANCE_PRODUCTS } from '@/constants/insuranceData'

const props = defineProps({
  selectedInsurer: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['clear-filter'])

const insuranceProducts = ref(INSURANCE_PRODUCTS)

// 필터링된 보험 상품
const filteredProducts = computed(() => {
  if (!props.selectedInsurer) {
    return insuranceProducts.value
  }
  
  // 보험사 이름 매핑
  const insurerMap = {
    'HUG': 'HUG 주택도시보증공사',
    'SGI': 'SGI서울보증',
    'HF': 'HF한국주택금융공사'
  }
  
  const targetCompany = insurerMap[props.selectedInsurer]
  return insuranceProducts.value.filter(product => product.company === targetCompany)
})

const CARD_CLASSES =
  'block border border-gray-300 rounded-xl p-6 hover:shadow-md hover:border-gray-400 transition-all duration-200 cursor-pointer'
const ICON_CLASSES = 'w-4 h-4 text-yellow-primary mr-2 mt-0.5 flex-shrink-0'

// 이미지 로딩 에러 처리
const handleImageError = (event) => {
  // 기본 placeholder 이미지로 대체
  event.target.src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /%3E%3C/svg%3E'
  event.target.style.width = '60px'
  event.target.style.height = '60px'
  event.target.style.opacity = '0.3'
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-2 sm:p-4 lg:p-6">
    <div class="flex items-center justify-between mb-2 sm:mb-4">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-warm-700">보험 상품</h2>
      <button 
        v-if="selectedInsurer"
        @click="emit('clear-filter')"
        class="text-sm text-yellow-primary hover:text-yellow-600 transition-colors"
      >
        전체 보기
      </button>
    </div>
    
    <!-- 필터 상태 표시 -->
    <div v-if="selectedInsurer" class="mb-3 p-2 bg-yellow-50 rounded-lg">
      <p class="text-sm text-gray-700">
        <span class="font-semibold">{{ selectedInsurer }}</span> 보험 상품만 표시 중
      </p>
    </div>
    
    <div class="space-y-3 sm:space-y-4">
      <a
        v-for="product in filteredProducts"
        :key="product.id"
        :href="product.link"
        target="_blank"
        rel="noopener noreferrer"
        class="block border border-gray-300 rounded-xl p-2.5 sm:p-4 lg:p-5 hover:shadow-md hover:border-gray-400 transition-all duration-200 cursor-pointer"
      >
        <!-- 상단 정보 -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg sm:text-xl font-bold text-gray-warm-700">{{ product.company }}</h3>
              <IconArrowRight class="w-4 h-4 text-gray-warm-500 sm:hidden" />
            </div>
            <p class="text-sm sm:text-base text-gray-warm-500 mb-3 sm:mb-4">{{ product.description }}</p>
            <div class="flex flex-wrap gap-2 sm:gap-4">
              <span
                v-for="feature in product.features"
                :key="feature"
                class="px-2 sm:px-3 py-1 bg-gray-200 text-gray-warm-500 text-xs sm:text-sm rounded-full hover:bg-gray-300 transition-colors duration-200"
              >
                {{ feature }}
              </span>
            </div>
          </div>
          <div class="hidden sm:flex ml-0 sm:ml-8 w-24 justify-center pt-2">
            <img
              :src="product.image"
              :alt="product.company"
              @error="handleImageError"
              class="h-16 sm:h-24 object-contain object-top"
            />
            <IconArrowRight class="w-4 h-4 text-gray-warm-500 ml-2" />
          </div>
        </div>

        <!-- 모바일: 아코디언 형태 -->
        <div class="sm:hidden">
          <div class="border-t border-gray-200 mt-4 pt-4 space-y-3">
            <!-- 가입 조건 -->
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer list-none">
                <div class="flex items-center">
                  <IconCheckmark class="w-4 h-4 text-yellow-primary mr-2" />
                  <span class="text-sm font-semibold text-gray-warm-700">가입 조건</span>
                </div>
                <IconChevronDown class="w-4 h-4 text-gray-400 group-open:rotate-180" />
              </summary>
              <ul class="mt-3 space-y-2 pl-6">
                <li v-for="condition in product.conditions" :key="condition" class="text-sm text-gray-warm-600 leading-relaxed">
                  {{ condition }}
                </li>
              </ul>
            </details>

            <!-- 보험 혜택 -->
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer list-none">
                <div class="flex items-center">
                  <IconStar class="w-4 h-4 text-yellow-primary mr-2" />
                  <span class="text-sm font-semibold text-gray-warm-700">보험 혜택</span>
                </div>
                <IconChevronDown class="w-4 h-4 text-gray-400 group-open:rotate-180" />
              </summary>
              <ul class="mt-3 space-y-2 pl-6">
                <li v-for="benefit in product.benefits" :key="benefit" class="text-sm text-gray-warm-600 leading-relaxed">
                  {{ benefit }}
                </li>
              </ul>
            </details>

            <!-- 제한사항 -->
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer list-none">
                <div class="flex items-center">
                  <span class="text-red-500 mr-2">⚠</span>
                  <span class="text-sm font-semibold text-gray-warm-700">제한사항</span>
                </div>
                <IconChevronDown class="w-4 h-4 text-gray-400 group-open:rotate-180" />
              </summary>
              <ul class="mt-3 space-y-2 pl-6">
                <li v-for="restriction in product.restrictions" :key="restriction" class="text-sm text-gray-warm-600 leading-relaxed">
                  {{ restriction }}
                </li>
              </ul>
            </details>

            <!-- 필요서류 -->
            <details class="group">
              <summary class="flex items-center justify-between cursor-pointer list-none">
                <div class="flex items-center">
                  <IconDocument class="w-4 h-4 text-yellow-primary mr-2" />
                  <span class="text-sm font-semibold text-gray-warm-700">필요서류</span>
                </div>
                <IconChevronDown class="w-4 h-4 text-gray-400 group-open:rotate-180" />
              </summary>
              <ul class="mt-3 space-y-2 pl-6">
                <li v-for="document in product.documents" :key="document" class="text-sm text-gray-warm-600 leading-relaxed">
                  {{ document }}
                </li>
              </ul>
            </details>
          </div>
        </div>

        <!-- 데스크톱: 그리드 레이아웃 -->
        <div class="hidden sm:block">
          <!-- 가입 조건 및 보험 혜택 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pt-4 lg:pt-6 mt-4 lg:mt-6 border-t border-gray-200">
            <!-- 가입 조건 -->
            <div>
              <h4 class="text-sm lg:text-base font-semibold text-gray-warm-700 mb-2 lg:mb-3">가입 조건</h4>
              <ul class="space-y-1 lg:space-y-2">
                <li v-for="condition in product.conditions" :key="condition" class="flex items-start">
                  <IconCheckmark :class="ICON_CLASSES" />
                  <span class="text-xs lg:text-sm text-gray-warm-500">{{ condition }}</span>
                </li>
              </ul>
            </div>
            <!-- 보험 혜택 -->
            <div>
              <h4 class="text-sm lg:text-base font-semibold text-gray-warm-700 mb-2 lg:mb-3">보험 혜택</h4>
              <ul class="space-y-1 lg:space-y-2">
                <li v-for="benefit in product.benefits" :key="benefit" class="flex items-start">
                  <IconStar :class="ICON_CLASSES" />
                  <span class="text-xs lg:text-sm text-gray-warm-500">{{ benefit }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 제한사항 및 필요서류 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pt-4 lg:pt-6 mt-4 lg:mt-6 border-t border-gray-200">
            <!-- 제한사항 -->
            <div>
              <h4 class="text-sm lg:text-base font-semibold text-gray-warm-700 mb-2 lg:mb-3">제한사항</h4>
              <ul class="space-y-1 lg:space-y-2">
                <li
                  v-for="restriction in product.restrictions"
                  :key="restriction"
                  class="flex items-center"
                >
                  <span class="text-red-500 mr-2">•</span>
                  <span class="text-xs lg:text-sm text-gray-warm-500">{{ restriction }}</span>
                </li>
              </ul>
            </div>
            <!-- 필요서류 -->
            <div>
              <h4 class="text-sm lg:text-base font-semibold text-gray-warm-700 mb-2 lg:mb-3">필요서류</h4>
              <ul class="space-y-1 lg:space-y-2">
                <li v-for="document in product.documents" :key="document" class="flex items-start">
                  <IconDocument :class="ICON_CLASSES" />
                  <span class="text-xs lg:text-sm text-gray-warm-500">{{ document }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
