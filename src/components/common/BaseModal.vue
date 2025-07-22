<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modalStore.isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="onMaskClick"
      >
        <div
          class="bg-white rounded-xl w-full max-w-[640px] p-6 relative max-h-[80vh] overflow-y-auto"
        >
          <button
            v-if="closable"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            @click="modalStore.close"
          >
            <span class="text-xl">&times;</span>
          </button>

          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { defineProps, watch } from 'vue'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

const props = defineProps({
  closable: {
    type: Boolean,
    default: true,
  },
  maskCloseable: {
    type: Boolean,
    default: true,
  },
})

function onMaskClick() {
  if (props.maskCloseable) modalStore.close()
}

watch(
  () => modalStore.isOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
  { immediate: true },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
