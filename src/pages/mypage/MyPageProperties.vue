<template>
  <div class="mypage-properties">
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
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">매물관리</h1>
      </div>
    </div>

    <!-- 메인 콘텐츠 영역 (Figma 정확한 디자인) -->
    <div class="main-content-area">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>매물을 불러오는 중...</p>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="properties.length === 0" class="empty-state">
        <i class="fas fa-home"></i>
        <h3>등록된 매물이 없습니다</h3>
        <p>새로운 매물을 등록해보세요.</p>
        <router-link to="/home/create" class="empty-add-btn"> 매물 등록하기 </router-link>
      </div>

      <!-- 매물 컨테이너 -->
      <div v-else class="properties-container">
        <div v-for="property in properties" :key="property.id" class="property-card">
          <!-- 이미지 -->
          <PropertyImage
            :src="property.images?.[0]"
            :alt="property.title"
            :property-type="property.type || '매물'"
            size="large"
            rounded="none"
            class="property-image"
          />

          <!-- 정보 -->
          <div class="property-info">
            <!-- 제목과 상태 -->
            <div class="property-header">
              <h4 class="property-title">{{ property.title }}</h4>
              <span class="status-badge" :class="`status-${property.status}`">
                {{ getStatusLabel(property.status) }}
              </span>
            </div>

            <!-- 건물 유형 -->
            <div class="property-type">
              {{ getBuildingTypeLabel(property.type) }}
            </div>

            <!-- 통계 -->
            <div class="property-stats">
              <span class="stat-item">
                <i class="fas fa-eye"></i>
                {{ property.viewCount || 0 }}
              </span>
              <span class="stat-item">
                <i class="fas fa-heart"></i>
                {{ property.likeCount || 0 }}
              </span>
            </div>

            <!-- 액션 버튼 -->
            <div class="property-actions">
              <button class="edit-btn" @click="handleEdit(property)">
                <i class="fas fa-edit"></i>
                수정
              </button>
              <button class="delete-btn" @click="handleDelete(property)">
                <i class="fas fa-trash"></i>
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMyPageStore } from '@/stores/mypage'
import PropertyImage from '@/components/common/PropertyImage.vue'
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

// 상태
const loading = ref(true)

// 매물 목록
const properties = ref([])

// 상태 라벨 (HomeStatus)
const getStatusLabel = (status) => {
  const labels = {
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

// 가격 포맷
const formatPrice = (price) => {
  if (!price) return '-'

  // 가격을 억/만원 단위로 표시
  if (price >= 10000) {
    const billion = Math.floor(price / 10000)
    const thousand = Math.floor((price % 10000) / 1000)
    if (thousand > 0) {
      return `전세 ${billion}억 ${thousand}천`
    }
    return `전세 ${billion}억`
  } else if (price >= 1000) {
    return `전세 ${price.toLocaleString()}`
  } else {
    return `월세 ${price}`
  }
}

// 매물 수정
const handleEdit = (property) => {
  router.push(`/home/edit/${property.id}`)
}

// 매물 삭제
const handleDelete = async (property) => {
  const confirmed = await showConfirm('정말로 이 매물을 삭제하시겠습니까?')
  if (confirmed) {
    try {
      // TODO: 매물 삭제 API 구현 후 연결
      await showAlert('매물 삭제 기능은 준비 중입니다.')
      // await mypageAPI.deleteProperty(property.id)
      // 삭제 성공 시 목록에서 제거
      // properties.value = properties.value.filter(p => p.id !== property.id)
      // await showAlert('매물이 삭제되었습니다.')
    } catch (error) {
      console.error('Delete property error:', error)
      await showAlert('매물 삭제에 실패했습니다.')
    }
  }
}

// 데이터 로드
onMounted(async () => {
  try {
    const response = await mypageAPI.getMyProperties(0, 20)

    if (response.success && response.data) {
      properties.value = response.data.content.map((property) => ({
        id: property.propertyId,
        title: property.address || '주소 미정',
        type: property.propertyType,
        status: property.status ? property.status.toLowerCase() : 'active',
        price: property.deposit || property.monthlyRent || 0,
        viewCount: property.viewCount || 0,
        likeCount: property.wishCount || 0,
        images: property.imageUrls || [],
      }))
    }
  } catch (error) {
    console.error('Load properties error:', error)
    await showAlert('매물 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Figma 정확한 디자인 매칭 - MyPage Properties */
.mypage-properties {
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

/* 메인 콘텐츠 영역 (Figma 디자인 매칭) */
.main-content-area {
  padding: 32px;
  background-color: #ffffff;
}

/* 매물 컨테이너 (Figma 정확한 레이아웃) */
.properties-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 40px;
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
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.empty-add-btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: #ff8c00;
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.empty-add-btn:hover {
  background-color: #ff6600;
}

/* 매물 카드 (Figma: 357.33px x 400px) */
.property-card {
  width: 357.33px;
  height: 400px;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0px 10px 15px -3px rgba(0, 0, 0, 0.1),
    0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.property-card:hover {
  box-shadow:
    0px 10px 25px -3px rgba(0, 0, 0, 0.15),
    0px 4px 8px -4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 매물 이미지 */
.property-image {
  width: 100% !important;
  height: 192px !important;
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
  padding: 24px;
  height: 208px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 제목과 상태 헤더 */
.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.property-title {
  font-family: Roboto;
  font-size: 16px;
  font-weight: 600;
  color: #484b51;
  margin: 0;
  flex: 1;
  margin-right: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 건물 유형 */
.property-type {
  font-family: Roboto;
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  margin-bottom: 8px;
  line-height: 1.33;
}

/* 상태 배지 */
.status-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
  line-height: 1.43;
}

.status-available,
.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-reserved,
.status-pending {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-contracted,
.status-sold {
  background-color: #e0e7ff;
  color: #3730a3;
}

.status-hidden {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* 입주 가능 상태 배지 */
.availability-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-family: Roboto;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  line-height: 1.33;
}

.availability-immediate {
  background-color: #dcfce7;
  color: #166534;
}

.availability-negotiable {
  background-color: #e0e7ff;
  color: #3730a3;
}

.availability-date {
  background-color: #fef9c3;
  color: #854d0e;
}

.availability-unavailable {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 가격 */
.property-price {
  font-family: Roboto;
  font-size: 18px;
  font-weight: 700;
  color: #ffbc00;
  margin-bottom: 16px;
  line-height: 1.56;
}

/* 통계 */
.property-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stat-item {
  font-family: Roboto;
  font-size: 14px;
  font-weight: 400;
  color: #696e76;
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1.43;
}

.stat-item i {
  color: #696e76;
  width: 14px;
}

/* 액션 버튼 */
.property-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.edit-btn,
.delete-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 4px;
  font-family: Roboto;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.edit-btn {
  background-color: #f7f7f8;
  color: #484b51;
}

.edit-btn:hover {
  background-color: #eaeaeb;
}

.delete-btn {
  background-color: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background-color: #fee2e2;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .properties-container {
    gap: 16px;
  }

  .property-card {
    width: calc(50% - 8px);
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .main-content-area {
    padding: 16px;
  }

  .breadcrumb-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .breadcrumb-right {
    width: 100%;
  }

  .add-property-btn {
    width: 100%;
    justify-content: center;
  }

  .properties-container {
    flex-direction: column;
    gap: 16px;
  }

  .property-card {
    width: 100%;
    min-width: auto;
    height: auto;
    min-height: 400px;
  }

  .section-title {
    font-size: 24px;
  }

  .section-description {
    font-size: 14px;
  }

  .breadcrumb-content {
    padding: 0 16px;
  }
}
</style>
