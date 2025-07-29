<script setup>
import IconShield from '@/components/icons/IconShield.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'

const insuranceFeatures = [
  {
    icon: 'shield',
    title: '안전한 보증금 보호',
    description: '임대인의 채무불이행 시에도 안전하게 보증금을 돌려받을 수 있습니다.',
  },
  {
    icon: 'document',
    title: '간편한 가입 절차',
    description: '필요 서류만 구비하면 온라인으로도 간편하게 가입이 가능합니다.',
  },
  {
    icon: 'money',
    title: '저렴한 보험료',
    description: '보증금 대비 저렴한 보험료로 큰 보장을 받을 수 있습니다.',
  },
]
</script>

<template>
  <section class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <h2 class="text-2xl font-bold text-gray-warm-700 mb-6">전세보증보험이란?</h2>
    <div class="grid grid-cols-3 gap-6">
      <article
        v-for="feature in insuranceFeatures"
        :key="feature.title"
        class="bg-gray-100 rounded-xl p-6 hover:bg-gray-200 transition-colors duration-200"
      >
        <div class="flex items-center gap-3 mb-4">
          <IconShield v-if="feature.icon === 'shield'" class="text-yellow-primary w-6 h-6" />
          <IconCheckCircle v-else class="text-yellow-primary w-6 h-6" />
          <h3 class="font-semibold text-gray-warm-700">{{ feature.title }}</h3>
        </div>
        <p class="text-gray-warm-500">{{ feature.description }}</p>
      </article>
    </div>
  </section>
</template>
