<template>
  <div class="bg-white p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">매물 이미지</h2>

    <div class="flex gap-4 flex-wrap">
      <div
        v-for="(imgUrl, index) in images"
        :key="'existing-' + index"
        class="relative w-24 h-24 rounded overflow-hidden border border-gray-300 shadow-sm"
      >
        <img :src="imgUrl" alt="기존 이미지" class="object-cover w-full h-full" />
        <button
          @click="removeExistingImage(index, imgUrl)"
          type="button"
          class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
          aria-label="삭제"
        >
          ×
        </button>
      </div>

      <div
        v-for="(file, index) in newImages"
        :key="'new-' + index"
        class="relative w-24 h-24 rounded overflow-hidden border border-gray-300 shadow-sm"
      >
        <img :src="file.preview" alt="업로드된 이미지" class="object-cover w-full h-full" />
        <button
          @click="removeNewImage(index)"
          type="button"
          class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
          aria-label="삭제"
        >
          ×
        </button>
      </div>

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
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  newImages: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:images', 'update:newImages', 'image-deleted'])

const totalImageCount = computed(() => props.images.length + props.newImages.length)

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  const remainingSlots = 10 - totalImageCount.value

  if (files.length > remainingSlots) {
    alert(`이미지는 최대 10장까지 업로드할 수 있습니다. (${remainingSlots}장 더 추가 가능)`)
    return
  }

  const newFilesWithPreview = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }))

  emit('update:newImages', [...props.newImages, ...newFilesWithPreview])
  e.target.value = ''
}

const removeExistingImage = (index, imgUrl) => {
  const filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1)
  const imageId = parseInt(filename.substring(0, filename.lastIndexOf('_')), 10)

  if (!isNaN(imageId)) {
    emit('image-deleted', imageId)
  } else {
    console.warn(`Could not extract a valid image ID from URL: ${imgUrl}`)
  }

  const updatedImages = [...props.images]
  updatedImages.splice(index, 1)
  emit('update:images', updatedImages)
}

const removeNewImage = (index) => {
  const updatedNewImages = [...props.newImages]
  updatedNewImages.splice(index, 1)
  emit('update:newImages', updatedNewImages)
}
</script>
