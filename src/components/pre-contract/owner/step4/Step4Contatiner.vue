<template>
  <div class="w-full space-y-6">
    <ToggleRadio
      label="보증보험 비용이 의무 사항인가요?"
      v-model="form.mandatoryInsurance"
      :options="[
        { label: '예', value: 'yes' },
        { label: '아니오', value: 'no' },
      ]"
    />
    <ToggleRadio
      label="보증보험 비용은 누가 부담하나요?"
      v-model="form.insurancePayer"
      :options="[
        { label: '임대인', value: 'owner' },
        { label: '임차인', value: 'tenant' },
        { label: '일부 부담', value: 'shared' },
      ]"
    />
    <ToggleRadio
      label="공사 예정, 소음 등 고지해야 할 사항이 있나요?"
      v-model="form.notice"
      :options="[
        { label: '있음', value: 'yes' },
        { label: '없음', value: 'no' },
      ]"
    />

    <WolseForm v-if="rentType === 'WOLSE'" />
  </div>
</template>

<script setup>
import { reactive, watch, onMounted, computed } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { usePreContractStore } from '@/stores/preContract'
import WolseForm from './Step4WolseForm.vue'

const store = usePreContractStore()
const model = defineModel()

const form = reactive({
  mandatoryInsurance: '',
  insurancePayer: '',
  notice: '',
})

watch(form, () => (model.value = form), { deep: true })
const rentType = computed(() => localStorage.getItem('rent_type'))

watch(
  () => Object.values(form),
  (values) => {
    const isValid = values.every((v) => v !== '')
    store.setCanProceed(isValid)
  },
  { deep: true },
)

onMounted(() => {
  store.setCanProceed(false)
})
</script>
