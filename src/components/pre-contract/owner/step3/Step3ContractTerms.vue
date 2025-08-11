<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">계약 조건 설정</h1>
      <p class="text-gray-500">계약 조건 및 책임관계를 설정해주세요.</p>
    </div>

    <component :is="subStep === 1 ? ContractForm : RestorationForm" />
  </div>
</template>

<script setup>
import { defineProps, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ContractForm from './SubStep1ContractForm.vue'
import RestorationForm from './SubStep2RestorationForm.vue'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'

const props = defineProps({ subStep: Number })
const route = useRoute()

watchEffect(() => {
  console.log('[Step3ContractTerms] 현재 subStep:', props.subStep)
})

onMounted(async () => {
  const contractChatId = route.params.id
  try {
    const result = await OwnerPreContractAPI.saveOwnerInfo(contractChatId)
    console.log('임대인 기본 정보 저장 완료:', result)
  } catch (e) {
    console.error('임대인 정보 저장 실패:', e)
  }
})
</script>
