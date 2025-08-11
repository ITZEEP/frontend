import api from './index'

export const OwnerPreContractAPI = {
  // 임대인 DB 기본 세팅 (기본 정보 + 전/월세 정보 insert)
  saveOwnerInfo: async (contractChatId) => {
    try {
      const response = await api.post(`/api/pre-contract/${contractChatId}/owner/save`)
      return response.data
    } catch (error) {
      console.log('임대인 DB 기본 세팅 실패', error)
      throw error
    }
  },

  // 계약 정보 설정 Step 1
  // 조회
  getContractStep1: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/owner/contract-step1`)
      return response.data
    } catch (error) {
      console.log('계약 정보 설정 Step 1 조회 실패', error)
      throw error
    }
  },

  // 저장
  updateContractStep1: async (contractChatId, data) => {
    try {
      const response = await api.patch(
        `/api/pre-contract/${contractChatId}/owner/contract-step1`,
        data,
      )
      return response.data
    } catch (error) {
      console.log('계약 정보 설정 Step 1 저장 실패', error)
      throw error
    }
  },

  // 계약 정보 설정 Step 2
  // 조회
  getContractStep2: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/owner/contract-step2`)
      return response.data
    } catch (error) {
      console.log('계약 정보 설정 Step 2 조회 실패', error)
      throw error
    }
  },

  // 저장
  updateContractStep2: async (contractChatId, data) => {
    try {
      const response = await api.patch(
        `/api/pre-contract/${contractChatId}/owner/contract-step2`,
        data,
      )
      return response.data
    } catch (error) {
      console.log('계약 정보 설정 Step 2 저장 실패', error)
      throw error
    }
  },

  // 거주 정보 설정 Step 1
  // 조회
  getLivingStep1: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/owner/living-step1`)
      return response.data
    } catch (error) {
      console.log('거주 정보 설정 Step 1 조회 실패', error)
      throw error
    }
  },

  // 저장
  updateLivingStep1: async (contractChatId, data) => {
    try {
      const response = await api.patch(
        `/api/pre-contract/${contractChatId}/owner/living-step1`,
        data,
      )
      return response.data
    } catch (error) {
      console.log('거주 정보 설정 Step 1 저장 실패', error)
      throw error
    }
  },

  // 계약서 특약 정보
  // 조회
  getContractDocument: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/owner/contract-document`)
      return response.data
    } catch (error) {
      console.log('계약서 특약 정보 조회 실패', error)
      throw error
    }
  },

  // 저장 (MongoDB)
  saveContractDocument: async (contractChatId, data) => {
    try {
      const response = await api.post(
        `/api/pre-contract/${contractChatId}/owner/save-contract`,
        data,
      )
      return response.data
    } catch (error) {
      console.log('계약서 특약 정보 저장 실패', error)
      throw error
    }
  },

  // 최종 정보 조회
  getOwnerContractSummary: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/owner/summary`)
      return response.data
    } catch (error) {
      console.log('최종 정보 조회 실패', error)
      throw error
    }
  },

  // 최종 정보 MongoDB 저장
  saveMongoDB: async (contractChatId) => {
    try {
      const response = await api.post(`/api/pre-contract/${contractChatId}/owner/save-mongo`)
      return response.data
    } catch (error) {
      console.log('최종 정보 MongoDB 저장 실패', error)
      throw error
    }
  },
}
