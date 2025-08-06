<template>
  <!-- 로딩 중 표시 -->
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">{{ loadingMessage }}</p>
  </div>

  <!-- Figma 대시보드 카드 컨테이너 (1120x1290px, 3 columns) -->
  <div v-else class="dashboard-cards">
    <!-- 3개 컬럼 -->
    <div v-for="col in 3" :key="`col-${col}`" class="dashboard-column">
      <div
        v-for="slot in getColumnSlots(col - 1)"
        :key="`slot-${slot.globalIndex}`"
        :class="[
          'card-slot',
          {
            'empty-slot': !slot.cardId,
            'drag-over': dragOverIndex === slot.globalIndex && draggedIndex !== slot.globalIndex,
          },
        ]"
        @dragover.prevent="handleDragOver($event, slot.globalIndex)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, slot.globalIndex)"
      >
        <div
          v-if="slot.cardId"
          :class="[
            'dashboard-card',
            `${slot.cardId}-card`,
            {
              dragging: draggedIndex === slot.globalIndex,
            },
          ]"
          :data-card-id="slot.cardId"
          draggable="true"
          @dragstart="handleDragStart($event, slot.globalIndex)"
          @dragend="handleDragEnd"
        >
          <template v-if="slot.cardId === 'info'">
            <div class="card-header">
              <h3 class="card-title">정보 수정</h3>
              <div class="card-icon">
                <i class="fas fa-user-edit"></i>
              </div>
            </div>
            <InfoCard 
              :user-info="userInfo" 
              :slot-index="slot.globalIndex"
              :loading="isLoading"
              @update:user-info="userInfo = $event"
            />
          </template>

          <template v-if="slot.cardId === 'contracts'">
            <div class="card-header">
              <h3 class="card-title">계약서 관리</h3>
              <div class="card-icon">
                <i class="fas fa-file-contract"></i>
              </div>
            </div>
            <ContractsCard :contracts="contracts" :loading="isLoading" />
          </template>

          <template v-if="slot.cardId === 'properties'">
            <div class="card-header">
              <h3 class="card-title">매물 관리</h3>
              <div class="card-icon">
                <i class="fas fa-building"></i>
              </div>
            </div>
            <PropertiesCard 
              :properties="properties"
              :loading="isLoading" 
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </template>

          <template v-if="slot.cardId === 'analysis'">
            <div class="card-header">
              <h3 class="card-title">사기위험도 분석</h3>
              <div class="card-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
            </div>
            <AnalysisCard 
              :analyses="analyses"
              :loading="isLoading" 
              @view-detail="goToAnalysisDetail"
            />
          </template>
        </div>

        <!-- 빈 슬롯 표시 -->
        <div v-else class="empty-slot-content">
          <i class="fas fa-plus-circle"></i>
          <span>여기로 카드를 드래그하세요</span>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMyPageStore } from '@/stores/mypage'
import { mypageAPI } from '@/apis/mypage'
import InfoCard from '@/components/mypage/info/InfoCard.vue'
import ContractsCard from '@/components/mypage/contracts/ContractsCard.vue'
import PropertiesCard from '@/components/mypage/properties/PropertiesCard.vue'
import AnalysisCard from '@/components/mypage/analysis/AnalysisCard.vue'
import ModalAlert from '@/components/common/ModalAlert.vue'

const router = useRouter()
const authStore = useAuthStore()
const myPageStore = useMyPageStore()

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

// 사용자 정보
const user = computed(() => authStore.user)

// API에서 받은 사용자 정보
const userInfo = ref({
  nickname: '',
  email: '',
  profileImageUrl: '',
  notificationEnabled: false,
})

// 로딩 상태
const isLoading = ref(true)
const loadingMessage = ref('데이터를 불러오는 중...')

// 실제 데이터 (초기값은 빈 배열)
const contracts = ref([])
const properties = ref([])
const analyses = ref([])

// 드래그 앤 드롭 상태
const draggedIndex = ref(null)
const dragOverIndex = ref(null)
const cardOrder = ref(['info', 'contracts', 'properties', 'analysis', null, null, null, null, null])

// 카드 참조
const cardRefs = ref({})

// 파일 입력 ref
const fileInput = ref(null)

// 3개 컬럼에 카드 분배
const getColumnSlots = (columnIndex) => {
  const slots = []
  for (let i = columnIndex; i < cardOrder.value.length; i += 3) {
    slots.push({
      cardId: cardOrder.value[i],
      globalIndex: i,
    })
  }
  return slots
}

