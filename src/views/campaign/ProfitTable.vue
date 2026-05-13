<script setup lang="ts">
import defultIcon from '@/assets/images/campaign/icon1.png'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const emit = defineEmits(['goDetail'])

const props = defineProps({

})
const userId = ref(JSON.parse(localStorage.getItem('userData'))?.id)
const positionsData = ref([]);
const options = ref({ page: 1, itemsPerPage: 10, sortBy: [''], sortDesc: [false] })

watch(() => options.value.page, (newPage) => {
  getPositionsInfo()
})

const getPositionsInfo = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/user/getUserAllShares`
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
      positionsData.value = data.data.list
      options.value.itemsPerPage = data.data.total
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const sellClick = (item: any) => {
  emit('goDetail', item)
}

const renderNum = (current_value, total_investment) => {
  if (current_value && total_investment) {
    const num = Number(current_value) - Number(total_investment)
    if (num > 0 || num === 0) {
      return `+$${Math.abs(num).toFixed(2)}`
    } else if (num < 0) {
      return `-$${Math.abs(num).toFixed(2)}`
    }
  }
}

const handleErrorAvatar = (event) => {
  event.target.src = defultIcon
}

onMounted(() => {
  getPositionsInfo()
})
</script>

<template>
  <VCard>
    <VTable class="text-no-wrap team-members-table" :height="positionsData.length === 0 ? 110 : ''" fixed-header>
      <thead>
        <tr>
          <th scope="col">
            {{ t('profile.table_market') }}
          </th>
          <th scope="col">
            {{ t('profile.table_avg_now') }}
          </th>
          <th scope="col">
            {{ t('profile.table_bet') }}
          </th>
          <th scope="col" style="text-align: right;">
            {{ t('profile.table_to_win') }}
          </th>
          <th scope="col" style="text-align: right;">
            {{ t('profile.table_value') }}
          </th>
        </tr>
      </thead>

      <div v-if="positionsData.length === 0" class="mt-4" style="margin-left: 150%;">
        {{ t('profile.table_nodata') }}
      </div>
      <tbody v-if="positionsData.length > 0">
        <tr v-for="(item, index) in positionsData" :key="index">
          <td class="py-4">
            <div class="d-flex align-center">
              <div class="d-flex align-center gap-2">
                <img :src="item.project_icon || defultIcon" @error="handleErrorAvatar"
                  style="width: 4rem; height: 4rem;" />
                <div>
                  <div style="font-size: 1.125rem; color: #fff;">{{ item.project_title }}</div>
                  <div>
                    <span>
                      {{ item?.option_key }}
                    </span>&nbsp;
                    <span :style="{ color: item?.bet_type === 'yes' ? '#3EC419' : '#FF3434' }">{{
                      item?.bet_type === 'yes'
                        ? 'YES' : "NO" }} {{
                        ((Number(item?.total_investment || 0) /
                          Number(item?.share_amount || 0)) * 100).toFixed(1) }}¢</span>
                    {{ Number(item.share_amount)?.toFixed(0) || 0 }} {{ t('profile.shares') }}
                  </div>
                </div>
              </div>
            </div>
          </td>

          <td>
            <div style="font-size: 1.125rem; color: #fff;">
              {{ ((Number(item?.total_investment || 0) /
                Number(item?.share_amount || 0)) * 100).toFixed(1) }}¢ →{{ (item.current_price * 100).toFixed(1) }}¢
            </div>
          </td>

          <td>
            <div style="font-size: 1.125rem; color: #fff;">
              ${{ Number(item.total_investment).toFixed(2) }}
            </div>
          </td>

          <td>
            <div style="font-size: 1.125rem; color: #fff; text-align: right;">
              ${{ Number(item.share_amount)?.toFixed(0) }}
            </div>
          </td>

          <td>
            <div class="d-flex align-center justify-end gap-3">
              <div>
                <div style="font-size: 1.125rem; color: #fff; text-align: right;">
                  ${{ (item.current_value).toFixed(2) }}
                </div>
                <div style="font-size: 0.875rem; color: #ccc;">
                  {{ renderNum(item.current_value, item.total_investment) }}({{ (Math.abs(item?.roi || 0) *
                    100).toFixed(1) }}%)
                </div>
              </div>

              <div class="sell_btn py-1 px-6" @click="sellClick(item)">
                {{ t('profile.sell') }}
              </div>
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
