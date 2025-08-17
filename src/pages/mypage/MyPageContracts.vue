<template>
  <div class="mypage-contracts">
    <!-- Modal Alert -->
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
    <!-- Figma 정확한 매칭 - 상단 헤더 영역 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">계약서관리</h1>
      </div>
    </div>

    <!-- 메인 콘텐츠 영역 (Figma 정확한 디자인) -->
    <div class="main-content-area">
      <!-- 계약서 카드 목록 -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>계약서를 불러오는 중...</p>
      </div>

      <div v-else-if="contracts.length === 0" class="empty-state">
        <i class="fas fa-file-contract"></i>
        <h3>계약서가 없습니다</h3>
        <p>새로운 계약서를 작성해보세요.</p>
      </div>

      <div v-else class="contracts-container">
        <div v-for="contract in contracts" :key="contract.id" class="contract-card">
          <!-- 카드 헤더 -->
          <div class="card-header">
            <h4 class="contract-title">{{ contract.title }}</h4>
            <span class="status-badge" :class="`status-${contract.status}`">
              {{ getStatusLabel(contract.status) }}
            </span>
          </div>

          <!-- 날짜 -->
          <div class="contract-date">
            {{ formatDate(contract.createdAt) }}
          </div>

          <!-- 액션 버튼들 -->
          <div class="contract-actions">
            <button class="view-btn" @click="handleView(contract)">보기</button>
            <button
              class="download-btn"
              :disabled="contract.status !== 'completed'"
              @click="handleDownload(contract)"
            >
              다운로드
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyPageStore } from '@/stores/mypage'
import { mypageAPI } from '@/apis/mypage'
import ModalAlert from '@/components/common/ModalAlert.vue'

const router = useRouter()
const myPageStore = useMyPageStore()

