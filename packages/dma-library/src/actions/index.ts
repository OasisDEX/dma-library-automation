import {
  aaveBorrow,
  aaveDeposit,
  aavePayback,
  aaveV3Borrow,
  aaveV3Deposit,
  aaveV3Payback,
  aaveV3SetEMode,
  aaveV3Withdraw,
  aaveV3WithdrawAuto,
  aaveWithdraw,
} from './aave'
import {
  ajnaDepositBorrow,
  AjnaDepositBorrowAction,
  ajnaPaybackWithdraw,
  AjnaPaybackWithdrawAction,
} from './ajna'
import {
  collectFee,
  erc4626Deposit,
  erc4626Withdraw,
  positionCreated,
  pullToken,
  pullTokenMaxAmount,
  returnFunds,
  returnMultipleTokens,
  sendToken,
  sendTokenAuto,
  setApproval,
  swap,
  takeAFlashLoan,
  takeAFlashLoanBalancer,
  tokenBalance,
  unwrapEth,
  wrapEth,
} from './common'
import {
  morphoBlueBorrow,
  morphoBlueDeposit,
  morphoBluePayback,
  morphoBlueWithdraw,
} from './morphoblue'
import { sparkBorrow, sparkDeposit, sparkPayback, sparkSetEMode, sparkWithdraw } from './spark'

const aave = {
  v2: {
    aaveBorrow,
    aaveDeposit,
    aavePayback,
    aaveWithdraw,
  },
  v3: {
    aaveV3Borrow,
    aaveV3Deposit,
    aaveV3Payback,
    aaveV3Withdraw,
    aaveV3WithdrawAuto,
    aaveV3SetEMode,
  },
}

const common = {
  collectFee,
  pullToken,
  pullTokenMaxAmount,
  sendToken,
  sendTokenAuto,
  setApproval,
  swap,
  returnFunds,
  positionCreated,
  wrapEth,
  unwrapEth,
  takeAFlashLoan,
  takeAFlashLoanBalancer,
  tokenBalance,
  erc4626Deposit,
  erc4626Withdraw,
  returnMultipleTokens,
}

const ajna: {
  ajnaPaybackWithdraw: AjnaPaybackWithdrawAction
  ajnaDepositBorrow: AjnaDepositBorrowAction
} = {
  ajnaPaybackWithdraw,
  ajnaDepositBorrow,
}

const spark = {
  borrow: sparkBorrow,
  deposit: sparkDeposit,
  withdraw: sparkWithdraw,
  payback: sparkPayback,
  setEMode: sparkSetEMode,
}

const morphoblue = {
  borrow: morphoBlueBorrow,
  deposit: morphoBlueDeposit,
  withdraw: morphoBlueWithdraw,
  payback: morphoBluePayback,
}

const actions = { aave, ajna, common, spark, morphoblue }

export { actions }
