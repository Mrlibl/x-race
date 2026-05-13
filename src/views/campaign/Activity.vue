<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import avatar1 from '@/assets/images/avatars/avatar-1.png'

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
const userId = ref(JSON.parse(localStorage.getItem('userData'))?.id)
const detailInfo = computed(() => props.detailInfo || {})
const activityData = ref([]);
const snackbar = ref(false)
const snackbarText = ref('')
const selectedOption = ref('');
const selectedOptionA = ref(t('all'));
const selectedList = ref([]);
const selectedListA = computed(() => [
  { name: t('all'), value: '' },
  { name: '$10', value: '10' },
  { name: '$100', value: '100' },
  { name: '$1,000', value: '1000' },
  { name: '$10,000', value: '10000' },
  { name: '$100,000', value: '100000' }
]);
const options = ref({ page: 1, sortBy: [''], sortDesc: [false] })
const pageSize = ref(5)
const totalPages = ref(1)


watch(() => detailInfo.value, (newVal, oldVal) => {
  selectedList.value = [{ option_key: t('all'), id: '' }, ...newVal.options]
  selectedOption.value = selectedList.value[0]
  getActivity(1)
})

watch(() => options.value.page, (newPage) => {
  getActivity(newPage)
})


const getActivity = async (page: any) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getBetTransactions`
    const payload = {
      projectId: selectedOption.value.project_id,
      optionId: selectedOption.value.id,
      minBetAmount: selectedOptionA.value.value,
      // userId: userId.value,
      userId: '',
      limit: pageSize.value,
      page: page,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      activityData.value = data.data.list
      totalPages.value = Math.ceil(data.data.total / data.data.limit)
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const handleSelectChange = (val: any) => {
  getActivity(1)
}

const handleSelectChangeA = (val: any) => {
  getActivity(1)
}

const handleErrorAvatar = (event) => {
  event.target.src = avatar1
}

function timeAgo(time: string): string {
  const date = new Date(time)
  const now = new Date()
  let diff = Math.floor((now.getTime() - date.getTime()) / 1000) // 秒差
  if (diff < 0) diff = 0

  if (diff < 60) {
    return `${diff}s ago`
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}m ago`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diff / 86400)
    return `${days}d ago`
  }
}


onMounted(async () => {
})


</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="10000" location="top">
    {{ t(snackbarText) }}
  </VSnackbar>
  <div class="d-flex py-4" style="width: 100%; justify-content: space-between">
    <div class="d-flex gap-4 search-select" style="min-width: 9rem">
      <VSelect v-model="selectedOption" :items="selectedList" item-title="option_key" item-value="option_key"
        label="Select" return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
        @update:modelValue="handleSelectChange" />
      <VSelect v-model="selectedOptionA" :items="selectedListA" item-title="name" item-value="name" label="Select"
        return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
        @update:modelValue="handleSelectChangeA" />
    </div>
    <VPagination v-if="!isMobile" v-model="options.page" :length="totalPages" :total-visible="3" />
  </div>
  <VPagination v-if="isMobile" v-model="options.page" :length="totalPages" :total-visible="1" />
  <VRow>
    <VCol cols="12">
      <VCard class="mx-2">
        <div class="d-flex" style="overflow-x: auto;">
          <VList class="left-list" style="flex: 1;" lines="two" border rounded>
            <template v-for="(item, index) in activityData" :key="index">
              <VListItem style="padding: 20px 5px; min-height: 48px;">
                <template #prepend>
                  <div class="d-flex align-center gap-2">
                    <img :src="item?.userInfo.icon || avatar1" @error="handleErrorAvatar"
                      style="width: 2rem; border-radius: 9999px;" />
                    <div style="color: #fff">{{ item?.userInfo.username }}</div>
                    <div class="ml-2" style="color: #fff"><span>{{ item?.transactionType === 'buy' ? t('profile.bought')
                      : t('profile.sold')
                        }}</span> <span :style="{ color: item?.betType === 'yes' ? '#3EC419' : '#FF3434' }">{{
                          item?.tokenAmount }}
                        {{ item?.betType === 'yes' ? 'Yes' : 'No' }}</span> {{ t('for') }} {{
                          item?.optionInfo?.optionKey }} {{ t('at') }}
                      <span style="font-weight: bold;">{{ item?.unitPrice ? (item?.unitPrice *
                        100).toFixed(1) : 0 }}¢</span> <span style="opacity: 0.5;">(${{ item?.betAmount }})</span>
                    </div>
                  </div>
                </template>
                <template #append>
                  <div class="d-flex align-center gap-2 justify-end" style="color: #fff; opacity: 0.5;">
                    {{ timeAgo(item?.betTime) }}
                    <!-- <img src="@/assets/images/campaign/icon_16_share.png" style="width: 1rem; cursor: pointer;" /> -->
                  </div>
                </template>
              </VListItem>
              <VDivider v-if="index !== activityData.length - 1" />
            </template>
          </VList>
        </div>

      </VCard>
    </VCol>

  </VRow>



</template>

<style lang="scss" scoped>
.left-list {
  border-width: inherit;
  // border-right: 1px solid;
}

.right-list {
  border-width: inherit;
  border-radius: 0px;
  border-left: 1px solid rgb(var(--v-theme-table-border));
}

.v-card-text {
  // padding-block-start: 12px !important;
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
</style>
