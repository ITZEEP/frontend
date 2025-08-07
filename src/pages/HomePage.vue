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
    <h1 class="text-2xl font-bold mb-4">전자 서명 컴포넌트 테스트</h1>
    <BaseButton variant="primary" @click="showSignatureModal = true">서명 모달 열기</BaseButton>

    <!-- 서명 모달 (간단하게 사용) -->
    <SignatureModal v-model="showSignatureModal" title="전자 서명" @confirm="handleSignature" />

    <!-- 저장된 서명 표시 -->
    <div v-if="savedSignature" class="mt-4">
      <h3 class="text-lg font-semibold mb-2">저장된 서명:</h3>
      <div class="inline-block p-4 bg-gray-100 rounded-lg">
        <img :src="savedSignature.dataUrl" alt="저장된 서명" class="max-w-full h-auto" />
        <p class="text-sm text-gray-600 mt-2">
          크기: {{ savedSignature.width }} × {{ savedSignature.height }}px
        </p>
      </div>
    </div>
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
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SignatureModal from '@/components/common/SignatureModal.vue'
import { useModalStore } from '@/stores/modal'
import Modal from '@/components/common/BaseModal.vue'

const modalStore = useModalStore()

// 서명 모달 상태
const showSignatureModal = ref(false)
const savedSignature = ref(null)

// 서명 처리
const handleSignature = (signatureData) => {
  savedSignature.value = signatureData

  // 콘솔에 파일 정보 출력
  console.log('=== 서명 파일 정보 ===')
  console.log('파일:', signatureData.file)
  console.log('파일명:', signatureData.file.name)
  console.log('파일 크기:', signatureData.file.size, 'bytes')
  console.log('이미지 크기:', `${signatureData.width} x ${signatureData.height}px`)
  console.log('Base64 길이:', signatureData.base64.length)
}
</script>
