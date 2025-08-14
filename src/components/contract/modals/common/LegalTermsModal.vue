<template>
  <Modal :maxWidth="'max-w-[560px]'">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold">초보자를 위한 임대차 법률 용어</h2>
    </header>

    <ul class="space-y-3 text-sm text-gray-700">
      <li class="white-box">
        <p class="font-semibold">전세 / 월세</p>
        <p class="text-gray-600">
          전세는 큰 보증금을 맡기고 월세를 내지 않는 방식, 월세는 매달 임대료를 내는 방식.
        </p>
      </li>
      <li class="white-box">
        <p class="font-semibold">보증금</p>
        <p class="text-gray-600">계약 종료 후 돌려받는 돈. 계약 파기·연체 등에 대비한 담보 성격.</p>
      </li>
      <li class="white-box">
        <p class="font-semibold">확정일자</p>
        <p class="text-gray-600">
          주민센터 등에서 계약서에 도장을 받아 권리 우선순위를 확보하는 절차.
        </p>
      </li>
      <li class="white-box">
        <p class="font-semibold">전입신고</p>
        <p class="text-gray-600">새 주소로 이전 신고. 보증금을 지키는 ‘대항력’ 확보에 필수.</p>
      </li>
      <li class="white-box">
        <p class="font-semibold">대항력 / 우선변제권</p>
        <p class="text-gray-600">
          대항력은 거주 사실의 법적 효력, 우선변제권은 경매 시 보증금을 먼저 돌려받을 권리.
        </p>
      </li>
      <li class="white-box">
        <p class="font-semibold">중도금 / 잔금</p>
        <p class="text-gray-600">중도금은 계약 중간에 지급, 잔금은 마지막에 지급하는 금액.</p>
      </li>
      <li class="white-box">
        <p class="font-semibold">특약</p>
        <p class="text-gray-600">
          표준 계약서에 없는 추가 약속. 하자 보수·가전 설치·입주 청소 등을 구체적으로 명시.
        </p>
      </li>
      <li class="white-box">
        <p class="font-semibold">임차권 등기명령</p>
        <p class="text-gray-600">
          보증금 반환 지연 시 퇴거 후에도 권리를 지키기 위해 신청하는 절차.
        </p>
      </li>
      <li class="white-box">
        <p class="font-semibold">내용증명</p>
        <p class="text-gray-600">
          분쟁 시 내 의사를 공식 통지하는 우편. 보증금 반환 요청 등에 활용.
        </p>
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
</script>
