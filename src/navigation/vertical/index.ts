// navigation/vertical/index.ts
import hotIcon from '@/assets/images/menu/icon_hot.png'
import newIcon from '@/assets/images/menu/icon_new.png'
import campaignIcon from '@/assets/images/menu/icon_campaign.png'

import { computed, onMounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

type ChildNav = {
  title: string
  to: any
  activeMatch?: string | ((route: any) => boolean)
}

const CAMPAIGN_ROUTE_NAME = 'campaign'
const EVENT_CAMPAIGN_ROUTE_NAME = 'event-campaign' // ✅ 来自 typed-router.d.ts

// ===== 模块级缓存（接口只请求一次）=====
let _fetching: Promise<any[] | null> | null = null
const _cachedList = shallowRef<any[] | null>(null)

// 拉原始列表（只做一次）
async function fetchListOnce(): Promise<any[]> {
  if (_cachedList.value) return _cachedList.value
  if (_fetching) return (await _fetching) || []

  _fetching = (async () => {
    try {
      const res = await fetch('https://nodeapi.carx.cz/lottery/getLotteryMatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        console.error('getLotteryMatches 非 2xx 响应：', res.status, res.statusText)
        return []
      }
      const data = await res.json()
      localStorage.setItem('matchList', JSON.stringify(data.data.list))
      const list: any[] = Array.isArray(data?.data?.list) ? data.data.list : []
      _cachedList.value = list
      return list
    } catch (e) {
      console.error('拉取 getLotteryMatches 失败：', e)
      return []
    } finally {
      _fetching = null
    }
  })()

  return (await _fetching) || []
}

function mapChildrenForName(list: any[], routeName: string): ChildNav[] {
  return list.map(m => {
    const id = m.id
    return {
      title: m.name,
      to: { name: routeName, query: { id } },
      // 只在当前 name 且 query.id 匹配时高亮
      activeMatch: (route: any) =>
        route.name === routeName && String(route.query?.id ?? '') === String(id),
    } as ChildNav
  })
}

export const useDynamicNavItems = () => {
  const theme = useTheme()
  const { t } = useI18n()
  const isDark = computed(() => theme.current.value.dark)

  const RX = {
    root: '^/$',
    hot: '^/hot($|/)',
    event: '^/event($|/)$',
    // ✅ 路径是 /eventCampaign（来自 typed-router），不是 /event/campaign
    eventCampaign: '^/eventCampaign($|/)',
    game: '^/game($|/)$',
    campaign: '^/campaign($|/)',
  }

  // 两套 children，分别给两个父菜单
  const dynamicChildrenCampaign = ref<ChildNav[]>([
    { title: 'Loading…', to: { name: CAMPAIGN_ROUTE_NAME }, activeMatch: RX.campaign },
  ])
  const dynamicChildrenEvent = ref<ChildNav[]>([
    { title: 'Loading…', to: { name: EVENT_CAMPAIGN_ROUTE_NAME }, activeMatch: RX.eventCampaign },
  ])

  onMounted(async () => {
    const list = await fetchListOnce()

    dynamicChildrenCampaign.value = list.length
      ? mapChildrenForName(list, CAMPAIGN_ROUTE_NAME)
      : [{ title: 'No matches', to: { name: CAMPAIGN_ROUTE_NAME }, activeMatch: RX.campaign }]

    dynamicChildrenEvent.value = list.length
      ? mapChildrenForName(list, EVENT_CAMPAIGN_ROUTE_NAME)
      : [{ title: 'No matches', to: { name: EVENT_CAMPAIGN_ROUTE_NAME }, activeMatch: RX.eventCampaign }]
  })

  const navItems = computed(() => [
    {
      title: t('menu.news'),
      to: { name: 'root' },
      icon: { image: hotIcon },
      activeMatch: RX.root,
    },
    {
      title: t('menu.event'),
      to: { name: 'event' },
      activeMatch: RX.event,            // 仅 /event 自身高亮父级；需要也在 /eventCampaign 高亮父级可把正则合并
      icon: { image: campaignIcon },
      open: true,
      // ✅ 子菜单：同接口，但跳 event-campaign（/eventCampaign?id=xxx）
      children: dynamicChildrenEvent.value,
    },
    {
      title: t('menu.hot'),
      to: { name: 'hot' },
      icon: { image: newIcon },
      activeMatch: RX.hot,
    },
    {
      title: t('menu.gameList'),
      to: { name: 'game' },
      activeMatch: RX.game,
      icon: { image: campaignIcon },
      open: true,
      // ✅ 子菜单：同接口，但跳 campaign（/campaign?id=xxx）
      children: dynamicChildrenCampaign.value,
    },
  ])

  return navItems
}
