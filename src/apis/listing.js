import api from './index'
import axios from 'axios'

const API_BASE_URL = '/api/homes'

// S3 Presigned URL을 요청하고 파일을 업로드하는 함수
async function uploadImageToS3(file) {
  try {
    const presignedUrlResponse = await api.post('/api/s3-presigned-url', {
      fileName: file.name,
      fileType: file.type,
    })
    const { url, key } = presignedUrlResponse.data.data

    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    })

    return `https://your-s3-bucket-name.s3.ap-northeast-2.amazonaws.com/${key}`
  } catch (error) {
    console.error('S3 이미지 업로드 실패', error)
    throw error
  }
}

// 1. 전체 매물 리스트 조회 및 검색 (필터 옵션 포함)
export async function fetchListings(params = {}) {
  try {
    const response = await api.get(API_BASE_URL, { params })
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

// 3. 매물 등록 (S3 업로드 후 JSON 전송)
export async function createListing(listingData, images) {
  try {
    const imageUrls = images ? await Promise.all(images.map((file) => uploadImageToS3(file))) : []

    const finalListingData = {
      ...listingData,
      imageUrls: imageUrls,
    }

    const response = await api.post(API_BASE_URL, finalListingData, {
      headers: { 'Content-Type': 'application/json' },
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

// 6. 찜하기/취소 API 함수 추가
export async function toggleHomeLike(homeId) {
  try {
    // 백엔드 API 명세에 따라 POST 요청 사용
    const response = await api.post(`${API_BASE_URL}/${homeId}/like`)
    return response.data
  } catch (error) {
    console.error(`매물 ID ${homeId} 찜하기/취소 실패`, error)
    throw error
  }
}
