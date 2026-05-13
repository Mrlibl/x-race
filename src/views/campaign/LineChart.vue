<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
})

const detailInfo = computed(() => props.detailInfo || {})
const selectList = ref([
  {
    id: 1,
    name: '1H',
    value: '-1h',
    interval: '10m',
  },
  {
    id: 2,
    name: '6H',
    value: '-6h',
    interval: '1h',
  },
  {
    id: 3,
    name: '1D',
    value: '-1d',
    interval: '4h',
  },
  {
    id: 4,
    name: '1W',
    value: '-7d',
    interval: '1d',
  },
  {
    id: 5,
    name: '1M',
    value: '-30d',
    interval: '1d',
  }
])
const selectedOption = ref(selectList.value[0]);

const detailInfoOptions = ref({})
const series = ref([
  {
    name: '',
    data: []
  }
])
const categories = ref([]);


watch(() => detailInfo.value, (newVal, oldVal) => {
  if (!oldVal) {
    detailInfoOptions.value = newVal.options[0]
  }
  getBetKLineData()
})


const getBetKLineData = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getBetKLineData`
    const payload = {
      projectId: detailInfoOptions.value.project_id || detailInfo.value.options[0].project_id,
      optionId: detailInfoOptions.value.id || detailInfo.value.options[0].id,
      betType: "yes",
      interval: selectedOption.value.interval,
      start: selectedOption.value.value
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
      series.value[0].name = detailInfoOptions.value.option_key
      series.value[0].data = data.data.map(item => item.close)
      categories.value = data.data.map(item => getTime(item.timestamp))
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
    labels: { style: { colors: '#aaa' } },
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
//     name: 'McLaren',
//     data: [280, 200, 220, 180, 270, 250, 70, 90, 200, 150, 160, 100],
//   },
//   {
//     name: 'Ferrar',
//     data: [100, 120, 180, 140, 190, 160, 120, 150, 130, 170, 200, 180],
//   },
//   {
//     name: 'Red Bull Racing',
//     data: [50, 80, 60, 100, 120, 90, 150, 170, 140, 180, 160, 200],
//   },
//   {
//     name: 'Williams',
//     data: [200, 150, 180, 220, 240, 200, 210, 230, 250, 270, 260, 280],
//   },
// ])
const handleSelectChange = (val: any) => {
  getBetKLineData()
}

const changeLine = (e: Event) => {
  const { data, type } = (e as CustomEvent).detail
  detailInfoOptions.value = data
  getBetKLineData()
}


function getChipColor(index: number): string {
  const globalIndex = index
  if (globalIndex === 0) return '#FF3434' // 第1名 红色
  if (globalIndex === 1) return '#FFB400 ' // 第2名 黄色色
  if (globalIndex === 2) return '#3EC419' // 第3名 绿色
  return '#CCCCCC ' // 其他 灰色
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
  document.addEventListener('tradeModular', changeLine)
})


onUnmounted(() => {
  document.removeEventListener("tradeModular", changeLine)
})
</script>

<template>
  <VCard class="type-chart-card">
    <div class="d-flex align-center justify-space-between mx-4 mt-4">
      <div class="d-flex align-center">
        <div class="d-flex align-center gap-4">
          <div style="font-size: 1.125rem; color: #fff; font-weight: 600;">{{ t('trend') }}</div>
          <!-- <span style="font-size: 0.875rem;">Sep 30, 2025</span> -->
          <div class="d-flex align-center gap-6">
            <div class="d-flex align-center gap-2" style="cursor: pointer;">
              <div class="point" style="background: #FF3434"></div>{{ detailInfoOptions?.option_key ||
                detailInfo?.options?.[0]?.option_key }}
            </div>
          </div>
        </div>
      </div>
      <div class="search-select" style="min-width: 7rem">
        <VSelect v-model="selectedOption" :items="selectList" item-title="name" item-value="name" label="Select"
          return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
          @update:modelValue="handleSelectChange" />
      </div>
    </div>
    <VCardText class="type-chart-text" style="padding: 0px 1.25rem;">
      <VueApexCharts type="line" style="width:100%; " :height="370" :options="options" :series="series" />
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.type-chart-card {
  height: 28rem !important;
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
  height: 40px;
  padding: 0 10px;
}

:deep(.v-field__input) {
  padding-top: 3px;
  padding-bottom: 3px;
  border-right: 1px solid #FF3434;
  padding-inline-start: 5px;
}

:deep(.v-select.v-input.v-input--density-comfortable:not(.v-textarea) .v-field__input) {
  min-block-size: 39px;
}

:deep(.v-field__append-inner > .v-icon) {
  color: #FF3434;
}

:deep(.v-select__menu-icon) {
  margin-inline-start: 8px;
}



/* 自定义图例：放在最右（ms-auto）并水平排列 */
.inline-legend {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 单个 legend 项 */
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background .15s, opacity .15s;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

/* 色块 */
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12) inset;
}

/* label 文字 */
.legend-label {
  color: #ddd;
  font-size: 13px;
}

/* 隐藏状态样式（点击后变半透明） */
.legend-hidden {
  opacity: 0.35;
}


.point {
  width: 1rem;
  height: 1rem;
  border-radius: 99999px;
}
</style>