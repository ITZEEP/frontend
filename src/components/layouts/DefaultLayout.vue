<!-- 기본 레이아웃 컴포넌트 -->

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <NavBar />
    <main class="flex-1 my-layout-y px-layout-x">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './HeaderLayout.vue'
import Footer from './FooterLayout.vue'
</script>
