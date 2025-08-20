<!-- HomeUserVerifcation -->
<template>
  <!-- 본인 인증 -->
  <div class="py-10 px-4">
    <div class="w-full mx-auto max-w-[420px] sm:max-w-[560px] md:max-w-[720px] lg:max-w-[820px]">
      <UserVerification @verified="handleVerified" mode="home" :home-id="homeId" />
    </div>
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
  alert('매물 등록이 완료되었습니다.')
  router.push('/homes')
}
</script>
