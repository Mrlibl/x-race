<script setup lang="ts">
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import avatar from "@images/avatars/avatar-1.png";
import BaseIcon from "@/assets/images/chain/Base@2x.png";
import BscIcon from "@/assets/images/chain/BSC@2x.png";
import EthIcon from "@/assets/images/chain/ETH@2x.png";
import OpIcon from "@/assets/images/chain/optimism.png";
import PolygonIcon from "@/assets/images/chain/pol-token.png";
import SolanaIcon from "@/assets/images/chain/Solana@2x.png";
import ProfileIcon from "@/assets/images/login/icon_22_profile.png";
import WatchlistIcon from "@/assets/images/login/icon_22_report.png";
import RewardIcon from "@/assets/images/login/icon_22_reward.png";
import SettingIcon from "@/assets/images/login/icon_22_setting.png";
import DocumentIcon from "@/assets/images/login/icon_22_document.png";

import WalletAcconut from "../../views/campaign/walletAcconut.vue";

import {
  chainId,
  connectWallet,
  isLoginWallet,
  walletAddress as wadd,
} from "@/utils/wallet-connect";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();
function shortAddress(address) {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const walletAddress = ref(wadd);
const userAddress = ref(localStorage.getItem("walletAddress"));
console.log(userAddress.value, "userAddressuserAddressuserAddressuserAddress");
// watch(
//   () => walletAddress.value,
//   (newAddr, oldAddr) => {
//     console.log("钱包地址变化为：", newAddr, "原来是：", oldAddr);
//   },
// );
const isLoginWallet = ref(localStorage.getItem("isLoginWallet"));
// const walletShowText = computed(() => {
//   return walletAddress.value
//     ? shortAddress(walletAddress.value)
//     : "Connect Wallet";
// });
const isLogout = computed(() => {
  return walletAddress && isLoginWallet.value === "1";
});

const snackbar = ref(false);
const snackbarText = ref("");
const userProfileList = computed(() => [
  { type: "divider" },
  {
    type: "navItem",
    icon: ProfileIcon,
    title: t("Profile"),
    value: "profile",
  },
  {
    type: "navItem",
    icon: WatchlistIcon,
    title: t("Watchlist"),
    value: "Watchlist",
  },
  {
    type: "navItem",
    icon: RewardIcon,
    title: t("Rewards"),
    value: "Rewards",
  },
  { type: "divider" },
  {
    type: "navItem",
    icon: SettingIcon,
    title: t("Setting"),
    value: "Setting",
  },
  {
    type: "navItem",
    icon: DocumentIcon,
    title: t("Documentation"),
    value: "Documentation",
  },
  { type: "divider" },
]);

const userIcon = ref("");

watch(isLoginWallet, (isConnected) => {
  if (isConnected) {
    console.log("链接-------");
    walletAddress.value = localStorage.getItem("walletAddress");
  }
});

const showChainIcon = ref();
watch(
  chainId,
  (newChainId) => {
    console.log(newChainId, "newChainIdnewChainIdnewChainId");
    if (newChainId === 1) {
      //eth
      showChainIcon.value = EthIcon;
    } else if (newChainId === 56) {
      //bsc
      showChainIcon.value = BscIcon;
    } else if (newChainId === 8453) {
      //base
      showChainIcon.value = BaseIcon;
    } else if (newChainId === 10) {
      //op
      showChainIcon.value = OpIcon;
    } else if (newChainId === 137) {
      //polygon
      showChainIcon.value = PolygonIcon;
    } else if ((newChainId as string).includes("solana")) {
      showChainIcon.value = SolanaIcon;
    }
  },
  { immediate: true },
);
const isDialogVisible = ref(false);

const loginWallet = async () => {
  walletAddress.value = localStorage.getItem("walletAddress");
  if (!walletAddress.value) {
    connectWallet();
  } else {
    isDialogVisible.value = true;
  }
};

function clearStorageExcept(keepKeys = []) {
  const backup = {};
  // 先把需要保留的 key 暂存
  keepKeys.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v !== null) backup[k] = v;
  });

  // 清空全部
  localStorage.clear();

  // 恢复需要保留的
  Object.entries(backup).forEach(([k, v]) => {
    localStorage.setItem(k, v);
  });
}

const logout = () => {
  const filterNew = localStorage.getItem("newFilter");
  // localStorage.clear()

  clearStorageExcept(["tour", "tourA"]);
  localStorage.setItem("newFilter", filterNew);
  localStorage.setItem("isLoginWallet", "0");
  location.reload();
};

function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 点击复制
const copy = (text: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const result = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (result) {
    snackbarText.value = "Copied to clipboard!";
    snackbar.value = true;
  }
  return result;
};

const avatarModules = import.meta.glob("@/assets/images/user/*.png", {
  eager: true,
  import: "default",
});

// 生成 avatarMap：key 为数字字符串 '1'~'16'
const avatarMap: Record<string, string> = {};
for (const path in avatarModules) {
  const match = path.match(/\/(\d+)\.png$/);
  if (match) {
    avatarMap[match[1]] = avatarModules[path];
  }
}

