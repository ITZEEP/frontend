/* eslint-disable */

// public/firebase-messaging-sw.js
console.log('[SW] 🔧 Firebase Messaging Service Worker 시작')

try {
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
  console.log('[SW] firebase-app.js 로드 성공')

  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js')
  console.log('[SW] firebase-messaging.js 로드 성공')
} catch (error) {
  console.error('[SW] importScripts 실패:', error)
}

// 백그라운드 알림 저장 함수
const saveBackgroundNotificationToDB = async (payload) => {
  try {
    console.log('[SW] 🔔 백그라운드 알림 DB 저장 시도:', payload)

    // 토큰 가져오기 (IndexedDB 또는 다른 방법으로 저장된 토큰)
    const token = await getStoredAuthToken()

    if (!token) {
      console.warn('[SW] 인증 토큰이 없어 알림 저장 불가')
      return false
    }

    const { notification, data } = payload

    // 알림 데이터 구성
    const notificationData = {
      userId: data?.userId || null, // FCM 데이터에서 userId 추출
      title: notification?.title || data?.title || '새 알림',
      content: notification?.body || data?.body || '새로운 알림이 도착했습니다.',
      type: data?.type || 'SYSTEM',
      relatedId: data?.chatRoomId
        ? parseInt(data.chatRoomId)
        : data?.contractId
          ? parseInt(data.contractId)
          : null,
      data: JSON.stringify(data || {}),
    }

    // 사용자 ID가 없으면 저장하지 않음
    if (!notificationData.userId) {
      console.warn('[SW] 사용자 ID가 없어 알림 저장 불가')
      return false
    }

    const response = await fetch('/api/notifications/save-background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notificationData),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('[SW] ✅ 백그라운드 알림 DB 저장 성공:', result)

      // 메인 스레드에 알림 저장 완료 알림
      const clients = await self.clients.matchAll()
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_SAVED',
          payload: payload,
          result: result,
        })
      })

      return true
    } else {
      const errorText = await response.text()
      console.error('[SW] ❌ 백그라운드 알림 DB 저장 실패:', errorText)
      return false
    }
  } catch (error) {
    console.error('[SW] ❌ 백그라운드 알림 DB 저장 오류:', error)
    return false
  }
}

// 저장된 인증 토큰 가져오기 (IndexedDB 사용)
const getStoredAuthToken = async () => {
  try {
    // IndexedDB에서 토큰 조회
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AuthTokenDB', 1)

      request.onerror = () => {
        console.error('[SW] IndexedDB 열기 실패')
        resolve(null)
      }

      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['tokens'], 'readonly')
        const store = transaction.objectStore('tokens')
        const getRequest = store.get('authToken')

        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result ? result.token : null)
        }

        getRequest.onerror = () => {
          console.error('[SW] 토큰 조회 실패')
          resolve(null)
        }
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens', { keyPath: 'id' })
        }
      }
    })
  } catch (error) {
    console.error('[SW] 토큰 조회 오류:', error)
    return null
  }
}

// 사용자 ID 가져오기 (IndexedDB 사용)
const getStoredUserId = async () => {
  try {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('UserDataDB', 1)

      request.onerror = () => {
        console.error('[SW] UserDataDB 열기 실패')
        resolve(null)
      }

      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['userData'], 'readonly')
        const store = transaction.objectStore('userData')
        const getRequest = store.get('currentUser')

        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result ? result.userId : null)
        }

        getRequest.onerror = () => {
          console.error('[SW] 사용자 ID 조회 실패')
          resolve(null)
        }
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' })
        }
      }
    })
  } catch (error) {
    console.error('[SW] 사용자 ID 조회 오류:', error)
    return null
  }
}

