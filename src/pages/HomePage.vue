<template>
  <div>잇집 홈</div>
  <div class="p-8 flex flex-col gap-4">
    <h1 class="text-2xl font-bold mb-4">버튼 컴포넌트 예시</h1>
    <!-- 아웃라인 버튼 -->
    <BaseButton class="w-fit" variant="outline">로그인</BaseButton>

    <!-- 노란 배경 버튼 -->
    <BaseButton class="w-fit" variant="primary">AI 위험도 분석 시작</BaseButton>

    <!-- 회색 버튼 -->
    <BaseButton class="w-fit" variant="gray">계약서 작성</BaseButton>

    <!-- 파란색 버튼 -->
    <BaseButton class="w-80" variant="blue">전자서명 요청</BaseButton>

    <BaseButton class="w-80" variant="danger-outline"> 회원 탈퇴 </BaseButton>

    <!-- 큰 버튼 -->
    <BaseButton size="lg">다음</BaseButton>
  </div>

  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">모달 컴포넌트 테스트</h1>
    <BaseButton variant="primary" @click="modalStore.open()">모달 열기</BaseButton>

    <!-- 모달 -->
    <Modal :closable="true" :maskCloseable="true">
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-2">모달 내용</h2>
        <p class="mb-4">슬롯이 들어가는 공간입니다!</p>
        <BaseButton variant="blue" @click="modalStore.close()">닫기</BaseButton>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { useModalStore } from '@/stores/modal'
import Modal from '@/components/common/BaseModal.vue'

const modalStore = useModalStore()
</script>
