<template>
  <div class="mypage-edit">
    <!-- Figma 정확한 매칭 - 상단 헤더 영역 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">정보수정</h1>
      </div>
    </div>

    <!-- 메인 콘텐츠 영역 (Figma 정확한 디자인) -->
    <div class="main-content-area">
      <!-- 편집 카드 -->
      <div class="edit-card">
        <!-- 프로필 이미지 섹션 -->
        <div class="profile-section">
          <div class="profile-image-container">
            <div class="profile-image">
              <img v-if="formData.profileImage" :src="formData.profileImage" alt="Profile" />
              <div v-else class="image-placeholder">
                <i class="fas fa-user"></i>
              </div>
              <button type="button" class="camera-button" @click="handleImageChange">
                <i class="fas fa-camera"></i>
              </button>
            </div>
          </div>
          <p class="profile-change-text">프로필 사진 변경</p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <!-- 닉네임 입력 -->
        <div class="form-section">
          <label for="nickname" class="form-label">닉네임</label>
          <div class="input-with-button">
            <input
              id="nickname"
              v-model="formData.nickname"
              type="text"
              class="form-input"
              placeholder="닉네임을 입력하세요"
            />
            <button type="button" class="check-button" @click="updateNickname">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>

        <!-- 이메일 입력 -->
        <div class="form-section">
          <label for="email" class="form-label">이메일</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input disabled-input"
            disabled
            placeholder="user@example.com"
          />
        </div>

        <!-- 알림 설정 -->
        <div class="notification-section">
          <div class="notification-content">
            <div class="notification-text">
              <h4 class="notification-title">알림 설정</h4>
              <p class="notification-description">새로운 메시지와 업데이트 알림</p>
            </div>
            <button
              type="button"
              class="toggle-switch"
              :class="{ active: notificationEnabled }"
              @click="updateNotification"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
        </div>

        <!-- 회원 탈퇴 버튼 -->
        <div class="withdrawal-section">
          <button type="button" class="withdrawal-button" @click="handleWithdrawal">
            <i class="fas fa-user-times"></i>
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMyPageStore } from '@/stores/mypage'
import { mypageAPI } from '@/apis/mypage'

const router = useRouter()
const authStore = useAuthStore()
const myPageStore = useMyPageStore()

// 폼 데이터
const formData = ref({
  nickname: '',
  email: '',
  profileImage: '',
})

// 알림 설정
const notificationEnabled = ref(true)

// 파일 입력 ref
const fileInput = ref(null)

// 프로필 이미지 변경 버튼 클릭
const handleImageChange = () => {
  fileInput.value?.click()
}

// 닉네임 업데이트
const updateNickname = async () => {
  if (!formData.value.nickname.trim()) {
    alert('닉네임을 입력해주세요.')
    return
  }

  try {
    const response = await mypageAPI.updateNickname(formData.value.nickname)
    if (response.success) {
      alert('닉네임이 변경되었습니다.')
      // authStore 업데이트
      authStore.user = {
        ...authStore.user,
        nickname: formData.value.nickname
      }
    }
  } catch (error) {
    console.error('Nickname update error:', error)
    alert('닉네임 변경에 실패했습니다.')
  }
}

// 알림 설정 업데이트
const updateNotification = async () => {
  try {
    const newStatus = !notificationEnabled.value
    const response = await mypageAPI.updateNotification(newStatus)
    if (response.success) {
      notificationEnabled.value = newStatus
      // authStore 업데이트
      authStore.user = {
        ...authStore.user,
        notificationEnabled: newStatus
      }
      alert('알림 설정이 변경되었습니다.')
    }
  } catch (error) {
    console.error('Notification update error:', error)
    alert('알림 설정 변경에 실패했습니다.')
  }
}

// 파일 선택 처리
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 파일 크기 체크 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다.')
    return
  }

  // 이미지 미리보기
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.profileImage = e.target.result
  }
  reader.readAsDataURL(file)

  // 실제 업로드는 별도 처리
  try {
    const response = await mypageAPI.updateProfileImage(file)
    if (response.success) {
      alert('프로필 사진이 변경되었습니다.')
      // 사용자 정보 업데이트
      authStore.user = {
        ...authStore.user,
        profileImageUrl: response.data
      }
    }
  } catch (error) {
    console.error('Profile image update error:', error)
    alert('프로필 사진 변경에 실패했습니다.')
  }
}

// 회원 탈퇴 처리
const handleWithdrawal = () => {
  if (
    confirm(
      '정말로 회원 탈퇴를 하시겠습니까?\n\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.',
    )
  ) {
    if (confirm('마지막 확인입니다. 정말로 탈퇴하시겠습니까?')) {
      // 회원 탈퇴 처리
      handleAccountDeletion()
    }
  }
}

// 회원 탈퇴 실행
const handleAccountDeletion = async () => {
  try {
    const reason = prompt('탈퇴 사유를 입력해주세요 (선택사항):') || ''
    const response = await mypageAPI.deleteAccount(reason)
    if (response.success) {
      alert('회원 탈퇴가 완료되었습니다.')
      await authStore.logout()
      router.push('/')
    }
  } catch (error) {
    console.error('Account deletion error:', error)
    alert('회원 탈퇴에 실패했습니다.')
  }
}

