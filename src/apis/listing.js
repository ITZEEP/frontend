// src/apis/listing.js
import api from './index' // axios 인스턴스 import

export const fetchListingById = async (id) => {
  const response = await api.get(`/listings/${id}`)
  return response.data
}

export const updateListing = async (id, payload) => {
  const response = await api.put(`/listings/${id}`, payload)
  return response.data
}

export const fetchListings = async () => {
  const response = await api.get('/listings')
  return response.data
}

export const createListing = async (listingData) => {
  const response = await api.post('/listings', listingData)
  return response.data
}
