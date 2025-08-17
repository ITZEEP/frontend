<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import HeroSection from '@/components/risk-check/insurance/HeroSection.vue'
import InsuranceIntro from '@/components/risk-check/insurance/InsuranceIntro.vue'
import InsuranceProducts from '@/components/risk-check/insurance/InsuranceProducts.vue'
import JoinProcess from '@/components/risk-check/insurance/JoinProcess.vue'

const router = useRouter()
const selectedInsurer = ref(null) // 선택된 보험사 (null: 전체 보기)

const goBack = () => {
  router.back()
}

const handleInsurerSelect = (insurerName) => {
  // 이미 선택된 카드를 다시 클릭하면 선택 해제
  if (selectedInsurer.value === insurerName) {
    selectedInsurer.value = null
  } else {
    selectedInsurer.value = insurerName
    // 보험 상품 섹션으로 스크롤
    const productSection = document.querySelector('#insurance-products')
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
</script>

<template>
  <div class="bg-gray-100">
    <!-- 헤더 -->
    <nav class="bg-white border-b border-gray-300 shadow-sm">
      <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="goBack" class="p-1 text-gray-600 hover:text-gray-800">
            <IconChevronLeft class="w-[17.5px] h-7" />
          </button>
        </div>
      </div>
    </nav>

    <!-- 히어로 섹션 -->
    <HeroSection />

    <!-- 컨텐츠 -->
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-8 lg:pt-10 pb-6 sm:pb-8 lg:pb-10">
      <!-- 전세보증보험이란? -->
      <InsuranceIntro 
        class="mb-4 sm:mb-6" 
        :selected-insurer="selectedInsurer"
        @select-insurer="handleInsurerSelect" 
      />

      <!-- 보험 상품 -->
      <InsuranceProducts 
        id="insurance-products"
        class="mb-4 sm:mb-6" 
        :selected-insurer="selectedInsurer"
        @clear-filter="selectedInsurer = null"
      />

      <!-- 가입 절차 -->
      <JoinProcess class="mb-4 sm:mb-6" />
    </div>
  </div>
</template>
