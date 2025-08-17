<template>
  <div v-if="loading">
    <PropertiesCardSkeleton />
  </div>
  <div v-else class="card-content">
    <div v-if="properties.length === 0" class="empty-state">
      <i class="fas fa-building text-5xl text-gray-300 mb-4"></i>
      <p class="text-sm text-gray-600">등록된 매물이 없습니다.</p>
    </div>

    <div v-else>
      <div
        v-for="(property, index) in properties.slice(0, 2)"
        :key="index"
        class="property-item"
      >
        <PropertyImage
          :src="property.images?.[0]"
          :alt="property.title"
          :property-type="property.type || '매물'"
          size="large"
          rounded="none"
          class="property-image"
        />

        <div class="property-info">
          <div class="property-header">
            <h4 class="property-title">{{ property.title }}</h4>
            <span class="property-status" :class="`status-${property.status}`">
              {{ getStatusLabel(property.status) }}
            </span>
          </div>

          <div class="text-xs text-gray-500 mb-2">
            {{ getBuildingTypeLabel(property.type) }}
          </div>

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

          <div class="property-actions">
            <button class="edit-btn" @click="$emit('edit', property)">수정</button>
            <button class="delete-btn" @click="$emit('delete', property)">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <div class="view-all-section">
      <router-link to="/mypage/properties" class="view-all-button">
        전체보기
      </router-link>
    </div>
  </div>
</template>

<script setup>
import PropertyImage from '@/components/common/PropertyImage.vue'
import PropertiesCardSkeleton from '@/components/mypage/skeleton/PropertiesCardSkeleton.vue'

defineProps({
  properties: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])

const getStatusLabel = (status) => {
  const labels = {
    AVAILABLE: '입주가능',
    RESERVED: '예약중',
    CONTRACTED: '계약완료',
    available: '입주가능',
    reserved: '예약중',
    contracted: '계약완료',
    active: '입주가능',
    pending: '예약중',
    sold: '계약완료',
    hidden: '숨김',
  }
  return labels[status] || labels[status?.toUpperCase()] || status
}

const getBuildingTypeLabel = (type) => {
  if (!type) return '부동산'
  
  const labels = {
    APARTMENT: '아파트',
    VILLA: '빌라',
    OFFICETEL: '오피스텔',
    HOUSE: '단독주택',
    OPEN_ONE_ROOM: '오픈형 원룸',
    SEPARATED_ONE_ROOM: '분리형 원룸',
    TWO_ROOM: '투룸'
  }
  return labels[type] || type
}
</script>

<style scoped>
.card-content {
  @apply flex-1 flex flex-col;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-10 text-center;
}

.property-item {
  @apply w-full border border-gray-300 rounded-lg overflow-hidden mb-6 flex flex-col;
  min-height: 270px;
}

.property-image {
  @apply w-full !important;
  height: 128px !important;
}

.property-image :deep(> div) {
  @apply w-full h-full !important;
}

.property-image :deep(img),
.property-image :deep(.w-48),
.property-image :deep(.h-48) {
  @apply w-full h-full rounded-none !important;
}

.property-image :deep(.bg-gradient-to-br) {
  @apply rounded-none border-0 !important;
}

.property-info {
  @apply w-full flex flex-col p-3;
  min-height: 140px;
}

.property-header {
  @apply w-full flex justify-between items-center mb-2;
}

.property-title {
  @apply text-sm font-medium text-gray-700 flex-1 mr-2 truncate;
  max-width: 200px;
}

.property-status {
  @apply text-xs font-medium px-2 py-1 rounded;
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

.property-stats {
  @apply w-full flex justify-between items-center mb-3;
}

.stat-item {
  @apply text-sm text-gray-600 flex items-center gap-1;
}

.stat-item i {
  @apply text-gray-600 text-sm;
}

.property-actions {
  @apply w-full flex gap-3 mt-auto;
}

.edit-btn,
.delete-btn {
  @apply flex-1 h-8 border-none rounded text-sm cursor-pointer transition-all duration-200 flex items-center justify-center;
}

.edit-btn {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.delete-btn {
  @apply bg-red-50 text-red-600 hover:bg-red-100;
}

.view-all-section {
  @apply mt-6 mb-2;
}

.view-all-button {
  @apply w-full h-10 border border-yellow-primary rounded bg-white text-base text-yellow-primary no-underline px-4 py-2 flex justify-center items-center cursor-pointer transition-all duration-200 hover:bg-yellow-50;
}
</style>