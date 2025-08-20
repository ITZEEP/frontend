<template>
  <!-- 모바일 차단 -->
  <MobileNotSupported v-if="isMobile" />

  <!-- 데스크톱 컨텐츠 -->
  <div v-else class="max-w-screen min-h-screen mx-auto bg-yellow-50">
    <!-- 헤더 - 완료 단계에서만 표시 -->
    <ContractCompleteHeader v-if="currentStep === 'complete'" />

    <!-- 단계별 컨텐츠 -->
    <div v-if="currentStep === 'preview'" class="px-16 py-8">
      <!-- PDF 미리보기 단계 -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-6">계약서 미리보기</h2>

        <!-- PDF 뷰어 (기본 iframe 사용) -->
        <div v-if="pdfUrl" class="mb-6">
          <iframe
            :src="pdfUrl"
            class="w-full h-[600px] border border-gray-300 rounded-lg"
            title="계약서 PDF 미리보기"
          />
        </div>
        <div
          v-else-if="isLoading"
          class="mb-6 h-[600px] border border-gray-300 rounded-lg flex items-center justify-center"
        >
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
            ></div>
            <p>PDF를 불러오는 중...</p>
          </div>
        </div>

        <!-- 세금 체납 여부 (임대인만 표시) -->
        <div v-if="userRole === 'owner'" class="space-y-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 class="font-semibold mb-3">세금 체납 여부</h3>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  :value="false"
                  v-model="hasTaxArrears"
                  name="taxArrears"
                  class="mr-2"
                />
                <span>세금 체납 사실이 없음</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  :value="true"
                  v-model="hasTaxArrears"
                  name="taxArrears"
                  class="mr-2"
                />
                <span>세금 체납 사실이 있음</span>
              </label>
            </div>
          </div>

          <div>
            <h3 class="font-semibold mb-3">선순위 확정일자 여부</h3>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  :value="false"
                  v-model="hasPriorFixedDate"
                  name="priorFixedDate"
                  class="mr-2"
                />
                <span>선순위 확정일자가 없음</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  :value="true"
                  v-model="hasPriorFixedDate"
                  name="priorFixedDate"
                  class="mr-2"
                />
                <span>선순위 확정일자가 있음</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-4">
          <button
            @click="cancelExport"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            취소
          </button>
          <button
            @click="proceedToSignature"
            class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            서명하기
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentStep === 'signature'" class="px-16 py-8">
      <!-- 서명 단계 -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-6">전자서명</h2>

        <!-- 서명 패드들 -->
        <div class="space-y-6">
          <!-- 계약서 서명 (필수) -->
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3">계약서 서명 (필수)</h3>
            <div class="w-full">
              <SignaturePad
                ref="signaturePad1"
                :width="800"
                :height="200"
                :placeholder="''"
                @signature-saved="handleSignature1"
                class="w-full"
              />
            </div>
          </div>

          <!-- 세금 체납 없음 서명 (조건부 - 체납이 없을 때만) -->
          <div v-if="!hasTaxArrears && userRole === 'owner'" class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3">세금 체납 없음 확인 서명</h3>
            <div class="w-full">
              <SignaturePad
                ref="signaturePad2"
                :width="800"
                :height="200"
                :placeholder="''"
                @signature-saved="handleSignature2"
                class="w-full"
              />
            </div>
          </div>

          <!-- 선순위 확정일자 없음 서명 (조건부 - 확정일자가 없을 때만) -->
          <div v-if="!hasPriorFixedDate && userRole === 'owner'" class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3">선순위 확정일자 없음 확인 서명</h3>
            <div class="w-full">
              <SignaturePad
                ref="signaturePad3"
                :width="800"
                :height="200"
                :placeholder="''"
                @signature-saved="handleSignature3"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- 동의 체크박스 -->
        <div class="mt-6 p-4 bg-gray-100 rounded-lg">
          <label class="flex items-start">
            <input type="checkbox" v-model="mediationAgree" class="mt-1 mr-3" checked disabled />
            <span class="text-sm">
              주택임대차계약과 관련하여 분쟁이 있는 경우 임대인 또는 임차인은 법원에 소를 제기하기
              전에 먼저 주택임대차분쟁조정위원회에 조정을 신청합니다.
            </span>
          </label>
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-4 mt-6">
          <button
            @click="currentStep = 'preview'"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            이전
          </button>
          <button
            @click="proceedToPassword"
            :disabled="!isSignatureComplete"
            class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentStep === 'waiting' || currentStep === 'generating'" class="px-16 py-8">
      <!-- 상대방 서명 대기 또는 PDF 생성 중 화면 -->
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto"
          ></div>
          <h2 class="text-2xl font-bold mt-6 mb-4">
            {{
              exportStatus?.ownerSignatureCompleted && exportStatus?.buyerSignatureCompleted
                ? 'PDF 생성 중...'
                : '상대방 서명 대기 중'
            }}
          </h2>
          <p class="text-gray-600 mb-2">
            <template
              v-if="exportStatus?.ownerSignatureCompleted && exportStatus?.buyerSignatureCompleted"
            >
              양측 서명이 완료되었습니다. 최종 계약서를 생성하고 있습니다.
            </template>
            <template v-else>
              {{ userRole === 'owner' ? '임차인' : '임대인' }}의 서명을 기다리고 있습니다.
            </template>
          </p>
          <p class="text-sm text-gray-500">
            {{
              exportStatus?.ownerSignatureCompleted && exportStatus?.buyerSignatureCompleted
                ? '잠시만 기다려주세요. PDF 생성이 완료되면 자동으로 표시됩니다.'
                : '상대방이 서명을 완료하면 자동으로 최종 계약서가 생성됩니다.'
            }}
          </p>

          <div class="mt-8 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700 font-semibold mb-2">
              ✅ 귀하의 서명이 성공적으로 저장되었습니다.
            </p>
            <p class="text-sm text-blue-600">
              양측 서명이 모두 완료되면 서명이 포함된 최종 계약서가 자동으로 생성됩니다.
            </p>
          </div>

          <!-- 서명 상태 표시 -->
          <div v-if="exportStatus" class="mt-6 grid grid-cols-2 gap-4">
            <div
              class="p-3 border rounded-lg"
              :class="
                exportStatus.ownerSignatureCompleted ? 'bg-green-50 border-green-300' : 'bg-gray-50'
              "
            >
              <p class="text-sm font-semibold">임대인</p>
              <p
                class="text-xs"
                :class="exportStatus.ownerSignatureCompleted ? 'text-green-600' : 'text-gray-500'"
              >
                {{ exportStatus.ownerSignatureCompleted ? '✓ 서명 완료' : '대기 중...' }}
              </p>
            </div>
            <div
              class="p-3 border rounded-lg"
              :class="
                exportStatus.buyerSignatureCompleted ? 'bg-green-50 border-green-300' : 'bg-gray-50'
              "
            >
              <p class="text-sm font-semibold">임차인</p>
              <p
                class="text-xs"
                :class="exportStatus.buyerSignatureCompleted ? 'text-green-600' : 'text-gray-500'"
              >
                {{ exportStatus.buyerSignatureCompleted ? '✓ 서명 완료' : '대기 중...' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentStep === 'password'" class="px-16 py-8">
      <!-- 암호 설정 단계 -->
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">계약서 암호 설정</h2>

        <div class="space-y-4">
          <div>
            <label class="block mb-2 font-semibold">암호 입력</label>
            <input
              type="password"
              v-model="contractPassword"
              class="w-full px-4 py-2 border rounded-lg"
              placeholder="계약서 PDF 암호를 입력하세요"
            />
          </div>

          <div>
            <label class="block mb-2 font-semibold">암호 확인</label>
            <input
              type="password"
              v-model="contractPasswordConfirm"
              class="w-full px-4 py-2 border rounded-lg"
              placeholder="암호를 다시 입력하세요"
            />
          </div>
        </div>

        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-700 font-semibold">💡 암호 안내</p>
          <p class="text-sm text-blue-600 mt-1">
            기본 암호는 귀하의 생년월일 6자리(YYMMDD)로 설정되어 있습니다.
          </p>
          <p class="text-sm text-blue-600">보안을 위해 다른 암호로 변경하실 수 있습니다.</p>
        </div>

        <div class="mt-4 text-sm text-gray-600">
          * 이 암호는 계약서 PDF 파일을 열 때 필요합니다.
        </div>

        <!-- 버튼 -->
        <div class="flex justify-end gap-4 mt-6">
          <button
            @click="currentStep = 'signature'"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            이전
          </button>
          <button
            @click="completeContract"
            :disabled="!isPasswordValid"
            class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            완료
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="currentStep === 'complete'" class="flex flex-col">
      <div class="flex gap-6 px-16 py-8">
        <!-- 완료 단계 -->
        <ContractPreviewBox :pdfData="finalPdfData" :contractChatId="contractId" />
        <ContractSidePanel :contractId="contractId" :finalPdfUrl="exportStatus?.finalPdfUrl" />
      </div>

      <div class="w-full flex justify-center items-center mb-8">
        <BaseButton class="w-96" size="lg" @click="handleGoToHistory"
          >계약서 내역 확인하기</BaseButton
        >
      </div>
    </div>

    <!-- 로딩 오버레이 -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4">처리 중입니다...</p>
      </div>
    </div>
  </div>

  <!-- 에러 모달 -->
  <div
    v-if="showErrorModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
      <div class="text-center">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
        >
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L5.232 19.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
        <p class="text-sm text-gray-500 mb-6">{{ errorMessage }}</p>
        <button
          @click="showErrorModal = false"
          class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirmModal } from '@/composables/useConfirmModal'
// PdfViewer 제거 - 기본 iframe 사용
import ContractCompleteHeader from '@/components/contract/complete/ContractCompleteHeader.vue'
import MobileNotSupported from '@/components/common/MobileNotSupported.vue'
import ContractPreviewBox from '@/components/contract/complete/ContractPreviewBox.vue'
import ContractSidePanel from '@/components/contract/complete/ContractSidePanel.vue'
import SignaturePad from '@/components/common/SignaturePad.vue'
import websocketService from '@/apis/websocket'
import SockJS from 'sockjs-client'
import api from '@/apis'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  getUserRole,
  updateSignatureStatus,
  getExportStatus,
  createTempPdfUrl,
} from '@/apis/contractChatApi'

