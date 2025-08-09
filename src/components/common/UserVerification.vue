<template>
  <div class="flex flex-col gap-4 items-center justify-center px-24 py-4">
    <!-- 헤더 -->
    <div class="flex flex-col gap-2 items-center justify-center">
      <h1 class="text-gray-warm-700 font-bold text-xl">본인 인증</h1>
      <p class="text-gray-500">계약을 위해 본인 인증이 필요합니다.</p>
    </div>

    <!-- 폼 -->
    <div class="w-full flex flex-col gap-3">
      <BaseInput v-model="username" label="이름" placeholder="이름을 입력하세요" />

      <!-- 주소: pre-start / pre-end -->
      <div class="w-full" v-if="isPreMode">
        <label class="block mb-1 text-sm font-medium text-gray-600"> 주소 </label>
        <div class="w-full flex gap-2">
          <input
            class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
            type="text"
            :value="address"
            placeholder="주소 검색"
            disabled
          />
          <BaseButton
            class="w-40 flex justify-center items-center"
            @click="modalStore.open()"
            variant="primary"
          >
            <SearchIcon class="mt-1" />
            <span class="ml-2">주소 검색</span>
          </BaseButton>

          <Modal :closable="true" :maskCloseable="true">
            <SearchAddress @select="setAddress" />
          </Modal>
        </div>
      </div>

      <BaseInput
        v-if="isPreMode"
        v-model="detailAddress"
        label="상세 주소"
        placeholder="상세 주소를 입력하세요"
      />

      <div class="w-full flex gap-2">
        <BaseInput
          v-model="ssnFront"
          label="주민번호 앞자리"
          placeholder="앞 6자리"
          id="ssnFront"
          :inputClass="'[appearance:textfield]'"
          @input="onFrontInput"
        />

        <!-- 주민번호 뒷자리: 표시값은 마스킹, 입력은 keydown/paste로만 처리 -->
        <div class="w-full flex flex-col">
          <label for="ssnBack" class="block mb-1 text-sm font-medium text-gray-600"
            >주민번호 뒷자리</label
          >
          <input
            id="ssnBack"
            class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
            :value="ssnBackDisplay"
            placeholder="뒤 7자리"
            inputmode="numeric"
            autocomplete="off"
            @keydown="onSsnBackKeydown"
            @paste.prevent="onSsnBackPaste"
          />
        </div>
      </div>

      <!-- 발급일자: 공통 (input=YYYY-MM-DD) -->
      <BaseInput v-model="issueDate" label="주민등록증 발급일자" type="date" />

      <!-- 전화번호: pre-* -->
      <BaseInput
        v-if="isPreMode"
        v-model="phone"
        label="전화번호"
        placeholder="010-1234-5678"
        id="phone"
        type="tel"
        @input="onPhoneInput"
      />

      <!-- 생년월일: home -->
      <BaseInput
        v-if="mode === 'home'"
        v-model="birthDate"
        label="생년월일"
        type="date"
        placeholder="YYYY-MM-DD"
      />

      <BaseButton
        variant="primary"
        size="lg"
        class="mt-2"
        :disabled="!isFormValid"
        @click="handleVerify"
      >
        인증하기
      </BaseButton>

      <LoadingOverlay
        :loading="isLoading"
        message="인증 중입니다"
        subMessage="잠시만 기다려주세요"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SearchIcon from '@/assets/icons/SearchIcon.vue'
import { useModalStore } from '@/stores/modal'
import Modal from '@/components/common/BaseModal.vue'
import SearchAddress from '@/components/common/SearchAddress.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { usePreContractStore } from '@/stores/preContract'
import { VerificationAPI } from '@/apis/verification'

const props = defineProps({
  // 'home' | 'pre-start' | 'pre-end'
  mode: { type: String, required: true },
  homeId: { type: [Number, String], default: null },
  contractChatId: { type: [Number, String], default: null },
})

const emit = defineEmits(['verified', 'error'])

const modalStore = useModalStore()
const store = usePreContractStore()

// 폼 상태
const username = ref('')
const address = ref('')
const detailAddress = ref('')

// 주민번호 앞/뒤
const ssnFront = ref('') // 앞 6자리 (원본)
const ssnBackRaw = ref('') // 뒷 7자리 원본(숫자만) - API 전송용
const ssnBackDisplay = computed(() => {
  const raw = ssnBackRaw.value
  if (!raw) return ''
  return raw[0] + '*'.repeat(Math.max(0, raw.length - 1))
})

