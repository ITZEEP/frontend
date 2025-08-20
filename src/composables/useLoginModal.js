import { ref } from 'vue'

// 전역 상태
const isLoginModalOpen = ref(false)
const redirectPath = ref(null)

export function useLoginModal() {
  const openLoginModal = (path = null) => {
    redirectPath.value = path
    isLoginModalOpen.value = true
  }

  const closeLoginModal = () => {
    isLoginModalOpen.value = false
    redirectPath.value = null
  }

  return {
    isLoginModalOpen,
    redirectPath,
    openLoginModal,
    closeLoginModal
  }
}