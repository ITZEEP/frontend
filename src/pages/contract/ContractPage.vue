<template>
  <section class="w-screen min-h-screen bg-yellow-50">
    <div class="w-full h-full px-36 py-8 flex flex-col gap-8">
      <header class="flex flex-col gap-2">
        <h1 class="text-gray-warm-700 font-bold text-xl">협업 계약서 작성</h1>
        <p class="text-gray-500">실시간 채팅으로 임대인과 임차인이 함께 계약서를 작성하세요</p>
      </header>

      <div class="flex flex-col gap-8">
        <!-- 참여자 목록 -->
        <div class="flex gap-6 items-center bg-white px-4 py-2 rounded-lg">
          <ParticipantItem
            v-for="participant in participants"
            :key="participant.id"
            :name="participant.name"
            :role="participant.role"
            :isOnline="participant.isOnline"
            :isAi="participant.isAi"
          />
        </div>
        <div class="flex justify-between w-full">
          <!-- 채팅 영역 -->
          <div class="w-1/3">
            <ContractChat :currentStep="step" :roomId="roomId" />
          </div>

          <!-- 단계별 컴포넌트 -->
          <div class="w-3/5 bg-white rounded-lg">
            <component v-if="step != null" :is="currentStepComponent" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ContractChat from '@/components/contract/chat/ContractChat.vue'
import ParticipantItem from '@/components/contract/chat/ParticipantItem.vue'

import Step1Compare from '@/components/contract/form/Step1Compare.vue'
import Step2Price from '@/components/contract/form/Step2Price.vue'
import Step3Terms from '@/components/contract/form/Step3Terms.vue'
import Step4Legal from '@/components/contract/form/Step4Legal.vue'
import Step5Done from '@/components/contract/form/Step5Done.vue'

const route = useRoute()

// 경로 파라미터에서 roomId 추출
const roomId = computed(() => route.params.roomId)

// 쿼리 파라미터에서 step 추출
const step = computed(() => {
  const s = Number(route.query.step)
  return Number.isNaN(s) ? null : s
})

// 단계별 컴포넌트 매핑
const stepComponents = {
  1: Step1Compare,
  2: Step2Price,
  3: Step3Terms,
  4: Step4Legal,
  5: Step5Done,
}

const currentStepComponent = computed(() => (step.value ? stepComponents[step.value] : null))

const participants = [
  { id: 1, name: '이임차', role: '임차인', isOnline: true, isAi: false },
  { id: 2, name: 'AI 어시스턴트', role: '', isOnline: true, isAi: true },
]
</script>

<style scoped></style>
