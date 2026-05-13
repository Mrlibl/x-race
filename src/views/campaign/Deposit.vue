<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BNBLogo from "@/assets/images/token/logo/BNB_LOGO1.png";
import USDCLogo from "@/assets/images/token/logo/USDC_LOGO1.png";
import USDTLogo from "@/assets/images/token/logo/USDT_LOGO1.png";
import WBNBLogo from "@/assets/images/token/logo/WBNB_LOGO1.png";
import { deposit } from "viem/zksync";
import { swapAndRecharge } from "../../utils/wallet-tx";
import Swal from "sweetalert2";
import { ethers } from "ethers";
const { t } = useI18n()

const emit = defineEmits();
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});
const isDialogVisible = computed(() => props.isDialogVisible || false);

const inputAmount = ref("");
const TokenList = ref([
  {
    id: 1,
    name: "USDC",
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    icon: USDCLogo,
  },
  {
    id: 2,
    name: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    icon: USDTLogo,
  },
  {
    id: 3,
    name: "WBNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    icon: WBNBLogo,
  },
  {
    id: 4,
    name: "BNB",
    address: "0x0000000000000000000000000000000000000000",
    icon: BNBLogo,
  },
]);
const ChainList = ref([
  // {
  //   id: 1,
  //   name: "Sol",
  //   icon: BNBIcon
  // },
  {
    id: 2,
    name: "BSC",
    icon: BNBLogo,
  },
  // {
  //   id: 3,
  //   name: 'ETH',
  //   icon: BNBIcon
  // },
  // {
  //   id: 5,
  //   name: 'BASE',
  //   icon: BNBIcon
  // },
  // {
  //   id: 6,
  //   name: 'OP',
  //   icon: BNBIcon
  // },
]);

const selectedToken = ref<any>(TokenList.value[0]);
const selectedChain = ref<any>(ChainList.value[0]);
const userCoin = computed(() =>
  Number.parseFloat(localStorage.getItem("coin")).toFixed(2),
);

const closeCLick = () => {
  emit("closeModal");
};

const handleSelectTokenChange = () => { };

const handleSelectChainChange = () => { };
const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const maxClick = async () => {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const caller = await signer.getAddress();
  if (
    selectedToken.value.address === "0x0000000000000000000000000000000000000000"
  ) {
    const balanceWei = await provider.getBalance(caller);
    const balanceBNB = ethers.formatEther(balanceWei);
    inputAmount.value = balanceBNB;
    console.log("BNB 余额:", balanceBNB);
  } else {
    const erc20 = new ethers.Contract(
      selectedToken.value.address,
      ERC20_ABI,
      signer,
    );
    // 读取 decimals
    const decimals = await erc20.decimals();
    // 读取余额
    const balanceRaw = await erc20.balanceOf(caller);
    const balanceHuman = ethers.formatUnits(balanceRaw, decimals);
    inputAmount.value = balanceHuman;
    console.log("USDT 余额:", balanceHuman);
  }
};

const recharge = async () => {
  const token = selectedToken.value;
  const amout = inputAmount.value;
  const txinfo = await swapAndRecharge(token.address, amout);
  if (txinfo && txinfo.hash) {
    emit("closeModal");
    document.dispatchEvent(new CustomEvent("updateCoin"));
    Swal.fire({
      icon: "info",
      width: 720,
      html: `<div style="color:#ffffff">On-chain deposit successfully submitted, awaiting synchronization.</div>`,
      background: "#000000",
      timer: 4000,
      showCloseButton: false,
      showCancelButton: false,
      focusConfirm: true,
      confirmButtonText: `<div style="color:white">OK</div>`,
      confirmButtonColor: "rgb(var(--v-theme-primary))",
      customClass: {
        popup: "custom-swal-popup",
        confirmButton: "custom-confirm-btn",
      },
    });
  }
};
onMounted(() => {
  // selectedToken.value = TokenList.value.find((i) => i.name === "USDC") || null;
  // selectedChain.value = ChainList.value.find((i) => i.name === "BSC") || null;
});
</script>

