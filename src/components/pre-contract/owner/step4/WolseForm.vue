<template>
  <div class="w-full space-y-6">
    <ToggleRadio
      label="월세 조정 가능 여부"
      v-model="form.rentAdjustable"
      :options="[
        { label: '가능', value: true },
        { label: '불가능', value: false },
      ]"
    />

    <div v-if="form.rentAdjustable" class="w-full flex flex-col gap-2">
      <p class="text-sm font-medium text-gray-600">월세 조정 시 하한선을 입력하세요.</p>
      <div class="flex gap-4">
        <BaseInput label="" v-model="form.rentMin" type="number" placeholder="" class="w-32" />
        <p class="flex justify-center items-end mb-2 text-sm text-gray-600">만 원</p>
      </div>
    </div>

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

    <BaseInput v-model="form.rentDate" label="월세 납부일" type="date" />

    <BaseInput v-model="form.penaltyRate" type="number" placeholder="연체 시 이자율 (%)" />
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const model = defineModel()
const form = reactive({
  rentAdjustable: '',
  rentMin: '',
  depositAdjustable: '',
  depositMin: '',
  rentDate: '',
  penaltyRate: '',
})

watch(form, () => (model.value = form), { deep: true })
</script>
