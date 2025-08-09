// src/apis/verification.js
import api from './index'

export const VerificationAPI = {
  // 공용: START/END 모두 처리
  verificationPreContract: async (contractChatId, step, data) => {
    try {
      const body = { ...data, contractStep: step } // 'START' | 'END'
      const res = await api.post(`/api/pre-contract/${contractChatId}/verification`, body)
      return res.data
    } catch (error) {
      console.log(`계약 사전 조사(${step}) 본인 인증 실패: `, error)
      throw error
    }
  },

  // 가독성/호환용 래퍼
  verificationPreContractStart: (contractChatId, data) =>
    VerificationAPI.verificationPreContract(contractChatId, 'START', data),

  verificationPreContractEnd: (contractChatId, data) =>
    VerificationAPI.verificationPreContract(contractChatId, 'END', data),

  // 매물 등록
  verificationHome: async (homeId, data) => {
    try {
      const res = await api.post(`/api/home/${homeId}/identity-verification`, data)
      return res.data
    } catch (error) {
      console.log('매물 등록 시 본인 인증 실패: ', error)
      throw error
    }
  },
}
