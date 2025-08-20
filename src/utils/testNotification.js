import api from '@/apis'

// 테스트 알림 전송 (백엔드 API 호출)
export async function sendTestNotification() {
  try {
    console.log('📤 테스트 알림 전송 시도...')
    
    // 백엔드에 테스트 알림 요청
    const response = await api.post('/api/notifications/test', {
      type: 'SYSTEM',
      title: '테스트 알림',
      content: '이것은 테스트 알림입니다.',
      priority: 'HIGH'
    })
    
    console.log('✅ 테스트 알림 전송 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 테스트 알림 전송 실패:', error)
    
    // 백엔드 API가 없을 경우 로컬에서 이벤트 발생
    console.log('💡 로컬 테스트 알림 발생...')
    window.dispatchEvent(
      new CustomEvent('new-notification', {
        detail: {
          hasNew: true,
          payload: {
            notification: {
              title: '로컬 테스트 알림',
              body: '백엔드 연결 없이 로컬에서 발생한 테스트 알림입니다.'
            },
            data: {
              type: 'SYSTEM',
              notiId: Date.now(),
              timestamp: new Date().toISOString()
            }
          },
          source: 'local-test'
        }
      })
    )
    
    window.dispatchEvent(
      new CustomEvent('fcm-message', {
        detail: {
          notification: {
            title: '로컬 테스트 알림',
            body: '백엔드 연결 없이 로컬에서 발생한 테스트 알림입니다.'
          },
          data: {
            type: 'SYSTEM',
            notiId: Date.now()
          }
        }
      })
    )
    
    return { success: true, message: '로컬 테스트 알림 발생' }
  }
}

// WebSocket 연결 상태 확인
export function checkWebSocketStatus() {
  const ws = window.websocketService || null
  if (!ws) {
    console.log('❌ WebSocket 서비스를 찾을 수 없습니다.')
    return false
  }
  
  const status = ws.getConnectionStatus()
  console.log('📡 WebSocket 연결 상태:', status ? '✅ 연결됨' : '❌ 연결 안됨')
  
  if (ws.stompClient) {
    console.log('📡 STOMP 클라이언트 상태:', ws.stompClient.connected ? '✅ 연결됨' : '❌ 연결 안됨')
  }
  
  return status
}

// 알림 구독 상태 확인
export async function checkNotificationSubscription() {
  try {
    const { getCurrentUserId } = await import('@/apis/chatApi')
    const userId = await getCurrentUserId()
    
    if (!userId) {
      console.log('❌ 사용자 ID를 가져올 수 없습니다.')
      return false
    }
    
    console.log('👤 현재 사용자 ID:', userId)
    console.log('📡 구독해야 할 토픽:', `/user/${userId}/notifications`)
    
    // WebSocket 연결 상태 확인
    const wsStatus = checkWebSocketStatus()
    
    return { userId, wsStatus }
  } catch (error) {
    console.error('❌ 알림 구독 상태 확인 실패:', error)
    return false
  }
}

// 전체 알림 시스템 진단
export async function diagnoseNotificationSystem() {
  console.log('🔍 알림 시스템 진단 시작...')
  console.log('=' * 50)
  
  // 1. 로그인 상태 확인
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
  console.log('1️⃣ 로그인 상태:', token ? '✅ 로그인됨' : '❌ 로그인 안됨')
  
  if (!token) {
    console.log('❌ 로그인이 필요합니다.')
    return
  }
  
  // 2. FCM 권한 확인
  const permission = Notification.permission
  console.log('2️⃣ 알림 권한:', permission === 'granted' ? '✅ 허용됨' : `❌ ${permission}`)
  
  // 3. WebSocket 연결 확인
  console.log('3️⃣ WebSocket 상태:')
  checkWebSocketStatus()
  
  // 4. 알림 구독 확인
  console.log('4️⃣ 알림 구독 상태:')
  const subStatus = await checkNotificationSubscription()
  
  // 5. 이벤트 리스너 확인
  console.log('5️⃣ 이벤트 리스너 테스트:')
  
  // 테스트 리스너 등록
  const testHandler = (e) => console.log('✅ 이벤트 수신:', e.type, e.detail)
  window.addEventListener('new-notification', testHandler)
  window.addEventListener('fcm-message', testHandler)
  
  // 테스트 이벤트 발생
  window.dispatchEvent(new CustomEvent('test-event', { detail: 'test' }))
  
  setTimeout(() => {
    window.removeEventListener('new-notification', testHandler)
    window.removeEventListener('fcm-message', testHandler)
  }, 1000)
  
  console.log('=' * 50)
  console.log('✅ 진단 완료')
  
  return {
    loggedIn: !!token,
    notificationPermission: permission,
    webSocketConnected: subStatus?.wsStatus || false,
    userId: subStatus?.userId || null
  }
}