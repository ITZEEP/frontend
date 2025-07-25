const API_BASE_URL = 'http://localhost:8080/api/chat'

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
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API 에러 응답:', errorText)
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return result
}

export async function getOwnerChatRooms() {
  return apiRequest('/rooms/owner')
}

export async function getBuyerChatRooms() {
  return apiRequest('/rooms/buyer')
}

export async function createChatRoom(propertyId) {
  return apiRequest('/rooms', {
    method: 'POST',
    body: JSON.stringify({ propertyId }),
  })
}

export async function getChatMessages(chatRoomId) {
  return apiRequest(`/messages/${chatRoomId}`)
}

export async function markChatRoomAsRead(chatRoomId) {
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/read`, {
      method: 'POST',
    })
    return result
  } catch (error) {
    console.error('채팅방 읽음 처리 실패:', error)
    throw error
  }
}

// 특정 메시지 읽음 처리 (필요시 사용)
export async function markMessageAsRead(messageId) {
  try {
    const result = await apiRequest(`/messages/${messageId}/read`, {
      method: 'POST',
    })
    return result
  } catch (error) {
    console.error('메시지 읽음 처리 실패:', error)
    throw error
  }
}

// 채팅 파일 업로드
export async function uploadChatFile(file, chatRoomId, receiverId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('chatRoomId', chatRoomId)
  formData.append('receiverId', receiverId)

  try {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    })

    // 에러 처리 개선
    if (!response.ok) {
      const errorText = await response.text()
      console.error('파일 업로드 실패 상세:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      })
      throw new Error(`File Upload Error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('파일 업로드 중 예외 발생:', error)

    // 네트워크 오류와 서버 오류 구분
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('네트워크 연결 오류: 서버에 연결할 수 없습니다.')
    }

    throw error
  }
}

export async function getCurrentUser() {
  try {
    const result = await apiRequest('/user')
    return result
  } catch (error) {
    console.error('서버 API 실패:', error)

    // 서버 API 실패 시 JWT에서 추출 시도
    const token = getAuthToken()
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }
  }
}

// 사용자 ID만 간단히 가져오는 헬퍼 함수
export async function getCurrentUserId() {
  try {
    const userInfo = await getCurrentUser()
    const userId = userInfo.data.userId
    return userId
  } catch (error) {
    console.error('사용자 ID 조회 실패:', error)
    return null
  }
}

// 사용자 온라인 상태 확인
export async function getUserOnlineStatus(userId) {
  try {
    const result = await apiRequest(`/user/${userId}/online`)
    return result
  } catch (error) {
    console.error('온라인 상태 조회 실패:', error)
    return { success: false, data: { isOnline: false } }
  }
}

// 채팅방 내 온라인 사용자 목록 조회
export async function getChatRoomOnlineUsers(chatRoomId) {
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/online-users`)
    return result
  } catch (error) {
    console.error('온라인 사용자 조회 실패:', error)
    return { success: false, data: [] }
  }
}

// 토큰 유효성 검사
export function isTokenValid() {
  const token = getAuthToken()
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (payload.exp && payload.exp < currentTime) {
      console.warn('토큰이 만료되었습니다')
      return false
    }
    return true
  } catch (error) {
    console.error('토큰 검증 실패:', error)
    return false
  }
}

// 토큰 갱신 (필요시 사용)
export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다')
    }

    const response = await fetch('http://localhost:8080/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('토큰 갱신 실패')
    }

    const result = await response.json()

    if (result.success && result.data.accessToken) {
      localStorage.setItem('accessToken', result.data.accessToken)
      return true
    }

    throw new Error('토큰 갱신 응답이 올바르지 않습니다')
  } catch (error) {
    console.error('토큰 갱신 실패:', error)
    return false
  }
}

// API 요청 시 자동 재시도 (토큰 만료 시)
export async function apiRequestWithRetry(url, options = {}) {
  try {
    return await apiRequest(url, options)
  } catch (error) {
    if (error.message.includes('401')) {
      const refreshSuccess = await refreshToken()
      if (refreshSuccess) {
        return await apiRequest(url, options)
      }
    }

    throw error
  }
}

// 읽지 않은 메시지 수 조회
export async function getUnreadMessageCount(chatRoomId) {
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/unread-count`)
    return result
  } catch (error) {
    console.error('읽지 않은 메시지 수 조회 실패:', error)
    return { success: false, data: { count: 0 } }
  }
}

// 전체 읽지 않은 메시지 수 조회
export async function getTotalUnreadCount() {
  try {
    const result = await apiRequest('/unread-count')
    return result
  } catch (error) {
    console.error('전체 읽지 않은 메시지 수 조회 실패:', error)
    return { success: false, data: { totalCount: 0 } }
  }
}

export async function getChatRoomInfo(chatRoomId) {
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/info`)
    return result
  } catch (error) {
    console.error('채팅방 정보 조회 실패:', error)
    throw error
  }
}
