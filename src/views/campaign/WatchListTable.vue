<script setup>
import GameDetail from '@/views/campaign/GameDetail.vue'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps({

})

const followList = ref([]);
const options = ref({ page: 1, sortBy: [''], sortDesc: [false] })
const pageSize = ref(10)
const totalPages = ref(1)

watch(() => options.value.page, (newPage) => {
  getFollowList()
})


const getFollowList = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/user_followed_projects`
    const payload = {
      userId: JSON.parse(localStorage.getItem('userData'))?.id,
      page: options.value.page,
      limit: pageSize.value,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('userData'))?.token}`
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      followList.value = data.data.list
      localStorage.setItem('followList', JSON.stringify(data.data.list))
      totalPages.value = Math.ceil(data.data.total / data.data.limit)
      totalItems.value = data.data.total
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}
const isDetail = ref(false);
const gameId = ref();
const matchId = ref();
const detailClick = (item) => {
  isDetail.value = true
  gameId.value = item.id
  matchId.value = item.match_id
}

const goBack = () => {
  isDetail.value = false
}

const formatDate = (ts) => {
  return new Date(ts * 1000).toISOString().split('T')[0]
}


onMounted(() => {
  getFollowList()
})
</script>

<template>
  <VCard v-if="!isDetail">
    <VTable class="text-no-wrap team-members-table" fixed-header>
      <thead>
        <tr>
          <th scope="col">
            {{ t('profile.table_market') }}
          </th>
          <th scope="col">
            {{ t('profile.table_total') }}
          </th>
          <th scope="col">
            {{ t('profile.table_vol') }}
          </th>
          <th scope="col">
            {{ t('profile.table_comments') }}
          </th>
          <th scope="col">
            {{ t('profile.table_top') }}
          </th>
          <th scope="col">
            {{ t('profile.table_probability') }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in followList" :key="index" style="cursor: pointer;" @click="detailClick(item)">
          <td>
            <div class="d-flex align-center">
              <div class="d-flex align-center gap-2 py-3">
                <img :src="item.icon" style="width: 4rem;" />
                <h6 class="text-h6">
                  {{ item?.title }}
                </h6>

              </div>
            </div>
          </td>

          <td>
            {{ item?.total_bet_amount.toFixed(2) }}
          </td>

          <td>
            <div class="d-flex font-weight-medium">
              <h6 class="text-h6 text-medium-emphasis">
                {{ item?.bet_amount_24h.toFixed(2) }}
              </h6>
            </div>
          </td>

          <td>
            {{ item?.comment_count }}
          </td>


          <td>
            {{ item?.highest_yes_option?.option_key }}
          </td>

          <td>
            {{ ((item?.highest_yes_ratio || 0) * 100).toFixed(2) }}%
          </td>
        </tr>
      </tbody>
    </VTable>
    <div v-if="followList.length > 0" class="d-flex justify-end mt-4 mb-4 me-2">
      <VPagination v-model="options.page" :length="totalPages" :total-visible="3" />
    </div>
  </VCard>
  <div v-else>
    <GameDetail :gameId="gameId" :matchId="matchId" @goBack="goBack" />
  </div>
</template>
<style lang="scss" scoped></style>
