<script lang="ts" setup>
// import navItems from '@/navigation/vertical'
import { useDynamicNavItems } from "@/navigation/vertical";
import { onMounted, onUnmounted, ref } from "vue";

// Components
import Footer from "@/layouts/components/Footer.vue";
// import NavbarLayoutSwitcher from '@/layouts/components/NavbarLayoutSwitcher.vue'
// import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from "@/layouts/components/UserProfile.vue";
import { userDashboardStore } from "@/stores/dashboard/store";
import NavBarI18n from '@core/components/I18n.vue'
import { themeConfig } from '@themeConfig'

// @layouts plugin
import { VerticalNavLayout } from "@layouts";

import Search from "@/views/Search.vue";
import Deposit from "@/views/campaign/Deposit.vue";
import { isLoginWallet, connectWallet } from "../../utils/wallet-connect";
import { useI18n } from 'vue-i18n';
const { t } = useI18n()

const router = useRouter();
const navItems = useDynamicNavItems();
const dashboardStore = userDashboardStore();
const tokenInfo = await dashboardStore.getTokenChain();

const selectedOption = ref(tokenInfo[0]);

const dashboard = localStorage.getItem("dashboard");
let flat = false;
if (dashboard) {
  flat = true;
  document.dispatchEvent(new CustomEvent("showHead"));
}
const showFlag = ref(flat);

const showHead = () => {
  showFlag.value = true;
};
const coin = ref(localStorage.getItem("coin"));
watchEffect(() => {
  coin.value = localStorage.getItem("coin") || "0";
});

const walletAddress = ref(localStorage.getItem("walletAddress"));
const isLoginWalletLocal = ref(localStorage.getItem("isLoginWallet"));
const isLogout = computed(() => {
  return walletAddress && isLoginWalletLocal.value === "1";
});

// const isLogout = ref(localStorage.getItem("walletAddress"));
watch(isLoginWallet, (isConnected) => {
  if (isConnected) {
    walletAddress.value = localStorage.getItem("walletAddress");
    coin.value = localStorage.getItem("coin");
  }
});

const searchClick = () => {
  router.push({
    path: "/",
  });
  console.log("vvvvvvv");
  document.dispatchEvent(new CustomEvent("phoneSearch", {}));
};

const homeClick = () => {
  console.log("首页");
  document.dispatchEvent(new CustomEvent("homeIndex", {}));
};

const isDialogVisible = ref(false);
const depositClick = async () => {
  const islogin = localStorage.getItem("isLoginWallet");
  if (islogin && islogin === "1") {
    isDialogVisible.value = true;
  } else {
    await connectWallet();
  }
};

const closeModal = () => {
  isDialogVisible.value = false;
};

// Profile页面打开弹窗
const openDeposit = (e: Event) => {
  isDialogVisible.value = true;
};

// 更新coin值
const updateCoin = async () => {
  // const { data } = (e as CustomEvent).detail
  // coin.value = data
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
      coin.value = data.data;
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};

onMounted(async () => {
  document.addEventListener("showHead", showHead);
  document.addEventListener("openDeposit", openDeposit);
  document.addEventListener("updateCoin", updateCoin);
});

onUnmounted(() => {
  document.removeEventListener("showHead", showHead);
  document.removeEventListener("openDeposit", openDeposit);
  document.removeEventListener("updateCoin", updateCoin);
});
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <!-- PC 端 logo -->
        <!-- <img src="@/assets/images/logo-1.png" class="d-none d-sm-inline-block" style="width: 12rem; cursor: pointer;"
          @click="homeClick" /> -->

        <!-- 移动端 logo -->
        <!-- <img src="@/assets/images/logo-m.png" class="d-sm-none" style="width: 40%" /> -->
        <!-- <img src="@/assets/images/logo-1.png" style="width: 12rem;" /> -->

        <IconBtn id="vertical-nav-toggle-btn" class="ms-n2 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <Search position="right" class="d-none d-sm-inline-block mt-2" />

        <VSpacer />
        <div v-if="isLogout" class="d-flex gap-6 me-2 me-md-3">
          <div style="font-size: 0.875rem">
            {{ t('cash') }}
            <span style="color: #ff3434">$ {{ Number(coin).toFixed(2) }}</span>
          </div>
        </div>
        <div v-if="isLogout" class="deposit px-5 py-2 me-3" @click="depositClick">
          {{ t('deposit') }}
        </div>
        <!-- <NavBarI18n v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig" class="me-2" /> -->
        <UserProfile />
        <!-- <NavbarThemeSwitcher class="ms-2 theme-color" /> -->
        <!-- <NavbarLayoutSwitcher class="d-none d-sm-inline-block" /> -->
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>

  <Deposit :isDialogVisible="isDialogVisible" @closeModal="closeModal" />
</template>

<style lang="scss">
.layout-navbar {
  // padding: 0 8px !important;
  // max-inline-size: 100% !important;
}

.deposit {
  background-color: #ff3434;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
