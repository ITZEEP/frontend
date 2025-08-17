<script setup>
import { computed } from 'vue'

const props = defineProps({
  overallRisk: {
    type: String,
    required: true,
    validator: (value) => ['safe', 'warning', 'danger'].includes(value),
  },
})

// 위험도에 따른 색상 맵핑
const getRiskBgColor = (risk) => {
  const colors = {
    safe: 'bg-green-50',
    warning: 'bg-yellow-50',
    danger: 'bg-red-50',
  }
  return colors[risk] || 'bg-gray-50'
}

const getRiskTextColor = (risk) => {
  const colors = {
    safe: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
  }
  return colors[risk] || 'text-gray-500'
}

const overallRiskText = computed(() => {
  const texts = {
    safe: '안전',
    warning: '주의',
    danger: '위험',
  }
  return texts[props.overallRisk]
})

const overallRiskMessage = computed(() => {
  const messages = {
    safe: '이 매물은 현재 안전한 상태입니다',
    warning: '이 매물은 주의가 필요한 상태입니다',
    danger: '이 매물은 위험한 상태입니다',
  }
  return messages[props.overallRisk]
})

const overallRiskDescription = computed(() => {
  const descriptions = {
    safe: '안전한 것으로 판단됩니다.',
    warning: '일부 주의사항이 있는 것으로 판단됩니다.',
    danger: '위험 요소가 있는 것으로 판단됩니다.',
  }
  return descriptions[props.overallRisk]
})
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-3 sm:mb-4">종합 위험도</h3>

    <div class="flex justify-center items-center">
      <div :class="['w-full max-w-[448px] h-[100px] sm:h-[120px] rounded-xl p-4 sm:p-6', getRiskBgColor(overallRisk)]">
        <div class="flex flex-col items-center justify-center h-full">
          <div :class="['text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3', getRiskTextColor(overallRisk)]">
            {{ overallRiskText }}
          </div>
          <div class="text-sm sm:text-base lg:text-lg font-medium text-gray-warm-700 text-center">
            {{ overallRiskMessage }}
          </div>
        </div>
      </div>
    </div>

    <div class="text-center text-sm sm:text-base text-gray-warm-500 pt-3 sm:pt-4">
      AI 분석 결과, 이 매물은 {{ overallRiskDescription }}
    </div>
  </div>
</template>
