<template>
  <div class="white-box">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">계약서 관리</h2>

    <div class="flex flex-col gap-3">
      <DownloadItem
        icon="pdf"
        title="PDF 다운로드"
        description="계약서를 PDF로 저장"
        @click="handleDownload"
      />
      <!-- <DownloadItem
        icon="email"
        title="이메일 전송"
        description="계약서를 이메일로 전송"
        @click="handleEmail"
      /> -->
    </div>

    <!-- 암호 입력 모달 -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">계약서 암호 입력</h3>
        <input
          v-model="contractPassword"
          type="password"
          class="w-full px-4 py-2 border rounded-lg mb-4"
          placeholder="계약서 암호를 입력하세요"
          @keyup.enter="confirmPassword"
        />
        <div class="flex gap-3 justify-end">
          <button
            @click="closePasswordModal"
            class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            취소
          </button>
          <button
            @click="confirmPassword"
            class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>

    <!-- 이메일 입력 모달 -->
    <div
      v-if="showEmailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">이메일 주소 입력</h3>
        <input
          v-model="emailAddress"
          type="email"
          class="w-full px-4 py-2 border rounded-lg mb-2"
          placeholder="이메일 주소를 입력하세요"
        />
        <p class="text-sm text-gray-600 mb-4">
          * 계약서 PDF는 생년월일(YYMMDD)을 암호로 보호되어 전송됩니다.
          <br />
          예: 1990년 1월 1일생 → 900101
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="closeEmailModal"
            class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            취소
          </button>
          <button
            @click="sendEmail"
            class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DownloadItem from './DownloadItem.vue'
import { downloadContractPDF, sendContractEmail } from '@/apis/contractChatApi'
import api from '@/apis/index'

const props = defineProps({
  contractId: {
    type: String,
    required: true,
  },
  finalPdfUrl: {
    type: String,
    default: null,
  },
})

// 모달 상태
const showPasswordModal = ref(false)
const showEmailModal = ref(false)
const contractPassword = ref('')
const emailAddress = ref('')
const currentAction = ref('')

// PDF 다운로드
const handleDownload = async () => {
  if (props.finalPdfUrl) {
    // 서명된 최종 PDF 다운로드 (생년월일로 암호화)
    try {
      // 새로운 엔드포인트 호출 - 역할에 따른 암호화 PDF
      const response = await api.post(
        `/api/contract/${props.contractId}/export/download-pdf`,
        {},
        {
          responseType: 'blob',
        },
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `최종계약서_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      alert('다운로드가 완료되었습니다.\n암호는 귀하의 생년월일(6자리)입니다.')
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('다운로드에 실패했습니다.')
    }
  } else {
    // 미완성 PDF 다운로드 (암호 필요)
    currentAction.value = 'download'
    showPasswordModal.value = true
  }
}

// 이메일 전송
const handleEmail = () => {
  currentAction.value = 'email'
  showEmailModal.value = true // 바로 이메일 모달 표시
}

// 암호 확인
const confirmPassword = async () => {
  if (!contractPassword.value) {
    alert('암호를 입력해주세요.')
    return
  }

  if (currentAction.value === 'download') {
    await downloadPDF()
  } else if (currentAction.value === 'email') {
    showPasswordModal.value = false
    showEmailModal.value = true
  }
}

// PDF 다운로드 실행
const downloadPDF = async () => {
  try {
    const response = await downloadContractPDF(props.contractId, {
      contractPassword: contractPassword.value,
    })

    if (response) {
      // Blob으로 변환하여 다운로드
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contract_${props.contractId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      closePasswordModal()
      alert('다운로드가 완료되었습니다.')
    }
  } catch (error) {
    console.error('다운로드 실패:', error)
    alert('다운로드에 실패했습니다. 암호를 확인해주세요.')
  }
}

// 이메일 전송
const sendEmail = async () => {
  if (!emailAddress.value) {
    alert('이메일 주소를 입력해주세요.')
    return
  }

  try {
    const response = await sendContractEmail(props.contractId, {
      email: emailAddress.value, // 암호 제거, 이메일만 전송
    })

    if (response && response.success) {
      closeEmailModal()
      alert('이메일이 전송되었습니다.\n계약서 PDF는 생년월일(YYMMDD)로 암호화되어 있습니다.')
    }
  } catch (error) {
    console.error('이메일 전송 실패:', error)
    alert('이메일 전송에 실패했습니다.')
  }
}

// 모달 닫기
const closePasswordModal = () => {
  showPasswordModal.value = false
  contractPassword.value = ''
  currentAction.value = ''
}

const closeEmailModal = () => {
  showEmailModal.value = false
  emailAddress.value = ''
  contractPassword.value = ''
  currentAction.value = ''
}
</script>
