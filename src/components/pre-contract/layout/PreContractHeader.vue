<template>
  <header class="w-full border-b border-gray-200 bg-white px-8 py-4">
    <div class="flex justify-between items-center mb-2">
      <p class="text-sm font-semibold">계약서 작성 진행 상황</p>
      <p class="text-xs text-gray-500">{{ currentStep }}/{{ steps.length }}</p>
    </div>

    <!-- 진행 바 -->
    <div class="relative h-2 bg-gray-200 rounded-full">
      <div
        class="absolute h-2 bg-yellow-primary rounded-full transition-all duration-300"
        :style="{ width: progressPercent + '%' }"
      ></div>
    </div>

    <!-- 단계 이름 리스트 -->
    <div class="flex justify-between text-xs text-gray-600 mt-2">
      <span
        v-for="(step, index) in steps"
        :key="index"
        :class="{
          'text-yellow-primary font-semibold': currentStep === index + 1,
        }"
      >
        {{ step }}
      </span>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 1. URL 쿼리에서 step 값을 가져옴
const role = computed(() => {
  const paramRole = route.params.role
  const validRoles = ['buyer', 'owner']
  if (!validRoles.includes(paramRole)) {
    console.error('buyer/owner 외의 다른 값이 입력됐습니다.')
  }
  return paramRole
})

const currentStep = computed(() => Number(route.query.step || 1))

onMounted(() => {
  if (!route.query.step || !route.params.role) {
    console.error('단계 혹은 역할이 잘못됐습니다.')
  }
})

// 2. 단계 배열 정의
const stepsByRole = {
  buyer: ['매물선택', '위험도분석', '본인 인증', '계약조건', '생활환경', '확인완료'],
  owner: [
    '매물 확인',
    '본인 인증 및 임차인 확인',
    '계약 조건 설정',
    '거주 조건 설정',
    '특약 사항 업로드',
    '최종 확인',
  ],
}

const steps = computed(() => stepsByRole[role.value] || [])

// 3. 진행률 퍼센트 계산
const progressPercent = computed(() => {
  if (steps.value.length === 0 || currentStep.value < 1 || currentStep.value > steps.value.length) {
    console.error('진행바의 조건이 이상합니다.')
    return
  }
  const percent = ((currentStep.value - 1) / (steps.value.length - 1)) * 100
  return Math.max(percent, 2)
})
</script>

<style scoped></style>
