<script setup lang="ts">
import Events from './Events.vue'
import GameDetail from './GameDetail.vue'
import { useI18n } from 'vue-i18n';


const { t } = useI18n()
const { locale } = useI18n()

const emit = defineEmits(['goBackNews'])

const props = defineProps({
  newsDetailInfo: {
    type: Object,
    required: true,
  },
  hotNews: {
    type: Array,
    required: true,
  }
})
const newsDetailInfo = ref(props.newsDetailInfo)
const hotNews = computed(() => {
  const list = props.hotNews || []
  const currentId = props.newsDetailInfo?.id
  return list.filter((item: any) => item.id !== currentId)
})
const gameList = ref([]);

// 新闻详情去交易
const isDetail = ref(false);
const gameId = ref()
const matchId = ref()

const detailRoot = ref<HTMLElement | null>(null)  // 当前详情页容器
const gameRoot = ref<HTMLElement | null>(null)  // GameDetail 容器

watch(
  () => props.newsDetailInfo,
  (val) => {
    newsDetailInfo.value = val
  }
)


const goBackNews = () => {
  emit('goBackNews')
}

const getGameList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/projects`
    const payload = {
      match_id: newsDetailInfo.value.match_id,
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

const newsDetailClcik = (item: any) => {
  newsDetailInfo.value = item
  getGameList()
}

const scrollElemTop = (el: HTMLElement | null) => {
  if (el) {
    // 优先滚动到该元素顶部（会滚动正确的容器）
    el.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' })
  }
  // 兜底：window + 常见容器 + 文档节点
  const containers = [window, document.querySelector('.layout-page-content'), document.querySelector('.v-main__wrap')]
  containers.forEach((c: any) => {
    if (!c) return
    try {
      if (c === window) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      else (c as HTMLElement).scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch { }
  })
  document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

// 多帧兜底，抵消图片/轮播后续撑高
const scrollToTopMultiFrame = (frames = 6, el?: HTMLElement | null) => {
  let count = 0
  const doScroll = () => {
    scrollElemTop(el || null)
    if (++count < frames) requestAnimationFrame(doScroll)
  }
  requestAnimationFrame(doScroll)
}

const detailTrade = async (item: any) => {
  gameId.value = item.id
  matchId.value = item.match_id
  isDetail.value = true
  await nextTick()      // 等 DOM 切换完成
  scrollElemTop(gameRoot.value)
  scrollToTopMultiFrame(6, gameRoot.value)
}

const goBack = () => {
  isDetail.value = false
}


function getLangText(field) {
  const obj = parseLangField(field)
  return obj?.[locale.value] || obj?.en || ""
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

onMounted(async () => {
  // await nextTick()
  // // 同样的滚动函数
  // window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  // const mainWrap = document.querySelector('.v-main__wrap') as HTMLElement | null
  // if (mainWrap) mainWrap.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  // document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  getGameList()
})

</script>

<template>
  <VRow v-if="!isDetail" class="match-height" ref="detailRoot">
    <!-- 左侧 -->
    <VCol cols="12" md="8">
      <VRow>
        <VCol cols="12" v-if="newsDetailInfo?.content1">
          <VCard>
            <VCardText>
              <img src="@/assets/images/campaign/icon_back.png" style="width: 2rem; cursor: pointer;"
                @click="goBackNews" />
              <div class="d-flex align-center justify-space-between mt-2">
                <div class="px-3 tag">
                  {{ newsDetailInfo?.match_name }}
                </div>
                <div class="d-flex align-center gap-2">
                  <div class="mt-2">
                    <img src="@/assets/images/news/icon_20_time.png" style="width: 1.2rem" />
                  </div>
                  <div style="font-size: 0.875rem;">1 d</div>
                </div>
              </div>
              <div class="title">
                {{ getLangText(newsDetailInfo?.title) }}
              </div>

              <img :src="newsDetailInfo?.img_1_image" class="mt-8" style="width: 100%;" />

              <div class="content mt-4">
                {{ getLangText(newsDetailInfo?.content1) }}
              </div>
            </VCardText>


            <VCardText v-if="newsDetailInfo?.content2">
              <img :src="newsDetailInfo?.img_2_image" class="mt-8" style="width: 100%;" />
              <div class="content mt-4">
                {{ getLangText(newsDetailInfo?.content2) }}
              </div>
            </VCardText>


            <VCardText v-if="newsDetailInfo?.content3">
              <img :src="newsDetailInfo?.img_3_image" class="mt-8" style="width: 100%;" />
              <div class="content mt-4">
                {{ getLangText(newsDetailInfo?.content3) }}
              </div>
            </VCardText>
          </VCard>
        </VCol>

      </VRow>

    </VCol>
    <!-- 右侧 -->
    <VCol cols="12" md="4">
      <VRow class="">
        <VCol cols="12">
          <VCard :title="t('hot_recommend')">
            <VCardText v-for="(item, index) in hotNews.slice(0, 2)" class="d-flex align-center"
              @click="newsDetailClcik(item)">
              <div style="width: 10rem;">
                <img :src="item?.banner_image" style="width: 100%;" />
              </div>
              <div class="ms-4" style="flex: 1; margin-top: -0.5rem;">
                <div class="d-flex align-center justify-space-between">
                  <div class="px-3 tag">
                    {{ item?.match_name }}
                  </div>
                  <div class="d-flex align-center gap-1 mt-2">
                    <div class="mt-2">
                      <img src="@/assets/images/news/icon_20_time.png" style="width: 1rem" />
                    </div>
                    <div style="font-size: 0.875rem;">
                      {{ timeAgo(item?.create_time) }}
                    </div>
                  </div>
                </div>
                <div style="font-size: 0.875rem; color: #fff; line-height: 1.2rem;">
                  {{ getLangText(item?.title) }}
                </div>
              </div>
            </VCardText>

          </VCard>
        </VCol>
      </VRow>

      <VRow class="" style="margin-top: 8px !important;">
        <VCol cols="12">
          <Events :gameList="gameList" flag="news" @detailTrade="detailTrade" />
        </VCol>
      </VRow>
    </VCol>

  </VRow>

  <div v-else ref="gameRoot" class="anchor-top">
    <GameDetail :gameId="gameId" :matchId="matchId" @goBack="goBack" />
  </div>
</template>



<style lang="scss" scoped>
.flag {
  position: absolute;
  right: 1.5rem;
  inset-block-end: 4rem;
}

.v-row {
  margin: -8px !important;
}

.tag {
  font-size: 0.875rem;
  background: rgba(255, 52, 52, 0.2);
  color: #FF3434;
  border-radius: 12px;
}

.title {
  font-weight: bold;
  font-size: 3rem;
  color: #FFFFFF;
  line-height: 4rem;
}

.content {
  font-size: 1.125rem;
  color: #FFFFFF;
  line-height: 2.25rem;
}


@media (max-width: 1000px) {
  .v-card-text {
    padding: 0.5rem !important; // 小屏覆盖
  }
}

.anchor-top {
  scroll-margin-top: 80px;
  /* 或 72px / 64px */
}

img {
  border-radius: 8px;
}
</style>