const route = useRoute()
const contractId = ref(route.params.contractChatId)
const router = useRouter()

// 모바일 체크
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

// WebSocket 관련 상태
const exportStatus = ref(null)
const isConnected = ref(false)
const userRole = ref('owner')

// 단계 관리
const currentStep = ref('preview') // preview, signature, waiting, complete
const isWaitingForOther = ref(false) // 상대방 서명 대기 중

// PDF 관련
const pdfUrl = ref('')
const finalPdfData = ref(null)

// 세금 체납 및 선순위 확정일자 (기본값: 없음)
const hasTaxArrears = ref(false) // false = 없음, true = 있음
const hasPriorFixedDate = ref(false) // false = 없음, true = 있음
const mediationAgree = ref(true) // 항상 true로 설정

// 에러 모달
const showErrorModal = ref(false)
const errorMessage = ref('')

// 서명
const signatures = ref({
  signature1: null,
  signature2: null,
  signature3: null,
})

// 암호 (기본값: 생년월일 6자리)
const contractPassword = ref('')
const contractPasswordConfirm = ref('')
const birthDate = ref('') // 사용자 생년월일 저장

// 상태
const isLoading = ref(false)

// WebSocket 상태 감시
watch(
  exportStatus,
  (newStatus) => {
    if (newStatus) {
      console.log('WebSocket 상태 업데이트:', newStatus)
      console.log('현재 단계:', newStatus.currentStep)
      console.log('현재 사용자 역할:', userRole.value)
      console.log('Owner 서명:', newStatus.ownerSignatureCompleted)
      console.log('Buyer 서명:', newStatus.buyerSignatureCompleted)
      console.log('완료 여부:', newStatus.isCompleted || newStatus.completed)
      console.log('PDF URL:', newStatus.finalPdfUrl)

      // 본인이 서명을 완료했는지 확인
      const mySignatureCompleted =
        userRole.value === 'owner'
          ? newStatus.ownerSignatureCompleted
          : newStatus.buyerSignatureCompleted

      console.log('내 서명 완료 여부:', mySignatureCompleted)

      // 상태에 따른 화면 전환
      if (newStatus.currentStep === 'waiting') {
        // 본인이 서명을 완료한 경우에만 대기 화면으로 이동
        if (mySignatureCompleted && currentStep.value !== 'waiting') {
          console.log('내 서명 완료 - 대기 화면으로 이동')
          currentStep.value = 'waiting'
          isWaitingForOther.value = true
        } else if (!mySignatureCompleted) {
          // 본인이 아직 서명하지 않은 경우 - 서명 화면 유지
          console.log('아직 서명하지 않음 - 현재 화면 유지')
          // currentStep이 preview나 signature가 아니면 preview로 이동
          if (currentStep.value !== 'preview' && currentStep.value !== 'signature') {
            currentStep.value = 'preview'
          }
        }
      } else if (newStatus.currentStep === 'generating') {
        // PDF 생성 중 상태
        console.log('양측 서명 완료! 최종 계약서 생성 중...')
        if (currentStep.value === 'waiting') {
          isLoading.value = true
        }
      } else if ((newStatus.isCompleted || newStatus.completed) && newStatus.finalPdfUrl) {
        // 최종 PDF 생성 완료
        console.log('최종 계약서 생성 완료!')
        isWaitingForOther.value = false
        isLoading.value = false

        // 대기 중이었다면 완료 화면으로 이동
        if (currentStep.value === 'waiting' || currentStep.value === 'generating') {
          // PDF 로드
          loadFinalPdf(newStatus.finalPdfUrl).then(() => {
            currentStep.value = 'complete'
            alert('양측 서명이 완료되어 최종 계약서가 생성되었습니다!')
          })
        }
      }
    }
  },
  { deep: true },
)

