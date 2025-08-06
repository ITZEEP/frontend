<template>
  <div class="space-y-6">
    <h2 class="text-lg font-bold text-center">계약 기본 정보</h2>
    <p class="text-sm text-center text-gray-500">시설 관리 및 입주 준비 상태</p>

    <!-- 실내 흡연 -->
    <ToggleRadio
      v-model="indoorSmokingPlan"
      label="실내 흡연 계획이 있으신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 중도 퇴거 가능성 -->
    <ToggleRadio
      v-model="earlyTerminationRisk"
      label="중도 퇴거 가능성이 있나요?"
      :options="[
        { label: '있음', value: true },
        { label: '없음', value: false },
      ]"
    />

    <!-- 비주거용 사용 여부 -->
    <ToggleRadio
      v-model="nonresidentialUsePlan"
      label="거주 외 목적으로 사용할 계획이 있으신가요?"
      :options="[
        { label: '사업자 등록', value: 'BUSINESS' },
        { label: '숙박', value: 'LODGING' },
        { label: '없음', value: 'NONE' },
      ]"
    />

    <!-- 거주 인원 -->
    <BaseInput
      v-model="residentCount"
      label="거주 인원"
      type="number"
      placeholder="거주 인원"
      @input="onResidentInput"
    />
    <!-- 직업 -->
    <BaseInput v-model="occupation" label="직업" placeholder="직업" />

    <!-- 비상 연락처 -->
    <div class="space-y-1">
      <BaseInput
        v-model="emergencyContact"
        label="비상 연락처"
        placeholder="예: 010-1234-5678"
        :customClass="
          showPhoneError && phoneTouched
            ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
            : ''
        "
        @input="onPhoneInput"
        @blur="onPhoneBlur"
      />
      <p v-if="showPhoneError && emergencyContact" class="text-red-500 text-sm">
        형식에 맞게 입력해주세요 (예: 010-1234-5678)
      </p>
    </div>

    <!-- 비상 연락처와의 관계 -->
    <BaseInput
      v-model="relation"
      label="비상 연락처와의 관계"
      placeholder="비상 연락처와의 관계 (예: 남편)"
    />

    <!-- 요청 사항 -->
    <BaseInput
      v-model="requestToOwner"
      label="임대인에게 추가로 요청하실 사항이 있다면 작성해 주세요."
      placeholder="임대인에게 추가로 요청하실 사항이 있다면 작성해 주세요."
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, watchEffect } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { usePreContractStore } from '@/stores/preContract'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'

// store
const store = usePreContractStore()

const route = useRoute()
const contractChatId = route.params.id

// 상태 변수
const indoorSmokingPlan = ref(null)
const earlyTerminationRisk = ref(null)
const nonresidentialUsePlan = ref('')
const residentCount = ref('')
const occupation = ref('')
const emergencyContact = ref('')
const relation = ref('')
const requestToOwner = ref('')

const onResidentInput = (e) => {
  const value = Number(e.target.value)
  residentCount.value = value < 0 ? 0 : value
}

// 전화번호 형식 상태
const phoneTouched = ref(false)
const showPhoneError = ref(false)
const phonePattern = /^010-\d{4}-\d{4}$/

// 전화번호 하이픈 자동 포맷
const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '') // 숫자만 추출
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

// 전화번호 입력 시 처리
const onPhoneInput = (e) => {
  const rawDigits = e.target.value.replace(/\D/g, '')
  const formatted = formatPhoneNumber(rawDigits)
  emergencyContact.value = formatted
  phoneTouched.value = true

  // 에러 조건 1: 3자리 미만
  if (rawDigits.length < 3) {
    showPhoneError.value = true
    return
  }

  const first = rawDigits[0]
  const second = rawDigits[1]
  const third = rawDigits[2]

  // 에러 조건 2: "010"이 아닐 경우
  if (first !== '0' || second !== '1' || third !== '0') {
    showPhoneError.value = true
    return
  }

  // 정상적으로 "010" 시작하고, 이후는 숫자만 입력된 상태
  showPhoneError.value = false
}

// 전화번호 포커스 아웃 시 처리
const onPhoneBlur = () => {
  phoneTouched.value = true
  showPhoneError.value = !phonePattern.test(emergencyContact.value)
}

// 전체 유효성 검사
watch(
  [
    indoorSmokingPlan,
    earlyTerminationRisk,
    nonresidentialUsePlan,
    residentCount,
    occupation,
    emergencyContact,
    relation,
    requestToOwner,
  ],
  ([smoking, earlyRisk, nonUse, count, occup, contact, rel, toOwner]) => {
    const allFilled =
      smoking !== null &&
      earlyRisk !== null &&
      nonUse !== '' &&
      count !== '' &&
      occup !== '' &&
      contact !== '' &&
      rel !== '' &&
      toOwner !== '' &&
      phonePattern.test(contact)

    store.setCanProceed(allFilled)
  },
)

// 조회
onMounted(async () => {
  store.canProceed = false

  try {
    const { data } = await buyerApi.selectTenantStep3(contractChatId)
    indoorSmokingPlan.value = data.indoorSmokingPlan
    earlyTerminationRisk.value = data.earlyTerminationRisk
    nonresidentialUsePlan.value = data.nonresidentialUsePlan
    residentCount.value = data.residentCount
    occupation.value = data.occupation
    emergencyContact.value = data.emergencyContact
    relation.value = data.relation
    requestToOwner.value = data.requestToOwner
  } catch (error) {
    console.error('step3 조회 실패 ❌', error)
  }
})

// 저장
const updateTenantStep3 = async () => {
  const step3DTO = {
    indoorSmokingPlan: indoorSmokingPlan.value,
    earlyTerminationRisk: earlyTerminationRisk.value,
    nonresidentialUsePlan: nonresidentialUsePlan.value,
    residentCount: residentCount.value,
    occupation: occupation.value,
    emergencyContact: emergencyContact.value,
    relation: relation.value,
    requestToOwner: requestToOwner.value,
  }

  try {
    await buyerApi.updateTenantStep3(contractChatId, step3DTO)
    alert('Step1 전세 정보가 저장되었습니다! ✅')
  } catch (error) {
    console.error('step3 전세 저장 실패 ❌', error)
  }
}
watchEffect(() => {
  store.setTriggerSubmit(5, 2, updateTenantStep3)
})
</script>
