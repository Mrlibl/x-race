<script setup lang="ts">
import ProfitLine from '@/views/campaign/ProfitLine.vue'
import ProfitTable from '@/views/campaign/ProfitTable.vue'
import HistoryTable from '@/views/campaign/HistoryTable.vue'
import Withdraw from '@/views/campaign/Withdraw.vue'
import GameDetail from '@/views/campaign/GameDetail.vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const currentTab = ref(0)
const userId = ref(JSON.parse(localStorage.getItem('userData'))?.id)
const wallet = ref(JSON.parse(localStorage.getItem('userData'))?.wallet);
const currentBalance = ref(0)

// 去详情交易用的
const isDetail = ref(false);
const gameId = ref()
const matchId = ref()

const detailRoot = ref<HTMLElement | null>(null)  // 当前详情页容器
const gameRoot = ref<HTMLElement | null>(null)  // GameDetail 容器

const depositClick = () => {
  document.dispatchEvent(
    new CustomEvent('openDeposit'),
  )
}

const isWithdrawVisible = ref(false)
const withdrawClick = () => {
  isWithdrawVisible.value = true
}

const closeWithdraw = () => {
  isWithdrawVisible.value = false
}

const getProfileInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/user/balance`
    const payload = {
      userId: userId.value,
      page: 1,
      limit: 10
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
      localStorage.setItem("currentBalance", JSON.stringify(data.data.currentBalance));
      currentBalance.value = data.data.currentBalance || 0
      getKLineData()
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}
const assetLineData = ref(0)
const getKLineData = async () => {
  try {
    const url = `https://nodeapi.carx.cz/money/assetLine`
    const payload = {
      wallet: wallet.value,
      time: 'd'
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
      assetLineData.value = data.data.line.length === 0 ? 0 : data.data.line[0]
    }
  } catch (err) {
    console.error('请求失败:', err)
  }
}

const renderNum = () => {
  if (Number(currentBalance.value) !== 0 && Number(assetLineData.value) !== 0) {
    const num = Number(currentBalance.value) - Number(assetLineData.value)
    if (num > 0 || num === 0) {
      return `+$${Math.abs(num).toFixed(2)}`
    } else if (num < 0) {
      return `-$${Math.abs(num).toFixed(2)}`
    }
  } else {
    return `+$0`
  }
}

const renderPer = () => {
  if (Number(currentBalance.value) !== 0 && Number(assetLineData.value) !== 0) {
    const num = (Number(currentBalance.value) - Number(assetLineData.value)) / Number(assetLineData.value)
    if (num > 0 || num === 0) {
      return `${Math.abs(num).toFixed(1)}`
    } else if (num < 0) {
      return `${Math.abs(num).toFixed(1)}`
    }
  } else {
    return `0`
  }
}

const scrollElemTop = (el: HTMLElement | null) => {
  if (el) {
    // 优先滚动到该元素顶部（会滚动正确的容器）
    el.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' })
  }
  // 兜底：window + 常见容器 + 文档节点
  const containers = [window, document.querySelector('.layout-page-content'), document.querySelector('.v-main__wrap')]
  containers.forEach((c: any) => {
    if (!c) return
    try {
      if (c === window) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      else (c as HTMLElement).scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch { }
  })
  document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

// 多帧兜底，抵消图片/轮播后续撑高
const scrollToTopMultiFrame = (frames = 6, el?: HTMLElement | null) => {
  let count = 0
  const doScroll = () => {
    scrollElemTop(el || null)
    if (++count < frames) requestAnimationFrame(doScroll)
  }
  requestAnimationFrame(doScroll)
}



const goDetail = async (item) => {
  console.log(item, 'item---------')
  gameId.value = item.project_id
  matchId.value = item.match_id
  isDetail.value = true
  const tradeInfo = {
    id: item?.option_id,
    project_id: item?.project_id,
    option_text: item.option_text,
    option_key: item.option_key,
    prices: {
      yesPrice: '',
      noPrice: ''
    },
  }

  await nextTick()      // 等 DOM 切换完成
  scrollElemTop(gameRoot.value)
  scrollToTopMultiFrame(6, gameRoot.value)

  setTimeout(() => {
    document.dispatchEvent(
      new CustomEvent('tradeModular', {
        detail: { data: tradeInfo, type: item?.bet_type === 'yes' ? "Yes" : "No", id: item?.option_id, tab: "Sell" },
      }),
    )
  }, 600);
}

const goBack = () => {
  isDetail.value = false
}

onMounted(() => {
  getProfileInfo()
})
</script>

<template>
  <VRow v-if="!isDetail" class="match-height home-div mt-2" ref="detailRoot">
    <VCol cols="12" md="6">
      <VCard>
        <div class="mx-6 mt-4" style="color: #fff; font-size: 1.125rem; font-weight: 600;">
          {{ t('profile.Portfolio') }}
        </div>
        <VCardText>
          <div class="" style="font-size: 3rem; line-height: 3rem; color: #fff; font-weight: bold;">
            $ {{ Number(currentBalance).toFixed(2) || 0 }}
          </div>
          <div class="mt-10" style="font-size: 1.125rem; color: #3EC419">
            {{ renderNum() }} ({{ renderPer() }}%) <span style="color: #CCCCCC">{{ t('profile.Today') }}</span>
          </div>
          <div class="d-flex gap-4 mt-10">
            <div class="deposit_btn py-2 px-8" @click="depositClick">
              <img src="@/assets/images/login/icon_24_deposit.png" style="width: 1.5rem;" />
              {{ t('deposit') }}
            </div>
            <div class="withdraw_btn py-2 px-8" @click="withdrawClick">
              <img src="@/assets/images/login/icon_24_withdraw.png" style="width: 1.5rem;" />
              {{ t('profile.Withdraw') }}
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="6">
      <ProfitLine />
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTabs v-model="currentTab" class="mt-2">
          <VTab>{{ t('profile.Positions') }}</VTab>
          <VTab>{{ t('profile.History') }}</VTab>
        </VTabs>
      </VCard>
    </VCol>


    <VCol cols="12" v-if="currentTab === 0">
      <ProfitTable @goDetail="goDetail" />
    </VCol>

    <VCol cols="12" v-if="currentTab === 1">
      <HistoryTable />
    </VCol>
  </VRow>
  <div v-else ref="gameRoot" class="anchor-top mt-4">
    <GameDetail :gameId="gameId" :matchId="matchId" @goBack="goBack" />
  </div>
  <Withdraw @closeWithdraw="closeWithdraw" :isWithdrawVisible="isWithdrawVisible" />
</template>



<style lang="scss" scoped>
.home-div {
  overflow-x: hidden;
}

.deposit_btn {
  display: flex;
  align-items: center;
  background: #32901A;
  font-size: 0.875rem;
  font-weight: bold;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

.withdraw_btn {
  display: flex;
  align-items: center;
  background: #BA2D2C;
  font-size: 0.875rem;
  font-weight: bold;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

:deep(.v-tab.v-btn) {
  padding-inline: 3rem !important;
}

:deep(.v-tab__slider) {
  left: 25%;
  width: 50%;
}

.anchor-top {
  scroll-margin-top: 80px;
  /* 或 72px / 64px */
}
</style>
