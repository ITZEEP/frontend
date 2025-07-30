<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="label"
      :id="`label-${$attrs.id || 'toggle'}`"
      class="text-sm font-medium text-gray-700"
    >
      {{ label }}
    </label>

    <div
      class="flex gap-2"
      role="radiogroup"
      :aria-labelledby="label ? `label-${$attrs.id || 'toggle'}` : undefined"
    >
      <button
        v-for="option in options"
        :key="option.value"
        :role="'radio'"
        :aria-checked="modelValue === option.value"
        :aria-labelledby="label ? `label-${$attrs.id || 'toggle'}` : undefined"
        :tabindex="modelValue === option.value ? 0 : -1"
        :class="[
          'px-4 py-2 rounded-md border text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-yellow-primary focus:ring-offset-2',
          modelValue === option.value
            ? 'bg-yellow-50 border-yellow-400 text-yellow-primary'
            : 'bg-white border-gray-300 text-gray-500',
        ]"
        @click="updateValue(option.value)"
        @keydown.enter.prevent="updateValue(option.value)"
        @keydown.arrow-left.prevent="navigateOption(-1)"
        @keydown.arrow-right.prevent="navigateOption(1)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const { modelValue, label, options } = defineProps({
  modelValue: {
    type: [String, Boolean, Number],
    required: true,
  },
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

const navigateOption = (direction) => {
  const currentIndex = options.findIndex((option) => option.value === modelValue)
  let newIndex = currentIndex + direction

  if (newIndex < 0) {
    newIndex = options.length - 1
  } else if (newIndex >= options.length) {
    newIndex = 0
  }

  updateValue(options[newIndex].value)
}
</script>
