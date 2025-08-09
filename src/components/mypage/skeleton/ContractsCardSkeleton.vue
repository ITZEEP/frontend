<template>
  <div class="card-content">
    <div v-for="i in 3" :key="i" class="contract-item">
      <div class="contract-header">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-badge"></div>
      </div>
      <div class="skeleton skeleton-date"></div>
      <div class="contract-actions">
        <div class="skeleton skeleton-button"></div>
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

.contract-item {
  @apply w-full border border-gray-300 rounded-lg p-4 mb-4 flex flex-col;
  min-height: 126px;
}

.contract-item:last-of-type {
  @apply mb-0;
}

.contract-header {
  @apply w-full flex justify-between items-center mb-2;
}

.contract-actions {
  @apply w-full flex gap-2;
}

.view-all-section {
  @apply mt-6 mb-2;
}

.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

.skeleton-title {
  @apply w-3/4 h-5;
}

.skeleton-badge {
  @apply w-16 h-6;
}

.skeleton-date {
  @apply w-1/2 h-4 mb-3;
}

.skeleton-button {
  @apply flex-1 h-8;
}

.skeleton-view-all {
  @apply w-full h-10;
}
</style>