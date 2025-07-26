<template>
  <!-- HomeStructureSection 컴포넌트 사용 -->
  <HomeStructureSection />

  <!-- OptionChecklist 컴포넌트를 직접 쓸 수도 있어요 -->
  <OptionChecklist :options="extraOptions" />
</template>

<script setup>
import HomeStructureSection from './HomeStructureSection.vue'
import OptionChecklist from './OptionChecklist.vue'

const extraOptions = [
  { id: 'optA', name: '추가 옵션 A' },
  { id: 'optB', name: '추가 옵션 B' },
]
</script>
