<script setup lang="ts">
import defultIcon from '@/assets/images/campaign/icon1.png'
import { useI18n } from 'vue-i18n';
import { signMessage } from "@wagmi/core";

const { t } = useI18n()

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
})
const snackbar = ref(false)
const snackbarText = ref('')
const detailInfo = computed(() => props.detailInfo || {})
const tradeInfo = ref()
const currentTab = ref('Buy')
const items = [
  {
    id: 'Buy',
    name: 'buy',
  },
  {
    id: 'Sell',
    name: 'sell',
  },
]
console.log(currentTab.value, 'currentTab-----')

const inputShares = ref(); // 投注份数
const betInfo = ref({}); // 投注预测信息
const isYes = ref(true);
const userId = ref(JSON.parse(localStorage.getItem('userData'))?.id);
const currentBalance = ref(localStorage.getItem('currentBalance'));
const sharesYesData = ref({});
const sharesNoData = ref({});
const signature = ref("");
const buyNumList = computed(() => [
  {
    id: 1,
    num: '+1',
  },
  {
    id: 2,
    num: '+20',
  },
  {
    id: 3,
    num: '+100',
  },
  {
    id: 4,
    num: t('Max'),
  }
])

const sellNumList = computed(() => [
  {
    id: 1,
    num: '25%',
  },
  {
    id: 2,
    num: '50%',
  },
  {
    id: 3,
    num: '75%',
  },
  {
    id: 4,
    num: t('Max'),
  }
])

const tradeId = ref(null)
watch(() => detailInfo.value, (newVal, oldVal) => {
  console.log(tradeId.value, '0-0-00-0-0--0-0-00-0-0-')
  if (tradeId.value) {
    tradeInfo.value = newVal.options.filter((el) => el.id == tradeId.value)[0]
  } else {
    tradeInfo.value = newVal.options[0]
  }

  getSharesInfo()
})

// 防抖定时器
let timer = null

// 监听 inputShares
watch(inputShares, (newVal) => {
  if (timer) clearTimeout(timer)
  // 停顿 500ms 才触发请求
  timer = setTimeout(() => {
    if (currentTab.value === 'Buy') {
      if (inputShares.value) {
        getBuyBetInfo()
      }
    } else if (currentTab.value === 'Sell') {
      if (inputShares.value) {
        getSellBetInfo()
      }
    }
  }, 500)
})

const tabClick = () => {
  isYes.value = true
  betInfo.value = {}
  inputShares.value = null
  signature.value = ""
}

// 获取用户在指定项目中的份额
const getSharesInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/user/shares`
    const payload = {
      userId: userId.value,
      projectId: detailInfo.value.id, //项目id
      option_id: tradeInfo.value.id,
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
      sharesYesData.value = data.data.filter((item) => item.bet_type === 'yes')[0]
      sharesNoData.value = data.data.filter((item) => item.bet_type === 'no')[0]
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

// 投注预测
const getBuyBetInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/calculateBetPrice`
    const payload = {
      projectId: tradeInfo.value.project_id, //项目id
      optionId: tradeInfo.value.id, //投注选项 id
      betType: isYes.value ? "yes" : "no", //投注选择:yes/no
      tokenAmount: inputShares.value //投注份额
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
      betInfo.value = data.data
    }

  } catch (err) {
    snackbar.value = true
    snackbarText.value = 'trade_error'
    console.error('请求失败:', err)
  }
}
// 出售预测
const getSellBetInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/calculateIncomeByTokenAmount`
    const payload = {
      projectId: tradeInfo.value.project_id, //项目id
      optionId: tradeInfo.value.id, //投注选项 id
      betType: isYes.value ? "yes" : "no", //投注选择:yes/no
      tokenAmount: inputShares.value //投注份额
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
      betInfo.value = data.data
    }

  } catch (err) {
    snackbar.value = true
    snackbarText.value = 'trade_error'
    console.error('请求失败:', err)
  }
}

const chooseBuyClick = (id: any) => {
  switch (id) {
    case 1:
      inputShares.value = 1
      break;
    case 2:
      inputShares.value = 20
      break;
    case 3:
      inputShares.value = 100
      break;
    case 4:
      inputShares.value = Math.floor(currentBalance.value)
      break;
  }
  getBuyBetInfo()
}

const chooseSellClick = (id: any) => {
  console.log(id, 'id--------')
  if (isYes.value) {
    switch (id) {
      case 1:
        inputShares.value = sharesYesData.value ? Math.round(Number(sharesYesData.value?.share_amount || 0) * 0.25) : 0
        break;
      case 2:
        inputShares.value = sharesYesData.value ? Math.round(Number(sharesYesData.value?.share_amount || 0) * 0.5) : 0
        break;
      case 3:
        inputShares.value = sharesYesData.value ? Math.round(Number(sharesYesData.value?.share_amount || 0) * 0.75) : 0
        break;
      case 4:
        inputShares.value = sharesYesData.value ? Math.round(Number(sharesYesData.value?.share_amount || 0) * 1) : 0
        break;
    }
  } else {
    switch (id) {
      case 1:
        inputShares.value = sharesNoData.value ? Math.round(Number(sharesNoData.value?.share_amount || 0) * 0.25) : 0
        break;
      case 2:
        inputShares.value = sharesNoData.value ? Math.round(Number(sharesNoData.value?.share_amount || 0) * 0.5) : 0
        break;
      case 3:
        inputShares.value = sharesNoData.value ? Math.round(Number(sharesNoData.value?.share_amount || 0) * 0.75) : 0
        break;
      case 4:
        inputShares.value = sharesNoData.value ? Math.round(Number(sharesNoData.value?.share_amount || 0) * 1) : 0
        break;
    }
  }
  if (inputShares.value !== 0) {
    getSellBetInfo()
  }
}

const yesClick = () => {
  isYes.value = true
  inputShares.value = null
  betInfo.value = {}
}

const noClick = () => {
  isYes.value = false
  inputShares.value = null
  betInfo.value = {}
}

// 投注
const buyTradeClick = async () => {
  const message = 'buy'
  signature.value = await signMessage(config, { message });
  if (signature.value !== "") {
    try {
      const url = `https://nodeapi.carx.cz/lottery/placeBet`
      const payload = {
        userId: userId.value, //项目id
        optionId: tradeInfo.value.id, //投注选项 id
        betType: isYes.value ? "yes" : "no", //投注选择:yes/no
        tokenAmount: inputShares.value //投注份额
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
        getSharesInfo()
        betInfo.value = {}
        inputShares.value = null
        snackbar.value = true
        snackbarText.value = 'trade_success'
        signature.value = ""
        // 更新详情
        document.dispatchEvent(
          new CustomEvent('updateDetail', {
          }),
        )
      }

    } catch (err) {
      snackbar.value = true
      snackbarText.value = 'trade_error'
      console.error('请求失败:', err)
    }
  }

}

