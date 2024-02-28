import { ZERO } from '@dma-common/constants'
import { WithV3Protocol } from '@dma-library/types/aave/protocol'
import * as Strategies from '@dma-library/types/strategies'
import * as StrategyParams from '@dma-library/types/strategy-params'
import BigNumber from 'bignumber.js'

import { withdraw as withdrawOp } from '../../../../operations/aave/borrow/v3/withdraw'

export type AaveV3WithdrawArgs = {
  oraclePrice: BigNumber
  targetLTV: BigNumber
  shouldWithdrawToDebt: boolean
}

export type AaveV3WithdrawDependencies = Omit<
  StrategyParams.WithAaveLikeStrategyDependencies,
  'protocolType'
> &
  WithV3Protocol

export type AaveV3Withdraw = (
  args: AaveV3WithdrawArgs,
  dependencies: Omit<AaveV3WithdrawDependencies, 'protocol'>,
) => Promise<Strategies.IStrategy>

export const withdraw: AaveV3Withdraw = async (args, dependencies) => {
  const currentPosition = dependencies.currentPosition

  const amountToWithdraw = determineWithdrawalAmount(
    currentPosition.debt.amount,
    currentPosition.collateral.amount,
    args.targetLTV,
    args.oraclePrice,
  )

  const collateralTokenSymbol = currentPosition.collateral.symbol
  const debtTokenSymbol = currentPosition.debt.symbol

  if (args.shouldWithdrawToDebt) {
    const operation = await withdrawOp({
      withdrawAmount: amountToWithdraw,
      collateralTokenAddress: getTokenAddressFromDependencies(
        dependencies,
        currentPosition.collateral.symbol,
      ),
      collateralIsEth: collateralTokenSymbol === 'ETH',
      debtTokenAddress: getTokenAddressFromDependencies(dependencies, debtTokenSymbol),
      debtIsEth: debtTokenSymbol === 'ETH',
      proxy: dependencies.proxy,
      addresses: dependencies.addresses,
      network: dependencies.network,
    })

    return {
      transaction: {
        calls: operation.calls,
        operationName: operation.operationName
      }
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
      // debtTokenAddress: getTokenAddressFromDependencies(dependencies, debtTokenSymbol),
      // debtIsEth: debtTokenSymbol === 'ETH',
      proxy: dependencies.proxy,
      addresses: dependencies.addresses,
      network: dependencies.network,
    })

    return {
      transaction: {
        calls: operation.calls,
        operationName: operation.operationName
      }
    }
  }

  throw new Error("Should not be reached")
  // If withdrawing to debt calculate swap
}

function determineWithdrawalAmount(
  existingDebt: BigNumber,
  existingCollateral: BigNumber,
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
