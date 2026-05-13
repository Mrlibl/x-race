<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import avatar1 from '@/assets/images/avatars/avatar-1.png'
import avatar2 from '@/assets/images/avatars/avatar-2.png'
import avatar3 from '@/assets/images/avatars/avatar-3.png'

const { t } = useI18n()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)

const token = ref(JSON.parse(localStorage.getItem('userData'))?.token);
const rankList = ref([
  {
    trade: '',
    price: '99.9¢',
    shares: '3,107,195.00',
    total: '$3,123,328.03'
  },
  {
    trade: '',
    price: '99.6¢',
    shares: '5,000.00',
    total: '$3,123,328.03'
  },
  {
    trade: '',
    price: '39.0¢',
    shares: '19,770',
    total: '$3,123,328.03'
  }
]);
const snackbar = ref(false)
const snackbarText = ref('')
const selectedOption = ref('Williams');
const checkboxOne = ref(true)
const checkboxTwo = ref(false)


const getRank = async (val) => {
  try {
    const url = `https://app.creditlink.info/api/leaderboard/get`
    const payload = {
      type: 1,
      day: val
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
      rankList.value = data.data.data.data
    }

  } catch (err) {
    console.error('请求失败:', err)
  }
}

const handleSelectChange = (val: any) => {
  currentPage.value = 1
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
      <VSelect v-model="selectedOption" :items="[]" item-title="name" item-value="name" label="Select" return-object
        single-line variant="solo" class="custom-text-field" placeholder="Select State"
        @update:modelValue="handleSelectChange" />
      <div class="d-flex align-center justify-space-between">
        <VCheckbox v-model="checkboxOne" label="Trade Yes" />

        <VCheckbox v-model="checkboxTwo" label="Trade No" class="ms-16" />
      </div>
    </div>
  </div>

  <VCard>
    <VTable class="text-no-wrap team-members-table" fixed-header>
      <thead>
        <tr>
          <th scope="col">
            Trade Yes Orders
          </th>
          <th scope="col">
            Price
          </th>
          <th scope="col">
            Shares
          </th>
          <th scope="col">
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="member in rankList" :key="member.price">
          <td>
            <div class="d-flex align-center">
              <div class="me-3">
                <div class="point"></div>
                <!-- <VAvatar size=" 38" :image="member.profilePic" /> -->
              </div>
              <div>
                <h6 class="text-h6">
                  {{ member.trade }}
                </h6>
              </div>
            </div>
          </td>

          <td>
            {{ member.price }}
          </td>

          <td>
            <div class="d-flex font-weight-medium">
              <h6 class="text-h6 text-medium-emphasis">
                {{ member.shares }}
              </h6>
            </div>
          </td>

          <td class="d-flex align-center gap-2">
            {{ member.total }}
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>


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
