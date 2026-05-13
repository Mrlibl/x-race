<script setup lang="ts">
import Card from '@/views/campaign/Card.vue'
import icon1 from '@/assets/images/campaign/icon1.png'
import GameDetail from '@/views/campaign/GameDetail.vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const isDetail = ref(false);
const detailInfo = ref({});
const gameList = ref([])
const gameId = ref()
const matchId = ref()

const getGameList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/HotProjects`
    const payload = {
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

const detailClick = (item) => {
  isDetail.value = true
  gameId.value = item.id
  matchId.value = item.match_id
}

const goBack = () => {
  isDetail.value = false
}

onMounted(() => {
  getGameList()
})
</script>

<template>

  <div v-if="!isDetail">
    <VRow class="match-height home-div mt-2">
      <VCol cols="12">
        <div style="position: relative;">
          <img src="@/assets/images/campaign/banner2.png" class="banner-img" />
          <div class="banner-title">
            <div class="d-flex align-center gap-4">
              <img src="@/assets/images/campaign/icon_40_predictions.png" style="width: 2.5rem;" />
              <div style="font-size: 1.5rem; color: #fff; font-weight: bold;">{{ t('hot_title') }}</div>
            </div>
            <div class="mt-5" style="font-size: 0.875rem; color: #ccc">
              {{ t('hot_content') }}
            </div>
          </div>
        </div>
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

.banner-title {
  position: absolute;
  top: 30%;
  left: 5%;
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
