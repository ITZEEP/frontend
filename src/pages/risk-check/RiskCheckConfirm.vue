<script setup>
import { reactive, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Components
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import PropertyRegistrationForm from '@/components/risk-check/confirm/PropertyRegistrationForm.vue'
import BuildingRegistryForm from '@/components/risk-check/confirm/BuildingRegistryForm.vue'
import ErrorModal from '@/components/common/ErrorModal.vue'

// Stores & APIs
import { fraudApi } from '@/apis/fraud'
import { useFraudStore } from '@/stores/fraud'
import { useModalStore } from '@/stores/modal'

// Composables
const router = useRouter()
const fraudStore = useFraudStore()
const modalStore = useModalStore()

// Data from store
const analysisData = fraudStore.getDocumentAnalysisData()
const propertyInfo = fraudStore.getPropertyInfo()

// Redirect if no data
if (!analysisData) {
  router.push('/risk-check')
}

// Check if external property
const isExternalProperty = !analysisData?.homeId && propertyInfo

// State
const isAnalyzing = ref(false)
const errors = ref({})
const shake = ref(false)

// Error modal state
const showErrorModal = ref(false)
const errorTitle = ref('오류 발생')
const errorMessage = ref('')
const errorType = ref('unknown_error')

// Validation rules
const OCR_VALIDATION_RULES = {
  등기부등본: {
    도로명주소: {
      required: true,
      message: '도로명 주소를 입력해주세요',
    },
    소유자이름: {
      required: true,
      message: '소유자 이름을 입력해주세요',
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
      },
    },
  },
  건축물대장: {
    대지위치: {
      required: true,
      message: '대지 위치를 입력해주세요',
    },
    도로명주소: {
      required: true,
      message: '도로명 주소를 입력해주세요',
    },
    연면적: {
      required: true,
      message: '연면적을 입력해주세요',
      validate: (value) => {
        if (isNaN(value) || parseFloat(value) <= 0) {
          return '올바른 숫자를 입력해주세요'
        }
        return true
      },
    },
    용도: {
      required: true,
      message: '용도를 입력해주세요',
    },
    층수: {
      required: true,
      message: '층수를 입력해주세요',
      validate: (value) => {
        if (isNaN(value) || parseInt(value) <= 0) {
          return '올바른 층수를 입력해주세요'
        }
        return true
      },
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
      },
    },
  },
}

// OCR data initialization
const ocrData = reactive({
  등기부등본: {
    지역관련주소: analysisData?.registryDocument?.regionAddress || '',
    도로명주소: analysisData?.registryDocument?.roadAddress || '',
    소유자이름: analysisData?.registryDocument?.ownerName || '',
    소유자생년월일: analysisData?.registryDocument?.ownerBirthDate || '1980-01-01',
    근저당권목록:
      analysisData?.registryDocument?.mortgageeList?.map((item) => ({
        순위: item.priorityNumber,
        채권최고액: item.maxClaimAmount,
        채무자: item.debtor,
        근저당권자: item.mortgagee,
      })) || [],
    법적제한사항: {
      가압류: analysisData?.registryDocument?.hasSeizure || false,
      경매: analysisData?.registryDocument?.hasAuction || false,
      소송: analysisData?.registryDocument?.hasLitigation || false,
      압류: analysisData?.registryDocument?.hasAttachment || false,
    },
  },
  건축물대장: {
    대지위치: analysisData?.buildingDocument?.siteLocation || '',
    도로명주소: analysisData?.buildingDocument?.roadAddress || '',
    연면적: analysisData?.buildingDocument?.totalFloorArea || '',
    용도: analysisData?.buildingDocument?.purpose || '',
    층수: analysisData?.buildingDocument?.floorNumber || '1',
    사용승인일: analysisData?.buildingDocument?.approvalDate || '2020-01-01',
    위반건축물여부: analysisData?.buildingDocument?.isViolationBuilding || false,
  },
  homeId: analysisData?.homeId || 1,
  registryFileUrl: analysisData?.registryFileUrl || '',
  buildingFileUrl: analysisData?.buildingFileUrl || '',
})

// Lifecycle
onMounted(() => {
  document.body.classList.add('bg-gray-100')
})

onUnmounted(() => {
  document.body.classList.remove('bg-gray-100')
  // 외부 매물인 경우 결과 페이지에서 데이터를 사용해야 하므로 clearAllData를 호출하지 않음
  if (!isExternalProperty) {
    fraudStore.clearAllData()
  }
})

// Validation function
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

    if (Object.keys(errors.value[section]).length === 0) {
      delete errors.value[section]
    }
  })

  // Validate mortgage list
  if (data.등기부등본?.근저당권목록?.length > 0) {
    data.등기부등본.근저당권목록.forEach((item, index) => {
      if (!item.채권최고액 || item.채권최고액.toString().trim() === '') {
        errors.value[`근저당권목록_${index}_채권최고액`] = '채권최고액을 입력해주세요'
        isValid = false
      }
      if (!item.근저당권자 || item.근저당권자.trim() === '') {
        errors.value[`근저당권목록_${index}_근저당권자`] = '근저당권자를 입력해주세요'
        isValid = false
      }
    })
  }

  return isValid
}

// UI feedback functions
const triggerShake = () => {
  shake.value = true
  setTimeout(() => {
    shake.value = false
  }, 500)
}

const focusFirstError = () => {
  nextTick(() => {
    const firstErrorElement = document.querySelector('.border-red-500')
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstErrorElement.focus()
    }
  })
}

