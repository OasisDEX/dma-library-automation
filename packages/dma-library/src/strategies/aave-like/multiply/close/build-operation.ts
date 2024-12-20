import { getForkedNetwork } from '@deploy-configurations/utils/network'
import { FEE_BASE, ONE, TYPICAL_PRECISION } from '@dma-common/constants'
import { amountFromWei, amountToWei } from '@dma-common/utils/common'
import { resolveAaveLikeMultiplyOperations } from '@dma-library/operations/aave-like/resolve-aavelike-operations'
import { SAFETY_MARGIN } from '@dma-library/strategies/aave-like/multiply/close/constants'
import { FlashloanProvider, IOperation, SwapData } from '@dma-library/types'
import { resolveFlashloanProvider } from '@dma-library/utils/flashloan/resolve-provider'
import { feeResolver } from '@dma-library/utils/swap'
import * as Domain from '@domain'
import { FLASHLOAN_SAFETY_MARGIN } from '@domain/constants'
import BigNumber from 'bignumber.js'

import { AaveLikeCloseDependencies, AaveLikeExpandedCloseArgs, CloseFlashloanArgs } from './types'
import { PriceResult } from '@dma-library/protocols/aave-like/types'

export async function buildOperation(
  swapData: SwapData & {
    collectFeeFrom: 'sourceToken' | 'targetToken'
    preSwapFee: BigNumber
  },
  args: AaveLikeExpandedCloseArgs,
  dependencies: AaveLikeCloseDependencies,
): Promise<{ operation: IOperation; flashloan: CloseFlashloanArgs }> {
  const {
    collateralToken: { address: collateralTokenAddress },
    debtToken: { address: debtTokenAddress },
  } = args

  const fee = feeResolver(args.collateralToken.symbol, args.debtToken.symbol)
  const collateralAmountToBeSwapped = args.shouldCloseToCollateral
    ? swapData.fromTokenAmount.plus(swapData.preSwapFee)
    : dependencies.currentPosition.collateral.amount
  const collectFeeFrom = swapData.collectFeeFrom

  const positionType = dependencies.positionType
  const aaveLikeMultiplyOperations = resolveAaveLikeMultiplyOperations(
    dependencies.protocolType,
    positionType,
  )

  const flashloanParams: CloseFlashloanArgs = await buildCloseFlashloan(
    {
      ...args,
      debtToken: {
        ...args.debtToken,
        address: debtTokenAddress,
      },
      collateralToken: {
        ...args.collateralToken,
        address: collateralTokenAddress,
      },
    },
    dependencies,
  )

  const closeArgs = {
    collateral: {
      address: collateralTokenAddress,
      isEth: args.collateralToken.symbol === 'ETH',
    },
    debt: {
      address: debtTokenAddress,
      isEth: args.debtToken.symbol === 'ETH',
    },
    swap: {
      fee: fee.toNumber(),
      data: swapData.exchangeCalldata,
      amount: collateralAmountToBeSwapped,
      collectFeeFrom,
      receiveAtLeast: swapData.minToTokenAmount,
    },
    flashloan: {
      ...flashloanParams,
      amount: flashloanParams.token.amount,
    },
    position: {
      type: dependencies.positionType,
      collateral: { amount: collateralAmountToBeSwapped },
    },
    proxy: {
      address: dependencies.proxy,
      isDPMProxy: dependencies.isDPMProxy,
      owner: dependencies.user,
    },
    addresses: dependencies.addresses,
    network: dependencies.network,
    /**
     * This is a temporary solution in the AUTO variant of dma-library
     * It uses the shouldCloseToCollateral flag to determine if the position
     * should be closed to collateral AND REMAIN on the protocol.
     *
     */
    shouldExit: !args.shouldCloseToCollateral,
  }

  return {
    operation: await aaveLikeMultiplyOperations.close(closeArgs),
    flashloan: flashloanParams,
  }
}

export async function buildCloseFlashloan(
  args: AaveLikeExpandedCloseArgs & {
    debtToken: { address: string }
    collateralToken: { address: string }
  },
  dependencies: AaveLikeCloseDependencies,
): Promise<CloseFlashloanArgs> {
  const flashloanProvider = resolveFlashloanProvider(
    await getForkedNetwork(dependencies.provider),
    dependencies.protocolType,
  )
  const isSpark = dependencies.protocolType === 'Spark'
  const isAaveV2 = dependencies.protocolType === 'AAVE'
  const isAaveV3 = dependencies.protocolType === 'AAVE_V3'

  if (flashloanProvider === FlashloanProvider.Balancer && isSpark) {
    return handleFlashloanForSpark(args, dependencies)
  }

  if (isAaveV2) {
    return handleFlashloanForAaveV2(args, dependencies, flashloanProvider)
  }

  if (isAaveV3) {
    return handleFlashloanForAaveV3(args, dependencies, flashloanProvider)
  }

  throw new Error('Unsupported protocol type')
}

function handleFlashloanForSpark(
  args: AaveLikeExpandedCloseArgs,
  dependencies: AaveLikeCloseDependencies,
) {
  console.log('Handling Spark flashloan - close - using Balancer')
  const currentDebtAmount = dependencies.currentPosition.debt.amount

  const amountToFlashloan = currentDebtAmount.times(ONE.plus(SAFETY_MARGIN))

  const amount = Domain.debtToCollateralSwapFlashloan(amountToFlashloan)

  return {
    token: {
      amount,
      symbol: args.debtToken.symbol,
      precision: args.debtToken.precision ?? TYPICAL_PRECISION,
      address: args.debtToken.address,
    },
    provider: FlashloanProvider.Balancer,
  }
}

