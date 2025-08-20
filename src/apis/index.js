import axios from 'axios'
import { useLoginModal } from '@/composables/useLoginModal'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 모든 요청에 토큰 추가
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기 (두 가지 키 모두 확인)
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')

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
    const router = window.$router // 라우터 인스턴스는 main.js에서 설정

    // 에러 응답이 없는 경우 (네트워크 에러 등)
    if (!error.response) {
      console.error('네트워크 에러:', error.message)
      return Promise.reject(error)
    }

    const status = error.response.status

    // 401 Unauthorized 에러 처리
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 토큰이 없는 경우 바로 로그인 모달 표시
      const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
      if (!currentToken) {
        console.error('인증 토큰이 없습니다.')
        const { openLoginModal } = useLoginModal()
        const currentPath = router?.currentRoute.value.fullPath || window.location.pathname
        openLoginModal(currentPath)
        return Promise.reject(error)
      }

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh-token')
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`,
            { refreshToken },
          )

          if (refreshResponse.data.success) {
            const newAccessToken = refreshResponse.data.data.accessToken
            localStorage.setItem('accessToken', newAccessToken)
            localStorage.setItem('access-token', newAccessToken) // 호환성 유지

            // 실패한 요청을 새 토큰으로 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError)
      }
      
      // 토큰 갱신 실패 또는 리프레시 토큰이 없는 경우
      localStorage.removeItem('accessToken')
      localStorage.removeItem('access-token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refresh-token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('user')
      
      // 로그인 모달 표시
      const { openLoginModal } = useLoginModal()
      const currentPath = router?.currentRoute.value.fullPath || window.location.pathname
      openLoginModal(currentPath)
    }

    // 현재 경로 확인 (ContractCompletePage에서는 페이지 이동 대신 에러 전달)
    const currentPath = router?.currentRoute.value.path || window.location.pathname
    const isContractCompletePage = currentPath.includes('/contract/') && currentPath.includes('/complete')

    // 404 Not Found
    if (status === 404) {
      console.error('404 에러:', error.response.data)
      if (!isContractCompletePage && router && router.currentRoute.value.name !== 'not-found') {
        router.push({ name: 'not-found' })
      }
      if (isContractCompletePage) {
        return Promise.reject(error)
      }
    }

    // 403 Forbidden
    if (status === 403) {
      console.error('403 권한 없음:', error.response.data)
      if (!isContractCompletePage && router) {
        router.push({ name: 'unauthorized' })
      }
      if (isContractCompletePage) {
        return Promise.reject(error)
      }
    }

    // 500 Server Error
    if (status >= 500) {
      console.error('서버 에러:', error.response.data)
      if (!isContractCompletePage && router && router.currentRoute.value.name !== 'server-error') {
        router.push({ name: 'server-error' })
      }
      if (isContractCompletePage) {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default api
