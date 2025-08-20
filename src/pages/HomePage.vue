<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero -->
    <section class="relative overflow-hidden h-[85vh] sm:h-[70vh] md:h-[80vh]">
      <!-- 비디오: 모바일에서는 전체 화면, 데스크탑에서는 왼쪽 붙임 -->
      <video
        class="pointer-events-none absolute left-0 top-0 h-full w-full object-cover xl:w-[60vw] 2xl:w-[60vw]"
        src="/panda&lion.mp4"
        autoplay
        muted
        loop
        playsinline
      ></video>

      <div class="absolute inset-0 bg-[#FFF3D4]/30 pointer-events-none"></div>
      <div
        class="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/40 sm:from-black/30 via-black/20 sm:via-black/10 to-transparent pointer-events-none"
      ></div>

      <!-- 콘텐츠: 모바일에서는 하단 정렬, 데스크탑에서는 오른쪽 정렬 -->
      <div class="relative z-10 h-full">
        <div
          class="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-end sm:items-center justify-start sm:justify-end pb-20 sm:pb-0"
        >
          <div
            ref="heroText"
            class="max-w-full sm:max-w-[560px] text-left sm:text-right text-white transition-transform duration-100"
          >
            <h1
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 drop-shadow-lg"
            >
              <span class="block mb-2">안전한 부동산 직거래</span>
              <span class="block text-yellow-primary text-4xl sm:text-5xl md:text-6xl"
                >잇집에서 시작하세요</span
              >
            </h1>

            <p
              class="text-base sm:text-lg md:text-xl text-white/95 sm:text-gray-800/90 mb-6 sm:mb-8 drop-shadow-lg sm:drop-shadow max-w-md sm:ml-auto"
            >
              AI 기술로 사기 위험을 분석하고,
              <br />스마트 계약서 작성부터 안전한 거래까지 <br class="sm:hidden" />모든 과정을
              지원합니다.
            </p>

            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
              <router-link to="/homes" class="w-full sm:w-auto">
                <BaseButton variant="gray" size="lg" class="w-full">매물 찾기</BaseButton>
              </router-link>
              <router-link to="/risk-check" class="w-full sm:w-auto">
                <BaseButton variant="outline" size="lg" class="w-full bg-white/90"
                  >AI 위험도 분석</BaseButton
                >
              </router-link>
            </div>

            <!-- Trust Indicators: 모바일에서는 2x2 그리드 -->
            <div
              class="mt-8 sm:mt-12 grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 sm:justify-end text-yellow-primary"
            >
              <div class="flex items-start sm:items-center gap-2">
                <svg
                  class="w-4 sm:w-5 h-4 sm:h-5 mt-0.5 sm:mt-0 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-xs sm:text-sm font-medium">AI 사기 위험 분석</span>
              </div>
              <div class="flex items-start sm:items-center gap-2">
                <svg
                  class="w-4 sm:w-5 h-4 sm:h-5 mt-0.5 sm:mt-0 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-xs sm:text-sm font-medium">스마트 계약서</span>
              </div>
              <div class="flex items-start sm:items-center gap-2 col-span-2 sm:col-span-1">
                <svg
                  class="w-4 sm:w-5 h-4 sm:h-5 mt-0.5 sm:mt-0 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-xs sm:text-sm font-medium">안전 거래 보장</span>
              </div>
            </div>
          </div>
          <!-- /text block -->
        </div>
        <!-- /container -->
      </div>
      <!-- /relative h-full -->
    </section>

    <!-- Feature Section -->
    <section class="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-left sm:text-center mb-12 sm:mb-16">
          <h2
            class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4"
          >
            안전한 부동산 거래의
            <span class="text-yellow-primary block sm:inline mt-1 sm:mt-0">새로운 기준</span>
          </h2>
          <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl sm:mx-auto">
            잇집만의 기술로 부동산 거래의 위험을 사전에 차단하고, 더 안전하고 투명한 거래 환경을
            제공합니다.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <!-- Feature 1 -->
          <div
            :ref="(el) => (features[0] = el)"
            class="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-6 sm:p-8 hover:shadow-2xl transform-gpu"
            style="transform-style: preserve-3d; will-change: transform, opacity"
          >
            <div
              class="w-10 sm:w-12 h-10 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <svg
                class="w-5 sm:w-6 h-5 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              AI 사기 위험 분석
            </h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              빅데이터와 AI 기술을 활용하여 매물의 사기 위험도를 실시간으로 분석하고, 안전한 거래
              여부를 사전에 판단해드립니다.
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            :ref="(el) => (features[1] = el)"
            class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 sm:p-8 hover:shadow-2xl transform-gpu"
            style="transform-style: preserve-3d; will-change: transform, opacity"
          >
            <div
              class="w-10 sm:w-12 h-10 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <svg
                class="w-5 sm:w-6 h-5 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              스마트 계약서 작성
            </h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              AI와 함께 진행되는 스마트 계약서 시스템으로 복잡한 계약 조건을 쉽고 정확하게 작성할 수
              있습니다.
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            :ref="(el) => (features[2] = el)"
            class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 sm:p-8 hover:shadow-2xl transform-gpu"
            style="transform-style: preserve-3d; will-change: transform, opacity"
          >
            <div
              class="w-10 sm:w-12 h-10 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <svg
                class="w-5 sm:w-6 h-5 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              3중 신원 인증
            </h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              매물 등록, 계약서 작성, 등기부등본 소유자 확인까지 3단계 본인 인증으로 안전한 거래를
              보장합니다.
            </p>
          </div>

          <!-- Feature 4 -->
          <div
            :ref="(el) => (features[3] = el)"
            class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 sm:p-8 hover:shadow-2xl transform-gpu"
            style="transform-style: preserve-3d; will-change: transform, opacity"
          >
            <div
              class="w-10 sm:w-12 h-10 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6"
            >
              <svg
                class="w-5 sm:w-6 h-5 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              실시간 채팅 상담
            </h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              매물 소유자와 직접 소통하며 궁금한 점을 즉시 해결하고, 투명한 거래를 진행할 수
              있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-left sm:text-center mb-12 sm:mb-16">
          <h2
            class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4"
          >
            간단한 <span class="text-yellow-primary">3단계</span>로
            <span class="block mt-1 sm:mt-2">안전한 거래 시작하기</span>
          </h2>
        </div>

        <div class="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-8">
          <!-- Step 1 -->
          <div
            :ref="(el) => (steps[0] = el)"
            class="flex sm:flex-col sm:text-center transition-all duration-700 transform-gpu"
          >
            <div class="flex-shrink-0">
              <div
                class="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold sm:mx-auto mb-0 sm:mb-6"
              >
                1
              </div>
            </div>
            <div class="ml-4 sm:ml-0">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                AI 위험도 분석
              </h3>
              <p class="text-sm sm:text-base text-gray-600">
                매물 정보를 입력하면 AI가 즉시 사기 위험도를 분석해 안전한 거래 여부를 알려드립니다.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div
            :ref="(el) => (steps[1] = el)"
            class="flex sm:flex-col sm:text-center transition-all duration-700 transform-gpu"
          >
            <div class="flex-shrink-0">
              <div
                class="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold sm:mx-auto mb-0 sm:mb-6"
              >
                2
              </div>
            </div>
            <div class="ml-4 sm:ml-0">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                스마트 계약서 작성
              </h3>
              <p class="text-sm sm:text-base text-gray-600">
                검증된 템플릿으로 법적 효력이 있는 계약서를 쉽고 빠르게 작성할 수 있습니다.
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div
            :ref="(el) => (steps[2] = el)"
            class="flex sm:flex-col sm:text-center transition-all duration-700 transform-gpu"
          >
            <div class="flex-shrink-0">
              <div
                class="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold sm:mx-auto mb-0 sm:mb-6"
              >
                3
              </div>
            </div>
            <div class="ml-4 sm:ml-0">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
                안전한 거래 완료
              </h3>
              <p class="text-sm sm:text-base text-gray-600">
                3중 신원 인증을 통해 검증된 당사자 간 안전한 직거래를 완료합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-br from-yellow-400 to-yellow-500 py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left sm:text-center">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          지금 바로 안전한 부동산 거래를
          <span class="block mt-1">시작하세요</span>
        </h2>
        <p class="text-base sm:text-xl text-yellow-50 mb-6 sm:mb-8">
          AI 기술의 지원으로 더 이상 부동산 사기를 걱정하지 마세요
        </p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
          <router-link v-if="!isLoggedIn" to="/auth/signin" class="w-full sm:w-auto">
            <BaseButton variant="gray" size="lg" class="w-full">로그인하러 가기</BaseButton>
          </router-link>
          <router-link to="/risk-check" class="w-full sm:w-auto">
            <BaseButton variant="outline" size="lg" class="w-full bg-white/90"
              >위험도 분석 체험하기</BaseButton
            >
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

