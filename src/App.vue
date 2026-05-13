<script setup lang="ts">
import { reconnectallet } from "@/utils/wallet-connect";
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@core/utils/colorConverter";
import { useTheme } from "vuetify";
const { global } = useTheme();

// ℹ️ Sync current theme with initial loader theme
initCore();
initConfigStore();

const configStore = useConfigStore();

// function sendPV(pageName, pageCategory) {
//   if (typeof aplus_queue !== "undefined") {
//     aplus_queue.push({
//       action: "aplus.sendPV",
//       arguments: [
//         { is_auto: false }, // 关闭自动 PV
//         { pageName, pageCategory }, // 自定义页面名称和分类
//       ],
//     });
//     console.log(`PV sent for page: ${pageName}`);
//   } else {
//     console.error("APlus SDK not initialized.");
//   }
// }

const getWalletInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/user/coin`;
    const payload = {
      wallet: JSON.parse(localStorage.getItem("userData"))?.wallet,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("userData"))?.token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    if (data.code === 200 && data.data) {
      localStorage.setItem("coin", JSON.stringify(data.data));
      document.dispatchEvent(new CustomEvent("updateCoin"));
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

const followList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/user_followed_projects`;
    const payload = {
      userId: JSON.parse(localStorage.getItem("userData"))?.id,
      page: 1,
      limit: 10000,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("userData"))?.token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    if (data.code === 200 && data.data) {
      localStorage.setItem("followList", JSON.stringify(data.data.list));
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

// 头像信息接口
const getUserInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/member/getUserDetail`;
    const payload = {
      user_id: JSON.parse(localStorage.getItem("userData"))?.id,
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
      document.dispatchEvent(
        new CustomEvent("updateImg", {
          detail: { data: data.data.icon_image },
        }),
      );
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

// 更新收藏列表
const updateFollowList = () => {
  followList();
};

onMounted(async () => {
  // sendPV("/index", "index-page-category")
  await reconnectallet();
  if (localStorage.getItem("coin")) {
    await getWalletInfo();
  }
  if (localStorage.getItem("userData")) {
    followList();
    getUserInfo();
  }
  document.addEventListener("updateFollowList", updateFollowList);
});

onUnmounted(() => {
  document.removeEventListener("updateFollowList", updateFollowList);
});
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`"
    >
      <RouterView />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>

<style lang="scss">
// .v-application {
//   background: rgb(var(--v-theme-05070B)) !important;
// }

// .layout-vertical-nav {
//   background: rgb(var(--v-theme-05070B)) !important;
// }
</style>
