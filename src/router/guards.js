// 인증이 필요한 라우트 목록
const authRequiredRoutes = [
  'mypage',
  'mypage-profile',
  'mypage-properties',
  'mypage-favorites',
  'mypage-chat-properties',
  'mypage-contracts',
  'mypage-risk-check-results',
  'chat',
  'contract-chat',
  'contract-step',
  'contract-export',
  'home-create',
]

// 인증 상태 확인
export const checkAuth = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
  // userInfo 체크 제거 - 토큰만으로 인증 확인
  return !!token
}

// 사용자 정보 가져오기
export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error)
    return null
  }
}

// 인증 가드
export const authGuard = (to, from, next) => {
  const isAuthenticated = checkAuth()
  const requiresAuth = authRequiredRoutes.some(route => 
    to.name?.includes(route) || to.path?.includes(route)
  )
  
  // 공개 페이지들 (에러 페이지와 인증 페이지는 항상 접근 가능)
  const publicPages = ['home', 'signin', 'signup', 'not-found', 'unauthorized', 'server-error', 'test-pdf-viewer', 'test-pdf-debug']
  const isPublicPage = publicPages.includes(to.name) || to.path === '/'
  
  // 인증이 필요한 페이지인데 인증되지 않은 경우
  if (requiresAuth && !isAuthenticated) {
    // 로그인 모달 표시 (라우터 가드에서는 리다이렉트만 처리)
    // 실제 모달은 API 인터셉터에서 처리
    next({
      name: 'signin',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if (isAuthenticated && (to.name === 'signin' || to.name === 'signup')) {
    next({ name: 'home' })
    return
  }
  
  next()
}

// 권한 체크 (예: 매물 소유자만 접근 가능)
export const checkPropertyOwner = async (propertyId, userId) => {
  try {
    // API 호출하여 매물 소유자 확인
    // 실제 구현 시 API 엔드포인트에 맞게 수정 필요
    const response = await fetch(`/api/homes/${propertyId}`)
    const data = await response.json()
    return data.ownerId === userId
  } catch (error) {
    console.error('매물 소유자 확인 실패:', error)
    return false
  }
}

// 계약 참여자 체크
export const checkContractParticipant = async (contractId, userId) => {
  try {
    // API 호출하여 계약 참여자 확인
    const response = await fetch(`/api/contract/${contractId}/participants`)
    const data = await response.json()
    return data.participants?.includes(userId)
  } catch (error) {
    console.error('계약 참여자 확인 실패:', error)
    return false
  }
}