// 出售份额
const sellTradeClick = async () => {
  const message = 'sell'
  signature.value = await signMessage(config, { message });
  if (signature.value !== "") {
    try {
      const url = `https://nodeapi.carx.cz/lottery/sellTokens`
      const payload = {
        userId: userId.value, //项目id
        optionId: tradeInfo.value.id, //投注选项 id
        betType: isYes.value ? "yes" : "no", //投注选择:yes/no
        tokenAmount: inputShares.value //投注份额
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
        getSharesInfo()
        betInfo.value = {}
        inputShares.value = null
        snackbar.value = true
        snackbarText.value = 'trade_success'
        signature.value = ""
        // 更新详情
        document.dispatchEvent(
          new CustomEvent('updateDetail', {
          }),
        )
      }

    } catch (err) {
      snackbar.value = true
      snackbarText.value = 'trade_error'
      console.error('请求失败:', err)
    }
  }
}


const handleEvent = (e: Event) => {
  const { data, type, id, tab } = (e as CustomEvent).detail
  tradeId.value = id
  tradeInfo.value = data
  isYes.value = type === 'Yes' ? true : false
  currentTab.value = tab || 'Buy'
}


const handleErrorAvatar = (event) => {
  event.target.src = defultIcon
}

function onInput(e: Event) {
  let val = (e.target as HTMLInputElement).value
  // 只保留数字
  val = val.replace(/\D/g, '')
  // 去掉前导零
  val = val.replace(/^0+/, '')
  inputShares.value = val
}

onMounted(() => {
  document.addEventListener('tradeModular', handleEvent)
})

