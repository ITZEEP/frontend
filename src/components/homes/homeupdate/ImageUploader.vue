<template>
  <div class="bg-white p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">매물 이미지</h2>

    <!-- 이미지 미리보기 영역 -->
    <div class="flex gap-4 flex-wrap">
      <!-- 기존 이미지 -->
      <img
        v-for="(img, index) in previewImages"
        :key="'default-' + index"
        :src="img.image_url"
        :alt="img.space_type"
        class="w-24 h-24 object-cover rounded-md cursor-pointer"
        @click="openPreview(img.image_url)"
      />

      <!-- 새 이미지 -->
      <img
        v-for="(file, index) in newImages"
        :key="'new-' + index"
        :src="file.preview"
        alt="업로드된 이미지"
        class="w-24 h-24 object-cover rounded-md cursor-pointer"
        @click="openPreview(file.preview)"
      />

      <!-- 이미지 업로드 버튼 (최대 10장 제한) -->
      <label
        v-if="totalImageCount < 10"
        for="image-upload"
        class="w-24 h-24 border rounded-md flex items-center justify-center text-3xl font-bold cursor-pointer"
      >
        +
        <input
          id="image-upload"
          type="file"
          class="hidden"
          accept="image/*"
          multiple
          @change="handleImageUpload"
        />
      </label>
    </div>

    <!-- 이미지 확대 모달 -->
    <div
      v-if="modalImage"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <!-- 닫기 버튼 -->
      <button
        class="absolute top-4 right-4 text-white text-3xl font-bold"
        @click="modalImage = null"
      >
        ×
      </button>
      <img :src="modalImage" class="max-w-3xl max-h-[90vh] rounded shadow-lg" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// 기본 이미지
const previewImages = ref([
  {
    image_id: 1,
    space_type: '거실',
    image_url: 'https://cdn.pixabay.com/photo/2024/05/22/01/39/room-8779502_1280.png',
  },
  {
    image_id: 2,
    space_type: '침실',
    image_url: 'https://cdn.pixabay.com/photo/2018/08/09/06/13/home-3593832_1280.jpg',
  },
  {
    image_id: 3,
    space_type: '주방',
    image_url: 'https://cdn.pixabay.com/photo/2024/05/22/01/39/room-8779502_1280.png',
  },
  {
    image_id: 4,
    space_type: '거실',
    image_url: 'https://cdn.pixabay.com/photo/2024/05/22/01/39/room-8779502_1280.png',
  },
  {
    image_id: 5,
    space_type: '거실',
    image_url: 'https://cdn.pixabay.com/photo/2024/05/22/01/39/room-8779502_1280.png',
  },
])

// 새로 추가한 이미지
const newImages = ref([])

// 총 이미지 개수 계산
const totalImageCount = computed(() => previewImages.value.length + newImages.value.length)

// 파일 업로드 처리
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  const remainingSlots = 10 - totalImageCount.value

  // 초과 업로드 방지
  if (files.length > remainingSlots) {
    alert(`이미지는 최대 10장까지 업로드할 수 있습니다. (${remainingSlots}장 더 추가 가능)`)
    return
  }

  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      newImages.value.push({
        file,
        preview: event.target.result,
      })
    }
    reader.readAsDataURL(file)
  })

  // input 초기화
  e.target.value = ''
}

// 모달 이미지
const modalImage = ref(null)

// 모달 열기
const openPreview = (src) => {
  modalImage.value = src
}
</script>

<style scoped>
/* 닫기 버튼 커서 */
button {
  cursor: pointer;
}
</style>
