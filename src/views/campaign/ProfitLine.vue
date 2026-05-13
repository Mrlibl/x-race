<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n()

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
})

const detailInfo = computed(() => props.detailInfo || {});
const wallet = ref(JSON.parse(localStorage.getItem('userData'))?.wallet);
const coinChange = ref('')
const series = ref([
  {
    data: []
  }
])
const categories = ref([]);
const selectList = ref([
  {
    id: 1,
    name: '1D',
    value: 'd',
  },
  {
    id: 2,
    name: '1W',
    value: 'w',
  },
  {
    id: 3,
    name: '1M',
    value: 'm',
  }
])
const selectedOption = ref(selectList.value[0]);

const getKLineData = async () => {
  try {
    const url = `https://nodeapi.carx.cz/money/assetLine`
    const payload = {
      wallet: wallet.value,
      time: selectedOption.value.value
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
      if (data.data.coinChange < 0) {
        coinChange.value = `-$${Math.abs(data.data.coinChange).toFixed(2)}`
      } else {
        coinChange.value = `+$${data.data.coinChange.toFixed(2)}`
      }
      series.value[0].data = data.data.line
      // const date = [
      //   "2025-09-22T09:00:00.000Z",
      //   "2025-09-22T10:00:00.000Z",
      //   "2025-09-22T12:00:00.000Z"
      // ]
      categories.value = data.data.date.map(d => getTime(d))
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const options = computed(() => ({
  chart: {
    type: 'line',
    // height: 400,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  markers: {
    size: 4,
    hover: { size: 6 },
  },
  grid: {
    borderColor: 'rgba(200, 200, 200, 0.2)',
    strokeDashArray: 4,
  },
  xaxis: {
    categories: categories.value,
    labels: { style: { colors: '#aaa' }, offsetX: 4, },
  },
  yaxis: {
    labels: { style: { colors: '#aaa' } },
  },
  // legend: {
  //   position: 'top',
  //   horizontalAlign: 'left',
  //   labels: { colors: '#aaa' },
  // },
  legend: { show: false },
  tooltip: {
    theme: 'dark',
  },
  colors: ['#FF3434', '#FFB400', '#3EC419', '#CCCCCC'], // 四条线的颜色
}))


// 数据系列 - 四条线
// const series = computed(() => [
//   {
//     data: [280, 200, 220, 180, 270, 250, 70, 90, 200, 150, 160, 100],
//   },
// ])
const handleSelectChange = (val: any) => {
  console.log(selectedOption.value, 'selectedOptionselectedOption')
  getKLineData()
}

function getTime(timestamp) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours() + 8).padStart(2, '0') // UTC + 8
  const minute = String(date.getUTCMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

onMounted(async () => {
  getKLineData()
})
</script>

<template>
  <VCard class="type-chart-card">
    <div class="d-flex align-center justify-space-between mx-6 mt-3">
      <div class="d-flex align-center" style="color: #fff; font-size: 1.125rem; font-weight: 600;">
        {{ t('profile.Profit_Loss') }}
      </div>
      <div class="search-select" style="min-width: 6rem">
        <VSelect v-model="selectedOption" :items="selectList" item-title="name" item-value="name" label="Select"
          return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
          @update:modelValue="handleSelectChange" />
      </div>
    </div>
    <div class="mx-6" style="color: #FF3434; font-size: 3rem; font-weight: bold;">
      {{ coinChange }}
    </div>
    <VCardText class="type-chart-text" style="margin-top: -12px; padding: 0px">
      <VueApexCharts type="line" style="width:95%; " :height="180" :options="options" :series="series" />
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.type-chart-card {
  height: 18rem !important;
}

.type-chart-text {
  width: 100% !important;
  display: flex;
  justify-content: center;
  align-items: start;
}

:deep(.custom-text-field .v-field) {
  // width: 10rem;
  // border: none !important;
  border: 1px solid #FF3434;
  /* 移除边框 */
  // background-color: rgb(var(--v-theme-006CEF)) !important;
  /* 红色背景 */
  border-radius: 5px !important;
  /* 增大圆角 */
  padding-left: .5rem !important;
  color: #FF3434;
  height: 35px;
  padding: 0 10px;
}

:deep(.v-field__input) {
  padding-top: 3px;
  padding-bottom: 3px;
  border-right: 1px solid #FF3434;
  padding-inline-start: 5px;
}

:deep(.v-select.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
  min-block-size: 34px;
}

:deep(.v-field__append-inner > .v-icon) {
  color: #FF3434;
}

:deep(.v-select__menu-icon) {
  margin-inline-start: 8px;
}
</style>