import {
  getMorphoBlueCloseAndRemainOperationDefinition,
  getMorphoBlueCloseOperationDefinition as getMorphoBlueCloseAndExitOperationDefinition,
} from '@deploy-configurations/operation-definitions'
import { Network } from '@deploy-configurations/types/network'
import { actions } from '@dma-library/actions'
import {
  IOperation,
  WithCollateral,
  WithDebt,
  WithFlashloan,
  WithNetwork,
  WithPaybackDebt,
  WithPositionAndLockedCollateral,
  WithProxy,
  WithSwap,
  WithWithdrawCollateral,
} from '@dma-library/types'
import {
  WithMorphoBlueMarket,
  WithMorphpBlueStrategyAddresses,
} from '@dma-library/types/operations'
import BigNumber from 'bignumber.js'

export type MorphoBlueCloseArgs = WithMorphoBlueMarket &
  WithCollateral &
  WithDebt &
  WithSwap &
  WithFlashloan &
  WithProxy &
  WithPositionAndLockedCollateral &
  WithMorphpBlueStrategyAddresses &
  WithNetwork &
  WithPaybackDebt &
  WithWithdrawCollateral & {
    shouldExit: boolean
  }

export type MorphoBlueCloseOperation = ({
  morphoBlueMarket,
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}: MorphoBlueCloseArgs) => Promise<IOperation>

export const close: MorphoBlueCloseOperation = async ({
  morphoBlueMarket,
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
  amountDebtToPaybackInBaseUnit,
  amountCollateralToWithdrawInBaseUnit,
  shouldExit,
}) => {
  if (collateral.address !== morphoBlueMarket.collateralToken) {
    throw new Error('Collateral token must be the same as MorphoBlue market collateral token')
  }
  if (debt.address !== morphoBlueMarket.loanToken) {
    throw new Error('Debt token must be the same as MorphoBlue market debt token')
  }

  const setDebtTokenApprovalOnPool = actions.common.setApproval(network, {
    asset: debt.address,
    delegate: addresses.morphoblue,
    amount: flashloan.token.amount,
    sumAmounts: false,
  })

  const paybackDebt = actions.morphoblue.payback(network, {
    morphoBlueMarket: morphoBlueMarket,
    amount: amountDebtToPaybackInBaseUnit,
    onBehalf: proxy.address,
    paybackAll: true,
  })

  const withdrawCollateral = actions.morphoblue.withdraw(network, {
    morphoBlueMarket: morphoBlueMarket,
    amount: amountCollateralToWithdrawInBaseUnit,
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
    asset: debt.isEth ? `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` : debt.address,
  })

  const calls = [
    setDebtTokenApprovalOnPool,
    paybackDebt,
    withdrawCollateral,
    swapCollateralTokensForDebtTokens,
    sendDebtToOpExecutor,
    returnDebtFunds,
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
    operationName: getMorphoBlueCloseOperationDefinition(network, shouldExit).name,
  }
}

function getMorphoBlueCloseOperationDefinition(network: Network, shouldExit: boolean) {
  if (shouldExit) {
    return getMorphoBlueCloseAndExitOperationDefinition(network)
  }

  if (!shouldExit) {
    return getMorphoBlueCloseAndRemainOperationDefinition(network)
  }

  throw new Error('Invalid operation definition')
}
