export interface TokenInfoType {
  address: string
  symbol: string
  logo: string
  banner?: string
  description: string | null
  price?: string
  total_supply_formatted: string
  fully_diluted_valuation: string
  supplyFormatted?: string
  validated: number
  possible_spam: boolean
  verified_contract: boolean

}

export interface TransactionTotalType {
  '5m': number
  '1h': number
  '6h': number
  '24h': number
}

export interface TransactionDataType {
  totalBuyVolume: TransactionTotalType
  totalSellVolume: TransactionTotalType
  totalBuyers: TransactionTotalType
  totalSellers: TransactionTotalType
  totalBuys: TransactionTotalType
  totalSells: TransactionTotalType
  uniqueWallets?: TransactionTotalType

}
