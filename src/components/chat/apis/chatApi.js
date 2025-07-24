const API_BASE_URL = 'http://localhost:8080/api/chat'

function getAuthToken() {
  // 🔧 수정: localStorage 키 통일
  return localStorage.getItem('accessToken') || localStorage.getItem('access-token')
}

function getHeaders() {
  const token = getAuthToken()
  console.log('🔑 사용할 토큰:', token ? '토큰 존재' : '토큰 없음')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

async function apiRequest(url, options = {}) {
  console.log('🌐 API 요청:', `${API_BASE_URL}${url}`)
  console.log('🔧 요청 헤더:', getHeaders())

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })

  console.log('📡 API 응답 상태:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ API 에러 응답:', errorText)
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log('📦 API 응답 데이터:', result)
  return result
}

// 소유자 채팅방 목록 조회
export async function getOwnerChatRooms() {
  console.log('🏠 소유자 채팅방 목록 조회')
  return apiRequest('/rooms/owner')
}

// 구매자 채팅방 목록 조회
export async function getBuyerChatRooms() {
  console.log('🏠 구매자 채팅방 목록 조회')
  return apiRequest('/rooms/buyer')
}

// 채팅방 생성
export async function createChatRoom(propertyId) {
  console.log('🏠 채팅방 생성:', propertyId)
  return apiRequest('/rooms', {
    method: 'POST',
    body: JSON.stringify({ propertyId }),
  })
}

// 채팅 메시지 목록 조회
export async function getChatMessages(chatRoomId) {
  console.log('💬 채팅 메시지 조회:', chatRoomId)
  return apiRequest(`/messages/${chatRoomId}`)
}

// 채팅방 읽음 처리 (새로 추가)
export async function markChatRoomAsRead(chatRoomId) {
  console.log('📖 채팅방 읽음 처리:', chatRoomId)
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/read`, {
      method: 'POST',
    })
    console.log('✅ 채팅방 읽음 처리 성공')
    return result
  } catch (error) {
    console.error('❌ 채팅방 읽음 처리 실패:', error)
    throw error
  }
}

// 특정 메시지 읽음 처리 (필요시 사용)
export async function markMessageAsRead(messageId) {
  console.log('📖 메시지 읽음 처리:', messageId)
  try {
    const result = await apiRequest(`/messages/${messageId}/read`, {
      method: 'POST',
    })
    console.log('✅ 메시지 읽음 처리 성공')
    return result
  } catch (error) {
    console.error('❌ 메시지 읽음 처리 실패:', error)
    throw error
  }
}

// 채팅 파일 업로드
export async function uploadChatFile(file, chatRoomId) {
  console.log('📎 채팅 파일 업로드:', { fileName: file.name, chatRoomId })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('chatRoomId', chatRoomId)

  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      // Content-Type은 FormData 사용 시 자동 설정되므로 제외
    },
    body: formData,
  })

  console.log('📡 파일 업로드 응답 상태:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ 파일 업로드 실패:', errorText)
    throw new Error(`File Upload Error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log('📦 파일 업로드 성공:', result)
  return result
}

// 채팅방 미디어 파일 목록 조회
export async function getChatMediaFiles(chatRoomId, page = 0, size = 20, mediaType = 'ALL') {
  console.log('🖼️ 채팅방 미디어 파일 조회:', { chatRoomId, page, size, mediaType })

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    mediaType: mediaType,
  })

  return apiRequest(`/media/${chatRoomId}?${params}`)
}

// 🔧 수정된 getCurrentUser 함수 - 서버 API 직접 호출
export async function getCurrentUser() {
  try {
    console.log('👤 서버 API로 사용자 정보 조회 시도')

    // 서버의 /user 엔드포인트 직접 호출
    const result = await apiRequest('/user')

    console.log('✅ 서버에서 사용자 정보 성공:', result)
    return result
  } catch (error) {
    console.error('❌ 서버 API 실패:', error)

    // 서버 API 실패 시 JWT에서 추출 시도
    console.log('🔄 JWT에서 사용자 정보 추출 시도')

    const token = getAuthToken()
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('🔑 JWT 페이로드:', payload)

      // 이메일 기반 사용자 ID 매핑 (임시)
      const emailToUserIdMap = {
        'moosoi900@gmail.com': 11, // 실제 DB의 사용자 ID로 수정
        'test@example.com': 3, // 테스트용 사용자
        // 필요시 다른 이메일도 추가
      }

      const userId = emailToUserIdMap[payload.sub]
      if (userId) {
        const fallbackResult = {
          success: true,
          data: {
            userId: userId,
            email: payload.sub,
          },
        }
        console.log('✅ JWT에서 사용자 정보 추출 성공:', fallbackResult)
        return fallbackResult
      } else {
        throw new Error(`매핑되지 않은 이메일: ${payload.sub}`)
      }
    } catch (jwtError) {
      console.error('❌ JWT 처리 실패:', jwtError)
      throw new Error('사용자 정보를 가져올 수 없습니다.')
    }
  }
}

