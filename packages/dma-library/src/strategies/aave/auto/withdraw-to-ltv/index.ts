import { ONE, ZERO } from "@dma-common/constants";
import { withdraw as withdrawOp } from '@dma-library/operations/aave/auto/withdraw'
import { withdrawToDebt } from '@dma-library/operations/aave/auto/withdraw-to-debt'
import { getAaveTokenAddress } from '@dma-library/strategies/aave/common'
import { AaveLikeTokens } from '@dma-library/types'
import { WithV3Protocol } from '@dma-library/types/aave/protocol'
import * as Strategies from '@dma-library/types/strategies'
import * as StrategyParams from '@dma-library/types/strategy-params'
import { getSwapDataHelper } from '@dma-library/utils/swap'
import { PositionBalance } from '@domain'
import BigNumber from 'bignumber.js'

export type AaveV3WithdrawArgs = {
  oraclePrice: BigNumber
  targetLTV: BigNumber
  slippage: BigNumber
  shouldWithdrawToDebt: boolean
}

export type AaveV3WithdrawDependencies = Omit<
  StrategyParams.WithAaveLikeStrategyDependencies,
  'protocolType'
> &
  StrategyParams.WithGetSwap &
  WithV3Protocol

export type AaveV3WithdrawToLTV = (
  args: AaveV3WithdrawArgs,
  dependencies: Omit<AaveV3WithdrawDependencies, 'protocol'>,
) => Promise<Omit<Strategies.IStrategy, 'simulation'>>

export const withdraw: AaveV3WithdrawToLTV = async (args, dependencies) => {
  const currentPosition = dependencies.currentPosition

  const amountToWithdraw = determineWithdrawalAmount(
    currentPosition.debt,
    currentPosition.collateral,
    args.targetLTV,
    args.oraclePrice,
  )

  const collateralTokenSymbol = currentPosition.collateral.symbol
  const debtTokenSymbol = currentPosition.debt.symbol

  if (args.shouldWithdrawToDebt) {
    const FEE = new BigNumber(20)
    const FEE_BASIS = new BigNumber(10000)
    const feeAmount = amountToWithdraw.times(FEE.div(FEE_BASIS)).integerValue(BigNumber.ROUND_FLOOR);
    const amountToSwap = amountToWithdraw.minus(feeAmount)
    const { swapData } = await getSwapDataHelper<typeof dependencies.addresses, AaveLikeTokens>({
      args: {
        fromToken: { symbol: collateralTokenSymbol as AaveLikeTokens },
        toToken: { symbol: debtTokenSymbol as AaveLikeTokens },
        slippage: args.slippage,
        fee: ZERO,
        // Before fees here refers to fees collected by the Swap contract
        // not by CollectFee.sol
        swapAmountBeforeFees: amountToSwap,
      },
      addresses: dependencies.addresses,
      services: {
        getSwapData: dependencies.getSwapData,
        getTokenAddress: getAaveTokenAddress,
      },
    })

    const operation = await withdrawToDebt({
      withdrawAmount: amountToWithdraw,
      collateralTokenAddress: getTokenAddressFromDependencies(
        dependencies,
        currentPosition.collateral.symbol,
      ),
      receiveAtLeast: swapData.minToTokenAmount,
      swapAmount: amountToSwap,
      swapData: `${swapData.exchangeCalldata}`,
      debtTokenAddress: getTokenAddressFromDependencies(dependencies, debtTokenSymbol),
      debtIsEth: debtTokenSymbol === 'ETH',
      proxy: dependencies.proxy,
      addresses: dependencies.addresses,
      network: dependencies.network,
    })

    return {
      transaction: {
        calls: operation.calls,
        operationName: operation.operationName,
      },
    }
  }

  if (!args.shouldWithdrawToDebt) {
    const operation = await withdrawOp({
      withdrawAmount: amountToWithdraw,
      collateralTokenAddress: getTokenAddressFromDependencies(
        dependencies,
        currentPosition.collateral.symbol,
      ),
      collateralIsEth: collateralTokenSymbol === 'ETH',
      proxy: dependencies.proxy,
      addresses: dependencies.addresses,
      network: dependencies.network,
    })

    return {
      transaction: {
        calls: operation.calls,
        operationName: operation.operationName,
      },
    }
  }

  throw new Error('Should not be reached')
}

function determineWithdrawalAmount(
  existingDebt: PositionBalance,
  existingCollateral: PositionBalance,
  targetLTV: BigNumber,
  oraclePrice: BigNumber,
) {
  const COLLATERAL_PRECISION = existingCollateral.precision
  const DEBT_PRECISION = existingDebt.precision

  // We scale down because BigNumber can handle precision maths
  // with large floating point numbers
  const scaledDownDebt = existingDebt.amount.div(new BigNumber(10).pow(DEBT_PRECISION))

  // nextCollateral = existingDebt / (targetLTV * oraclePrice)
  const scaledDownNextCollateral = scaledDownDebt.div(targetLTV.times(oraclePrice))
  const nextCollateral = scaledDownNextCollateral.multipliedBy(
    new BigNumber(10).pow(COLLATERAL_PRECISION),
  )
  const amountToWithdraw = existingCollateral.amount.minus(nextCollateral)

  if (amountToWithdraw.lte(ZERO)) {
    console.debug('next-collateral', nextCollateral.toString())
    console.debug('amount-to-withdraw', amountToWithdraw.toString())
    throw new Error('Cannot withdraw zero or less')
  }

  return amountToWithdraw
}

function getTokenAddressFromDependencies(
  deps: Omit<AaveV3WithdrawDependencies, 'protocol'>,
  symbol: string,
) {
  const address = deps.addresses.tokens[symbol]

  if (!address) {
    console.debug('symbol:', symbol)
    console.debug('tokens:', deps.addresses.tokens)
    throw new Error('Could not get address from position token symbol')
  }

  return address
}
