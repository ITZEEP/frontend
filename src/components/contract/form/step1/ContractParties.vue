<template>
  <section>
    <div class="flex items-center gap-2 mb-4">
      <i class="fa-solid fa-users text-yellow-primary"></i>
      <h2 class="text-lg font-semibold">제1조 (계약 당사자)</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-xl bg-gray-50 p-5">
        <div class="text-sm text-gray-500 mb-2">임대인 (갑)</div>
        <dl class="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
          <dt class="text-gray-500">성명:</dt>
          <dd class="font-medium">{{ basic?.ownerName || '-' }}</dd>
          <dt class="text-gray-500">주소:</dt>
          <dd class="font-medium">{{ basic?.ownerAddr || '-' }}</dd>
          <dt class="text-gray-500">연락처:</dt>
          <dd class="font-medium">{{ formatPhone(basic?.ownerPhoneNum) }}</dd>
        </dl>
      </div>

      <div class="rounded-xl bg-gray-50 p-5">
        <div class="text-sm text-gray-500 mb-2">임차인 (을)</div>
        <dl class="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
          <dt class="text-gray-500">성명:</dt>
          <dd class="font-medium">{{ basic?.buyerName || '-' }}</dd>
          <dt class="text-gray-500">주소:</dt>
          <dd class="font-medium">{{ basic?.buyerAddr || '-' }}</dd>
          <dt class="text-gray-500">연락처:</dt>
          <dd class="font-medium">{{ formatPhone(basic?.buyerPhoneNum) }}</dd>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ basic: { type: Object, default: null } })

function formatPhone(v) {
  if (!v) return '-'
  const s = String(v).replace(/\D/g, '')
  if (s.length === 11) return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`
  if (s.length === 10) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`
  return v
}
</script>
