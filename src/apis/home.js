import api from './index' // axios 인스턴스 import

const API_BASE_URL = '/listings' // baseURL + '/listings' 조합됨

// 1. 전체 매물 리스트 조회 (필터 옵션 포함 가능)
export async function fetchListings(params = {}) {
  const response = await api.get(API_BASE_URL, { params })
  return response.data
}

// 2. 단일 매물 상세 조회
export async function fetchListingById(id) {
  const response = await api.get(`${API_BASE_URL}/${id}`)
  return response.data
}

// 3. 매물 등록
export async function createListing(listingData) {
  const response = await api.post(API_BASE_URL, listingData)
  return response.data
}

// 4. 매물 수정
export async function updateListing(id, updatedData) {
  const response = await api.put(`${API_BASE_URL}/${id}`, updatedData)
  return response.data
}

// 5. 매물 삭제
export async function deleteListing(id) {
  const response = await api.delete(`${API_BASE_URL}/${id}`)
  return response.data
}