// 모달 상태 관리
const alertState = ref({
  isOpen: false,
  title: '알림',
  message: '',
  type: 'alert',
  confirmText: '확인',
  cancelText: '취소',
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
      cancelText: '취소',
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

// 상태
const loading = ref(true)

// 계약서 목록
const contracts = ref([])

// 상태 라벨
const getStatusLabel = (status) => {
  const labels = {
    STEP0: '사전조사',
    STEP1: '정보확인',
    STEP2: '금액조율',
    ROUND0: '1차 특약조율',
    ROUND1: '2차 특약조율',
    ROUND2: '3차 특약조율',
    ROUND3: '최종 특약선택',
    STEP4: '적법성 검사',
    COMPLETED: '완료',
  }
  return labels[status] || labels[status?.toUpperCase()] || status
}

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day} ${hours}:${minutes}`
}

// 계약서 보기
const handleView = (contract) => {
  router.push(`/contract/view/${contract.id}`)
}

// 계약서 다운로드
const handleDownload = async (contract) => {
  try {
    if (!contract.fileUrl) {
      await showAlert('다운로드할 파일이 없습니다.')
      return
    }

    // 파일 URL로 직접 다운로드
    const link = document.createElement('a')
    link.href = contract.fileUrl
    link.download = contract.title + '.pdf'
    link.click()

    await showAlert('계약서가 다운로드되었습니다.')
  } catch (error) {
    console.error('Download contract error:', error)
    await showAlert('계약서 다운로드에 실패했습니다.')
  }
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

// 데이터 로드
onMounted(async () => {
  try {
    const response = await mypageAPI.getMyContracts(0, 20)

    if (response.success && response.data) {
      contracts.value = response.data.content.map((contract) => ({
        id: contract.contractId,
        title: `${contract.address || '주소 미정'} ${getBuildingTypeLabel(contract.buildingType)} 임대차 계약서`,
        status: contract.status || 'STEP0',
        createdAt: contract.contractDate,
        fileUrl: contract.fileUrl,
        leaseType: contract.leaseType,
      }))
    }
  } catch (error) {
    console.error('Load contracts error:', error)
    await showAlert('계약서 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Figma 정확한 디자인 매칭 - MyPage Contracts */
.mypage-contracts {
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
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.2;
}

/* 브레드크럼 섹션 (Figma: 144px 높이) */
.breadcrumb-section {
  height: 144px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #dde1e4;
}

.breadcrumb-content {
  width: 100%;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb-left {
  flex: 1;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.section-description {
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  margin: 0;
  line-height: 1.4;
}

.breadcrumb-right {
  flex-shrink: 0;
}

.add-contract-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #ff8c00;
  color: #ffffff;
  border: 1px solid #ff8c00;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.add-contract-btn:hover {
  background-color: #ff6600;
  border-color: #ff6600;
}

/* 메인 콘텐츠 영역 (Figma 디자인 매칭) */
.main-content-area {
  padding: 32px;
  background-color: #ffffff;
}

/* 필터 섹션 */
.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999999;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #dde1e4;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  background-color: #ffffff;
  transition: all 0.2s ease;
  line-height: 1.4;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #ff8c00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

.search-input::placeholder {
  color: #999999;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #dde1e4;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.filter-select:focus {
  outline: none;
  border-color: #ff8c00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

/* 로딩 및 빈 상태 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #999999;
}

.loading-state i,
.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ff8c00;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.empty-state p {
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  margin: 0;
  line-height: 1.4;
}

/* 계약서 컨테이너 (Figma 정확한 레이아웃) */
.contracts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 40px;
}

/* 계약서 카드 (Figma: 282.66px x 196px) */
.contract-card {
  width: 282.66px;
  height: 196px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow:
    0px 10px 15px -3px rgba(0, 0, 0, 0.1),
    0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.contract-card:hover {
  box-shadow:
    0px 10px 25px -3px rgba(0, 0, 0, 0.15),
    0px 4px 8px -4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 카드 헤더 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.contract-title {
  font-family: Roboto;
  font-size: 16px;
  font-weight: 500;
  color: #484b51;
  margin: 0;
  flex: 1;
  margin-right: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 상태 배지 */
.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-family: Roboto;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  line-height: 1.33;
}

.status-completed,
.status-COMPLETED {
  background-color: #dcfce7;
  color: #166534;
}

.status-progress {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-draft,
.status-STEP0 {
  background-color: #e0e7ff;
  color: #3730a3;
}

.status-STEP1,
.status-STEP2 {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-ROUND0,
.status-ROUND1,
.status-ROUND2,
.status-ROUND3 {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.status-STEP4 {
  background-color: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 건물 유형 */
.contract-type {
  font-family: Roboto;
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  margin-bottom: 8px;
  line-height: 1.33;
}

/* 날짜 */
.contract-date {
  font-family: Roboto;
  font-size: 14px;
  font-weight: 400;
  color: #696e76;
  margin-bottom: 24px;
  line-height: 1.43;
}

/* 액션 버튼들 */
.contract-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.view-btn,
.download-btn {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: 4px;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.43;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background-color: #f7f7f8;
  color: #484b51;
}

.view-btn:hover {
  background-color: #eaeaeb;
}

.download-btn {
  background-color: #ffbc00;
  color: #484b51;
}

.download-btn:hover:not(:disabled) {
  background-color: #e6a600;
}

.download-btn:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #dde1e4;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666666;
}

.page-btn:hover:not(:disabled) {
  background-color: #fff8e7;
  border-color: #ff8c00;
  color: #ff8c00;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.page-info {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  line-height: 1.4;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .contracts-container {
    gap: 16px;
  }

  .contract-card {
    width: calc(50% - 8px);
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .main-content-area {
    padding: 16px;
  }

  .contracts-container {
    flex-direction: column;
    gap: 16px;
  }

  .contract-card {
    width: 100%;
    min-width: auto;
    height: auto;
    min-height: 196px;
  }

  .section-title {
    font-size: 24px;
  }

  .header-content {
    padding: 0 16px;
  }
}
</style>