// WebSocket 메시지 핸들러
const handleExportStatusUpdate = (data) => {
  console.log('=== WebSocket 상태 업데이트 수신 ===')
  console.log('받은 데이터:', JSON.stringify(data, null, 2))
  console.log('현재 userRole:', userRole.value)

  // 이전 상태 저장
  const prevStatus = exportStatus.value ? { ...exportStatus.value } : null
  console.log('이전 상태:', prevStatus)

  // 새로운 상태 업데이트
  exportStatus.value = data

  // 상태 변경 감지
  if (prevStatus && data) {
    const wasOwnerSigned = prevStatus.ownerSignatureCompleted
    const wasBuyerSigned = prevStatus.buyerSignatureCompleted
    const nowOwnerSigned = data.ownerSignatureCompleted
    const nowBuyerSigned = data.buyerSignatureCompleted

    // 상대방이 방금 서명한 경우
    if (!wasOwnerSigned && nowOwnerSigned && userRole.value !== 'owner') {
      console.log('임대인이 서명을 완료했습니다')
    }
    if (!wasBuyerSigned && nowBuyerSigned && userRole.value === 'owner') {
      console.log('임차인이 서명을 완료했습니다')
    }

    // 양쪽 모두 서명 완료된 경우
    if (nowOwnerSigned && nowBuyerSigned && (!wasOwnerSigned || !wasBuyerSigned)) {
      console.log('양쪽 서명 완료! 최종 계약서 생성 시작...')
      isLoading.value = true

      // 최종 PDF가 이미 있으면 바로 완료 화면으로
      if (data.finalPdfUrl) {
        loadFinalPdf(data.finalPdfUrl).then(() => {
          currentStep.value = 'complete'
          isLoading.value = false
          isWaitingForOther.value = false
        })
      }
    }
  }
}

