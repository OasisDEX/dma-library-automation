import { getMorphoBlueWithdrawToDebtOperationDefinition } from '@deploy-configurations/operation-definitions/morphoblue/auto/withdraw-to-debt'
import { Network } from '@deploy-configurations/types/network'
import { MAX_UINT, ZERO } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { IOperation } from '@dma-library/types'
import {
  WithMorphoBlueMarket,
  WithMorphpBlueStrategyAddresses,
} from '@dma-library/types/operations'
import BigNumber from 'bignumber.js'

type WithdrawToDebtArgs = WithMorphoBlueMarket &
  WithMorphpBlueStrategyAddresses & {
    withdrawAmount: BigNumber
    swapAmount: BigNumber
    receiveAtLeast: BigNumber
    swapData: string
    collateralTokenAddress: string
    debtTokenAddress: string
    debtIsEth: boolean
    proxy: string
    network: Network
  }

export type MorphoBlueWithdrawToDebtOperation = (args: WithdrawToDebtArgs) => Promise<IOperation>

export const withdrawToDebt: MorphoBlueWithdrawToDebtOperation = async args => {
  const { network, morphoBlueMarket } = args

  const withdrawCollateralFromMorphoBlue = actions.morphoblue.withdraw(args.network, {
    morphoBlueMarket: morphoBlueMarket,
    amount: args.withdrawAmount,
    to: args.proxy,
  })

  const collectFeeAfterWithdraw = actions.common.collectFee(
    args.network,
    {
      asset:
        args.collateralTokenAddress.toLowerCase() == args.addresses.tokens.ETH.toLowerCase()
          ? args.addresses.tokens.WETH
          : args.collateralTokenAddress,
    },
    [1],
  )

  const swapCollateralTokensForDebtTokens = actions.common.swap(network, {
    fromAsset:
      args.collateralTokenAddress.toLowerCase() == args.addresses.tokens.ETH.toLowerCase()
        ? args.addresses.tokens.WETH
        : args.collateralTokenAddress,
    toAsset: args.debtIsEth ? args.addresses.tokens.WETH : args.debtTokenAddress,
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
    asset: args.debtIsEth ? `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` : args.debtTokenAddress,
  })

  const calls = [
    withdrawCollateralFromMorphoBlue,
    collectFeeAfterWithdraw,
    swapCollateralTokensForDebtTokens,
    unwrapEth,
    returnFunds,
  ]

  return {
    calls: calls,
    operationName: getMorphoBlueWithdrawToDebtOperationDefinition(args.network).name,
  }
}
