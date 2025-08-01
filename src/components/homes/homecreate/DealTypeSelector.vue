<script setup>
import { defineEmits, defineProps, ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const selected = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    selected.value = newVal
  },
)

function onChange(value) {
  selected.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <label class="block text-sm font-medium text-gray-700 mb-1">
    거래 유형 <span class="text-red-500">*</span>
  </label>
  <div class="flex gap-6">
    <label class="flex items-center cursor-pointer text-gray-700">
      <input
        type="radio"
        class="form-radio"
        name="dealType"
        value="월세"
        :checked="selected === '월세'"
        @change="onChange('월세')"
      />
      <span class="ml-2 select-none">월세</span>
    </label>

    <label class="flex items-center cursor-pointer text-gray-700">
      <input
        type="radio"
        class="form-radio"
        name="dealType"
        value="전세"
        :checked="selected === '전세'"
        @change="onChange('전세')"
      />
      <span class="ml-2 select-none">전세</span>
    </label>
  </div>
</template>

<style scoped>
.form-radio {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6; /* Tailwind의 blue-500 색상 */
}
</style>
