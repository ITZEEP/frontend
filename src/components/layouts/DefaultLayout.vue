<!-- 기본 레이아웃 컴포넌트 -->
<script setup>
import Header from './HeaderLayout.vue'
import Footer from './FooterLayout.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <NavBar />
    <main class="flex-1 my-5 px-16">
      <slot />
    </main>
    <Footer />
  </div>
</template>
