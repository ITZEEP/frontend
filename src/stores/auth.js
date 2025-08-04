import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, tokenUtils, userUtils } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const isLoading = ref(false)

  // 초기화
  const initialize = () => {
    accessToken.value = tokenUtils.getToken()
    user.value = userUtils.getUser()
  }

  // computed
  const isLoggedIn = computed(() => !!accessToken.value)
  const username = computed(() => user.value?.name || user.value?.username || '')

  // 카카오 로그인 URL 가져오기
  const getKakaoLoginUrl = async () => {
    try {
      const response = await authAPI.getKakaoLoginUrl()
      return response.data.data.loginUrl
    } catch (error) {
      console.error('Failed to get Kakao login URL:', error)
      throw error
    }
  }

  // 토큰과 사용자 정보로 로그인 처리
  const loginWithToken = async (token, userInfo) => {
    accessToken.value = token
    user.value = userInfo
    
    // 로컬 스토리지에 저장
    tokenUtils.setToken(token)
    userUtils.setUser(userInfo)
  }

  // OAuth 로그인 완료 처리
  const completeOAuthLogin = async (code) => {
    try {
      isLoading.value = true
      
      // authorization code를 사용해 토큰 교환
      const response = await authAPI.completeOAuth2Login(code)
      
      if (response.data.success) {
        const loginData = response.data.data
        const token = loginData.access_token
        const userInfo = {
          id: loginData.user_id,
          username: loginData.username,
          email: loginData.email,
          name: loginData.nickname || loginData.username,
          profileImage: loginData.profile_image,
          role: loginData.role,
          gender: loginData.gender
        }
        
        // 로그인 처리
        await loginWithToken(token, userInfo)
        
        return { success: true }
      } else {
        throw new Error(response.data.message || '로그인 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('OAuth login error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      isLoading.value = true
      
      // 서버에 로그아웃 요청 (선택적)
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('Server logout failed:', error)
      }
      
      // 로컬 상태 초기화
      accessToken.value = null
      user.value = null
      
      // 로컬 스토리지 초기화
      tokenUtils.removeToken()
      userUtils.removeUser()
    } finally {
      isLoading.value = false
    }
  }

  // 스토어 초기화
  initialize()

  return { 
    user,
    accessToken,
    isLoading,
    isLoggedIn,
    username,
    getKakaoLoginUrl,
    loginWithToken,
    completeOAuthLogin,
    logout,
    initialize
  }
})