// 계약 완료 알림 핸들러
const handleContractCompletion = (data) => {
  console.log('계약 완료 알림 수신:', data)
  isWaitingForOther.value = false
  isLoading.value = false

  if (data.finalPdfUrl) {
    // 최종 PDF 로드 후 완료 화면으로 이동
    loadFinalPdf(data.finalPdfUrl).then(() => {
      currentStep.value = 'complete'
      console.log('계약서 서명이 완료되어 최종 계약서가 생성되었습니다!')
    })
  }
}

// WebSocket 연결 설정
const setupWebSocket = async () => {
  try {
    console.log('WebSocket 연결 시도...')
    await websocketService.connect()
    isConnected.value = true
    console.log('WebSocket 연결 성공')

    // 상태 업데이트 구독
    websocketService.onMessage(
      `/topic/contract/${contractId.value}/export/status`,
      handleExportStatusUpdate,
    )

    // 계약 완료 알림 구독
    websocketService.onMessage(
      `/topic/contract/${contractId.value}/completion`,
      handleContractCompletion,
    )

    // 초기 상태 요청
    await websocketService.getContractExportStatus(contractId.value)
  } catch (error) {
    console.error('WebSocket 연결 실패:', error)
    isConnected.value = false
  }
}

// WebSocket 간단 테스트
const testWebSocketConnection = async () => {
  try {
    console.log('=== WebSocket 연결 테스트 시작 ===')
    const testSocket = new SockJS('http://localhost:8080/ws')

    testSocket.onopen = () => {
      console.log('✅ SockJS 직접 연결 성공!')
      testSocket.close()
    }

    testSocket.onerror = (error) => {
      console.error('❌ SockJS 직접 연결 실패:', error)
    }

    testSocket.onclose = (event) => {
      console.log('🔒 SockJS 연결 종료:', event.code, event.reason)
    }
  } catch (error) {
    console.error('WebSocket 테스트 실패:', error)
  }
}

