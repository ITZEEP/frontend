import api from './index'

const CONTRACT_BASE_URL = '/api/contract'
const CONTRACT_CHAT_BASE_URL = '/api/chat/contract'

// 전체 계약서 조회 (오른쪽)
export const contractApi = {
  // 계약 채팅방 URL로 이동
  moveContractChat: async (chatRoomId) => {
    try {
      const response = await api.get(`${CONTRACT_CHAT_BASE_URL}/${chatRoomId}/moveContractChat`)
      return response.data
    } catch (error) {
      console.error('계약 채팅방 이동 실패: ', error)
      throw error
    }
  },

  getContractBasic: async (contractChatId) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/getContract`)
      return response.data
    } catch (error) {
      console.error('계약서 전체 조회 실패: ', error)
      if (error.response?.data) {
        return error.response.data
      }
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

  // ======= 금액 조율 =======

  // 금액 조회
  postGetPrice: async (contractChatId) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/getPrice`)
      return response.data
    } catch (error) {
      console.error('금액 조회 실패: ', error)
    }
  },

  // 금액 확정 요청
  postRequestPrice: async (contractChatId, data) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/price/request`, data)
      return response.data
    } catch (error) {
      console.error('금액 확정 요청 실패: ', error)
    }
  },

  // 금액 확정 거절
  postRejectPrice: async (contractChatId) => {
    try {
      const response = await api.post(`${CONTRACT_BASE_URL}/${contractChatId}/price/reject`)
      return response.data
    } catch (error) {
      console.error('금액 확정 거절 실패: ', error)
    }
  },

  // 금액 확정 수락
  postAcceptPrice: async (contractChatId) => {
    try {
      const response = await api.patch(`${CONTRACT_BASE_URL}/${contractChatId}/price/accept`)
      return response.data
    } catch (error) {
      console.error('금액 확정 수락 실패: ', error)
    }
  },

  // ======= 계약서 최종 확정 =========
  // 요청
  postRequestFinalAccept: async (contractChatId) => {
    try {
      const response = await api.post(
        `${CONTRACT_BASE_URL}/${contractChatId}/specialContract/final-request`,
      )
      return response.data
    } catch (error) {
      console.error('계약서 최종 확정 요청 실패: ', error)
    }
  },

  // 응답
  postResponseFinalAccept: async (contractChatId, data) => {
    try {
      const response = await api.post(
        `${CONTRACT_BASE_URL}/${contractChatId}/specialContract/final-accept`,
        data,
      )
      return response.data
    } catch (error) {
      console.error('계약서 최종 확정 응답 실패: ', error)
    }
  },
}
