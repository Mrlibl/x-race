import type { TokenInfoType, TransactionDataType, TransactionTotalType } from './type'

import tokenData from '@/assets/json/token.json'

import capIcon from '../../assets/images/token/baseinfo/cap.png'
import priceIcon from '../../assets/images/token/baseinfo/dollar.png'
import fdvIcon from '../../assets/images/token/baseinfo/fdv.png'
import ldIcon from '../../assets/images/token/baseinfo/ld.png'
import totalIcon from '../../assets/images/token/baseinfo/total.png'

export const userDashboardStore = defineStore('dashboard', {
  state: () => ({
    tokenInfo: {} as TokenInfoType,
    transactionData: {} as TransactionDataType,
    kolData: [],
    kolListData: [],
    sniperListData: [],
    tokenPrice: 0,
    smartWalletList: [],
    tops: {},
    typeList: {},
    userChangeList: {},
    coin: {},
    ranking: {},
    user: [],
    chains: [],
    tokensSearch: {},
    pair: '',
    token: '',
    time: '',
    chainId: '',
  }),
  persist: true,
  actions: {
    async init() {
      this.tokenInfo = tokenData.data.getTokenMetadata[0]
      this.transactionData = tokenData.data.gettrinfo
      this.kolData = tokenData.data.kLineListKol.result.reverse()
      this.sniperListData = tokenData.data.getSwaps
      this.tokenPrice = tokenData.data.TokenPric
      this.smartWalletList = tokenData.data.TokenAllSmartWallet.wallets
      this.tops = tokenData.data.TokenHolders.holderSupply
      this.typeList = tokenData.data.TokenHolders.holdersByAcquisition
      this.userChangeList = tokenData.data.TokenHolders.holderChange
      this.coin = tokenData.data.TokenHolders.holderDistribution
      this.ranking = tokenData.data.getTokenHoldersList
      this.user = tokenData.data.holderlist
    },

    async getTokenChain() {
      // return ['solana', 'bsc', 'eth', 'trc20', 'base']
      return [

        {
          id: 2,
          name: 'BSC'
        },
        {
          id: 3,
          name: 'ETH'
        },
        {
          id: 5,
          name: 'BASE'
        },
        {
          id: 6,
          name: 'OP'
        },
        {
          id: 7,
          name: 'Polygon'
        },
        {
          id: 1,
          name: 'SOL',
        },

      ]
    },

    async setTokenInfo(queryParam) {
      const { token, time, chainId } = queryParam
      this.token = token
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      headers.append('Authorization', 'bearer 1231234')

      const requestOptions = {
        method: 'POST',
        headers,
        redirect: 'follow',
      }

      const url = new URL('https://tokenapi.creditlink.info/index.php/api/v1/setTokenInfo')

      const setTokenBody = {
        token: token.trim(),
        time,
        chain_str: chainId,
      }

      requestOptions.body = JSON.stringify(setTokenBody)

      const res = await fetch(url, requestOptions)
      if (!res.ok)
        throw new Error(`HTTP error! status: ${res.status}`)
      const resJson = await res.json()
      if (resJson.code === 200 && resJson.data)
        this.pair = resJson.data.pair

      return resJson
    },

    async queryTokenInfo(queryParam) {
      let { token, time, chainId } = queryParam
      if (!token)
        token = this.token

      if (!time)
        time = this.time

      if (!chainId) {
        if (this.chainId.toLocaleLowerCase() === "sol") {
          chainId = "solana"
        } else {
          chainId = this.chainId
        }

      }
      if (this.chainId.toLocaleLowerCase() === "sol") {
        chainId = "solana"
      }

      const headers = new Headers()

      headers.append('Content-Type', 'application/json')
      headers.append('Authorization', 'bearer 1231234')

      const requestOptions = {
        method: 'POST',
        headers,
        redirect: 'follow',
      }

      const getTokenDataInfoUrl = new URL('https://tokenapi.creditlink.info/index.php/api/v1/getTokenDataInfo')

      const getTokenDataInfoBody = {
        token: token.trim(),
        time,
        chain_str: chainId,
        pair: this.pair,
      }

      requestOptions.body = JSON.stringify(getTokenDataInfoBody)

      const getTokenDataInfoRes = await fetch(getTokenDataInfoUrl, requestOptions)
      if (!getTokenDataInfoRes.ok)
        throw new Error(`HTTP error! status: ${getTokenDataInfoRes.status}`)
      const resJsonAA = await getTokenDataInfoRes.json()
      const arr = resJsonAA.data
      if (arr) {
        console.log('token信息', arr)
        this.tokenInfo = arr.getTokenMetadata[0]
        this.transactionData = arr.gettrinfo || this.transactionData
        // this.kolData = arr.kLineListKol ? arr.kLineListKol.result.reverse() : this.kolData
        this.sniperListData = arr.getSwaps || this.sniperListData
        this.tokenPrice = arr.TokenPric || this.tokenPrice
        this.smartWalletList = arr.TokenAllSmartWallet?.wallets || this.smartWalletList
        this.tops = arr.TokenHolders?.holderSupply || this.tops
        this.typeList = arr.TokenHolders?.holdersByAcquisition || this.typeList
        this.userChangeList = arr.TokenHolders?.holderChange || this.userChangeList
        this.coin = arr.TokenHolders?.holderDistribution || this.coin
        this.ranking = arr.getTokenHoldersList ? arr.getTokenHoldersList : this.ranking
        this.tokensSearch = arr.tokensSearch
        this.user = arr.holderlist || this.user
        // this.token = token
        this.time = time
        this.chainId = chainId

        return true
      }

      return false
    },

    async reQueryTokenInfo(queryParam) {
      let { token, time, chainId } = queryParam
      if (!token)
        token = this.token

      if (!time)
        time = this.time

      if (!chainId)
        chainId = this.chainId

      const headers = new Headers()

      headers.append('Content-Type', 'application/json')
      headers.append('Authorization', 'bearer 1231234')

      const requestOptions = {
        method: 'POST',
        headers,
        redirect: 'follow',
      }

      const getTokenDataInfoUrl = new URL('https://tokenapi.creditlink.info/index.php/api/v1/getHolderList')

      const getTokenDataInfoBody = {
        token,
        time,
        chain_str: chainId,
        pair: this.pair,
      }

      requestOptions.body = JSON.stringify(getTokenDataInfoBody)

      const getTokenDataInfoRes = await fetch(getTokenDataInfoUrl, requestOptions)
      if (!getTokenDataInfoRes.ok)
        throw new Error(`HTTP error! status: ${getTokenDataInfoRes.status}`)
      const resJsonAA = await getTokenDataInfoRes.json()
      const arr = resJsonAA.data
      if (arr) {
        console.log('getHolderList信息', arr)
        this.user = arr
        // this.token = token
        this.time = time
        this.chainId = chainId

        return true
      }

      return false
    },

    async queryTokenFans() {
      const headers = new Headers()
      const res = new Map()

      headers.append('Content-Type', 'application/json')
      headers.append('Authorization', 'bearer 1231234')

      const requestOptions = {
        method: 'POST',
        headers,
        redirect: 'follow',
      }

      const getTokenDataInfoUrl = new URL('https://tokenapi.creditlink.info/index.php/api/v1/getTokenFansList')

      const getTokenDataInfoBody = {
        token: this.token,

      }

      requestOptions.body = JSON.stringify(getTokenDataInfoBody)

      const getTokenDataInfoRes = await fetch(getTokenDataInfoUrl, requestOptions)
      if (!getTokenDataInfoRes.ok)
        throw new Error(`HTTP error! status: ${getTokenDataInfoRes.status}`)
      const resJsonAA = await getTokenDataInfoRes.json()

      this.kolListData = resJsonAA.data.filter(item => !res.has(item.screen_name) && res.set(item.screen_name, 1))

      return this.kolListData
    },

    async openLink(url: string) {
      if (url)
        window.open(url, '_blank')
    },

    formatNumber(originNumS: string | number) {
      const num = Number.parseFloat(String(originNumS))

      // 非法值或为 0，直接返回 '0'
      if (isNaN(num) || num === 0) return '0'

      const absNum = Math.abs(num)
      const units = ['', 'K', 'M', 'B']
      const thresholds = [1e3, 1e6, 1e9]

      let tier = thresholds.findIndex(t => absNum < t)
      tier = tier === -1 ? thresholds.length : tier

      if (tier === 0) {
        // 小于 1000 的数，保留 2 位小数
        return num.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
      }

      const scaled = num / thresholds[tier - 1]
      return `${scaled.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')}${units[tier]}`
    },



    formatPrice(originPrice: number, maxDigits = 4): string {
      const isNeg = originPrice < 0
      const abs = Math.abs(originPrice)

      // 规避科学计数法
      let numStr = String(abs)
      if (/e/i.test(numStr)) {
        numStr = abs.toFixed(Math.max(maxDigits + 10, 20))
          .replace(/0+$/, '')
          .replace(/\.$/, '')
      }

      let [integerPart, decimalPart = ''] = numStr.split('.')
      integerPart = integerPart || '0'

      // 没有小数部分
      if (!decimalPart) return (isNeg ? '-' : '') + integerPart

      // 统计小数部分连续前导 0 的数量
      const leadingZeros = (decimalPart.match(/^0+/)?.[0]?.length) || 0
      const sign = isNeg ? '-' : ''

      if (leadingZeros >= 2) {
        // 现在花括号里写“前导 0 的总数”
        const remaining = decimalPart.slice(leadingZeros)
        const tail = remaining.slice(0, maxDigits) // 保留最多 maxDigits 位有效数字
        return `${sign}${integerPart}.0{${leadingZeros}}${tail}`
      } else {
        // 正常显示，最多保留 maxDigits 位
        const trimmed = decimalPart.slice(0, maxDigits)
        return `${sign}${integerPart}${trimmed ? '.' + trimmed : ''}`
      }
    },

    async formatFixedAddress(address) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    },

    async computeBasicInfo() {
      const tokenInfo = this.tokenInfo
      const supplyFormatted = tokenInfo.total_supply_formatted ? await this.formatNumber(tokenInfo.total_supply_formatted) : '0'
      const valuationFormatted = tokenInfo.fully_diluted_valuation ? await this.formatNumber(tokenInfo.fully_diluted_valuation) : '0'
      const formatedPrice = this.tokenPrice ? await this.formatPrice(this.tokenPrice) : '0'
      const formatedMaketCap = this.tokensSearch.marketCap ? await this.formatNumber(this.tokensSearch.marketCap) : '0'
      const formatedTotalLiquidityUsd = this.tokensSearch.totalLiquidityUsd ? await this.formatNumber(this.tokensSearch.totalLiquidityUsd) : '0'
      return [
        {
          title: 'Price',
          stats: `$ ${formatedPrice}`,
          icon: priceIcon, // ✅ 使用 import 后的变量
          color: 'primary',
          originData: this.tokenPrice || 0,
        },
        {
          title: 'Market Cap',
          stats: `$ ${formatedMaketCap}`,
          icon: capIcon, // ✅
          color: 'success',
          originData: this.tokensSearch.marketCap || 0,
        },
        {
          title: 'Liquidity',
          stats: `$ ${formatedTotalLiquidityUsd}`,
          icon: ldIcon, // ✅
          color: 'warning',
          originData: this.tokensSearch.totalLiquidityUsd || 0,
        },
        {
          title: 'FDV',
          stats: `$ ${valuationFormatted}`,
          icon: fdvIcon, // ✅
          color: 'warning',
          originData: tokenInfo.fully_diluted_valuation || 0,
        },
        {
          title: 'Total Supply',
          stats: `${supplyFormatted}`,
          icon: totalIcon, // ✅
          color: 'primary',
          originData: tokenInfo.total_supply_formatted || 0,
        }
      ]
    },

    async formatSmartWallet() {
      const decimals = parseInt(this.tokenInfo.decimals, 10);
      for (const item of this.smartWalletList) {
        if (item.nickname)
          item.wallet = item.nickname

        else
          item.wallet = await this.formatFixedAddress(item.address)

        item.totalBuyS = await this.formatNumber(item.total_buy)
        item.totalSellS = await this.formatNumber(item.total_sell)

        item.totalProfitUsdS = item.total_profit_usd < 0 ? '-$ ' + await this.formatNumber(item.total_profit_usd * -1) : '$ ' + await this.formatNumber(item.total_profit_usd)
        item.realizedProfitUsdS = item.realized_profit_usd < 0 ? '-$ ' + await this.formatNumber(item.realized_profit_usd * -1) : '$ ' + await this.formatNumber(item.realized_profit_usd)
        item.unrealizedProfitUsdS = item.unrealized_profit_usd < 0 ? '-$ ' + await this.formatNumber(item.unrealized_profit_usd * -1) : '$ ' + await this.formatNumber(item.unrealized_profit_usd)
        const date = new Date(item.last_updated_at)
        const month = date.getMonth() + 1
        const day = date.getDate()

        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')

        // ${hours}:${minutes}
        item.time = `${year}-${month}-${day} ${hours}:${minutes}`
      }

      return this.smartWalletList
    },
    async getUserChangeList() {
      const promises = Object.keys(this.userChangeList).map(async item => {
        const change = this.userChangeList[item].change
        const changePercent = this.userChangeList[item].changePercent
        let p = await this.formatNumber(changePercent)
        if (Number(p) === p && p % 1 !== 0)
          p = p.toFixed(3)

        return {
          time: item,
          change,
          changePercent,
          changeS: await this.formatNumber(change),
          changePercentS: p,
        }
      })

      return await Promise.all(promises)
    },
    async getRanking() {
      return this.ranking['5m'].map(item => {
        const obj = {
          avatar: item.avatar || '',
          owner_address: item.owner_address || '',
          balance_formatted: item.balance_formatted || '',
          usd_value: item.usd_value || '',
          percentage_relative_to_total_supply5m: item.percentage_relative_to_total_supply ? Number.parseFloat(item.percentage_relative_to_total_supply).toFixed(2) : 0,
          percentage_relative_to_total_supply1h: 0,
          percentage_relative_to_total_supply1d: 0,
          percentage_relative_to_total_supply7d: 0,
        }
        obj.usd_value_format = this.formatNumber(item.usd_value)
        if (item.nickname)
          obj.wallet = `${item.nickname.slice(0, 8)}...`

        else
          obj.wallet = item.owner_address ? `${item.owner_address.slice(0, 4)}...${item.owner_address.slice(-4)}` : ''

        const obj1h = this.ranking['1h'].find(item1 => {
          return item1.owner_address = item.owner_address
        })

        if (obj1h) {
          let num: number = (item.percentage_relative_to_total_supply - obj1h.percentage_relative_to_total_supply) / obj1h.percentage_relative_to_total_supply
          if (num > 1)
            num = Number.parseFloat(num.toFixed(2))

          else
            num = Number.parseFloat(num.toFixed(4))

          obj.percentage_relative_to_total_supply1h = num
        }

        const obj1d = this.ranking['1d'].find(item1 => {
          return item1.owner_address = item.owner_address
        })

        if (obj1d) {
          let num: number = (item.percentage_relative_to_total_supply - obj1d.percentage_relative_to_total_supply) / obj1h.percentage_relative_to_total_supply
          if (num > 1)
            num = Number.parseFloat(num.toFixed(2))

          else
            num = Number.parseFloat(num.toFixed(4))

          obj.percentage_relative_to_total_supply1d = num
        }

        const obj7d = this.ranking['7d'].find(item1 => {
          return item1.owner_address = item.owner_address
        })

        if (obj7d) {
          let num: number = (item.percentage_relative_to_total_supply - obj7d.percentage_relative_to_total_supply) / obj1h.percentage_relative_to_total_supply
          if (num > 1)
            num = Number.parseFloat(num.toFixed(2))

          else
            num = Number.parseFloat(num.toFixed(4))

          obj.percentage_relative_to_total_supply7d = num
        }

        return obj
      })
    },
    getChangeRoleine(type) {
      const holdersIn = []
      const holdersOut = []
      const netChange = []
      const categories = []

      const series = [
        {
          name: 'NetChange',
          data: [],
        },
        {
          name: 'In',
          data: [],
        },
        {
          name: 'Out',
          data: [],
        },
      ]

      if (!this.user)
        return { series, categories }

      for (const item of this.user) {

        const date = new Date(item.timestamp)
        // 获取年月日
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份从 0 开始
        const day = date.getDate().toString().padStart(2, '0')

        // 获取时分
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        if (this.time === "week" || this.time === "month" || this.time === "quarter") {
          categories.push(`${month}-${day} ${hours}:${minutes}`)
        } else {
          categories.push(`${hours}:${minutes}`)
        }
        holdersIn.push(item.holdersIn[type])
        holdersOut.push(0 - Number.parseInt(item.holdersOut[type]))
        netChange.push(item.holdersIn[type] - item.holdersOut[type])
      }
      series[0].data = netChange
      series[1].data = holdersIn
      series[2].data = holdersOut

      return { series, categories }
    },
  },
  getters: {
    getTimeSelectData() {
      return [
        '5m', '1h', '6h', '24h',
      ]
    },

    getBuyAndSellVolume() {
      let buyVolum: TransactionTotalType = {
        '5m': 0,
        '1h': 0,
        '6h': 0,
        '24h': 0,
      }

      let sellVolum: TransactionTotalType = {
        '5m': 0,
        '1h': 0,
        '6h': 0,
        '24h': 0,
      }

      const transactionData = this.transactionData
      if (transactionData) {
        buyVolum = transactionData.totalBuyVolume
        sellVolum = transactionData.totalSellVolume
      }

      return { buyVolum, sellVolum }
    },
    getBuyerAndSeller() {
      let buyer: TransactionTotalType = {
        '5m': 0,
        '1h': 0,
        '6h': 0,
        '24h': 0,
      }

      let seller: TransactionTotalType = {
        '5m': 0,
        '1h': 0,
        '6h': 0,
        '24h': 0,
      }

      const transactionData = this.transactionData
      if (transactionData) {
        buyer = transactionData.totalBuyers
        seller = transactionData.totalSellers
      }

      return { buyer, seller }
    },
    getBuysAndSells() {
      let buys: TransactionTotalType = {
        '5m': 0,
        '1h': 0,
        '6h': 0,
        '24h': 0,
      }

      let sells: TransactionTotalType = {
        '5m': 0,
        '1h': 0,
        '6h': 0,
        '24h': 0,
      }

      const transactionData = this.transactionData
      if (transactionData) {
        buys = transactionData.totalBuys
        sells = transactionData.totalSells
      }

      return { buys, sells }
    },

    // getKolList(state) {
    //   const res = new Map()

    //   return state.kolListData.filter(item => !res.has(item.screen_name) && res.set(item.screen_name, 1))
    // },
    getSniperList(state) {
      for (const item of state.sniperListData) {
        if (item.bought.tokenType !== 'token0')
          continue

        if (item.nickname)
          item.wallet = item.nickname

        else
          item.wallet = `${item.walletAddress.slice(0, 4)}...${item.walletAddress.slice(-4)}`

        const date = new Date(item.blockTimestamp)
        const month = date.getMonth() + 1
        const day = date.getDate()

        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')

        // ${hours}:${minutes}
        item.time = `${year}-${month}-${day} ${hours}:${minutes}`
        const numStr = (item.bought.usdPrice ?? 0).toString();
        let [integerPart, decimalPart = ''] = numStr.split('.');
        integerPart = integerPart || '0'; // 处理 .0001 情况

        const leadingZeros = (decimalPart.match(/^0+/)?.[0]?.length || 0);
        const remaining = decimalPart.slice(leadingZeros);

        let resNum = '';
        if (leadingZeros >= 2) {
          // 多于等于 2 个前导零：显示 0.0{总数} + 后面最多两位有效数字
          const tail = remaining.slice(0, 2);
          resNum = `${integerPart}.0{${leadingZeros}}${tail}`;
        } else {
          // 0 或 1 个前导零：正常显示两位小数（不足补 0）
          const two = (decimalPart + '00').slice(0, 2);
          resNum = two ? `${integerPart}.${two}` : integerPart;
        }

        item.price = resNum;
        item.amount = Number(item.bought.amount || 0).toFixed(2);
      }

      return state.sniperListData.filter(item => item.bought.tokenType === 'token0')
    },
    getChangeLine(state) {
      const categories = []

      const series = [
        {
          name: 'Total',
          data: [],
        },
        {
          name: 'Swap',
          data: [],
        },
        {
          name: 'Transfer',
          data: [],
        },
        {
          name: 'Airdrop',
          data: [],
        },
      ]

      if (!state.user)
        return { series, categories }

      for (const item of state.user) {
        const date = new Date(item.timestamp)
        // 获取年月日
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份从 0 开始
        const day = date.getDate().toString().padStart(2, '0')

        // 获取时分
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        if (this.time === "week" || this.time === "month" || this.time === "quarter") {
          categories.push(`${month}-${day} ${hours}:${minutes}`)
        } else {
          categories.push(`${hours}:${minutes}`)
        }

        const swap = item.newHoldersByAcquisition.swap
        const transfer = item.newHoldersByAcquisition.transfer
        const airdrop = item.newHoldersByAcquisition.airdrop

        series[0].data.push(swap + transfer + airdrop)
        series[1].data.push(swap)
        series[2].data.push(transfer)
        series[3].data.push(airdrop)
      }

      return { series, categories }
    },

  },
})
