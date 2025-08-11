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
      class="flex gap-2 flex-wrap"
      role="group"
      :aria-labelledby="label ? `label-${$attrs.id || 'toggle'}` : undefined"
    >
      <button
        v-for="option in options"
        :key="option.value"
        :role="'checkbox'"
        :aria-checked="modelValue.includes(option.value)"
        :aria-labelledby="label ? `label-${$attrs.id || 'toggle'}` : undefined"
        :tabindex="modelValue.includes(option.value) ? 0 : -1"
        :class="[
          'px-4 py-2 rounded-md border text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-yellow-primary focus:ring-offset-2',
          modelValue.includes(option.value)
            ? 'bg-yellow-50 border-yellow-400 text-yellow-primary'
            : 'bg-white border-gray-300 text-gray-500',
        ]"
        @click="toggleValue(option.value)"
        @keydown.enter.prevent="toggleValue(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
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

const toggleValue = (value) => {
  const updated = [...props.modelValue]
  const index = updated.indexOf(value)
  if (index > -1) {
    updated.splice(index, 1)
  } else {
    updated.push(value)
  }
  emit('update:modelValue', updated)
}
</script>
