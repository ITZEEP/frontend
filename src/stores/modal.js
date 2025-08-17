import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const currentModalComponent = ref(null)
  const modalProps = ref({})

  function open(component, props = {}) {
    currentModalComponent.value = component
    modalProps.value = props
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    currentModalComponent.value = null
    modalProps.value = {}
  }

  return {
    isOpen,
    currentModalComponent,
    modalProps,
    open,
    close,
  }
})
