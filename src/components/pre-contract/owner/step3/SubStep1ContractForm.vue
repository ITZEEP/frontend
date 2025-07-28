<template>
  <div class="flex flex-col gap-4 w-full">
    <h2 class="text-gray-warm-700 font-bold">계약 조건 확인</h2>
    <ToggleRadio
      label="해당 매물에 근저당이 설정되어 있나요?"
      v-model="isMortgaged"
      :options="[
        { label: '예', value: true },
        { label: '아니오', value: false },
      ]"
    />
    <ToggleRadio
      label="원하는 계약 기간은 어떻게 되시나요?"
      v-model="contractDuration"
      :options="[
        { label: '1년', value: '1year' },
        { label: '2년', value: '2year' },
        { label: '2년 이상', value: 'over2years' },
      ]"
    />
    <ToggleRadio
      label="재계약(갱신) 의사가 있으신가요?"
      v-model="renewalIntent"
      :options="[
        { label: '있음', value: 'yes' },
        { label: '없음', value: 'no' },
        { label: '미정', value: 'unknown' },
      ]"
    />

    <h2 class="text-gray-warm-700 font-bold">옵션 및 비품 관리</h2>
    <ToggleRadio
      label="비품 수리 책임은 누구에게 있나요?"
      v-model="repairingFixtures"
      :options="[
        { label: '임대인', value: 'owner' },
        { label: '임차인', value: 'tenant' },
      ]"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()

const isMortgaged = ref('')
const contractDuration = ref('')
const renewalIntent = ref('')
const repairingFixtures = ref('')

// 모든 항목이 입력되었는지 감시
watch(
  [isMortgaged, contractDuration, renewalIntent, repairingFixtures],
  ([mort, dur, renew, fix]) => {
    const allFilled = mort !== null && dur !== '' && renew !== '' && fix !== ''
    store.setCanProceed(allFilled)
  },
)

onMounted(() => {
  store.canProceed = false
})
</script>
