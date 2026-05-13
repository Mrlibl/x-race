<script setup lang="ts">
import Card from '@/views/campaign/Card.vue'
import GameDetail from '@/views/campaign/GameDetail.vue'

const route = useRoute()

const isDetail = ref(false);
const gameList = ref([]);
const gameId = ref();
const matchId = ref();

const matchList = ref([])
const bannerImg = ref()

watch(() => route.query.id, (id) => {
  isDetail.value = false
  bannerImg.value = JSON.parse(localStorage.getItem('matchList')).filter((el) => el.id == id)[0]?.banner_image;
  getGameList(id)
})

const getId = (match_id: any) => {
  getGameList(match_id)
}

const getGameList = async (match_id: any) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/projects`
    const payload = {
      match_id: match_id,
      page: 1,
      limit: 100,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      data.data.list.map((item) => {
        const data = JSON.parse(localStorage.getItem("followList")!)?.filter((ite) => ite.id === item.id);
        item.isCollect = data?.length > 0 ? true : false; // 是否收藏
      })
      gameList.value = data.data.list
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const getMatchList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getLotteryMatches`
    const payload = {
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      bannerImg.value = data.data.list.filter((el) => el.id == route.query.id)[0]?.banner_image;
      matchList.value = data.data.list
      localStorage.setItem('matchList', JSON.stringify(data.data.list))
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const detailClick = (item) => {
  isDetail.value = true
  gameId.value = item.id
  matchId.value = item.match_id
}

const goBack = () => {
  isDetail.value = false
}

onMounted(() => {
  if (localStorage.getItem('matchList')) {
    bannerImg.value = JSON.parse(localStorage.getItem('matchList')).filter((el) => el.id == route.query.id)[0]?.banner_image;
  } else {
    getMatchList()
  }
  getId(route.query.id)
})

</script>

<template>

  <div v-if="!isDetail">
    <VRow class="match-height home-div mt-2">
      <VCol cols="12">
        <img :src="bannerImg" class="banner-img" />
      </VCol>

      <VCol cols="12" lg="3" md="4" v-for="(item, index) in gameList" :key="index" style="cursor: pointer;"
        @click="detailClick(item)">
        <Card :data="item" />
      </VCol>
    </VRow>
  </div>
  <div v-else class="mt-2">
    <GameDetail :gameId="gameId" :matchId="matchId" @goBack="goBack" />
  </div>
</template>



<style lang="scss" scoped>
.home-div {
  overflow-x: hidden;
}

.banner-img {
  width: 100%;
  height: auto;
  /* PC 默认高度自适应 */
  object-fit: cover;
  /* 自动裁剪填满容器 */
  object-position: center;
  /* 居中显示图片中间部分 */
}

@media (max-width: 768px) {
  .banner-img {
    height: 12rem;
    /* 移动端给固定高度 */
    width: 100%;
    object-fit: cover;
    /* 填充裁剪 */
    object-position: 70%;
    /* 图片中间部分 */
  }
}
</style>