if (typeof firebase !== 'undefined') {
  console.log('[SW] Firebase 객체 확인됨')

  firebase.initializeApp({
    apiKey: 'AIzaSyCoYr1H2VwJaLpHA0krtZCOX-dTDGlXZYM',
    authDomain: 'itzeep-de0ca.firebaseapp.com',
    projectId: 'itzeep-de0ca',
    storageBucket: 'itzeep-de0ca.firebasestorage.app',
    messagingSenderId: '966020195845',
    appId: '1:966020195845:web:9532cf29ef4f7108d55e6c',
  })

  console.log('[SW] Firebase 초기화 완료')

  const messaging = firebase.messaging()

  messaging.onBackgroundMessage(async function (payload) {
    console.log('[SW] 백그라운드 메시지 수신:', payload)

    try {
      // 백그라운드 알림을 DB에 저장하지 않음 (백엔드에서 이미 저장됨)
      // const saveSuccess = await saveBackgroundNotificationToDB(payload)

      // if (!saveSuccess) {
      //   console.warn('[SW] 알림 DB 저장 실패, 기본 처리 진행')
      // }

      // 알림 데이터 추출
      const { notification, data } = payload

      // 알림 제목과 내용 설정
      const notificationTitle = notification?.title || data?.title || '새 메시지'
      const notificationOptions = {
        body: notification?.body || data?.body || '새로운 메시지가 도착했습니다.',
        icon: notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: data?.chatRoomId ? `chat-${data.chatRoomId}` : 'default-notification',
        data: data || {},
        requireInteraction: false,
        actions: [
          {
            action: 'open',
            title: '확인하기',
          },
          {
            action: 'close',
            title: '닫기',
          },
        ],
      }

      console.log('[SW] 🔔 알림 표시:', {
        title: notificationTitle,
        options: notificationOptions,
      })

      // 알림 표시
      return self.registration.showNotification(notificationTitle, notificationOptions)
    } catch (error) {
      console.error('[SW] ❌ 백그라운드 메시지 처리 실패:', error)

      // 기본 알림 표시
      return self.registration.showNotification('새 메시지', {
        body: '메시지를 확인해주세요.',
        icon: '/favicon.ico',
      })
    }
  })

  // 알림 클릭 이벤트 처리
  self.addEventListener('notificationclick', function (event) {
    console.log('[SW] 🖱️ 알림 클릭됨:', event.notification.data)

    // 알림 닫기
    event.notification.close()

    // 액션에 따른 처리
    if (event.action === 'close') {
      console.log('[SW] 알림 닫기 액션')
      return
    }

    // 브라우저 창 포커스 또는 새 창 열기
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        const data = event.notification.data

        // 채팅방 URL 생성
        const targetUrl = data.chatRoomId
          ? `/chat?room=${data.chatRoomId}`
          : data.contractId
            ? `/contract/${data.contractId}`
            : '/notifications'

        console.log('[SW] 이동할 URL:', targetUrl)

        // 기존 창 찾기
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[SW] 기존 창 포커스')
            client.focus()
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: data,
              url: targetUrl,
            })
            return
          }
        }

        // 새 창 열기
        if (clients.openWindow) {
          console.log('[SW] 새 창 열기')
          return clients.openWindow(targetUrl)
        }
      }),
    )
  })

  console.log('[SW] ✅ 알림 이벤트 리스너 설정 완료')
} else {
  console.error('[SW] ❌ Firebase 객체를 찾을 수 없습니다')
}

// 서비스 워커 설치 이벤트
self.addEventListener('install', function (event) {
  console.log('[SW] 🔧 서비스 워커 설치됨')
  self.skipWaiting()
})

// 서비스 워커 활성화 이벤트
self.addEventListener('activate', function (event) {
  console.log('[SW] ✅ 서비스 워커 활성화됨')
  event.waitUntil(self.clients.claim())
})

// 메인 스레드와의 통신 처리
self.addEventListener('message', function (event) {
  console.log('[SW] 메인 스레드로부터 메시지 수신:', event.data)

  if (event.data.type === 'STORE_AUTH_TOKEN') {
    // 인증 토큰 저장
    storeAuthToken(event.data.token)
  } else if (event.data.type === 'STORE_USER_DATA') {
    // 사용자 데이터 저장
    storeUserData(event.data.userData)
  }
})

// 인증 토큰 저장 함수
const storeAuthToken = async (token) => {
  try {
    const request = indexedDB.open('AuthTokenDB', 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['tokens'], 'readwrite')
      const store = transaction.objectStore('tokens')

      store.put({ id: 'authToken', token: token })
      console.log('[SW] 인증 토큰 저장 완료')
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('tokens')) {
        db.createObjectStore('tokens', { keyPath: 'id' })
      }
    }
  } catch (error) {
    console.error('[SW] 인증 토큰 저장 실패:', error)
  }
}

// 사용자 데이터 저장 함수
const storeUserData = async (userData) => {
  try {
    const request = indexedDB.open('UserDataDB', 1)

    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(['userData'], 'readwrite')
      const store = transaction.objectStore('userData')

      store.put({ id: 'currentUser', ...userData })
      console.log('[SW] 사용자 데이터 저장 완료')
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'id' })
      }
    }
  } catch (error) {
    console.error('[SW] 사용자 데이터 저장 실패:', error)
  }
}

// 에러 핸들링
self.addEventListener('error', function (error) {
  console.error('[SW] ❌ 서비스 워커 오류:', error)
})

// 처리되지 않은 Promise 거부 처리
self.addEventListener('unhandledrejection', function (event) {
  console.error('[SW] ❌ 처리되지 않은 Promise 거부:', event.reason)
})

console.log('[SW] 🚀 Firebase Messaging Service Worker 설정 완료')
