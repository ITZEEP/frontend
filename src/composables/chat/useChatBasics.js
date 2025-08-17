// roomId/유저/계약정보 로드 + 상대방ID 계산
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCurrentUser } from '@/apis/chatApi'
import { getContractInfo } from '@/apis/contractChatApi'

export function useChatBasics(contractChatIdProp) {
  const route = useRoute()

  const urlContractChatId = computed(() => route.params.contractChatId || route.params.id || null)
  const actualContractChatId = computed(() => {
    if (contractChatIdProp) return String(contractChatIdProp)
    if (urlContractChatId.value) return String(urlContractChatId.value)
    const parts = window.location.pathname.split('/')
    const i = parts.findIndex((p) => p === 'contract')
    return i !== -1 && parts[i + 1] ? String(parts[i + 1]) : null
  })

  const currentUserId = ref('')
  const contractData = ref({})
  const isOwner = computed(() => (contractData.value?.role || '').includes('임대인'))

  const loadUserInfo = async () => {
    try {
      const res = await getCurrentUser()
      if (res?.success && res.data?.userId) currentUserId.value = String(res.data.userId)
    } catch (e) {
      console.error('[useChatBasics] loadUserInfo 실패:', e)
    }
  }

  const loadContractInfo = async () => {
    try {
      if (!actualContractChatId.value) return
      const res = await getContractInfo(actualContractChatId.value)
      if (res?.success && res.data) contractData.value = res.data
    } catch (e) {
      console.error('[useChatBasics] loadContractInfo 실패:', e)
    }
  }

  const contractReceiverId = computed(() => {
    const { ownerId, buyerId } = contractData.value || {}
    const me = currentUserId.value
    if (!me || !ownerId || !buyerId) return null
    if (String(me) === String(ownerId)) return String(buyerId)
    if (String(me) === String(buyerId)) return String(ownerId)
    return null
  })

  return {
    actualContractChatId,
    currentUserId,
    contractData,
    isOwner,
    contractReceiverId,
    loadUserInfo,
    loadContractInfo,
  }
}
