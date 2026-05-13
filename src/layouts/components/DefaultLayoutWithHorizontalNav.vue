<script lang="ts" setup>
import navItems from '@/navigation/horizontal'
import { themeConfig } from '@themeConfig'
import { onMounted, onUnmounted, ref } from 'vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import Search from '@/views/Search.vue'
import NavBarI18n from '@core/components/I18n.vue'
import { HorizontalNavLayout } from '@layouts'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'

const dashboard = localStorage.getItem('dashboard')
let flat = false
if (dashboard) {
  flat = true
  document.dispatchEvent(new CustomEvent('showHead'))
}
const showFlag = ref(flat)

const showHead = () => {
  showFlag.value = true
}

onMounted(async () => {
  document.addEventListener('showHead', showHead)
})

onUnmounted(() => {
  document.removeEventListener('showHead', showHead)
})
</script>

<template>
  <HorizontalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template v-if="showFlag" #navbar>
      <RouterLink to="/" class="d-flex align-start gap-x-4">
        <VNodeRenderer :nodes="themeConfig.app.logo" />

        <h1 class="leading-normal text-xl text-uppercase">
          {{ themeConfig.app.title }}
        </h1>
      </RouterLink>

      <Search position="right" />
      <VSpacer />
      <NavBarI18n v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
        :languages="themeConfig.app.i18n.langConfig" />

      <!-- <UserProfile /> -->
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />
  </HorizontalNavLayout>
</template>
