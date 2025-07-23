<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div class="grid gap-4">
      <HomeBasicInfo :home="home" :home_detail="home_detail" />
      <HomeMaintenanceInfo :home="home" :items="maintenance_items" />
    </div>

    <div class="grid gap-4">
      <FacilityBuilding :items="facilities['건물 시설']" />
      <FacilityInterior :items="facilities['내부 시설']" />
      <FacilitySecurity :items="facilities['보안 시설']" />
    </div>
  </div>
</template>

<script setup>
import HomeBasicInfo from './dashboard/HomeBasicInfo.vue'
import HomeMaintenanceInfo from './dashboard/HomeMaintenanceInfo.vue'
import FacilityBuilding from './dashboard/FacilityBuilding.vue'
import FacilityInterior from './dashboard/FacilityInterior.vue'
import FacilitySecurity from './dashboard/FacilitySecurity.vue'

const props = defineProps({
  data: Object,
})

const home = props.data.home
const home_detail = props.data.home_detail
const maintenance_items = props.data.maintenance_items
const facilities = props.data.facilities
</script>
