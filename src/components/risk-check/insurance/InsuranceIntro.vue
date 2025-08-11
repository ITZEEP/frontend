<script setup>
import IconShield from '@/components/icons/IconShield.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconDocument from '@/components/icons/IconDocument.vue'

const props = defineProps({
  selectedInsurer: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['select-insurer'])

const insuranceFeatures = [
  {
    icon: 'shield',
    title: '전세보증금 안전 보호',
    description: '임대인이 보증금을 돌려주지 못하는 상황에서도 보험회사가 대신 보상해드립니다.',
  },
  {
    icon: 'document',
    title: '중개사 없이도 가입 가능',
    description: '2024년 기준, 모든 보증기관에서 중개사 없이 직접 가입이 가능합니다.',
  },
  {
    icon: 'check',
    title: '저렴한 보험료',
    description: '연 0.1~0.2% 수준의 저렴한 보험료로 전세금 전액을 보호받을 수 있습니다.',
  },
]

const insuranceTypes = [
  {
    name: 'HUG',
    fullName: '주택도시보증공사',
    type: '공공기관',
    product: '전세보증금 반환보증',
    limit: '수도권 7억 / 기타 5억',
    features: ['가장 대중적', '채권양도통지로 중개사 없이 가입 가능']
  },
  {
    name: 'SGI',
    fullName: '서울보증보험',
    type: '민간기관',
    product: '전세금보장신용보험',
    limit: '아파트 무제한 / 기타 10억',
    features: ['직거래 가능', '집주인 동의 불필요']
  },
  {
    name: 'HF',
    fullName: '한국주택금융공사',
    type: '공공기관',
    product: '전세지킴보증',
    limit: '수도권 7억 / 기타 5억',
    features: ['사회초년생·고령자 특화', '정책형 상품']
  }
]
</script>

<template>
  <section class="bg-white rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <!-- 보증보험 정의 -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold text-gray-warm-700 mb-4">전세보증보험이란?</h2>
      <div class="bg-yellow-50 border-l-4 border-yellow-primary p-4 mb-6">
        <p class="text-gray-700 leading-relaxed">
          전세 계약 종료 시 임대인이 보증금을 돌려주지 못하는 상황에서 
          <strong class="text-gray-900">보험회사가 대신 보증금을 반환</strong>해주는 보험 상품입니다.
          보험료는 연 0.1~0.2% 수준으로 저렴하며, 전세금 전액을 보호받을 수 있습니다.
        </p>
      </div>
    </div>

    <!-- 주요 특징 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <article
        v-for="feature in insuranceFeatures"
        :key="feature.title"
        class="bg-gray-100 rounded-xl p-6 hover:bg-gray-200 transition-colors duration-200"
      >
        <div class="flex items-center gap-3 mb-4">
          <IconShield v-if="feature.icon === 'shield'" class="text-yellow-primary w-6 h-6" />
          <IconDocument v-else-if="feature.icon === 'document'" class="text-yellow-primary w-6 h-6" />
          <IconCheckCircle v-else class="text-yellow-primary w-6 h-6" />
          <h3 class="font-semibold text-gray-warm-700">{{ feature.title }}</h3>
        </div>
        <p class="text-gray-warm-500 text-sm">{{ feature.description }}</p>
      </article>
    </div>

    <!-- 보증기관 비교 -->
    <div>
      <h3 class="text-xl font-bold text-gray-warm-700 mb-4">전세보증보험 가입 기관</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="insurance in insuranceTypes"
          :key="insurance.name"
          @click="emit('select-insurer', insurance.name)"
          :class="[
            'border rounded-xl p-5 transition-all duration-200 cursor-pointer',
            selectedInsurer === insurance.name
              ? 'border-yellow-primary bg-yellow-50 shadow-md'
              : 'border-gray-300 bg-white hover:shadow-md hover:border-gray-400'
          ]"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-bold text-lg text-gray-900">{{ insurance.name }}</h4>
              <p class="text-sm text-gray-600">{{ insurance.fullName }}</p>
            </div>
            <div class="flex items-center gap-2">
              <IconCheckCircle 
                v-if="selectedInsurer === insurance.name" 
                class="w-5 h-5 text-yellow-primary"
              />
              <span 
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  insurance.type === '공공기관' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                ]"
              >
                {{ insurance.type }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 mb-3">
            <p class="text-sm">
              <span class="text-gray-500">상품명:</span>
              <span class="font-medium text-gray-700 ml-1">{{ insurance.product }}</span>
            </p>
            <p class="text-sm">
              <span class="text-gray-500">보증한도:</span>
              <span class="font-medium text-gray-700 ml-1">{{ insurance.limit }}</span>
            </p>
          </div>
          
          <div class="pt-3 border-t border-gray-200">
            <ul class="space-y-1">
              <li v-for="feature in insurance.features" :key="feature" class="flex items-center gap-2">
                <span class="text-yellow-500">•</span>
                <span class="text-sm text-gray-600">{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 중요 안내 -->
    <div class="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-start gap-3">
        <IconCheckCircle class="text-green-600 w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p class="font-semibold text-green-900 mb-1">2024년 기준 중개사 없이도 가입 가능!</p>
          <p class="text-sm text-green-700">
            HUG는 채권양도통지 방식으로, SGI와 HF는 원래부터 중개사 없이 직접 가입이 가능합니다.
            조건만 충족하면 누구나 온라인으로 간편하게 신청할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>