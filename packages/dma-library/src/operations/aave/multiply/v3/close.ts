import {
  getAaveV3CloseAndExitOperationDefinition,
  getAaveV3CloseAndRemainOperationDefinition,
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

export type AaveV3CloseOperation = ({
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  position,
  addresses,
  network,
  shouldExit,
}: CloseArgs) => Promise<IOperation>

export const close: AaveV3CloseOperation = async ({
  collateral,
  debt,
  swap,
  flashloan,
  proxy,
  position: {
    collateral: { amount: collateralAmountToBeSwapped },
  },
  addresses,
  network,
  shouldExit,
}) => {
  const setEModeOnCollateral = actions.aave.v3.aaveV3SetEMode(network, {
    categoryId: 0,
  })

  const setFlashLoanApproval = actions.common.setApproval(network, {
    amount: flashloan.token.amount,
    asset: flashloan.token.address,
    delegate: addresses.lendingPool,
    sumAmounts: false,
  })

  const depositFlashLoan = actions.aave.v3.aaveV3Deposit(network, {
    amount: flashloan.token.amount,
    asset: flashloan.token.address,
    sumAmounts: false,
    // setAsCollateral: true
  })

  const withdrawCollateralFromAAVE = actions.aave.v3.aaveV3Withdraw(network, {
    asset: collateral.address,
    amount: collateralAmountToBeSwapped.minus(1),
    to: proxy.address,
  })

  const swapCollateralTokensForDebtTokens = actions.common.swap(network, {
    fromAsset: collateral.address,
    toAsset: debt.address,
    amount: collateralAmountToBeSwapped.minus(1) || ZERO,
    receiveAtLeast: swap.receiveAtLeast,
    fee: swap.fee,
    withData: swap.data,
    collectFeeInFromToken: swap.collectFeeFrom === 'sourceToken',
  })

  const swapActionStorageIndex = 4
  const setDebtTokenApprovalOnLendingPool = actions.common.setApproval(
    network,
    {
      asset: debt.address,
      delegate: addresses.lendingPool,
      amount: ZERO,
      sumAmounts: true,
    },
    [0, 0, swapActionStorageIndex, 0],
  )

  const paybackInAAVE = actions.aave.v3.aaveV3Payback(network, {
    asset: debt.address,
    amount: ZERO,
    paybackAll: true,
  })

  const withdrawFlashLoan = actions.aave.v3.aaveV3WithdrawAuto(
    network,
    {
      asset: flashloan.token.address,
      amount: flashloan.token.amount,
      to: addresses.operationExecutor,
    },
    [1],
  )

  let withdrawCollateral
  if (!shouldExit) {
    withdrawCollateral = actions.aave.v3.aaveV3Withdraw(network, {
      asset: collateral.address,
      amount: new BigNumber(MAX_UINT),
      to: proxy.address,
    })
  }

  const returnDebtFunds = actions.common.returnFunds(network, {
    asset: debt.isEth ? addresses.tokens.ETH : debt.address,
  })

  let returnCollateralFunds
  if (!shouldExit) {
    returnCollateralFunds = actions.common.returnFunds(network, {
      asset: collateral.isEth ? addresses.tokens.ETH : collateral.address,
    })
  }

  const calls = [
    setFlashLoanApproval,
    depositFlashLoan,
    withdrawCollateralFromAAVE,
    swapCollateralTokensForDebtTokens,
    setDebtTokenApprovalOnLendingPool,
    paybackInAAVE,
    withdrawFlashLoan,
    withdrawCollateral,
    returnDebtFunds,
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
    calls: [takeAFlashLoan, setEModeOnCollateral],
    operationName: getAaveV3CloseOperationDefinition(network, shouldExit).name,
  }
}

function getAaveV3CloseOperationDefinition(network: Network, shouldExit: boolean) {
  if (shouldExit) {
    return getAaveV3CloseAndExitOperationDefinition(network)
  }

  if (!shouldExit) {
    return getAaveV3CloseAndRemainOperationDefinition(network)
  }

  throw new Error('Invalid operation definition')
}
