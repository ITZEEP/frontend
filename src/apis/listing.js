// api/listing.js

import api from './index'

const API_BASE_URL = '/api/homes'

// 1. 전체 매물 리스트 조회 및 검색 (필터 옵션 포함)
export async function fetchListings(params = {}) {
  try {
    const response = await api.get(API_BASE_URL, { params })
    console.log('매물 목록 조회/검색 응답:', response.data)

    // API 응답 구조에 맞게 `response.data.data`를 반환하도록 수정
    return response.data.data
  } catch (error) {
    console.error('매물 리스트 조회/검색 실패', error)
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

    // FormData에 데이터를 추가하는 로직 개선
    for (const key in listingData) {
      const value = listingData[key]

      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file) => formData.append(key, file))
      } else if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          // 배열은 JSON.stringify로 변환하여 전송
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
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
