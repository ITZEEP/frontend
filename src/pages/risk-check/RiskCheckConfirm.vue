<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import PropertyRegistrationForm from '@/components/risk-check/confirm/PropertyRegistrationForm.vue'
import BuildingRegistryForm from '@/components/risk-check/confirm/BuildingRegistryForm.vue'
const router = useRouter()

// Analysis state
const isAnalyzing = ref(false)

// Form validation state
const errors = ref({})
const shake = ref(false)

// Validation rules
const OCR_VALIDATION_RULES = {
  등기부등본: {
    도로명주소: {
      required: true,
      message: '도로명 주소를 입력해주세요'
    },
    소유자이름: {
      required: true,
      message: '소유자 이름을 입력해주세요'
    },
    소유자생년월일: {
      required: true,
      message: '소유자 생년월일을 입력해주세요',
      validate: (value) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(value)) {
          return '올바른 날짜 형식으로 입력해주세요 (예: 1980-01-01)'
        }
        return true
      }
    }
  },
  건축물대장: {
    대지위치: {
      required: true,
      message: '대지 위치를 입력해주세요'
    },
    도로명주소: {
      required: true,
      message: '도로명 주소를 입력해주세요'
    },
    연면적: {
      required: true,
      message: '연면적을 입력해주세요',
      validate: (value) => {
        if (isNaN(value) || parseFloat(value) <= 0) {
          return '올바른 숫자를 입력해주세요'
        }
        return true
      }
    },
    용도: {
      required: true,
      message: '용도를 입력해주세요'
    },
    층수: {
      required: true,
      message: '층수를 입력해주세요',
      validate: (value) => {
        if (isNaN(value) || parseInt(value) <= 0) {
          return '올바른 층수를 입력해주세요'
        }
        return true
      }
    },
    사용승인일: {
      required: true,
      message: '사용승인일을 입력해주세요',
      validate: (value) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(value)) {
          return '올바른 날짜 형식으로 입력해주세요 (예: 2020-03-15)'
        }
        return true
      }
    }
  }
}

// Validation functions
const validate = (data) => {
  errors.value = {}
  let isValid = true

  Object.entries(OCR_VALIDATION_RULES).forEach(([section, rules]) => {
    errors.value[section] = {}
    
    Object.entries(rules).forEach(([field, config]) => {
      const value = data[section]?.[field]
      const isEmpty = !value || value.toString().trim() === ''
      
      if (config.required && isEmpty) {
        errors.value[section][field] = config.message || `${field}을(를) 입력해주세요`
        isValid = false
      } else if (config.validate && !isEmpty) {
        const validationResult = config.validate(value, data[section])
        if (validationResult !== true) {
          errors.value[section][field] = validationResult
          isValid = false
        }
      }
    })
    
    // Clean up empty error objects
    if (Object.keys(errors.value[section]).length === 0) {
      delete errors.value[section]
    }
  })

  return isValid
}

const triggerShake = () => {
  shake.value = true
  setTimeout(() => {
    shake.value = false
  }, 500)
}

const focusFirstError = () => {
  setTimeout(() => {
    const firstErrorElement = document.querySelector('.border-red-500')
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstErrorElement.focus()
    }
  }, 100)
}

// OCR 데이터 (실제로는 이전 페이지에서 전달받거나 API로 받아야 함)
const ocrData = reactive({
  등기부등본: {
    지역관련주소: '',
    도로명주소: '서울시 강남구 역삼동 111-22',
    소유자이름: '홍길동',
    소유자생년월일: '1980-01-01',
    채권최고액: '500,000,000',
    채무자: '홍길동',
    근저당권자: 'KB국민은행',
    법적제한사항: {
      가압류: false,
      경매: false,
      소송: false,
      압류: false,
    },
  },
  건축물대장: {
    대지위치: '서울시 강남구 역삼동 111-22',
    도로명주소: '서울시 강남구 역삼로 123',
    연면적: '150.50',
    용도: '오피스텔',
    층수: '15',
    사용승인일: '2020-03-15',
    위반건축물여부: false,
  },
})

// 이전 페이지로
const goBack = () => {
  router.back()
}

// 분석 진행
const proceedAnalysis = async () => {
  if (!validate(ocrData)) {
    triggerShake()
    focusFirstError()
    return
  }

  isAnalyzing.value = true
  try {
    // 실제 API 호출 시뮬레이션
    // const response = await analyzeRiskAPI(ocrData)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 결과 페이지로 이동
    router.push('/risk-check/result')
  } catch (error) {
    console.error('분석 중 오류:', error)
  } finally {
    isAnalyzing.value = false
  }
}

onMounted(() => {
  // 실제로는 이전 페이지에서 전달받은 데이터나 vuex/pinia store에서 가져와야 함
  // 현재는 더미 데이터 사용
  document.body.style.backgroundColor = '#F7F7F8'
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-gray-600 hover:text-gray-800">
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-warm-700">정보 확인</h1>
        </div>
        <BaseButton 
          @click="proceedAnalysis" 
          variant="primary"
          :disabled="isAnalyzing"
          class="w-full sm:w-auto"
        >
          <IconCheck class="w-3.5 h-3.5 mr-2" />
          내용 확인 완료
        </BaseButton>
      </div>

      <!-- 로딩 오버레이 -->
      <LoadingOverlay
        :loading="isAnalyzing"
        message="AI 위험도 분석 중..."
        subMessage="잠시만 기다려주세요"
      />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <PropertyRegistrationForm 
          v-model="ocrData.등기부등본" 
          :errors="errors.등기부등본"
          :shake="shake"
        />
        <BuildingRegistryForm 
          v-model="ocrData.건축물대장" 
          :errors="errors.건축물대장"
          :shake="shake"
        />
      </div>
    </div>
  </div>
</template>

