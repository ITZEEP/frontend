<template>
  <div class="card-content">
    <div class="profile-section">
      <div class="skeleton skeleton-profile"></div>
      <div class="skeleton skeleton-text"></div>
    </div>

    <div class="nickname-section">
      <div class="skeleton skeleton-label"></div>
      <div class="skeleton skeleton-input"></div>
    </div>

    <div class="notification-section">
      <div class="skeleton skeleton-label"></div>
      <div class="skeleton skeleton-toggle"></div>
    </div>

    <div class="button-section">
      <div class="skeleton skeleton-button"></div>
    </div>

    <div class="button-section">
      <div class="skeleton skeleton-button"></div>
    </div>
  </div>
</template>

<style scoped>
.card-content {
  @apply flex-1 flex flex-col pb-6;
}

.profile-section {
  @apply w-full flex flex-col items-center justify-center mb-4;
  height: 95px;
}

.nickname-section {
  @apply w-full mt-4 flex flex-col;
  height: 68px;
}

.notification-section {
  @apply w-full h-6 mt-4 flex justify-between items-center;
}

.button-section {
  @apply w-full h-10 mt-4;
}

.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

.skeleton-profile {
  @apply w-16 h-16 rounded-full mb-2;
}

.skeleton-text {
  @apply w-24 h-4;
}

.skeleton-label {
  @apply w-16 h-5 mb-2;
}

.skeleton-input {
  @apply w-full h-10;
}

.skeleton-toggle {
  @apply w-11 h-6 rounded-full;
}

.skeleton-button {
  @apply w-full h-10 rounded;
}
</style>