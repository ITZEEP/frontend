import api from '@/apis'

// OAuth2 관련 API
export const authAPI = {
  // 카카오 로그인 URL 가져오기
  getKakaoLoginUrl: () => api.get('/api/auth/kakao/login-url'),

  // OAuth2 로그인 완료 처리 (code를 토큰으로 교환)
  completeOAuth2Login: (code, redirectUri) => 
    api.post('/oauth2/login/complete', null, { 
      params: { 
        code,
        redirectUri: redirectUri || 'http://localhost:5173/oauth/callback/kakao'
      } 
    }),

  // 사용자 정보 조회
  getUserInfo: () => api.get('/api/auth/user'),

  // 로그아웃
  logout: () => api.post('/api/auth/logout'),
}

// 토큰 관리 유틸리티
export const tokenUtils = {
  getToken: () => localStorage.getItem('access-token'),
  setToken: (token) => localStorage.setItem('access-token', token),
  removeToken: () => localStorage.removeItem('access-token'),
  hasToken: () => !!localStorage.getItem('access-token'),
}

// 사용자 정보 관리 유틸리티
export const userUtils = {
  getUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
}