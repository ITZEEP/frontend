// contractChatApi.js
import api from '@/apis'

const CONTRACT_CHAT_BASE = '/api/chat/contract'

function getAuthToken() {
  // 🔧 수정: localStorage 키 통일
  return localStorage.getItem('accessToken') || localStorage.getItem('access-token')
}

function getHeaders() {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

async function apiRequest(url, options = {}) {
  try {
    const method = options.method?.toLowerCase() || 'get'
    const headers = { ...getHeaders(), ...options.headers }
    const fullUrl = `${CONTRACT_CHAT_BASE}${url}`

    const config = {
      method,
      url: fullUrl,
      headers,
    }

    if (options.data) {
      config.data = options.data
    } else if (options.body) {
      config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
    }

    const response = await api(config)

    return response.data
  } catch (error) {
    console.error('API 에러 상세:', {
      url: `${CONTRACT_CHAT_BASE}${url}`,
      method: options.method || 'GET',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })

    const responseData = error.response?.data
    const isHtmlResponse =
      typeof responseData === 'string' && responseData.includes('<!doctype html>')

    if (isHtmlResponse) {
      return {
        success: false,
        message: `API 엔드포인트를 찾을 수 없습니다 (${error.response?.status || 'Unknown'})`,
        data: null,
      }
    }

    // 구조화된 JSON 에러 응답인 경우
    if (responseData && typeof responseData === 'object' && responseData.success !== undefined) {
      return responseData
    }

    // 기타 에러의 경우
    return {
      success: false,
      message: error.response?.statusText || error.message || '알 수 없는 오류가 발생했습니다',
      data: null,
    }
  }
}

//apiPost 함수 데이터 전달 방식 수정
const apiPost = (url, data = {}) => apiRequest(url, { method: 'POST', data })

// 계약 채팅방 생성
export const createContractChat = async (chatRoomId) => {
  return await apiRequest(`/rooms?chatRoomId=${chatRoomId}`, {
    method: 'POST',
  })
}

// 계약 채팅 메시지 조회
export const getContractMessages = async (contractChatId) => {
  if (!contractChatId) {
    console.error('contractChatId가 없습니다')
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
      data: [],
    }
  }

  try {
    const result = await apiRequest(`/messages/${contractChatId}`)

    if (typeof result === 'string') {
      console.error('예상치 못한 문자열 응답:', result.substring(0, 100) + '...')
      return {
        success: false,
        message: 'API에서 잘못된 형식의 응답을 받았습니다',
        data: [],
      }
    }

    return result
  } catch (error) {
    console.error('getContractMessages 실패:', error)
    return {
      success: false,
      message: error.message || '메시지 조회에 실패했습니다',
      data: [],
    }
  }
}

// 특약 시작점 설정
export const setStartPoint = async (contractChatId) => {
  if (!contractChatId) {
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
    }
  }

  try {
    const result = await apiPost(`/${contractChatId}/start-point`)
    return result
  } catch (error) {
    console.error('setStartPoint 실패:', error)
    return {
      success: false,
      message: error.message || '시작점 설정에 실패했습니다',
    }
  }
}
// 🔧 추가: 특약 종료 요청 거절 (buyer가 거절 시 사용)
export const rejectEndPointExport = async (contractChatId) => {
  if (!contractChatId) {
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
    }
  }

  try {
    const result = await apiPost(`/${contractChatId}/end-point-reject`)
    return result
  } catch (error) {
    console.error('rejectEndPointExport 실패:', error)
    return {
      success: false,
      message: error.message || '요청 거절에 실패했습니다',
    }
  }
}

export const requestEndPointExport = async (contractChatId) => {
  if (!contractChatId) {
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
    }
  }

  try {
    const result = await apiPost(`/${contractChatId}/request-end`)
    return result
  } catch (error) {
    console.error('requestEndPointExport 실패:', error)
    return {
      success: false,
      message: error.message || '요청 거절에 실패했습니다',
    }
  }
}

// 특약 종료점 설정 및 내보내기
export const setEndPointAndExport = async (contractChatId) => {
  if (!contractChatId) {
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
    }
  }

  try {
    const result = await apiPost(`/${contractChatId}/end-point-export`)
    return result
  } catch (error) {
    console.error('setEndPointAndExport 실패:', error)
    return {
      success: false,
      message: error.message || '내보내기에 실패했습니다',
    }
  }
}

// 🔧 추가: 계약 정보 조회 함수
export const getContractInfo = async (contractChatId) => {
  if (!contractChatId) {
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
      data: null,
    }
  }

  try {
    const result = await apiRequest(`/rooms/${contractChatId}/info`)
    return result
  } catch (error) {
    console.error('getContractInfo 실패:', error)
    return {
      success: false,
      message: error.message || '계약 정보 조회에 실패했습니다',
      data: null,
    }
  }
}

// 🔧 추가: 계약 채팅 메시지 전송 (HTTP API)
export const sendContractMessageHttp = async (messageData) => {
  const { contractChatId, senderId, receiverId, content, type = 'TEXT' } = messageData

  if (!contractChatId || !senderId || !receiverId || !content) {
    return {
      success: false,
      message: '필수 파라미터가 누락되었습니다',
    }
  }

  try {
    const result = await apiPost(`/messages/${contractChatId}`, {
      senderId,
      receiverId,
      content,
      type,
    })
    return result
  } catch (error) {
    console.error('endContractMessageHttp 실패:', error)
    return {
      success: false,
      message: error.message || '메시지 전송에 실패했습니다',
    }
  }
}

export const getContractChatOnlineStatus = async (contractChatId) => {
  if (!contractChatId) {
    return {
      success: false,
      message: 'contractChatId가 필요합니다',
      data: null,
    }
  }

  try {
    const result = await apiRequest(`/${contractChatId}/online-status`)
    return result
  } catch (error) {
    console.error('getContractChatOnlineStatus 실패:', error)
    return {
      success: false,
      message: error.message || '온라인 상태 조회에 실패했습니다',
      data: null,
    }
  }
}
