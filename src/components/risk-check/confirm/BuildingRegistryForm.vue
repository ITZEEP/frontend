<script setup>
import { defineProps, defineEmits } from 'vue'
import OCRFormBox from './OCRFormBox.vue'
import OCRFormField from './OCRFormField.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  shake: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<template>
  <OCRFormBox title="건축물대장 내용">
    <OCRFormField
      :modelValue="modelValue.대지위치"
      @update:modelValue="value => updateField('대지위치', value)"
      label="대지 위치"
      :required="true"
      :error="errors.대지위치"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.도로명주소"
      @update:modelValue="value => updateField('도로명주소', value)"
      label="도로명 주소"
      :required="true"
      :error="errors.도로명주소"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.연면적"
      @update:modelValue="value => updateField('연면적', value)"
      label="연면적"
      placeholder="예: 150.50"
      :required="true"
      :error="errors.연면적"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.용도"
      @update:modelValue="value => updateField('용도', value)"
      label="용도"
      :required="true"
      :error="errors.용도"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.층수"
      @update:modelValue="value => updateField('층수', value)"
      label="층수"
      :required="true"
      :error="errors.층수"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.사용승인일"
      @update:modelValue="value => updateField('사용승인일', value)"
      label="사용승인일"
      placeholder="예: 2020-03-15"
      :required="true"
      :error="errors.사용승인일"
      :shake="shake"
    />

    <div>
      <label class="block text-sm font-medium text-gray-warm-700 mb-2">
        위반건축물 여부
      </label>
      <BaseCheckbox
        :modelValue="modelValue.위반건축물여부"
        @update:modelValue="value => updateField('위반건축물여부', value)"
        label="위반건축물 표시 있음"
      />
    </div>
  </OCRFormBox>
</template>