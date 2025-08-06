import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mypageAPI } from '@/apis/mypage'

export const useMyPageStore = defineStore('mypage', () => {
  // 상태
  const summary = ref({
    contractCount: 0,
    propertyCount: 0,
    analysisCount: 0,
  })
  const recentActivities = ref([])
  const contracts = ref([])
  const properties = ref([])
  const fraudAnalyses = ref([])

  // 마이페이지 요약 정보 로드
  const loadSummary = async () => {
    try {
      const response = await mypageAPI.getSummary()
      if (response.data.success) {
        summary.value = response.data.data
      }
    } catch (error) {
      console.error('Load summary error:', error)
      throw error
    }
  }

  // 최근 활동 로드
  const loadRecentActivities = async () => {
    try {
      const response = await mypageAPI.getRecentActivities()
      if (response.data.success) {
        recentActivities.value = response.data.data
      }
    } catch (error) {
      console.error('Load recent activities error:', error)
      throw error
    }
  }

  // 계약서 목록 로드
  const loadContracts = async () => {
    try {
      const response = await mypageAPI.getContracts()
      if (response.data.success) {
        contracts.value = response.data.data
      }
    } catch (error) {
      console.error('Load contracts error:', error)
      throw error
    }
  }

  // 매물 목록 로드
  const loadProperties = async () => {
    try {
      const response = await mypageAPI.getProperties()
      if (response.data.success) {
        properties.value = response.data.data
      }
    } catch (error) {
      console.error('Load properties error:', error)
      throw error
    }
  }

  // 사기 위험도 분석 목록 로드
  const loadFraudAnalyses = async () => {
    try {
      const response = await mypageAPI.getFraudAnalyses()
      if (response.data.success) {
        fraudAnalyses.value = response.data.data
      }
    } catch (error) {
      console.error('Load fraud analyses error:', error)
      throw error
    }
  }

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    try {
      const formData = new FormData()
      
      // 기본 정보
      if (profileData.name) formData.append('name', profileData.name)
      if (profileData.phone) formData.append('phone', profileData.phone)
      if (profileData.gender) formData.append('gender', profileData.gender)
      
      // 프로필 이미지
      if (profileData.profileImage instanceof File) {
        formData.append('profileImage', profileData.profileImage)
      }

      const response = await mypageAPI.updateProfile(formData)
      if (response.data.success) {
        // 업데이트된 사용자 정보 반환
        return response.data.data
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // 비밀번호 변경
  const changePassword = async (passwordData) => {
    try {
      const response = await mypageAPI.changePassword(passwordData)
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  }

  // 계약서 삭제
  const deleteContract = async (contractId) => {
    try {
      const response = await mypageAPI.deleteContract(contractId)
      if (response.data.success) {
        // 목록에서 제거
        contracts.value = contracts.value.filter((c) => c.id !== contractId)
        summary.value.contractCount--
      }
    } catch (error) {
      console.error('Delete contract error:', error)
      throw error
    }
  }

  // 매물 삭제
  const deleteProperty = async (propertyId) => {
    try {
      const response = await mypageAPI.deleteProperty(propertyId)
      if (response.data.success) {
        // 목록에서 제거
        properties.value = properties.value.filter((p) => p.id !== propertyId)
        summary.value.propertyCount--
      }
    } catch (error) {
      console.error('Delete property error:', error)
      throw error
    }
  }

  // 사기 위험도 분석 삭제
  const deleteFraudAnalysis = async (analysisId) => {
    try {
      const response = await mypageAPI.deleteFraudAnalysis(analysisId)
      if (response.data.success) {
        // 목록에서 제거
        fraudAnalyses.value = fraudAnalyses.value.filter((a) => a.id !== analysisId)
        summary.value.analysisCount--
      }
    } catch (error) {
      console.error('Delete fraud analysis error:', error)
      throw error
    }
  }

  // 분석 리포트 다운로드
  const downloadAnalysisReport = async (analysisId) => {
    try {
      const response = await mypageAPI.downloadAnalysisReport(analysisId)
      // Blob 처리 및 다운로드
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fraud-analysis-${analysisId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download report error:', error)
      throw error
    }
  }

  return {
    // 상태
    summary,
    recentActivities,
    contracts,
    properties,
    fraudAnalyses,

    // 액션
    loadSummary,
    loadRecentActivities,
    loadContracts,
    loadProperties,
    loadFraudAnalyses,
    updateProfile,
    changePassword,
    deleteContract,
    deleteProperty,
    deleteFraudAnalysis,
    downloadAnalysisReport,
  }
})