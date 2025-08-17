<template>
  <div class="mypage-layout">
    <!-- 사이드바 -->
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <router-link
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.path"
          class="nav-item"
          :class="{ active: isActive(tab.path) }"
        >
          <div class="nav-icon">
            <i :class="tab.icon"></i>
          </div>
          <span class="nav-label">{{ tab.label }}</span>
        </router-link>
      </nav>
    </aside>
    
    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'home', path: '/mypage', label: '대시보드', icon: 'fas fa-tachometer-alt' },
  { name: 'contracts', path: '/mypage/contracts', label: '계약서관리', icon: 'fas fa-file-contract' },
  { name: 'properties', path: '/mypage/properties', label: '매물관리', icon: 'fas fa-building' },
  { name: 'fraud-analysis', path: '/mypage/fraud-analysis', label: '사기위험도분석', icon: 'fas fa-shield-alt' },
  { name: 'edit', path: '/mypage/edit', label: '정보수정', icon: 'fas fa-user-edit' },
]

const isActive = (path) => {
  if (path === '/mypage') {
    return route.path === '/mypage'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.mypage-layout {
  display: flex;
  min-height: 100vh;
  background-color: #ffffff;
}

/* 사이드바 */
.sidebar {
  width: 256px;
  background-color: #ffffff;
  border-right: 1px solid #dde1e4;
  padding: 20px 16px;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-family: Roboto;
  font-size: 16px;
  font-weight: 400;
  color: #666666;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #f8f9fa;
}

.nav-item.active {
  background-color: #fff8e7;
  color: #ffbc00;
}

.nav-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.nav-icon i {
  font-size: 16px;
  color: inherit;
}

.nav-label {
  font-family: Roboto;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

/* 메인 콘텐츠 */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-x: auto;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .mypage-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 16px;
    border-right: none;
    border-bottom: 1px solid #dde1e4;
  }
  
  .sidebar-nav {
    flex-direction: row;
    justify-content: center;
    gap: 4px;
  }
  
  .nav-item {
    flex: 1;
    min-width: 80px;
    max-width: 120px;
    justify-content: center;
    font-size: 12px;
    padding: 8px 4px;
    text-align: center;
  }
  
  .main-content {
    padding: 24px 16px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    padding: 12px;
  }
  
  .nav-item {
    flex-direction: column;
    height: 60px;
    padding: 8px 2px;
    min-width: 60px;
    max-width: 80px;
    gap: 4px;
    font-size: 10px;
  }
  
  .nav-icon {
    margin-right: 0;
  }
  
  .nav-label {
    font-size: 10px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>