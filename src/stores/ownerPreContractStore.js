import { defineStore } from 'pinia'

export const usePreContractStore = defineStore('ownerPreContract', {
  state: () => ({
    // '전세' or '월세'
    rent_type: '',

    // 1단계: 매물 정보 확인
    step1: {
      checked_at: null, // 매물 정보 확인 여부
    },

    // 2단계: 본인 인증
    step2: {
      name: '',
      address: '',
      detail_address: '',
      ssn_front: '',
      ssn_back: '',
      phone_number: '',
      is_verified: false,
    },

    // 3단계: 계약 조건
    step3: {
      is_mortgaged: null,
      contract_duration: '', // 1년, 2년, 2년 이상
      renewal_intent: '', // 있음, 없음, 미정
      response_repairing_fixtures: '', // 임대인, 임차인
      restore_category_id: null,
      restore_category_name: '',
      has_condition_log: false,
      has_penalty: false,
      has_priority_for_extension: false,
      has_auto_price_adjustment: false,
      allow_jeonse_right_registration: null, // 전세일 경우에만
    },

    // 4단계: 거주 조건
    step4: {
      // 월세 전용 항목
      is_monthly_adjustable: null,
      rent_adjustment_min: null,
      is_adjustable: null,
      deposit_adjustment_min: null,
      payment_due_day: null,
      late_fee_interest_rate: null,

      // 전세 전용 항목
      is_deposit_adjustable: null,
      deposit_adjustment_min_jeonse: null,

      // 공통 항목
      bank_name: '',
      account_number: '',
      require_rent_guarantee_insurance: false,
      insurance_burden: '', // 임대인, 임차인, 일부 부담
      allow_pets: '', // 금지, 허용, 상관없음
      has_notice: false,
    },

    // 5단계: 특약 업로드
    step5: {
      specialTerms: [], // { title: string, content: string }[]
    },

    // 6단계: 최종 확인
    step6: {
      isConfirmed: false,
    },
  }),

  actions: {
    setContractType(type) {
      this.rent_type = type
    },
    setStepData(step, data) {
      this[`step${step}`] = { ...this[`step${step}`], ...data }
    },
    resetAll() {
      this.$reset()
    },
  },
})
