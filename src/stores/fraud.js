import { defineStore } from 'pinia'
import { ref } from 'vue'

const DATA_EXPIRY_TIME = 30 * 60 * 1000 // 30분

export const useFraudStore = defineStore('fraud', () => {
  // State
  const documentAnalysisData = ref(null)
  const propertyInfo = ref(null)
  const externalAnalysisResult = ref(null)

  // 데이터 유효성 검증 헬퍼 함수
  const isDataValid = (data) => {
    if (!data || !data.timestamp) return false
    const now = Date.now()
    const dataAge = now - data.timestamp
    return dataAge <= DATA_EXPIRY_TIME
  }

  // OCR 분석 결과 관리
  const setDocumentAnalysisData = (data) => {
    documentAnalysisData.value = {
      ...data,
      timestamp: Date.now()
    }
  }

  const getDocumentAnalysisData = () => {
    if (!isDataValid(documentAnalysisData.value)) {
      clearDocumentAnalysisData()
      return null
    }
    return documentAnalysisData.value
  }

  const clearDocumentAnalysisData = () => {
    documentAnalysisData.value = null
  }

  // 서비스 외 매물 정보 관리
  const setPropertyInfo = (info) => {
    propertyInfo.value = {
      ...info,
      timestamp: Date.now()
    }
  }

  const getPropertyInfo = () => {
    if (!isDataValid(propertyInfo.value)) {
      clearPropertyInfo()
      return null
    }
    return propertyInfo.value
  }

  const clearPropertyInfo = () => {
    propertyInfo.value = null
  }

  // 서비스 외 매물 분석 결과 관리
  const setExternalAnalysisResult = (result) => {
    externalAnalysisResult.value = {
      ...result,
      timestamp: Date.now()
    }
  }

  const getExternalAnalysisResult = () => {
    if (!isDataValid(externalAnalysisResult.value)) {
      clearExternalAnalysisResult()
      return null
    }
    return externalAnalysisResult.value
  }

  const clearExternalAnalysisResult = () => {
    externalAnalysisResult.value = null
  }

  // 전체 데이터 초기화
  const clearAllData = () => {
    clearDocumentAnalysisData()
    clearPropertyInfo()
    clearExternalAnalysisResult()
  }

  return {
    // State
    documentAnalysisData,
    propertyInfo,
    externalAnalysisResult,
    
    // OCR 분석 결과
    setDocumentAnalysisData,
    getDocumentAnalysisData,
    clearDocumentAnalysisData,
    
    // 매물 정보
    setPropertyInfo,
    getPropertyInfo,
    clearPropertyInfo,
    
    // 서비스 외 매물 분석 결과
    setExternalAnalysisResult,
    getExternalAnalysisResult,
    clearExternalAnalysisResult,
    
    // 전체 관리
    clearAllData
  }
})