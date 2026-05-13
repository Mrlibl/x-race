<script setup lang="ts">
import GameDetail from '@/views/campaign/GameDetail.vue'
import SeasonTable from '@/views/event/SeasonTable.vue'
import TeamTable from '@/views/event/TeamTable.vue'
import DriverTable from '@/views/event/DriverTable.vue'
import Events from '@/views/campaign/Events.vue'
import NewsDetail from '@/views/campaign/NewsDetail.vue'
import { useDisplay } from 'vuetify';
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value);
const route = useRoute()
const isDetail = ref(false);
const detailInfo = ref({});
const currentTab = ref(0)
const selectedOption = ref('2025')
const hotNews = ref([]); // hot 4条
const gameList = ref([]);
const gameId = ref()
const matchId = ref()
const matchList = ref([])
const bannerImg = ref()
const isNewsDetail = ref(false)
const newsDetailInfo = ref({})

watch(() => route.query.id, (id) => {
  bannerImg.value = JSON.parse(localStorage.getItem('matchList')).filter((el) => el.id == route.query.id)[0]?.banner_image;
  isDetail.value = false
  isNewsDetail.value = false
  getGameList(id)
})


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

const getNews = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/new/getNewsList`
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
      hotNews.value = data.data.list.filter((el) => el.tags === 'hot')
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const getGameList = async (matchId: any) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/projects`
    const payload = {
      match_id: matchId,
      page: 1,
      limit: 10,
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
      gameList.value = data.data.list.slice(0, 2)
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}


const handleSelectChange = () => {

}

// 去详情交易
const detailTrade = (item: any) => {
  gameId.value = item.id
  matchId.value = item.match_id
  isDetail.value = true
}
// 去详情交易返回
const goBack = () => {
  isDetail.value = false
}

// 抽屉中点击卡片到详情
const drawerClick = (e: Event) => {
  const { data } = (e as CustomEvent).detail
  gameId.value = data.id
  matchId.value = data.match_id
  isDetail.value = true
}

// 去新闻
const newsDetail = (item: any) => {
  isNewsDetail.value = true
  newsDetailInfo.value = item
}

const goBackNews = () => {
  isNewsDetail.value = false
}

// 车队抽屉去新闻
const goNews = (e: Event) => {
  const { data } = (e as CustomEvent).detail
  isNewsDetail.value = true
  newsDetailInfo.value = data
}

function timeAgo(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = Math.floor((now.getTime() - (date.getTime() - 8 * 3600 * 1000)) / 1000) // 秒差

  if (diff < 60) {
    return `${diff}s`
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}m`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}h`
  } else {
    const days = Math.floor(diff / 86400)
    return `${days}d`
  }
}

onMounted(() => {
  if (localStorage.getItem('matchList')) {
    bannerImg.value = JSON.parse(localStorage.getItem('matchList')).filter((el) => el.id == route.query.id)[0]?.banner_image;
    console.log(bannerImg.value, 'bannerImg.value')
  } else {
    getMatchList()
  }
  getNews()
  getGameList(route.query.id)
  document.addEventListener('drawerClick', drawerClick)
  document.addEventListener('goNews', goNews)

})

onUnmounted(() => {
  document.removeEventListener("drawerClick", drawerClick);
  document.removeEventListener("goNews", goNews);
});
</script>

