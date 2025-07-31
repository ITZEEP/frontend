<template>
  <div class="w-full space-y-6">
    <ToggleRadio
      label="보증금 조정 가능 여부"
      v-model="form.depositAdjustable"
      :options="[
        { label: '가능', value: true },
        { label: '불가능', value: false },
      ]"
    />

    <div v-if="form.depositAdjustable" class="w-full flex flex-col gap-2">
      <p class="text-sm font-medium text-gray-600">보증금 조정 시 하한선을 입력하세요.</p>
      <div class="flex gap-4">
        <BaseInput label="" type="number" placeholder="" class="w-32" />
        <p class="flex justify-center items-end mb-2 text-sm text-gray-600">만 원</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const model = defineModel()
const form = reactive({
  depositAdjustable: '',
  depositMin: '',
})

watch(form, () => (model.value = form), { deep: true })
</script>
