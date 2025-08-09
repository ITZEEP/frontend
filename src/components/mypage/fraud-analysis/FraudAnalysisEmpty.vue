<template>
  <div class="empty-state">
    <div class="empty-icon-wrapper">
      <i class="fas fa-shield-alt empty-icon"></i>
    </div>
    <h3 class="empty-title">분석 내역이 없습니다</h3>
    <p class="empty-description">매물의 사기 위험도를 분석해보세요.</p>
    <router-link to="/risk-check" class="empty-button">
      <i class="fas fa-search"></i>
      분석 시작하기
    </router-link>
  </div>
</template>

<script setup>
// Empty state component for FraudAnalysis
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  background-color: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 60px;
  color: #ff8c00;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.empty-description {
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  margin: 0 0 32px 0;
  line-height: 1.4;
}

.empty-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background-color: #ff8c00;
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.empty-button:hover {
  background-color: #ff6600;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
}

.empty-button i {
  font-size: 16px;
}
</style>