<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

const props = defineProps({
  detailInfo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['infoClick'])
const { t } = useI18n()

const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)

const detailInfo = computed(() => props.detailInfo || {})
const token = ref(JSON.parse(localStorage.getItem('userData'))?.token);


const infoClick = (item: any) => {
  emit('infoClick', item)
}

const tradeClick = (item, type, id) => {
  document.dispatchEvent(
    new CustomEvent('tradeModular', {
      detail: { data: item, type: type, id: id },
    }),
  )
}

onMounted(async () => {
})


</script>

<template>
  <VCard>
    <VCardText style="padding: 0px !important">
      <VTable class="text-no-wrap team-members-table" style="width: 100%;">
        <thead>
          <tr>
            <th scope="col" style="width: 15rem;">
              {{ t('outcome') }}
            </th>
            <th scope="col" style="width: 18rem;">
              {{ t('chance') }}
            </th>
            <th scope="col" style="width: 15rem;">
              {{ t('vol') }}
            </th>
            <th scope="col">
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in detailInfo.options" :key="index">
            <td>
              <div class="d-flex align-center py-4" style="cursor: pointer;" @click="infoClick(item)">
                <div>
                  <div style="font-size: 1.125rem; color: #fff;">
                    {{ item?.option_key }}
                  </div>
                  <div style="font-size: 0.875rem;">
                    {{ item?.option_text }}
                  </div>
                </div>
              </div>
            </td>

            <td>
              <div class="d-flex align-center" style="font-size: 1.125rem; color: #fff;">
                {{ Math.round((item.prices.yesPrice || 0) * 100) }}%
              </div>
            </td>

            <td>
              <div class="d-flex align-center" style="font-size: 1.125rem; color: #fff;">
                ${{ item?.total_bet_amount || 0 }}
              </div>
            </td>

            <td>
              <div class="d-flex align-center gap-4 text-h6 text-medium-emphasis">
                <div class="buy-yes py-2 px-8" @click="tradeClick(item, 'Yes', item?.id)">
                  {{ t('buy_yes') }} <span style="color: #fff; font-weight: bold;">{{ ((item.prices.yesPrice || 0) *
                    100).toFixed(1)
                  }}¢</span>
                </div>
                <div class="buy-no py-2 px-10" @click="tradeClick(item, 'No', item?.id)">
                  {{ t('buy_no') }} <span style="color: #fff; font-weight: bold;">{{ ((item.prices.noPrice || 0) *
                    100).toFixed(1)
                    }}¢</span>
                </div>
              </div>
            </td>

          </tr>
        </tbody>
      </VTable>

    </VCardText>

  </VCard>



</template>

<style lang="scss" scoped>
.buy-yes {
  background-color: #32901A;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

.buy-no {
  background-color: #BA2D2C;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
