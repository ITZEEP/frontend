// 알림 테스트 유틸리티

// 알림 권한 확인
export const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    console.error('❌ 이 브라우저는 알림을 지원하지 않습니다.')
    return false
  }
  
  console.log('현재 알림 권한 상태:', Notification.permission)
  return Notification.permission
}

// 알림 권한 요청
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    console.log('알림 권한 요청 결과:', permission)
    return permission
  } catch (error) {
    console.error('알림 권한 요청 실패:', error)
    return 'denied'
  }
}

// 테스트 알림 보내기
export const sendTestNotification = () => {
  if (Notification.permission !== 'granted') {
    console.error('❌ 알림 권한이 없습니다. 먼저 권한을 요청하세요.')
    return false
  }

  // 일반 브라우저 알림
  const notification = new Notification('잇집 알림 테스트', {
    body: '알림이 정상적으로 작동합니다! 🎉',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'test-notification',
    requireInteraction: false,
  })

  notification.onclick = () => {
    console.log('알림 클릭됨!')
    notification.close()
  }

  console.log('✅ 테스트 알림 전송 완료')
  return true
}

// 서비스 워커를 통한 알림 테스트
export const sendServiceWorkerNotification = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('❌ 서비스 워커를 지원하지 않는 브라우저입니다.')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    if (Notification.permission !== 'granted') {
      console.error('❌ 알림 권한이 없습니다.')
      return false
    }

    await registration.showNotification('잇집 서비스 워커 알림', {
      body: '서비스 워커를 통한 알림이 작동합니다! 🚀',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sw-test-notification',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      },
      actions: [
        { action: 'open', title: '열기' },
        { action: 'close', title: '닫기' }
      ]
    })

    console.log('✅ 서비스 워커 알림 전송 완료')
    return true
  } catch (error) {
    console.error('❌ 서비스 워커 알림 전송 실패:', error)
    return false
  }
}

// FCM 토큰 확인
export const checkFCMToken = () => {
  const token = localStorage.getItem('fcm-token')
  if (token) {
    console.log('✅ FCM 토큰 존재:', token.substring(0, 20) + '...')
    return token
  } else {
    console.error('❌ FCM 토큰이 없습니다. FCM 초기화가 필요합니다.')
    return null
  }
}

// 서비스 워커 상태 확인
export const checkServiceWorkerStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    console.error('❌ 서비스 워커를 지원하지 않습니다.')
    return false
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    
    if (registrations.length === 0) {
      console.error('❌ 등록된 서비스 워커가 없습니다.')
      return false
    }

    registrations.forEach((registration, index) => {
      console.log(`✅ 서비스 워커 #${index + 1}:`)
      console.log('  - Scope:', registration.scope)
      console.log('  - Active:', registration.active ? '활성화' : '비활성화')
      console.log('  - Installing:', registration.installing ? '설치 중' : '없음')
      console.log('  - Waiting:', registration.waiting ? '대기 중' : '없음')
    })

    return true
  } catch (error) {
    console.error('❌ 서비스 워커 상태 확인 실패:', error)
    return false
  }
}

// 전체 알림 시스템 진단
export const diagnoseNotificationSystem = async () => {
  console.log('🔍 알림 시스템 진단 시작...')
  console.log('================================')
  
  // 1. 브라우저 지원 확인
  console.log('1️⃣ 브라우저 지원 확인')
  const hasNotificationAPI = 'Notification' in window
  const hasServiceWorker = 'serviceWorker' in navigator
  console.log('  - Notification API:', hasNotificationAPI ? '✅ 지원' : '❌ 미지원')
  console.log('  - Service Worker:', hasServiceWorker ? '✅ 지원' : '❌ 미지원')
  
  // 2. 알림 권한 확인
  console.log('\n2️⃣ 알림 권한 상태')
  const permission = checkNotificationPermission()
  console.log('  - 현재 권한:', permission)
  
  // 3. 서비스 워커 상태
  console.log('\n3️⃣ 서비스 워커 상태')
  await checkServiceWorkerStatus()
  
  // 4. FCM 토큰 확인
  console.log('\n4️⃣ FCM 토큰 상태')
  const token = checkFCMToken()
  
  // 5. 로컬 스토리지 확인
  console.log('\n5️⃣ 로컬 스토리지 확인')
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
  console.log('  - Access Token:', accessToken ? '✅ 있음' : '❌ 없음')
  
  console.log('================================')
  console.log('🔍 진단 완료')
  
  // 권한이 없으면 요청 제안
  if (permission !== 'granted') {
    console.log('\n⚠️ 알림 권한이 없습니다.')
    console.log('💡 다음 명령어를 실행하여 권한을 요청하세요:')
    console.log('   await notificationTest.requestPermission()')
  }
  
  // FCM 토큰이 없으면 초기화 제안
  if (!token && accessToken) {
    console.log('\n⚠️ FCM 토큰이 없습니다.')
    console.log('💡 다음 명령어를 실행하여 FCM을 초기화하세요:')
    console.log('   import { initializeFCM } from "@/fcm/fcmService"')
    console.log('   await initializeFCM()')
  }
  
  return {
    browserSupport: hasNotificationAPI && hasServiceWorker,
    permission,
    hasToken: !!token,
    isLoggedIn: !!accessToken
  }
}

// 콘솔에서 쉽게 사용할 수 있도록 window 객체에 추가
if (typeof window !== 'undefined') {
  window.notificationTest = {
    checkPermission: checkNotificationPermission,
    requestPermission: requestNotificationPermission,
    sendTest: sendTestNotification,
    sendSWTest: sendServiceWorkerNotification,
    checkToken: checkFCMToken,
    checkSW: checkServiceWorkerStatus,
    diagnose: diagnoseNotificationSystem
  }
  
  console.log('🎯 알림 테스트 도구가 준비되었습니다!')
  console.log('콘솔에서 다음 명령어를 사용할 수 있습니다:')
  console.log('  - notificationTest.diagnose() : 전체 시스템 진단')
  console.log('  - notificationTest.requestPermission() : 알림 권한 요청')
  console.log('  - notificationTest.sendTest() : 테스트 알림 전송')
  console.log('  - notificationTest.sendSWTest() : 서비스 워커 알림 테스트')
}