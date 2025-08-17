<template>
  <div class="card-content">
    <div v-for="i in 2" :key="i" class="property-item">
      <div class="skeleton skeleton-image"></div>
      <div class="property-info">
        <div class="property-header">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-badge"></div>
        </div>
        <div class="skeleton skeleton-type"></div>
        <div class="property-stats">
          <div class="skeleton skeleton-stat"></div>
          <div class="skeleton skeleton-stat"></div>
        </div>
        <div class="property-actions">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>

    <div class="view-all-section">
      <div class="skeleton skeleton-view-all"></div>
    </div>
  </div>
</template>

<style scoped>
.card-content {
  @apply flex-1 flex flex-col;
}

.property-item {
  @apply w-full border border-gray-300 rounded-lg overflow-hidden mb-6 flex flex-col;
  min-height: 270px;
}

.property-info {
  @apply w-full flex flex-col p-3;
  min-height: 140px;
}

.property-header {
  @apply w-full flex justify-between items-center mb-2;
}

.property-stats {
  @apply w-full flex justify-between items-center mb-3;
}

.property-actions {
  @apply w-full flex gap-3 mt-auto;
}

.view-all-section {
  @apply mt-6 mb-2;
}

.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

.skeleton-image {
  @apply w-full;
  height: 128px;
}

.skeleton-title {
  @apply w-3/4 h-5;
}

.skeleton-badge {
  @apply w-16 h-6;
}

.skeleton-type {
  @apply w-1/3 h-4 mb-2;
}

.skeleton-stat {
  @apply w-12 h-4;
}

.skeleton-button {
  @apply flex-1 h-8;
}

.skeleton-view-all {
  @apply w-full h-10;
}
</style>