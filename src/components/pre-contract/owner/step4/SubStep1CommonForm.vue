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
      label="반려동물 입주가 가능한가요??"
      v-model="form.pet"
      :options="[
        { label: '금지', value: 'ban' },
        { label: '허용', value: 'allow' },
        { label: '상관없음', value: 'any' },
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
  </div>
</template>

<script setup>
import { reactive, watch, onMounted } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()
const model = defineModel()

const form = reactive({
  mandatoryInsurance: '',
  insurancePayer: '',
  pet: '',
  notice: '',
})

watch(form, () => (model.value = form), { deep: true })

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
