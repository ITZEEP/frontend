<!-- 기본 레이아웃 컴포넌트 -->

<template>
  <div class="flex flex-col min-h-screen overflow-x-hidden">
    <Header />
    <main class="flex-1 overflow-x-hidden">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './HeaderLayout.vue'
import Footer from './FooterLayout.vue'
</script>
