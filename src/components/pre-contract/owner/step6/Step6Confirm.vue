<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-center justify-center gap-8 w-full">
      <!-- 안내문구 -->
      <div class="flex flex-col items-center justify-center gap-2">
        <h1 class="text-gray-warm-700 font-bold text-xl">입력 내용 확인</h1>
        <p class="text-gray-500">각 항목을 확인하고 필요한 부분을 수정하세요.</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-3xl mx-auto text-sm text-gray-700">
      <!-- 매물 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">매물 정보</h2>
        <p>선택한 매물: <span class="text-gray-500">서비스 외 매물</span></p>
      </section>

      <!-- 위험도 분석 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">위험도 분석</h2>
        <p class="flex items-center gap-2">
          <span class="text-green-600 font-semibold flex"
            ><SecurityBasicIcon width="30px" height="30px" />
            <p>안전 등급 (A+)</p></span
          >
        </p>
      </section>

      <!-- 계약 기본 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">계약 기본 정보</h2>
        <div class="flex flex-wrap gap-y-2">
          <div class="w-1/2">입주 예정일: <span class="text-gray-500">2025-07-17</span></div>
          <div class="w-1/2">계약 기간: <span class="text-gray-500">2년</span></div>
          <div class="w-full">재계약 의사: <span class="text-gray-500">없음</span></div>
        </div>
      </section>

      <!-- 전세 관련 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">전세 관련 정보</h2>
        <div class="flex flex-wrap gap-y-2">
          <div class="w-1/2">전세 자금 대출: <span class="text-gray-500">아니오</span></div>
          <div class="w-1/2">보증 보험 가입: <span class="text-gray-500">아니오</span></div>
        </div>
      </section>

      <!-- 생활 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">생활 정보</h2>
        <div class="flex flex-wrap gap-y-2">
          <div class="w-1/2">반려동물: <span class="text-gray-500">가능</span></div>
          <div class="w-1/2">실내 흡연: <span class="text-gray-500">미선택</span></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import SecurityBasicIcon from '@/assets/icons/SecurityBasicIcon.vue'
</script>

<style scoped></style>
