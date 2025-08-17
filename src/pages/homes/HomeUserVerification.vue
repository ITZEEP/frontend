<template>
  <!-- 본인 인증 -->
  <div class="py-20">
    <UserVerification @verified="handleVerified" mode="home" :home-id="homeId" />
  </div>
</template>

<script setup>
import UserVerification from '@/components/common/UserVerification.vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showVerification = ref(false)

const homeId = route.query.homeId || route.params.homeId

function handleVerified() {
  showVerification.value = false
  alert('인증이 완료되었습니다.')
  router.push('/homes')
}
</script>
