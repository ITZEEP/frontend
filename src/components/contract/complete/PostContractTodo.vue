<template>
  <div class="white-box">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-800">계약 후 해야 할 일</h2>
      <button
        class="text-gray-400 hover:text-gray-600 transition"
        @click="open = !open"
        aria-label="toggle"
      >
        <i :class="['fa-solid', open ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
    </div>

    <div v-if="open" class="mt-4 space-y-4">
      <!-- 중요 일정 -->
      <div class="rounded-xl border border-yellow-primary bg-yellow-50 p-4">
        <div class="flex items-start gap-2">
          <i class="fa-solid fa-triangle-exclamation mt-0.5 text-yellow-primary"></i>
          <div class="flex-1 text-sm text-gray-800">
            <p class="font-semibold mb-1">중요한 일정</p>
            <ul class="space-y-0.5">
              <li><label class="font-bold">당일: </label>전입 신고 + 확정일자</li>
              <li><label class="font-bold">30일 이내: </label>임대차 신고 + 실거래 신고</li>
              <li><label class="font-bold">60일 이내: </label>취득세 납부 + 등기 이전</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 1. 전입신고 + 확정일자 -->
      <div class="rounded-xl bg-white border border-gray-100 p-4">
        <div class="flex items-start gap-3">
          <span
            class="w-6 h-6 rounded-full bg-yellow-primary text-white text-xs font-bold flex items-center justify-center"
            >1</span
          >
          <div class="flex-1">
            <p class="font-semibold text-gray-800">전입신고 + 확정일자</p>
            <p class="text-sm text-gray-500 mt-0.5">주민센터 방문 (이사 당일 처리 권장)</p>
            <p class="text-sm text-gray-500 mt-0.5">
              <i class="fa-solid fa-shield-halved text-yellow-primary"></i> 대항력 + 우선변제권 확보
            </p>
          </div>
        </div>
      </div>

      <!-- 2. 임대차 신고제 -->
      <div class="rounded-xl bg-white border border-gray-100 p-4">
        <div class="flex items-start gap-3">
          <span
            class="w-6 h-6 rounded-full bg-yellow-primary text-white text-xs font-bold flex items-center justify-center"
            >2</span
          >
          <div class="flex-1">
            <p class="font-semibold text-gray-800">임대차 신고제</p>
            <p class="text-sm text-gray-500 mt-0.5">
              계약일로부터 30일 이내
              <span class="block text-red-500"
                ><i class="fa-solid fa-circle-exclamation"></i> 미신고 시 과태료 100만 원</span
              >
            </p>
          </div>
        </div>
      </div>

      <!-- 3. 등기변동 알림 서비스 -->
      <div class="rounded-xl bg-white border border-gray-100 p-4">
        <div class="flex items-start gap-3">
          <span
            class="w-6 h-6 rounded-full bg-yellow-primary text-white text-xs font-bold flex items-center justify-center"
            >3</span
          >
          <div class="flex-1">
            <p class="font-semibold text-gray-800">등기변동 알림 서비스</p>
            <p class="text-sm text-gray-500 mt-0.5">
              KB 스타뱅킹 앱에서 등록 · 사기 예방을 위한 필수 서비스
            </p>
          </div>
        </div>
      </div>

      <!-- <button
        class="w-full mt-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-primary font-semibold py-3 transition"
        @click="$emit('open-guide')"
      >
        <i class="fa-solid fa-book-open mr-2"></i>
        상세 가이드 보기
      </button> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(true)
</script>
