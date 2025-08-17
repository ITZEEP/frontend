<template>
  <UserVerification mode="pre-start" :contractChatId="contractChatId" @verified="onVerified" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import UserVerification from '../../../common/UserVerification.vue'

const route = useRoute()
const contractChatId = route.params.id

const onVerified = (data) => {
  console.log('본인 인증 완료:', data)
}
</script>

<style scoped></style>
