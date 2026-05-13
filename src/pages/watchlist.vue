<script setup lang="ts">
import WatchListTable from '@/views/campaign/WatchListTable.vue'



</script>

<template>
  <VRow class="match-height home-div mt-2">
    <VCol cols="12">
      <WatchListTable />
    </VCol>
  </VRow>
</template>



<style lang="scss" scoped>
.home-div {
  overflow-x: hidden;
}
</style>
