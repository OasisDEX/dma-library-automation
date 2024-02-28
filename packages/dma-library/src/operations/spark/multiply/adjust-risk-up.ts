import { getSparkAdjustUpOperationDefinition } from '@deploy-configurations/operation-definitions'
import { ZERO } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import { IOperation } from '@dma-library/types'
import {
  WithAaveLikeStrategyAddresses,
  WithCollateral,
  WithDebtAndBorrow,
  WithFlashloan,
  WithNetwork,
  WithOptionalDeposit,
  WithProxy,
  WithSwap,
} from '@dma-library/types/operations'

export type AdjustRiskUpArgs = WithCollateral &
  WithDebtAndBorrow &
  WithOptionalDeposit &
  WithSwap &
  WithFlashloan &
  WithProxy &
  WithAaveLikeStrategyAddresses &
  WithNetwork

export type SparkAdjustUpOperation = ({
  collateral,
  debt,
  deposit,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}: AdjustRiskUpArgs) => Promise<IOperation>

export const adjustRiskUp: SparkAdjustUpOperation = async ({
  collateral,
  debt,
  deposit,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}) => {
  const depositAmount = deposit?.amount || ZERO

  const pullCollateralTokensToProxy = actions.common.pullToken(network, {
    asset: collateral.address,
    amount: depositAmount,
    from: proxy.owner,
  })

  // Stored in first index of inner storage array (based on who)
  const swapActionStorageIndex = 2
  const swapDebtTokensForCollateralTokens = actions.common.swap(network, {
    fromAsset: debt.address,
    toAsset: collateral.address,
    amount: swap.amount,
    receiveAtLeast: swap.receiveAtLeast,
    fee: swap.fee,
    withData: swap.data,
    collectFeeInFromToken: swap.collectFeeFrom === 'sourceToken',
  })

  const setCollateralTokenApprovalOnLendingPool = actions.common.setApproval(
    network,
    {
      asset: collateral.address,
      delegate: addresses.lendingPool,
      amount: depositAmount,
      sumAmounts: true,
    },
    [0, 0, swapActionStorageIndex, 0],
  )

  const depositCollateral = actions.spark.deposit(
    network,
    {
      asset: collateral.address,
      amount: depositAmount,
      sumAmounts: true,
      setAsCollateral: true,
    },
    [0, swapActionStorageIndex, 0, 0],
  )

  const borrowDebtToRepayFL = actions.spark.borrow(network, {
    asset: debt.address,
    amount: debt.borrow.amount,
    // Note: Isn't respected by the Action despite what the factory says
    to: addresses.operationExecutor,
  })

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

  const flashloanCalls = [
    pullCollateralTokensToProxy,
    swapDebtTokensForCollateralTokens,
    setCollateralTokenApprovalOnLendingPool,
    depositCollateral,
    borrowDebtToRepayFL,
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
    calls: [takeAFlashLoan],
    operationName: getSparkAdjustUpOperationDefinition(network).name,
  }
}
