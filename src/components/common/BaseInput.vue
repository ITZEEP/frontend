<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block mb-1 text-sm font-medium text-gray-600">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="[
        'w-full rounded-md border border-gray-300 px-4 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-yellow-primary',
        error ? 'border-red-500' : '',
        inputClass,
      ]"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  placeholder: String,
  label: String,
  id: String,
  type: {
    type: String,
    default: 'text',
  },
  error: String,
  inputClass: String,
})
</script>
