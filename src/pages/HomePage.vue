<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-yellow-primary overflow-hidden">
      
      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div class="text-center lg:text-left max-w-4xl mx-auto lg:mx-0">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            안전한 부동산 직거래
            <span class="block text-yellow-50">잇집에서 시작하세요</span>
          </h1>
          
          <p class="text-lg md:text-xl text-yellow-50 mb-8 max-w-2xl mx-auto lg:mx-0">
            AI 기술로 사기 위험을 분석하고, 스마트 계약서 작성부터 안전한 거래까지 
            모든 과정을 지원합니다.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <router-link to="/homes">
              <BaseButton variant="gray" size="lg" class="w-full sm:w-auto">
                매물 찾기
              </BaseButton>
            </router-link>
            <router-link to="/risk-check">
              <BaseButton variant="outline" size="lg" class="w-full sm:w-auto">
                AI 위험도 분석
              </BaseButton>
            </router-link>
          </div>
          
          <!-- Trust Indicators -->
          <div class="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 text-yellow-50">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium">AI 사기 위험 분석</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium">스마트 계약서 작성</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium">안전 거래 보장</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Section -->
    <section class="bg-white py-16 md:py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            안전한 부동산 거래의 
            <span class="text-yellow-primary">새로운 기준</span>
          </h2>
          <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            잇집만의 혁신적인 기술로 부동산 거래의 모든 위험을 사전에 차단하고, 
            더 안전하고 투명한 거래 환경을 제공합니다.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Feature 1 -->
          <div class="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-yellow-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">AI 사기 위험 분석</h3>
            <p class="text-gray-600 leading-relaxed">
              빅데이터와 AI 기술을 활용하여 매물의 사기 위험도를 실시간으로 분석하고, 
              안전한 거래 여부를 사전에 판단해드립니다.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">스마트 계약서 작성</h3>
            <p class="text-gray-600 leading-relaxed">
              법무법인과 협력하여 개발한 스마트 계약서 시스템으로 
              복잡한 계약 조건을 쉽고 정확하게 작성할 수 있습니다.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">3중 신원 인증</h3>
            <p class="text-gray-600 leading-relaxed">
              매물 등록, 계약서 작성, 등기부등본 소유자 확인까지 
              3단계 본인 인증으로 안전한 거래를 보장합니다.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">실시간 채팅 상담</h3>
            <p class="text-gray-600 leading-relaxed">
              매물 소유자와 직접 소통하며 궁금한 점을 즉시 해결하고, 
              투명한 거래를 진행할 수 있습니다.
            </p>
          </div>

        </div>

        <!-- Stats -->
        <div class="mt-16 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-8 md:p-12">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-3xl md:text-4xl font-bold text-yellow-primary mb-2">10만+</div>
              <div class="text-gray-600">안전한 거래 건수</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold text-yellow-primary mb-2">99.8%</div>
              <div class="text-gray-600">사기 예방 성공률</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold text-yellow-primary mb-2">5만+</div>
              <div class="text-gray-600">만족한 고객</div>
            </div>
            <div>
              <div class="text-3xl md:text-4xl font-bold text-yellow-primary mb-2">24/7</div>
              <div class="text-gray-600">고객 지원</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="bg-gray-100 py-16 md:py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            간단한 <span class="text-yellow-primary">3단계</span>로
            <span class="block mt-2">안전한 거래 시작하기</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-yellow-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">AI 위험도 분석</h3>
            <p class="text-gray-600">
              매물 정보를 입력하면 AI가 즉시 사기 위험도를 분석해 안전한 거래 여부를 알려드립니다.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-yellow-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">스마트 계약서 작성</h3>
            <p class="text-gray-600">
              검증된 템플릿으로 법적 효력이 있는 계약서를 쉽고 빠르게 작성할 수 있습니다.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-yellow-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">안전한 거래 완료</h3>
            <p class="text-gray-600">
              3중 신원 인증을 통해 검증된 당사자 간 안전한 직거래를 완료합니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-yellow-primary py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          지금 바로 안전한 부동산 거래를 시작하세요
        </h2>
        <p class="text-xl text-yellow-50 mb-8">
          AI 기술과 전문가 지원으로 더 이상 부동산 사기를 걱정하지 마세요
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/signup">
            <BaseButton variant="gray" size="lg" class="w-full sm:w-auto">
              무료로 시작하기
            </BaseButton>
          </router-link>
          <router-link to="/risk-check">
            <BaseButton variant="outline" size="lg" class="w-full sm:w-auto">
              위험도 분석 체험하기
            </BaseButton>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
</script>
