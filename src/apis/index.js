import axios from 'axios'

const instance = axios.create({
  timeout: 5000,
})

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - 로그인 필요 (추후 처리 예정)')
    }

    return Promise.reject(error)
  },
)

export default instance
