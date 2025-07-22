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

  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">공통 스타일 유닛 테스트</h1>
    <!-- 컨테이너 박스 -->
    <div class="white-box">
      <h2 class="text-lg font-bold">기본 정보</h2>
      <p>컨테이너 내용</p>
    </div>

    <!-- 위험도 박스 -->
    <div class="safe-box">안전</div>
    <div class="warning-box">주의</div>
    <div class="danger-box">위험</div>

    <!-- 인풋 필드 -->
    <input class="input-field" placeholder="주소를 입력하세요" />

    <!-- 태그 -->
    <span class="tag-green">전세권 존재</span>
    <span class="tag-red">주소 불일치</span>
    <span class="tag-orange">건물 전체 vs 일부 여부</span>
    <span class="tag-purple">등기일자 vs 계약일자</span>
    <span class="tag-blue">근저당 존재</span>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { useModalStore } from '@/stores/modal'
import Modal from '@/components/common/BaseModal.vue'

const modalStore = useModalStore()
</script>
