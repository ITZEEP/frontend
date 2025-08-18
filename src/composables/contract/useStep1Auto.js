import { watch, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AI_SENDER } from '@/config/chat/aiUiRegistry'
import { contractApi } from '@/apis/contractApi'

export function useStep1Auto({
  chatId,
  apiMessages,
  hookMessages,
  isOwner,
  runApiBy = 'tenant',
  hookIsReady,
}) {
  const router = useRouter()
  const route = useRoute()

  const roleResolved = computed(() => typeof isOwner?.value === 'boolean')
  const iAmOwner = computed(() => !!isOwner?.value)
  const isApiRunner = computed(() => (runApiBy === 'owner' ? iAmOwner.value : !iAmOwner.value))

  const startedKey = computed(() => (chatId?.value ? `step1_started_${chatId.value}` : ''))
  const isStarted = () => startedKey.value && localStorage.getItem(startedKey.value) === '1'
  const markStarted = () => startedKey.value && localStorage.setItem(startedKey.value, '1')

  const lastSeenForApiKey = computed(() => (chatId?.value ? `step1_last_api_${chatId.value}` : ''))
  const getLastSeenApi = () =>
    lastSeenForApiKey.value && sessionStorage.getItem(lastSeenForApiKey.value)
  const setLastSeenApi = (k) =>
    lastSeenForApiKey.value && sessionStorage.setItem(lastSeenForApiKey.value, k)

  const inflight = ref(false)

  const latest = computed(() => {
    const a = apiMessages?.value || []
    const b = hookMessages?.value || []
    return [...a, ...b].at(-1)
  })

  watch(
    [latest, chatId, roleResolved, hookIsReady],
    async () => {
      const id = chatId?.value
      const msg = latest.value
      if (!id || !msg) return
      if (hookIsReady && hookIsReady.value === false) return
      if (!roleResolved.value) return

      const fromAi = String(msg.senderId) === String(AI_SENDER.PLAIN) // '9999'
      const text = String(msg.content || '')
      if (!fromAi || !text.includes('임대인께서 입장하셨습니다')) return

      // 1) UI: 양쪽 모두 step=1
      if (route.query.step !== '1') {
        router.replace({ query: { step: '1' } })
      }

      // 2) API 호출은 지정 주체만(기본 임차인)
      if (!isApiRunner.value) return
      if (isStarted()) return

      const apiKey = `${msg.senderId}|${msg.sendTime || msg.id || ''}`
      if (getLastSeenApi() === apiKey) return

      if (inflight.value) return
      inflight.value = true

      try {
        setLastSeenApi(apiKey)
        const res = await contractApi.postStartStep1(String(id))
        if (res?.success) {
          markStarted()
        }
      } catch (e) {
        console.error('[useStep1Auto] postStartStep1 실패:', e)
      } finally {
        inflight.value = false
      }
    },
    { immediate: true },
  )
}