// const renderCodeAt = (addr: string): number => {
//   // 按字符计算 hash 取余
//   let total = 0
//   for (let i = 0; i < addr.length; i++) {
//     total += addr.charCodeAt(i)
//   }
//   return (total % 16) + 1
// }
const renderCodeAt = (char) => {
  let asciiCode = char.charCodeAt(0);
  return (asciiCode % 8) + 1;
};

const renderImg = computed(() => {
  const addr = localStorage.getItem("walletAddress");
  if (!addr || addr.length === 0) return avatar;

  const code = renderCodeAt(addr);
  return avatarMap[String(code)] || avatar;
});

const menuClick = (item) => {
  if (item.value === "profile") {
    router.push({
      path: "/profile",
    });
  } else if (item.value === "Watchlist") {
    router.push({
      path: "/watchlist",
    });
  } else if (item.value === "Setting") {
    router.push({
      path: "/setting",
    });
  }
};

const closeWalletAccount = async () => {
  isDialogVisible.value = false;
};

const updateImg = (e: Event) => {
  const { data } = (e as CustomEvent).detail;
  userIcon.value = data;
  console.log(userIcon.value, "userIcon.valueuserIcon.valueuserIcon.value");
};

onMounted(() => {
  document.addEventListener("updateImg", updateImg);
});
</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="20000" location="top">
    {{ snackbarText }}
  </VSnackbar>
  <VBadge v-if="isLogout" location="bottom right" class="v-badge--tonal">
    <!-- <template #badge>
      <img :src="showChainIcon"
        style="width: 1rem; height: 1rem; object-fit: cover; border-radius: 50%; position: absolute; bottom: 7px; right: 6px;" />
    </template> -->
    <VAvatar
      class="cursor-pointer"
      size="38"
      :color="'primary'"
      :variant="'tonal'"
    >
      <VImg
        :src="
          userIcon ||
          `https://xrace-resource.s3.us-west-2.amazonaws.com/user-images/avatar-${renderCodeAt(userAddress)}.png`
        "
      />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="15px">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <div class="d-flex gap-2 align-center" style="height: 4rem">
              <VListItemAction>
                <VBadge location="bottom right" class="v-badge--tonal">
                  <!-- <template #badge>
                    <img :src="showChainIcon"
                      style="width: 1rem; height: 1rem; object-fit: cover; border-radius: 50%; position: absolute; bottom: 7px; right: 6px;" />
                  </template> -->
                  <VAvatar :color="'primary'" :variant="'tonal'">
                    <VImg
                      :src="
                        userIcon ||
                        `https://xrace-resource.s3.us-west-2.amazonaws.com/user-images/avatar-${renderCodeAt(userAddress)}.png`
                      "
                    />
                    <!-- <VIcon v-else icon="ri-user-line" /> -->
                  </VAvatar>
                </VBadge>
              </VListItemAction>

              <div>
                <h6
                  class="d-flex text-h6 font-weight-medium"
                  style="cursor: pointer"
                  @click="copy(userAddress)"
                >
                  {{ formatWalletAddress(userAddress) }}
                  <img
                    src="@images/dashboard/info/copy.png"
                    alt="copy"
                    class="ml-2 mt-1"
                    style="width: 0.9rem; height: 0.9rem"
                  />
                </h6>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template v-for="item in userProfileList" :key="item.title">
              <VListItem
                v-if="item.type === 'navItem'"
                :value="item.value"
                @click="menuClick(item)"
              >
                <template #prepend>
                  <!-- <VIcon :icon="item.icon" size="22" /> -->
                  <img :src="item.icon" class="me-2" style="width: 1.5rem" />
                </template>

                <VListItemTitle>
                  <span style="color: #ccc">
                    {{ item.title }}
                  </span>
                </VListItemTitle>

                <template v-if="item.badgeProps" #append>
                  <VBadge inline v-bind="item.badgeProps" />
                </template>
              </VListItem>

              <VDivider v-else class="my-1" />
            </template>

            <VListItem>
              <VBtn
                block
                color="#FF3434"
                append-icon="ri-logout-box-r-line"
                @click="logout"
              >
                {{ t("logout") }}
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>

  <div v-else @click="loginWallet" class="wallet-connect">{{ t("sl") }}</div>

  <VDialog v-model="isDialogVisible" class="v-dialog-sm">
    <WalletAcconut @closeAres="closeWalletAccount"></WalletAcconut>
  </VDialog>
</template>
<style lang="scss" scoped>
.wallet-connect {
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 8rem;
  height: 2.25rem;
  background: rgb(var(--v-theme-primary));
  color: #fff;
}

// .v-badge.v-badge--tonal .v-badge__wrapper .v-badge__badge.bg-primary {
//   background-color: transparent !important;
// }
:deep(.v-badge) {
  background-color: transparent !important;
}

:deep(.v-badge__wrapper) {
  background-color: transparent !important;
}

:deep(.v-badge--tonal) {
  background-color: transparent !important;
}

:deep(.v-badge__badge) {
  background: transparent !important;
}

:deep(.v-snackbar__wrapper) {
  min-width: 10rem !important;
}

:deep(.v-snackbar__content) {
  text-align: center !important;
}
</style>
