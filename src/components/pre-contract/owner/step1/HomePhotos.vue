<template>
  <div class="w-full white-box">
    <h3 class="font-semibold mb-3">매물 사진</h3>

    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
    >
      <div
        v-for="img in images"
        :key="img.image_id"
        class="rounded-lg overflow-hidden min-w-[180px] shadow cursor-pointer"
        @click="openPreview(img)"
      >
        <img
          :src="img.image_url.trim()"
          :alt="img.space_type"
          class="w-full h-[120px] object-cover"
          draggable="false"
        />
        <p class="text-xs text-center py-1 text-gray-600">{{ img.space_type }}</p>
      </div>
    </div>

    <!-- 미리보기 모달 -->
    <BaseModal>
      <template v-if="previewImage">
        <img
          :src="previewImage.image_url.trim()"
          class="max-w-full max-h-[70vh] mx-auto rounded-lg"
        />
        <p class="text-sm text-gray-600 text-center mt-2">{{ previewImage.space_type }}</p>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useModalStore } from '@/stores/modal'

const props = defineProps({
  data: Array,
})
const images = props.data

const scrollContainer = ref(null)
let isDragging = false
let startX = 0
let scrollStart = 0

function startDrag(e) {
  isDragging = true
  startX = e.pageX
  scrollStart = scrollContainer.value.scrollLeft
}
function onDrag(e) {
  if (!isDragging) return
  const deltaX = e.pageX - startX
  scrollContainer.value.scrollLeft = scrollStart - deltaX
}
function stopDrag() {
  isDragging = false
}

const previewImage = ref(null)
const modalStore = useModalStore()

function openPreview(img) {
  previewImage.value = img
  modalStore.open()
}
</script>

<style scoped>
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
</style>
