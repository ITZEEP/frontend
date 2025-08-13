// step=3 일 때만 round<->URL 동기화
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpecialContractStore } from '@/stores/useContractTermStore'

export function useRoundQuerySync(stepFromProps) {
  const route = useRoute()
  const router = useRouter()
  const store = useSpecialContractStore()

  const step = computed(() => Number(stepFromProps ?? route.query.step ?? 3))
  const roundFromQuery = computed(() => {
    const r = Number(route.query.round)
    return Number.isNaN(r) ? undefined : r
  })

  const replaceQuery = (next = {}) => {
    router.replace({ query: { ...route.query, ...next } })
  }

  const ensureInitialRound = () => {
    if (Number(step.value) !== 3) {
      store.setRound(0) // step≠3이면 라운드 0
      return
    }
    if (roundFromQuery.value !== undefined) {
      store.setRound(roundFromQuery.value) // URL round 우선
    } else {
      // URL에 없으면 store.currentRound(기본 0) 반영
      replaceQuery({ round: store.currentRound ?? 0 })
    }
  }

  onMounted(ensureInitialRound)

  // store.currentRound → URL(round)
  watch(
    () => store.currentRound,
    (r) => {
      if (Number(step.value) === 3) replaceQuery({ round: r })
    },
  )

  // 필요 시 외부에서 강제로 round를 특정 값으로 설정하고 URL에 반영
  const setRoundInUrl = (r) => {
    store.setRound(r)
    if (Number(step.value) === 3) replaceQuery({ round: r })
  }

  return { setRoundInUrl }
}
