<template>
  <div class="rounded-lg p-6">
    <h2 class="text-xl font-semibold text-center text-gray-800 mb-1">사기 위험도 분석 확인</h2>
    <p class="text-sm text-center text-gray-500 mb-5">선택하신 매물의 안전성을 확인해주세요</p>

    <!-- 상단 위험도 박스 -->
    <div
      :class="[
        'flex items-center rounded-md px-4 py-3 mb-8 justify-between',
        riskType === 'SAFE' && 'bg-green-100 text-green-800',
        riskType === 'WARN' && 'bg-yellow-100 text-yellow-800',
        riskType === 'DANGER' && 'bg-red-100 text-red-800',
      ]"
    >
      <div class="flex items-center space-x-3">
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
          <p class="font-bold">안전 등급</p>
          <p class="text-sm">사기 위험도: {{ riskLabel }}</p>
        </div>
      </div>
      <div class="text-right font-semibold text-base">
        {{ riskLabel }}
        <br />
        <span class="text-xs text-gray-500">2025.01.14 분석</span>
      </div>
    </div>

    <!-- 정보 박스 (세로 정렬, 번호 매김) -->
    <div class="space-y-4 mb-10">
      <div class="bg-white rounded-xl p-6 shadow text-gray-800">
        <p class="text-base font-bold mb-1">1. 건축 관련</p>
        <p class="text-sm whitespace-pre-wrap">{{ building }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow text-gray-800">
        <p class="text-base font-bold mb-1">2. 권리관계 정보</p>
        <p class="text-sm whitespace-pre-wrap">{{ ownership }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow text-gray-800">
        <p class="text-base font-bold mb-1">3. 기본 정보</p>
        <p class="text-sm whitespace-pre-wrap">{{ basic }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow text-gray-800">
        <p class="text-base font-bold mb-1">4. 법령 위험</p>
        <p class="text-sm whitespace-pre-wrap">{{ legal }}</p>
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

const riskType = ref('')
const riskLabel = computed(() => {
  if (riskType.value === 'SAFE') return '안전'
  if (riskType.value === 'WARN') return '주의'
  if (riskType.value === 'DANGER') return '위험'
  return '-'
})

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.params.contractChatId || route.params.id || route.query.id || null

onMounted(async () => {
  store.canProceed = true

  const raw = localStorage.getItem('home_id')
  store.setHomeId(raw)

  try {
    const { data } = await buyerApi.getTodayRiskCheckSummary(contractChatId)
    console.log('store.homeId:', store.homeId)
    if (data.hasAnalysis === true) {
      riskType.value = data.summary.riskType

      data.summary.detailGroups.forEach((group) => {
        console.log('전체 그룹 수:', data.summary.detailGroups.length)
        console.log('🌿 group.title:', group.title)

        const itemTexts = []
        group.items.forEach((item) => {
          const title = item.title || ''
          const content = item.content || ''
          itemTexts.push(`🔸 ${title}\n✅ ${content}`)
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
          default:
            console.log('❓ 예상 밖 group.title:', group.title)
        }
      })
    }
  } catch (error) {
    console.error('사기 위험도 조회 실패 ❌', error)
  }
})
</script>
