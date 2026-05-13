<script setup lang="ts">
import defultIcon from '@/assets/images/campaign/icon1.png'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps({

})
const userId = ref(JSON.parse(localStorage.getItem('userData'))?.id)
const historyData = ref([]);
const options = ref({ page: 1, itemsPerPage: 10, sortBy: [''], sortDesc: [false] })

watch(() => options.value.page, (newPage) => {
  getHistoryInfo()
})

const getHistoryInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getBetTransactions`
    const payload = {
      userId: userId.value,
      page: options.value.page,
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
      historyData.value = data.data.list
      options.value.itemsPerPage = data.data.total
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

function timeAgo(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000) // 秒差

  if (diff < 60) {
    return `${diff}s ${t('ago')}`
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}M ${t('ago')}`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}H ${t('ago')}`
  } else {
    const days = Math.floor(diff / 86400)
    return `${days}D ${t('ago')}`
  }
}

const handleErrorAvatar = (event) => {
  event.target.src = defultIcon
}

onMounted(() => {
  getHistoryInfo()
})
</script>

<template>
  <VCard>
    <VTable class="text-no-wrap team-members-table" :height="historyData.length === 0 ? 110 : ''" fixed-header>
      <thead>
        <tr>
          <th scope="col">
            {{ t('profile.table_activity') }}
          </th>
          <th scope="col">
            {{ t('profile.table_market') }}
          </th>
          <th scope="col">
            {{ t('profile.table_value') }}
          </th>
          <th scope="col" style="text-align: center;">
            {{ t('profile.table_time') }}
          </th>
        </tr>
      </thead>

      <div v-if="historyData.length === 0" class="mt-4" style="margin-left: 150%;">
        {{ t('profile.table_nodata') }}
      </div>
      <tbody v-if="historyData.length > 0">
        <tr v-for="item in historyData" :key="item.id">
          <td>
            <div style="font-size: 1.125rem; color: #fff;">
              {{ item.transactionType === 'buy' ? t('profile.bought') : t('profile.sold') }}
            </div>
          </td>


          <td class="py-4">
            <div class="d-flex align-center">
              <div class="d-flex align-center gap-2">
                <img :src="item.projectInfo?.icon || defultIcon" @error="handleErrorAvatar"
                  style="width: 4rem; height: 4rem;" />
                <div>
                  <div style="font-size: 1.125rem; color: #fff;">{{ item?.projectInfo?.title }}</div>
                  <div>
                    <span>{{ item?.optionInfo?.optionKey }}</span>&nbsp;
                    <span :style="{ color: item?.betType === 'yes' ? '#3EC419' : '#FF3434' }">{{ item?.betType === 'yes'
                      ?
                      'YES' : 'No' }} {{ ((item?.unitPrice || 0) * 100).toFixed(1)
                      }}¢</span>
                    {{ item?.tokenAmount }} {{ t('profile.shares') }}
                  </div>
                </div>
              </div>
            </div>
          </td>



          <td>
            <div style="font-size: 1.125rem; color: #fff;">
              ${{ item?.betAmount }}
            </div>
          </td>

          <td>
            <div style="font-size: 1.125rem; color: #fff; text-align: center;">
              {{ timeAgo(item?.betTime) }}
            </div>
          </td>

        </tr>
      </tbody>
    </VTable>
    <div class="page-div d-flex flex-wrap justify-end  gap-y-2 mt-2 me-2 mb-2">
      <VPagination v-model="options.page" :total-visible="2" :length="Math.ceil(options.itemsPerPage / 10)" />
    </div>
  </VCard>
</template>
<style lang="scss" scoped>
.sell_btn {
  background-color: #32901A;
  font-weight: bold;
  font-size: 0.875rem;
  color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
}
</style>
