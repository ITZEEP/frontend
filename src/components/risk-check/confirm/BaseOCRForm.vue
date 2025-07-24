<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  shake: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const updateNestedField = (parentField, field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [parentField]: {
      ...props.modelValue[parentField],
      [field]: value,
    },
  })
}

defineExpose({
  updateField,
  updateNestedField,
})
</script>

<template>
  <slot
    :modelValue="modelValue"
    :errors="errors"
    :shake="shake"
    :updateField="updateField"
    :updateNestedField="updateNestedField"
  />
</template>
