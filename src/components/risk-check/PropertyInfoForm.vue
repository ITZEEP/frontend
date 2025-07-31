<script setup>
import { ref, computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  propertyInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:property-info'])

// 폼 데이터
const formData = ref({
  address: props.propertyInfo.address || '',
  propertyPrice: props.propertyInfo.propertyPrice || '',
  leaseType: props.propertyInfo.leaseType || '',
  residenceType: props.propertyInfo.residenceType || '',
  registeredUserName: props.propertyInfo.registeredUserName || ''
})

// 선택 옵션들
const leaseTypeOptions = [
  { value: '', label: '선택해주세요' },
  { value: 'SALE', label: '매매' },
  { value: 'JEONSE', label: '전세' },
  { value: 'WOLSE', label: '월세' }
]

const residenceTypeOptions = [
  { value: '', label: '선택해주세요' },
  { value: 'APARTMENT', label: '아파트' },
  { value: 'VILLA', label: '빌라/연립' },
  { value: 'ONEROOM', label: '원룸/오피스텔' },
  { value: 'HOUSE', label: '단독주택' },
  { value: 'COMMERCIAL', label: '상가/사무실' }
]

// 필수 필드 검증
const isValid = computed(() => {
  return formData.value.address.trim().length > 0 &&
         formData.value.leaseType.length > 0 &&
         formData.value.residenceType.length > 0
})

// 폼 데이터 변경 시 부모에게 전달
const updatePropertyInfo = () => {
  const propertyInfo = {
    ...formData.value,
    propertyPrice: formData.value.propertyPrice ? parseInt(formData.value.propertyPrice.replace(/,/g, '')) : 0
  }
  emit('update:property-info', propertyInfo)
}

// 가격 포맷팅
const formatPrice = (value) => {
  if (!value) return ''
  const numericValue = value.replace(/[^0-9]/g, '')
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const handlePriceInput = (event) => {
  const formatted = formatPrice(event.target.value)
  formData.value.propertyPrice = formatted
  updatePropertyInfo()
}

// 입력값 변경 처리
const handleInput = () => {
  updatePropertyInfo()
}

// 초기 데이터 전달
updatePropertyInfo()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">매물 정보 입력</h3>
      <p class="text-sm text-gray-600">
        등록되지 않은 매물의 기본 정보를 입력해주세요
      </p>
    </div>

    <div class="space-y-4">
      <!-- 주소 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          주소 <span class="text-red-500">*</span>
        </label>
        <BaseInput
          v-model="formData.address"
          placeholder="예: 서울특별시 강남구 테헤란로 123"
          @input="handleInput"
          class="w-full"
        />
      </div>

      <!-- 거래 유형과 주거 유형 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            거래 유형 <span class="text-red-500">*</span>
          </label>
          <BaseSelect
            v-model="formData.leaseType"
            :options="leaseTypeOptions"
            @change="handleInput"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            주거 유형 <span class="text-red-500">*</span>
          </label>
          <BaseSelect
            v-model="formData.residenceType"
            :options="residenceTypeOptions"
            @change="handleInput"
            class="w-full"
          />
        </div>
      </div>

      <!-- 매물 가격 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          매물 가격
          <span class="text-xs text-gray-500 ml-1">(선택사항)</span>
        </label>
        <div class="relative">
          <BaseInput
            :model-value="formData.propertyPrice"
            placeholder="예: 50000"
            @input="handlePriceInput"
            class="w-full pr-12"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <span class="text-sm text-gray-500">만원</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          전세/월세의 경우 보증금을 입력해주세요
        </p>
      </div>

      <!-- 소유자명 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          소유자명
          <span class="text-xs text-gray-500 ml-1">(선택사항)</span>
        </label>
        <BaseInput
          v-model="formData.registeredUserName"
          placeholder="예: 홍길동"
          @input="handleInput"
          class="w-full"
        />
        <p class="mt-1 text-xs text-gray-500">
          등기부등본의 소유자명과 일치하는지 확인하기 위해 사용됩니다
        </p>
      </div>
    </div>

    <!-- 입력 완료 상태 표시 -->
    <div class="mt-6 p-3 rounded-lg" :class="isValid ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div v-if="isValid" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div v-else class="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium" :class="isValid ? 'text-green-800' : 'text-amber-800'">
            {{ isValid ? '입력 완료' : '필수 정보 입력 필요' }}
          </p>
          <p class="text-xs" :class="isValid ? 'text-green-600' : 'text-amber-600'">
            {{ isValid ? '매물 정보가 모두 입력되었습니다' : '주소, 거래유형, 주거유형은 필수 입력 항목입니다' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 추가 스타일이 필요한 경우 여기에 작성 */
</style>