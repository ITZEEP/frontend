import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const usePreContractStore = defineStore('preContract', {
  state: () => ({
    leaseType: '', // 'JEONSE' | 'WOLSE'
    subSteps: {
      // roll은 'owner' || 'buyer'
      'owner-3': 2,
      'buyer-5': 2,
    },
    currentSubSteps: {},
    canProceed: false,
    hasPet: true,
    hasParking: false,
    triggerSubmit: null,
    triggerSubmitMap: reactive({}),
    homeId: '',
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
    setHasPet(hasPet) {
      this.hasPet = hasPet
    },
    setHasParking(hasParking) {
      this.hasParking = hasParking
    },
    setTriggerSubmit(step, subStepOrFn, maybeFn) {
      const key = typeof subStepOrFn === 'function' ? `${step}` : `${step}-${subStepOrFn}`
      const fn = typeof subStepOrFn === 'function' ? subStepOrFn : maybeFn

      if (!this.triggerSubmitMap) this.triggerSubmitMap = {}
      this.triggerSubmitMap[key] = fn
    },

    getTriggerSubmit(step, subStep) {
      return (
        (this.triggerSubmitMap && this.triggerSubmitMap[`${step}-${subStep}`]) ||
        (this.triggerSubmitMap && this.triggerSubmitMap[`${step}`]) ||
        null
      )
    },

    clearTriggerSubmit(step, subStep) {
      if (this.triggerSubmitMap) {
        delete this.triggerSubmitMap[`${step}-${subStep}`]
        delete this.triggerSubmitMap[`${step}`]
      }
<<<<<<< HEAD
=======
    },
    setHasParking(hasParking) {
      this.hasParking = hasParking
    },
    setHomeId(homeId) {
      this.homeId = homeId
>>>>>>> 1143f64103854ef595ccc1368124123f98613952
    },
  },
})
