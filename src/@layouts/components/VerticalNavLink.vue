<script lang="ts" setup>
import { activeSection } from '@/stores/dashboard/useActiveSection'
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import type { NavLink } from '@layouts/types'
import { getComputedNavLinkToProp, getDynamicI18nProps } from '@layouts/utils'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 直接解构 props，避免未定义访问
const { item } = defineProps<{
  item: NavLink & {
    // 支持函数型 activeMatch(route)=>boolean
    activeMatch?: string | ((route: any) => boolean)
  }
}>()

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()

const activeSubItem = ref('')

const handleNavClick = (navItem: any) => {
  if (navItem?.scrollTo) {
    localStorage.setItem('scrollToSection', navItem.scrollTo)
    activeSubItem.value = navItem.scrollTo
    activeSection.value = navItem.scrollTo

    setTimeout(() => {
      const el = document.getElementById(navItem.scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  }
}

// 生成唯一 class
const getUniqueClass = (navItem: any) => {
  if (navItem?.to?.name) return `menu-${navItem.to.name}`
  return undefined
}

/**
 * 统一高亮判断（精确到 query.id）
 * 优先：函数型 activeMatch(route)
 * 其次：字符串正则匹配 route.path
 * 兜底：to.name === route.name；若 to.query.id 存在则与 route.query.id 严格比对
 */
const isActive = computed<boolean>(() => {
  if (!item) return false
  const am: any = (item as any).activeMatch

  if (typeof am === 'function') {
    try { return !!am(route) } catch { return false }
  }

  if (typeof am === 'string' && am) {
    try { return new RegExp(am).test(route.path) } catch { return false }
  }

  const to: any = (item as any).to
  if (to?.name && to.name === route.name) {
    if (to?.query?.id !== undefined) {
      return String(route.query?.id ?? '') === String(to.query.id)
    }
    return true
  }
  if (typeof to === 'string') return to === route.path
  if (to?.path) return to.path === route.path

  return false
})
</script>

<template>
  <li v-if="item && can(item.action, item.subject)" class="nav-link"
    :class="[{ disabled: item.disable }, getUniqueClass(item)]">
    <Component :is="item.to ? 'RouterLink' : 'a'" v-bind="getComputedNavLinkToProp(item)" @click="handleNavClick(item)"
      active-class="_no-vue-router-active" exact-active-class="_no-vue-router-exact" :class="{
        // 只用我们自己的精确激活控制类
        'router-link-active router-link-exact-active':
          (item.scrollTo === activeSection) || isActive
      }">
      <template v-if="item.icon?.image">
        <img :src="item.icon.image" class="nav-item-icon custom-menu-icon" />
      </template>
      <template v-else>
        <Component :is="layoutConfig.app.iconRenderer || 'div'"
          v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps" class="nav-item-icon" />
      </template>

      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <Component :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'" v-show="!hideTitleAndBadge" key="title"
          class="nav-item-title" v-bind="getDynamicI18nProps(item.title, 'span')">
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'" v-if="item.badgeContent"
          v-show="!hideTitleAndBadge" key="badge" class="nav-item-badge" :class="item.badgeClass"
          v-bind="getDynamicI18nProps(item.badgeContent, 'span')">
          {{ item.badgeContent }}
        </Component>
      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}

.custom-menu-icon {
  width: 1.375rem;
  height: 1.375rem;
  object-fit: contain;
  margin-inline-end: 12px;
}
</style>