<template>
  <!-- Dialog -->
  <VDialog v-model="isDialogVisible" class="v-dialog-sm">
    <VCard title="">
      <DialogCloseBtn variant="text" size="default" @click="closeCLick" />
      <div class="dialog_title">{{ t('deposit_title') }}</div>
      <div class="text-center mt-3" style="color: #ccc; font-size: 0.875rem">
        {{ t('Market_Balance') }}: ${{ userCoin }}
      </div>
      <VCardText class="mx-md-4 mt-10">
        <div class="d-flex justify-space-between" style="font-size: 0.875rem">
          <div>
            {{ t('Supported_token') }}
            <div class="search-select mt-4" style="min-width: 7rem">
              <VSelect v-model="selectedToken" :items="TokenList" item-title="name" item-value="name" label="Select"
                return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
                @update:modelValue="handleSelectTokenChange">
                <!-- 自定义下拉选项 -->
                <template #item="{ props, item }">
                  <VListItem v-bind="props">
                    <template #prepend>
                      <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 8px" />
                    </template>
                  </VListItem>
                </template>

                <!-- 自定义选中后显示 -->
                <template #selection="{ item }">
                  <div style="display: flex; align-items: center">
                    <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 6px" />
                    <span>{{ item.raw.name }}</span>
                  </div>
                </template>
              </VSelect>
            </div>
          </div>
          <div>
            {{ t('Supported_chain') }}
            <div class="search-select mt-4" style="min-width: 7rem">
              <VSelect v-model="selectedChain" :items="ChainList" item-title="name" item-value="name" label="Select"
                return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
                @update:modelValue="handleSelectChainChange">
                <!-- 自定义下拉选项 -->
                <template #item="{ props, item }">
                  <VListItem v-bind="props">
                    <template #prepend>
                      <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 8px" />
                    </template>
                  </VListItem>
                </template>

                <!-- 自定义选中后显示 -->
                <template #selection="{ item }">
                  <div style="display: flex; align-items: center">
                    <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 6px" />
                    <span>{{ item.raw.name }}</span>
                  </div>
                </template>
              </VSelect>
            </div>
          </div>
        </div>

        <div class="d-flex justify-space-between mt-8">
          <div>{{ t('Deposit_Amount') }}</div>
          <!-- <a style="color: #ccc; text-decoration: underline; cursor: pointer;">Terms apply</a> -->
        </div>
        <div class="input-address mt-3">
          <VTextField class="mt-2" v-model="inputAmount" clear-icon="ri-close-line" placeholder="0" type="text">
            <!-- AppendInner -->
            <template #append-inner>
              <VFadeTransition leave-absolute>
                <div class="d-flex align-center gap-2">
                  {{ selectedToken.name }}
                  <div class="max px-4 py-1" @click="maxClick">{{ t('Max') }}</div>
                </div>
              </VFadeTransition>
            </template>
          </VTextField>
        </div>
        <div @click="recharge" class="copy-btn py-3 mt-4">{{ t('deposit') }}</div>
        <!-- <div class="d-flex justify-center mt-4 mb-2">
          <div>
            <div class="d-flex align-center gap-1" style="font-size: 0.875rem;">
              <img src="@/assets/images/login/Frame_1.png" style="width: 0.875rem;" />
              <div style="color: #fff; opacity: 0.5;">Est. price impact: ~0.10%</div>
            </div>
            <div class="d-flex align-center gap-1 mt-2" style="font-size: 0.875rem;">
              <img src="@/assets/images/login/Frame_2.png" style="width: 0.875rem;" />
              <div style="color: #fff; opacity: 0.5;">Est. slippage: ~0.25%</div>
            </div>
            <div class="d-flex align-center gap-1 mt-2" style="font-size: 0.875rem;">
              <img src="@/assets/images/login/Frame_3.png" style="width: 0.875rem;" />
              <div style="color: #fff; opacity: 0.5;">Est. processing time: 2 min</div>
            </div>
          </div>
        </div> -->
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.dialog_title {
  font-size: 2rem;
  color: #fff;
  text-align: center;
  font-weight: bold;
  line-height: 2rem;
}

.search-select {
  :deep(.custom-text-field .v-field) {
    border: 1px solid #6f6f6f;
    /* 移除边框 */
    // background-color: rgb(var(--v-theme-006CEF)) !important;
    /* 红色背景 */
    border-radius: 5px !important;
    /* 增大圆角 */
    padding-left: 0.5rem !important;
    color: #fff;
    height: 35px;
    padding: 0 10px;
  }

  :deep(.v-field__input) {
    padding-top: 3px;
    padding-bottom: 3px;
    border-right: 1px solid #6f6f6f;
    padding-inline-start: 5px;
  }

  :deep(.v-select.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
    min-block-size: 34px;
  }

  :deep(.v-field__append-inner > .v-icon) {
    color: #6f6f6f;
  }

  :deep(.v-select__menu-icon) {
    margin-inline-start: 8px;
  }
}

.input-address {
  :deep(.v-text-field.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
    min-block-size: 36px;
  }

  :deep(.v-field__input) {
    padding-top: 0;
    padding-bottom: 0;
  }
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #ff3434;
  font-size: 0.875rem;
  color: #ffffff;
  cursor: pointer;
}

.max {
  width: 4rem;
  background-color: #4e2626;
  color: #ff3434;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
