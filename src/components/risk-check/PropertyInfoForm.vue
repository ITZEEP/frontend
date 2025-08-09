<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'

const props = defineProps({
  propertyInfo: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:property-info'])

// Constants
const LEASE_TYPE = {
  JEONSE: 'JEONSE',
  WOLSE: 'WOLSE',
}

const BILLION_TO_WON = 100000000
const MANWON_TO_WON = 10000
const MAX_MANWON = 9999

const leaseTypeOptions = [
  { value: '', label: '선택해주세요' },
  { value: LEASE_TYPE.JEONSE, label: '전세' },
  { value: LEASE_TYPE.WOLSE, label: '월세' },
]

const residenceTypeOptions = [
  { value: '', label: '선택해주세요' },
  { value: 'OPEN_ONE_ROOM', label: '개방형 원룸' },
  { value: 'SEPARATED_ONE_ROOM', label: '분리형 원룸' },
  { value: 'TWO_ROOM', label: '투룸' },
  { value: 'OFFICETEL', label: '오피스텔' },
  { value: 'APARTMENT', label: '아파트' },
  { value: 'HOUSE', label: '주택' },
]

// State
const formData = ref({
  address: props.propertyInfo.address || '',
  propertyPrice: props.propertyInfo.propertyPrice || '',
  propertyPriceBillion: props.propertyInfo.propertyPriceBillion || '',
  propertyPriceManwon: props.propertyInfo.propertyPriceManwon || '',
  monthlyRent: props.propertyInfo.monthlyRent || '',
  leaseType: props.propertyInfo.leaseType || '',
  residenceType: props.propertyInfo.residenceType || '',
  registeredUserName: props.propertyInfo.registeredUserName || '',
})

// Computed
const isJeonse = computed(() => formData.value.leaseType === LEASE_TYPE.JEONSE)
const isWolse = computed(() => formData.value.leaseType === LEASE_TYPE.WOLSE)

const hasRequiredFields = computed(() => {
  return formData.value.address.trim() &&
    formData.value.leaseType &&
    formData.value.residenceType &&
    formData.value.registeredUserName.trim()
})

const hasRequiredPrice = computed(() => {
  if (isJeonse.value) {
    return formData.value.propertyPriceBillion || formData.value.propertyPriceManwon
  }
  if (isWolse.value) {
    return formData.value.propertyPrice && formData.value.monthlyRent
  }
  return true
})

const isValid = computed(() => hasRequiredFields.value && hasRequiredPrice.value)

// Utility Functions
const formatPrice = (value) => {
  if (!value) return ''
  const numericValue = String(value).replace(/[^0-9]/g, '')
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const parseFormattedNumber = (value) => {
  return parseInt(String(value).replace(/,/g, '') || 0)
}

const calculateJeonsePrice = () => {
  const billion = parseInt(formData.value.propertyPriceBillion || 0) * BILLION_TO_WON
  const manwon = parseInt(formData.value.propertyPriceManwon || 0) * MANWON_TO_WON
  return billion + manwon
}

const updatePropertyInfo = () => {
  const propertyInfo = {
    ...formData.value,
    propertyPrice: isJeonse.value
      ? calculateJeonsePrice()
      : parseFormattedNumber(formData.value.propertyPrice) * MANWON_TO_WON,
    monthlyRent: parseFormattedNumber(formData.value.monthlyRent) * MANWON_TO_WON,
  }
  emit('update:property-info', propertyInfo)
}

// Event Handlers
const handleFormattedInput = (field) => (event) => {
  formData.value[field] = formatPrice(event.target.value)
  updatePropertyInfo()
}

const handleManwonInput = () => {
  const value = parseInt(formData.value.propertyPriceManwon || 0)
  if (value > MAX_MANWON) {
    formData.value.propertyPriceManwon = String(MAX_MANWON)
  } else if (value < 0) {
    formData.value.propertyPriceManwon = '0'
  }
  updatePropertyInfo()
}

// Watch for lease type changes to clear irrelevant price fields
watch(() => formData.value.leaseType, (newType, oldType) => {
  if (oldType && newType !== oldType) {
    if (newType === LEASE_TYPE.JEONSE) {
      formData.value.propertyPrice = ''
      formData.value.monthlyRent = ''
    } else if (newType === LEASE_TYPE.WOLSE) {
      formData.value.propertyPriceBillion = ''
      formData.value.propertyPriceManwon = ''
    }
  }
  updatePropertyInfo()
})

// Initialize
updatePropertyInfo()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">매물 정보 입력</h3>
      <p class="text-sm text-gray-600">등록되지 않은 매물의 기본 정보를 입력해주세요</p>
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
          @input="updatePropertyInfo"
          class="w-full"
        />
      </div>

      <!-- 거래 유형과 주거 유형 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            거래 유형 <span class="text-red-500">*</span>
          </label>
          <CustomSelect
            v-model="formData.leaseType"
            :options="leaseTypeOptions"
            @change="updatePropertyInfo"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            주거 유형 <span class="text-red-500">*</span>
          </label>
          <CustomSelect
            v-model="formData.residenceType"
            :options="residenceTypeOptions"
            @change="updatePropertyInfo"
            class="w-full"
          />
        </div>
      </div>

      <!-- 전세금 (전세 선택 시) -->
      <div v-if="isJeonse">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          전세금 <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <div class="relative">
            <BaseInput
              v-model="formData.propertyPriceBillion"
              type="number"
              placeholder="0"
              @input="updatePropertyInfo"
              class="w-full pr-8"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-sm text-gray-500">억</span>
            </div>
          </div>
          <div class="relative">
            <BaseInput
              v-model="formData.propertyPriceManwon"
              type="number"
              placeholder="0"
              :max="MAX_MANWON"
              @input="handleManwonInput"
              class="w-full pr-12"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-sm text-gray-500">만원</span>
            </div>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">예: 3억 5000만원 → 3억, 5000만원</p>
      </div>

      <!-- 보증금과 월세 (월세 선택 시) -->
      <div v-if="isWolse" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            보증금 <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <BaseInput
              :model-value="formData.propertyPrice"
              placeholder="예: 5000"
              @input="handleFormattedInput('propertyPrice')"
              class="w-full pr-12"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-sm text-gray-500">만원</span>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            월세 <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <BaseInput
              :model-value="formData.monthlyRent"
              placeholder="예: 50"
              @input="handleFormattedInput('monthlyRent')"
              class="w-full pr-12"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-sm text-gray-500">만원</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 소유자명 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          소유자명 <span class="text-red-500">*</span>
        </label>
        <BaseInput
          v-model="formData.registeredUserName"
          placeholder="예: 홍길동"
          @input="updatePropertyInfo"
          class="w-full"
        />
        <p class="mt-1 text-xs text-gray-500">
          등기부등본의 소유자명과 일치하는지 확인하기 위해 사용됩니다
        </p>
      </div>
    </div>

    <!-- 입력 완료 상태 표시 -->
    <div
      class="mt-6 p-3 rounded-lg"
      :class="
        isValid ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'
      "
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div
            v-if="isValid"
            class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div v-else class="w-5 h-5 bg-yellow-primary rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium" :class="isValid ? 'text-green-800' : 'text-gray-warm-700'">
            {{ isValid ? '입력 완료' : '필수 정보 입력 필요' }}
          </p>
          <p class="text-xs" :class="isValid ? 'text-green-600' : 'text-gray-warm-500'">
            {{
              isValid
                ? '매물 정보가 모두 입력되었습니다'
                : '주소, 거래유형, 주거유형은 필수 입력 항목입니다'
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

