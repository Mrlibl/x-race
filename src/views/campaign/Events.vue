<script setup lang="ts">
import Card from './Card.vue'


const props = defineProps({
  gameList: {
    type: Array,
    gameList: true,
  },
  flag: {
    type: String,
    gameList: true,
  }
})
const emit = defineEmits(['eventClick', 'detailTrade'])


const gameList = computed(() => props.gameList || [])
const flag = computed(() => props.flag || '')

const detailClick = (item: any) => {
  if (flag.value === 'news') {
    emit('detailTrade', item)
  } else if (flag.value === 'event') {
    emit('detailTrade', item)
  } else {
    console.log(item, 'itemitemitem')
    emit('eventClick', item)
  }
}

</script>

<template>
  <!-- <VCard>
    <div class="mt-4 ml-4" style="font-size: 1rem; color: #fff">Related events</div>
    <VCardText style="padding: 0px !important;"> -->
  <div v-for="item in gameList" style="cursor: pointer;" @click="detailClick(item)">
    <Card :data="item" />
  </div>
  <!-- </VCardText>

  </VCard> -->
</template>


<style lang="scss" scoped></style>
