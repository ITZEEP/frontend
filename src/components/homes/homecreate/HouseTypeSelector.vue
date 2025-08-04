<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      매물 종류 <span class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="type in houseTypes"
        :key="type"
        @click="selectType(type)"
        :class="[
          'py-2 px-4 border rounded-md text-sm font-medium transition',
          modelValue === type
            ? 'bg-yellow-primary text-white border-yellow-primary'
            : 'bg-white text-gray-700 hover:bg-gray-50',
        ]"
      >
        {{ type }}
      </button>
    </div>
  </div>
</template>

<script setup>
const houseTypes = ['오픈형 원룸', '분리형 원룸', '투룸', '오피스텔', '아파트', '단독/다가구주택']

defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const selectType = (type) => {
  emit('update:modelValue', type)
}
</script>
