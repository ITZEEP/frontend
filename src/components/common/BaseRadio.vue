<!-- components/common/BaseRadio.vue -->
<script setup>
const props = defineProps({
  modelValue: String,
  label: String,
  value: String,
  name: String,
})

const emit = defineEmits(['update:modelValue'])

const handleChange = () => {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <label class="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      class="sr-only"
      :checked="modelValue === value"
      :name="name"
      @change="handleChange"
    />
    <div
      :class="[
        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition',
        modelValue === value
          ? 'bg-yellow-primary border-yellow-primary'
          : 'bg-white border-gray-300 hover:border-gray-400',
      ]"
    >
      <div v-if="modelValue === value" class="w-2 h-2 rounded-full bg-white" />
    </div>
    <span class="text-base text-gray-warm-700">{{ label }}</span>
  </label>
</template>
