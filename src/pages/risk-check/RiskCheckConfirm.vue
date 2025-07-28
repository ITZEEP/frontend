<script setup>
import { reactive, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import PropertyRegistrationForm from '@/components/risk-check/confirm/PropertyRegistrationForm.vue'
import BuildingRegistryForm from '@/components/risk-check/confirm/BuildingRegistryForm.vue'
import { fraudApi } from '@/api/fraud'
import { useFraudStore } from '@/stores/fraud'

const router = useRouter()
const route = useRoute()
const fraudStore = useFraudStore()

// Store에서 분석 데이터 가져오기
const analysisData = fraudStore.getDocumentAnalysisData()

// 데이터가 없으면 메인 페이지로 리다이렉트
if (!analysisData) {
  router.push('/risk-check')
}

const isAnalyzing = ref(false)
const errors = ref({})
const shake = ref(false)
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

  return isValid
}

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

// Store에서 가져온 데이터 기반으로 초기값 설정
const ocrData = reactive({
  등기부등본: {
    지역관련주소: analysisData?.registryDocument?.regionAddress || '',
    도로명주소: analysisData?.registryDocument?.roadAddress || '',
    소유자이름: analysisData?.registryDocument?.ownerName || '',
    소유자생년월일: analysisData?.registryDocument?.ownerBirthDate || '1980-01-01',
    채권최고액: analysisData?.registryDocument?.maxClaimAmount || '',
    채무자: analysisData?.registryDocument?.debtor || '',
    근저당권자: analysisData?.registryDocument?.mortgagee || '',
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
  // API 호출에 필요한 추가 정보
  homeId: analysisData?.homeId || 1,
  registryFileUrl: analysisData?.registryFileUrl || '',
  buildingFileUrl: analysisData?.buildingFileUrl || ''
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
    // 분석 요청 데이터 준비
    const analysisData = {
      homeId: ocrData.homeId,
      registryDocument: {
        regionAddress: ocrData.등기부등본.지역관련주소,
        roadAddress: ocrData.등기부등본.도로명주소,
        ownerName: ocrData.등기부등본.소유자이름,
        ownerBirthDate: ocrData.등기부등본.소유자생년월일,
        maxClaimAmount: ocrData.등기부등본.채권최고액,
        debtor: ocrData.등기부등본.채무자,
        mortgagee: ocrData.등기부등본.근저당권자,
        hasSeizure: ocrData.등기부등본.법적제한사항.가압류,
        hasAuction: ocrData.등기부등본.법적제한사항.경매,
        hasLitigation: ocrData.등기부등본.법적제한사항.소송,
        hasAttachment: ocrData.등기부등본.법적제한사항.압류
      },
      buildingDocument: {
        siteLocation: ocrData.건축물대장.대지위치,
        roadAddress: ocrData.건축물대장.도로명주소,
        totalFloorArea: parseFloat(ocrData.건축물대장.연면적) || 0,
        purpose: ocrData.건축물대장.용도,
        floorNumber: parseInt(ocrData.건축물대장.층수) || 1,
        approvalDate: ocrData.건축물대장.사용승인일,
        isViolationBuilding: ocrData.건축물대장.위반건축물여부
      },
      registryFileUrl: ocrData.registryFileUrl,
      buildingFileUrl: ocrData.buildingFileUrl
    }

    // API 호출
    const response = await fraudApi.analyzeRisk(analysisData)
    console.log('분석 API 응답:', response) // 디버깅용
    
    if (response.success && response.data) {
      console.log('결과 페이지로 이동:', `/risk-check/result/${response.data.riskCheckId}`) // 디버깅용
      // 성공 시 Store 데이터 삭제 (보안을 위해)
      fraudStore.clearDocumentAnalysisData()
      // 결과 페이지로 이동 (riskCheckId를 URL 파라미터로 전달)
      router.push(`/risk-check/result/${response.data.riskCheckId}`)
    } else {
      throw new Error(response.message || '분석에 실패했습니다')
    }
  } catch (error) {
    console.error('분석 중 오류:', error)
    console.error('에러 응답:', error.response) // 디버깅용
    // 사용자에게 오류 메시지 표시
    if (error.response?.data?.message) {
      alert(`분석 중 오류가 발생했습니다: ${error.response.data.message}`)
    } else {
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  } finally {
    isAnalyzing.value = false
  }
}

onMounted(() => {
  document.body.style.backgroundColor = '#F7F7F8'
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
  // 민감한 데이터 보호를 위해 Store에서 데이터 삭제
  fraudStore.clearDocumentAnalysisData()
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
