<template>
  <div class="p-4 border-t bg-white">
    <div class="flex space-x-2">
      <!-- 파일 업로드 버튼 -->
      <div class="relative" ref="fileMenuContainer">
        <button
          @click="showFileMenu = !showFileMenu"
          class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </button>

        <!-- 파일 메뉴 -->
        <div
          v-if="showFileMenu"
          class="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg py-2 w-48 z-10"
        >
          <button
            @click="openFileInput('image')"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>🖼️</span>
            <span>사진</span>
          </button>
          <button
            @click="openFileInput('video')"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>🎬</span>
            <span>동영상</span>
          </button>
          <button
            @click="openFileInput('file')"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>📎</span>
            <span>파일</span>
          </button>
        </div>
      </div>

      <!-- 메시지 입력창 -->
      <input
        v-model="messageInput"
        @keyup.enter="sendMessage"
        @input="handleTyping"
        class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="메시지를 입력하세요"
        :disabled="isUploading"
      />

      <!-- 전송 버튼 -->
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim() || isUploading"
        class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <span v-if="isUploading">업로드중...</span>
        <span v-else>전송</span>
      </button>
    </div>

    <!-- 파일 입력 (숨김) -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileSelect"
      :accept="fileAccept"
    />

    <!-- 업로드 진행 상태 -->
    <div v-if="isUploading" class="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div class="flex items-center space-x-2">
        <div
          class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
        ></div>
        <span class="text-sm text-blue-700">{{ uploadingFileName }} 업로드 중...</span>
      </div>
      <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { uploadChatFile } from '@/components/chat/apis/chatApi'

const emit = defineEmits(['sendMessage', 'typing'])

const props = defineProps({
  chatRoomId: {
    type: [Number, String],
    required: true,
    validator: (value) => value !== null && value !== undefined,
  },
  receiverId: {
    type: [Number, String],
    required: true,
    validator: (value) => value !== null && value !== undefined,
  },
})

const messageInput = ref('')
const showFileMenu = ref(false)
const fileInput = ref(null)
const fileMenuContainer = ref(null)
const fileAccept = ref('')
const currentFileType = ref('')

// 업로드 상태
const isUploading = ref(false)
const uploadingFileName = ref('')
const uploadProgress = ref(0)

// 타이핑 상태
let typingTimer = null

function sendMessage() {
  const content = messageInput.value.trim()
  if (!content) return

  emit('sendMessage', content)
  messageInput.value = ''
}

function handleTyping() {
  emit('typing', true)

  // 타이핑 중지 타이머
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    emit('typing', false)
  }, 1000)
}

function openFileInput(type) {
  currentFileType.value = type
  showFileMenu.value = false

  // 파일 타입별 accept 설정
  switch (type) {
    case 'image':
      fileAccept.value = 'image/*'
      break
    case 'video':
      fileAccept.value = 'video/*'
      break
    case 'file':
      fileAccept.value = '*/*'
      break
  }

  // 파일 입력창 열기
  nextTick(() => {
    fileInput.value?.click()
  })
}

async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // 파일 크기 검증 (10MB 제한)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('파일 크기는 10MB 이하여야 합니다.')
    event.target.value = ''
    return
  }

  if (!props.chatRoomId || !props.receiverId) {
    alert('채팅방 정보가 없습니다.')
    console.error('Props 누락:', {
      chatRoomId: props.chatRoomId,
      receiverId: props.receiverId,
    })
    event.target.value = ''
    return
  }

  try {
    isUploading.value = true
    uploadingFileName.value = file.name
    uploadProgress.value = 0

    // 업로드 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20
      }
    }, 200)

    console.log('파일 업로드 시작:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      chatRoomId: props.chatRoomId,
      receiverId: props.receiverId,
    })

    // 파일 업로드 API 호출
    const result = await uploadChatFile(file, props.chatRoomId, props.receiverId)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    console.log('파일 업로드 및 메시지 전송 완료:', result)

    // 성공 메시지 표시 (짧은 시간)
    setTimeout(() => {
      isUploading.value = false
      uploadingFileName.value = ''
      uploadProgress.value = 0
    }, 500)
  } catch (error) {
    console.error('파일 업로드 실패:', error)
    isUploading.value = false
    uploadingFileName.value = ''
    uploadProgress.value = 0

    // 에러 알림
    alert('파일 업로드에 실패했습니다: ' + error.message)
  } finally {
    // 파일 입력 초기화
    event.target.value = ''
  }
}

// 외부 클릭 핸들러
function handleOutsideClick(event) {
  if (fileMenuContainer.value && !fileMenuContainer.value.contains(event.target)) {
    showFileMenu.value = false
  }
}

// 컴포넌트 라이프사이클
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
})
</script>
