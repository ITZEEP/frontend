<template>
  <div class="skeleton-card">
    <div class="card-left">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-type"></div>
      <div class="skeleton skeleton-date"></div>
      <div class="skeleton skeleton-badge"></div>
    </div>
    
    <div class="card-right">
      <div class="skeleton skeleton-button"></div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loader component for FraudAnalysisCard
</script>

<style scoped>
.skeleton-card {
  width: 100%;
  min-height: 176px;
  height: auto;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow:
    0px 10px 15px -3px rgba(0, 0, 0, 0.1),
    0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.card-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-right {
  display: flex;
  align-items: center;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  width: 70%;
  height: 24px;
  margin-bottom: 12px;
}

.skeleton-type {
  width: 30%;
  height: 20px;
  margin-bottom: 12px;
}

.skeleton-date {
  width: 40%;
  height: 20px;
  margin-bottom: 24px;
}

.skeleton-badge {
  width: 80px;
  height: 32px;
  margin-top: auto;
}

.skeleton-button {
  width: 80px;
  height: 60px;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .skeleton-card {
    padding: 24px;
  }
}
</style>