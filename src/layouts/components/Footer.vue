<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
function openLink(url: string) {
  if (url)
    window.open(url, '_blank')
}
const showFlag = ref(false)
</script>

<template>
  <div class="h-100 d-flex align-center justify-center">
    <span class="footer-text">{{ t('footer') }}</span>
    <!-- <span class="d-flex align-center">
      FLEX {{ t('pf') }}
    </span> -->
    <!-- 👉 Footer: right content -->
    <!-- <div class="d-md-flex gap-x-4 text-primary">
      <span>{{ t('cu') }}</span>
      <VIcon icon="ri-twitter-x-line" size="1.25rem" class="mx-1" style="cursor: pointer;"
        @click="openLink('https://www.bilibili.com')" />
      <VIcon icon="ri-telegram-2-fill" size="1.25rem" class="mx-1" style="cursor: pointer;"
        @click="openLink('https://www.baidu.com')" />
    </div> -->
  </div>
</template>

<style lang="scss">
.contact {
  background-color: red;
  width: 5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-text {
  font-size: 0.875rem;
  opacity: 0.5;

  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
}
</style>
