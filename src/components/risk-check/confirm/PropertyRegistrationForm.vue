<script setup>
import OCRFormBox from './OCRFormBox.vue'
import OCRFormField from './OCRFormField.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

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

const updateLegalRestriction = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    법적제한사항: {
      ...props.modelValue.법적제한사항,
      [field]: value,
    },
  })
}

const updateMortgageeList = (index, field, value) => {
  const updatedList = [...(props.modelValue.근저당권목록 || [])]
  if (!updatedList[index]) {
    updatedList[index] = {}
  }
  updatedList[index] = {
    ...updatedList[index],
    [field]: value,
  }
  emit('update:modelValue', {
    ...props.modelValue,
    근저당권목록: updatedList,
  })
}

const addMortgagee = () => {
  const currentList = props.modelValue.근저당권목록 || []
  emit('update:modelValue', {
    ...props.modelValue,
    근저당권목록: [
      ...currentList,
      {
        순위: currentList.length + 1,
        채권최고액: '',
        채무자: props.modelValue.소유자이름 || '',
        근저당권자: '',
      },
    ],
  })
}

const removeMortgagee = (index) => {
  const updatedList = props.modelValue.근저당권목록.filter((_, i) => i !== index)
  // 순위 재정렬
  updatedList.forEach((item, i) => {
    item.순위 = i + 1
  })
  emit('update:modelValue', {
    ...props.modelValue,
    근저당권목록: updatedList,
  })
}
</script>

<template>
  <OCRFormBox title="등기부등본 내용">
    <OCRFormField
      :modelValue="modelValue.지역관련주소"
      @update:modelValue="(value) => updateField('지역관련주소', value)"
      label="지역 관련 주소"
      placeholder="예: 서울시 강남구"
      :error="errors.지역관련주소"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.도로명주소"
      @update:modelValue="(value) => updateField('도로명주소', value)"
      label="도로명 주소"
      :required="true"
      :error="errors.도로명주소"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.소유자이름"
      @update:modelValue="(value) => updateField('소유자이름', value)"
      label="소유자 이름"
      :required="true"
      :error="errors.소유자이름"
      :shake="shake"
    />

    <OCRFormField
      :modelValue="modelValue.소유자생년월일"
      @update:modelValue="(value) => updateField('소유자생년월일', value)"
      label="소유자 생년월일"
      placeholder="예: 1980-01-01"
      :required="true"
      :error="errors.소유자생년월일"
      :shake="shake"
    />

    <!-- 근저당권 목록 -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-warm-700">근저당권 정보</label>
        <button
          type="button"
          @click="addMortgagee"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          + 근저당권 추가
        </button>
      </div>
      
      <div v-if="modelValue.근저당권목록 && modelValue.근저당권목록.length > 0" class="space-y-4">
        <div
          v-for="(mortgagee, index) in modelValue.근저당권목록"
          :key="index"
          class="p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">{{ mortgagee.순위 }}순위</h4>
            <button
              v-if="modelValue.근저당권목록.length > 1"
              type="button"
              @click="removeMortgagee(index)"
              class="text-sm text-red-600 hover:text-red-700"
            >
              삭제
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <OCRFormField
              :modelValue="mortgagee.채권최고액"
              @update:modelValue="(value) => updateMortgageeList(index, '채권최고액', value)"
              label="채권최고액"
              placeholder="예: 100,000,000"
              :error="errors[`근저당권목록_${index}_채권최고액`]"
              :shake="shake"
            />
            
            <OCRFormField
              :modelValue="mortgagee.채무자"
              @update:modelValue="(value) => updateMortgageeList(index, '채무자', value)"
              label="채무자"
              :error="errors[`근저당권목록_${index}_채무자`]"
              :shake="shake"
            />
            
            <OCRFormField
              :modelValue="mortgagee.근저당권자"
              @update:modelValue="(value) => updateMortgageeList(index, '근저당권자', value)"
              label="근저당권자"
              placeholder="예: OO은행"
              :error="errors[`근저당권목록_${index}_근저당권자`]"
              :shake="shake"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
        근저당권 정보가 없습니다. 위의 '근저당권 추가' 버튼을 클릭하여 추가해주세요.
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-warm-700 mb-2"> 법적 제한 사항 </label>
      <div class="flex flex-wrap gap-4">
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.가압류"
          @update:modelValue="(value) => updateLegalRestriction('가압류', value)"
          label="가압류"
        />
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.경매"
          @update:modelValue="(value) => updateLegalRestriction('경매', value)"
          label="경매"
        />
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.소송"
          @update:modelValue="(value) => updateLegalRestriction('소송', value)"
          label="소송"
        />
        <BaseCheckbox
          :modelValue="modelValue.법적제한사항?.압류"
          @update:modelValue="(value) => updateLegalRestriction('압류', value)"
          label="압류"
        />
      </div>
    </div>
  </OCRFormBox>
</template>
