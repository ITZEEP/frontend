<script setup>
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconQuestionCircle from '@/components/icons/IconQuestionCircle.vue'
import IconWarningTriangle from '@/components/icons/IconWarningTriangle.vue'

defineProps({
  analysisData: {
    type: Object,
    required: false,
  },
  detailGroups: {
    type: Array,
    required: false,
  },
  categorizedDetails: {
    type: Object,
    required: false,
  },
})

// 섹션 정의 배열
const sections = [
  { key: 'basicInfo', title: '기본 정보' },
  { key: 'legalSafety', title: '법적 안전성' },
  { key: 'buildingSafety', title: '건물 안전성' },
  { key: 'financialSafety', title: '금융 안전성' }
]

const getStatusIcon = (status) => {
  switch (status) {
    case 'safe':
      return IconCheckCircle
    case 'warning':
      return IconWarningTriangle
    default:
      return IconQuestionCircle
  }
}

const getIconClass = (status) => {
  switch (status) {
    case 'safe':
      return 'text-yellow-primary'
    case 'warning':
      return 'text-red-500'
    default:
      return 'text-gray-warm-500'
  }
}
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">상세 분석 결과</h3>

    <!-- detailGroups 배열이 있을 때 표시 -->
    <div v-if="detailGroups && detailGroups.length > 0" class="space-y-6 sm:space-y-8">
      <div v-for="(group, groupIndex) in detailGroups" :key="groupIndex">
        <h4 class="text-base sm:text-lg font-semibold text-gray-warm-700 pb-2 sm:pb-2.5 border-b border-gray-300 mb-3 sm:mb-4">
          {{ group.title }}
        </h4>
        <div class="space-y-3 sm:space-y-4">
          <div
            v-for="(item, itemIndex) in group.items"
            :key="itemIndex"
            class="p-3 sm:p-4 bg-gray-100 rounded-lg sm:rounded-xl"
          >
            <div class="flex items-start gap-2 mb-1.5 sm:mb-2">
              <IconCheckCircle class="text-yellow-primary w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.title }}</span>
            </div>
            <p class="text-sm sm:text-base text-gray-warm-500 pl-6 sm:pl-7">{{ item.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- categorizedDetails 사용 -->
    <div v-else-if="categorizedDetails" class="space-y-6 sm:space-y-8">
      <div v-for="section in sections" :key="section.key">
        <h4 class="text-base sm:text-lg font-semibold text-gray-warm-700 pb-2 sm:pb-2.5 border-b border-gray-300 mb-3 sm:mb-4">
          {{ section.title }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div
            v-for="item in categorizedDetails[section.key]"
            :key="item.name"
            class="p-3 sm:p-4 bg-gray-100 rounded-lg sm:rounded-xl"
          >
            <div class="flex items-start gap-2 mb-1.5 sm:mb-2">
              <component :is="getStatusIcon(item.status)" :class="[getIconClass(item.status), 'w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0']" />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.name }}</span>
            </div>
            <p class="text-sm sm:text-base text-gray-warm-500 pl-6 sm:pl-7">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 기존 detailedAnalysis 방식 (fallback) -->
    <div v-else-if="analysisData" class="space-y-6 sm:space-y-8">
      <div v-for="section in sections" :key="section.key">
        <h4 class="text-base sm:text-lg font-semibold text-gray-warm-700 pb-2 sm:pb-2.5 border-b border-gray-300 mb-3 sm:mb-4">
          {{ section.title }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div
            v-for="item in analysisData[section.key]"
            :key="item.name"
            class="p-3 sm:p-4 bg-gray-100 rounded-lg sm:rounded-xl"
          >
            <div class="flex items-start gap-2 mb-1.5 sm:mb-2">
              <component :is="getStatusIcon(item.status)" :class="[getIconClass(item.status), 'w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0']" />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.name }}</span>
            </div>
            <p class="text-sm sm:text-base text-gray-warm-500 pl-6 sm:pl-7">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
