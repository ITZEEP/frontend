<template>
  <!-- 본인 인증 -->
  <div class="px-96 py-20">
    <UserVerification @verified="handleVerified" mode="home" home-id="9" />
  </div>
</template>

<script setup>
import UserVerification from '@/components/common/UserVerification.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showVerification = ref(false)

function handleVerified() {
  showVerification.value = false
  alert('인증이 완료되었습니다.')
  router.push('/homes')
}
</script>
