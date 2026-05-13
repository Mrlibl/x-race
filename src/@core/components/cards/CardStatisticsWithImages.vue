<script setup lang="ts">
import Coin from '@images/cred-points/coin.png';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps({
  totalPoint: {
    type: String,
    required: true,
  },
})

const totalPoint = computed(() => props.totalPoint || 0);
const walletAddress = ref(localStorage.getItem("walletAddress") || '')
const snackbar = ref(false)
const snackbarText = ref('')


const copy = (text: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const result = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (result) {
    snackbarText.value = 'copy-success'
    snackbar.value = true
  }
  return result;
};
</script>

<template>
  <VSnackbar v-model="snackbar" :timeout="2000" location="top">
    {{ t(snackbarText) }}
  </VSnackbar>
  <VCard class="overflow-visible position-relative">
    <div class="d-flex">
      <VCardText>
        <h6 class="text-h6 mb-5">
          {{ t('credPoint.credPoints') }}
        </h6>
        <div class="d-flex align-center flex-wrap mb-3">
          <div class="price">
            {{ totalPoint }}
          </div>
        </div>

        <VChip color="primary" size="small">
          <img src="@/assets/images/cred-points/Icon_wallet.png" class="me-2" style="width: 1rem;" />
          <div style="font-size: 1rem;">{{ walletAddress ? `${walletAddress.slice(0,
            6)}...${walletAddress.slice(-4)}` : '123'
          }}</div>
          <img src="@/assets/images/cred-points/copy.png" class="ms-2" style="width: 1rem; cursor: pointer;"
            @click="copy(walletAddress)" />
        </VChip>
      </VCardText>

      <VSpacer />

      <div class="illustrator-img">
        <VImg :src="Coin" :width="139" />
      </div>
    </div>
  </VCard>
</template>

<style lang="scss">
.illustrator-img {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 5%;
  top: -22px;
}

@media (max-width: 1200px) and (min-width: 960px) {
  .illustrator-img {
    inset-block-end: 0;
    inset-inline-end: 0;

  }

}

.price {
  color: rgb(var(--v-theme-CEE4FF));
  font-size: 3rem;
  line-height: 3rem;
  font-weight: bold;
}

.v-snackbar__wrapper {
  min-width: 5rem !important;
}
</style>