// 사용자 ID만 간단히 가져오는 헬퍼 함수
export async function getCurrentUserId() {
  try {
    console.log('👤 사용자 ID 조회 시작')
    const userInfo = await getCurrentUser()
    const userId = userInfo.data.userId
    console.log('✅ 사용자 ID 조회 성공:', userId)
    return userId
  } catch (error) {
    console.error('❌ 사용자 ID 조회 실패:', error)
    return null
  }
}

// 사용자 온라인 상태 확인
export async function getUserOnlineStatus(userId) {
  console.log('👥 사용자 온라인 상태 확인:', userId)
  try {
    const result = await apiRequest(`/user/${userId}/online`)
    console.log('✅ 온라인 상태 조회 성공:', result)
    return result
  } catch (error) {
    console.error('❌ 온라인 상태 조회 실패:', error)
    return { success: false, data: { isOnline: false } }
  }
}

// 채팅방 내 온라인 사용자 목록 조회
export async function getChatRoomOnlineUsers(chatRoomId) {
  console.log('👥 채팅방 온라인 사용자 조회:', chatRoomId)
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/online-users`)
    console.log('✅ 온라인 사용자 조회 성공:', result)
    return result
  } catch (error) {
    console.error('❌ 온라인 사용자 조회 실패:', error)
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

    // 토큰 만료 시간 확인
    if (payload.exp && payload.exp < currentTime) {
      console.warn('🔑 토큰이 만료되었습니다')
      return false
    }

    console.log('🔑 토큰이 유효합니다')
    return true
  } catch (error) {
    console.error('🔑 토큰 검증 실패:', error)
    return false
  }
}

// 토큰 갱신 (필요시 사용)
export async function refreshToken() {
  console.log('🔄 토큰 갱신 시도')
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
      console.log('✅ 토큰 갱신 성공')
      return true
    }

    throw new Error('토큰 갱신 응답이 올바르지 않습니다')
  } catch (error) {
    console.error('❌ 토큰 갱신 실패:', error)
    return false
  }
}

// API 요청 시 자동 재시도 (토큰 만료 시)
export async function apiRequestWithRetry(url, options = {}) {
  try {
    return await apiRequest(url, options)
  } catch (error) {
    // 401 Unauthorized 에러 시 토큰 갱신 후 재시도
    if (error.message.includes('401')) {
      console.log('🔄 401 에러 감지, 토큰 갱신 후 재시도')

      const refreshSuccess = await refreshToken()
      if (refreshSuccess) {
        console.log('🔄 토큰 갱신 성공, API 재시도')
        return await apiRequest(url, options)
      }
    }

    throw error
  }
}

// 읽지 않은 메시지 수 조회
export async function getUnreadMessageCount(chatRoomId) {
  console.log('📊 읽지 않은 메시지 수 조회:', chatRoomId)
  try {
    const result = await apiRequest(`/rooms/${chatRoomId}/unread-count`)
    console.log('✅ 읽지 않은 메시지 수 조회 성공:', result)
    return result
  } catch (error) {
    console.error('❌ 읽지 않은 메시지 수 조회 실패:', error)
    return { success: false, data: { count: 0 } }
  }
}

// 전체 읽지 않은 메시지 수 조회
export async function getTotalUnreadCount() {
  console.log('📊 전체 읽지 않은 메시지 수 조회')
  try {
    const result = await apiRequest('/unread-count')
    console.log('✅ 전체 읽지 않은 메시지 수 조회 성공:', result)
    return result
  } catch (error) {
    console.error('❌ 전체 읽지 않은 메시지 수 조회 실패:', error)
    return { success: false, data: { totalCount: 0 } }
  }
}
