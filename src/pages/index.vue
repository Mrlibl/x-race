<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import NewsDetail from '@/views/campaign/NewsDetail.vue'
import { useI18n } from "vue-i18n"
const { locale } = useI18n()

const isNewsDetail = ref(false);
const newsDetailInfo = ref({});
const adsList = ref([]);
const topNews = ref([]); // top 1条
const hotNews = ref([]); // hot 4条
const averageNews = ref([]); // average 4条
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
      topNews.value = data.data.list.filter((el) => el.tags === 'top')
      hotNews.value = data.data.list.filter((el) => el.tags === 'hot')
      averageNews.value = data.data.list.filter((el) => el.tags === 'average')
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}


const getAds = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/new/getAdsList`
    const payload = {
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
      adsList.value = data.data.list
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const listRoot = ref<HTMLElement | null>(null)
const detailRoot = ref<HTMLElement | null>(null)



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

const newsDetail = async (item: any) => {
  isNewsDetail.value = true
  newsDetailInfo.value = item
  await nextTick()      // 等 DOM 切换完成
  scrollElemTop(detailRoot.value)
  scrollToTopMultiFrame(6, detailRoot.value)
}



const goBackNews = async () => {
  isNewsDetail.value = false
  // 等视图切换完成
  await nextTick()
  scrollElemTop(listRoot.value)
  requestAnimationFrame(() => scrollToTopMultiFrame(6, listRoot.value))
}


const linkClick = (url: any) => {
  window.open(url)
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


function truncateText(text: string, length = 50): string {
  if (!text) return ''

  if (text.length <= length) return text

  // 找到 length 之前的最后一个空格位置
  const truncated = text.slice(0, length)
  const lastSpace = truncated.lastIndexOf(' ')

  // 如果没找到空格，就直接硬截
  if (lastSpace === -1) return truncated + '...'

  return truncated.slice(0, lastSpace) + '...'
}

onMounted(() => {
  register()
  getNews()
  getAds()
})
</script>

<template>
  <div v-if="!isNewsDetail" :key="'list'" ref="listRoot">
    <VRow class="match-height home-div mt-2">
      <VCol cols="12">
        <swiper-container pagination="true" events-prefix="swiper-">
          <swiper-slide v-for="ad in adsList" :key="ad.id" class="banner-img">
            <!-- 外链跳转 -->
            <a @click="linkClick(ad.link_url)" target="_blank" rel="noopener noreferrer">
              <VImg :src="ad?.image" />
            </a>
          </swiper-slide>
        </swiper-container>
      </VCol>

      <!-- 左侧新闻 -->
      <VCol cols="12" md="6" v-if="topNews.length > 0">
        <VCard>
          <VCardText @click="newsDetail(topNews[0])">
            <img :src="topNews[0]?.banner_image" style="width: 100%;" />
            <div class="d-flex align-center justify-space-between">
              <div class="px-3 tag">
                {{ topNews[0]?.match_name }}
              </div>
              <div class="d-flex align-center gap-2">
                <div class="mt-2">
                  <img src="@/assets/images/news/icon_20_time.png" style="width: 1.2rem" />
                </div>
                <div style="font-size: 0.875rem;">{{ timeAgo(topNews[0]?.create_time) }}</div>
              </div>
            </div>
            <div class="mt-2 title">
              {{ getLangText(topNews[0]?.title) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 右侧新闻 -->
      <VCol cols="12" md="6" style="margin-top: 4px;">
        <VRow>
          <VCol cols="12" md="6" v-for="(item, index) in hotNews" :key="index">
            <VCard>
              <VCardText @click="newsDetail(item)">
                <img :src="item?.banner_image" style="width: 100%;" />
                <div class="d-flex align-center justify-space-between mt-1">
                  <div class="px-3 tag">
                    {{ item?.match_name }}
                  </div>
                  <div class="d-flex align-center gap-2">
                    <div class="mt-2">
                      <img src="@/assets/images/news/icon_20_time.png" style="width: 1.2rem" />
                    </div>
                    <div style="font-size: 0.875rem;">{{ timeAgo(item?.create_time) }}</div>
                  </div>
                </div>
                <div class="mt-2 titleA">
                  {{ getLangText(item?.title) }}
                </div>
              </VCardText>
            </VCard>
          </VCol>

        </VRow>
      </VCol>


      <VCol cols="12" v-for="(item, index) in averageNews" :key="index">
        <VCard>
          <VCardText @click="newsDetail(item)">
            <div class="d-flex flex-column flex-md-row gap-4">
              <img :src="item?.banner_image" />
              <div>
                <div class="d-flex mt-2">
                  <div class="px-3 tag">
                    {{ item?.match_name }}
                  </div>
                </div>
                <div class="title mt-2">
                  {{ getLangText(item?.title) }}
                </div>
                <div style="font-size: 0.875rem;">
                  <!-- {{ truncateText(item?.content1, 220) }} -->
                  {{ truncateText(getLangText(item?.content1), 220) }}
                </div>
                <div class="d-flex align-center gap-2 mt-2">
                  <div class="mt-2">
                    <img src="@/assets/images/news/icon_20_time.png" style="width: 1.2rem" />
                  </div>
                  <div style="font-size: 0.875rem;">{{ timeAgo(item?.create_time) }}</div>
                </div>
              </div>
            </div>

          </VCardText>
        </VCard>

      </VCol>
    </VRow>
  </div>
  <div v-else class="mt-2 anchor-top" :key="`detail-${newsDetailInfo?.id || ''}`" ref="detailRoot">
    <NewsDetail :key="newsDetailInfo?.id || Date.now()" @goBackNews="goBackNews" :newsDetailInfo="newsDetailInfo"
      :hotNews="hotNews" />
  </div>
</template>



<style lang="scss" scoped>
.title {
  font-size: 2rem;
  line-height: 2.5rem;
  color: #fff;
  font-weight: bold;
}

.titleA {
  font-size: 1.5rem;
  line-height: 2rem;
  color: #fff;
  font-weight: bold;
}

.tag {
  font-size: 0.875rem;
  background: rgba(255, 52, 52, 0.2);
  color: #FF3434;
  border-radius: 12px;
}

:deep(.v-card-text) {
  cursor: pointer;
}


@media (max-width: 768px) {
  :deep(.v-responsive) {
    height: 12rem !important;
  }

  :deep(.v-img__img--contain) {
    object-fit: cover;
    object-position: 70%;
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
