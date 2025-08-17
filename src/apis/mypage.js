import api from './index'

const REQUEST_TIMEOUT = 30000

export const mypageAPI = {
  // 내 정보 조회
  getMyInfo: async () => {
    try {
      const response = await api.get('/api/mypage/info')
      return response.data
    } catch (error) {
      console.error('내 정보 조회 실패:', error)
      throw error
    }
  },

  // 프로필 이미지 수정
  updateProfileImage: async (profileImage) => {
    try {
      const formData = new FormData()
      formData.append('profileImage', profileImage)

      const response = await api.put('/api/mypage/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: REQUEST_TIMEOUT,
      })
      return response.data
    } catch (error) {
      console.error('프로필 이미지 수정 실패:', error)
      throw error
    }
  },

  // 닉네임 변경
  updateNickname: async (nickname) => {
    try {
      const response = await api.put('/api/mypage/nickname', { nickname })
      return response.data
    } catch (error) {
      console.error('닉네임 변경 실패:', error)
      throw error
    }
  },

  // 알림 설정 변경
  updateNotification: async (notificationEnabled) => {
    try {
      const response = await api.put('/api/mypage/notification', { notificationEnabled })
      return response.data
    } catch (error) {
      console.error('알림 설정 변경 실패:', error)
      throw error
    }
  },

  // 내 계약서 목록 조회
  getMyContracts: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/mypage/contracts', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      console.error('내 계약서 목록 조회 실패:', error)
      throw error
    }
  },

  // 내 매물 목록 조회
  getMyProperties: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/mypage/properties', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      console.error('내 매물 목록 조회 실패:', error)
      throw error
    }
  },

  // 내 사기위험도 분석 이력 조회
  getMyRiskAnalyses: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/mypage/risk-analyses', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      console.error('내 사기위험도 분석 이력 조회 실패:', error)
      throw error
    }
  },

  // 아래는 추가적으로 필요할 수 있는 API들입니다
  
  // 요약 정보 조회 (대시보드용)
  getSummary: async () => {
    try {
      const response = await api.get('/api/mypage/summary')
      return response.data
    } catch (error) {
      console.error('요약 정보 조회 실패:', error)
      throw error
    }
  },

  // 최근 활동 조회
  getRecentActivities: async () => {
    try {
      const response = await api.get('/api/mypage/recent-activities')
      return response.data
    } catch (error) {
      console.error('최근 활동 조회 실패:', error)
      throw error
    }
  },

  // 프로필 전체 업데이트
  updateProfile: async (formData) => {
    try {
      const response = await api.put('/api/mypage/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: REQUEST_TIMEOUT,
      })
      return response.data
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      throw error
    }
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/api/mypage/password', passwordData)
      return response.data
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      throw error
    }
  },

  // 계약서 삭제
  deleteContract: async (contractId) => {
    try {
      const response = await api.delete(`/api/mypage/contracts/${contractId}`)
      return response.data
    } catch (error) {
      console.error('계약서 삭제 실패:', error)
      throw error
    }
  },

  // 매물 삭제
  deleteProperty: async (propertyId) => {
    try {
      const response = await api.delete(`/api/mypage/properties/${propertyId}`)
      return response.data
    } catch (error) {
      console.error('매물 삭제 실패:', error)
      throw error
    }
  },

  // 사기 위험도 분석 삭제
  deleteFraudAnalysis: async (analysisId) => {
    try {
      const response = await api.delete(`/api/mypage/risk-analyses/${analysisId}`)
      return response.data
    } catch (error) {
      console.error('사기 위험도 분석 삭제 실패:', error)
      throw error
    }
  },

  // 분석 리포트 다운로드
  downloadAnalysisReport: async (analysisId) => {
    try {
      const response = await api.get(`/api/mypage/risk-analyses/${analysisId}/download`, {
        responseType: 'blob',
      })
      return response
    } catch (error) {
      console.error('분석 리포트 다운로드 실패:', error)
      throw error
    }
  },

  // 회원 탈퇴
  deleteAccount: async (reason) => {
    try {
      const response = await api.delete('/api/mypage/account', {
        data: { reason },
      })
      return response.data
    } catch (error) {
      console.error('회원 탈퇴 실패:', error)
      throw error
    }
  },
}

export default mypageAPI