import { Network } from '@deploy-configurations/types/network'
import { TEN, ZERO } from '@dma-common/constants'
import { MorphoBlueStrategyAddresses } from '@dma-library/operations/morphoblue/addresses'
import { withdraw as withdrawOp } from '@dma-library/operations/morphoblue/auto/withdraw'
import { withdrawToDebt } from '@dma-library/operations/morphoblue/auto/withdraw-to-debt'
import { getTokenSymbol } from '@dma-library/strategies/morphoblue/multiply/open'
import {
  AaveLikeTokens,
  CommonDMADependencies,
  MorphoBluePosition,
  SummerStrategy,
} from '@dma-library/types'
import * as StrategyParams from '@dma-library/types/strategy-params'
import { encodeOperation } from '@dma-library/utils/operation'
import { getSwapDataHelper } from '@dma-library/utils/swap'
import BigNumber from 'bignumber.js'

export type MorphoBlueWithdrawArgs = {
  network: Network
  dpmProxyAddress: string
  targetLTV: BigNumber
  slippage: BigNumber
  shouldWithdrawToDebt: boolean
  position: MorphoBluePosition
  quoteTokenPrecision: number
  collateralTokenPrecision: number
}

export type MorphoBlueWithdrawDependencies = CommonDMADependencies & {
  addresses: MorphoBlueStrategyAddresses
} & StrategyParams.WithGetSwap

export type MorphoBlueWithdrawToLTV = (
  args: MorphoBlueWithdrawArgs,
  dependencies: MorphoBlueWithdrawDependencies,
) => Promise<SummerStrategy<MorphoBluePosition>>

export const withdraw: MorphoBlueWithdrawToLTV = async (args, dependencies) => {
  const [amountToWithdraw, amountToWithdrawInWeiLike] = determineWithdrawalAmount(
    args.position.debtAmount,
    args.position.collateralAmount,
    args.quoteTokenPrecision,
    args.collateralTokenPrecision,
    args.targetLTV,
    args.position.price,
  )

  const collateralTokenSymbol = await getTokenSymbol(
    args.position.marketParams.collateralToken,
    dependencies.provider,
  )
  const debtTokenSymbol = await getTokenSymbol(
    args.position.marketParams.loanToken,
    dependencies.provider,
  )

  const collateralAddress = args.position.marketParams.collateralToken
  const debtAddress = args.position.marketParams.loanToken
  const targetPosition = args.position.withdraw(amountToWithdraw)

  const morphoBlueMarket = {
    loanToken: args.position.marketParams.loanToken,
    collateralToken: args.position.marketParams.collateralToken,
    oracle: args.position.marketParams.oracle,
    irm: args.position.marketParams.irm,
    lltv: args.position.marketParams.lltv.times(TEN.pow(18)),
  }

  if (args.shouldWithdrawToDebt) {
    const FEE = new BigNumber(20)
    const FEE_BASIS = new BigNumber(10000)
    const feeAmount = amountToWithdrawInWeiLike
      .times(FEE.div(FEE_BASIS))
      .integerValue(BigNumber.ROUND_FLOOR)
    const amountToSwap = amountToWithdrawInWeiLike.minus(feeAmount)
    const { swapData, collectFeeFrom } = await getSwapDataHelper<
      typeof dependencies.addresses,
      AaveLikeTokens
    >({
      args: {
        fromToken: { symbol: collateralTokenSymbol as AaveLikeTokens, address: collateralAddress },
        toToken: { symbol: debtTokenSymbol as AaveLikeTokens, address: debtAddress },
        slippage: args.slippage,
        fee: ZERO,
        // Before fees here refers to fees collected by the Swap contract
        // not by CollectFee.sol
        swapAmountBeforeFees: amountToSwap,
      },
      addresses: dependencies.addresses,
      services: {
        getSwapData: dependencies.getSwapData,
      },
    })

    const operation = await withdrawToDebt({
      morphoBlueMarket: morphoBlueMarket,
      withdrawAmount: amountToWithdrawInWeiLike,
      collateralTokenAddress: collateralAddress,
      receiveAtLeast: swapData.minToTokenAmount,
      swapAmount: amountToSwap,
      swapData: `${swapData.exchangeCalldata}`,
      debtTokenAddress: getTokenAddressFromDependencies(dependencies, debtTokenSymbol),
      debtIsEth: debtTokenSymbol === 'WETH' || debtTokenSymbol === 'ETH',
      proxy: args.dpmProxyAddress,
      addresses: dependencies.addresses,
      network: args.network,
    })

    return {
      simulation: {
        swaps: [{ ...swapData, collectFeeFrom, tokenFee: ZERO }],
        errors: [],
        warnings: [],
        notices: [],
        successes: [],
        targetPosition,
        position: targetPosition,
      },
      tx: {
        to: dependencies.operationExecutor,
        data: encodeOperation(operation, dependencies),
        value: '0',
      },
    }
  }

  if (!args.shouldWithdrawToDebt) {
    const operation = await withdrawOp({
      morphoBlueMarket: morphoBlueMarket,
      withdrawAmount: amountToWithdrawInWeiLike,
      collateralTokenAddress: collateralAddress,
      collateralIsEth: collateralTokenSymbol === 'WETH' || collateralTokenSymbol === 'ETH',
      proxy: args.dpmProxyAddress,
      addresses: dependencies.addresses,
      network: args.network,
    })

    return {
      simulation: {
        swaps: [],
        errors: [],
        warnings: [],
        notices: [],
        successes: [],
        targetPosition,
        position: targetPosition,
      },
      tx: {
        to: dependencies.operationExecutor,
        data: encodeOperation(operation, dependencies),
        value: '0',
      },
    }
  }

  throw new Error('Should not be reached')
}

function determineWithdrawalAmount(
  existingDebt: BigNumber,
  existingCollateral: BigNumber,
  debtDecimals: number,
  collateralDecimals: number,
  targetLTV: BigNumber,
  oraclePrice: BigNumber,
) {
  // nextCollateral = existingDebt / (targetLTV * oraclePrice)
  const nextCollateral = existingDebt.div(targetLTV.times(oraclePrice))
  const amountToWithdraw = existingCollateral.minus(nextCollateral)

  if (amountToWithdraw.lte(ZERO)) {
    console.debug('next-collateral', nextCollateral.toString())
    console.debug('amount-to-withdraw', amountToWithdraw.toString())
    throw new Error('Cannot withdraw zero or less')
  }

  return [
    amountToWithdraw,
    amountToWithdraw.multipliedBy(new BigNumber(10).pow(collateralDecimals)),
  ]
}

function getTokenAddressFromDependencies(deps: MorphoBlueWithdrawDependencies, symbol: string) {
  const address = deps.addresses.tokens[symbol]

  if (!address) {
    console.debug('symbol:', symbol)
    console.debug('tokens:', deps.addresses)
    throw new Error('Could not get address from position token symbol')
  }

  return address
}
