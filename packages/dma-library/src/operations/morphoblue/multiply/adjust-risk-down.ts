import { getMorphoBlueAdjustDownOperationDefinition } from '@deploy-configurations/operation-definitions'
import { FEE_BASE, MAX_UINT, ZERO } from "@dma-common/constants";
import { actions } from '@dma-library/actions'
import { BALANCER_FEE } from '@dma-library/config/flashloan-fees'
import { IOperation } from '@dma-library/types'
import {
  WithCollateralAndWithdrawal,
  WithDebt,
  WithFlashloan,
  WithMorphoBlueMarket,
  WithMorphpBlueStrategyAddresses,
  WithNetwork,
  WithProxy,
  WithSwap,
} from '@dma-library/types/operations'

export type MorphoBlueAdjustRiskDownArgs = WithMorphoBlueMarket &
  WithCollateralAndWithdrawal &
  WithDebt &
  WithSwap &
  WithFlashloan &
  WithProxy &
  WithMorphpBlueStrategyAddresses &
  WithNetwork

export type MorphoBlueAdjustDownOperation = ({
  morphoBlueMarket,
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}: MorphoBlueAdjustRiskDownArgs) => Promise<IOperation>

export const adjustRiskDown: MorphoBlueAdjustDownOperation = async ({
  morphoBlueMarket,
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  addresses,
  network,
}) => {
  if (collateral.address !== morphoBlueMarket.collateralToken) {
    throw new Error('Collateral token must be the same as MorphoBlue market collateral token')
  }
  if (debt.address !== morphoBlueMarket.loanToken) {
    throw new Error('Debt token must be the same as MorphoBlue market debt token')
  }

  // Simulation is based on worst case swap IE Max slippage
  // Payback Debt using FL which should be equivalent to minSwapToAmount
  // Withdraw Collateral according to simulation
  // Swap Collateral to Debt (should get more than minSwapToAmount)
  // Payback Debt using FL (should be equivalent to/gt minSwapToAmount)
  // Withdraw remaining dust debt
  // Resulting risk will be same as simulation given that dust amount is transferred to user
  const setDebtTokenApprovalOnPool = actions.common.setApproval(network, {
    asset: debt.address,
    delegate: addresses.morphoblue,
    amount: flashloan.token.amount,
    sumAmounts: false,
  })

  const paybackDebt = actions.morphoblue.payback(network, {
    morphoBlueMarket: morphoBlueMarket,
    // Payback the max amount we can get from the swap
    amount: swap.receiveAtLeast,
  })

  const withdrawCollateral = actions.morphoblue.withdraw(network, {
    morphoBlueMarket: morphoBlueMarket,
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

  const returnCollateralFunds = actions.common.returnFunds(network, {
    asset: collateral.isEth ? addresses.tokens.ETH : collateral.address,
  })

  const flashloanCalls = [
    setDebtTokenApprovalOnPool,
    paybackDebt,
    withdrawCollateral,
    swapCollateralTokensForDebtTokens,
    sendDebtTokenToOpExecutor
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
    operationName: getMorphoBlueAdjustDownOperationDefinition(network).name,
  }
}
