<script setup>
import { ref } from 'vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconCheckmark from '@/components/icons/IconCheckmark.vue'
import IconStar from '@/components/icons/IconStar.vue'

// Insurance product data with official website links
const INSURANCE_PRODUCTS = [
  {
    id: 1,
    company: 'SGI서울보증',
    description: '개인이 직접 신청 가능한 전세금보장신용보험을 제공하는 민간 보증기관입니다.',
    features: ['개인 신청 가능', '집주인 동의 불필요', '직거래 활용 가능'],
    image: 'https://www.sgic.co.kr/resource/pc/images/layout/logo.png',
    link: 'https://www.sgic.co.kr/?p=CCPMAN000001F01',
    conditions: [
      '만 19세 이상 개인 또는 법인',
      '전세보증금 5억원 이하 주택',
      '임대차계약 체결 전후 15일 이내',
      '전입신고 완료 필수',
    ],
    benefits: [
      '전세보증금 100% 보장',
      '법적 분쟁 시 소송비용 지원',
      '온라인 간편 신청 가능',
      '신속한 보증금 반환 처리',
    ],
  },
  {
    id: 2,
    company: 'HUG 주택도시보증공사',
    description: '정부 공식 보증기관으로 안정적인 전세보증금 반환 보증을 제공합니다.',
    features: ['정부 공식 보증기관', '온라인 간편 가입', '보증료 환급 가능'],
    image: 'https://www.khug.or.kr/hug/image/common/logo.png',
    link: 'https://www.khug.or.kr/index_hug_in.jsp',
    conditions: [
      '만 19세 이상 개인 또는 법인',
      '전세보증금 7억원 이하 주택',
      '계약 잔여기간 5개월 이상',
      '확정일자 받은 계약서 필수',
    ],
    benefits: [
      '정부 공식 보증으로 안정성 확보',
      '보증료 환급 가능',
      '청년/신혼부부 특별 할인',
      '전국 지점 방문 상담 가능',
    ],
  },
  {
    id: 3,
    company: 'HF한국주택금융공사',
    description: '정부 출연기관으로 저렴한 보증료의 전세보증금 반환 보증을 제공합니다.',
    features: ['정부 출연기관', '저렴한 보증료', '계약 갱신 시 할인'],
    image: 'https://www.hf.go.kr/_res/hf/ko/img/logo.png',
    link: 'https://www.hf.go.kr/ko/index.do',
    conditions: [
      '만 19세 이상 개인 또는 법인',
      '전세보증금 7억원 이하 주택',
      '전용면적 150㎡ 이하',
      '임대차계약서 원본 제출',
    ],
    benefits: [
      '업계 최저 수준 보증료',
      '계약 갱신 시 10% 할인',
      '전세보증금 전액 보장',
      '신속한 보상 처리 시스템',
    ],
  },
]

const insuranceProducts = ref(INSURANCE_PRODUCTS)

// CSS classes for styling consistency
const CARD_CLASSES = 'block border border-gray-300 rounded-xl p-6 hover:shadow-md hover:border-gray-400 transition-all duration-200 cursor-pointer'
const ICON_CLASSES = 'w-4 h-4 text-yellow-primary mr-2 mt-0.5 flex-shrink-0'
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