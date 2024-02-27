import { getAaveV3WithdrawToDebtOperationDefinition } from '@deploy-configurations/operation-definitions/aave/v3/withdraw-to-debt'
import { Network } from '@deploy-configurations/types/network'
import { MAX_UINT, ZERO } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { AaveLikeStrategyAddresses } from '@dma-library/operations/aave-like'
import { IOperation } from '@dma-library/types'
import BigNumber from 'bignumber.js'

type WithdrawAndSwapArgs = {
  /**
   * Send withdrawal amount with no decimal precision applied
   * EG 1.02 USDC should be sent as 1.02e6 which is 1020000
   */
  withdrawAmount: BigNumber
  receiveAtLeast: BigNumber
  swapData: string
  collateralTokenAddress: string
  debtTokenAddress: string
  debtIsEth: boolean
  proxy: string
  user: string
  addresses: AaveLikeStrategyAddresses
  network: Network
}

export type AaveV3WithdrawAndSwapOperation = (args: WithdrawAndSwapArgs) => Promise<IOperation>

export const withdraw: AaveV3WithdrawAndSwapOperation = async args => {
  const { network } = args

  const withdrawCollateralFromAAVE = actions.aave.v3.aaveV3Withdraw(args.network, {
    asset: args.collateralTokenAddress,
    amount: args.withdrawAmount,
    to: args.proxy,
  })

  const collectFeeAfterWithdraw = actions.common.collectFee(args.network, {
    asset: args.collateralTokenAddress,
  })

  const swapCollateralTokensForDebtTokens = actions.common.swap(network, {
    fromAsset: args.collateralTokenAddress,
    toAsset: args.debtTokenAddress,
    amount: args.withdrawAmount,
    receiveAtLeast: args.receiveAtLeast,
    fee: ZERO.toNumber(),
    withData: args.swapData,
    // Not relevant here
    collectFeeInFromToken: true,
  })

  const unwrapEth = actions.common.unwrapEth(network, {
    amount: new BigNumber(MAX_UINT),
  })

  const returnFunds = actions.common.returnFunds(network, {
    asset: args.debtIsEth ? args.addresses.tokens.ETH : args.debtTokenAddress,
  })

  const calls = [
    withdrawCollateralFromAAVE,
    collectFeeAfterWithdraw,
    swapCollateralTokensForDebtTokens,
    unwrapEth,
    returnFunds,
  ]

  return {
    calls: calls,
    operationName: getAaveV3WithdrawToDebtOperationDefinition(args.network).name,
  }
}