const issueDate = ref('') // <input type="date"> => 'YYYY-MM-DD'
const phone = ref('')
const birthDate = ref('') // home 전용

const setAddress = (newAddress) => {
  address.value = newAddress
}

// 숫자 필터
function filterNumber(val, maxLength) {
  return val.replace(/\D/g, '').slice(0, maxLength)
}

function onFrontInput(e) {
  ssnFront.value = filterNumber(e.target.value, 6)
}

// 주민번호 뒷자리: keydown/paste 기반 입력 제어
function onSsnBackKeydown(e) {
  const key = e.key

  // 숫자 입력
  if (/^\d$/.test(key)) {
    if (ssnBackRaw.value.length >= 7) {
      e.preventDefault()
      return
    }
    ssnBackRaw.value += key
    e.preventDefault() // 기본 입력 막고 표시값은 computed로 반영
    return
  }

  // 백스페이스
  if (key === 'Backspace') {
    if (ssnBackRaw.value.length > 0) {
      ssnBackRaw.value = ssnBackRaw.value.slice(0, -1)
    }
    e.preventDefault()
    return
  }

  // Delete, 화살표, Tab, Home, End 허용
  const navKeys = [
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
    'Home',
    'End',
  ]
  if (navKeys.includes(key)) return

  // 그 외(문자/기호 등) 차단
  e.preventDefault()
}

function onSsnBackPaste(e) {
  const clip = (e.clipboardData || window.clipboardData)?.getData('text') || ''
  const digits = clip.replace(/\D/g, '')
  if (!digits) return
  const remain = 7 - ssnBackRaw.value.length
  if (remain <= 0) return
  ssnBackRaw.value += digits.slice(0, remain)
}

// 전화번호 포맷
function onPhoneInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  let formatted = ''
  if (raw.length <= 3) formatted = raw
  else if (raw.length <= 7) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`
  else formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`
  phone.value = formatted
}

const isPreMode = computed(() => props.mode === 'pre-start' || props.mode === 'pre-end')

// 검증: 원본(ssnBackRaw) 기준 체크
const isFormValid = computed(() => {
  const baseOk =
    username.value.trim() &&
    ssnFront.value.length === 6 &&
    ssnBackRaw.value.length === 7 &&
    issueDate.value
  if (props.mode === 'home') {
    return baseOk && !!birthDate.value
  }
  return baseOk && address.value.trim() && detailAddress.value.trim() && phone.value.trim()
})

const isLoading = ref(false)

// util: 'YYYY-MM-DD' -> 'YYYYMMDD'
const yyyymmdd = (d) => (d || '').replaceAll('-', '')

const handleVerify = async () => {
  try {
    isLoading.value = true

    if (props.mode === 'home') {
      // 매물 등록 (issuedDate: number, ssn 숫자)
      const body = {
        birthDate: birthDate.value, // '1990-01-01'
        issuedDate: Number(yyyymmdd(issueDate.value)), // 20250508
        name: username.value,
        ssnBack: Number(ssnBackRaw.value), // 원본 숫자 7자리
        ssnFront: Number(ssnFront.value), // 원본 숫자 6자리
      }
      const res = await VerificationAPI.verificationHome(props.homeId, body)
      store.setCanProceed(true)
      emit('verified', { mode: props.mode, res })
      return
    }

    // 사전조사 (issuedDate: string, ssn 문자열)
    const base = {
      addr1: address.value,
      addr2: detailAddress.value,
      issuedDate: yyyymmdd(issueDate.value), // '20250508'
      name: username.value,
      phoneNumber: phone.value.replaceAll('-', ''), // '01012345678'
      ssnBack: ssnBackRaw.value, // 원본 문자열 7자리
      ssnFront: ssnFront.value, // 원본 문자열 6자리
    }

    let res
    if (props.mode === 'pre-start') {
      res = await VerificationAPI.verificationPreContractStart(props.contractChatId, base)
    } else if (props.mode === 'pre-end') {
      res = await VerificationAPI.verificationPreContractEnd(props.contractChatId, base)
    } else {
      throw new Error(`지원하지 않는 mode: ${props.mode}`)
    }

    store.setCanProceed(true)
    emit('verified', { mode: props.mode, res })
  } catch (error) {
    console.error('본인 인증 실패:', error)
    store.setCanProceed(false)
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  store.canProceed = false
})
</script>

<style scoped></style>
