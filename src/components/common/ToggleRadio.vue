<template>
  <div class="flex gap-2">
    <button
      v-for="option in props.options"
      :key="option.value"
      :class="[
        'px-4 py-2 rounded-md border text-sm font-medium transition-all',
        modelValue === option.value
          ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
          : 'bg-white border-gray-300 text-gray-500',
      ]"
      @click="updateValue(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: String,
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (value) => {
  emit('update:modelValue', value)
}
</script>
