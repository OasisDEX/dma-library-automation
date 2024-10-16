import { getSparkAdjustDownOperationDefinition } from '@deploy-configurations/operation-definitions'
import { ZERO } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { IOperation } from '@dma-library/types'
import {
  WithAaveLikeStrategyAddresses,
  WithCollateralAndWithdrawal,
  WithDebt,
  WithFlashloan,
  WithNetwork,
  WithProxy,
  WithSwap,
} from '@dma-library/types/operations'

export type AdjustRiskDownArgs = WithCollateralAndWithdrawal &
  WithDebt &
  WithSwap &
  WithFlashloan &
  WithProxy &
  WithAaveLikeStrategyAddresses &
  WithNetwork

export type SparkAdjustDownOperation = ({
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}: AdjustRiskDownArgs) => Promise<IOperation>

export const adjustRiskDown: SparkAdjustDownOperation = async ({
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}) => {
  // Simulation is based on worst case swap IE Max slippage
  // Payback Debt using FL which should be equivalent to minSwapToAmount
  // Withdraw Collateral according to simulation
  // Swap Collateral to Debt (should get more than minSwapToAmount)
  // Payback Debt using FL (should be equivalent to/gt minSwapToAmount)
  // Withdraw remaining dust debt
  // Resulting risk will be same as simulation given that dust amount is transferred to user
  const setDebtTokenApprovalOnPool = actions.common.setApproval(network, {
    asset: debt.address,
    delegate: addresses.lendingPool,
    amount: flashloan.token.amount,
    sumAmounts: false,
  })

  const paybackDebt = actions.spark.payback(network, {
    asset: debt.address,
    // Payback the max amount we can get from the swap
    amount: swap.receiveAtLeast,
    paybackAll: false,
  })

  const withdrawCollateral = actions.spark.withdraw(network, {
    asset: collateral.address,
    amount: collateral.withdrawal.amount,
    to: proxy.address,
  })

  const swapCollateralTokensForDebtTokens = actions.common.swap(network, {
    fromAsset: collateral.address,
    toAsset: debt.address,
    amount: swap.amount,
    receiveAtLeast: swap.receiveAtLeast,
    fee: swap.fee,
    withData: swap.data,
    collectFeeInFromToken: swap.collectFeeFrom === 'sourceToken',
  })

  // Param Map [0, 0, 1 (amount)] is used to indicate that the flash-loaned amount
  // should be sent to the operation executor
  const flashloanActionStorageIndex = 1
  const sendDebtTokenToOpExecutor = actions.common.sendTokenAuto(
    network,
    {
      asset: debt.address,
      to: addresses.operationExecutor,
      amount: ZERO, // Taken from mapping
    },
    [0, 0, flashloanActionStorageIndex],
  )

  const returnDebtFunds = actions.common.returnFunds(network, {
    asset: debt.isEth ? addresses.tokens.ETH : debt.address,
  })

  // Not strictly necessary but we include this action for safety reasons
  const returnCollateralFunds = actions.common.returnFunds(network, {
    asset: collateral.isEth ? addresses.tokens.ETH : collateral.address,
  })

  const flashloanCalls = [
    setDebtTokenApprovalOnPool,
    paybackDebt,
    withdrawCollateral,
    swapCollateralTokensForDebtTokens,
    sendDebtTokenToOpExecutor,
  ]

  const takeAFlashLoan = actions.common.takeAFlashLoanBalancer(network, {
    isDPMProxy: proxy.isDPMProxy,
    asset: flashloan.token.address,
    flashloanAmount: flashloan.token.amount,
    isProxyFlashloan: true,
    provider: flashloan.provider,
    calls: flashloanCalls,
  })

  return {
    calls: [takeAFlashLoan, returnDebtFunds, returnCollateralFunds],
    operationName: getSparkAdjustDownOperationDefinition(network).name,
  }
}
