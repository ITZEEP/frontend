<script setup>
import { defineProps } from 'vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconQuestionCircle from '@/components/icons/IconQuestionCircle.vue'
import IconWarningTriangle from '@/components/icons/IconWarningTriangle.vue'

const props = defineProps({
  analysisData: {
    type: Object,
    required: true,
  },
})

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
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <h3 class="text-xl font-semibold text-gray-warm-700 mb-6">상세 분석 결과</h3>

    <div class="space-y-8">
      <!-- 기본 정보 -->
      <div>
        <h4
          class="text-lg font-semibold text-gray-warm-700 pb-2.5 border-b border-gray-300 mb-4"
        >
          기본 정보
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="item in analysisData.basicInfo"
            :key="item.name"
            class="p-4 bg-gray-100 rounded-xl"
          >
            <div class="flex items-center gap-2 mb-2">
              <component
                :is="getStatusIcon(item.status)"
                :class="getIconClass(item.status)"
              />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.name }}</span>
            </div>
            <p class="text-base text-gray-warm-500">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 법적 안전성 -->
      <div>
        <h4
          class="text-lg font-semibold text-gray-warm-700 pb-2.5 border-b border-gray-300 mb-4"
        >
          법적 안전성
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="item in analysisData.legalSafety"
            :key="item.name"
            class="p-4 bg-gray-100 rounded-xl"
          >
            <div class="flex items-center gap-2 mb-2">
              <component
                :is="getStatusIcon(item.status)"
                :class="getIconClass(item.status)"
              />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.name }}</span>
            </div>
            <p class="text-base text-gray-warm-500">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 건물 안전성 -->
      <div>
        <h4
          class="text-lg font-semibold text-gray-warm-700 pb-2.5 border-b border-gray-300 mb-4"
        >
          건물 안전성
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="item in analysisData.buildingSafety"
            :key="item.name"
            class="p-4 bg-gray-100 rounded-xl"
          >
            <div class="flex items-center gap-2 mb-2">
              <component
                :is="getStatusIcon(item.status)"
                :class="getIconClass(item.status)"
              />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.name }}</span>
            </div>
            <p class="text-base text-gray-warm-500">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- 금융 안전성 -->
      <div>
        <h4
          class="text-lg font-semibold text-gray-warm-700 pb-2.5 border-b border-gray-300 mb-4"
        >
          금융 안전성
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="item in analysisData.financialSafety"
            :key="item.name"
            class="p-4 bg-gray-100 rounded-xl"
          >
            <div class="flex items-center gap-2 mb-2">
              <component
                :is="getStatusIcon(item.status)"
                :class="getIconClass(item.status)"
              />
              <span class="text-sm font-medium text-gray-warm-700">{{ item.name }}</span>
            </div>
            <p class="text-base text-gray-warm-500">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>