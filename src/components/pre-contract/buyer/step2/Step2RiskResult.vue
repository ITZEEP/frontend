<template>
  <div class="rounded-xl p-6 bg-white">
    <h2 class="text-xl font-semibold text-center text-gray-900 mb-1">사기 위험도 분석 확인</h2>
    <p class="text-sm text-center text-gray-500 mb-6">선택하신 매물의 안전성을 확인해주세요</p>

    <!-- 상단 위험도 박스 (최소 변경: 컬러 톤 다운 + 배지) -->
    <div
      class="flex items-center justify-between rounded-lg px-4 py-3 mb-8 border"
      :class="[
        riskType === 'SAFE' && 'border-green-200 bg-green-50',
        riskType === 'WARN' && 'border-yellow-200 bg-yellow-50',
        riskType === 'DANGER' && 'border-red-200 bg-red-50',
      ]"
    >
      <div class="flex items-center gap-3">
        <!-- 아이콘 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          :class="[
            riskType === 'SAFE' && 'text-green-600',
            riskType === 'WARN' && 'text-yellow-600',
            riskType === 'DANGER' && 'text-red-600',
          ]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
          />
        </svg>

        <div>
          <p class="text-xs text-gray-700">안전 등급</p>
          <div class="flex items-center gap-2">
            <p class="text-sm text-gray-800">사기 위험도:</p>
            <span
              class="px-2 py-0.5 text-xs font-semibold rounded-full"
              :class="[
                riskType === 'SAFE' && 'bg-green-100 text-green-700',
                riskType === 'WARN' && 'bg-yellow-100 text-yellow-800',
                riskType === 'DANGER' && 'bg-red-100 text-red-700',
              ]"
            >
              {{ riskLabel }}
            </span>
          </div>
        </div>
      </div>

      <div class="text-right">
        <p class="text-base font-semibold text-gray-900">{{ riskLabel }}</p>
        <p class="text-xs text-gray-500">{{ analysisDate }} 분석</p>
      </div>
    </div>

    <!-- 정보 박스 (그대로, 여백/줄간격만 정리) -->
    <div class="space-y-4 mb-2">
      <div class="bg-white rounded-lg p-5 border shadow-sm text-gray-800">
        <p class="text-base font-semibold mb-2">1. 건축 관련</p>
        <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ building }}</p>
      </div>

      <div class="bg-white rounded-lg p-5 border shadow-sm text-gray-800">
        <p class="text-base font-semibold mb-2">2. 권리관계 정보</p>
        <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ ownership }}</p>
      </div>

      <div class="bg-white rounded-lg p-5 border shadow-sm text-gray-800">
        <p class="text-base font-semibold mb-2">3. 기본 정보</p>
        <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ basic }}</p>
      </div>

      <div class="bg-white rounded-lg p-5 border shadow-sm text-gray-800">
        <p class="text-base font-semibold mb-2">4. 법령 위험</p>
        <p class="text-sm whitespace-pre-wrap leading-relaxed">{{ legal }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePreContractStore } from '@/stores/preContract'
import buyerApi from '@/apis/pre-contract-buyer'
import { useRoute } from 'vue-router'

const building = ref('')
const ownership = ref('')
const basic = ref('')
const legal = ref('')

const riskType = ref('') // SAFE | WARN | DANGER
const riskLabel = computed(() => {
  if (riskType.value === 'SAFE') return '안전'
  if (riskType.value === 'WARN') return '주의'
  if (riskType.value === 'DANGER') return '위험'
  return '-'
})

const analysisDate = computed(() =>
  new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
)

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.params.contractChatId || route.params.id || route.query.id || null

onMounted(async () => {
  store.canProceed = true
  const raw = localStorage.getItem('home_id')
  store.setHomeId(raw)

  try {
    const { data } = await buyerApi.getTodayRiskCheckSummary(contractChatId)
    if (data.hasAnalysis === true) {
      riskType.value = data.summary.riskType

      data.summary.detailGroups.forEach((group) => {
        const itemTexts = []
        group.items.forEach((item) => {
          const title = item.title || ''
          const content = item.content || ''
          itemTexts.push(`• ${title}\n  - ${content}`)
        })
        const joinedTexts = itemTexts.join('\n')

        switch (group.title) {
          case '권리관계 정보':
            ownership.value = joinedTexts
            break
          case '건축 관련':
            building.value = joinedTexts
            break
          case '기본 정보':
            basic.value = joinedTexts
            break
          case '법령 위험':
            legal.value = joinedTexts
            break
        }
      })
    }
  } catch (error) {
    console.error('사기 위험도 조회 실패 ❌', error)
  }
})
</script>