// Build analysis request data
const buildExternalAnalysisData = () => ({
  address: propertyInfo.address,
  leaseType: propertyInfo.leaseType,
  propertyPrice: propertyInfo.propertyPrice || 0,
  monthlyRent: propertyInfo.monthlyRent || 0,
  residenceType: propertyInfo.residenceType || '',
  registeredUserName: propertyInfo.registeredUserName || ocrData.등기부등본.소유자이름,
  registryDocument: {
    regionAddress: ocrData.등기부등본.지역관련주소,
    roadAddress: ocrData.등기부등본.도로명주소,
    ownerName: ocrData.등기부등본.소유자이름,
    ownerBirthDate: ocrData.등기부등본.소유자생년월일,
    mortgageeList: ocrData.등기부등본.근저당권목록.map((item) => ({
      priorityNumber: item.순위,
      maxClaimAmount: item.채권최고액,
      debtor: item.채무자,
      mortgagee: item.근저당권자,
    })),
    hasSeizure: ocrData.등기부등본.법적제한사항.가압류,
    hasAuction: ocrData.등기부등본.법적제한사항.경매,
    hasLitigation: ocrData.등기부등본.법적제한사항.소송,
    hasAttachment: ocrData.등기부등본.법적제한사항.압류,
    debtor: ocrData.등기부등본.소유자이름,
  },
  buildingDocument: {
    siteLocation: ocrData.건축물대장.대지위치,
    roadAddress: ocrData.건축물대장.도로명주소,
    totalFloorArea: parseFloat(ocrData.건축물대장.연면적) || 0,
    purpose: ocrData.건축물대장.용도,
    floorNumber: parseInt(ocrData.건축물대장.층수) || 1,
    approvalDate: ocrData.건축물대장.사용승인일,
    isViolationBuilding: ocrData.건축물대장.위반건축물여부,
  },
  buildingFileUrl: ocrData.buildingFileUrl,
})

const buildInternalAnalysisData = () => ({
  homeId: ocrData.homeId,
  registryDocument: {
    regionAddress: ocrData.등기부등본.지역관련주소,
    roadAddress: ocrData.등기부등본.도로명주소,
    ownerName: ocrData.등기부등본.소유자이름,
    ownerBirthDate: ocrData.등기부등본.소유자생년월일,
    mortgageeList: ocrData.등기부등본.근저당권목록.map((item) => ({
      priorityNumber: item.순위,
      maxClaimAmount: item.채권최고액,
      debtor: item.채무자,
      mortgagee: item.근저당권자,
    })),
    hasSeizure: ocrData.등기부등본.법적제한사항.가압류,
    hasAuction: ocrData.등기부등본.법적제한사항.경매,
    hasLitigation: ocrData.등기부등본.법적제한사항.소송,
    hasAttachment: ocrData.등기부등본.법적제한사항.압류,
  },
  buildingDocument: {
    siteLocation: ocrData.건축물대장.대지위치,
    roadAddress: ocrData.건축물대장.도로명주소,
    totalFloorArea: parseFloat(ocrData.건축물대장.연면적) || 0,
    purpose: ocrData.건축물대장.용도,
    floorNumber: parseInt(ocrData.건축물대장.층수) || 1,
    approvalDate: ocrData.건축물대장.사용승인일,
    isViolationBuilding: ocrData.건축물대장.위반건축물여부,
  },
  registryFileUrl: ocrData.registryFileUrl,
  buildingFileUrl: ocrData.buildingFileUrl,
})

// Main analysis function
const proceedAnalysis = async () => {
  if (!validate(ocrData)) {
    triggerShake()
    focusFirstError()
    return
  }

  isAnalyzing.value = true

  try {
    let response

    if (isExternalProperty) {
      response = await fraudApi.analyzeExternal(buildExternalAnalysisData())
    } else {
      response = await fraudApi.analyzeRisk(buildInternalAnalysisData())
    }

    console.log('분석 응답:', response)
    
    if (response && response.success) {
      if (isExternalProperty) {
        console.log('외부 매물 분석 결과 저장:', response.data)
        fraudStore.setExternalAnalysisResult(response.data)
        router.push('/risk-check/result/external')
      } else {
        fraudStore.clearAllData()
        router.push(`/risk-check/result/${response.data.riskCheckId}`)
      }
    } else {
      throw new Error(response?.message || '분석에 실패했습니다')
    }
  } catch (error) {
    console.error('분석 중 오류:', error)

    if (error.response?.data?.message) {
      errorTitle.value = '분석 실패'
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorTitle.value = '분석 오류'
      errorMessage.value = error.message
    } else {
      errorTitle.value = '분석 오류'
      errorMessage.value = '분석 중 오류가 발생했습니다. 다시 시도해주세요.'
    }

    showErrorModal.value = true
    modalStore.open()
  } finally {
    isAnalyzing.value = false
  }
}

// Navigation
const goBack = () => {
  router.back()
}

// Error modal handler
const closeErrorModal = () => {
  showErrorModal.value = false
  modalStore.close()
}
</script>

<template>
  <div>
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
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

      <!-- Warning message for external property -->
      <div
        v-if="isExternalProperty"
        class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">미등록 매물 분석</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>현재 분석 중인 매물은 서비스에 등록되지 않은 외부 매물입니다.</p>
              <p class="mt-1">
                분석 결과는 확인만 가능하며, <span class="font-semibold">저장되지 않습니다.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- OCR Forms -->
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

    <!-- Loading Overlay -->
    <LoadingOverlay
      :loading="isAnalyzing"
      message="AI 위험도 분석 중..."
      subMessage="잠시만 기다려주세요"
    />
  </div>

  <!-- Error Modal -->
  <ErrorModal
    :is-open="showErrorModal"
    :title="errorTitle"
    :message="errorMessage"
    :error-type="errorType"
    @close="closeErrorModal"
  />
</template>
