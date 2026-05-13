<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import Card from './Card.vue'
import DrawerInfo from '@/views/campaign/DrawerInfo.vue'
import { useI18n } from 'vue-i18n';

const { locale } = useI18n()
const { t } = useI18n()

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  drawerId: {
    type: Number,
    required: true,
  },
  flag: {
    type: String,
    required: true,
  }
})
const drawerId = computed(() => props.drawerId)
const flag = computed(() => props.flag || '');
const drawerInfo = ref({})
const hotNews = ref([])
const emit = defineEmits([
  'update:isDrawerOpen',
  'submit',
  'drawerClick'
])
const currentTab = ref(0)



const getDriverInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getRacingTeamDetail`
    const payload = {
      teamId: drawerId.value
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
      drawerInfo.value = data.data
      getGameList()
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


const gameList = ref([])

const getGameList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/projects`;
    const payload = {
      match_id: drawerInfo.value.match_id,
      page: 1,
      limit: 10,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    if (data.code === 200 && data.data) {
      gameList.value = data.data.list.slice(0, 2);
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

const detailClcik = (item: any) => {
  emit('drawerClick', item)
  if (flag.value === 'event') {
    document.dispatchEvent(
      new CustomEvent('drawerClick', {
        detail: { data: item },
      }),
    )
  }
}


const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

const drawerVisible = ref(false)
const drawerInfoId = ref() // 个人id
// 打开个人信息抽屉
const drawerClick = (item: any) => {
  drawerVisible.value = true
  drawerInfoId.value = item.id
}


// 去新闻
const newsDetail = (item: any) => {
  document.dispatchEvent(
    new CustomEvent('goNews', {
      detail: { data: item },
    }),
  )
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


onMounted(() => {
  getDriverInfo()
  getNews()
})
</script>

<template>
  <VNavigationDrawer v-if="!drawerVisible" temporary location="end" :width="400" :model-value="props.isDrawerOpen"
    class="scrollable-content" @update:model-value="handleDrawerModelValueUpdate">
    <!-- 👉 Header -->
    <!-- <AppDrawerHeaderSection title="Send Invoice" @cancel="$emit('update:isDrawerOpen', false)" /> -->
    <div style="position: relative;">
      <img src="@/assets/images/campaign/info_team_bg.png" style="width: 100%;" />
      <div class="d-flex justify-space-between px-3" style="width:100%; position: absolute; top: 0.5rem;">
        <img src="@/assets/images/campaign/back.png" style="width: 2rem; cursor: pointer;"
          @click="$emit('update:isDrawerOpen', false)" />
        <!-- <img src="@/assets/images/campaign/flag.png" style="width: 2rem; cursor: pointer;" /> -->
      </div>
      <div style="width:100%; position: absolute; top: 4.5rem; text-align: center;">
        <div class="d-flex justify-center align-center">
          <img :src="drawerInfo?.icon" style="width: 2rem;" />
          <div style="color: #fff ; font-size: 0.875rem; font-weight: bold;">
            {{ getLangText(drawerInfo?.full_name) }}
          </div>
        </div>
        <img class="mt-6" :src="drawerInfo?.car_images?.[0]" style="width: 20rem" />
      </div>
    </div>

    <div class="tabs-wrapper">
      <VTabs v-model="currentTab" grow class="mt-2">
        <VTab>{{ t('drawer.information') }}</VTab>
        <VTab>{{ t('drawer.news') }}</VTab>
      </VTabs>
    </div>

    <PerfectScrollbar class="scroll-area" :options="{ wheelPropagation: false }">

      <div v-show="currentTab === 0" class="tab-panel">
        <VCard class="mx-4 mt-4">
          <VCardText>
            <div>
              <div class="title">{{ t('drawer.team_name') }}</div>
              <div class="content mt-1">{{ getLangText(drawerInfo?.full_name) }}</div>
            </div>
            <div class="d-flex mt-6">
              <div style="flex: 1;">
                <div class="title">{{ t('drawer.competition') }}</div>
                <div class="content mt-1">{{ drawerInfo?.match_name }}</div>
              </div>
              <div style="flex: 1;">
                <div class="title">{{ t('drawer.status') }}</div>
                <div class="content mt-1">{{ drawerInfo?.competition_status }}</div>
              </div>
            </div>
            <div class="mt-6">
              <div class="title">{{ t('drawer.address') }}</div>
              <div class="content mt-1">{{ getLangText(drawerInfo?.headquarters) }}</div>
            </div>

            <div class="mt-6">
              <div class="title">{{ t('drawer.driver') }}</div>

              <div class="d-flex gap-4">
                <div class="d-flex mt-1" style="width: 6rem;" v-for="(item, index) in drawerInfo?.drivers">
                  <div @click="drawerClick(item)">
                    <img :src="item.avatar" style="width: 6rem; border-radius: 99999px;" />
                    <div class="mt-2" style="text-align: center;">
                      <span class="px-3 py-1 tag">
                        #{{ item?.driver_number }}
                      </span>
                    </div>
                    <div class="mt-1" style="text-align: center; color: #fff; font-weight: bold;">
                      {{ item?.full_name }}
                    </div>
                  </div>
                </div>

                <!-- <div class="d-flex mt-1" style="width: 6rem;">
                  <div>
                    <img src="@/assets/images/campaign/avatar2.png" style="width: 6rem;" />
                    <div class="mt-2" style="text-align: center;">
                      <span class="px-3 py-1 tag">
                        #12
                      </span>
                    </div>
                    <div class="mt-1" style="text-align: center; color: #fff; font-weight: bold;">
                      Jane <br />Cooper
                    </div>
                  </div>
                </div> -->

              </div>

            </div>

          </VCardText>
        </VCard>
        <VCard class="mx-4 mt-4" :title="t('drawer.related')">
          <Card v-for="item in gameList" :data="item" @click="detailClcik(item)" />
        </VCard>
      </div>


      <div v-show="currentTab === 1">
        <VCard class="mx-4 mt-4" v-for="(item, index) in hotNews" @click="newsDetail(item)">
          <VCardText class="gap-4">
            <img :src="item?.banner_image" />
            <div>
              <div class="d-flex align-center justify-space-between">
                <div class="px-3 tag">
                  {{ item?.match_name }}
                </div>
                <div class="d-flex align-center gap-1">
                  <div class="mt-2">
                    <img src="@/assets/images/news/icon_20_time.png" style="width: 1.2rem" />
                  </div>
                  <div style="font-size: 0.875rem;">{{ timeAgo(item?.create_time) }}</div>
                </div>
              </div>
              <div class="mt-2" style="font-size: 1rem; color: #fff; line-height: 1.5rem;">
                {{ getLangText(item?.title) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>
    </PerfectScrollbar>
  </VNavigationDrawer>


  <DrawerInfo v-if="drawerVisible" v-model:isDrawerOpen="drawerVisible" :drawerId="drawerInfoId"
    @drawerClick="drawerClick" flag="event" />

</template>


<style lang="scss" scoped>
.tag {
  font-size: 0.875rem;
  background: rgba(255, 52, 52, 0.2);
  color: #FF3434;
  border-radius: 12px;
}

:deep(.v-navigation-drawer__content) {
  background: #070707 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  /* 根据需要调整 */
}

/* Tabs 容器（固定） */
.tabs-wrapper {
  position: relative;
  z-index: 5;
  background: transparent;
  /* 或与 drawer 背景一致，如 #070707 */
  /* 如果需要视觉分割可以加 border-bottom */
  /* border-bottom: 1px solid rgba(255,255,255,0.04); */
}

/* 滚动区占满剩余高度 */
.scroll-area {
  flex: 1 1 auto;
  /* 关键：占据剩余高度 */
  overflow: hidden;
  /* 交给 PerfectScrollbar 管理滚动 */
  padding-bottom: 1rem;
  /* 视需要留底部间距 */
}

/* 让 tab 面板内容紧贴 Tabs（减少默认 mt） */
.tab-panel .v-card {
  margin-top: 0.5rem;
  /* 或使用 mt-2 */
}

.title {
  font-size: 0.875rem;
}

.content {
  color: #FFFFFF;
  font-size: 1.125rem;
}
</style>
