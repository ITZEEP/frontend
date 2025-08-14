<template>
  <Modal :maxWidth="'max-w-[560px]'">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold">초보자를 위한 임대차 실전 팁</h2>
    </header>

    <ul class="space-y-3 text-sm text-gray-700">
      <li v-for="(tip, idx) in tips" :key="idx" class="white-box">
        <span class="font-bold mr-1">{{ idx + 1 }}.</span>{{ tip }}
      </li>
    </ul>

    <div class="mt-6 flex justify-end">
      <button
        class="px-4 py-2 rounded-lg bg-yellow-primary hover:bg-yellow-500 text-white"
        @click="modalStore.close()"
      >
        닫기
      </button>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '@/components/common/BaseModal.vue'
import { useModalStore } from '@/stores/modal'
const modalStore = useModalStore()

const tips = [
  '등기부등본에서 소유자·근저당 확인. 대출이 많으면 보증금 위험 ↑',
  '집 상태(누수·곰팡이·난방) 확인하고 사진 + 특약에 수리 기한 명시',
  '전입신고·확정일자는 잔금일 또는 즉시 진행',
  '월세 납부일·연체 이자율 명확히(자동이체 추천)',
  '가전/가구 인수 목록을 사진과 함께(모델명·상태·열쇠 개수)',
  '관리비 항목·납부 주체(주차·인터넷·엘리베이터 등) 사전 확인',
  '보증보험 가입 가능 여부·비용·부담 주체 합의 후 특약 기재',
  '퇴거 통보 시점·중도해지 위약금 조건을 특약으로 명확히',
  '이체는 본인 계좌 → 등기부 소유자 명의 계좌로(제3자 계좌 주의)',
  '문자·카톡·이메일 등 합의 흔적 보관(분쟁 시 증거)',
]
</script>
