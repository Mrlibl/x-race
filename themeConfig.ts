import { defineThemeConfig } from '@core'
import { Skins } from '@core/enums'
import { breakpointsVuetifyV3 } from '@vueuse/core'
import { VIcon } from 'vuetify/components/VIcon'

// ❗ Logo SVG must be imported with ?raw suffix
// import logoDark from '@images/logo_dark.png'
// import logo from '@images/logo_light.png'
import logo from '@/assets/images/logo.png'
import { useTheme } from 'vuetify'

import { AppContentLayoutNav, ContentWidth, FooterType, NavbarType } from '@layouts/enums'
const InlineAppLogo = defineComponent({
  name: 'InlineAppLogo',
  setup() {
    const theme = useTheme()
    const src = computed(() => (theme.global.current.value.dark ? logo : logo))
    return () =>
      h('img', {
        src: src.value,
        height: '30',
        style:
          'line-height:0; color: rgb(var(--v-global-theme-primary)); margin-right:1rem; margin-left:.3rem',
        alt: 'logo',
      })
  },
})


export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: '',

    // ❗ if you have SVG logo and want it to adapt according to theme color, you have to apply color as `color: rgb(var(--v-global-theme-primary))`
    logo: h(InlineAppLogo),
    // logo: h('img', {
    //   src: logo,
    //   style: 'line-height:0; color: rgb(var(--v-global-theme-primary)); margin-right:1rem; margin-left:.3rem',
    //   height: '30px',
    //   width: 'auto',
    // }),
    // contentWidth: ContentWidth.Boxed,
    contentWidth: ContentWidth.Fluid, // 内容默认宽屏
    contentLayoutNav: AppContentLayoutNav.Vertical, // 默认左侧菜单栏， 顶部Horizontal
    overlayNavFromBreakpoint: breakpointsVuetifyV3.lg - 1, // 1 for matching with vuetify breakpoint. Docs: https://next.vuetifyjs.com/en/features/display-and-platform/
    i18n: {
      enable: true,
      defaultLocale: 'en',
      langConfig: [
        {
          label: 'English',
          i18nLang: 'en',
          isRTL: false,
        },
        {
          label: '中文',
          i18nLang: 'zh',
          isRTL: false,
        },
      ],
    },
    theme: 'dark',
    skin: Skins.Default,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
  },
  footer: { type: FooterType.Static },
  verticalNav: {
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'ri-circle-line' },
    isVerticalNavSemiDark: false,
  },
  horizontalNav: {
    type: 'sticky',
    transition: 'slide-y-reverse-transition',
    popoverOffset: 4,
  },

  /*
  // ℹ️  In below Icons section, you can specify icon for each component. Also you can use other props of v-icon component like `color` and `size` for each icon.
  // Such as: chevronDown: { icon: 'ri-arrow-down-s-line', color:'primary', size: '24' },
  */
  icons: {
    chevronDown: { icon: 'ri-arrow-down-s-line' },
    chevronRight: { icon: 'ri-arrow-right-s-line' },
    close: { icon: 'ri-close-line', size: '20' },
    verticalNavPinned: { icon: 'ri-radio-button-line', size: '20' },
    verticalNavUnPinned: { icon: 'ri-circle-line', size: '20' },
    sectionTitlePlaceholder: { icon: 'ri-subtract-line' },
  },
})
