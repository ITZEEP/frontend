<template>
  <div class="error-state">
    <div class="error-icon-wrapper">
      <i class="fas fa-exclamation-triangle error-icon"></i>
    </div>
    <h3 class="error-title">{{ title || '오류가 발생했습니다' }}</h3>
    <p class="error-description">{{ message || '분석 내역을 불러오는데 실패했습니다.' }}</p>
    <button @click="handleRetry" class="retry-button">
      <i class="fas fa-redo"></i>
      다시 시도
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String
})

const emit = defineEmits(['retry'])

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.error-icon-wrapper {
  width: 120px;
  height: 120px;
  background-color: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.error-icon {
  font-size: 60px;
  color: #dc2626;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.error-description {
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  margin: 0 0 32px 0;
  line-height: 1.4;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background-color: #ffffff;
  color: #dc2626;
  border: 2px solid #dc2626;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.retry-button:hover {
  background-color: #dc2626;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.retry-button i {
  font-size: 16px;
}
</style>