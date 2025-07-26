import api from './axiosConfig'

// 사기 위험도 API
export const fraudApi = {
  // 위험도 체크 목록 조회
  getRiskCheckList: async (page = 1, size = 10) => {
    try {
      const response = await api.get('/api/fraud-risk', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      console.error('위험도 체크 목록 조회 실패:', error)
      throw error
    }
  },

  // PDF 문서 분석 (OCR)
  analyzeDocuments: async (registryFile, buildingFile, homeId) => {
    try {
      const formData = new FormData()
      formData.append('registryFile', registryFile)
      formData.append('buildingFile', buildingFile)
      formData.append('homeId', homeId)

      const response = await api.post('/api/fraud-risk/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30초 타임아웃 (OCR 처리 시간 고려)
      })
      return response.data
    } catch (error) {
      console.error('문서 분석 실패:', error)
      throw error
    }
  },

  // 위험도 분석
  analyzeRisk: async (analysisData) => {
    try {
      const response = await api.post('/api/fraud-risk/analyze', analysisData, {
        timeout: 30000, // 30초 타임아웃 (AI 분석 시간 고려)
      })
      return response.data
    } catch (error) {
      console.error('위험도 분석 실패:', error)
      throw error
    }
  },

  // 위험도 체크 상세 조회
  getRiskCheckDetail: async (riskCheckId) => {
    try {
      const response = await api.get(`/api/fraud-risk/${riskCheckId}`)
      return response.data
    } catch (error) {
      console.error('위험도 체크 상세 조회 실패:', error)
      throw error
    }
  },

  // 위험도 체크 삭제
  deleteRiskCheck: async (riskCheckId) => {
    try {
      const response = await api.delete(`/api/fraud-risk/${riskCheckId}`)
      return response.data
    } catch (error) {
      console.error('위험도 체크 삭제 실패:', error)
      throw error
    }
  },

  // 찜한 매물 목록 조회
  getLikedHomes: async () => {
    try {
      const response = await api.get('/api/fraud-risk/liked-homes')
      return response.data
    } catch (error) {
      console.error('찜한 매물 목록 조회 실패:', error)
      throw error
    }
  },

  // 채팅 중인 매물 목록 조회 (구매자로서)
  getChattingHomes: async (page = 1, size = 10) => {
    try {
      const response = await api.get('/api/fraud-risk/chatting-homes', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      console.error('채팅 중인 매물 목록 조회 실패:', error)
      throw error
    }
  },
}

export default fraudApi