<template>
  <div v-if="!isNewsDetail">
    <div v-if="!isDetail">
      <VRow class="match-height home-div mt-2">
        <VCol cols="12">
          <img :src="bannerImg" class="banner-img" />
        </VCol>

        <VCol cols="12" md="8">
          <VRow class="">
            <VCol cols="12">
              <VCard>
                <VCardText class="d-flex justify-space-between align-center" style="padding: 0;">
                  <VTabs v-model="currentTab">
                    <VTab>
                      <div class="d-flex align-center gap-2">
                        <img src="@/assets/images/event/icon_16_team.png" style="width: 1.25rem;" />
                        <div>{{ t('team') }}</div>
                      </div>
                    </VTab>
                    <VTab>
                      <div class="d-flex align-center gap-2">
                        <img src="@/assets/images/event/icon_16_driver.png" style="width: 1.25rem;" />
                        <div>{{ t('driver') }}</div>
                      </div>
                    </VTab>
                    <VTab>
                      <div class="d-flex align-center gap-2">
                        <img src="@/assets/images/event/icon_16_schedule.png" style="width: 1.25rem;" />
                        <div>{{ t('season') }}</div>
                      </div>
                    </VTab>
                  </VTabs>

                  <div v-if="!isMobile" class="search-select" style="min-width: 7rem">
                    <VSelect v-model="selectedOption" :items="[]" item-title="name" item-value="name" label="Select"
                      return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
                      @update:modelValue="handleSelectChange" />
                  </div>
                </VCardText>
              </VCard>
            </VCol>
            <div class="d-flex justify-end me-4 mt-2" style="width: 100%">
              <div v-if="isMobile" style="max-width: 7rem">
                <VSelect v-model="selectedOption" :items="[]" item-title="name" item-value="name" label="Select"
                  return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
                  @update:modelValue="handleSelectChange" />
              </div>
            </div>
            <VCol cols="12" v-show="currentTab === 0" style="min-height: 0rem;">
              <TeamTable />
            </VCol>
            <VCol cols="12" v-show="currentTab === 1" style="min-height: 0rem;">
              <DriverTable />
            </VCol>
            <VCol cols="12" v-show="currentTab === 2" style="min-height: 0rem;">
              <SeasonTable />
            </VCol>

          </VRow>
        </VCol>


        <!-- 右侧 -->
        <VCol cols="12" md="4">
          <VRow class="">
            <VCol cols="12">
              <VCard :title="t('hot_recommend')">
                <VCardText class="d-flex align-center" style="cursor: pointer;"
                  v-for="(item, index) in hotNews.slice(0, 2)" @click="newsDetail(item)">
                  <div style="width: 10rem;">
                    <img :src="item.banner_image" style="width: 100%;" />
                  </div>
                  <div class="mx-4" style="flex: 1;">
                    <div class="d-flex align-center justify-space-between mt-2">
                      <div class="px-3 tag">
                        {{ item?.match_name }}
                      </div>
                      <div class="d-flex align-center gap-1 mt-2">
                        <div class="mt-2">
                          <img src="@/assets/images/news/icon_20_time.png" style="width: 1.2rem" />
                        </div>
                        <div style="font-size: 0.875rem;">{{ timeAgo(item?.create_time) }}</div>
                      </div>
                    </div>
                    <div style="font-size: 1rem; color: #fff; line-height: 1.5rem;">
                      {{ item?.title }}
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <VRow class="" style="margin-top: 8px !important;">
            <VCol cols="12">
              <Events :gameList="gameList" flag="event" @detailTrade="detailTrade" />
            </VCol>
          </VRow>

        </VCol>
      </VRow>
    </div>
    <div v-else class="mt-2">
      <GameDetail :gameId="gameId" :matchId="matchId" @goBack="goBack" />
    </div>
  </div>


  <div v-else class="mt-2">
    <NewsDetail :newsDetailInfo="newsDetailInfo" :hotNews="hotNews" @goBackNews="goBackNews" />
  </div>
</template>



<style lang="scss" scoped>
.home-div {
  overflow-x: hidden;
}

.tag {
  font-size: 0.875rem;
  background: rgba(255, 52, 52, 0.2);
  color: #FF3434;
  border-radius: 12px;
}

:deep(.v-tab.v-btn) {
  padding-inline: 2.5rem !important;
}

@media (max-width: 600px) {
  :deep(.v-tab.v-btn) {
    padding-inline: 0.5rem !important;
  }
}

:deep(.v-tab__slider) {
  background-color: #fff !important;
}

:deep(.text-primary) {
  color: #fff !important;
}

:deep(.v-tabs--density-default) {
  --v-tabs-height: 60px !important;
}

:deep(.v-tab) {
  height: 60px !important;
}


:deep(.custom-text-field .v-field) {
  // width: 10rem;
  // border: none !important;
  border: 1px solid #FF3434;
  /* 移除边框 */
  // background-color: rgb(var(--v-theme-006CEF)) !important;
  /* 红色背景 */
  border-radius: 5px !important;
  /* 增大圆角 */
  padding-left: .5rem !important;
  color: #FF3434;
  height: 40px;
  padding: 0 10px;
}

:deep(.v-field__input) {
  padding-top: 3px;
  padding-bottom: 3px;
  border-right: 1px solid #FF3434;
  padding-inline-start: 5px;
}

:deep(.v-select.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
  min-block-size: 39px;
}

:deep(.v-field__append-inner > .v-icon) {
  color: #FF3434;
}

:deep(.v-select__menu-icon) {
  margin-inline-start: 8px;
}

@media (max-width: 1000px) {
  .v-card-text {
    padding: 0.5rem !important; // 小屏覆盖
  }
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
