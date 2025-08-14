import api from './index'

const CONTRACT_BASE_URL = '/api/contract'

// 전체 계약서 조회 (오른쪽)
export const contractApi = {
  getContractBasic: async (contractChatId) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/getContract`)
      return response.data
    } catch (error) {
      console.error('계약서 전체 조회 실패: ', error)
    }
  },

  // 정보 조회 시작
  postStartStep1: async (contractChatId) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/step1`)
      return response.data
    } catch (error) {
      console.error('정보 조회 단계 시작 실패: ', error)
    }
  },

  // 정보 조회 -> 금액 조율 넘어가기
  postGoToStep2: async (contractChatId, data) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/nextStep`, data)
      return response.data
    } catch (error) {
      console.error('정보 조회에서 금액 조율로 넘어가기 실패: ', error)
    }
  },
}
