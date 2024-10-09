import {
  AaveLikeProtocolData,
  SharedAaveLikeProtocolDataArgs,
} from '@dma-library/protocols/aave-like/types'
import {
  fetchAssetPrice,
  fetchReserveData,
  fetchUserReserveData,
  getAaveLikeSystemContracts,
} from '@dma-library/protocols/aave-like/utils'
import * as AaveCommon from '@dma-library/strategies/aave/common'
import { AaveVersion } from '@dma-library/types/aave'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

export type AaveV2ProtocolDataArgs = SharedAaveLikeProtocolDataArgs & {
  protocolVersion: AaveVersion.v2
}
export type AaveV3ProtocolDataArgs = SharedAaveLikeProtocolDataArgs & {
  protocolVersion: AaveVersion.v3
}
export type AaveProtocolDataArgs = AaveV2ProtocolDataArgs | AaveV3ProtocolDataArgs

export type AaveProtocolData = AaveLikeProtocolData

export type GetAaveProtocolData = (args: AaveProtocolDataArgs) => Promise<AaveProtocolData>

export const getAaveProtocolData: GetAaveProtocolData = async args => {
  if (
    AaveCommon.isV2<
      AaveProtocolDataArgs,
      SharedAaveLikeProtocolDataArgs & { protocolVersion: AaveVersion.v2 }
    >(args)
  ) {
    return getAaveV2ProtocolData(args)
  }
  if (AaveCommon.isV3(args)) {
    return getAaveV3ProtocolData(args)
  }

  throw new Error('Invalid Aave version')
}

export async function getAaveV2ProtocolData({
  addresses,
  provider,
  debtTokenAddress,
  collateralTokenAddress,
  flashloanTokenAddress,
  proxy,
}: AaveV2ProtocolDataArgs) {
  const { oracle, poolDataProvider } = await getAaveLikeSystemContracts(addresses, provider, 'AAVE')

  const [
    flashloanPrice,
    debtPrice,
    collateralPrice,
    flashloanReserveData,
    collateralReserveData,
    userDebtData,
    userCollateralData,
  ] = await Promise.all([
    fetchAssetPrice(oracle, flashloanTokenAddress),
    fetchAssetPrice(oracle, debtTokenAddress),
    fetchAssetPrice(oracle, collateralTokenAddress),
    fetchReserveData(poolDataProvider, flashloanTokenAddress),
    fetchReserveData(poolDataProvider, collateralTokenAddress),
    proxy ? fetchUserReserveData(poolDataProvider, debtTokenAddress, proxy) : undefined,
    proxy ? fetchUserReserveData(poolDataProvider, collateralTokenAddress, proxy) : undefined,
  ])

  return {
    flashloanAssetPriceInEth: flashloanPrice,
    debtTokenPriceInEth: debtPrice,
    collateralTokenPriceInEth: collateralPrice,
    reserveDataForFlashloan: flashloanReserveData,
    reserveDataForCollateral: collateralReserveData,
    reserveEModeCategory: undefined,
    userReserveDataForDebtToken: userDebtData,
    userReserveDataForCollateral: userCollateralData,
    eModeCategoryData: undefined,
  }
}

export async function getAaveV3ProtocolData({
  addresses,
  provider,
  debtTokenAddress,
  collateralTokenAddress,
  flashloanTokenAddress,
  proxy,
}: SharedAaveLikeProtocolDataArgs & { protocolVersion: AaveVersion.v3 }) {
  const { oracle, poolDataProvider, pool } = await getAaveLikeSystemContracts(
    addresses,
    provider,
    'AAVE_V3',
  )

  const [
    flashloanPrice,
    debtPrice,
    collateralPrice,
    flashloanReserveData,
    collateralReserveData,
    userDebtData,
    userCollateralData,
  ] = await Promise.all([
    fetchAssetPrice(oracle, flashloanTokenAddress),
    fetchAssetPrice(oracle, debtTokenAddress),
    fetchAssetPrice(oracle, collateralTokenAddress),
    fetchReserveData(poolDataProvider, flashloanTokenAddress),
    fetchReserveData(poolDataProvider, collateralTokenAddress),
    proxy ? fetchUserReserveData(poolDataProvider, debtTokenAddress, proxy) : undefined,
    proxy ? fetchUserReserveData(poolDataProvider, collateralTokenAddress, proxy) : undefined,
  ])

  // New approach to handle eModes
  let reserveEModeCategory = 0
  let eModeCategoryData

  if (pool) {
    // Iterate through possible eMode categories (1-255)
    for (let categoryId = 1; categoryId < 256; categoryId++) {
      const collateralConfig = await pool.getEModeCategoryCollateralConfig(categoryId)

      // Check if this is an active eMode
      if (collateralConfig.liquidationThreshold.gt(0)) {
        const collateralBitmap = await pool.getEModeCategoryCollateralBitmap(categoryId)
        const borrowableBitmap = await pool.getEModeCategoryBorrowableBitmap(categoryId)

        const isCollateralInEMode = await isReserveEnabledInEMode(
          pool,
          collateralBitmap,
          collateralTokenAddress,
        )
        const isDebtInEMode = await isReserveEnabledInEMode(
          pool,
          borrowableBitmap,
          debtTokenAddress,
        )

        if (isCollateralInEMode && isDebtInEMode) {
          reserveEModeCategory = categoryId
          eModeCategoryData = collateralConfig
          break
        }
      }
    }
  }

  return {
    flashloanAssetPriceInEth: flashloanPrice,
    debtTokenPriceInEth: debtPrice,
    collateralTokenPriceInEth: collateralPrice,
    reserveDataForFlashloan: flashloanReserveData,
    reserveDataForCollateral: collateralReserveData,
    reserveEModeCategory,
    userReserveDataForDebtToken: userDebtData,
    userReserveDataForCollateral: userCollateralData,
    eModeCategoryData,
  }
}

async function isReserveEnabledInEMode(
  pool: ethers.Contract,
  bitmap: BigNumber,
  tokenAddress: string,
): Promise<boolean> {
  const reserveData = await pool.getReserveData(tokenAddress)
  const id = reserveData.id.toNumber()
  const mask = new BigNumber(1).shiftedBy(id)
  return new BigNumber(bitmap.toString(16), 16).bitAnd(mask).gt(0)
}
