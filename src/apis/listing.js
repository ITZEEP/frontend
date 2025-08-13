import api from './index'
import axios from 'axios'

const API_BASE_URL = '/api/homes'

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

export async function fetchListings(params = {}) {
  try {
    const response = await api.get(API_BASE_URL, { params })
    return response.data.data
  } catch (error) {
    console.error('매물 리스트 조회/검색 실패', error)
    throw error
  }
}

export async function fetchListingById(id) {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`)
    return response.data.data
  } catch (error) {
    console.error('단일 매물 상세 조회 실패', error)
    throw error
  }
}

export async function createListing(listingData, images) {
  try {
    const formData = new FormData()

    for (const key in listingData) {
      if (Object.prototype.hasOwnProperty.call(listingData, key)) {
        const value = listingData[key]

        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(key, item)
          })
        } else if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      }
    }

    images.forEach((image) => {
      formData.append('images', image)
    })

    const response = await api.post(API_BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.data
  } catch (error) {
    console.error('매물 등록 실패', error)
    throw error
  }
}

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

export async function deleteListing(id) {
  try {
    const response = await api.delete(`${API_BASE_URL}/${id}`)
    return response.data.data
  } catch (error) {
    console.error('매물 삭제 실패', error)
    throw error
  }
}

export async function toggleHomeLike(homeId) {
  try {
    const response = await api.post(`${API_BASE_URL}/${homeId}/like`)
    return response.data
  } catch (error) {
    console.error(`매물 ID ${homeId} 찜하기/취소 실패`, error)
    throw error
  }
}
