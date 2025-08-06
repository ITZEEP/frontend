<template>
  <div v-if="loading">
    <InfoCardSkeleton />
  </div>
  <div v-else class="card-content">
    <div class="profile-section">
      <div class="profile-image-container">
        <div class="profile-image" @click="handleImageClick">
          <img
            v-if="userInfo.profileImageUrl"
            :src="userInfo.profileImageUrl"
            alt="Profile"
          />
          <div v-else class="image-placeholder">
            <i class="fas fa-user"></i>
          </div>
          <div class="camera-overlay">
            <i class="fas fa-camera"></i>
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-600 text-center">프로필 사진 변경</p>
      <input
        :id="`file-input-${slotIndex}`"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <div class="nickname-section">
      <div class="text-sm font-medium text-gray-700 mb-2">닉네임</div>
      <div class="w-full h-10">
        <input
          type="text"
          class="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-gray-50"
          :value="userInfo.nickname || '사용자'"
          readonly
        />
      </div>
    </div>

    <div class="notification-section">
      <span class="text-base text-gray-700">알림 설정</span>
      <button
        class="toggle-switch"
        :class="{ active: userInfo.notificationEnabled }"
        @click="toggleNotification"
      >
        <span class="toggle-slider"></span>
      </button>
    </div>

    <div class="w-full h-10 mt-4">
      <button 
        class="w-full h-10 bg-blue-50 border border-blue-500 rounded px-4 py-2 flex justify-center items-center gap-2 text-base text-blue-500 cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:border-blue-600 hover:text-blue-600"
        @click="handleLogout"
      >
        <i class="fas fa-sign-out-alt text-base"></i>
        로그아웃
      </button>
    </div>

    <div class="w-full h-10 mt-4">
      <button 
        class="w-full h-10 bg-red-50 border border-red-200 rounded px-4 py-2 flex justify-center items-center gap-2 text-base text-red-600 cursor-pointer transition-all duration-200 hover:bg-red-100 hover:border-red-300"
        @click="handleWithdrawal"
      >
        <i class="fas fa-user-times text-base"></i>
        회원 탈퇴
      </button>
    </div>
  </div>
  
  <!-- 모달 Alert -->
  <ModalAlert
    v-model="alertState.isOpen"
    :title="alertState.title"
    :message="alertState.message"
    :type="alertState.type"
    :confirm-text="alertState.confirmText"
    :cancel-text="alertState.cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { mypageAPI } from '@/apis/mypage'
import InfoCardSkeleton from '@/components/mypage/skeleton/InfoCardSkeleton.vue'
import ModalAlert from '@/components/common/ModalAlert.vue'

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  },
  slotIndex: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:userInfo'])

const router = useRouter()
const authStore = useAuthStore()

// 모달 상태 관리
const alertState = ref({
  isOpen: false,
  title: '알림',
  message: '',
  type: 'alert',
  confirmText: '확인',
  cancelText: '취소'
})

const alertResolve = ref(null)

const showAlert = (message, title = '알림') => {
  return new Promise((resolve) => {
    alertState.value = {
      isOpen: true,
      title,
      message,
      type: 'alert',
      confirmText: '확인',
      cancelText: '취소'
    }
    alertResolve.value = resolve
  })
}

const showConfirm = (message, title = '확인') => {
  return new Promise((resolve) => {
    alertState.value = {
      isOpen: true,
      title,
      message,
      type: 'confirm',
      confirmText: '확인',
      cancelText: '취소'
    }
    alertResolve.value = resolve
  })
}

const handleConfirm = () => {
  alertState.value.isOpen = false
  if (alertResolve.value) {
    alertResolve.value(true)
    alertResolve.value = null
  }
}

const handleCancel = () => {
  alertState.value.isOpen = false
  if (alertResolve.value) {
    alertResolve.value(false)
    alertResolve.value = null
  }
}

const handleImageClick = () => {
  const inputElement = document.getElementById(`file-input-${props.slotIndex}`)
  if (inputElement) {
    inputElement.click()
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    await showAlert('파일 크기는 5MB 이하여야 합니다.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    emit('update:userInfo', {
      ...props.userInfo,
      profileImageUrl: e.target.result
    })
  }
  reader.readAsDataURL(file)

  try {
    const response = await mypageAPI.updateProfileImage(file)
    if (response.success) {
      await showAlert('프로필 사진이 변경되었습니다.')
      authStore.user = {
        ...authStore.user,
        profileImageUrl: response.data,
      }
      emit('update:userInfo', {
        ...props.userInfo,
        profileImageUrl: response.data
      })
    }
  } catch (error) {
    await showAlert('프로필 사진 변경에 실패했습니다.')
  }
}

const toggleNotification = async () => {
  try {
    const newStatus = !props.userInfo.notificationEnabled
    const response = await mypageAPI.updateNotification(newStatus)
    if (response.success) {
      emit('update:userInfo', {
        ...props.userInfo,
        notificationEnabled: newStatus
      })
      authStore.user = {
        ...authStore.user,
        notificationEnabled: newStatus,
      }
      await showAlert('알림 설정이 변경되었습니다.')
    }
  } catch (error) {
    await showAlert('알림 설정 변경에 실패했습니다.')
  }
}

const handleLogout = async () => {
  const confirmed = await showConfirm('로그아웃 하시겠습니까?', '로그아웃')
  if (confirmed) {
    try {
      await authStore.logout()
      await showAlert('로그아웃되었습니다.')
      window.location.href = '/'
    } catch (error) {
      await showAlert('로그아웃에 실패했습니다.')
    }
  }
}

const handleWithdrawal = () => {
  router.push('/mypage/edit')
}
</script>

<style scoped>
.card-content {
  @apply flex-1 flex flex-col pb-6;
}

.profile-section {
  @apply w-full flex flex-col items-center justify-center;
  height: 95px;
}

.profile-image-container {
  @apply flex justify-center self-stretch mb-2;
}

.profile-image {
  @apply w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-primary relative cursor-pointer;
}

.profile-image img {
  @apply w-full h-full object-cover;
}

.image-placeholder {
  @apply w-full h-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400;
}

.camera-overlay {
  @apply absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-200 rounded-full pointer-events-none;
}

.camera-overlay i {
  @apply text-white text-xl;
}

.profile-image:hover .camera-overlay {
  @apply opacity-100;
}

.nickname-section {
  @apply w-full mt-4 flex flex-col;
  height: 68px;
}

.notification-section {
  @apply w-full h-6 mt-4 flex justify-between items-center;
}

.toggle-switch {
  @apply w-11 h-6 bg-gray-300 border-none rounded-full relative cursor-pointer transition-all duration-200;
}

.toggle-switch.active {
  @apply bg-yellow-primary;
}

.toggle-slider {
  @apply absolute w-4 h-4 bg-white rounded-full transition-all duration-200;
  top: 4px;
  left: 4px;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}
</style>