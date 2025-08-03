<template>
  <div class="w-full space-y-6">
    <BaseInput v-model="form.rentDate" label="월세 납부일" type="date" />

    <div class="w-full flex flex-col gap-2">
      <p class="text-sm font-medium text-gray-600">연체 시 이자율 (%) 입력하세요.</p>
      <div class="w-40 flex gap-4">
        <p class="flex justify-center items-end mb-2 text-sm text-gray-600">월</p>
        <BaseInput v-model="form.penaltyRate" type="number" placeholder="" class="w-32" />
        <p class="flex justify-center items-end mb-2 text-sm text-gray-600">%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'

const model = defineModel()

const form = reactive({
  rentDate: '',
  penaltyRate: 0,
})

// form이 변경될 때 부모에게 반영
watch(
  form,
  () => {
    model.value = { ...form }
  },
  { deep: true },
)
</script>
