<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import crown_1 from '@images/event/crown_1.png';
import crown_2 from '@images/event/crown_2.png';
import crown_3 from '@images/event/crown_3.png';
import one from '@images/event/one.png';
import two from '@images/event/two.png';
import three from '@images/event/three.png';
import other from '@images/event/other.png';
import DrawerInfo from '@/views/campaign/DrawerInfo.vue'

const route = useRoute()
const { t } = useI18n()
const { locale } = useI18n()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)

const token = ref(JSON.parse(localStorage.getItem('userData'))?.token);
const tableList = ref([]);
const options = ref({ page: 1, sortBy: [''], sortDesc: [false] })
const pageSize = ref(10)
const totalPages = ref(1)
const drawerVisible = ref(false)

// 后端返回总条数
const totalItems = ref<number | null>(null)

/** 计算当前页中第 index 行对应的【全局排名序号】（从 1 开始） */
const computeRank = (index: number) => {
  return (options.value.page - 1) * pageSize.value + index + 1
}

/** 前三名皇冠判断（按全局排名） */
const isRank1 = (index: number) => computeRank(index) === 1
const isRank2 = (index: number) => computeRank(index) === 2
const isRank3 = (index: number) => computeRank(index) === 3


watch(() => route.query.id, (id) => {
  options.value.page = 1
  getDriversData(id)
})

watch(() => options.value.page, (newPage) => {
  getDriversData(route.query.id)
})


const getDriversData = async (id: any) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getRacingDrivers`
    const payload = {
      match_id: id,
      page: options.value.page,
      limit: pageSize.value,
      status: '1'
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
      tableList.value = data.data.list
      totalPages.value = Math.ceil(data.data.total / data.data.limit)
      totalItems.value = data.data.total
    }
  } catch (err) {
    console.error('请求失败:', err)
  }
}

const drawerId = ref()
const infoClick = (item) => {
  drawerVisible.value = true
  drawerId.value = item.id
}

function getChipColor(index: number): string {
  const rank = computeRank(index)
  if (rank === 1) return '#FFB400' // 第1名 黄色
  if (rank === 2) return '#3EC419' // 第2名 绿色
  if (rank === 3) return '#006CEF' // 第3名 蓝色
  return '#FF3434' // 其他 红色
}

function getLangText(field) {
  const obj = parseLangField(field)
  return obj?.[locale.value] || obj?.en || ""
}

onMounted(async () => {
  getDriversData(route.query.id)
})


</script>

<template>
  <VCard>
    <VCardText style="padding: 0px !important">
      <VTable class="text-no-wrap team-members-table" style="width: 100%;">
        <thead>
          <tr>
            <th scope="col">
              {{ t('Ranking') }}
            </th>
            <th scope="col">
              {{ t('Photo') }}
            </th>
            <th scope="col">
              {{ t('driver') }}
            </th>
            <th scope="col">
              {{ t('total_points') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in tableList" :key="index" style="cursor: pointer;" @click="infoClick(item)">
            <td>
              <div class="ms-2">
                <img v-if="isRank1(index)" :src="crown_1" style="width: 1.2rem;" />
                <img v-else-if="isRank2(index)" :src="crown_2" style="width: 1.2rem;" />
                <img v-else-if="isRank3(index)" :src="crown_3" style="width: 1.2rem;" />
                <div v-else class="ms-1" style="color: #FF3434">{{ computeRank(index) }}</div>
              </div>
            </td>

            <td>
              <div class="d-flex align-center" style="font-size: 0.875rem; color: #fff;">
                <img :src="item?.avatar" style="width: 1.875rem; border-radius: 9999px;" />
              </div>
            </td>

            <td>
              <div class="d-flex align-center gap-2" style="font-size: 0.875rem; color: #fff;">
                {{ getLangText(item?.name) }}
                <img :src="item?.team_icon" style="width: 1.875rem;" />
              </div>
            </td>

            <td>
              <VChip :color="getChipColor(index)" style="font-size: 0.875rem;">
                + {{ item?.points }}
                <img v-if="isRank1(index)" :src="one" class="ml-1" style="width: 0.875rem;" />
                <img v-else-if="isRank2(index)" :src="two" class="ml-1" style="width: 0.875rem;" />
                <img v-else-if="isRank3(index)" :src="three" class="ml-1" style="width: 0.875rem;" />
                <img v-else :src="other" class="ml-1" style="width: 0.875rem;" />
              </VChip>
            </td>

          </tr>
        </tbody>
      </VTable>

    </VCardText>
    <div v-if="tableList.length > 0" class="d-flex justify-end mt-4 mb-4 me-2">
      <VPagination v-model="options.page" :length="totalPages" :total-visible="3" />
    </div>

  </VCard>


  <DrawerInfo v-if="drawerVisible" v-model:isDrawerOpen="drawerVisible" :drawerId="drawerId" @drawerClick="drawerClick"
    flag="event" />
</template>

<style lang="scss" scoped></style>
