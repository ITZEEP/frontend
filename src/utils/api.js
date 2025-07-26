import axios from 'axios'

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('access-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 토큰 갱신 로직 (필요시 구현)
        // const newToken = await refreshToken()
        // localStorage.setItem('access-token', newToken)
        // originalRequest.headers.Authorization = `Bearer ${newToken}`
        // return api(originalRequest)
      } catch (refreshError) {
        // 갱신 실패시 로그인 페이지로 이동
        localStorage.removeItem('access-token')
        localStorage.removeItem('user')
        window.location.href = '/auth/signin'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api