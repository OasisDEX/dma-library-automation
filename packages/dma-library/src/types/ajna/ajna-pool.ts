import { Address } from '@oasisdex/dma-deployments/types/address'
import BigNumber from 'bignumber.js'

export interface AjnaPool {
  poolAddress: Address
  quoteToken: Address
  collateralToken: Address

  //@deprecated use lowestUtilizedPrice
  lup: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: BigNumber

  //@deprecated use highestThresholdPrice
  htp: BigNumber
  highestThresholdPrice: BigNumber
  highestThresholdPriceIndex: BigNumber

  highestPriceBucket: BigNumber
  highestPriceBucketIndex: BigNumber

  mostOptimisticMatchingPrice: BigNumber

  poolMinDebtAmount: BigNumber
  poolCollateralization: BigNumber
  poolActualUtilization: BigNumber
  poolTargetUtilization: BigNumber

  // annualized rate as a fraction 0.05 = 5%
  rate: BigNumber
}