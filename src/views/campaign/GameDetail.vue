<script setup lang="ts">
import LineChart from "./LineChart.vue";
import Trade from "./Trade.vue";
import Table from "./Table.vue";
import Events from "./Events.vue";
import OrderBook from "./OrderBook.vue";
import Holders from "./Holders.vue";
import Activity from "./Activity.vue";
import Comments from "./Comments.vue";
import DrawerInfo from "./DrawerInfo.vue";
import DrawerTeamInfo from "./DrawerTeamInfo.vue";
import defultIcon from "@/assets/images/campaign/icon1.png";
import { signWalletMessage } from "../../utils/wallet-connect";
import { minInt104 } from "viem";
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const emit = defineEmits(["goBack"]);

const props = defineProps({
  gameId: {
    type: Object,
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
});
const gameId = computed(() => props.gameId || {});
const matchId = computed(() => props.matchId || "");
const userId = ref(JSON.parse(localStorage.getItem("userData"))?.id);
const gameList = ref([]);
const detailInfo = ref({});
const currentTab = ref(0);
const drawerVisible = ref(false);
const drawerTeamVisible = ref(false);
const isCollect = ref(false); //是否收藏

const goBack = () => {
  emit("goBack");
};

const drawerId = ref(); // 车手或者车队id
const infoClick = (item: any) => {
  drawerId.value = item.correlation_id;
  // individual个人 team队伍
  if (item.option_type === "individual") {
    drawerVisible.value = true;
  } else if (item.option_type === "team") {
    drawerTeamVisible.value = true;
  }
};

const getGameList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/projects`;
    const payload = {
      match_id: matchId.value,
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
      data.data.list.map((item) => {
        const data = JSON.parse(localStorage.getItem("followList")!)?.filter((ite) => ite.id === item.id);
        item.isCollect = data?.length > 0 ? true : false; // 是否收藏
      })
      gameList.value = data.data.list.slice(0, 2);
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};
// 查询详情接口
const getDetailInfo = async (id) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/projectsinfo`;
    const payload = {
      projectId: id,
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
      const followList = JSON.parse(
        localStorage.getItem("followList")!,
      )?.filter((ite) => ite.id === data.data.id);
      isCollect.value = followList?.length > 0 ? true : false; // 是否收藏
      detailInfo.value = data.data;
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

const linkClick = (url) => {
  window.open(url);
};

const handleErrorAvatar = (event: any) => {
  event.target.src = defultIcon;
};

// 交易后更新详情信息
const updateDetail = (e: Event) => {
  getDetailInfo(gameId.value);
};

// event赛事详情
const eventClick = (item: any) => {
  getDetailInfo(item.id);
};

// 抽屉中点击卡片到详情
const drawerClick = (item) => {
  drawerVisible.value = false;
  drawerTeamVisible.value = false;
  getDetailInfo(item.id);
};

const isExpand = ref(true);
const expandClick = () => {
  isExpand.value = !isExpand.value;
};

// 收藏
const followClick = async () => {
  isCollect.value = true;
  try {
    const url = `https://nodeapi.carx.cz/lottery/follow_project`;
    const payload = {
      userId: userId.value,
      projectId: detailInfo.value.id,
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
    if (data.code === 200) {
      document.dispatchEvent(new CustomEvent("updateFollowList"));
    } else {
      isCollect.value = false;
    }
  } catch (err) {
    isCollect.value = false;
    console.error("请求失败:", err);
  }
};

const unfollowClick = async () => {
  isCollect.value = false;
  try {
    const url = `https://nodeapi.carx.cz/lottery/unfollow_project`;
    const payload = {
      userId: userId.value,
      projectId: detailInfo.value.id,
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
    if (data.code === 200) {
      document.dispatchEvent(new CustomEvent("updateFollowList"));
    } else {
      isCollect.value = true;
    }
  } catch (err) {
    isCollect.value = true;
    console.error("请求失败:", err);
  }
};

const voteFlag = ref(false);
const annInfo = ref({});
const timer = ref(null);
const countDown = ref();
const canVote = ref(true);
const openVote = async () => {
  await getAnn();
  await userCanVote();
  voteFlag.value = true;
};

const getAnn = async () => {
  const url = `https://nodeapi.carx.cz/result/get?projectId=${gameId.value}`;
  const res = await fetch(url, {
    method: "GET",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message);
  if (data.code === 200 && data.data) {
    annInfo.value = data.data;

    timer.value = setInterval(() => {
      countDown.value = formatCountdown(annInfo.value.end_time);
      if (countDown.value === "00h:00m:00s") clearInterval(timer.value);
    }, 1000);
  }
};

const userCanVote = async () => {
  const url = `https://nodeapi.carx.cz/result/userCanVote?wallet=${localStorage.getItem("walletAddress")}&annId=${annInfo.value.id}`;
  const res = await fetch(url, {
    method: "GET",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message);
  if (data.code === 200 && data.data) {
    canVote.value = data.data;
  }
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatCountdown(ts: number): string {
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "00h:00m:00s";

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  return `${pad(h)}h:${pad(m)}m:${pad(s)}s`;
}

function formatDelta(ts: number): string {
  const diff = ts - Math.floor(Date.now() / 1000); // 秒
  if (diff <= 0) return "0";

  const abs = Math.abs(diff);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;

  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return `${s}s`;
}

const vote = async (type: number) => {
  if (type === 0) {
    const signature = await signWalletMessage("vote oppose");

    if (signature === "") {
      return;
    }
  }
  const url = `https://nodeapi.carx.cz/result/vote`;
  const payload = {
    wallet: localStorage.getItem("walletAddress"),
    annId: annInfo.value.id,
    type,
    projectId: annInfo.value.projectId,
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
    canVote.value = false;
    annInfo.value.approve_num = data.data.approve_num;
    annInfo.value.oppose_num = data.data.oppose_num;
    document.dispatchEvent(new CustomEvent("updateCoin"));
    // if (type === 0) {
    //   try {
    //     const url = `https://nodeapi.carx.cz/lottery/user/balance`;
    //     const payload = {
    //       userId: localStorage.getItem("userData").id,
    //       page: 1,
    //       limit: 10,
    //     };
    //     const res = await fetch(url, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(payload),
    //     });

    //     const data = await res.json();
    //     if (!res.ok) throw new Error(data?.message);
    //     if (data.code === 200 && data.data) {
    //       localStorage.setItem(
    //         "currentBalance",
    //         JSON.stringify(data.data.currentBalance),
    //       );
    //       location.reload();
    //     }
    //   } catch (err) {
    //     console.error("请求失败:", err);
    //   }
    // }
  }
};

onMounted(async () => {
  const url = new URL(window.location.href);
  // 往查询字符串里加参数（已有同名参数会自动覆盖）
  url.searchParams.set("gameId", gameId.value);
  window.history.replaceState({}, "", url.toString());
  getDetailInfo(gameId.value);
  getGameList();
  await getAnn();

  document.addEventListener("updateDetail", updateDetail);
});

onUnmounted(() => {
  document.removeEventListener("updateDetail", updateDetail)
})
</script>

<template>
  <VRow v-if="detailInfo" class="match-height" style="position: relative">
    <!-- 左侧 -->
    <VCol cols="12" md="8">
      <VRow class="">
        <VCol cols="12">
          <VCard>
            <VCardText>
              <img src="@/assets/images/campaign/icon_back.png" style="width: 2rem; cursor: pointer" @click="goBack" />
              <div class="d-flex gap-4 mt-2">
                <div>
                  <img :src="detailInfo?.icon || defultIcon" @error="handleErrorAvatar"
                    style="width: 4rem; height: 4rem" />
                </div>
                <div>
                  <div class="mt-1" style="font-size: 1.125rem; color: #fff">
                    {{ detailInfo?.title }}
                  </div>
                  <div class="d-flex align-center justify-space-between mt-3">
                    <div class="d-flex align-center gap-2">
                      <img src="@/assets/images/campaign/icon_20_total.png" style="width: 1.25rem" />
                      <div class="mt-1" style="font-size: 0.875rem; color: #ccc">
                        {{ t('totalVol') }}
                        <span style="color: #ff3434">{{
                          Number(detailInfo?.total_bet_amount || 0).toFixed(2)
                          }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flag">
                <img v-if="isCollect" src="@/assets/images/campaign/icon_32_flag_sel.png"
                  style="width: 1.5rem; cursor: pointer" @click.stop="unfollowClick" />
                <img v-else src="@/assets/images/campaign/icon_32_flag_nor.png" style="width: 1.5rem; cursor: pointer"
                  @click.stop="followClick" />
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
      <VRow class="" style="margin-top: 8px !important">
        <VCol cols="12">
          <LineChart :detailInfo="detailInfo" />
        </VCol>
      </VRow>
    </VCol>
    <!-- 右侧 -->
    <VCol cols="12" md="4">
      <Trade :detailInfo="detailInfo" />
    </VCol>

    <!-- 左侧 -->
    <VCol cols="12" md="8">
      <VRow class="">
        <VCol cols="12">
          <Table @infoClick="infoClick" :detailInfo="detailInfo" />
        </VCol>
      </VRow>

      <div v-if="isExpand">
        <VRow class="" style="margin-top: 8px !important">
          <VCol cols="12">
            <VCard>
              <VCardText>
                <div class="d-flex align-center gap-4">
                  <img src="@/assets/images/campaign/Frame674.png" style="width: 2.5rem" />
                  <div style="color: #fff; font-size: 1rem; font-weight: bold">
                    {{ detailInfo?.title }}
                  </div>
                </div>
                <div class="mt-2" style="font-size: 0.875rem; color: #fff; opacity: 0.5">
                  <div v-html="detailInfo?.description"></div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <VRow class="" style="margin-top: 8px !important">
          <VCol cols="12">
            <VCard>
              <VCardText>
                <div class="d-flex align-center gap-4">
                  <img src="@/assets/images/campaign/Frame675.png" style="width: 2.5rem" />
                  <div style="color: #fff; font-size: 1rem; font-weight: bold">
                    {{ t('rules') }}
                  </div>
                </div>
                <div class="mt-2" style="font-size: 0.875rem; color: #fff; opacity: 0.5">
                  <div v-html="detailInfo?.rules_content"></div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        <VRow class="" style="margin-top: 8px !important">
          <VCol cols="12">
            <VCard>
              <VCardText>
                <div class="d-flex align-center gap-4">
                  <img src="@/assets/images/campaign/Frame676.png" style="width: 2.5rem" />
                  <div style="color: #fff; font-size: 1rem; font-weight: bold">
                    {{ t('determination') }}
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between mt-4 mb-4">
                  <div class="d-flex align-center gap-4">
                    <img :src="detailInfo.icon" style="width: 4rem" />
                    <div v-if="detailInfo.status === 'ongoing'">
                      <div style="font-size: 1rem; color: #fff">
                        {{ t('determination_title') }}
                      </div>
                      <div class="mt-1" style="font-size: 0.875rem">
                        {{ t('determination_titleA') }}
                      </div>
                      <div class="mt-1" style="font-size: 0.875rem">
                        {{ t('determination_titleB') }}
                      </div>
                    </div>
                    <div v-else-if="annInfo.status === 'ann'">
                      <div style="font-size: 1rem; color: #fff">
                        {{ t('determination_titleC') }}
                        <span style="color: red">{{ annInfo.optionText }}</span>.
                      </div>
                      <div class="mt-1" style="font-size: 0.875rem">
                        {{ t('determination_titleD') }} :
                        <a :href="annInfo.result_link" target="_blank">{{
                          annInfo.result_title
                          }}</a>
                      </div>
                      <div class="mt-1" style="font-size: 0.875rem">
                        {{ t('determination_titleE') }}
                        <span v-if="annInfo.phrase === 0" class="underline" @click="openVote">
                          · {{ t('determination_titleF') }} ·
                        </span>
                        {{ t('countdown') }}: {{ countDown }}
                      </div>
                    </div>
                    <div v-else>
                      <div style="font-size: 1rem; color: #fff">
                        {{ t('determination_titleG') }}
                        <span style="color: red">{{ annInfo.optionText }}</span>.
                      </div>
                      <div class="mt-1" style="font-size: 0.875rem">
                        {{ t('determination_titleD') }} :
                        <a :href="annInfo.result_link" target="_blank">{{
                          annInfo.result_title
                          }}</a>
                      </div>
                      <div class="mt-1" style="font-size: 0.875rem">
                        {{ t('determination_titleH') }}
                      </div>
                    </div>
                  </div>
                  <!-- <div class="px-6 py-2 propose_btn" @click="linkClick(detailInfo?.result_link)">
                    Propose resolution
                  </div> -->
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </VCol>

    <!-- <VRow class="" style="margin-top: 8px !important;">
      <VCol cols="12">
        <img src="@/assets/images/campaign/expand.png" />
      </VCol>
    </VRow> -->

    <!-- 右侧 -->
    <VCol cols="12" md="4">
      <VCard>
        <div class="mt-4 ml-4" style="font-size: 1rem; color: #fff">
          {{ t('events') }}
        </div>
        <VCardText :style="{
          padding: '0px !important',
          height: !isExpand ? '15rem' : '',
          overflowY: 'auto',
        }">
          <Events :gameList="gameList" @eventClick="eventClick" />
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="8">
      <div style="text-align: center">
        <div class="mb-1">{{ isExpand ? t('less') : t('more') }}</div>
        <img v-if="!isExpand" src="@/assets/images/campaign/expand.png" style="width: 3.75rem" @click="expandClick" />
        <img v-if="isExpand" src="@/assets/images/campaign/retract.png" style="width: 3.75rem" @click="expandClick" />
      </div>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTabs v-model="currentTab" class="mt-2">
          <VTab>{{ t('tab_A') }}</VTab>
          <VTab>{{ t('tab_B') }}</VTab>
          <VTab>{{ t('tab_C') }}</VTab>
          <!-- <VTab>Order Book</VTab> -->
        </VTabs>
        <VCardText v-show="currentTab == 0">
          <div>
            <Holders :detailInfo="detailInfo" />
          </div>
        </VCardText>
        <VCardText v-show="currentTab == 1">
          <div>
            <Activity :detailInfo="detailInfo" />
          </div>
        </VCardText>
        <VCardText v-show="currentTab == 2">
          <div>
            <Comments />
          </div>
        </VCardText>

        <!-- <VCardText v-show="currentTab == 3">
          <div>
            <OrderBook />
          </div>
        </VCardText> -->
      </VCard>
    </VCol>

    <VDialog v-model="voteFlag">
      <div class="voteArea">
        <div class="voteArea-div">
          <div @click="voteFlag = false" style="
              position: absolute;
              right: 0.5rem;
              top: 0.5rem;
              cursor: pointer;
            ">
            <VIcon size="32" style="opacity: 0.5" icon="ri-close-large-line" />
          </div>

          <div class="imgdiv">
            <img src="@/assets/images/ann/annIcon.png" alt="" />
          </div>
          <div class="titlediv">
            {{ t('outcome_titleA') }}
            {{ annInfo.phrase === 0 ? "Ⅰ" : "Ⅱ" }}
          </div>
          <div class="flex-div" style="margin-top: 1rem">
            <div style="opacity: 0.7">{{ t('outcome_titleB') }}:</div>
            <div>{{ annInfo.optionText }}</div>
          </div>
          <div class="flex-div">
            <div style="opacity: 0.7">{{ t('outcome_titleC') }}:</div>
            <div>{{ countDown }}</div>
          </div>
          <div style="margin-top: 2rem">
            <div style="opacity: 0.5; display: flex">
              <img style="width: 20px; height: 20px; margin-right: 0.5rem" src="@/assets/images/login/Frame_3.png"
                alt="" />
              <div>
                {{ t('outcome_titleD') }} {{ formatDelta(annInfo.end_time) }} {{ t('outcome_titleE') }}
              </div>
            </div>
            <div style="opacity: 0.5; display: flex; margin-top: 0.5rem">
              <img style="width: 20px; height: 20px; margin-right: 0.5rem" src="@/assets/images/login/Frame_1.png"
                alt="" />
              <div>
                {{ t('outcome_titleF') }}: {{ annInfo.price }} USDT. {{ t('outcome_titleG') }}
                {{ Number.parseFloat(annInfo.price) * 2 }} USDT. {{ t('outcome_titleH') }}
              </div>
            </div>
          </div>
          <div class="flex-div" style="margin-top: 2rem">
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
              ">
              <img style="width: 40px; height: 40px" src="@/assets/images/ann/approve.png" alt="" />
              <div style="
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: start;
                  margin-left: 1rem;
                ">
                <div>{{ t('outcome_titleI') }}:</div>
                <div>{{ annInfo.approve_num }}</div>
              </div>
            </div>

            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
              ">
              <img style="width: 40px; height: 40px" src="@/assets/images/ann/oppose.png" alt="" />
              <div style="
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: start;
                  margin-left: 1rem;
                ">
                <div>{{ t('outcome_titleJ') }}:</div>
                <div>{{ annInfo.oppose_num }}</div>
              </div>
            </div>
          </div>
          <div :class="{ disabled: !canVote }" @click="canVote && vote(1)" class="flex-div-center approveDiv">
            Vote to Confirm
          </div>
          <div :class="{ disabled: !canVote }" @click="canVote && vote(0)" class="flex-div-center opposeDiv">
            Stake {{ annInfo.price }} USDT to Dispute
          </div>
        </div>
      </div>
    </VDialog>
  </VRow>

  <DrawerInfo v-if="drawerVisible" v-model:isDrawerOpen="drawerVisible" :drawerId="drawerId"
    @drawerClick="drawerClick" />
  <DrawerTeamInfo v-if="drawerTeamVisible" v-model:isDrawerOpen="drawerTeamVisible" :drawerId="drawerId"
    @drawerClick="drawerClick" />
</template>

<style lang="scss" scoped>
.disabled {
  pointer-events: none;
  /* 禁止所有鼠标事件 */
  opacity: 0.5;
  /* 视觉灰掉 */
  cursor: not-allowed;
}

.flex-div {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.flex-div-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
}

.voteArea-div {
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  width: clamp(20rem, 90%, 35rem);
  height: 51rem;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 376px) {
    max-height: 90% !important;
    overflow-y: auto;
  }

  @media (max-width: 580px) {
    height: 45rem;
    max-height: 45rem;
  }

  @media (max-width: 361px) {
    height: 42rem;
    max-height: 42rem;
  }

  border-radius: 10px;
  padding: 20px;
  background-color: rgb(var(--v-theme-surface));

  .imgdiv {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    img {
      width: 200px;
      height: 200px;

      @media (max-width: 580px) {
        width: 100px;
        height: 100px;
      }

      @media (max-width: 361px) {
        width: 80px;
        height: 80px;
      }

      border-radius: 50%;
      margin-bottom: 10px;
      margin: 0 atuo;
    }
  }

  .titlediv {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;

    @media (max-width: 580px) {
      margin: 1rem;
    }

    @media (max-width: 361px) {
      margin: 0rem;
    }

    width: 100%;
    height: 50px;
    font-size: 30px;

    @media (max-width: 361px) {
      font-size: 20px;
    }

    font-weight: 600;
    border-radius: 10px 10px 0 0;
  }
}

.voteArea {
  display: flex;
  align-items: center;
  justify-content: center;
}

.approveDiv {
  margin-top: 5rem;

  @media (max-width: 580px) {
    margin-top: 2rem;
  }

  @media (max-width: 361px) {
    margin-top: 1rem;
  }

  border: 1px solid #4caf50;
  border-radius: 5px;
  background-color: #4caf50;
  color: white;
  height: 3rem !important;

  @media (max-width: 376px) {
    min-height: 3rem !important;
  }
}

.opposeDiv {
  margin-top: 2rem;

  @media (max-width: 361px) {
    margin-top: 1rem;
  }

  border-radius: 5px;
  border: 1px solid #f44336;
  background-color: #f44336;
  color: white;
  height: 3rem !important;

  @media (max-width: 376px) {
    min-height: 3rem !important;
  }
}

.underline {
  text-decoration: underline;
  /* 实线下划线 */
  text-decoration-color: #e91e63;
  /* 下划线颜色 */
  text-decoration-thickness: 2px;
  /* 下划线粗细 */
  text-underline-offset: 5px;
  /* 与文字基线距离 */
  cursor: pointer;
}

.flag {
  position: absolute;
  right: 1.5rem;
  inset-block-end: 4rem;
}

.v-row {
  margin: -8px !important;
}

.propose_btn {
  background-color: #ba2d2c;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #fff;
}

.custom-col {
  flex: 0 0 71%; // ≈3.5/12 = 29.17%
  max-width: 71%;
}

.custom-colA {
  flex: 0 0 29%; // ≈3.5/12 = 29.17%
  max-width: 29%;
}
</style>
