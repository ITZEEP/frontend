<template>
  <div class="flex gap-2">
    <BaseButton @click="router.push(accountMenus.signin.url)" class="w-fit" variant="outline">
      {{ accountMenus.signin.title }}
    </BaseButton>
    <BaseButton @click="router.push(accountMenus.signup.url)" class="w-fit" variant="primary">
      {{ accountMenus.signup.title }}
    </BaseButton>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import config from '@/config'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const accountMenus = config.accountMenus
</script>
