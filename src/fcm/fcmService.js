import { getToken as getFirebaseToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/fcm/fcmIndex'
import { getCurrentUser } from '@/apis/chatApi'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// VAPID 키
const vapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BBwhqrm3fd9077YciPjcCv1H7E1rrEbfIko3CwjtE4PlpkY-3PGnV0V1TBUAU_epvIP9ug_ktwaDvxQsYAQobk0'

// 알림 상태 관리를 위한 전역 상태
let hasNewNotifications = false
let notificationBadgeCallback = null
let unreadNotificationCount = 0

const sendTokenToServer = async (token) => {
  try {
    const userResponse = await getCurrentUser()

    if (!userResponse.success || !userResponse.data?.userId) {
      console.error('사용자 정보를 찾을 수 없습니다.')
      return false
    }

    const userId = userResponse.data.userId

    console.log('FCM 토큰 서버 전송 시도:', {
      userId,
      token: token.substring(0, 20) + '...',
    })

    const authToken = localStorage.getItem('accessToken') || localStorage.getItem('access-token')

    const response = await fetch(`${BASE_URL}/api/fcm/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
      body: JSON.stringify({
        userId: userId.toString(),
        token: token,
      }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('FCM 토큰 서버 등록 성공:', result)
      return true
    } else {
      const errorText = await response.text()
      console.error('FCM 토큰 서버 등록 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return false
    }
  } catch (error) {
    console.error('FCM 토큰 서버 전송 중 오류:', error)
    return false
  }
}

/**
 * FCM 초기화
 */
export const initializeFCM = async () => {
  try {
    console.log('FCM 초기화 시작...')

    // 브라우저 지원 확인
    if (!('serviceWorker' in navigator)) {
      console.warn('이 브라우저는 서비스 워커를 지원하지 않습니다.')
      return false
    }

    if (!('Notification' in window)) {
      console.warn('이 브라우저는 알림을 지원하지 않습니다.')
      return false
    }

    let registration
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('서비스 워커 등록 성공:', registration)
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error)
      return false
    }

    const permission = await Notification.requestPermission()
    console.log('알림 권한:', permission)

    if (permission !== 'granted') {
      console.warn('알림 권한이 거부되었습니다.')
      return false
    }

    // FCM 토큰 가져오기
    const token = await getFirebaseToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      console.log('FCM 토큰 획득 성공:', token.substring(0, 20) + '...')

      // 서버에 토큰 전송
      const success = await sendTokenToServer(token)

      if (success) {
        // 포그라운드 메시지 수신 리스너 설정
        setupForegroundMessageListener()

        return true
      }
    } else {
      console.warn('FCM 토큰을 가져올 수 없습니다.')
    }

    return false
  } catch (error) {
    console.error('FCM 초기화 실패:', error)
    return false
  }
}

/**
 * 포그라운드 메시지 수신 리스너 설정
 */
const setupForegroundMessageListener = () => {
  onMessage(messaging, async (payload) => {
    console.log('포그라운드에서 메시지 수신:', payload)

    const { notification, data } = payload

    // 새 알림이 왔음을 표시
    setHasNewNotifications(true)

    // 브라우저 알림 표시 (포그라운드에서는 DB 저장 안함 - 백엔드에서 이미 저장)
    if (notification && Notification.permission === 'granted') {
      const { title, body, icon } = notification

      const notificationOptions = {
        body: body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: data?.chatRoomId || data?.notificationId || 'chat-notification',
        data: data,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: '확인하기',
          },
          {
            action: 'dismiss',
            title: '닫기',
          },
        ],
      }

      // 서비스 워커를 통한 알림 표시
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, notificationOptions)
        })
      } else {
        // 일반 브라우저 알림
        new Notification(title, notificationOptions)
      }
    }

    // 커스텀 이벤트 발생 (Vue 컴포넌트에서 수신 가능)
    window.dispatchEvent(
      new CustomEvent('fcm-message', {
        detail: payload,
      }),
    )

    // 새 알림 표시 업데이트 이벤트 발생 (개수는 UI에서 자체 증가)
    window.dispatchEvent(
      new CustomEvent('new-notification', {
        detail: {
          hasNew: true,
          payload: payload,
          source: 'fcm', // FCM에서 온 알림임을 표시
        },
      }),
    )

    console.log('새 FCM 알림 처리 완료')
  })
}

/**
 * FCM 토큰 새로고침
 */
export const refreshFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.ready
    const newToken = await getFirebaseToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (newToken) {
      console.log('FCM 토큰 새로고침 성공')
      await sendTokenToServer(newToken)
      return newToken
    }
  } catch (error) {
    console.error('FCM 토큰 새로고침 실패:', error)
  }
  return null
}

/**
 * 알림 권한 상태 확인
 */
export const getNotificationPermission = () => {
  return Notification.permission
}

/**
 * 알림 권한 요청
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    console.log('알림 권한 요청 결과:', permission)
    return permission === 'granted'
  } catch (error) {
    console.error('알림 권한 요청 실패:', error)
    return false
  }
}

/**
 * FCM 토큰 가져오기 (외부에서 직접 사용할 경우)
 */
export const getFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.ready
    const token = await getFirebaseToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    })
    return token
  } catch (error) {
    console.error('FCM 토큰 가져오기 실패:', error)
    return null
  }
}

/**
 * 새 알림 상태 설정
 */
export const setHasNewNotifications = (hasNew) => {
  hasNewNotifications = hasNew

  // 등록된 콜백이 있으면 실행
  if (notificationBadgeCallback) {
    notificationBadgeCallback(hasNew)
  }

  // 로컬 스토리지에도 저장 (페이지 새로고침 시에도 유지)
  localStorage.setItem('hasNewNotifications', hasNew.toString())

  console.log('새 알림 상태 업데이트:', hasNew)
}

/**
 * 새 알림 상태 가져오기
 */
export const getHasNewNotifications = () => {
  // 메모리의 상태를 우선 확인하고, 없으면 로컬 스토리지에서 가져오기
  if (hasNewNotifications) {
    return true
  }

  const stored = localStorage.getItem('hasNewNotifications')
  return stored === 'true'
}

/**
 * 읽지 않은 알림 개수 설정
 */
export const setUnreadNotificationCount = (count) => {
  unreadNotificationCount = Math.max(0, count)
  localStorage.setItem('unreadNotificationCount', unreadNotificationCount.toString())

  console.log('읽지 않은 알림 개수 업데이트:', unreadNotificationCount)
}

/**
 * 읽지 않은 알림 개수 가져오기
 */
export const getUnreadNotificationCount = () => {
  if (unreadNotificationCount > 0) {
    return unreadNotificationCount
  }

  const stored = localStorage.getItem('unreadNotificationCount')
  const count = parseInt(stored) || 0
  unreadNotificationCount = count
  return count
}

/**
 * 읽지 않은 알림 개수 증가
 */
export const incrementUnreadCount = () => {
  unreadNotificationCount += 1
  localStorage.setItem('unreadNotificationCount', unreadNotificationCount.toString())

  console.log('읽지 않은 알림 개수 증가:', unreadNotificationCount)
  return unreadNotificationCount
}

/**
 * 읽지 않은 알림 개수 감소
 */
export const decrementUnreadCount = () => {
  unreadNotificationCount = Math.max(0, unreadNotificationCount - 1)
  localStorage.setItem('unreadNotificationCount', unreadNotificationCount.toString())

  console.log('읽지 않은 알림 개수 감소:', unreadNotificationCount)
  return unreadNotificationCount
}

/**
 * 알림 배지 업데이트 콜백 등록
 */
export const setNotificationBadgeCallback = (callback) => {
  notificationBadgeCallback = callback
}

/**
 * 알림을 읽었을 때 호출 (새 알림 상태 초기화)
 */
export const markNotificationsAsRead = () => {
  setHasNewNotifications(false)

  // 읽음 처리 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('notifications-read', {
      detail: {
        timestamp: Date.now(),
      },
    }),
  )

  console.log('모든 알림 읽음 처리 완료')
}

/**
 * 단일 알림 읽음 처리
 */
export const markSingleNotificationAsRead = () => {
  // 개수 감소
  decrementUnreadCount()

  // 개수가 0이 되면 새 알림 상태도 false로
  if (unreadNotificationCount <= 0) {
    setHasNewNotifications(false)
  }

  // 개수 업데이트 이벤트 발생
  window.dispatchEvent(
    new CustomEvent('notification-count-updated', {
      detail: {
        unreadCount: unreadNotificationCount,
      },
    }),
  )

  console.log('단일 알림 읽음 처리, 남은 개수:', unreadNotificationCount)
}

/**
 * 알림 상태 초기화 (로그아웃 시 등)
 */
export const resetNotificationState = () => {
  hasNewNotifications = false
  unreadNotificationCount = 0
  localStorage.removeItem('hasNewNotifications')
  localStorage.removeItem('unreadNotificationCount')

  console.log('알림 상태 초기화 완료')
}

// 기존 Vue 컴포넌트에서 사용하던 메서드들 (호환성 유지)
export const requestPermission = requestNotificationPermission

// Vue 컴포넌트에서 사용할 getToken 함수 (이름 충돌 방지)
export const getToken = getFCMToken

export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
}

export default {
  initializeFCM,
  refreshFCMToken,
  getNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  requestPermission,
  getToken,
  onMessageListener,
  setHasNewNotifications,
  getHasNewNotifications,
  setUnreadNotificationCount,
  getUnreadNotificationCount,
  incrementUnreadCount,
  decrementUnreadCount,
  setNotificationBadgeCallback,
  markNotificationsAsRead,
  markSingleNotificationAsRead,
  resetNotificationState,
}
