<template>
  <div class="butter-box w-full p-6 space-y-4">
    <div class="flex items-start gap-2">
      <InfoIcon class="text-yellow-primary mt-1" />
      <div class="text-sm text-gray-700">
        <p class="font-semibold mb-1">매물 정보 확인</p>
        <p class="text-gray-500">
          위 정보가 정확한지 확인해주세요. 계약서에는 이 정보를 기반으로 내용이 작성됩니다.
        </p>
      </div>
    </div>

    <label class="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" v-model="checked" />
      매물 정보가 정확함을 확인합니다
    </label>
  </div>
</template>

<script setup>
import InfoIcon from '@/assets/icons/InfoIcon.vue'
import { defineModel, watch } from 'vue'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()
const checked = defineModel('checked', { type: Boolean, default: false })
watch(checked, (newVal) => {
  store.setCanProceed(newVal)
})
</script>
