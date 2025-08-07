import api from './index'

const API_BASE_URL = '/api/homes'

// 1. 전체 매물 리스트 조회 (필터 옵션 포함 가능)
export async function fetchListings(params = {}) {
  try {
    const response = await api.get(API_BASE_URL, { params })
    return response.data.data // 백엔드가 { success, data, ... } 형태라면 data만 반환
  } catch (error) {
    console.error('전체 매물 리스트 조회 실패', error)
    throw error
  }
}

// 2. 단일 매물 상세 조회
export async function fetchListingById(id) {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`)
    return response.data.data
  } catch (error) {
    console.error('단일 매물 상세 조회 실패', error)
    throw error
  }
}

// 3. 매물 등록 (이미지 포함 FormData)
export async function createListing(listingData) {
  try {
    const formData = new FormData()

    for (const key in listingData) {
      const value = listingData[key]

      if (Array.isArray(value)) {
        if (key === 'images') {
          value.forEach((file) => formData.append(key, file))
        } else {
          formData.append(key, JSON.stringify(value))
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    }

    const response = await api.post(API_BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data.data
  } catch (error) {
    console.error('매물 등록 실패', error)
    throw error
  }
}

// 4. 매물 수정 (JSON)
export async function updateListing(id, updatedData) {
  try {
    const response = await api.put(`${API_BASE_URL}/${id}`, updatedData, {
      headers: { 'Content-Type': 'application/json' },
    })

    return response.data.data
  } catch (error) {
    console.error('매물 수정 실패', error)
    throw error
  }
}

// 5. 매물 삭제
export async function deleteListing(id) {
  try {
    const response = await api.delete(`${API_BASE_URL}/${id}`)
    return response.data.data
  } catch (error) {
    console.error('매물 삭제 실패', error)
    throw error
  }
}
