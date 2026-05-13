<script setup lang="ts">
import { userDashboardStore } from '@/stores/dashboard/store';
import loading from '@images/index/loading.gif';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2'

const props = defineProps<{
  position: string
}>()

const { t } = useI18n()

const dashboardStore = userDashboardStore()
const tokenInfo = await dashboardStore.getTokenChain()
const selectedOption = ref(tokenInfo[1])
const isTooltipVisible = ref(false)

const tokenVal = ref('')
const searching = ref(false)

const searchToken = async () => {
  Swal.fire('', 'Coming soon', 'error')

  // const queryParam = { token: tokenVal.value, time: 'day', chainId: selectedOption.value }

  // searching.value = true

  // const url = new URL(window.location.href)

  // // 设置/修改参数
  // url.searchParams.set('chain', selectedOption.value)
  // url.searchParams.set('token', tokenVal.value)

  // // 无刷新更新地址栏
  // window.history.replaceState({}, '', url.toString())
  // searching.value = false
  // location.reload()

}

const howClick = () => {
  window.open('https://xrace-resource.s3.us-west-2.amazonaws.com/XRace_Prediction+Market+For+Motorsports.docx.pdf')
}
</script>

<template>
  <VCol cols="8" sm="6" md="8">
    <div v-if="props.position === 'right'" class="search-div">
      <div class="search-input" style="width: 60% ">
        <VTextField v-model="tokenVal" :placeholder="t('search')" type="text" class="custom-text-field" variant="solo">
          <!-- AppendInner -->
          <template #append-inner>
            <VIcon icon="ri-search-line" />
          </template>
        </VTextField>
      </div>
      <VBtn class="btn-token ml-2" rounded="pill" @click="searchToken">
        <span v-if="!searching"> {{ t('search') }}</span>
        <img v-if="searching" :src="loading" class="loading-icon">
      </VBtn>
      <div class="ml-2 d-none d-md-flex" style="cursor: pointer;" @click="howClick">
        <!-- <VTooltip :model-value="isTooltipVisible" open-on-hover open-on-click location="top" class="custom-tooltip">
          <template #activator="{ props }">
            <VIcon v-bind="props" icon="ri-question-line" size="20" class="ms-2" color="#ccc" />
          </template>
          <div style="width: 15rem; color: #fff;">{{ t('how') }}</div>
        </VTooltip> -->
        <VIcon v-bind="props" icon="ri-question-line" size="20" class="ms-2" color="#ccc" />
        <span class="ml-1" style="font-size: 0.875rem; color: #ccc;">{{ t('how') }}</span>
      </div>
      <!-- <NavbarThemeSwitcher /> -->
    </div>
  </VCol>
</template>

<style lang="scss" scoped>
.search-div {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  .input-text {
    margin-top: -.5rem;
  }
}

@media (max-width: 680px) {
  .search-input {
    min-width: 5rem;
  }

  .search-select {
    min-width: 2.8rem !important;
  }
}


:deep(.custom-text-field .v-field) {
  border: none !important;
  /* 移除边框 */
  background-color: rgb(var(--v-theme-181818)) !important;
  /* 红色背景 */
  border-radius: 20rem !important;
  /* 增大圆角 */
  padding-left: .5rem !important;
}

/* 移除焦点状态边框 */
:deep(.custom-text-field .v-field--active),
:deep(.custom-text-field .v-field:hover),
:deep(.custom-text-field .v-field--focused) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.v-overlay__content) {
  background-color: rgb(var(--v-theme-181818)) !important;
  /* 自定义背景色 */
  color: #fff;
  /* 可选：文字颜色 */
  border-radius: 6px;
  /* 可选：圆角 */
  padding: 8px 12px;
  /* 可选：内边距 */
  border: 1px solid rgba(255, 255, 255, 0.2);
}


.loading-icon {
  width: 2rem;
  opacity: 0.5;
}
</style>