// 초기 PDF 로드 및 사용자 역할 설정
onMounted(async () => {
  // 모바일 체크
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // WebSocket 연결 테스트
  await testWebSocketConnection()

  // 사용자 역할 확인
  const role = await getUserRole(contractId.value)
  userRole.value = role

  // 계약서 정보 가져와서 생년월일 추출
  await loadContractInfo()

  // finalContract 레코드 초기화 (외래 키 제약조건 해결)
  await initializeFinalContract()

  // WebSocket 연결
  await setupWebSocket()

  // 초기 상태 확인 (서명 완료 여부 체크)
  try {
    const initialStatus = await getExportStatus(contractId.value)
    if (initialStatus) {
      exportStatus.value = initialStatus

      // 본인의 서명 상태 확인
      const mySignatureCompleted =
        userRole.value === 'owner'
          ? initialStatus.ownerSignatureCompleted
          : initialStatus.buyerSignatureCompleted

      console.log('초기 상태 - 내 서명 완료 여부:', mySignatureCompleted)

      // 이미 서명한 경우 대기 화면으로
      if (mySignatureCompleted && !initialStatus.isCompleted) {
        currentStep.value = 'waiting'
        isWaitingForOther.value = true
      } else if (initialStatus.isCompleted && initialStatus.finalPdfUrl) {
        // 이미 완료된 경우
        await loadFinalPdf(initialStatus.finalPdfUrl)
        currentStep.value = 'complete'
      } else {
        // 아직 서명하지 않은 경우 - PDF 로드
        await loadInitialPDF()
      }
    } else {
      // 상태가 없으면 PDF 로드
      await loadInitialPDF()
    }
  } catch (error) {
    console.error('초기 상태 로드 실패:', error)
    // 에러 발생 시에도 PDF 로드
    await loadInitialPDF()
  }
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  stopStatusPolling()
  if (isConnected.value) {
    websocketService.offMessage(`/topic/contract/${contractId.value}/export/status`)
    websocketService.offMessage(`/topic/contract/${contractId.value}/completion`)
  }
})

// 계약서 정보 로드하여 생년월일 추출
const loadContractInfo = async () => {
  try {
    // 계약서 정보 API 호출 (getContract 또는 적절한 API 사용)
    const response = await api.post(`/api/contract/${contractId.value}/getContract`)
    if (response.data && response.data.success) {
      const contractData = response.data.data

      // 사용자 역할에 따라 생년월일 추출 (주민번호 앞 6자리)
      if (userRole.value === 'owner' && contractData.ownerSsn) {
        // 임대인의 경우: ownerSsn의 앞 6자리
        birthDate.value = contractData.ownerSsn.substring(0, 6)
      } else if (
        (userRole.value === 'buyer' || userRole.value === 'tenant') &&
        contractData.buyerSsn
      ) {
        // 임차인의 경우: buyerSsn의 앞 6자리
        birthDate.value = contractData.buyerSsn.substring(0, 6)
      }

      // 암호 필드에 자동으로 생년월일 설정
      if (birthDate.value) {
        contractPassword.value = birthDate.value
        contractPasswordConfirm.value = birthDate.value
      }
    }
  } catch (error) {
    console.error('계약서 정보 로드 실패:', error)
    // 오류가 나도 계속 진행 (암호를 수동으로 입력하도록)
  }
}

// finalContract 레코드 초기화 (외래 키 제약조건 해결)
const initializeFinalContract = async () => {
  try {
    console.log('finalContract 레코드 초기화 시도...')

    // final_contract 테이블에 초기 레코드 생성
    // GET /api/contract/{contractChatId}/final_contract 호출
    // 이 API가 내부적으로 insertFinalContractInit을 호출하여 레코드 생성
    const response = await api.get(`/api/contract/${contractId.value}/final_contract`)

    if (response.data && response.data.success) {
      console.log('finalContract 레코드 초기화 성공')
    } else {
      console.log('finalContract 레코드 초기화 응답:', response.data)
    }
  } catch (error) {
    console.error('finalContract 초기화 중 오류:', error)
    // 이미 레코드가 있는 경우 오류가 발생할 수 있으므로 무시하고 진행
    // MySQL의 UNIQUE 제약조건 때문에 중복 삽입 시 오류 발생 가능
    if (error.response?.data?.message?.includes('Duplicate entry')) {
      console.log('finalContract 레코드가 이미 존재합니다')
    }
  }
}

