import { getSparkWithdrawOperationDefinition } from '@deploy-configurations/operation-definitions/aave/v3/withdraw'
import { Network } from '@deploy-configurations/types/network'
import { MAX_UINT } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { AaveLikeStrategyAddresses } from '@dma-library/operations/aave-like'
import { IOperation } from '@dma-library/types'
import BigNumber from 'bignumber.js'

type WithdrawArgs = {
  withdrawAmount: BigNumber
  collateralTokenAddress: string
  collateralIsEth: boolean
  proxy: string
  addresses: AaveLikeStrategyAddresses
  network: Network
}

export type SparkWithdrawOperation = (args: WithdrawArgs) => Promise<IOperation>

export const withdraw: SparkWithdrawOperation = async args => {
  const { network } = args

  const withdrawCollateralFromSpark = actions.spark.withdraw(args.network, {
    asset: args.collateralTokenAddress,
    amount: args.withdrawAmount,
    to: args.proxy,
  })

  const collectFeeAfterWithdraw = actions.common.collectFee(args.network, {
    asset: args.collateralTokenAddress,
  })

  const unwrapEth = actions.common.unwrapEth(network, {
    amount: new BigNumber(MAX_UINT),
  })

  const returnFunds = actions.common.returnFunds(network, {
    asset: args.collateralIsEth ? args.addresses.tokens.ETH : args.collateralTokenAddress,
  })

  const calls = [withdrawCollateralFromSpark, collectFeeAfterWithdraw, unwrapEth, returnFunds]

  return {
    calls: calls,
    operationName: getSparkWithdrawOperationDefinition(args.network).name,
  }
}