// 상태 라벨
const getStatusLabel = (status) => {
  const labels = {
    // 계약서 상태
    completed: '완료',
    progress: '진행중',
    draft: '작성중',
    cancelled: '취소',
    // 매물 상태 (HomeStatus)
    AVAILABLE: '입주가능',
    RESERVED: '예약중',
    CONTRACTED: '계약완료',
    // Legacy mappings
    available: '입주가능',
    reserved: '예약중',
    contracted: '계약완료',
    active: '입주가능',
    pending: '예약중',
    sold: '계약완료',
    hidden: '숨김',
  }
  return labels[status] || labels[status.toUpperCase()] || status
}

// 건물 유형 라벨 (ResidenceType)
const getBuildingTypeLabel = (type) => {
  if (!type) return '부동산'

  const labels = {
    APARTMENT: '아파트',
    VILLA: '빌라',
    OFFICETEL: '오피스텔',
    HOUSE: '단독주택',
    OPEN_ONE_ROOM: '오픈형 원룸',
    SEPARATED_ONE_ROOM: '분리형 원룸',
    TWO_ROOM: '투룸',
  }
  return labels[type] || type
}

// 위험도 라벨 (RiskType)
const getRiskLabel = (level) => {
  const labels = {
    low: '안전', // SAFE
    medium: '경고', // WARN
    high: '위험', // DANGER
  }
  return labels[level] || '분석중'
}

// 임대 유형 라벨 (LeaseType)
const getLeaseTypeLabel = (type) => {
  const labels = {
    JEONSE: '전세',
    WOLSE: '월세',
  }
  return labels[type] || type
}

// 카드 컴포넌트 매핑
const cardComponents = {
  info: 'info-card',
  contracts: 'contracts-card',
  properties: 'properties-card',
  analysis: 'analysis-card',
}

// 가격 포맷
const formatPrice = (price) => {
  if (!price) return '-'

  if (price >= 10000) {
    const billion = Math.floor(price / 10000)
    return `전세 ${billion}억`
  } else {
    return `월세 80/50`
  }
}

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '오늘'
  } else if (days === 1) {
    return '어제'
  } else if (days < 7) {
    return `${days}일 전`
  } else {
    return date.toLocaleDateString('ko-KR')
  }
}

