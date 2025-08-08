<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      매물 종류 <span class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="type in houseTypes"
        :key="type.value"
        @click="selectType(type.value)"
        :class="[
          'py-2 px-4 border rounded-md text-sm font-medium transition',
          modelValue === type.value
            ? 'bg-yellow-primary text-white border-yellow-primary'
            : 'bg-white text-gray-700 hover:bg-gray-50',
        ]"
      >
        {{ type.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const houseTypes = [
  { label: '오픈형 원룸', value: 'OPEN_ONE_ROOM' },
  { label: '분리형 원룸', value: 'SEPARATED_ONE_ROOM' },
  { label: '투룸', value: 'TWO_ROOM' },
  { label: '오피스텔', value: 'OFFICETEL' },
  { label: '아파트', value: 'APARTMENT' },
  { label: '단독주택', value: 'HOUSE' },
  { label: '빌라', value: 'VILLA' },
]

defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const selectType = (type) => {
  emit('update:modelValue', type)
}
</script>
