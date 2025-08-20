<template>
  <nav :class="mobile ? 'flex flex-col space-y-1' : 'flex gap-8'">
    <button
      v-for="menu in menus"
      :key="menu.url"
      @click="handleNavigate(menu.url)"
      class="relative text-sm font-medium transition-colors"
      :class="mobile 
        ? [
            'text-left px-4 py-3 rounded-lg',
            isActive(menu.url) 
              ? 'bg-yellow-50 text-yellow-primary' 
              : 'text-gray-700 hover:bg-gray-50'
          ]
        : [
            isActive(menu.url) 
              ? 'text-yellow-primary' 
              : 'text-gray-400 hover:text-yellow-primary'
          ]
      "
    >
      {{ menu.title }}
      <div
        v-if="!mobile && isActive(menu.url)"
        class="absolute -bottom-2 left-1/2 w-full h-[2px] bg-yellow-primary translate-x-[-50%]"
      />
    </button>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import config from '@/config'

const props = defineProps({
  mobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['navigate'])

const menus = config.owner
const route = useRoute()
const router = useRouter()

const isActive = (path) => route.path.startsWith(path)

const handleNavigate = (url) => {
  router.push(url)
  if (props.mobile) {
    emit('navigate')
  }
}
</script>
