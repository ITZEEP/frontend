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
import ContractForm from './SubStep1ContractForm.vue'
import RestorationForm from './SubStep2RestorationForm.vue'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'
import { useRoute } from 'vue-router'

const route = useRoute()
const contractChatId = route.params.id
const props = defineProps({ subStep: Number })

watchEffect(() => {
  console.log('[Step3ContractTerms] 현재 subStep:', props.subStep)
})

onMounted(async () => {
  try {
    await OwnerPreContractAPI.saveOwnerInfo(contractChatId)
  } catch (error) {
    console.log('임대인 사전 조사 DB 세팅 실패: ' + error.message)
  }
})
</script>
