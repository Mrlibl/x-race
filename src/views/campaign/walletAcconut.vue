<script setup lang="ts">
import BaseIcon from "@/assets/images/chain/Base@2x.png";
import BscIcon from "@/assets/images/chain/BSC@2x.png";
import EthIcon from "@/assets/images/chain/ETH@2x.png";
import OpIcon from "@/assets/images/chain/optimism.png";
import PolygonIcon from "@/assets/images/chain/pol-token.png";
import SolanaIcon from "@/assets/images/chain/Solana@2x.png";
import { chainId, loginInSystem, isLoginWallet } from "@/utils/wallet-connect";
import { maxUint248 } from "viem";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const emit = defineEmits(["closeAres"]);
const showChainIcon = ref();
const walletAddress = ref(localStorage.getItem("walletAddress"));
const snackbar = ref(false);
const snackbarText = ref("");
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

const close = async () => {
  emit("closeAres");
};

function shortAddress(address) {
  if (!address || address.length < 10) return address || "";
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

const logOutSystem = async () => {
  localStorage.clear();
  location.reload();
};
</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="2000" location="top">
    {{ snackbarText }}
  </VSnackbar>
  <div class="wa-area">
    <div class="inclue-area">
      <!-- <div @click="close" class="area-title">
        <img :src="showChainIcon" alt="" />
        <VIcon
          size="32"
          style="opacity: 0.5; cursor: pointer"
          icon="ri-close-large-line"
        />
      </div> -->
      <!-- <div
        @click="close"
        style="position: absolute; right: 0.5rem; top: 0.5rem; cursor: pointer"
      >
        <VIcon size="16" style="opacity: 0.5" icon="ri-close-large-line" />
      </div> -->

      <DialogCloseBtn variant="text" size="default" @click="close" />
      <div class="title-area">{{ t("wl") }}</div>
      <div class="logo-area">
        <img src="@/assets/images/logo.png" alt="" />
      </div>
      <div class="address-area">
        <div>{{ t("wla") }}</div>
        <div style="display: flex; align-items: center">
          <div>{{ shortAddress(walletAddress) }}</div>
          <img
            @click="copy(walletAddress)"
            src="@images/dashboard/info/copy.png"
            alt="copy"
            class="ml-2"
            style="width: 0.9rem; height: 0.9rem; cursor: pointer"
          />
        </div>
      </div>

      <div class="address-area">
        <div>{{ t("wlcs") }}</div>
        <div>{{ t("wlcced") }}</div>
      </div>
      <div class="chain-area">
        <div>{{ t("wlc") }}</div>
        <div class="chain-icon-area">
          <img :src="showChainIcon" alt="" />
          <div>BSC</div>
        </div>
      </div>

      <div class="op-area">
        <div @click="loginInSystem" class="sign-area">
          {{ t("wsali") }}
        </div>
        <div @click="logOutSystem" class="dis-area">
          {{ t("wld") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wa-area {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .inclue-area {
    position: relative;
    width: clamp(20rem, 90%, 32rem);
    border-radius: 20px;
    background: rgb(var(--v-theme-surface));

    /* .area-title {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    } */

    .title-area {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-top: 3rem;
      font-size: 2rem;
      font-weight: bold;
    }

    .logo-area {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
      margin-bottom: 2rem;

      img {
        width: 100px;
      }
    }

    .address-area {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 6rem 0 6rem;
      @media (max-width: 431px) {
        padding: 0 3rem 0 3rem;
      }
      margin-bottom: 1rem;
      font-size: 1rem;
      opacity: 0.7;
    }

    .chain-area {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 6rem 0 6rem;
      @media (max-width: 431px) {
        padding: 0 3rem 0 3rem;
      }
      opacity: 0.7;

      .chain-icon-area {
        display: flex;
        justify-content: end;
        align-items: center;
        gap: 0.5rem;

        img {
          width: 25px;
        }
      }
    }

    .op-area {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      justify-content: center;
      align-items: center;
      margin-top: 3rem;
      padding-bottom: 2rem;

      .sign-area {
        width: 60%;
        height: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 1px solid #6f6f6f;
        border-radius: 10px;
        background-color: #ff3434;
      }

      .dis-area {
        width: 60%;
        height: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 1px solid #6f6f6f;
        border-radius: 10px;
        background-color: grey;
      }
    }
  }
}
</style>
