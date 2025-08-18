<template>
  <div
    v-if="loading"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
      <!-- 헤더 -->
      <div class="text-center mb-6">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
        >
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800">{{ title }}</h2>
        <p class="text-sm text-gray-600 mt-2">잠시만 기다려주세요!</p>
      </div>

      <!-- 꿀팁 콘텐츠 -->
      <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 mb-6">
        <div class="flex items-start space-x-3">
          <span class="text-2xl">💡</span>
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">계약 꿀팁</h3>
            <p class="text-sm text-gray-700 leading-relaxed">{{ currentTip }}</p>
          </div>
        </div>
      </div>

      <!-- 추가 정보 -->
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <p class="text-xs text-blue-700 text-center">
          <span class="font-semibold">알고 계셨나요?</span><br />
          AI가 양측의 의견을 균형있게 반영하여 공정한 특약을 만들고 있어요
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'AI가 특약을 개선하고 있어요',
  },
  subMessage: {
    type: String,
    default: '특약 개선 중...',
  },
  onClose: {
    type: Function,
    default: () => {},
  },
})

// 계약 관련 꿀팁 목록
const tips = [
  '특약은 계약서의 핵심! 꼼꼼히 읽고 이해가 안 되는 부분은 꼭 질문하세요.',
  '보증금은 계약 종료 후 14일 이내에 반환받아야 합니다. 지연 시 연 5% 이자를 요구할 수 있어요.',
  '월세 인상은 연 5%를 초과할 수 없습니다. 과도한 인상 요구는 거절하세요!',
  '수리 의무는 명확히 구분하세요. 소모품은 임차인, 구조적 문제는 임대인 책임입니다.',
  '계약 전 집 상태를 사진으로 꼼꼼히 기록해두면 퇴실 시 분쟁을 예방할 수 있어요.',
  '중개수수료는 법정 요율이 정해져 있습니다. 과도한 수수료 요구는 불법이에요!',
  '전입신고는 입주 후 14일 이내에 하세요. 주택임대차보호법의 보호를 받을 수 있습니다.',
  '확정일자를 받으면 보증금 우선변제권을 얻을 수 있어요. 꼭 받으세요!',
  '계약서는 3부 작성이 원칙! 임대인, 임차인, 공인중개사가 각각 보관합니다.',
  '특약 사항은 법적 효력이 있습니다. 불리한 내용이 없는지 신중히 검토하세요.',
  '임대차 계약은 2년이 기본! 1년 계약을 해도 2년간 거주할 권리가 있어요.',
  '보증보험 가입을 고려해보세요. 보증금을 안전하게 보호받을 수 있습니다.',
  '계약 갱신 요구권은 1회 보장됩니다. 최대 4년간 거주가 가능해요!',
  '등기부등본으로 집주인 확인은 필수! 근저당 설정 여부도 꼭 확인하세요.',
  '반려동물 조항은 명확히 하세요. 나중에 분쟁의 소지가 될 수 있습니다.',
]

const currentTip = ref('')
const progress = ref(0)
let tipInterval = null
let progressInterval = null

onMounted(() => {
  // 초기 팁 설정
  currentTip.value = tips[Math.floor(Math.random() * tips.length)]

  // 5초마다 팁 변경
  tipInterval = setInterval(() => {
    const newTip = tips[Math.floor(Math.random() * tips.length)]
    // 같은 팁이 연속으로 나오지 않도록
    if (newTip !== currentTip.value) {
      currentTip.value = newTip
    }
  }, 5000)

  // 프로그레스 바 애니메이션 (30초 동안 진행)
  const duration = 30000 // 30초
  const interval = 100 // 100ms마다 업데이트
  const increment = 100 / (duration / interval)

  progressInterval = setInterval(() => {
    progress.value = Math.min(progress.value + increment, 99)

    // 99%에 도달하면 멈춤 (실제 완료는 서버 응답을 기다림)
    if (progress.value >= 99) {
      clearInterval(progressInterval)
    }
  }, interval)
})

onUnmounted(() => {
  if (tipInterval) clearInterval(tipInterval)
  if (progressInterval) clearInterval(progressInterval)
})
</script>

<style scoped>
/* 부드러운 등장 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.bg-white {
  animation: fadeIn 0.3s ease-out;
}
</style>
