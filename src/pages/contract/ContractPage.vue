<template>
  <section class="w-screen min-h-screen bg-yellow-50">
    <div class="w-full h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-36 py-8 flex flex-col gap-8">
      <header class="flex flex-col gap-2">
        <h1 class="text-gray-warm-700 font-bold text-xl">협업 계약서 작성</h1>
        <p class="text-gray-500">실시간 채팅으로 임대인과 임차인이 함께 계약서를 작성하세요</p>
      </header>

      <div class="flex-1 flex flex-col gap-8">
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

        <div class="flex-1 flex justify-between gap-4 overflow-hidden">
          <!-- 채팅 영역 -->
          <div class="w-1/3 h-full">
            <ContractChat :currentStep="step" :contractChatId="roomId" />
          </div>

          <!-- 단계별 컴포넌트 -->
          <StepContentWrapper v-if="step !== null" :step="step" />
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
import StepContentWrapper from '@/components/contract/form/StepContentWrapper.vue'

const route = useRoute()

// 경로 파라미터에서 roomId 추출
const roomId = computed(() => route.params.id)
console.log('contractPage의 roomId: ' + roomId.value)

// 쿼리 파라미터에서 step 추출
const step = computed(() => {
  const s = Number(route.query.step)
  return Number.isNaN(s) ? null : s
})

const participants = [
  { id: 1, name: '이임차', role: '임차인', isOnline: true, isAi: false },
  { id: 2, name: 'AI 어시스턴트', role: '', isOnline: true, isAi: true },
]
</script>

<style scoped></style>
