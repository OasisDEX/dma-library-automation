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

/**
 * Fetches and processes Aave V3 protocol data, including eMode information.
 *
 * @param addresses - Contract addresses for the Aave V3 protocol
 * @param provider - Ethereum provider
 * @param debtTokenAddress - Address of the debt token
 * @param collateralTokenAddress - Address of the collateral token
 * @param flashloanTokenAddress - Address of the flashloan token
 * @param proxy - User's proxy address
 * @returns Promise resolving to AaveProtocolData
 *
 * @note This function checks if the user's current eMode category is compatible with the
 * supplied collateral and debt tokens. If they are not compatible (i.e., either token is not
 * enabled for the user's eMode), the function will return as if the user is not in any eMode
 * (userEModeCategory = 0 and eModeCategoryData = undefined). This ensures that the returned
 * data accurately reflects the effective eMode status for the given token pair.
 */
export async function getAaveV3ProtocolData({
  addresses,
  provider,
  debtTokenAddress,
  collateralTokenAddress,
  flashloanTokenAddress,
  proxy,
}: SharedAaveLikeProtocolDataArgs & {
  protocolVersion: AaveVersion.v3
}): Promise<AaveProtocolData> {
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

  let eModeCategoryData

  if (pool && proxy) {
    // Get the user's current eMode category
    const userEModeCategory = await pool.getUserEMode(proxy)

    if (userEModeCategory !== 0) {
      // Fetch eMode category data if the user is in an eMode
      eModeCategoryData = await pool.getEModeCategoryCollateralConfig(userEModeCategory)

      // Check if the collateral and debt tokens are valid for this eMode
      const [collateralReserveData, debtReserveData] = await Promise.all([
        pool.getReserveData(collateralTokenAddress),
        pool.getReserveData(debtTokenAddress),
      ])

      const collateralReserveIndex = collateralReserveData.id.toNumber()
      const debtReserveIndex = debtReserveData.id.toNumber()

      // Fetch the collateral and borrowable bitmaps for the user's eMode
      const [eModeCategoryCollateralBitmap, eModeCategoryBorrowableBitmap] = await Promise.all([
        pool.getEModeCategoryCollateralBitmap(userEModeCategory),
        pool.getEModeCategoryBorrowableBitmap(userEModeCategory),
      ])

      // Check if the collateral and debt tokens are enabled in the user's eMode
      const isCollateralValidInEMode = isReserveEnabledOnBitmap(
        eModeCategoryCollateralBitmap,
        collateralReserveIndex,
      )
      const isDebtValidInEMode = isReserveEnabledOnBitmap(
        eModeCategoryBorrowableBitmap,
        debtReserveIndex,
      )

      // If either the collateral or debt is not valid in this eMode,
      // treat it as if the user is not in an eMode for this specific token pair
      if (!isCollateralValidInEMode || !isDebtValidInEMode) {
        eModeCategoryData = undefined
      }
    }
  }

  return {
    flashloanAssetPriceInEth: flashloanPrice,
    debtTokenPriceInEth: debtPrice,
    collateralTokenPriceInEth: collateralPrice,
    reserveDataForFlashloan: flashloanReserveData,
    reserveDataForCollateral: collateralReserveData,
    userReserveDataForDebtToken: userDebtData,
    userReserveDataForCollateral: userCollateralData,
    eModeCategoryData,
  }
}

/**
 * Checks if a reserve is enabled in a specific bitmap.
 * This function replicates the behavior of the Solidity `isReserveEnabledOnBitmap` function
 * from the EModeConfiguration library, adapted for use with BigNumber.js.
 *
 * @param bitmap - A BigNumber representing the bitmap of enabled reserves
 * @param reserveIndex - The index of the reserve to check
 * @returns true if the reserve is enabled in the bitmap, false otherwise
 * @throws Error if the reserveIndex is out of the valid range
 */
function isReserveEnabledOnBitmap(bitmap: BigNumber, reserveIndex: number): boolean {
  // Aave V3 uses a 128-bit bitmap to represent reserves
  // Valid reserve indices are 0 to 127 (inclusive)
  if (reserveIndex < 0 || reserveIndex >= 128) {
    throw new Error('Invalid reserve index: must be between 0 and 127 inclusive')
  }

  // Create a mask: 2^reserveIndex
  // This is equivalent to 1 << reserveIndex in bitwise operations
  const mask = new BigNumber(2).pow(reserveIndex)

  // Check if the bit is set:
  // We use modulo and comparison instead of bitwise AND
  // If bitmap % (2^(reserveIndex+1)) >= 2^reserveIndex, then the reserveIndex-th bit is set
  return bitmap.mod(mask.times(2)).gte(mask)
}
