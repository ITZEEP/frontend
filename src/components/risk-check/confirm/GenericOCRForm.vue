<script setup>
import OCRFormBox from './OCRFormBox.vue'
import OCRFormField from './OCRFormField.vue'
import OCRCheckboxField from './OCRCheckboxField.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
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
  fields: {
    type: Array,
    required: true,
  },
  checkboxGroups: {
    type: Array,
    default: () => [],
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
</script>

<template>
  <OCRFormBox :title="title">
    <OCRFormField
      v-for="fieldConfig in fields"
      :key="fieldConfig.field"
      :modelValue="modelValue[fieldConfig.field]"
      @update:modelValue="(value) => updateField(fieldConfig.field, value)"
      :label="fieldConfig.label"
      :placeholder="fieldConfig.placeholder"
      :required="fieldConfig.required"
      :error="errors[fieldConfig.field]"
      :shake="shake"
    />

    <div v-for="group in checkboxGroups" :key="group.name">
      <label class="block text-sm font-medium text-gray-warm-700 mb-2">
        {{ group.label }}
      </label>
      <div v-if="group.type === 'multiple'" class="space-y-2">
        <OCRCheckboxField
          v-for="option in group.options"
          :key="option.field"
          :modelValue="modelValue[group.name]?.[option.field]"
          @update:modelValue="(value) => updateNestedField(group.name, option.field, value)"
          :label="option.label"
        />
      </div>
      <OCRCheckboxField
        v-else
        :modelValue="modelValue[group.name]"
        @update:modelValue="(value) => updateField(group.name, value)"
        :label="group.singleLabel"
      />
    </div>
  </OCRFormBox>
</template>