function handleFlashloanForAaveV2(
  args: AaveLikeExpandedCloseArgs,
  dependencies: AaveLikeCloseDependencies,
  flashloanProvider: FlashloanProvider,
) {
  console.log('Handling AaveV2 flashloan - close')
  assertNotNull(args.protocolData.flashloanAssetPriceInEth)
  assertNotNull(args.protocolData.collateralTokenPriceInEth)

  // Note: Prices from oracle are in 8 decimals but were incorrectly scaled down by 18 decimals
  // Scaling back up so as not to confuse future developers
  // packages/dma-library/src/protocols/aave-like/utils.ts
  const flashloanTokenPriceInEthTerms = args.protocolData.flashloanAssetPriceInEth.times(
    new BigNumber(10).pow(18),
  )
  const collateralTokenPriceInEthTerms = args.protocolData.collateralTokenPriceInEth.times(
    new BigNumber(10).pow(18),
  )

  // Ratios are unaffected by scaling so long as both prices are scaled by the same amount
  const oraclePriceRatio = collateralTokenPriceInEthTerms.div(flashloanTokenPriceInEthTerms)

  // The collateral in the position that we need to replace with the flashloan
  const positionCollateralAmount = dependencies.currentPosition.collateral.amount

  // Adjust for different token decimal precisions
  const decimalAdjustment = new BigNumber(10).pow(
    args.flashloan.token.precision - dependencies.currentPosition.collateral.precision,
  )

  const collateralValueInFlashloanTokens = positionCollateralAmount
    .times(oraclePriceRatio)
    .times(decimalAdjustment)
    .integerValue(BigNumber.ROUND_DOWN)

  // Get max LTV for the flashloan token when used as collateral
  const maxLoanToValueForFL = new BigNumber(
    args.protocolData.reserveDataForFlashloan.ltv.toString(),
  ).div(FEE_BASE)
  const safetyMarginAdjustment = maxLoanToValueForFL.times(ONE.minus(FLASHLOAN_SAFETY_MARGIN))

  // Calculate final flashloan amount with safety margin
  const amountToFlashloan = collateralValueInFlashloanTokens
    .div(safetyMarginAdjustment)
    .integerValue(BigNumber.ROUND_DOWN)
  console.log('Amount to flashloan:', amountToFlashloan.toString())

  return {
    token: {
      amount: amountToFlashloan,
      ...args.flashloan.token,
    },
    provider: flashloanProvider,
  }
}

function handleFlashloanForAaveV3(
  args: AaveLikeExpandedCloseArgs,
  dependencies: AaveLikeCloseDependencies,
  flashloanProvider: FlashloanProvider,
) {
  console.log('Handling AaveV3 flashloan - close')
  assertNotNull(args.protocolData.flashloanAssetPriceInEth)
  assertNotNull(args.protocolData.collateralTokenPriceInEth)

  // Note: Prices from oracle are in 8 decimals but were incorrectly scaled down by 18 decimals
  // Scaling back up so as not to confuse future developers
  // packages/dma-library/src/protocols/aave-like/utils.ts

  // Also: AaveV3 uses USD terms so are incorrectly named
  const flashloanTokenPriceInUsdTerms = args.protocolData.flashloanAssetPriceInEth.times(
    new BigNumber(10).pow(18),
  )
  const collateralTokenPriceInUsdTerms = args.protocolData.collateralTokenPriceInEth.times(
    new BigNumber(10).pow(18),
  )

  // Ratios are unaffected by scaling so long as both prices are scaled by the same amount
  const oraclePriceRatio = collateralTokenPriceInUsdTerms.div(flashloanTokenPriceInUsdTerms)
  console.log('DEBUG >> Oracle price ratio:', oraclePriceRatio.toString())
  // The collateral in the position that we need to replace with the flashloan
  const positionCollateralAmount = dependencies.currentPosition.collateral.amount
  console.log('DEBUG >> Position collateral amount:', positionCollateralAmount.toString())
  // Adjust for different token decimal precisions
  const decimalAdjustment = new BigNumber(10).pow(
    args.flashloan.token.precision - dependencies.currentPosition.collateral.precision,
  )
  console.log('DEBUG >> Decimal adjustment:', decimalAdjustment.toString())
  const collateralValueInFlashloanTokens = positionCollateralAmount
    .times(oraclePriceRatio)
    .times(decimalAdjustment)
    .integerValue(BigNumber.ROUND_DOWN)

  console.log(
    'DEBUG >> Collateral value in flashloan tokens:',
    collateralValueInFlashloanTokens.toString(),
  )

  // Get max LTV for the flashloan token when used as collateral
  const maxLoanToValueForFL = new BigNumber(
    args.protocolData.reserveDataForFlashloan.ltv.toString(),
  ).div(FEE_BASE)
  const safetyMarginAdjustment = maxLoanToValueForFL.times(ONE.minus(FLASHLOAN_SAFETY_MARGIN))

  // Calculate final flashloan amount with safety margin
  const amountToFlashloan = collateralValueInFlashloanTokens
    .div(safetyMarginAdjustment)
    .integerValue(BigNumber.ROUND_DOWN)
  console.log('Amount to flashloan:', amountToFlashloan.toString())

  return {
    token: {
      amount: amountToFlashloan,
      ...args.flashloan.token,
    },
    provider: flashloanProvider,
  }
}

function assertNotNull<T>(value: T | undefined | null): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined')
  }
}
