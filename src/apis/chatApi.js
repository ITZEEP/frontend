import api from '@/apis'

const API_BASE_URL = '/api/chat'

function getAuthToken() {
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
    const fullUrl = `${API_BASE_URL}${url}`

    const config = {
      method,
      url: fullUrl,
      headers,
    }

    if (options.body) {
      config.data = JSON.parse(options.body)
    }

    const response = await api(config)
    return response.data
  } catch (error) {
    console.error('API 에러 응답:', error.response?.data || error.message)
    throw new Error(`API Error: ${error.response?.status} - ${error.message}`)
  }
}

const apiPost = (url, data = {}) => apiRequest(url, { method: 'POST', data })

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
    const res = await api.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data
  } catch (error) {
    console.error('파일 업로드 중 예외 발생:', error)

    if (error.name === 'TypeError' && error.message.includes('Network')) {
      throw new Error('네트워크 연결 오류: 서버에 연결할 수 없습니다.')
    }

    const status = error.response?.status
    const statusText = error.response?.statusText
    const errorText = error.response?.data

    console.error('파일 업로드 실패 상세:', { status, statusText, errorText })

    throw new Error(`File Upload Error: ${status} - ${statusText}`)
  }
}

export async function getCurrentUser() {
  try {
    const result = await apiRequest('/user')
    return result
  } catch (error) {
    console.error('서버 API 실패:', error)

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

    const res = await api.post(
      '/api/auth/refresh',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    )

    if (res.data.success && res.data.data.accessToken) {
      localStorage.setItem('accessToken', res.data.data.accessToken)
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

export async function requestContract(chatRoomId) {
  try {
    const result = await apiPost(`/rooms/${chatRoomId}/contract-request`)
    return result
  } catch (error) {
    console.error('계약 요청 실패', error)
    throw error
  }
}

export async function acceptContract(chatRoomId) {
  try {
    const result = await apiPost(`/rooms/${chatRoomId}/contract-accept`)
    return result
  } catch (error) {
    console.error('계약 수락 실패', error)
    throw error
  }
}
// 알림 목록 조회
export async function getNotifications(page = 0, size = 10, type = '') {
  const queryParams = new URLSearchParams({ page, size, type }).toString()
  return apiRequest(`/notifications?${queryParams}`)
}

// 최신 알림 조회
export async function getRecentNotifications(limit = 5) {
  const queryParams = new URLSearchParams({ limit }).toString()
  return apiRequest(`/notifications/recent?${queryParams}`)
}

// 읽지 않은 알림 수 조회
export async function getUnreadNotificationCount() {
  return apiRequest('/notifications/unread-count')
}

// 특정 알림 읽음 처리
export async function markNotificationAsRead(notiId) {
  return apiRequest(`/notifications/${notiId}/read`, {
    method: 'POST',
  })
}

// 여러 알림 읽음 처리
export async function markMultipleNotificationsAsRead(notificationIds) {
  return apiRequest('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ ids: notificationIds }),
  })
}

// 모든 알림 읽음 처리
export async function markAllNotificationsAsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'POST',
  })
}

// 특정 알림 삭제
export async function deleteNotification(notiId) {
  return apiRequest(`/notifications/${notiId}`, {
    method: 'DELETE',
  })
}

// 여러 알림 삭제
export async function deleteMultipleNotifications(notificationIds) {
  return apiRequest('/notifications', {
    method: 'DELETE',
    body: JSON.stringify({ ids: notificationIds }),
  })
}

// 모든 알림 삭제
export async function deleteAllNotifications() {
  return apiRequest('/notifications/all', {
    method: 'DELETE',
  })
}

// 백그라운드 알림 저장
export async function saveBackgroundNotification(notificationData) {
  return apiRequest('/notifications/save-background', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  })
}

// 알림 통계 조회
export async function getNotificationStats() {
  return apiRequest('/notifications/stats')
}

// 알림 타입별 통계 조회
export async function getNotificationStatsByType() {
  return apiRequest('/notifications/stats/types')
}
