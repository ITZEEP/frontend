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

const updateLegalRestriction = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    법적제한사항: {
      ...props.modelValue.법적제한사항,
      [field]: value
    }
  })
}
</script>

<template>
  <OCRFormBox title="등기부등본 내용">
    <OCRFormField
      :modelValue="modelValue.지역관련주소"
      @update:modelValue="value => updateField('지역관련주소', value)"
      label="지역 관련 주소"
      placeholder="예: 서울시 강남구"
      :error="errors.지역관련주소"
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
      :modelValue="modelValue.소유자이름"
      @update:modelValue="value => updateField('소유자이름', value)"
      label="소유자 이름"
      :required="true"
      :error="errors.소유자이름"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.소유자생년월일"
      @update:modelValue="value => updateField('소유자생년월일', value)"
      label="소유자 생년월일"
      placeholder="예: 1980-01-01"
      :required="true"
      :error="errors.소유자생년월일"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.채권최고액"
      @update:modelValue="value => updateField('채권최고액', value)"
      label="채권최고액"
      :error="errors.채권최고액"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.채무자"
      @update:modelValue="value => updateField('채무자', value)"
      label="채무자"
      :error="errors.채무자"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.근저당권자"
      @update:modelValue="value => updateField('근저당권자', value)"
      label="근저당권자"
      :error="errors.근저당권자"
      :shake="shake"
    />

    <div>
      <label class="block text-sm font-medium text-gray-warm-700 mb-2">
        법적 제한 사항
      </label>
      <div class="flex flex-wrap gap-4">
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.가압류"
          @update:modelValue="value => updateLegalRestriction('가압류', value)"
          label="가압류"
        />
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.경매"
          @update:modelValue="value => updateLegalRestriction('경매', value)"
          label="경매"
        />
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.소송"
          @update:modelValue="value => updateLegalRestriction('소송', value)"
          label="소송"
        />
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.압류"
          @update:modelValue="value => updateLegalRestriction('압류', value)"
          label="압류"
        />
      </div>
    </div>
  </OCRFormBox>
</template>