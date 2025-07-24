<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  emit('update:modelValue', event.target.checked)
}
</script>

<template>
  <label
    class="inline-flex items-center gap-2 cursor-pointer focus-within:outline-2 focus-within:outline-blue-500 focus-within:outline-offset-2 rounded"
  >
    <input
      :checked="modelValue"
      @change="handleChange"
      type="checkbox"
      class="sr-only focus:outline-none"
      :aria-describedby="label"
    />
    <div
      :class="[
        'relative w-4 h-4 rounded border-2 transition-all flex items-center justify-center flex-shrink-0',
        modelValue
          ? 'bg-yellow-primary border-yellow-primary'
          : 'bg-white border-gray-300 hover:border-gray-400',
      ]"
    >
      <svg v-if="modelValue" class="absolute w-3 h-3" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 8L7 11L12 5"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <span class="text-base text-gray-warm-700">{{ label }}</span>
  </label>
</template>
