// 사기 위험도 분석 에러 코드 매핑
export const FRAUD_ERROR_CODES = {
  // 기본 에러
  FRAUD_001: {
    title: '입력 오류',
    message: '잘못된 입력값입니다.\n\n입력한 정보를 다시 확인해주세요.',
    type: 'validation_error',
    status: 400
  },
  
  // 사기 위험도 분석 관련 에러
  FRAUD_002: {
    title: '분석 실패',
    message: '사기 위험도 분석에 실패했습니다.\n\n잠시 후 다시 시도해주세요.',
    type: 'server_error',
    status: 500
  },
  FRAUD_003: {
    title: '계산 오류',
    message: '위험도 계산 중 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요.',
    type: 'server_error',
    status: 500
  },
  FRAUD_004: {
    title: '문서 형식 오류',
    message: '유효하지 않은 문서 형식입니다.\n\nPDF 파일만 업로드 가능합니다.',
    type: 'file_error',
    status: 400
  },
  FRAUD_005: {
    title: '문서 처리 실패',
    message: '문서 처리에 실패했습니다.\n\n파일이 손상되지 않았는지 확인해주세요.',
    type: 'server_error',
    status: 500
  },
  
  // 사기 검증 관련 에러
  FRAUD_006: {
    title: '결과 없음',
    message: '위험도 체크 결과를 찾을 수 없습니다.',
    type: 'not_found_error',
    status: 404
  },
  FRAUD_007: {
    title: '중복 검증',
    message: '이미 진행 중인 사기 검증이 있습니다.\n\n이전 검증이 완료된 후 시도해주세요.',
    type: 'conflict_error',
    status: 409
  },
  FRAUD_008: {
    title: '권한 없음',
    message: '해당 위험도 체크 결과에 대한 권한이 없습니다.',
    type: 'access_error',
    status: 403
  },
  
  // OCR 및 문서 분석 관련 에러
  FRAUD_009: {
    title: 'OCR 처리 실패',
    message: 'OCR 처리에 실패했습니다.\n\n문서의 텍스트가 명확한지 확인해주세요.',
    type: 'server_error',
    status: 500
  },
  FRAUD_010: {
    title: '문서 없음',
    message: '문서를 찾을 수 없습니다.',
    type: 'not_found_error',
    status: 404
  },
  FRAUD_011: {
    title: '지원하지 않는 문서',
    message: '지원하지 않는 문서 형식입니다.\n\n등기부등본 또는 건축물대장 PDF만 가능합니다.',
    type: 'file_error',
    status: 400
  },
  
  // AI 분석 관련 에러
  FRAUD_012: {
    title: 'AI 서비스 오류',
    message: 'AI 분석 서비스를 사용할 수 없습니다.\n\n잠시 후 다시 시도해주세요.',
    type: 'server_error',
    status: 503
  },
  FRAUD_013: {
    title: '분석 시간 초과',
    message: 'AI 분석 처리 시간이 초과되었습니다.\n\n문서 크기를 확인하고 다시 시도해주세요.',
    type: 'timeout_error',
    status: 408
  },
  
  // 데이터 검증 관련 에러
  FRAUD_014: {
    title: '계약 데이터 오류',
    message: '유효하지 않은 계약 데이터입니다.',
    type: 'validation_error',
    status: 400
  },
  FRAUD_015: {
    title: '필수 정보 누락',
    message: '필수 정보가 누락되었습니다.\n\n모든 필수 항목을 입력해주세요.',
    type: 'validation_error',
    status: 400
  },
  FRAUD_016: {
    title: '데이터 일관성 오류',
    message: '데이터 일관성 오류가 발생했습니다.\n\n입력한 정보를 다시 확인해주세요.',
    type: 'conflict_error',
    status: 409
  }
}

// 에러 응답에서 에러 코드 추출
export function extractErrorCode(error) {
  if (!error.response?.data) return null
  
  const data = error.response.data
  
  // 에러 코드가 직접 있는 경우
  if (data.errorCode) return data.errorCode
  
  // code 필드에 있는 경우
  if (data.code) return data.code
  
  // message에서 에러 코드 패턴 찾기 (예: "FRAUD_001: ...")
  if (data.message) {
    const match = data.message.match(/^(FRAUD_\d{3})/)
    if (match) return match[1]
  }
  
  return null
}

// 에러 코드로 에러 정보 가져오기
export function getErrorInfo(errorCode) {
  const errorInfo = FRAUD_ERROR_CODES[errorCode]
  if (errorInfo) {
    return errorInfo
  }
  
  // 알 수 없는 에러 코드인 경우 기본값 반환
  return {
    title: '오류 발생',
    message: errorCode ? `알 수 없는 오류가 발생했습니다. (${errorCode})` : '알 수 없는 오류가 발생했습니다.',
    type: 'unknown_error',
    status: 500
  }
}

// HTTP 상태 코드로 에러 타입 결정
export function getErrorTypeByStatus(status) {
  if (status >= 400 && status < 500) {
    if (status === 404) return 'not_found_error'
    if (status === 403) return 'access_error'
    if (status === 409) return 'conflict_error'
    if (status === 408) return 'timeout_error'
    return 'validation_error'
  }
  
  if (status >= 500) {
    if (status === 503) return 'network_error'
    return 'server_error'
  }
  
  return 'unknown_error'
}