// 초기 데이터 로드
onMounted(async () => {
  try {
    // API에서 최신 사용자 정보 조회
    const response = await mypageAPI.getMyInfo()
    if (response.success && response.data) {
      formData.value = {
        nickname: response.data.nickname || '',
        email: response.data.email || '',
        profileImage: response.data.profileImageUrl || '',
      }
      notificationEnabled.value = response.data.notificationEnabled || false
      
      // authStore 업데이트
      authStore.user = {
        ...authStore.user,
        nickname: response.data.nickname,
        email: response.data.email,
        profileImageUrl: response.data.profileImageUrl,
        notificationEnabled: response.data.notificationEnabled
      }
    }
  } catch (error) {
    console.error('Failed to load user info:', error)
    // 에러 시 기존 store 데이터 사용
    const user = authStore.user
    if (user) {
      formData.value = {
        nickname: user.nickname || user.name || '',
        email: user.email || '',
        profileImage: user.profileImageUrl || user.profileImage || '',
      }
      notificationEnabled.value = user.notificationEnabled || false
    }
  }
})
</script>

<style scoped>
/* Figma 정확한 디자인 매칭 - MyPage Edit */
.mypage-edit {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

/* 페이지 헤더 (Figma: 65px 높이) */
.page-header {
  height: 65px;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  border-bottom: 1px solid #dde1e4;
}

.header-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 32px;
}

.page-title {
  font-family: Roboto;
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.2;
}

/* 메인 콘텐츠 영역 */
.main-content-area {
  padding: 32px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 제목 섹션 */
.title-section {
  margin-bottom: 24px;
}

.section-title {
  font-family: Roboto;
  font-size: 24px;
  font-weight: 700;
  color: #60584c;
  margin: 0;
  line-height: 1.33;
}

/* 편집 카드 (Figma: 672x554px) */
.edit-card {
  width: 672px;
  height: 554px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0px 10px 15px -3px rgba(0, 0, 0, 0.1),
    0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 프로필 섹션 */
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.profile-image-container {
  position: relative;
  margin-bottom: 12px;
}

.profile-image {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #ffbc00;
  position: relative;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #adb5bd;
}

.camera-button {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  background-color: #ffbc00;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-button:hover {
  background-color: #e6a600;
}

.camera-button i {
  color: #ffffff;
  font-size: 14px;
}

.profile-change-text {
  font-family: Roboto;
  font-size: 14px;
  font-weight: 400;
  color: #696e76;
  margin: 0;
  text-align: center;
  line-height: 1.43;
}

/* 폼 섹션 */
.form-section {
  margin-bottom: 24px;
}

.form-label {
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  color: #484b51;
  margin-bottom: 8px;
  display: block;
  line-height: 1.43;
}

.form-input {
  width: 100%;
  height: 50px;
  padding: 13px 17px;
  border: 1px solid #dde1e4;
  border-radius: 8px;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  background-color: #ffffff;
  transition: all 0.2s ease;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ffbc00;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.1);
}

.form-input::placeholder {
  color: #6b7280;
}

.disabled-input {
  background-color: #f9fafb !important;
  color: #696e76 !important;
  cursor: not-allowed;
}

/* 닉네임 입력 + 체크 버튼 */
.input-with-button {
  display: flex;
  width: 100%;
}

.input-with-button .form-input {
  border-radius: 8px 0 0 8px;
  border-right: none;
  flex: 1;
}

.check-button {
  width: 62px;
  height: 50px;
  background-color: #ffbc00;
  border: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.check-button:hover {
  background-color: #e6a600;
}

.check-button i {
  color: #ffffff;
  font-size: 14px;
}

/* 알림 설정 섹션 */
.notification-section {
  margin-bottom: 25px;
}

.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
}

.notification-text {
  display: flex;
  flex-direction: column;
}

.notification-title {
  font-family: Roboto;
  font-size: 16px;
  font-weight: 500;
  color: #484b51;
  margin: 0 0 2px 0;
  line-height: 1.5;
}

.notification-description {
  font-family: Roboto;
  font-size: 14px;
  font-weight: 400;
  color: #696e76;
  margin: 0;
  line-height: 1.43;
}

/* 토글 스위치 */
.toggle-switch {
  width: 44px;
  height: 24px;
  background-color: #ffbc00;
  border: none;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-switch:not(.active) {
  background-color: #dde1e4;
}

.toggle-slider {
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border-radius: 50%;
  top: 4px;
  left: 4px;
  transition: all 0.2s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

/* 회원 탈퇴 섹션 */
.withdrawal-section {
  border-top: 1px solid #dde1e4;
  padding-top: 25px;
  margin-top: auto;
}

.withdrawal-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 25px;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 4px;
  font-family: Roboto;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.5;
}

.withdrawal-button:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.withdrawal-button i {
  font-size: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content-area {
    padding: 16px;
    align-items: center;
  }

  .edit-card {
    width: 100%;
    max-width: 500px;
    height: auto;
    min-height: 554px;
  }

  .header-content {
    padding: 0 16px;
  }

  .input-with-button {
    flex-direction: column;
  }

  .input-with-button .form-input {
    border-radius: 8px;
    border-right: 1px solid #dde1e4;
    margin-bottom: 8px;
  }

  .check-button {
    width: 100%;
    border-radius: 8px;
  }
}
</style>
