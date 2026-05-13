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
const detailInfo = computed(() => props.detailInfo || {})
const token = ref(JSON.parse(localStorage.getItem('userData'))?.token);
const rankYesList = ref([]);
const rankNoList = ref([]);
const snackbar = ref(false)
const snackbarText = ref('')
const selectedOption = ref('');
const selectedList = ref([]);

watch(() => detailInfo.value, (newVal, oldVal) => {
  selectedList.value = newVal.options
  selectedOption.value = newVal.options[0]
  getRank()
})

// const currentPage = ref(1)       // 当前页
// const perPage = 10
// // 桌面端：当前页要展示的数据
// const pageItemsDesktop = computed(() => {
//   const start = (currentPage.value - 1) * perPage
//   return rankList.value.slice(start, start + perPage)
// })

// // 移动端：也做 10 条/页（如果想移动端一次展示 20 条，就用 rankList.value）
// const pageItemsMobile = computed(() => {
//   const start = (currentPage.value - 1) * perPage
//   return rankList.value.slice(start, start + perPage)
// })


const getRank = async () => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/getOptionHoldingsRanking`
    const payload = {
      projectId: selectedOption.value?.project_id,
      optionId: selectedOption.value?.id
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message)
    if (data.code === 200 && data.data) {
      rankYesList.value = data.data.topYesHolders;
      rankNoList.value = data.data.topNoHolders;
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const handleSelectChange = (val: any) => {
  getRank()
}

const handleErrorAvatar = (event) => {
  event.target.src = avatar1
}

onMounted(async () => {
})


</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="10000" location="top">
    {{ t(snackbarText) }}
  </VSnackbar>
  <div class="d-flex py-4" style="width: 100%; justify-content: space-between">
    <div class="search-select" style="min-width: 9rem">
      <VSelect v-model="selectedOption" :items="selectedList" item-title="option_key" item-value="option_key"
        label="Select" return-object single-line variant="solo" class="custom-text-field" placeholder="Select State"
        @update:modelValue="handleSelectChange" />
    </div>
  </div>

  <VRow>
    <VCol cols="12">
      <VCard class="mx-2">
        <!-- <VCardText class="d-flex align-center" style="justify-content: end">
          <VPagination v-model="currentPage" :length="2" :total-visible="1" />
        </VCardText> -->
        <div class="d-flex">
          <div style="flex: 1;">
            <VCardText class="d-flex"
              style="width: 100%; justify-content: space-between; background-color: rgb(var(--v-table-header-color));">
              <div class="" style="color: #fff">
                {{ t('table_yes') }}
              </div>
              <div style="color: #fff">
                {{ t('table_shares') }}
              </div>
            </VCardText>

            <VCardText class="d-flex" style="width: 100%;">

              <VList v-if="!isMobile" class="left-list" style="flex: 1;" lines="two" border rounded>
                <template v-for="(user, index) of rankYesList" :key="index">
                  <VListItem style="padding: 0 5px; min-height: 48px;">
                    <template #prepend>
                      <div class="d-flex align-center gap-2">
                        <img :src="user.userIcon || avatar1" @error="handleErrorAvatar"
                          style="width: 2rem; border-radius: 9999px;" />
                        {{ user?.userName }}
                      </div>
                    </template>
                    <template #append>
                      <div style="width: 7rem; text-align: right;">
                        {{ user?.holdingAmount }}
                      </div>
                    </template>
                  </VListItem>
                  <VDivider v-if="index !== rankYesList.length - 1" />
                </template>
              </VList>
            </VCardText>
          </div>
          <div style="flex: 1;">
            <VCardText class="d-flex"
              style="width: 100%; justify-content: space-between; background-color: rgb(var(--v-table-header-color));">
              <div class="" style="color: #fff">
                {{ t('table_no') }}
              </div>
              <div style="color: #fff">
                {{ t('table_shares') }}
              </div>
            </VCardText>

            <VCardText class="d-flex" style="width: 100%;">

              <VList v-if="!isMobile" class="left-list" style="flex: 1;" lines="two" border rounded>
                <template v-for="(user, index) of rankNoList" :key="index">
                  <VListItem style="padding: 0 5px; min-height: 48px;">
                    <template #prepend>
                      <div class="d-flex align-center gap-2">
                        <img :src="user?.userIcon || avatar1" @error="handleErrorAvatar"
                          style="width: 2rem; border-radius: 9999px;" />
                        {{ user?.userName }}
                      </div>
                    </template>
                    <template #append>
                      <div style="width: 7rem; text-align: right;">
                        {{ user?.holdingAmount }}
                      </div>
                    </template>
                  </VListItem>
                  <VDivider v-if="index !== rankNoList.length - 1" />
                </template>
              </VList>
            </VCardText>
          </div>
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
