<script setup lang="ts">
import { useConfigStore } from '@core/stores/config';
import { ContentWidth } from '@layouts/enums';
import { ref, watch } from 'vue';


// 自定义下拉菜单方向
const props = withDefaults(defineProps<{ location?: string }>(), {
  location: 'bottom end',
})

const configStore = useConfigStore()

// 当前内容宽度
const currentContentWidth = ref(configStore.appContentWidth)

// 选项列表
const contentWidthOptions = [
  { label: 'Compact', value: ContentWidth.Boxed },
  { label: 'Wide', value: ContentWidth.Fluid },
]

// 监听用户切换
watch(currentContentWidth, val => {
  configStore.appContentWidth = val
})

// 响应外部 store 改变
watch(
  () => configStore.appContentWidth,
  val => {
    currentContentWidth.value = val
  },
  { immediate: true }
)
</script>

<template>
  <IconBtn>
    <VIcon icon="ri-layout-masonry-line" />

    <VMenu activator="parent" :location="props.location" offset="15px" width="160">
      <VList :selected="[currentContentWidth]" color="primary" mandatory>
        <VListItem v-for="option in contentWidthOptions" :key="option.value" :value="option.value"
          @click="currentContentWidth = option.value">
          <VListItemTitle>{{ option.label }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
