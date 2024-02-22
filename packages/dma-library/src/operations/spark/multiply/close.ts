import {
  getSparkCloseAndExitOperationDefinition,
  getSparkCloseAndRemainOperationDefinition,
} from '@deploy-configurations/operation-definitions'
import { Network } from '@deploy-configurations/types/network'
import { MAX_UINT, ZERO } from '@dma-common/constants'
import { actions } from '@dma-library/actions'
import {
  IOperation,
  WithCollateral,
  WithDebt,
  WithFlashloan,
  WithNetwork,
  WithPositionAndLockedCollateral,
  WithProxy,
  WithSwap,
} from '@dma-library/types'
import { WithAaveLikeStrategyAddresses } from '@dma-library/types/operations'
import BigNumber from 'bignumber.js'

export type CloseArgs = WithCollateral &
  WithDebt &
  WithSwap &
  WithFlashloan &
  WithProxy &
  WithPositionAndLockedCollateral &
  WithAaveLikeStrategyAddresses &
  WithNetwork & {
    shouldExit: boolean
  }

export type SparkCloseOperation = ({
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
  shouldExit,
}: CloseArgs) => Promise<IOperation>

export const close: SparkCloseOperation = async ({
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
  shouldExit,
}) => {
  const setDebtTokenApprovalOnPool = actions.common.setApproval(network, {
    asset: debt.address,
    delegate: addresses.lendingPool,
    amount: flashloan.token.amount,
    sumAmounts: false,
  })

  const paybackDebt = actions.spark.payback(network, {
    asset: debt.address,
    amount: ZERO,
    paybackAll: true,
  })

  const setEModeOnCollateral = actions.spark.setEMode(network, {
    categoryId: 0,
  })

  const withdrawCollateral = actions.spark.withdraw(network, {
    asset: collateral.address,
    amount: shouldExit ? swap.amount.minus(1) : swap.amount,
    to: proxy.address,
  })

  const swapCollateralTokensForDebtTokens = actions.common.swap(network, {
    fromAsset: collateral.address,
    toAsset: debt.address,
    amount: shouldExit ? swap.amount.minus(1) : swap.amount,
    receiveAtLeast: swap.receiveAtLeast,
    fee: swap.fee,
    withData: swap.data,
    collectFeeInFromToken: swap.collectFeeFrom === 'sourceToken',
  })
  const flashloanActionStorageIndex = 1
  const sendDebtToOpExecutor = actions.common.sendTokenAuto(
    network,
    {
      asset: debt.address,
      to: addresses.operationExecutor,
      amount: new BigNumber(0),
    },
    [0, 0, flashloanActionStorageIndex],
  )

  const returnDebtFunds = actions.common.returnFunds(network, {
    asset: debt.isEth ? addresses.tokens.ETH : debt.address,
  })

  let returnCollateralFunds
  let withdrawRemainingCollateral

  if (shouldExit) {
    withdrawRemainingCollateral = actions.spark.withdraw(network, {
      asset: collateral.address,
      amount: new BigNumber(MAX_UINT),
      to: proxy.address,
    })
    returnCollateralFunds = actions.common.returnFunds(network, {
      asset: collateral.isEth ? addresses.tokens.ETH : collateral.address,
    })
  }

  const calls = [
    setDebtTokenApprovalOnPool,
    paybackDebt,
    setEModeOnCollateral,
    withdrawCollateral,
    swapCollateralTokensForDebtTokens,
    sendDebtToOpExecutor,
    returnDebtFunds,
    withdrawRemainingCollateral,
    returnCollateralFunds,
  ]
  // Filter out undefined calls
  const filteredCalls = calls.filter(call => {
    return call !== undefined
  })

  const takeAFlashLoan = actions.common.takeAFlashLoanBalancer(network, {
    isDPMProxy: proxy.isDPMProxy,
    asset: flashloan.token.address,
    flashloanAmount: flashloan.token.amount,
    isProxyFlashloan: true,
    provider: flashloan.provider,
    calls: filteredCalls,
  })

  return {
    calls: [takeAFlashLoan],
    operationName: getSparkCloseOperationDefinition(network, shouldExit).name,
  }
}
function getSparkCloseOperationDefinition(network: Network, shouldExit: boolean) {
  if (shouldExit) {
    return getSparkCloseAndExitOperationDefinition(network)
  }

  if (!shouldExit) {
    return getSparkCloseAndRemainOperationDefinition(network)
  }

  throw new Error('Invalid operation definition')
}
