<template>
  <div class="card-content">
    <div v-for="i in 3" :key="i" class="analysis-item">
      <div class="analysis-header">
        <div class="skeleton skeleton-title"></div>
      </div>
      <div class="skeleton skeleton-date"></div>
      <div class="analysis-actions">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-button"></div>
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

.analysis-item {
  @apply w-full border border-gray-300 rounded-lg p-4 mb-6 flex flex-col;
  min-height: 118px;
}

.analysis-header {
  @apply w-full flex justify-between items-center mb-2;
}

.analysis-actions {
  @apply w-full flex justify-between items-center;
}

.view-all-section {
  @apply mt-6 mb-2;
}

.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

.skeleton-title {
  @apply w-full h-5;
}

.skeleton-date {
  @apply w-1/2 h-4 mb-3;
}

.skeleton-badge {
  @apply w-12 h-6;
}

.skeleton-button {
  @apply rounded;
  width: 88.64px;
  height: 24px;
}

.skeleton-view-all {
  @apply w-full h-10;
}
</style>