<template>
  <div>
    <div class="mb-6">
      <hr class="border-gray-300" />
      <p class="text-center text-sm text-gray-500 mt-2">
        {{ stepLabelMap[step] }}
      </p>
    </div>

    <component
      :is="currentIntroComponent"
      v-if="currentIntroComponent"
      :scenario="scenario"
      @action="handleAction"
    />

    <!-- 모달 컴포넌트들 -->
    <component
      :is="modalStore.currentModalComponent"
      v-if="modalStore.isOpen"
      v-bind="modalStore.modalProps"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import stepIntroMap from './stepScenarios'
import { scenarioMap } from '@/constants/contractStepScenario'
import { useModalStore } from '@/stores/modal'

import TermsReviewModal from '@/components/contract/modals/step3/TermsReviewModal.vue'
import FinalClauseSelectModal from '@/components/contract/modals/step3/FinalClauseSelectModal.vue'

const modalStore = useModalStore()

const stepLabelMap = {
  1: '1단계: 기본 정보 확인',
  2: '2단계: 계약 금액 조율',
  3: '3단계: 특약 조율',
  4: '4단계: 계약서 작성',
}

const route = useRoute()
const step = computed(() => String(route.query.step || '1'))
const currentIntroComponent = computed(() => stepIntroMap[step.value])
const scenario = computed(() => scenarioMap[step.value] || [])

const remainingChances = ref(3)

//  검토 모달 닫을 때 호출될 함수
const handleTermsModalConfirm = () => {
  remainingChances.value -= 1
  modalStore.close()

  if (remainingChances.value === 0) {
    // 최종 선택 모달 바로 오픈
    openFinalClauseSelectModal()
  }
}

// 최종 모달 열기
const openFinalClauseSelectModal = () => {
  modalStore.open(FinalClauseSelectModal, {
    clausesByRound: {
      1: [{ content: '1안 - 손해금 5%' }],
      2: [{ content: '2안 - 손해금 3%' }],
      3: [{ content: '3안 - 손해금 없음' }],
    },
    onClose: () => modalStore.close(),
    onSelect: (selected) => {
      console.log('선택된 회차:', selected)
      modalStore.close()
    },
  })
}

const handleAction = (action) => {
  console.log('StepContainer 액션:', action)

  if (action === 'openSpecialTerm') {
    modalStore.open(TermsReviewModal, {
      clauses: [
        {
          id: 1,
          title: '특약 1. 관리비 체납 시 임대차 해지 가능',
          content: '임차인이 2개월 이상 관리비를 체납할 경우, 임대인은 계약을 해지할 수 있다.',
          assessment: {
            owner: {
              level: '주의',
              reason:
                '계약 해지는 법적 요건을 충족해야 하며, 단순한 체납 사유만으로 해지 권한을 인정받기 어렵습니다.',
            },
          },
        },
        {
          id: 2,
          title: '특약 2. 전입신고 및 확정일자 지연 금지',
          content:
            '임대인은 임차인이 전입신고 및 확정일자를 받을 수 있도록 임대차계약일에 임대차 목적물의 점유 및 열쇠를 인도하여야 한다.',
          assessment: {
            owner: {
              level: '안심',
              reason: '임차인의 보증금 보호를 위한 필수 조치입니다.',
            },
          },
        },
      ],
      remainingChances: remainingChances.value,
      onClose: () => modalStore.close(),
      onConfirm: handleTermsModalConfirm,
    })
  } else if (action === 'finalSelect') {
    openFinalClauseSelectModal()
  }
}
</script>
