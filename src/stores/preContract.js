import { defineStore } from 'pinia'

export const usePreContractStore = defineStore('preContract', {
  state: () => ({
    leaseType: '', // 'JEONSE' | 'WOLSE'
    subSteps: {
      // roll은 'owner' || 'buyer'
      'owner-3': 2,
      'owner-4': 2,
      'buyer-5': 2,
    },
    currentSubSteps: {},
    canProceed: false,
    riskCheck: false,
    hasPet: false,
  }),
  actions: {
    setLeaseType(type) {
      this.leaseType = type
    },
    setSubStepCount(step, role, count) {
      this.subSteps[`${role}-${step}`] = count
    },
    nextSubStep(step, role) {
      const key = `${role}-${step}`
      const current = this.currentSubSteps[key] || 1
      if (current < this.subSteps[key]) {
        this.currentSubSteps[key] = current + 1
      }
    },
    resetSubStep(step, role) {
      this.currentSubSteps[`${role}-${step}`] = 1
    },
    setCanProceed(status) {
      this.canProceed = status
    },
    setRiskCheck(risk) {
      this.riskCheck = risk;
    },
    setHasPet(hasPet) {
      this.hasPet = hasPet;
    },
  },
})
