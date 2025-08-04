<script setup>
import { useRouter } from 'vue-router'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import HeroSection from '@/components/risk-check/insurance/HeroSection.vue'
import InsuranceIntro from '@/components/risk-check/insurance/InsuranceIntro.vue'
import InsuranceProducts from '@/components/risk-check/insurance/InsuranceProducts.vue'
import JoinProcess from '@/components/risk-check/insurance/JoinProcess.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="bg-gray-100">
    <!-- 헤더 -->
    <nav class="bg-white border-b border-gray-300 shadow-sm">
      <div class="max-w-[1280px] mx-auto px-8">
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
    <div class="max-w-[1280px] mx-auto px-8 py-12">
      <!-- 전세보증보험이란? -->
      <InsuranceIntro class="mb-8" />

      <!-- 보험 상품 -->
      <InsuranceProducts class="mb-8" />

      <!-- 가입 절차 -->
      <JoinProcess class="mb-8" />
    </div>
  </div>
</template>
