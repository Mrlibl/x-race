<script setup lang="ts">
import BNBIcon from '@/assets/images/login/icon_BNB.png'
import USDTLogo from "@/assets/images/token/logo/USDT_LOGO1.png";
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['closeWithdraw'])
const { t } = useI18n()
const props = defineProps({
  isWithdrawVisible: {
    type: Boolean,
    required: true,
  },
})
// const coin = ref(localStorage.getItem('coin'))
const coin = ref<string>('0')
const isWithdrawVisible = computed(() => props.isWithdrawVisible || false);
const inputAddress = ref('')
const inputAmount = ref()

const snackbar = ref(false)
const snackbarText = ref('')
const TokenList = ref([
  {
    id: 1,
    name: "USDT",
    icon: USDTLogo
  },
])
const ChainList = ref([
  // {
  //   id: 1,
  //   name: "Sol",
  //   icon: BNBIcon
  // },
  {
    id: 2,
    name: 'BSC',
    icon: BNBIcon
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
])

const selectedToken = ref<any>(TokenList.value[0])
const selectedChain = ref<any>(ChainList.value[0])

const closeWithdraw = () => {
  emit('closeWithdraw')
}

const maxClick = () => {
  inputAmount.value = localStorage.getItem('coin')
}

const connectClick = () => {
  inputAddress.value = JSON.parse(localStorage.getItem('userData'))?.wallet
}

const withdrawClick = async () => {
  try {
    const url = `https://nodeapi.carx.cz/money/withdraw`
    const payload = {
      wallet: inputAddress.value,
      amount: inputAmount.value,
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
      document.dispatchEvent(new CustomEvent("updateCoin"));
      emit('closeWithdraw')
      snackbarText.value = 'On-chain withdrawal request successfully submitted, awaiting funds arrival.'
      snackbar.value = true
    } else {
      snackbarText.value = 'Insufficient balance for withdrawal + gas.'
      snackbar.value = true
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

// 统一的刷新函数：从 localStorage 取并兜底
function refreshCoin() {
  const v = localStorage.getItem('coin')
  coin.value = v && v !== 'null' && v !== 'undefined' ? v : '0'
}

// 打开弹窗时刷新一次（关键）
watch(
  () => props.isWithdrawVisible,
  (visible) => {
    if (visible) {
      refreshCoin()
      // 仅第一次初始化下拉
      if (!selectedToken.value) selectedToken.value = TokenList.value[0]
      if (!selectedChain.value) selectedChain.value = ChainList.value.find(i => i.name === 'BSC') || ChainList.value[0]
    }
  },
  { immediate: true } // 组件初次挂载时也跑一次，兜底
)

onMounted(() => {
  // selectedToken.value = TokenList.value.find(i => i.name === 'USDC') || null
  // selectedChain.value = ChainList.value.find(i => i.name === 'BSC') || null
})
</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="2000" location="top">
    {{ snackbarText }}
  </VSnackbar>
  <!-- Dialog -->
  <VDialog v-model="isWithdrawVisible" class="v-dialog-sm">
    <VCard title="">
      <DialogCloseBtn variant="text" size="default" @click="closeWithdraw" />
      <div class="dialog_title">
        {{ t('profile.Withdraw') }}
      </div>
      <VCardText class="mx-md-4 mt-4">
        <div>
          <div>{{ t('profile.withdraw_address') }}</div>
        </div>
        <div class="input-address mt-2">
          <VTextField v-model="inputAddress" :placeholder="t('profile.withdraw_enter')" />
        </div>

        <div class="copy-btn py-2 mt-2" @click="connectClick">
          <img src="@/assets/images/login/icon_fox.png" style="width: 1.25rem;" />
          {{ t('profile.withdraw_use') }}
        </div>

        <div class="d-flex justify-space-between mt-2" style="font-size: 0.875rem">
          <div>{{ t('profile.withdraw_amount') }}</div>
          <div>{{ t('Balance') }}: {{ Number(coin).toFixed(2) }} USDT</div>
        </div>
        <VTextField class="mt-2" v-model="inputAmount" clear-icon="ri-close-line" placeholder="0" type="text">
          <!-- AppendInner -->
          <template #append-inner>
            <VFadeTransition leave-absolute>
              <div class="d-flex align-center gap-2">USDT <div class="max px-4 py-1" @click="maxClick">{{ t('Max') }}
                </div>
              </div>
            </VFadeTransition>
          </template>

        </VTextField>

        <div class="d-flex justify-space-between mt-3" style="font-size: 0.875rem;">
          <div>
            {{ t('profile.withdraw_token') }}
            <div class="search-select mt-2" style="min-width: 7rem">
              <VSelect v-model="selectedToken" :items="TokenList" item-title="name" item-value="name" label="Select"
                return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
                @update:modelValue="handleSelectTokenChange">
                <!-- 自定义下拉选项 -->
                <template #item="{ props, item }">
                  <VListItem v-bind="props">
                    <template #prepend>
                      <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 8px;" />
                    </template>
                  </VListItem>
                </template>

                <!-- 自定义选中后显示 -->
                <template #selection="{ item }">
                  <div style="display: flex; align-items: center;">
                    <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 6px;" />
                    <span>{{ item.raw.name }}</span>
                  </div>
                </template>
              </VSelect>
            </div>
          </div>
          <div>
            {{ t('profile.withdraw_chain') }}
            <div class="search-select mt-2" style="min-width: 7rem">
              <VSelect v-model="selectedChain" :items="ChainList" item-title="name" item-value="name" label="Select"
                return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
                @update:modelValue="handleSelectChainChange">
                <!-- 自定义下拉选项 -->
                <template #item="{ props, item }">
                  <VListItem v-bind="props">
                    <template #prepend>
                      <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 8px;" />
                    </template>
                    <!-- <VListItemTitle>{{ item.raw.name }}</VListItemTitle> -->
                  </VListItem>
                </template>

                <!-- 自定义选中后显示 -->
                <template #selection="{ item }">
                  <div style="display: flex; align-items: center;">
                    <img :src="item.raw.icon" alt="" style="width: 20px; height: 20px; margin-right: 6px;" />
                    <span>{{ item.raw.name }}</span>
                  </div>
                </template>
              </VSelect>
            </div>
          </div>
        </div>

        <div class="d-flex justify-space-between mt-2">
          <div>{{ t('profile.withdraw_receive') }}</div>
          <div>
            <div style="text-align: right;">{{ inputAmount || 0 }} USDT</div>
            <div style="text-align: right;">${{ inputAmount || 0 }}</div>
          </div>
        </div>

        <div class="d-flex justify-center mb-2 mt-2">
          <div>
            <div class="d-flex align-center gap-1" style="font-size: 0.875rem;">
              <img src="@/assets/images/login/Frame_1.png" style="width: 0.875rem;" />
              <div style="color: #fff; opacity: 0.5;">{{ t('profile.est_A') }}: ~0.10%</div>
            </div>
            <div class="d-flex align-center gap-1 mt-1" style="font-size: 0.875rem;">
              <img src="@/assets/images/login/Frame_2.png" style="width: 0.875rem;" />
              <div style="color: #fff; opacity: 0.5;">{{ t('profile.est_B') }}: ~0.25%</div>
            </div>
            <div class="d-flex align-center gap-1 mt-1" style="font-size: 0.875rem;">
              <img src="@/assets/images/login/Frame_3.png" style="width: 0.875rem;" />
              <div style="color: #fff; opacity: 0.5;">{{ t('profile.est_C') }}: 2 {{ t('profile.min') }}</div>
            </div>
          </div>
        </div>

        <div class="copy-btn py-2 mt-2" @click="withdrawClick">
          {{ t('profile.Withdraw') }}
        </div>

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
    border: 1px solid #6F6F6F;
    /* 移除边框 */
    // background-color: rgb(var(--v-theme-006CEF)) !important;
    /* 红色背景 */
    border-radius: 5px !important;
    /* 增大圆角 */
    padding-left: .5rem !important;
    color: #fff;
    height: 35px;
    padding: 0 10px;
  }

  :deep(.v-field__input) {
    padding-top: 3px;
    padding-bottom: 3px;
    border-right: 1px solid #6F6F6F;
    padding-inline-start: 5px;
  }

  :deep(.v-select.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
    min-block-size: 34px;
  }

  :deep(.v-field__append-inner > .v-icon) {
    color: #6F6F6F;
  }

  :deep(.v-select__menu-icon) {
    margin-inline-start: 8px;
  }
}


.input-address {
  :deep(.v-text-field.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
    min-block-size: 40px;
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
  background-color: #FF3434;
  font-size: 14px;
  color: #FFFFFF;
  cursor: pointer;
  border-radius: 4px;
}

.max {
  width: 4rem;
  background-color: #4E2626;
  color: #FF3434;
  border-radius: 2px;
  cursor: pointer;
}
</style>
