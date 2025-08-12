export function createActionDispatchers({
  router,
  modalStore,
  // 단계별 의존성/콜백 주입 (필요한 것만 넘기면 됨)
  step1 = {},
  step2 = {},
  step3 = {},
  step4 = {},
} = {}) {
  const safeCall = (fn, ...args) => {
    try {
      if (typeof fn === 'function') return fn(...args)
    } catch (e) {
      console.error('[aiActionHandlers] action error:', e)
    }
  }

  const handlers = {
    // Step1
    // 'step1.openGuide': () => {
    //   safeCall(step1.openGuide)
    // },
    // 'step1.openResult': () => {
    //   safeCall(step1.openResult)
    // },

    // Step2
    // 'step2.openHelp': () => {
    //   safeCall(step2.openHelp)
    // },
    // 'step2.openReview': () => {
    //   safeCall(step2.openReview)
    // },
    // 'step2.openVerifyResult': () => {
    //   safeCall(step2.openVerifyResult)
    // },

    // Step3
    'step3.openTermsReview': () => {
      safeCall(step3.openTermsReview)
    },
    'step3.openFinalClause': () => {
      safeCall(step3.openFinalClause)
    },
    'step3.openExportResult': () => {
      safeCall(step3.openExportResult)
    },
    'step3.modification.accept': (payload) => safeCall(step3.respondModification, true, payload),
    'step3.modification.reject': (payload) => safeCall(step3.respondModification, false, payload),

    'step3.deletion.accept': (payload) => safeCall(step3.responseDeletion, true, payload),
    'step3.deletion.reject': (payload) => safeCall(step3.responseDeletion, false, payload),

    'step3.finalConfirm.accept': (payload) => safeCall(step3.responseFinalConfirm, true, payload),
    'step3.finalConfirm.reject': (payload) => safeCall(step3.responseFinalConfirm, false, payload),

    // Step4
    // 'step4.openChecklist': () => {
    //   safeCall(step4.openChecklist)
    // },
    // 'step4.openSubmitResult': () => {
    //   safeCall(step4.openSubmitResult)
    // },
  }

  // 레거시 액션명 호환 (기존 코드에서 쓰던 명칭)
  handlers['openTermsReview'] = handlers['step3.openTermsReview']
  handlers['openFinalClause'] = handlers['step3.openFinalClause']

  return function dispatchAction(action, ...args) {
    const fn = handlers[action]
    if (!fn) {
      return
    }
    return fn(...args)
  }
}
