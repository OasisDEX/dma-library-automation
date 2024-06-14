import { getMorphoBlueWithdrawOperationDefinition } from '@deploy-configurations/operation-definitions'
import { Network } from '@deploy-configurations/types/network'
import { MAX_UINT } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { IOperation } from '@dma-library/types'
import {
  WithMorphoBlueMarket,
  WithMorphpBlueStrategyAddresses,
} from '@dma-library/types/operations'
import BigNumber from 'bignumber.js'

type WithdrawArgs = WithMorphoBlueMarket &
  WithMorphpBlueStrategyAddresses & {
    withdrawAmount: BigNumber
    collateralTokenAddress: string
    collateralIsEth: boolean
    proxy: string
    network: Network
  }

export type MorphoBlueWithdrawOperation = (args: WithdrawArgs) => Promise<IOperation>

export const withdraw: MorphoBlueWithdrawOperation = async args => {
  const { network, morphoBlueMarket, withdrawAmount } = args

  const withdrawCollateralFromMorphoBlue = actions.morphoblue.withdraw(args.network, {
    morphoBlueMarket: morphoBlueMarket,
    amount: withdrawAmount,
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

  const unwrapEth = actions.common.unwrapEth(network, {
    amount: new BigNumber(MAX_UINT),
  })

  const returnFunds = actions.common.returnFunds(network, {
    asset: args.collateralIsEth ? args.addresses.tokens.ETH : args.collateralTokenAddress,
  })

  const calls = [withdrawCollateralFromMorphoBlue, collectFeeAfterWithdraw, unwrapEth, returnFunds]

  return {
    calls: calls,
    operationName: getMorphoBlueWithdrawOperationDefinition(args.network).name,
  }
}
