import { putRecentData, setStartPoint } from '@/apis/contractChatApi'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSpecialContractStore = defineStore('specialContract', () => {
  const currentOrder = ref(null)
  const orderStatusMap = ref({})
  const contractOrders = ref([])

  if (typeof window !== 'undefined') {
    const savedOrder = localStorage.getItem('currentOrder')
    if (savedOrder !== null) {
      currentOrder.value = parseInt(savedOrder)
    }
  }

  watch(currentOrder, (val) => {
    if (val !== null) {
      localStorage.setItem('currentOrder', String(val))
    }
  })

  const setOrder = (order) => {
    currentOrder.value = order
  }

  const setOrders = (orders) => {
    contractOrders.value = orders
  }
  const markOrderSuccess = (order) => {
    orderStatusMap.value[order] = 'SUCCESS'
  }

  const moveToNextOrder = async (chatId) => {
    const index = contractOrders.value.findIndex((c) => c.order === currentOrder.value)
    const next = contractOrders.value[index + 1]

    if (next) {
      const nextOrder = next.order
      await putRecentData(chatId, nextOrder)
      await setStartPoint(chatId)
      setOrder(nextOrder)
    } else {
      clearOrder()
    }
  }

  const clearOrder = () => {
    currentOrder.value = null
    localStorage.removeItem('currentOrder')
    contractOrders.value = []
    orderStatusMap.value = {}
  }

  const isOrderSuccessful = (order) => {
    return orderStatusMap.value[order] === 'SUCCESS'
  }

  const resetOrderStatus = () => {
    orderStatusMap.value = {}
  }

  return {
    currentOrder,
    contractOrders,
    orderStatusMap,
    setOrder,
    setOrders,
    clearOrder,
    markOrderSuccess,
    isOrderSuccessful,
    resetOrderStatus,
    moveToNextOrder,
  }
})
