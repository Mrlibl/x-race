<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';


const { t } = useI18n()
const route = useRoute()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value);
const token = ref(JSON.parse(localStorage.getItem('userData'))?.token);
const tableList = ref([]);

const options = ref({ page: 1, sortBy: [''], sortDesc: [false] })
const pageSize = ref(10)
const totalPages = ref(1)

watch(() => route.query.id, (id) => {
  getSeasonData(id)
})

watch(() => options.value.page, (newPage) => {
  options.value.page = newPage
  getSeasonData(route.query.id)
})

const getSeasonData = async (id: any) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getRaceScheduleList`
    const payload = {
      match_id: id,
      page: options.value.page,
      limit: pageSize.value
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
    }
  } catch (err) {
    console.error('请求失败:', err)
  }
}

function formatTimestampToDate(timestamp: number): string {
  // 如果传进来的是秒级时间戳，先乘1000变成毫秒
  const date = new Date(timestamp * 1000)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}


const getScoreColor = (score) => {
  if (score < 10) return '#006CEF'
  if (score >= 10 && score < 20) return '#3EC419'
  if (score >= 20 && score < 50) return '#FFB400'
  return '#FF4C51'
}

onMounted(async () => {
  getSeasonData(route.query.id)
})


</script>

<template>
  <VCard>
    <VCardText style="padding: 0px !important">
      <VTable class="text-no-wrap team-members-table" style="width: 100%;">
        <thead>
          <tr>
            <th scope="col">
              {{ t('Schedule') }}
            </th>
            <th scope="col">
              {{ t('national_flag') }}
            </th>
            <th scope="col">
              {{ t('Event') }}
            </th>
            <th scope="col">
              {{ t('race_track') }}
            </th>
            <th scope="col">
              {{ t('status') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in tableList" :key="index">
            <td>
              <div class="d-flex align-center">
                <div class="me-3">
                  <div class="point" :style="{ background: `${getScoreColor(60)}` }"></div>
                </div>
                <div>
                  <h6 class="text-h6">
                    {{ formatTimestampToDate(item?.start_time) }} ~ {{ formatTimestampToDate(item?.end_time) }}
                  </h6>
                </div>
              </div>
            </td>

            <td>
              <div class="d-flex align-center" style="font-size: 0.875rem; color: #fff;">
                <img :src="item?.location_icon" style="width: 1.875rem;" />
              </div>
            </td>

            <td>
              <div class="d-flex align-center" style="font-size: 0.875rem; color: #fff;">
                {{ item?.race_name }}
              </div>
            </td>

            <td>
              <div class="d-flex align-center" style="font-size: 0.875rem; color: #fff;">
                {{ item?.track_name }}
              </div>
            </td>
            <td>
              <div class="d-flex align-center" style="font-size: 0.875rem; color: #fff;">
                {{ item?.status === '0' ? t('not') : item?.status === '1' ? t('in_progress') : t('finished') }}
              </div>
            </td>

          </tr>
        </tbody>
      </VTable>

    </VCardText>
    <div v-if="tableList.length > 0" class="d-flex justify-end mt-4 mb-4 me-2">
      <VPagination v-model="options.page" :length="totalPages" :total-visible="3" />
    </div>
  </VCard>



</template>

<style lang="scss" scoped>
.point {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999999px;
}
</style>