// 날짜 시간 포맷 (계약서용)
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}.${month}.${day} ${hours}:${minutes}`
}

// 가입일 포맷
const formatJoinDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

// 알림 설정 토글
const toggleNotification = async () => {
  try {
    const newStatus = !userInfo.value.notificationEnabled
    const response = await mypageAPI.updateNotification(newStatus)
    if (response.success) {
      userInfo.value.notificationEnabled = newStatus
      authStore.user = {
        ...authStore.user,
        notificationEnabled: newStatus,
      }
      await showAlert('알림 설정이 변경되었습니다.')
    }
  } catch (error) {
    console.error('Notification update error:', error)
    await showAlert('알림 설정 변경에 실패했습니다.')
  }
}

// 로그아웃 처리
const handleLogout = async () => {
  const confirmed = await showConfirm('로그아웃 하시겠습니까?')
  if (confirmed) {
    try {
      await authStore.logout()
      await showAlert('로그아웃되었습니다.')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      await showAlert('로그아웃에 실패했습니다.')
    }
  }
}

// 회원 탈퇴 처리
const handleWithdrawal = () => {
  router.push('/mypage/edit')
}

const handleImageClick = (slotIndex) => {
  const inputElement = document.getElementById(`file-input-${slotIndex}`)
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
    userInfo.value.profileImageUrl = e.target.result
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
      userInfo.value.profileImageUrl = response.data
    }
  } catch (error) {
    await showAlert('프로필 사진 변경에 실패했습니다.')
  }
}

// 드래그 앤 드롭 핸들러
const handleDragStart = (event, index) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.innerHTML)
}

const handleDragEnd = (event) => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'

  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleDragLeave = (event) => {
  // Only clear dragOverIndex if we're leaving the card entirely
  if (!event.currentTarget.contains(event.relatedTarget)) {
    dragOverIndex.value = null
  }
}

const handleDrop = (event, dropIndex) => {
  event.preventDefault()

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    dragOverIndex.value = null
    return
  }

  const newOrder = [...cardOrder.value]
  const draggedCard = newOrder[draggedIndex.value]

  // 빈 슬롯으로 이동하는 경우
  if (!newOrder[dropIndex]) {
    newOrder[draggedIndex.value] = null
    newOrder[dropIndex] = draggedCard
  } else {
    // 카드끼리 위치 교환
    newOrder[draggedIndex.value] = newOrder[dropIndex]
    newOrder[dropIndex] = draggedCard
  }

  cardOrder.value = newOrder
  dragOverIndex.value = null

  // Save to localStorage
  localStorage.setItem('mypage-card-order', JSON.stringify(newOrder))
}

// 매물 수정
const handleEdit = (property) => {
  router.push(`/home/edit/${property.id}`)
}

// 매물 삭제
const handleDelete = async (property) => {
  const confirmed = await showConfirm('정말로 이 매물을 삭제하시겠습니까a?', '매물 삭제')
  if (confirmed) {
    try {
      await myPageStore.deleteProperty(property.id)
      await showAlert('매물이 삭제되었습니다.')
    } catch (error) {
      await showAlert('매물 삭제에 실패했습니다.')
    }
  }
}

// 사기위험도 분석 상세보기
const goToAnalysisDetail = (analysis) => {
  router.push(`/risk-check/result/${analysis.id}`)
}

onMounted(async () => {
  isLoading.value = true

  const savedOrder = localStorage.getItem('mypage-card-order')
  if (savedOrder) {
    try {
      const parsed = JSON.parse(savedOrder)
      while (parsed.length < 9) {
        parsed.push(null)
      }
      cardOrder.value = parsed
    } catch (error) {
      // 기본 순서 사용
    }
  }

  if (!authStore.isLoggedIn) {
    await showAlert('로그인이 필요합니다.')
    router.push('/auth/signin')
    return
  }

  try {
    loadingMessage.value = '사용자 정보를 불러오는 중...'
    const myInfoResponse = await mypageAPI.getMyInfo()

    if (myInfoResponse.success && myInfoResponse.data) {
      userInfo.value = {
        nickname: myInfoResponse.data.nickname || '',
        email: myInfoResponse.data.email || '',
        profileImageUrl: myInfoResponse.data.profileImageUrl || '',
        notificationEnabled: myInfoResponse.data.notificationEnabled || false,
      }

      authStore.user = {
        ...authStore.user,
        nickname: myInfoResponse.data.nickname,
        email: myInfoResponse.data.email,
        profileImageUrl: myInfoResponse.data.profileImageUrl,
        notificationEnabled: myInfoResponse.data.notificationEnabled,
      }
    }

    loadingMessage.value = '계약서 목록을 불러오는 중...'
    const contractsResponse = await mypageAPI.getMyContracts()

    if (contractsResponse.success && contractsResponse.data) {
      contracts.value = contractsResponse.data.content.map((contract) => ({
        id: contract.contractId,
        title: `${contract.address || '주소 미정'} (${getBuildingTypeLabel(contract.buildingType)})`,
        status: contract.status
          ? contract.status.toLowerCase().replace('in_progress', 'progress')
          : 'progress',
        createdAt: contract.contractDate,
        fileUrl: contract.fileUrl,
        leaseType: contract.leaseType,
      }))
    }

    loadingMessage.value = '매물 목록을 불러오는 중...'
    const propertiesResponse = await mypageAPI.getMyProperties()

    if (propertiesResponse.success && propertiesResponse.data) {
      properties.value = propertiesResponse.data.content.map((property) => ({
        id: property.propertyId,
        title: property.address || '주소 미정',
        status: property.status ? property.status.toLowerCase() : 'active',
        price: property.leaseType === 'JEONSE' ? 50000 : 8050,
        images: property.imageUrl ? [property.imageUrl] : [],
        viewCount: property.viewCount || 0,
        likeCount: property.likeCount || 0,
        type: property.buildingType || 'APARTMENT',
      }))
    }

    loadingMessage.value = '사기위험도 분석 이력을 불러오는 중...'
    const analysesResponse = await mypageAPI.getMyRiskAnalyses()

    if (analysesResponse.success && analysesResponse.data) {
      analyses.value = analysesResponse.data.content.map((analysis) => ({
        id: analysis.analysisId,
        title: `${analysis.address || '주소 미정'} (${getBuildingTypeLabel(analysis.buildingType)})`,
        riskLevel:
          analysis.riskType === 'SAFE' ? 'low' : analysis.riskType === 'WARN' ? 'medium' : 'high',
        createdAt: analysis.analysisDate,
      }))
    }
  } catch (error) {
    await showAlert('데이터를 불러오는 중 오류가 발생했습니다.')
    contracts.value = []
    properties.value = []
    analyses.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Figma 완전 동일 디자인 매칭 - Dashboard Cards */

/* 대시보드 카드 컨테이너 */
.dashboard-cards {
  width: 100%;
  max-width: 1120px;
  min-height: 600px;
  height: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: start;
}

/* 대시보드 컬럼 */
.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 카드 슬롯 */
.card-slot {
  position: relative;
  width: 100%;
}

/* 빈 슬롯 */
.empty-slot {
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-height: 200px;
  width: 100%;
}

.empty-slot:hover {
  border-color: #d1d5db;
  background-color: #f3f4f6;
}

.empty-slot.drag-over {
  border-color: #fbbf24;
  background-color: #fef3c7;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
}

/* 빈 슬롯 콘텐츠 */
.empty-slot-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 20px;
  min-height: 200px;
  width: 100%;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.empty-slot-content:hover {
  border-color: #d1d5db;
  background-color: #f3f4f6;
}

.empty-slot-content i {
  font-size: 32px;
  color: #d1d5db;
}

.card-slot.drag-over .empty-slot-content {
  border-color: #fbbf24;
  background-color: #fef3c7;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
  color: #92400e;
}

.card-slot.drag-over .empty-slot-content i {
  color: #f59e0b;
}

/* 대시보드 카드 공통 스타일 */
.dashboard-card {
  @apply bg-white rounded-2xl p-6 shadow-sm border border-gray-300;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: auto;
  cursor: move;
  transition: all 0.3s ease;
  position: relative;
}

.dashboard-card:hover {
  @apply shadow-md;
  transform: translateY(-2px);
}

.dashboard-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: scale(0.95);
  z-index: 1000;
}

.card-slot.drag-over .dashboard-card {
  transform: scale(0.95);
  opacity: 0.8;
}

/* 카드별 높이 설정은 인라인 스타일로 처리 */

/* 카드 헤더 (24px bottom margin) */
.card-header {
  @apply w-full h-8 flex justify-between items-center mb-6;
}

/* 카드 제목 */
.card-title {
  @apply text-xl font-semibold text-gray-warm-700 m-0;
  line-height: 1.4;
}

/* 카드 아이콘 */
.card-icon {
  @apply flex items-center justify-center text-gray-warm-700;
}

.card-icon i {
  @apply text-2xl;
}

/* 카드 콘텐츠 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px; /* 하단 여백 추가 */
}

.info-card .card-content {
  width: 100%;
  min-height: 200px;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.contracts-card .card-content {
  width: 100%;
  min-height: 200px;
  height: auto;
}

.properties-card .card-content {
  width: 100%;
  min-height: 200px;
  height: auto;
}

.analysis-card .card-content {
  width: 100%;
  min-height: 200px;
  height: auto;
}

/* === 정보수정 카드 스타일 === */

/* 프로필 섹션 (309.33x95px) */
.profile-section {
  width: 100%;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.profile-image-container {
  display: flex;
  justify-content: center;
  align-self: stretch;
  margin-bottom: 8px;
}

.profile-image {
  @apply w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-primary relative cursor-pointer;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  @apply w-full h-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 50%;
  pointer-events: none;
}

.camera-overlay i {
  color: white;
  font-size: 20px;
}

.profile-image:hover .camera-overlay {
  opacity: 1;
}

.profile-change-text {
  @apply w-full h-4 text-sm font-normal text-gray-600 text-center m-0;
  line-height: 1.14;
}

/* 닉네임 섹션 (309.33x68px, 16px top margin) */
.nickname-section {
  width: 100%;
  height: 68px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
}

.nickname-label {
  @apply text-sm font-medium text-gray-700 mb-2;
  line-height: 1.43;
}

.nickname-input-row {
  width: 100%;
  height: 40px;
  display: flex;
}

.nickname-input {
  @apply w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm font-normal text-gray-700 bg-gray-50 box-border;
  line-height: 1.43;
}

/* 알림 설정 (309.33x24px, 16px top margin) */
.notification-section {
  width: 100%;
  height: 24px;
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-label {
  @apply text-base font-normal text-gray-700 flex items-center;
  width: 70px;
  height: 20px;
  line-height: 1.25;
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

/* 회원 탈퇴 섹션 (309.33x42px, 16px top margin) */
.withdrawal-section {
  width: 100%;
  height: 42px;
  margin-top: 16px;
}

.withdrawal-button {
  @apply w-full h-10 bg-red-50 border border-red-200 rounded px-4 py-2 flex justify-center items-center gap-2 text-base font-normal text-red-600 cursor-pointer transition-all duration-200;
  line-height: 1.5;
}

.withdrawal-button:hover {
  @apply bg-red-100 border-red-300;
}

.withdrawal-button i {
  font-size: 16px;
}

/* 로그아웃 섹션 (309.33x42px, 16px top margin) */
.logout-section {
  width: 100%;
  height: 42px;
  margin-top: 16px;
}

.logout-button {
  @apply w-full h-10 bg-blue-50 border border-blue-500 rounded px-4 py-2 flex justify-center items-center gap-2 text-base font-normal text-blue-500 cursor-pointer transition-all duration-200;
  line-height: 1.5;
}

.logout-button:hover {
  @apply bg-blue-100 border-blue-600 text-blue-600;
}

.logout-button i {
  font-size: 16px;
}

/* === 계약서관리 카드 스타일 === */

/* 계약서 아이템 */
.contract-item {
  @apply w-full border border-gray-300 rounded-lg p-4 mb-4 box-border flex flex-col;
  min-height: 126px;
  height: auto;
}

.contract-item:last-of-type {
  margin-bottom: 0;
}

/* 계약서 헤더 */
.contract-header {
  width: 100%;
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.contract-title {
  @apply text-sm font-medium text-gray-700 m-0 flex-1 mr-2;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* 계약서 건물 유형 */
.contract-type {
  @apply text-xs font-normal text-gray-500 mb-2;
  line-height: 1.33;
}

.contract-status {
  @apply text-xs font-medium px-2 py-1 rounded;
  line-height: 1.33;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.status-progress {
  @apply bg-yellow-100 text-yellow-900;
}

.status-draft {
  @apply bg-indigo-100 text-indigo-800;
}

.status-cancelled {
  @apply bg-red-100 text-red-800;
}

/* 계약서 날짜 */
.contract-date {
  @apply w-full h-4 text-sm font-normal text-gray-600 mb-3;
  line-height: 1.14;
}

/* 계약서 액션 */
.contract-actions {
  width: 100%;
  height: 32px;
  display: flex;
  gap: 8px;
}

.view-btn,
.download-btn {
  @apply flex-1 h-8 border-none rounded text-sm font-medium px-3 py-2 cursor-pointer transition-all duration-200 flex items-center justify-center;
  line-height: 1.43;
}

.view-btn {
  @apply bg-gray-100 text-gray-700;
}

.download-btn {
  @apply bg-gray-100 text-gray-700 ml-2;
}

.view-btn:hover {
  @apply bg-gray-200;
}

.download-btn:hover:not(:disabled) {
  @apply bg-gray-200;
}

.download-btn:disabled {
  @apply bg-gray-50 text-gray-400;
  cursor: not-allowed;
  opacity: 0.6;
}

/* === 매물관리 카드 스타일 === */

/* 매물 아이템 */
.property-item {
  @apply w-full border border-gray-300 rounded-lg p-px mb-6 box-border flex flex-col overflow-hidden;
  min-height: 270px;
  height: auto;
}

/* 매물 이미지 */
.property-image {
  width: 100% !important;
  height: 128px !important;
}

/* PropertyImage 내부 요소 크기 조정 */
.property-image :deep(> div) {
  width: 100% !important;
  height: 100% !important;
}

.property-image :deep(img),
.property-image :deep(.w-48),
.property-image :deep(.h-48) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
}

.property-image :deep(.bg-gradient-to-br) {
  border-radius: 0 !important;
  border: none !important;
}

/* 매물 정보 */
.property-info {
  width: 100%;
  min-height: 140px;
  height: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 매물 헤더 */
.property-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.property-title {
  @apply text-sm font-medium text-gray-700 m-0 flex-1 mr-2;
  line-height: 1.4;
  word-break: break-word;
}

.property-status {
  @apply text-xs font-medium px-2 py-1 rounded;
  line-height: 1.33;
}

.status-available,
.status-active {
  @apply bg-green-100 text-green-800;
}

.status-reserved,
.status-pending {
  @apply bg-yellow-100 text-yellow-900;
}

.status-contracted,
.status-sold {
  @apply bg-indigo-100 text-indigo-800;
}

.status-hidden {
  @apply bg-gray-100 text-gray-700;
}

/* 입주 가능 상태 배지 */
.availability-badge {
  @apply text-xs font-medium px-2 py-1 rounded-full;
  line-height: 1.33;
}

.availability-immediate {
  @apply bg-green-100 text-green-800;
}

.availability-negotiable {
  @apply bg-indigo-100 text-indigo-800;
}

.availability-date {
  @apply bg-yellow-100 text-yellow-900;
}

.availability-unavailable {
  @apply bg-red-100 text-red-800;
}

/* 매물 건물 유형 */
.property-type {
  @apply text-xs font-normal text-gray-500 mb-2;
  line-height: 1.33;
}

/* 매물 가격 */
.property-price {
  @apply w-full text-lg font-bold text-yellow-primary mb-2;
  line-height: 1.56;
}

/* 매물 통계 */
.property-stats {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-item {
  @apply text-sm font-normal text-gray-600 flex items-center gap-1;
  line-height: 1.43;
}

.stat-item i {
  @apply text-gray-600 w-3.5;
}

/* 매물 액션 */
.property-actions {
  width: 100%;
  height: 32px;
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.edit-btn,
.delete-btn {
  @apply flex-1 h-8 border-none rounded text-sm font-normal cursor-pointer transition-all duration-200 flex items-center justify-center p-0;
  line-height: 1.43;
}

.edit-btn {
  @apply bg-gray-100 text-gray-700;
}

.delete-btn {
  @apply bg-red-50 text-red-600;
}

.edit-btn:hover {
  @apply bg-gray-200;
}

.delete-btn:hover {
  @apply bg-red-100;
}

/* === 사기위험도분석 카드 스타일 === */

/* 분석 아이템 */
.analysis-item {
  @apply w-full border border-gray-300 rounded-lg p-4 mb-6 box-border flex flex-col;
  min-height: 118px;
  height: auto;
}

/* 분석 헤더 */
.analysis-header {
  width: 100%;
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.analysis-title {
  @apply text-sm font-medium text-gray-700 m-0 flex-1;
  line-height: 1.4;
  word-break: break-word;
}

/* 분석 건물 유형 */
.analysis-type {
  @apply text-xs font-normal text-gray-500 mb-2;
  line-height: 1.33;
}

.risk-level {
  @apply text-xs font-medium px-2 py-1 rounded;
  line-height: 1.33;
}

/* 분석 날짜 */
.analysis-date {
  @apply w-full h-4 text-sm font-normal text-gray-600 mb-3;
  line-height: 1.14;
}

/* 분석 액션 */
.analysis-actions {
  width: 100%;
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.risk-badge {
  @apply text-xs font-medium px-2 py-1 rounded flex items-center justify-center;
  width: 48.61px;
  height: 20px;
  line-height: 1.33;
}

.risk-low {
  @apply bg-green-100 text-green-800;
}

.risk-medium {
  @apply bg-yellow-100 text-yellow-900;
}

.risk-high {
  @apply bg-red-100 text-red-800;
}

.detail-btn {
  @apply bg-gray-100 border-none rounded text-xs font-medium text-gray-700 px-3 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center;
  width: 88.64px;
  height: 24px;
  line-height: 1.33;
}

.detail-btn:hover {
  @apply bg-gray-200;
}

/* === 전체보기 버튼 공통 === */

.view-all-section {
  margin-top: 24px; /* 여백 증가 */
  margin-bottom: 8px; /* 하단 여백 추가 */
}

.view-all-button {
  @apply w-full h-10 border border-yellow-primary rounded bg-white text-base font-normal text-yellow-primary no-underline px-4 py-2 flex justify-center items-center cursor-pointer transition-all duration-200 box-border;
  line-height: 1.5;
}

.view-all-button:hover {
  @apply bg-yellow-50;
}

/* 로딩 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #ffbc00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 빈 상태 스타일 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }

  .dashboard-column {
    width: 100%;
  }

  .card-header {
    width: 100%;
  }

  .card-content {
    width: 100%;
    height: auto;
  }

  .properties-card .card-header,
  .properties-card .card-content {
    width: 100%;
  }

  .contract-item,
  .property-item,
  .analysis-item {
    width: 100%;
  }

  .contract-header,
  .contract-date,
  .contract-actions,
  .property-header,
  .property-price,
  .property-stats,
  .property-actions,
  .analysis-header,
  .analysis-date,
  .analysis-actions {
    width: 100%;
  }

  .view-all-button {
    width: 100%;
  }
}
</style>
