<script setup lang="ts">
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import Card from "./Card.vue";
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
});
const drawerId = computed(() => props.drawerId);
const flag = computed(() => props.flag || '');
const drawerInfo = ref({});
const hotNews = ref([]);
const emit = defineEmits(["update:isDrawerOpen", "submit", "drawerClick"]);
const currentTab = ref(0);
const tagList = ref([
  { title: "" },
  { title: "" },
  { title: "" },
]);

const getDriverInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getRacingDriverDetail`;
    const payload = {
      driverId: drawerId.value,
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
      drawerInfo.value = data.data;
      tagList.value[0].title = `${data.data.height}${t('drawer.cm')}`;
      tagList.value[1].title = `${data.data.age} ${t('drawer.old')}`;
      tagList.value[2].title = `${getLangText(data.data.team_name)}#${data.data.driver_number}`;
      getGameList();
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

const getNews = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/new/getNewsList`;
    const payload = {};
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
      hotNews.value = data.data.list.filter((el) => el.tags === "hot");
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

const gameList = ref([]);

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
  emit("drawerClick", item);
  if (flag.value === 'event') {
    document.dispatchEvent(
      new CustomEvent('drawerClick', {
        detail: { data: item },
      }),
    )
  }
};

const handleDrawerModelValueUpdate = (val) => {
  emit("update:isDrawerOpen", val);
};


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



function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeAgo(time: string): string {
  const date = new Date(time);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - (date.getTime() - 8 * 3600 * 1000)) / 1000,
  ); // 秒差

  if (diff < 60) {
    return `${diff}s`;
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}d`;
  }
}

onMounted(() => {
  getDriverInfo();
  getNews();
});
</script>

<template>
  <VNavigationDrawer temporary location="end" :width="400" :model-value="props.isDrawerOpen" class="scrollable-content"
    @update:model-value="handleDrawerModelValueUpdate">
    <!-- 👉 Header -->
    <!-- <AppDrawerHeaderSection title="Send Invoice" @cancel="$emit('update:isDrawerOpen', false)" /> -->
    <div style="position: relative">
      <img src="@/assets/images/campaign/info_bg.png" style="width: 100%" />
      <div class="d-flex justify-space-between px-3" style="width: 100%; position: absolute; top: 0.5rem">
        <img src="@/assets/images/campaign/back.png" style="width: 2rem; cursor: pointer"
          @click="$emit('update:isDrawerOpen', false)" />
        <!-- <img src="@/assets/images/campaign/flag.png" style="width: 2rem; cursor: pointer" /> -->
      </div>
    </div>
    <div style="margin-top: -3.5rem; z-index: 999">
      <div>
        <div class="d-flex justify-center">
          <img :src="drawerInfo.avatar" style="width: 6rem" />
        </div>
        <div class="d-flex align-center justify-center mt-2">
          <div style="font-size: 1.125rem; color: #fff">
            {{ getLangText(drawerInfo?.full_name) }}
          </div>
          <img :src="drawerInfo?.team_icon" style="width: 1.5rem" />
        </div>
        <div class="d-flex align-center justify-center mt-4">
          <img src="@/assets/images/campaign/icon_24_profile.png" style="width: 1.5rem" />
          <div class="px-2 tag" v-for="item in tagList">
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>
    <VDivider class="mt-6" />
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
              <div class="title">{{ t('drawer.name') }}</div>
              <div class="content mt-1">{{ getLangText(drawerInfo?.full_name) }}</div>
            </div>
            <div class="d-flex mt-6">
              <div style="flex: 1">
                <div class="title">{{ t('drawer.competition') }}</div>
                <div class="content mt-1">{{ drawerInfo?.match_name }}</div>
              </div>
              <div style="flex: 1">
                <div class="title">{{ t('drawer.status') }}</div>
                <div class="content mt-1">
                  {{ drawerInfo?.retire_status === '1' ? t('drawer.active') : t('drawer.retired') }}
                </div>
              </div>
            </div>
            <div class="mt-6">
              <div class="title">{{ t('drawer.team') }}</div>
              <div class="content mt-1">{{ getLangText(drawerInfo?.team_name) }}</div>
            </div>
            <div class="d-flex mt-6">
              <div style="flex: 1">
                <div class="title">{{ t('drawer.number') }}</div>
                <div class="content mt-1">#{{ drawerInfo?.driver_number }}</div>
              </div>
              <div style="flex: 1">
                <div class="title">{{ t('drawer.age') }}</div>
                <div class="content mt-1">{{ drawerInfo?.age }} {{ t('drawer.old') }}</div>
              </div>
            </div>
            <div class="d-flex mt-6">
              <div style="flex: 1">
                <div class="title">{{ t('drawer.t_color') }}</div>
                <div class="content mt-1">{{ getLangText(drawerInfo?.t_color) }}</div>
              </div>
              <div style="flex: 1">
                <div class="title">{{ t('drawer.height') }}</div>
                <div class="content mt-1">{{ drawerInfo?.height }}{{ t('drawer.cm') }}</div>
              </div>
            </div>
            <div class="mt-6">
              <div class="title">{{ t('drawer.contract') }}</div>
              <div class="content mt-1">
                {{
                  drawerInfo?.contract_date
                    ? formatDate(drawerInfo?.contract_date)
                    : "- -"
                }}
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
</template>

<style lang="scss" scoped>
.tag {
  font-size: 0.875rem;
  background: rgba(255, 52, 52, 0.2);
  color: #ff3434;
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
  color: #ffffff;
  font-size: 1.125rem;
}
</style>
