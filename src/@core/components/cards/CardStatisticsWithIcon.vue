<script setup lang="ts">
import img1 from '@/assets/images/index/list_1.png';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
defineProps<{
  address: string
  hash: string
  time: string
  label: string
  icon: string
  iconUrl: string
  num: Number
  classIcon: string
  nameZH: string
  nameEN: string
}>()
const snackbar = ref(false)
const snackbarText = ref('')

function timeAgo(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000) // 秒差

  if (diff < 60) {
    return `${diff}s ago`
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes}M ago`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours}H ago`
  } else {
    const days = Math.floor(diff / 86400)
    return `${days}D ago`
  }
}

const imgRef = ref<HTMLImageElement | null>(null)

function onImgError(event: Event) {
  const imgEl = event.target as HTMLImageElement
  imgEl.src = img1
}

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
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between">
        <div class="d-flex flex-column gap-y-1">
          <div class="text-body-1 text-high-emphasis">
            <h5 class="text-h5">
              <a style="text-decoration: underline; cursor: pointer;" @click="copy(address)">{{ label ? label :
                `${address.slice(0, 6)}...${address.slice(-4)}`
              }}</a>
            </h5>
          </div>
          <div>
            <h5 class="text-h6 mt-5">
              {{ `${nameEN || 'Unknown Contract'} * ${num}` }}
            </h5>
          </div>
          <div class="text-body-2 mt-1">
            {{ timeAgo(time) }}
          </div>
        </div>
        <!-- <VAvatar :color="iconColor" variant="tonal" rounded size="42"> -->
        <div class="d-flex flex-column">
          <img :src="icon || iconUrl || classIcon || img1" @error="onImgError" ref="imgRef" class="align-self-end"
            style="width: 2.5rem; height: 2.5rem;" />
          <div class="mt-10" style="color: #006CEF;">Hash: <a style="text-decoration: underline; cursor: pointer;"
              @click="copy(hash)">{{
                `${hash.slice(0,
                  6)}...${hash.slice(-4)}` }}</a> </div>
        </div>
        <!-- </VAvatar> -->
      </div>
    </VCardText>
  </VCard>
</template>
