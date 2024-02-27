import { getAaveV3WithdrawOperationDefinition } from '@deploy-configurations/operation-definitions/aave/v3/withdraw'
import { Network } from '@deploy-configurations/types/network'
import { MAX_UINT } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { AaveLikeStrategyAddresses } from '@dma-library/operations/aave-like'
import { IOperation } from '@dma-library/types'
import BigNumber from 'bignumber.js'

type WithdrawArgs = {
  /**
   * Send withdrawal amount with no decimal precision applied
   * EG 1.02 USDC should be sent as 1.02e6 which is 1020000
   */
  withdrawAmount: BigNumber
  collateralTokenAddress: string
  collateralIsEth: boolean
  proxy: string
  addresses: AaveLikeStrategyAddresses
  network: Network
}

export type AaveV3WithdrawOperation = (args: WithdrawArgs) => Promise<IOperation>

export const withdraw: AaveV3WithdrawOperation = async args => {
  const { network } = args

  const withdrawCollateralFromAAVE = actions.aave.v3.aaveV3Withdraw(args.network, {
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

  const calls = [withdrawCollateralFromAAVE, collectFeeAfterWithdraw, unwrapEth, returnFunds]

  return {
    calls: calls,
    operationName: getAaveV3WithdrawOperationDefinition(args.network).name,
  }
}