// 스크롤 애니메이션을 위한 refs
const scrollY = ref(0)
const features = ref([])
const steps = ref([])
const heroText = ref(null)

// 스크롤 이벤트 핸들러
const handleScroll = () => {
  scrollY.value = window.scrollY

  // Feature 카드 애니메이션 - 좌우에서 날아오기 (날아가지는 않음)
  features.value.forEach((el, index) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const elementCenter = rect.top + rect.height / 2

    // 화면 아래에서 위로 올라오면서 보이는 정도 계산
    let progress = 0
    if (rect.bottom > 0) {
      // 요소가 화면 위로 완전히 사라지지 않은 경우
      if (rect.top < windowHeight) {
        // 요소가 화면에 나타나기 시작
        // 화면 하단에서 중앙까지의 진행도
        if (elementCenter > windowHeight * 0.7) {
          progress = Math.max(0, 1 - (elementCenter - windowHeight * 0.7) / (windowHeight * 0.3))
        } else {
          progress = 1 // 화면 중앙 이상에 있으면 완전히 보임
        }
      }
    }

    // 좌우에서 날아오는 효과 (한 번 나타나면 유지)
    const direction = index % 2 === 0 ? -1 : 1 // 짝수는 왼쪽에서, 홀수는 오른쪽에서
    const translateX = (1 - progress) * 100 * direction
    const rotate = (1 - progress) * 5 * direction
    const scale = 0.9 + progress * 0.1

    el.style.transform = `translateX(${translateX}px) rotate(${rotate}deg) scale(${scale})`
    el.style.opacity = Math.min(1, progress * 1.2)
    el.style.transition = 'none' // 부드러운 스크롤 애니메이션
  })

  // Step 카드 애니메이션 - 더 일찍 시작하는 부드러운 효과
  steps.value.forEach((el, index) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const windowHeight = window.innerHeight

    // 더 일찍 애니메이션 시작 (화면 하단에서 200px 위부터)
    const triggerPoint = windowHeight - 200
    const isVisible = rect.top < windowHeight && rect.bottom > 0

    if (isVisible && rect.top < triggerPoint) {
      // 부드러운 페이드인
      const progress = Math.max(0, Math.min(1, (triggerPoint - rect.top) / 300))
      const staggerDelay = index * 0.15 // 순차적 효과
      const adjustedProgress = Math.max(0, Math.min(1, progress * 1.2 - staggerDelay))

      const translateY = (1 - adjustedProgress) * 30
      const scale = 0.92 + adjustedProgress * 0.08

      el.style.transform = `translateY(${translateY}px) scale(${scale})`
      el.style.opacity = Math.min(1, adjustedProgress)
      el.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out'
    } else if (!isVisible) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px) scale(0.92)'
    }
  })

  // Hero 텍스트 패럴랙스
  if (heroText.value) {
    const parallax = scrollY.value * 0.5
    heroText.value.style.transform = `translateY(${parallax}px)`
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 사용자가 '감소된 모션' 설정 시 자동재생/애니메이션 최소화 */
@media (prefers-reduced-motion: reduce) {
  video {
    animation: none !important;
  }
  .transition-all {
    transition: none !important;
  }
}

/* 3D 효과를 위한 스타일 */
.transform-gpu {
  will-change: transform, opacity;
}
</style>
