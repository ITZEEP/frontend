import { ref } from 'vue'

// 전역 상태
const isConfirmModalOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmCallback = ref(null)
const cancelCallback = ref(null)

export function useConfirmModal() {
  const openConfirmModal = (options = {}) => {
    confirmTitle.value = options.title || '확인'
    confirmMessage.value = options.message || '계속하시겠습니까?'
    
    return new Promise((resolve) => {
      confirmCallback.value = () => {
        closeConfirmModal()
        if (options.onConfirm) options.onConfirm()
        resolve(true)
      }
      
      cancelCallback.value = () => {
        closeConfirmModal()
        if (options.onCancel) options.onCancel()
        resolve(false)
      }
      
      isConfirmModalOpen.value = true
    })
  }

  const closeConfirmModal = () => {
    isConfirmModalOpen.value = false
    confirmTitle.value = ''
    confirmMessage.value = ''
    confirmCallback.value = null
    cancelCallback.value = null
  }

  const handleConfirm = () => {
    if (confirmCallback.value) {
      confirmCallback.value()
    }
  }

  const handleCancel = () => {
    if (cancelCallback.value) {
      cancelCallback.value()
    }
  }

  return {
    isConfirmModalOpen,
    confirmTitle,
    confirmMessage,
    openConfirmModal,
    closeConfirmModal,
    handleConfirm,
    handleCancel
  }
}