onUnmounted(() => {
  document.removeEventListener('tradeModular', handleEvent)

})
</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="2000" location="top">
    {{ t(snackbarText) }}
  </VSnackbar>
  <VCard>
    <VCardText>
      <div class="d-flex align-center gap-4">
        <img :src="detailInfo.icon || defultIcon" @error="handleErrorAvatar" style="width: 4rem; height: 4rem;" />
        <div style="font-size: 1.125rem; color: #fff">{{ tradeInfo?.option_text }}</div>
      </div>
      <VTabs class="mt-5" v-model="currentTab" grow @click="tabClick">
        <VTab v-for="item in items" :key="item.name" :value="item.id">
          {{ t(item.name) }}
        </VTab>
      </VTabs>

      <VWindow v-show="currentTab === 'Buy'" class="mt-3">
        <VWindowItem>
          <div class="d-flex gap-4">
            <div class="py-2 yes_btn" :style="{ flex: 1, background: isYes ? '#32901A' : '#2E2E30' }" @click="yesClick">
              {{ t('YES') }} <span>{{ (tradeInfo?.prices.yesPrice * 100)?.toFixed(1) }} ¢</span>
            </div>
            <div class="py-2 no_btn" :style="{ flex: 1, background: isYes ? '#2E2E30' : '#FF3434' }" @click="noClick">
              {{ t('NO') }}
              <span>{{
                (tradeInfo?.prices.noPrice * 100)?.toFixed(1) }} ¢</span>
            </div>
          </div>
          <div>
            <div class="d-flex justify-space-between align-center gap-3 mt-4">
              <div>{{ t('Shares') }}</div>
              <VTextField v-model="inputShares" placeholder="" type="text" @input="onInput" />
            </div>
            <div class="d-flex justify-end gap-2 mt-2">
              <div v-for="item in buyNumList" class="py-1 px-2 num_btn" @click="chooseBuyClick(item.id)">{{ item.num }}
              </div>
            </div>
          </div>
          <div class="line mt-4"></div>
          <div class="mt-4">
            <div class="d-flex justify-space-between">
              <div style="color: #fff;">
                {{ t('Total') }}
              </div>
              <div>{{ t('avg') }} {{ betInfo.averagePricePerToken ? (betInfo.averagePricePerToken * 100).toFixed(1) : 0
                }}¢
              </div>
            </div>
            <div class="num mt-2">${{ betInfo.requiredAmount ? (betInfo.requiredAmount).toFixed(3) : 0 }}</div>
          </div>
          <div class="line mt-6"></div>

          <div class="mt-4">
            <div class="d-flex justify-space-between">
              <div style="color: #fff;">
                {{ t('to_win') }}
              </div>
              <div>{{ t('Balance') }} $ {{ currentBalance || 0 }}</div>
            </div>
            <div class="mt-2"
              style="color: #3EC419; font-size: 3rem; line-height: 3rem; font-weight: bold; text-align: right;">
              ${{ inputShares || 0 }}
            </div>
          </div>
          <div class="py-2 trade_btn mt-6" @click="buyTradeClick">
            {{ t('trade') }}
          </div>
        </VWindowItem>
      </VWindow>


      <VWindow v-if="currentTab === 'Sell'" class="mt-3">
        <VWindowItem>
          <div class="d-flex gap-4">
            <div class="py-2 yes_btn" :style="{ flex: 1, background: isYes ? '#32901A' : '#2E2E30' }" @click="yesClick">
              {{ t('YES') }} <span>{{ (tradeInfo?.prices.yesPrice * 100)?.toFixed(1) }}
                ¢</span></div>
            <div class="py-2 no_btn" :style="{ flex: 1, background: isYes ? '#2E2E30' : '#FF3434' }" @click="noClick">
              {{ t('NO') }}
              <span>{{ (tradeInfo?.prices.noPrice * 100)?.toFixed(1) }}
                ¢</span>
            </div>
          </div>
          <div>
            <div class="d-flex justify-space-between align-center gap-3 mt-4">
              <div>{{ t('Shares') }}</div>
              <VTextField v-model="inputShares" placeholder="" type="text" @input="onInput" />
            </div>
            <div class="d-flex justify-end gap-2 mt-2">
              <div v-for="item in sellNumList" class="py-1 px-2 num_btn" @click="chooseSellClick(item.id)">{{ item.num
              }}
              </div>
            </div>
          </div>
          <!-- <div class="mt-4">
            <div class="d-flex justify-space-between">
              <div style="color: #fff;">
                Total
              </div>
              <div>Avg. Price 0.9¢</div>
            </div>
            <div class="num mt-2">$142.54</div>
          </div> -->
          <div class="line mt-4"></div>

          <div class="mt-4">
            <div class="d-flex justify-space-between">
              <div style="color: #fff;">
                {{ t('recrive') }}
              </div>
              <div>{{ t('avg') }} {{ betInfo.averagePricePerToken ? (betInfo.averagePricePerToken * 100).toFixed(1) : 0
                }}¢
              </div>
            </div>
            <div class="mt-2"
              style="color: #3EC419; font-size: 3rem; line-height: 3rem; font-weight: bold; text-align: right;">
              ${{ betInfo.grossIncome ? (betInfo.grossIncome).toFixed(3) : 0 }}
            </div>
          </div>
          <div class="py-2 trade_btn" style="margin-top: 8.95rem;" @click="sellTradeClick">
            {{ t('trade') }}
          </div>
        </VWindowItem>
      </VWindow>
    </VCardText>

  </VCard>
</template>


<style lang="scss" scoped>
.yes_btn {
  // background: #32901A;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;

  span {
    color: #fff;
    font-weight: bold;
  }
}

.no_btn {
  // background: #2E2E30;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;

  span {
    color: #fff;
    font-weight: bold;
  }
}

// .sell_yes_btn {
//   background: #2E2E30;
//   border-radius: 4px;
//   font-size: 0.875rem;
//   text-align: center;
//   cursor: pointer;

//   span {
//     color: #fff;
//     font-weight: bold;
//   }
// }

// .sell_no_btn {
//   background: #FF3434;
//   border-radius: 4px;
//   font-size: 0.875rem;
//   text-align: center;
//   cursor: pointer;

//   span {
//     color: #fff;
//     font-weight: bold;
//   }
// }

.num {
  color: #fff;
  font-size: 3rem;
  line-height: 3rem;
  font-weight: bold;
  text-align: right;
}

.num_btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  color: #fff;
  font-size: 0.875rem;
}

.line {
  width: 100%;
  height: 1px;
  background: #FFFFFF;
  opacity: 0.1;
}

.trade_btn {
  background-color: #FFFFFF;
  border-radius: 4px;
  color: #000;
  text-align: center;
  cursor: pointer;
}

:deep(.v-field--no-label) {
  --v-field-padding-bottom: 8px !important;
}
</style>