// 초기 PDF 로드 (임시 URL 생성)
const loadInitialPDF = async () => {
  isLoading.value = true
  try {
    console.log('임시 PDF URL 생성 시작...')
    const s3Url = await createTempPdfUrl(contractId.value)

    if (s3Url) {
      pdfUrl.value = s3Url
      console.log('임시 PDF URL 생성 완료:', s3Url)
    } else {
      throw new Error('임시 URL 생성에 실패했습니다')
    }
  } catch (error) {
    handleError(error, '계약서를 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

// PDF 관련 함수들 제거 (iframe 사용으로 불필요)

// 서명 처리
const handleSignature1 = (data) => {
  signatures.value.signature1 = data
}

const handleSignature2 = (data) => {
  signatures.value.signature2 = data
}

const handleSignature3 = (data) => {
  signatures.value.signature3 = data
}

// 서명 완료 여부
const isSignatureComplete = computed(() => {
  const hasMainSignature = !!signatures.value.signature1

  // 임차인인 경우 메인 서명만 있으면 완료
  if (userRole.value === 'buyer' || userRole.value === 'tenant') {
    return hasMainSignature && mediationAgree.value
  }

  // 임대인인 경우 추가 서명 필요
  const hasRequiredSignatures =
    (hasTaxArrears?.value || !!signatures.value.signature2) && // 체납이 있으면 서명 불필요, 없으면 서명 필요
    (hasPriorFixedDate?.value || !!signatures.value.signature3) // 확정일자가 있으면 서명 불필요, 없으면 서명 필요
  return hasMainSignature && hasRequiredSignatures && mediationAgree.value
})

// 암호 유효성
const isPasswordValid = computed(() => {
  return (
    contractPassword.value.length >= 4 && contractPassword.value === contractPasswordConfirm.value
  )
})

// 서명 단계로 진행
const proceedToSignature = () => {
  if (!pdfUrl.value) {
    alert('PDF를 먼저 로드해주세요.')
    return
  }
  // contract_step을 END로 설정하는 API 호출
  updateContractStep('END')
  // 서명 화면으로 이동
  currentStep.value = 'signature'
}

// 전역 에러 처리 함수
const handleError = (error, defaultMessage = '오류가 발생했습니다.') => {
  console.error('에러 발생:', error)

  let message = defaultMessage

  if (error.response) {
    const status = error.response.status
    switch (status) {
      case 400:
        message = '잘못된 요청입니다.'
        break
      case 401:
        message = '인증이 필요합니다.'
        break
      case 403:
        message = '접근 권한이 없습니다.'
        break
      case 404:
        message = '요청한 리소스를 찾을 수 없습니다.'
        break
      case 500:
        message = '서버 오류가 발생했습니다.'
        break
      case 501:
        message = '구현되지 않은 기능입니다.'
        break
      default:
        message = `오류가 발생했습니다. (${status})`
    }
  }

  showErrorModal.value = true
  errorMessage.value = message
}

// contract_step 업데이트
const updateContractStep = async (step) => {
  try {
    await api.post(`/api/contract/${contractId.value}/updateStep`, {
      step: step,
    })
    console.log('Contract step updated to:', step)
  } catch (error) {
    console.error('Failed to update contract step:', error)
  }
}

// 서명 완료 후 처리
const proceedToPassword = async () => {
  if (!isSignatureComplete.value) {
    alert('모든 서명과 동의를 완료해주세요.')
    return
  }

  isLoading.value = true
  try {
    // 서버에 서명 저장
    console.log('서명 서버 저장 시작...')
    await saveSignatureToServer()
    console.log('서명 서버 저장 완료')

    // WebSocket 연결 확인
    if (!websocketService.getConnectionStatus()) {
      console.log('WebSocket 연결이 끊어짐. 재연결 시도...')
      await websocketService.connect()
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 연결 대기
    }

    // STOMP 연결 확인 (빠른 체크)
    const stompClient = websocketService.getStompClient()
    if (!stompClient?.connected) {
      console.log('STOMP 연결 대기 중...')
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // WebSocket으로 서명 완료 알림 전송 - SignatureSubmitDTO 형식에 맞게
    const signatureMessage = {
      userRole: userRole.value,
      signature1: signatures.value.signature1?.dataUrl || '', // base64 encoded signature
      signature2: signatures.value.signature2?.dataUrl || '',
      signature3: signatures.value.signature3?.dataUrl || '',
      hasTaxArrears: !hasTaxArrears.value,
      hasPriorFixedDate: !hasPriorFixedDate.value,
      mediationAgree: true, // 항상 true로 설정
      submittedAt: Date.now(),
    }

    console.log('서명 완료 메시지 전송:', signatureMessage)
    console.log('mediationAgree 값 확인:', true)
    console.log('WebSocket 연결 상태:', websocketService.getConnectionStatus())

    // WebSocket 서비스 메서드 사용 (await 추가)
    console.log('서명 전송 시작, contractId:', contractId.value)
    console.log('서명 메시지:', JSON.stringify(signatureMessage, null, 2))

    // WebSocket 전송 시도
    const sendResult = await websocketService.sendContractExportSignature(
      contractId.value,
      signatureMessage,
    )
    console.log('WebSocket 서명 전송 결과:', sendResult)

    // WebSocket 실패 시 또는 백업으로 HTTP API 사용
    if (!sendResult) {
      console.warn('WebSocket 메시지 전송 실패. HTTP API 사용...')
    }

    // 항상 HTTP API로도 전송 (백업)
    try {
      console.log('HTTP API로 서명 상태 업데이트 시도...')
      const httpResult = await updateSignatureStatus(contractId.value, signatureMessage)
      console.log('HTTP API 서명 상태 업데이트 결과:', httpResult)

      // HTTP API 성공 시 본인 서명 상태를 즉시 업데이트
      if (httpResult && httpResult.success) {
        if (userRole.value === 'owner') {
          exportStatus.value = {
            ...exportStatus.value,
            ownerSignatureCompleted: true,
          }
        } else {
          exportStatus.value = {
            ...exportStatus.value,
            buyerSignatureCompleted: true,
          }
        }
      }
    } catch (error) {
      handleError(error, '서명 전송에 실패했습니다. 다시 시도해주세요.')
      return // 실패 시 대기 화면으로 가지 않음
    }

    // 서명 완료 후 즉시 상태 폴링 시작
    console.log('상태 폴링 시작...')
    startStatusPolling()

    // WebSocket이 실패한 경우에도 HTTP API로 상태 조회
    setTimeout(async () => {
      const latestStatus = await getExportStatus(contractId.value)
      if (latestStatus) {
        console.log('HTTP로 가져온 최신 상태:', latestStatus)
        exportStatus.value = latestStatus
      }
    }, 1000)

    // 대기 화면으로 이동 (백엔드에서 자동으로 최종 계약서 생성)
    console.log('서명 완료. 최종 계약서 생성 대기 중...')
    isWaitingForOther.value = true
    currentStep.value = 'waiting'
  } catch (error) {
    handleError(error, '서명 저장 중 오류가 발생했습니다.')
  } finally {
    // 완료 화면으로 가지 않는 경우에만 로딩 해제
    if (currentStep.value !== 'complete') {
      isLoading.value = false
    }
  }
}

// 자동으로 최종 계약서 생성 (현재는 백엔드에서 자동 처리)
// 이 함수는 참조용으로 남겨둠
// const autoCompleteFinalContract = async () => {
//   // 백엔드에서 자동으로 처리하므로 프론트엔드에서는 대기만 함
//   console.log('백엔드에서 최종 계약서 자동 생성 중...')
// }

// 계약 완료 (수동 암호 설정용 - 현재는 사용하지 않음)
const completeContract = async () => {
  if (!isPasswordValid.value) {
    alert('암호를 확인해주세요.')
    return
  }

  isLoading.value = true
  try {
    // WebSocket으로 암호 전송
    websocketService.sendContractExportPassword(contractId.value, {
      userRole: userRole.value,
      password: contractPassword.value,
    })

    // 상대방 암호 대기
    if (exportStatus.value && !exportStatus.value.isBothPasswordsSet) {
      alert('상대방의 암호 설정을 기다리고 있습니다...')
      isLoading.value = false
      return
    }

    // 양측 모두 완료 시 최종 PDF는 서버에서 자동 생성
    // WebSocket을 통해 완료 알림을 받음
  } catch (error) {
    handleError(error, '계약서 처리 중 오류가 발생했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 서명 데이터를 서버에 저장
const saveSignatureToServer = async () => {
  try {
    // 서명 데이터를 Blob으로 변환
    const signatureBlobs = []

    // 서명1 (필수)
    if (signatures.value.signature1) {
      const blob1 =
        signatures.value.signature1.blob ||
        (await dataUrlToBlob(signatures.value.signature1.dataUrl))
      signatureBlobs.push(new File([blob1], 'signature1.png', { type: 'image/png' }))
    }

    // 서명2 (선택)
    if (signatures.value.signature2) {
      const blob2 =
        signatures.value.signature2.blob ||
        (await dataUrlToBlob(signatures.value.signature2.dataUrl))
      signatureBlobs.push(new File([blob2], 'signature2.png', { type: 'image/png' }))
    }

    // 서명3 (선택)
    if (signatures.value.signature3) {
      const blob3 =
        signatures.value.signature3.blob ||
        (await dataUrlToBlob(signatures.value.signature3.dataUrl))
      signatureBlobs.push(new File([blob3], 'signature3.png', { type: 'image/png' }))
    }

    // FormData 생성
    const formData = new FormData()

    // DTO 데이터 추가 - signedType 결정
    let signedType = 'OWNER_CONTRACT' // 기본값
    if (userRole.value === 'owner') {
      signedType = 'OWNER_CONTRACT'
    } else if (userRole.value === 'buyer' || userRole.value === 'tenant') {
      signedType = 'BUYER_CONTRACT'
    }

    const dto = {
      signedType: signedType,
      hasTaxArrears: hasTaxArrears.value,
      hasPriorFixedDate: hasPriorFixedDate.value,
      mediationAgree: true, // 항상 true로 설정
    }
    // JSON을 Blob으로 만들어서 파일처럼 전송
    const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })
    formData.append('dto', dtoBlob, 'dto.json')

    // 이미지 파일들 추가
    signatureBlobs.forEach((file) => {
      formData.append('imgFiles', file)
    })

    // API 직접 호출 (FormData 전송)
    const response = await api.post(`/api/contract/${contractId.value}/signature/tax`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('서명 저장 실패:', error)
    throw error
  }
}

// DataURL을 Blob으로 변환하는 헬퍼 함수
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl)
  return await res.blob()
}

// 최종 PDF 로드
const loadFinalPdf = async (pdfUrl) => {
  try {
    console.log('최종 PDF 로드 시도:', pdfUrl)

    // S3 URL로부터 PDF 데이터 가져오기
    const response = await fetch(pdfUrl, {
      mode: 'cors',
      headers: {
        Accept: 'application/pdf',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('최종 PDF 데이터 크기:', arrayBuffer.byteLength, 'bytes')

    if (arrayBuffer.byteLength === 0) {
      throw new Error('빈 PDF 파일입니다')
    }

    // ArrayBuffer 복사본 생성
    const pdfCopy = arrayBuffer.slice()
    finalPdfData.value = pdfCopy
    console.log('최종 PDF 로드 완료')
  } catch (error) {
    console.error('최종 PDF 로드 실패:', error)
    // 테스트 URL인 경우 간단한 처리
    if (pdfUrl && pdfUrl.includes('test-pdf-url.com')) {
      console.log('테스트 URL 감지 - 완료 화면 표시')
      finalPdfData.value = 'test-completed'
    } else {
      // URL 자체를 사용해보기
      finalPdfData.value = pdfUrl
    }
  }
}

// 상태 폴링 (WebSocket 대안)
let pollingInterval = null

const startStatusPolling = () => {
  console.log('상태 폴링 시작')

  // 즉시 한 번 실행
  getExportStatus(contractId.value)
    .then((status) => {
      if (status) {
        console.log('초기 폴링 상태:', status)
        exportStatus.value = status
      }
    })
    .catch((err) => {
      console.error('초기 상태 조회 실패:', err)
    })

  pollingInterval = setInterval(async () => {
    try {
      const status = await getExportStatus(contractId.value)
      console.log('폴링 상태 확인:', status)

      // null 체크
      if (!status) {
        console.warn('상태 조회 결과가 null입니다')
        return
      }

      // 상태 업데이트
      exportStatus.value = status

      // 양쪽 서명 완료 확인
      if (status.ownerSignatureCompleted && status.buyerSignatureCompleted) {
        console.log('양쪽 서명 완료 확인!')

        // 최종 PDF가 생성되었으면
        if (status.finalPdfUrl) {
          console.log('최종 계약서 생성 완료!')
          stopStatusPolling()
          isWaitingForOther.value = false
          isLoading.value = false

          // 완료 화면으로 이동
          loadFinalPdf(status.finalPdfUrl).then(() => {
            currentStep.value = 'complete'
            alert('계약서 서명이 완료되어 최종 계약서가 생성되었습니다!')
          })
        } else {
          // PDF 생성 중
          console.log('최종 계약서 생성 중...')
          isLoading.value = true
        }
      }

      // 완료 상태 확인 (별도 체크)
      if ((status.isCompleted || status.completed) && status.finalPdfUrl) {
        console.log('폴링: 최종 계약서 생성 완료!')
        stopStatusPolling()
        isWaitingForOther.value = false
        isLoading.value = false

        // 완료 화면으로 이동
        if (currentStep.value === 'waiting') {
          loadFinalPdf(status.finalPdfUrl).then(() => {
            currentStep.value = 'complete'
            alert('계약서 서명이 완료되어 최종 계약서가 생성되었습니다!')
          })
        }
      }
    } catch (error) {
      console.error('상태 폴링 실패:', error)
    }
  }, 2000) // 2초마다 확인
}

const stopStatusPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('상태 폴링 중지')
  }
}

const { openConfirmModal } = useConfirmModal()

// 취소
const cancelExport = async () => {
  const confirmed = await openConfirmModal({
    title: '내보내기 취소',
    message: '계약서 내보내기를 취소하시겠습니까?',
  })

  if (confirmed) {
    stopStatusPolling()
    // TODO: 이전 페이지로 이동
    window.history.back()
  }
}

// 계약서 확인하러 가기 매물
const handleGoToHistory = () => {
  router.push('/mypage/contracts')
}
</script>
