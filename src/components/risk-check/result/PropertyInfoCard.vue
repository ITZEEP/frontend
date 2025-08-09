<script setup>
import PropertyImage from '@/components/common/PropertyImage.vue'

defineProps({
  propertyInfo: {
    type: Object,
    required: true,
    validator: (value) => {
      const requiredFields = ['image', 'title', 'address', 'type', 'transactionType', 'price']
      return requiredFields.every((field) => field in value)
    },
  },
})
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 overflow-hidden">
    <!-- 모바일 레이아웃 -->
    <div class="sm:hidden">
      <!-- 매물 정보 헤더 -->
      <div class="p-4 pb-0">
        <h2 class="text-lg font-bold text-gray-warm-700 mb-1">
          {{ propertyInfo.title }}
        </h2>
        <p class="text-sm text-gray-warm-500 mb-3">
          {{ propertyInfo.address }}
        </p>
      </div>
      
      <!-- 매물 이미지 - 중앙 배치 -->
      <div class="flex justify-center px-4 pb-3">
        <div class="relative">
          <PropertyImage
            :src="propertyInfo.image"
            :alt="`${propertyInfo.title} 매물 이미지`"
            :property-type="propertyInfo.type"
            size="large"
            rounded="xl"
            class="!block"
          />
          <!-- 거래 유형 배지 -->
          <div class="absolute top-3 left-3">
            <span class="bg-yellow-primary text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {{ propertyInfo.transactionType }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 매물 상세 정보 -->
      <div class="p-4 pt-0">
        
        <!-- 가격 정보 - 더 강조 -->
        <div class="bg-yellow-50 rounded-lg p-3 mb-3">
          <p class="text-xs text-gray-warm-500 mb-0.5">가격</p>
          <p class="text-lg font-bold text-gray-warm-700">
            {{ propertyInfo.price }}
          </p>
        </div>
        
        <!-- 추가 정보 - 가로 배치 -->
        <div class="flex gap-3">
          <div class="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
            <p class="text-xs text-gray-warm-500 mb-0.5">매물 유형</p>
            <p class="text-sm font-semibold text-gray-warm-700">
              {{ propertyInfo.type }}
            </p>
          </div>
          <div class="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
            <p class="text-xs text-gray-warm-500 mb-0.5">거래 유형</p>
            <p class="text-sm font-semibold text-gray-warm-700">
              {{ propertyInfo.transactionType }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 태블릿/데스크톱 레이아웃 (기존 유지) -->
    <div class="hidden sm:block p-6 lg:p-8">
      <div class="flex flex-row gap-6">
        <!-- 매물 이미지 -->
        <div class="w-auto">
          <PropertyImage
            :src="propertyInfo.image"
            :alt="`${propertyInfo.title} 매물 이미지`"
            :property-type="propertyInfo.type"
            size="large"
            rounded="xl"
            class="w-48 lg:w-56"
          />
        </div>
        <div class="flex-1">
          <h2 class="text-xl lg:text-2xl font-bold text-gray-warm-700 mb-2">
            {{ propertyInfo.title }}
          </h2>
          <p class="text-base text-gray-warm-500 mb-4">
            {{ propertyInfo.address }}
          </p>
          <div class="grid grid-cols-3 gap-3 lg:gap-4">
            <div class="px-4 py-2 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-warm-500">매물 유형</p>
              <p class="text-base font-semibold text-gray-warm-700">
                {{ propertyInfo.type }}
              </p>
            </div>
            <div class="px-4 py-2 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-warm-500">거래 유형</p>
              <p class="text-base font-semibold text-gray-warm-700">
                {{ propertyInfo.transactionType }}
              </p>
            </div>
            <div class="px-4 py-2 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-warm-500">가격</p>
              <p class="text-base font-semibold text-gray-warm-700">
                {{ propertyInfo.price }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
