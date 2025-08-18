import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpecialContractStore } from '@/stores/useContractTermStore'

export function useRoundQuerySync(stepFromProps) {
  const route = useRoute()
  const router = useRouter()
  const store = useSpecialContractStore()

  const step = computed(() => {
    if (stepFromProps != null) return Number(stepFromProps)
    const qs = route.query.step
    return qs != null ? Number(qs) : null
  })

  const roundFromQuery = computed(() => {
    const r = Number(route.query.round)
    return Number.isNaN(r) ? undefined : r
  })

  const replaceQuery = (next = {}) => {
    router.replace({ query: next })
  }

  const ensureInitialRound = () => {
    if (step.value !== 3) {
      store.setRound(0)
      return
    }
    if (roundFromQuery.value !== undefined) {
      store.setRound(roundFromQuery.value)
    } else {
      replaceQuery({ step: '3', round: store.currentRound ?? 0 })
    }
  }

  onMounted(ensureInitialRound)

  // store.currentRound → URL(round)
  watch(
    () => store.currentRound,
    (r) => {
      if (step.value === 3) replaceQuery({ step: '3', round: r })
    },
  )

  const setRoundInUrl = (r) => {
    store.setRound(r)
    if (step.value === 3) replaceQuery({ step: '3', round: r })
  }

  const gotoStep4 = () => {
    localStorage.removeItem('specialContract_allCompleted')
    router.replace({ query: { step: '4' } })
  }

  return { setRoundInUrl, gotoStep4 }
}
