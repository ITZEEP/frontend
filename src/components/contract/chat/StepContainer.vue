<template>
  <div class="mb-6">
    <hr class="border-gray-300" />
    <p class="text-center text-sm text-gray-500 mt-2">
      {{ stepLabelMap[step] }}
    </p>
  </div>
  <component
    :is="currentIntroComponent"
    v-if="currentIntroComponent"
    :scenario="scenario"
    @action="handleAction"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import stepIntroMap from './stepScenarios'
import { scenarioMap } from '@/constants/contractStepScenario'

const stepLabelMap = {
  1: '1단계: 기본 정보 확인',
  2: '2단계: 계약 금액 조율',
  3: '3단계: 특약 조율',
  4: '4단계: 계약서 작성',
}

const route = useRoute()

const step = computed(() => String(route.query.step || '1'))

const currentIntroComponent = computed(() => stepIntroMap[step.value])

// 현재 step에 맞는 시나리오 배열
const scenario = computed(() => scenarioMap[step.value] || [])

const handleAction = (action) => {
  console.log('Intro 메시지 내 액션:', action)
}
</script>
