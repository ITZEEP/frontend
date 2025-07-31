import axios from 'axios'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 모든 요청에 토큰 추가
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('access-token')

    if (token) {
      // Authorization 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 Unauthorized 에러 처리
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshToken = localStorage.getItem('refresh-token')
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`,
            { refreshToken }
          )
          
          if (refreshResponse.data.success) {
            const newAccessToken = refreshResponse.data.data.accessToken
            localStorage.setItem('access-token', newAccessToken)
            
            // 실패한 요청을 새 토큰으로 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError)
        // 로그인 페이지로 리다이렉트
        localStorage.removeItem('access-token')
        localStorage.removeItem('refresh-token')
        localStorage.removeItem('user')
        window.location.href = '/auth/signin'
      }
    }

    return Promise.reject(error)
  },
)

export default api