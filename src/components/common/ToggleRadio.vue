<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div class="flex gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          'px-4 py-2 rounded-md border text-sm font-medium transition-all',
          modelValue === option.value
            ? 'bg-yellow-50 border-yellow-400 text-yellow-primary'
            : 'bg-white border-gray-300 text-gray-500',
        ]"
        @click="updateValue(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const { modelValue, label, options } = defineProps({
  modelValue: String,
  options: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (value) => {
  emit('update:modelValue', value)
}
</script>
