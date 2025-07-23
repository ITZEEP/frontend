const API_BASE_URL = 'http://localhost:8080/api/chat'

function getAuthToken() {
  return localStorage.getItem('access-token')
}

function getHeaders() {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

export async function getOwnerChatRooms() {
  return apiRequest('/rooms/owner')
}

export async function getBuyerChatRooms() {
  return apiRequest('/rooms/buyer')
}

export async function getChatMessages(chatRoomId) {
  return apiRequest(`/messages/${chatRoomId}`)
}

export async function createChatRoom(propertyId) {
  return apiRequest('/rooms', {
    method: 'POST',
    body: JSON.stringify({ propertyId }),
  })
}
