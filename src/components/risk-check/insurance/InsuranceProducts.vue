<script setup>
import { ref } from 'vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import IconStar from '@/components/icons/IconStar.vue'
import { INSURANCE_PRODUCTS } from '@/constants/insuranceData'

const insuranceProducts = ref(INSURANCE_PRODUCTS)

const CARD_CLASSES =
  'block border border-gray-300 rounded-xl p-6 hover:shadow-md hover:border-gray-400 transition-all duration-200 cursor-pointer'
const ICON_CLASSES = 'w-4 h-4 text-yellow-primary mr-2 mt-0.5 flex-shrink-0'

// 이미지 로딩 에러 처리
const handleImageError = (event) => {
  // 기본 placeholder 이미지로 대체
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /%3E%3C/svg%3E'
  event.target.style.width = '60px'
  event.target.style.height = '60px'
  event.target.style.opacity = '0.3'
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <h2 class="text-2xl font-bold text-gray-warm-700 mb-6">보험 상품</h2>
    <div class="space-y-6">
      <a
        v-for="product in insuranceProducts"
        :key="product.id"
        :href="product.link"
        target="_blank"
        rel="noopener noreferrer"
        :class="CARD_CLASSES"
      >
        <!-- 상단 정보 -->
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold text-gray-warm-700">{{ product.company }}</h3>
              <IconArrowRight class="w-4 h-4 text-gray-warm-500" />
            </div>
            <p class="text-base text-gray-warm-500 mb-4">{{ product.description }}</p>
            <div class="flex gap-4">
              <span
                v-for="feature in product.features"
                :key="feature"
                class="px-3 py-1 bg-gray-200 text-gray-warm-500 text-sm rounded-full hover:bg-gray-300 transition-colors duration-200"
              >
                {{ feature }}
              </span>
            </div>
          </div>
          <div class="ml-8 w-24 flex justify-center pt-2">
            <img
              :src="product.image"
              :alt="product.company"
              @error="handleImageError"
              class="h-24 object-contain object-top"
            />
          </div>
        </div>

        <!-- 가입 조건 및 보험 혜택 -->
        <div class="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-gray-200">
          <!-- 가입 조건 -->
          <div>
            <h4 class="text-base font-semibold text-gray-warm-700 mb-3">가입 조건</h4>
            <ul class="space-y-2">
              <li v-for="condition in product.conditions" :key="condition" class="flex items-start">
                <IconCheckmark :class="ICON_CLASSES" />
                <span class="text-sm text-gray-warm-500">{{ condition }}</span>
              </li>
            </ul>
          </div>
          <!-- 보험 혜택 -->
          <div>
            <h4 class="text-base font-semibold text-gray-warm-700 mb-3">보험 혜택</h4>
            <ul class="space-y-2">
              <li v-for="benefit in product.benefits" :key="benefit" class="flex items-start">
                <IconStar :class="ICON_CLASSES" />
                <span class="text-sm text-gray-warm-500">{{ benefit }}</span>
              </li>
            </ul>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
