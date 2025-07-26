import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFraudStore = defineStore('fraud', () => {
  // OCR 분석 결과를 임시 저장
  const documentAnalysisData = ref(null)

  // 문서 분석 데이터 저장
  const setDocumentAnalysisData = (data) => {
    documentAnalysisData.value = {
      homeId: data.homeId,
      registryDocument: data.registryDocument,
      buildingDocument: data.buildingDocument,
      registryFileUrl: data.registryFileUrl,
      buildingFileUrl: data.buildingFileUrl,
      registryAnalysisStatus: data.registryAnalysisStatus,
      buildingAnalysisStatus: data.buildingAnalysisStatus,
      timestamp: Date.now() // 데이터 유효성 검증을 위한 타임스탬프
    }
  }

  // 문서 분석 데이터 가져오기
  const getDocumentAnalysisData = () => {
    // 데이터가 없거나 30분 이상 지난 경우 null 반환
    if (!documentAnalysisData.value) {
      return null
    }

    const now = Date.now()
    const dataAge = now - documentAnalysisData.value.timestamp
    const thirtyMinutes = 30 * 60 * 1000

    if (dataAge > thirtyMinutes) {
      clearDocumentAnalysisData()
      return null
    }

    return documentAnalysisData.value
  }

  // 문서 분석 데이터 삭제
  const clearDocumentAnalysisData = () => {
    documentAnalysisData.value = null
  }

  return {
    documentAnalysisData,
    setDocumentAnalysisData,
    getDocumentAnalysisData,
    clearDocumentAnalysisData
  }
})