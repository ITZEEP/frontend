import api from './index'

// 임차인 계약전 사전조서 API
export const preContractAPI = {
  // 사기 위험도 검사 여부 확인
  getCheckRisk: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/buyer/check-risk`)
      return response.data
    } catch (error) {
      // 오류를 캐치하고 throw해서 밖으로 던져주는 게 목적 👉 네트워크/서버 오류를 throw해서 호출자에게 전달
      console.log('사기 위험도 검사 여부 확인 실패', error)
      throw error
    }
  },

  // 사기 위험도 내역 조회 API
  getTodayRiskCheckSummary: async (homeId) => {
    try {
      const response = await api.get(`/api/fraud-risk/today-check/${homeId}`)
      return response.data
    } catch (error) {
      console.log('백엔드 사기위험도 정보 조회 실패', error)
      throw error
    }
  },

  // 백엔드 임차인 테이블 기본 세팅
  saveTenantInfo: async (contractChatId) => {
    try {
      const response = await api.post(`/api/pre-contract/${contractChatId}/buyer/init-con`)
      return response.data
    } catch (error) {
      console.log('백엔드 임차인 테이블 기본 세팅 실패', error)
      throw error
    }
  },

  // step1 정보 저장
  updateTenantStep1: async (contractChatId, step1DTO) => {
    try {
      const response = await api.patch(`/api/pre-contract/${contractChatId}/buyer/step1`, step1DTO)
      return response.data
    } catch (error) {
      console.log('step1 정보 저장 실패', error)
      throw error
    }
  },

  // step1 정보 조회
  selectTenantStep1: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/buyer/step1`)
      return response.data
    } catch (error) {
      console.log('step1 정보 조회 실패', error)
      throw error
    }
  },

  // step2 정보 저장
  updateTenantStep2: async (contractChatId, step2DTO) => {
    try {
      const response = await api.patch(`/api/pre-contract/${contractChatId}/buyer/step2`, step2DTO)
      return response.data
    } catch (error) {
      console.log('step2 정보 저장 실패', error)
      throw error
    }
  },

  // step2 정보 조회
  selectTenantStep2: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/buyer/step2`)
      return response.data
    } catch (error) {
      console.log('step2 정보 조회 실패', error)
      throw error
    }
  },

  // step3 정보 저장
  updateTenantStep3: async (contractChatId, step3DTO) => {
    try {
      const response = await api.patch(`/api/pre-contract/${contractChatId}/buyer/step3`, step3DTO)
      return response.data
    } catch (error) {
      console.log('step3 정보 저장 실패', error)
      throw error
    }
  },

  // step3 정보 조회
  selectTenantStep3: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/buyer/step3`)
      return response.data
    } catch (error) {
      console.log('step3 정보 조회 실패', error)
      throw error
    }
  },

  // 계약전 전체 정보 조회
  selectTenantPreCon: async (contractChatId) => {
    try {
      const response = await api.get(`/api/pre-contract/${contractChatId}/buyer/pre-con`)
      return response.data
    } catch (error) {
      console.log('계약전 전체 정보 조회 실패', error)
      throw error
    }
  },

  // 몽고 DB에 전체 정보 보내기
  saveMongoDB: async (contractChatId) => {
    try {
      const response = await api.post(`/api/pre-contract/${contractChatId}/buyer/save-mongo`)
      return response.data
    } catch (error) {
      console.log('몽고 DB에 전체 정보 보내기 실패', error)
      throw error
    }
  },
}

export default preContractAPI
